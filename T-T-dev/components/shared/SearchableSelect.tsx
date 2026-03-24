"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  label: string;
  options: any[];
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  displayKey: string;
  valueKey: string;
  width?: string;
}

export const SearchableSelect = ({
  label,
  options,
  value,
  onSelect,
  placeholder,
  displayKey,
  valueKey,
  width = "w-[180px]",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = options
    .filter((opt) =>
      opt[displayKey].toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a[displayKey].localeCompare(b[displayKey]));

  useEffect(() => setHighlightedIndex(0), [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + filtered.length) % filtered.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filtered[highlightedIndex];
      onSelect(selected[valueKey].toString());
      setSearch("");
      setOpen(false);
    }
  };

  const selectedItem = options.find(
    (opt) => opt[valueKey].toString() === value,
  );

  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-7 w-full justify-between px-3 rounded-xl border-slate-200 text-xs font-normal"
          >
            <span className="truncate">
              {selectedItem ? selectedItem[displayKey] : placeholder}
            </span>
            <ChevronDown size={14} className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("p-0 rounded-xl shadow-xl", width)}
          align="start"
        >
          <div className="flex items-center px-3 py-2 border-b">
            <Search size={12} className="mr-2 text-slate-400" />
            <input
              autoFocus
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <ScrollArea className="h-44">
            <div className="p-1">
              {filtered.map((opt, i) => (
                <div
                  key={opt[valueKey]}
                  className={cn(
                    "px-2 py-1 text-xs rounded-lg cursor-pointer flex justify-between items-center",
                    highlightedIndex === i
                      ? "bg-slate-100 text-[#30493b] font-semibold"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                  onClick={() => {
                    onSelect(opt[valueKey].toString());
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  {opt[displayKey]}
                  {value === opt[valueKey].toString() && <Check size={12} />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
