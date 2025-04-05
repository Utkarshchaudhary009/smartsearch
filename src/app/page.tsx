import { auth } from "@clerk/nextjs/server";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col h-full">
      <ChatInterface userId={userId} />
    </div>
  );
}
