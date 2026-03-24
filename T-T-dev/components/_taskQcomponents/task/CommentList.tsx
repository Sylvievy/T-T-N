"use client";
import { useRef, useEffect } from "react";
import { Comments } from "@/services/dashboard/DashboardParams";
import { cn } from "@/lib/utils"; // Using your shared utility
import { formatDate } from "@/lib/utils";

interface CommentListProps {
  comments: Comments[];
  myId: string | null;
  formatTime: (date: string) => string;
}

export const CommentList = ({
  comments,
  myId,
  formatTime,
}: CommentListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [comments]);

  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(a.CommentedDate).getTime() - new Date(b.CommentedDate).getTime(),
  );

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 space-y-1 bg-white custom-scrollbar scroll-smooth "
    >
      {sortedComments.length === 0 ? (
        <div className="flex justify-center  items-center h-full opacity-40">
          <span className="text-xs text-[#30493b] font-bold tracking-widest">
            No activity yet
          </span>
        </div>
      ) : (
        <>
          {sortedComments.map((comment, index) => {
            const isMe = myId === comment.AspNetUserId;
            const currentDateGroup = formatDate(comment.CommentedDate);
            const prevDateGroup =
              index > 0
                ? formatDate(sortedComments[index - 1].CommentedDate)
                : null;
            const showDateHeader = currentDateGroup !== prevDateGroup;
            return (
              <div key={comment.CommentID} className="flex flex-col">
                {showDateHeader && (
                  <div className="flex items-center my-2">
                    <div className="flex-1 h-[1px] bg-[#e8efe9]"></div>
                    <span className="px-2 text-[11px] font-semibold text-slate-700 bg-[#a3bfaa] rounded-lg">
                      {currentDateGroup}
                    </span>
                    <div className="flex-1 h-[1px] bg-[#e8efe9]"></div>
                  </div>
                )}
                <div
                  className={cn(
                    "flex flex-col",
                    isMe ? "items-end" : "items-start",
                    comment.IsSystemComment && "items-center",
                  )}
                >
                  {/* Username for others */}
                  {!isMe && !comment.IsSystemComment && (
                    <span className="text-[10px] font-extrabold text-[#30493b]  ml-1">
                      {comment.CommentedByName}
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[90%] px-2 rounded-xl text-xs leading-relaxed shadow-sm border",
                      comment.IsSystemComment
                        ? "bg-orange-100 text-orange-800 border-orange-200 self-center text-center max-w-[90%]"
                        : isMe
                          ? "bg-[#e8efe9] py-1 text-[#1e2f25] border-[#cbd5cc] rounded-tr-none"
                          : "bg-[#f8faf8] py-1 text-[#1e2f25] border-[#e8efe9] rounded-tl-none",
                    )}
                  >
                    <div>{comment.CommentText}</div>
                    {/* Inline Time following WhatsApp style */}
                    {!comment.IsSystemComment && (
                      <div
                        className={cn(
                          "text-[10px] flex justify-end opacity-60",
                          isMe ? "text-[#30493b]" : "text-slate-800",
                        )}
                      >
                        {formatTime(comment.CommentedDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};
