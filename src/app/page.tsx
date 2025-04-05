import { auth } from "@clerk/nextjs/server";
import ChatInterface from "@/components/chat/ChatInterface";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Smart Search Chat",
  description: "AI-powered chat interface with smart search capabilities",
  url: "/",
});

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col h-full">
      <ChatInterface userId={userId} />
    </div>
  );
}
