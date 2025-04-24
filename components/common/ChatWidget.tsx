// components/ChatWidget.tsx
import { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 max-h-[70vh] w-80 rounded-xl border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b bg-blue-50 p-2">
            <span className="font-semibold text-blue-800">Chat with me</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✖
            </button>
          </div>
          <Chatbot />
        </div>
      )}
    </div>
  );
}
