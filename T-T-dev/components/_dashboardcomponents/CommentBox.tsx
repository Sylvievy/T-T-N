"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Comments } from "@/services/dashboard/DashboardParams";
import { CommentList } from "../_taskQcomponents/task/CommentList";
import { motion } from "framer-motion";
import { CommentInput } from "../_taskQcomponents/task/CommentInput";

interface CommentBoxProps {
  taskId: string;
  taskTitle: string;
  comments: Comments[];
  onClose: () => void;
  onSendMessage: (text: string) => Promise<boolean>;
}

const CommentBox = ({
  taskId,
  taskTitle,
  comments,
  onClose,
  onSendMessage,
}: CommentBoxProps) => {
  const [myId, setMyId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("taskQ_user_id");
    setMyId(storedId);
  }, []);

  console.log("Task ID:", taskId);
  console.log("Filtered Comments:", comments);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const handleSend = async (messageText: string) => {
    // Accept the string from CommentInput
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const success = await onSendMessage(messageText.trim());
      if (success) {
        // Success logic
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      // This helps prevent clicks on the input from triggering a drag
      dragListener={true}
      className="flex flex-col h-[400px] w-[350px] bg-[#fdfdfd] rounded-xl shadow-2xl border border-slate-300 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b bg-[#a3bfaa] cursor-grab active:cursor-grabbing">
        <h3 className="text-sm font-bold truncate pr-4 text-slate-000">
          {taskTitle}
        </h3>
        <X
          className="w-4 h-4 cursor-pointer shrink-0 text-slate-700 hover:text-red-500"
          onClick={onClose}
        />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <CommentList comments={comments} myId={myId} formatTime={formatTime} />
      </div>

      <div className="p-2 border-t bg-white">
        <CommentInput onSend={handleSend} />
      </div>
    </motion.div>
  );
};

export default CommentBox;
