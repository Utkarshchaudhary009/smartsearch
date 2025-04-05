import { supabase } from "../supabase";
export async function saveChatHistory(
  clerkId: string,
  query: string,
  response: string,
  chatSlug: string
) {
  try {
    console.log("clerkId:", clerkId);
    console.log("query:", query);
    console.log("response:", response);
    console.log("chatSlug:", chatSlug);

    const { data, error } = await supabase
      .from("chat_history")
      .insert({
        clerk_id: clerkId,
        query,
        response,
        chat_slug: chatSlug,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error saving chat history:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    return null;
  }
}

export async function getChatHistory(clerkId: string, chatSlug: string) {
  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("clerk_id", clerkId)
      .eq("chat_slug", chatSlug)
      .order("created_at", { ascending: true });

    console.log("chathistory:", data);
    if (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    return [];
  }
}

export async function getChatSlug(clerkId: string) {
  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("chat_slug")
      .eq("clerk_id", clerkId)
      .order("created_at", { ascending: false });

    console.log("chatslug:", data);
    if (error) {
      console.error("Error fetching chat slug:", error);
      return null;
    }
    // return onry set
    const chatSlugs = data.map((item) => item.chat_slug);
    console.log("chatSlugs:", chatSlugs);
    return new Set(chatSlugs);
  } catch (error) {
    console.error("Error in getChatSlug:", error);
    return null;
  }
}
