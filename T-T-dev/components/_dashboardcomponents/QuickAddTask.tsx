"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { postRequest } from "@/services/apiConfig";
import {
  Maximize2,
  User,
  Hash,
  Calendar as CalendarIcon,
  Send,
  Check,
} from "lucide-react";
import {
  format,
  addDays,
  startOfToday,
  startOfTomorrow,
  nextFriday,
  addWeeks,
} from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { formatLocalDateTime } from "@/lib/utils";

type Token = {
  id: string;
  display: string;
  type: "user" | "category" | "date";
  value: any;
};

export const QuickAddTask = () => {
  const {
    users,
    categories,
    refreshFolder,
    fetchFolderData,
    activeFolder,
    refreshCounts,
  } = useTaskQ();
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [suggestionMode, setSuggestionMode] = useState<
    "user" | "category" | "date" | null
  >(null);
  const [filterText, setFilterText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);

  const [isManualDateMode, setIsManualDateMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeValue, setTimeValue] = useState<string>("12:00");

  const { setIsAddingTask, setLayoutType, setSelectedTask } = useTaskQ();

  const handleExpand = () => {
    setSelectedTask(null);
    setIsAddingTask(true);
    setLayoutType("popup");
  };

  const dateSuggestions = useMemo(
    () => [
      { label: "Today", value: startOfToday() },
      { label: "Tomorrow", value: startOfTomorrow() },
      { label: "This Friday", value: nextFriday(new Date()) },
      { label: "Next Week", value: addWeeks(new Date(), 1) },
      { label: "Pick a date...", value: "CUSTOM" },
    ],
    [],
  );

  const myNumericId = useMemo(() => {
    const loggedInName = localStorage.getItem("taskQ_user_name");
    if (!loggedInName || !users.length) return null;

    // Find the user object where the name matches
    const currentUser = users.find(
      (u) =>
        u.UserName.toLowerCase().trim() === loggedInName.toLowerCase().trim(),
    );

    return currentUser ? currentUser.UserID : null;
  }, [
    users,
    typeof window !== "undefined"
      ? localStorage.getItem("taskQ_user_name")
      : null,
  ]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      return;
    }
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    setSelectedDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const updatedDate = new Date(selectedDate);
      updatedDate.setHours(hours, minutes);
      setSelectedDate(updatedDate);
    }
  };

  const [inputError, setInputError] = useState(false);

  const addToken = (item: any, type: "user" | "category" | "date") => {
    if (type === "date" && item.value === "CUSTOM") {
      setIsManualDateMode(true);
      setSuggestionMode(null);
      return;
    }

    const alreadyExists = tokens.some((t) => t.type === type);
    if (alreadyExists) {
      const label =
        type === "user"
          ? "assignee"
          : type === "category"
            ? "category"
            : "date";
      toast.error(`Only one ${label} allowed. Remove the existing one first.`);
      setInputError(true);
      return;
    }

    const display =
      type === "date"
        ? formatLocalDateTime(item.value)
        : item.UserName || item.TaskTypeName || item.label;
    const value = item.UserID || item.TaskTypeID || item.value;
    const prefix = type === "user" ? "@" : type === "category" ? "#" : "";

    const newToken: Token = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      display,
      value,
    };

    setTokens((prev) => [...prev.filter((t) => t.type !== type), newToken]);

    if (inputRef.current) {
      const words = inputRef.current.innerText.split(/\s/);
      words.pop();
      const newText =
        words.join(" ") +
        (words.length > 0 ? " " : "") +
        prefix +
        display +
        "\u00A0";
      inputRef.current.innerText = newText;
      setText(newText);

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setSuggestionMode(null);
  };

  const confirmManualDate = () => {
    if (selectedDate) {
      addToken(
        { label: formatLocalDateTime(selectedDate), value: selectedDate },
        "date",
      );
    }
    setIsManualDateMode(false);
  };

  const handleSave = async () => {
    const innerText = inputRef.current?.innerText || "";
    if (!innerText.trim() && tokens.length === 0) return;

    const currentUserId = myNumericId || 123;

    // 1. Identify the first occurrence of any trigger
    const userToken = tokens.find((t) => t.type === "user");
    const categoryTokens = tokens.filter((t) => t.type === "category");
    const dateToken = tokens.find((t) => t.type === "date");

    const triggerMatch = innerText.match(/[@#]|(\bdd\b)/i);

    let cleanTitle = innerText;

    for (const token of tokens) {
      const prefix =
        token.type === "user" ? "@" : token.type === "category" ? "#" : "";
      // Escape special regex characters in the display string
      const escaped = (prefix + token.display).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      cleanTitle = cleanTitle.replace(
        new RegExp(escaped + "[\\s\\u00A0]*", "g"),
        "",
      );
    }

    // Also strip any bare trigger words that didn't resolve to tokens (dd, stray @, #)
    cleanTitle = cleanTitle
      .replace(/\bdd\b/gi, "")
      .replace(/[@#]\S*/g, "")
      .trim();

    const payload = {
      TaskTitle: cleanTitle.trim() || "Untitled Task",
      TaskDescription: "",
      DueDate: dateToken
        ? format(dateToken.value, "yyyy-MM-dd'T'HH:mm:ss")
        : format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
      AssignToUserID: userToken ? Number(userToken.value) : currentUserId,
      TaskTypeID:
        categoryTokens.length > 0 ? Number(categoryTokens[0].value) : 115,
      GroupID:
        activeFolder === "GetTasksByCategory" ? Number(activeFolder) : null,
      Location: "Remote",
      CreatedByUserID: currentUserId,
    };

    try {
      toast.loading("Creating task...", { id: "quick-add" });
      const result = await postRequest<any>(
        "AddTask",
        { json: payload },
        "add-data",
      );

      if (result.Processcode === 0) {
        refreshFolder();
        refreshCounts();
        toast.success("Task added!", { id: "quick-add" });
        setText("");
        setTokens([]);
        if (inputRef.current) inputRef.current.innerText = "";
      } else {
        toast.error(result.processMessage || "Error", { id: "quick-add" });
      }
    } catch (error) {
      toast.error("Network error", { id: "quick-add" });
    }
  };
  const filteredList = useMemo(() => {
    let list: any[] = [];
    const search = filterText.toLowerCase();
    if (suggestionMode === "user") {
      list = [...users].filter((u) =>
        u.UserName.toLowerCase().includes(search),
      );
    } else if (suggestionMode === "category") {
      list = [...categories].filter((c) =>
        c.TaskTypeName.toLowerCase().includes(search),
      );
    } else if (suggestionMode === "date") {
      list = dateSuggestions.filter((d) =>
        d.label.toLowerCase().includes(search),
      );
    }
    return list;
  }, [suggestionMode, filterText, users, categories, dateSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestionMode && filteredList.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredList.length) % filteredList.length,
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        addToken(filteredList[selectedIndex], suggestionMode);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestionMode(null);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
    } else if (e.key === "Enter" && !isManualDateMode) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className=" bg-[#fdfdfd] relative roundeds">
      {(suggestionMode || isManualDateMode) && (
        <div
          className="absolute z-[1000] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden"
          style={{ bottom: "100%", left: "0px", marginBottom: "8px" }}
        >
          {isManualDateMode ? (
            <div className="p-0 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
              <div className="px-3 py-1 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
                <span className="text-sm text-slate-700 font-medium">Time</span>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="h-6 w-[80px] rounded-lg text-bg-white"
                />
              </div>
              <div className="flex gap-2 p-2 bg-white border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsManualDateMode(false)}
                  className="h-7 text-sm flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-sm flex-1 bg-[#1e2f25]"
                  onClick={confirmManualDate}
                >
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-1 w-52 max-h-[200px] overflow-x-auto no-scrollbar scroll-smooth flex flex-col custom-scrollbar">
              {filteredList.map((item: any, i) => (
                <button
                  key={i}
                  onClick={() => addToken(item, suggestionMode!)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-xs text-left",
                    selectedIndex === i
                      ? "bg-[#30493b] text-white"
                      : "hover:bg-slate-100 text-slate-700",
                  )}
                >
                  {suggestionMode === "user" ? (
                    <User size={12} />
                  ) : suggestionMode === "category" ? (
                    <Hash size={12} />
                  ) : (
                    <CalendarIcon size={12} />
                  )}
                  {item.UserName || item.TaskTypeName || item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col h-8 justify-center bg-slate-50 border rounded-lg border-slate-200 p-2 focus-within:ring-1 focus-within:ring-[#30493b]",
          inputError && "border-red-400 ring-1 ring-red-400",
        )}
      >
        <div className="flex items-start gap-2">
          <Maximize2
            className="text-slate-400 mt-1 cursor-pointer hover:text-[#30493b] transition-colors"
            size={13}
            onClick={handleExpand}
          />
          <div
            ref={inputRef}
            contentEditable
            onInput={(e) => {
              setInputError(false);
              const innerContent = e.currentTarget.innerText;
              setText(innerContent);
              setTokens((prev) => {
                return prev.filter((token) => {
                  const prefix =
                    token.type === "user"
                      ? "@"
                      : token.type === "category"
                        ? "#"
                        : "";
                  return innerContent.includes(prefix + token.display);
                });
              });

              const words = innerContent.split(/[\s\u00A0]/);
              const lastWord = words[words.length - 1];

              if (lastWord.startsWith("@")) {
                setSuggestionMode("user");
                setFilterText(lastWord.slice(1));
              } else if (lastWord.startsWith("#")) {
                setSuggestionMode("category");
                setFilterText(lastWord.slice(1));
              } else if (lastWord.toLowerCase() === "dd") {
                setSuggestionMode("date");
                setFilterText("");
              } else {
                setSuggestionMode(null);
              }
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              // Added: overflow management and line clamping
              "flex-1 min-h-[20px] max-h-[24px] overflow-x-auto overflow-y-hidden outline-none text-xs text-slate-700 whitespace-nowrap custom-scrollbar-hide",
              "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400",
              inputError && "text-red-500",
            )}
            data-placeholder="Add task... @Name #Category
         ddDate"
          />
          <Button
            size="icon"
            onClick={handleSave}
            className="h-6 w-6 rounded-lg bg-[#1e2f25]"
          >
            <Send size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};
