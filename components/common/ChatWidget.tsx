// components/ChatWidget.tsx
import { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="m-auto">
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-12 right-20 z-50 rounded-full bg-secondary-500 p-3 text-lg text-white shadow-lg"
      >
        🤖 AI Assistant
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 max-h-[70vh] w-80 rounded-xl border border-foreground bg-background shadow-lg">
          <div className="flex items-center justify-between rounded-t-xl border-b border-foreground bg-background  p-2">
            <span className="font-semibold text-secondary-500">
              {"Renzo's AI Assistant"}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-red-600"
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
