"use client";

import React from "react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { motion, AnimatePresence } from "framer-motion";
import { QuickAddTask } from "../_dashboardcomponents/QuickAddTask";
import { AddFeedback } from "./AddFeedback";
import { MessageSquare, CheckCircle, X } from "lucide-react";

export const GlobalQuickAdd = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, quickAddMode, setQuickAddMode } =
    useTaskQ();

  const openTool = (mode: "task" | "feedback") => {
    setQuickAddMode(mode);
    setIsQuickAddOpen(true);
  };

  const closeTool = () => {
    setIsQuickAddOpen(false);
    setQuickAddMode(null);
  };

  return (
    <div className="fixed bottom-14 right-12 z-[1000] flex flex-col items-end gap-3">
      {/* 1. THE ACTION BOX */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <motion.div
            drag
            dragMomentum={false}
            // Keep your specific offset logic
            initial={{ opacity: 0, y: 55, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 55, x: 40, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-2 w-[475px] bg-white rounded-sm shadow-2xl border border-slate-200 relative"
          >
            <button
              onClick={closeTool}
              className="absolute -top-3 -right-3 z-10 h-6 w-6 rounded-full bg-[#1e2f25] text-white flex items-center justify-center shadow-md hover:bg-[#30493b] transition-colors"
            >
              <X size={12} />
            </button>

            <div className="px-3 py-2 ">
              {quickAddMode === "task" ? (
                <QuickAddTask />
              ) : (
                <AddFeedback onClose={closeTool} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PERSISTENT OPTIONS */}
      {/* We hide these when the Action Box is open to keep the UI clean */}
      {!isQuickAddOpen && (
        <div className="flex flex-row items-end">
          <MenuButton
            icon={<MessageSquare size={12} />}
            label="Feedback"
            onClick={() => openTool("feedback")}
          />
          <MenuButton
            icon={<CheckCircle size={12} />}
            label="New Task"
            onClick={() => openTool("task")}
          />
        </div>
      )}
    </div>
  );
};

const MenuButton = ({ icon, label, onClick }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 10, y: -10 }}
    animate={{ opacity: 1, x: -50, y: 5 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex  items-center gap-1 group cursor-pointer"
    onClick={onClick}
  >
    <span className="text-[10px] font-bold bg-white px-2 py-1 rounded border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
      {label}
    </span>

    <div className="h-8 w-8 rounded-full bg-[#30493b] border-2 border-white flex items-center justify-center text-white shadow-xl hover:bg-[#1e2f25] transition-all">
      {icon}
    </div>
  </motion.div>
);
