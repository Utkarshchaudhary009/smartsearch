import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function ChatSlugGenerator(userMessage: string) {
  const response = await fetch(`/api/chatsluggen`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userMessage }),
  });
  const data = await response.json();
  if (response.ok) {
    console.log("Chat slug:", data.response);
    return data.response;
  } else {
    console.error("Error:", data.error);
    return null;
  }
}
