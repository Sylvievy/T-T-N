"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { formatLocalDateTime } from "@/lib/utils";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  autoOpen?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Select date & time",
  className,
  autoOpen = false,
}: DateTimePickerProps) {
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "12:00",
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }
    const [hours, minutes] = timeValue.split(":").map(Number);
    selectedDate.setHours(hours, minutes);
    setDate(selectedDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const updatedDate = new Date(date);
      updatedDate.setHours(hours, minutes);
      setDate(updatedDate);
    }
  };

  return (
    <Popover defaultOpen={autoOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7 w-full justify-between text-left font-normal border-slate-200 rounded-xl text-[13px]",
            !date && "text-slate-400",
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon size={14} className="shrink-0" />
            {date ? formatLocalDateTime(date) : placeholder}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[999] scale-90" align="start">
        <Calendar
          weekStartsOn={1}
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
        />
        <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
          <span className="text-sm text-slate-700 font-medium">Time</span>
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="h-6 w-[90px] rounded-lg text-xs bg-white"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
