import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
      <SignUp appearance={{
        elements: {
          formButtonPrimary: "bg-black hover:bg-gray-900",
          footerActionLink: "text-black hover:text-gray-900"
        }
      }} />
  );
}