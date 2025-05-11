import ChatWidget from "@/components/chat/chat-widget";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Optional: Add some content behind the chat widget or a welcome message */}
      {/* <h1 className="text-4xl font-bold mb-8 text-center">Welcome to ChattySam</h1> */}
      <ChatWidget />
    </main>
  );
}
