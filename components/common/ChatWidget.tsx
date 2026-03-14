// components/ChatWidget.tsx
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="m-auto">
      <div className="group fixed bottom-4 right-4 z-50 flex h-12 w-12 flex-row items-center justify-end overflow-hidden rounded-full border border-secondary-500/30 bg-secondary-500/15 shadow-sm backdrop-blur-sm transition-[width] duration-300 ease-out hover:w-[11rem] hover:border-secondary-500/50 hover:bg-secondary-500/25 hover:shadow-md md:bottom-6 md:right-6">
        <span className="whitespace-nowrap pl-3 pr-4 text-sm font-medium text-secondary-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-secondary-400">
          AI Assistant
        </span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-secondary-600 transition-colors hover:bg-secondary-500/20 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-background dark:text-secondary-400"
          aria-label="Open AI Assistant"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 max-h-[70vh] w-80 rounded-xl border border-foreground/20 bg-background shadow-lg md:right-6">
          <div className="flex items-center justify-between rounded-t-xl border-b border-foreground bg-background  p-2">
            <span className="font-semibold text-secondary-500">
              {"Renzo AI"}
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
