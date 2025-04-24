import { useState } from "react";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-4">
      <div className="h-64 space-y-2 overflow-y-auto rounded bg-background p-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`max-w-[75%] whitespace-pre-wrap break-words rounded-lg p-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-right text-white"
                  : "bg-gray-300 text-left text-black"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="italic text-gray-500">Typing...</div>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border bg-background p-2"
          placeholder="Ask me anything..."
        />
        <button
          onClick={sendMessage}
          className="rounded bg-secondary-600 px-4 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
