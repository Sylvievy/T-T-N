"use client";

import React, { useState } from "react";

import { useTaskQ } from "@/services/taskQ/TaskQContext";

import { motion, AnimatePresence } from "framer-motion";

import { QuickAddTask } from "../_dashboardcomponents/QuickAddTask";

import { AddFeedback } from "./AddFeedback"; // The component we discussed

import { Button } from "@/components/ui/button";

import { Plus, X, MessageSquare, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export const GlobalQuickAdd = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, quickAddMode, setQuickAddMode } =
    useTaskQ();

  const [showMenu, setShowMenu] = useState(false);

  const handleMainBtnClick = () => {
    if (isQuickAddOpen) {
      setIsQuickAddOpen(false);

      setQuickAddMode(null);
    } else {
      setShowMenu(!showMenu);
    }
  };

  const openTool = (mode: "task" | "feedback") => {
    setQuickAddMode(mode);

    setIsQuickAddOpen(true);

    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-14 right-12 z-[1000] flex flex-col items-end gap-3">
      {/* 1. THE ACTION BOX (Task Input or Feedback Form) */}

      <AnimatePresence>
        {isQuickAddOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 104, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 104, x: 40, scale: 1 }}
            className="mb-2 w-[475px] bg-white rounded-sm shadow-2xl border border-slate-200 relative"
          >
            {/* Floating close button — always top-right of the box */}
            <button
              onClick={() => {
                setIsQuickAddOpen(false);
                setQuickAddMode(null);
              }}
              className="absolute -top-3 -right-3 z-10 h-6 w-6 rounded-full bg-[#1e2f25] text-white flex items-center justify-center shadow-md hover:bg-[#30493b] transition-colors"
            >
              <X size={12} />
            </button>

            <div className="px-3 py-2">
              {quickAddMode === "task" ? (
                <QuickAddTask />
              ) : (
                <AddFeedback
                  onClose={() => {
                    setIsQuickAddOpen(false);
                    setQuickAddMode(null);
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE MINI MENU (Pop-up options) */}

      <AnimatePresence>
        {showMenu && !isQuickAddOpen && (
          <motion.div className="flex flex-col gap-2 items-end">
            <MenuButton
              icon={<MessageSquare size={14} />}
              label="Feedback"
              onClick={() => openTool("feedback")}
            />

            <MenuButton
              icon={<CheckCircle size={14} />}
              label="New Task"
              onClick={() => openTool("task")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN TOGGLE BUTTON */}

      <Button
        onClick={handleMainBtnClick}
        className={cn(
          "h-9 w-9 rounded-full shadow-2xl border-2 border-white transition-all",
          isQuickAddOpen || showMenu ? "bg-[#1e2f25]" : "bg-[#30493b]",
          isQuickAddOpen && "invisible",

          isQuickAddOpen || showMenu
            ? "bg-[#1e2f25] rotate-0 "
            : "bg-[#30493b]",
        )}
      >
        {isQuickAddOpen || showMenu ? <X size={6} /> : <Plus size={6} />}
      </Button>
    </div>
  );
};

const MenuButton = ({ icon, label, onClick }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: -0.5 }}
    className="flex items-center gap-2 group cursor-pointer"
    onClick={onClick}
  >
    <span className="text-[10px] font-bold bg-white px-2 py-1 rounded border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
      {label}
    </span>

    <div className="h-9 w-9 rounded-full bg-[#30493b] border border-slate-300 flex items-center justify-center text-white hover:text-[#1e2f25] hover:bg-[#fdfdfd]">
      {icon}
    </div>
  </motion.div>
);
