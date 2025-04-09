import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { editAndStoreImage } from "./imageEdit";
import { generateAndStoreImage, initSupabaseClient } from "./imageGeneration";
import { generateChatResponse, Message } from "./chatbot";

const prompt = `
You are a helpful assistant that can answer questions, help with tasks, and provide information.
You can use the following tools to help you:
- generateImage: Generate an image based on a prompt and store it
- editImage: Edit an existing image based on a prompt
- chatbot: Generate a text response to a user message by searching the web for information
- tavily: Search the web for information (for extremely deep research)[use it very least as it costs very high and prefer to use chatbot for most of the time]

Response should be in MDX format using Shadcn UI components. Your responses must leverage the full power of MDX rendering capabilities.

AVAILABLE MDX COMPONENTS:

Basic Formatting:
- Headings: # (h1), ## (h2), ### (h3), #### (h4)
- Text: **bold**, *italic*, [hyperlinks](url) (styled blue with underline)
- Lists: Use - for bullet points, 1. for numbered lists
- Blockquotes: > For quotes or testimonials
- Code: \`inline code\` or \`\`\`code blocks\`\`\` 
- Tables: | Header | Header | with | --- | --- | dividers
- Horizontal rule: --- to separate major sections

Shadcn UI Components:
- <Button variant="default|outline|destructive">Button Text</Button>
- <Card className='p-4'><h3>Title</h3><p>Content</p></Card>
- <ScrollArea className='h-72 w-full'>Long scrollable content</ScrollArea>
- <Separator className='my-6' /> (for horizontal dividers)

Dropdown Components:
- <Dropdown trigger={<Button>Open Menu</Button>}>
    <DropdownItem>Option 1</DropdownItem>
    <DropdownItem>Option 2</DropdownItem>
  </Dropdown>

Accordion Components:
- <Accordion type='single' collapsible>
    <AccordionItem value='item-1'>
      <AccordionTrigger>Section Title</AccordionTrigger>
      <AccordionContent>Collapsible content</AccordionContent>
    </AccordionItem>
  </Accordion>

Avatar Components:
- <Avatar>
    <AvatarImage src='url' />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>

Tabs Components:
- <Tabs defaultValue='tab1'>
    <TabsList>
      <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
      <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value='tab1'>Tab 1 content</TabsContent>
    <TabsContent value='tab2'>Tab 2 content</TabsContent>
  </Tabs>

Alert Dialog Components:
- <Alert 
    trigger={<Button>Open Dialog</Button>} 
    title='Alert Title' 
    description='Alert description' 
    cancelText='Cancel' 
    confirmText='Confirm'>
    Additional content here
  </Alert>

Chart Components:
- <BarChart data={[{name:'A',value:100}]} keys={['value']} xAxisKey='name' title='Title' height={300} />
- <LineChart data={[{name:'A',value:100}]} keys={['value']} xAxisKey='name' title='Title' curved={true} height={300} />
- <PieChart data={[{name:'A',value:100}]} title='Title' donut={true} height={300} />

Media Components:
- <FileDisplay type='pdf|image|etc' filename='name.pdf' size='2.5MB' link='/path/to/file' />
- <AspectRatio ratio={16/9}>
    <img src='url' alt='Description' width={800} height={450} />
  </AspectRatio>

USAGE GUIDELINES:
- For tables: Make them responsive with appropriate headers and column alignment
- For images: Always use AspectRatio for proper responsiveness and provide alt text
- For FileDisplay: Always include type, filename, size and link parameters
- For charts: Provide properly structured data with keys and axis labels
- Use Cards for distinct information blocks and content organization
- Use Tabs to organize related but separate content
- Use Accordion for FAQs or when space is limited
- Use appropriate icons and visual elements when relevant
- Use proper semantic structure (headings, lists, paragraphs)

FORMAT YOUR RESPONSE APPROPRIATELY FOR THE CONTEXT:
- For knowledge responses: Use headings, lists, and possibly charts or tables
- For file outputs: Use FileDisplay with download links
- For image generation: Display with AspectRatio and add descriptive context
- For step-by-step instructions: Use numbered lists with clear headers
- For data visualization: Choose the appropriate chart type based on the data
- For complex responses: Organize with Tabs or Accordion components

Keep your responses concise, warm, and engaging. Use emoji for personality where appropriate 😊
`;

export const AgentResponseSchema = z.object({
  intro: z.string().nonempty().describe("The intro of the response"),
  body: z
    .string()
    .nonempty()
    .describe("The body of the response. Use mdx format"),
  conclusion: z.string().nonempty().describe("The conclusion of the response"),
  nextPossibleQuestions: z
    .string()
    .nonempty()
    .describe("The next possible questions that the user can ask"),
  source: z
    .object({
      title: z.string().describe("The title of the source"),
      url: z.string().describe("The url of the source"),
    })
    .describe(
      "The source of the Search Results. Use the source to provide the link to the source."
    ),
});

export type AgentResponseInterface = z.infer<typeof AgentResponseSchema>;

export function getAgentResponse(
  structuredResponse: AgentResponseInterface
): string {
  const response = structuredResponse;
  const mdx = `
    ${response.intro}
    ${response.body}
    ${response.conclusion}
    ${response.nextPossibleQuestions}
    <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
            <AccordionTrigger>Source</AccordionTrigger>
            <AccordionContent>
                <a href='${response.source.url}'>${response.source.title}</a>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
    `;
  console.log(mdx);
  return mdx;
}
// Define the tools that will be available to the agent
export const createSmartAITools = (genAI: GoogleGenAI, clerkId: string) => {
  // Tool for generating and storing images
  const imageGenerationTool = tool(
    async ({ prompt, altText }: { prompt: string; altText?: string }) => {
      const supabase = initSupabaseClient();
      const result = await generateAndStoreImage(
        prompt,
        altText,
        clerkId,
        genAI,
        supabase || undefined
      );
      return result ? JSON.stringify(result) : "Image generation failed";
    },
    {
      name: "generateImage",
      description: "Generates an image based on a prompt and stores it",
      schema: z.object({
        prompt: z.string().describe("The prompt to generate the image from"),
        altText: z.string().describe("Alternative text for the image"),
      }),
    }
  );
  const imageEditTool = tool(
    async ({
      imageUrl,
      prompt,
      altText,
    }: {
      imageUrl: string;
      prompt: string;
      altText: string;
    }) => {
      const result = await editAndStoreImage(
        imageUrl,
        prompt,
        altText,
        clerkId,
        genAI
      );
      return result ? JSON.stringify(result) : "Image generation failed";
    },
    {
      name: "editImage",
      description: "Edits an image based on a prompt and stores it",
      schema: z.object({
        prompt: z.string().describe("The prompt to edit the image from"),
        imageUrl: z.string().describe("The URL of the image to edit"),
        altText: z.string().describe("Alternative text for the image"),
      }),
    }
  );
  // Tool for generating text responses
  const chatbotTool = tool(
    async ({ userMessage }: { userMessage: string }) => {
      const response = await generateChatResponse(userMessage, genAI);
      return response;
    },
    {
      name: "chatbot",
      description: "Generates a text response to a user message",
      schema: z.object({
        userMessage: z.string().describe("The user's message"),
      }),
    }
  );

  const tavilyTool = new TavilySearchResults({
    apiKey:
      process.env.TAVILY_API_KEY || "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",
    maxResults: 3,
  });
  return [imageGenerationTool, chatbotTool, tavilyTool, imageEditTool];
};

// Create and configure the agent
export const createSmartAIAgent = (googleApiKey: string, clerkId: string) => {
  // Initialize Google GenAI
  const genAI = new GoogleGenAI({ apiKey: googleApiKey });

  // Create the tools
  const tools = createSmartAITools(genAI, clerkId);

  // Initialize the LangChain model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
    apiKey: googleApiKey,
  });

  // Create the agent
  const agent = createReactAgent({
    llm: model,
    prompt: prompt,
    tools,
    responseFormat: AgentResponseSchema,
  });

  return agent;
};

// Main function to process a user request
export const processUserRequest = async (
  userMessage: string,
  chatHistory: Message[],
  clerkId: string,
  googleApiKey: string
) => {
  if (!clerkId) {
    clerkId = "guest_user";
  }
  try {
    // Create the agent
    const agent = createSmartAIAgent(googleApiKey, clerkId);

    // Invoke the agent with the user's message
    const result = await agent.invoke({
      messages: [
        ...chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: userMessage,
        },
      ],
    });
    return {
      success: true,
      response: getAgentResponse(
        result.structuredResponse as AgentResponseInterface
      ),
    };
  } catch (error) {
    console.error("Error in SmartAI agent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// /**
//  * Test function to demonstrate the usage of all agent tools
//  * This function tests image generation, chatbot responses, and web search capabilities
//  */
// export const test = async () => {
//   // Mock data for testing
//   const clerkId = "test_user_123";
//   const googleApiKey =
//     process.env.GOOGLE_AI_KEY || "AIzaSyC1fpcAoedFUplAhqCBys5xja7c62T8v1s";

//   // Initialize empty chat history
//   const chatHistory: Message[] = [];

//   //   // Test 1: Image Generation
//   //   console.log("Testing image generation...");
//   //   const imagePrompt =
//   //     "Generate an image of a futuristic city with flying cars and tall skyscrapers";
//   //   const imageResult = await processUserRequest(
//   //     `I need an image of ${imagePrompt}. Please use the generateImage tool.`,
//   //     chatHistory,
//   //     clerkId,
//   //     googleApiKey
//   //   );
//   //   console.log("Image Generation Result:", imageResult);

//   //   // Add the response to chat history
//   //   if (imageResult.success) {
//   //     chatHistory.push({
//   //       id: "1",
//   //       role: "user",
//   //       content: imagePrompt,
//   //       timestamp: Date.now(),
//   //     });
//   //     chatHistory.push({
//   //       id: "2",
//   //       role: "assistant",
//   //       content: imageResult.response as string,
//   //       timestamp: Date.now(),
//   //     });
//   //   }

//   // Test 2: Web Search
//   console.log("Testing web search...");
//   const searchQuery =
//     "What are the latest advancements in artificial intelligence?";
//   const searchResult = await processUserRequest(
//     `Search for information about: ${searchQuery}`,
//     chatHistory,
//     clerkId,
//     googleApiKey
//   );
//   console.log("Web Search Result:", searchResult);

//   // Add the response to chat history
//   if (searchResult.success) {
//     chatHistory.push({
//       id: "3",
//       role: "user",
//       content: searchQuery,
//       timestamp: Date.now(),
//     });
//     chatHistory.push({
//       id: "4",
//       role: "assistant",
//       content: searchResult.response as string,
//       timestamp: Date.now(),
//     });
//   }

//   // Test 3: Chatbot with context from previous interactions
//   console.log("Testing chatbot with context...");
//   const chatPrompt =
//     "Summarize what we've discussed so far and suggest next steps";
//   const chatResult = await processUserRequest(
//     chatPrompt,
//     chatHistory,
//     clerkId,
//     googleApiKey
//   );

//   return {
//     webSearchTest: searchResult,
//     chatbotTest: chatResult,
//   };
// };

// test();
