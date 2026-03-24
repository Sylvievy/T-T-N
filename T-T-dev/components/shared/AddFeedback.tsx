"use client";

import React, { useState } from "react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { usePathname } from "next/navigation"; // To detect the page
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ViewFeedback } from "./ViewFeedback";

export const AddFeedback = ({ onClose }: { onClose: () => void }) => {
  const { submitFeedback } = useTaskQ();
  const pathname = usePathname();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map pathnames to readable page names
  const getPageName = (path: string) => {
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("taskQ")) return "taskQ";
    if (path.includes("notes")) return "Notes";

    return "General App";
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    const currentPage = getPageName(pathname);

    try {
      const success = await submitFeedback(description, currentPage);
      if (success) {
        toast.success("Feedback sent successfully!");
        setDescription("");
        onClose();
      } else {
        toast.error("Failed to send feedback");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 border-b pb-2">
        <div className="flex gap-2 items-center">
          <MessageSquare className="w-4 h-4 text-[#1e2f25]" />
          <h3 className="font-bold text-sm text-slate-800">Submit Feedback</h3>
        </div>
        <ViewFeedback />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold ] text-slate-400">
          Current Page:{" "}
          <span className="text-[#1e2f25]">{getPageName(pathname)}</span>
        </label>
        <Textarea
          placeholder="What can we improve? Is the UI slow? Found a bug?"
          className="resize-none min-h-[120px] text-xs focus-visible:ring-[#1e2f25]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-8 text-xs bg-[#1e2f25] hover:bg-[#30493b] gap-2"
        >
          {isSubmitting ? "Sending..." : "Send Feedback"}
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
