"use client";
import { useRef, useState, useEffect } from "react";
import {
  Send,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video,
  MapPin,
} from "lucide-react";

interface CommentInputProps {
  // We change these to focus on the action rather than syncing every keystroke
  onSend: (message: string) => Promise<void>;
  placeholder?: string;
}

export const CommentInput = ({
  onSend,
  placeholder = "Add a comment...",
}: CommentInputProps) => {
  // 1. LOCAL STATE: Typing is now lightning fast because it only re-renders this component
  const [text, setText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachmentOptions = [
    { label: "Document", icon: FileText, accept: ".pdf,.doc,.docx" },
    { label: "Photo", icon: ImageIcon, accept: "image/*" },
    { label: "Video", icon: Video, accept: "video/*" },
  ];

  const handleInternalSend = async () => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSend(text.trim());
      setText(""); // Clear local input after success
    } finally {
      setIsSending(false);
    }
  };

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="px-1 h-8 py-2 flex items-center gap-1 shrink-0 bg-white w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleInternalSend()}
        placeholder={placeholder}
        disabled={isSending}
        className="flex-1 rounded-md border border-[#a3bfaa] px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#30493b] disabled:bg-slate-50"
      />

      <button
        onClick={handleInternalSend}
        className="text-white bg-[#30493b] hover:bg-[#1e2f25] p-2 rounded-md transition-colors disabled:opacity-50"
        disabled={!text.trim() || isSending}
      >
        <Send className={cn("w-3.5 h-3.5", isSending && "animate-pulse")} />
      </button>

      <input type="file" ref={fileInputRef} className="hidden" />

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            "p-2 rounded-md transition-colors",
            showMenu
              ? "bg-slate-100 text-[#30493b]"
              : "text-slate-400 hover:text-slate-600",
          )}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] py-2 w-40 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 origin-bottom-right">
            {attachmentOptions.map((opt) => (
              <button
                key={opt.label}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition-colors"
                onClick={() => {
                  fileInputRef.current?.setAttribute("accept", opt.accept);
                  fileInputRef.current?.click();
                  setShowMenu(false);
                }}
              >
                <opt.icon className="w-4 h-4 text-slate-700" />
                <span className="text-xs text-slate-700">{opt.label}</span>
              </button>
            ))}
            <button
              className="w-full flex items-center gap-2 px-4 py-1 hover:bg-slate-50 transition-colors "
              onClick={() => setShowMenu(false)}
            >
              <MapPin className="w-4 h-4 text-slate-700" />
              <span className="text-xs text-slate-700">Location</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
