"use client";

import React, { useState, useMemo } from "react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FeedbackLog } from "@/services/GlobalParams";

export const ViewFeedback = () => {
  const { feedback } = useTaskQ();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return (feedback as FeedbackLog[]).filter((f) => {
      const searchTerm = search.toLowerCase();
      return (
        f.FeedBackDescription.toLowerCase().includes(searchTerm) ||
        f.FeedBackPage.toLowerCase().includes(searchTerm) ||
        f.UserName.toLowerCase().includes(searchTerm) ||
        f.UserEmail.toLowerCase().includes(searchTerm)
      );
    });
  }, [feedback, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-[#1e2f25] transition-colors"
        title="View all feedback"
      >
        <FileText size={14} />
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.18 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-[780px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#1e2f25]" />
                      <h2 className="font-bold text-sm text-slate-800">
                        Feedback Details
                      </h2>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {filtered.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <Input
                          placeholder="Search feedback or users..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                          className="h-7 pl-7 text-xs w-48 focus-visible:ring-[#1e2f25]"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-7 w-7 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-100">
                          {["Name", "Email", "Feedback", "Page Name"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 tracking-wide"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-12 text-slate-400 italic"
                            >
                              No feedback found.
                            </td>
                          </tr>
                        ) : (
                          paginated.map((item, i) => (
                            <tr
                              key={item.FeedBackID}
                              className={cn(
                                "border-b border-slate-50 hover:bg-slate-50/70 transition-colors",
                                i % 2 === 1 && "bg-slate-50/30",
                              )}
                            >
                              <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                {item.UserName}
                              </td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {item.UserEmail}
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-[280px]">
                                <p className="line-clamp-2">
                                  {item.FeedBackDescription}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {item.FeedBackPage}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Section */}
                  <div className="shrink-0 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-xs"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        ‹
                      </Button>
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => i + 1,
                      ).map((p) => (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-7 w-7 p-0 text-xs",
                            page === p && "bg-[#1e2f25] hover:bg-[#30493b]",
                          )}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-xs"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        ›
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
