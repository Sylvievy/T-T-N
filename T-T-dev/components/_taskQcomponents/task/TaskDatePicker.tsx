"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatLocalDateTime } from "@/lib/utils";

interface TaskDatePickerProps {
  date: Date | undefined;
  timeValue: string;
  onDateChange: (d: Date | undefined) => void;
  onTimeChange: (t: string) => void;
  labelStyle: string;
}

export const TaskDatePicker = ({
  date,
  timeValue,
  onDateChange,
  onTimeChange,
  labelStyle,
}: TaskDatePickerProps) => {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onDateChange(undefined);
      return;
    }
    const [hours, minutes] = timeValue.split(":").map(Number);
    selectedDate.setHours(hours, minutes);
    onDateChange(selectedDate);
  };

  return (
    <div className="space-y-1.5 flex-1">
      <label className={labelStyle}>
        Due Date <span className="text-red-500">*</span>
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-7 w-full justify-between text-left font-normal border-slate-200 rounded-xl text-xs",
              !date && "text-slate-400",
            )}
          >
            {date ? formatLocalDateTime(date) : "Select date & time"}
            <CalendarIcon size={14} className="text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 scale-90" align="start">
          <Calendar
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
              onChange={(e) => onTimeChange(e.target.value)}
              className="h-6 w-[90px] rounded-lg text-xs bg-white"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
