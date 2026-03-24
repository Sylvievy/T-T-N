"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  isMainPopoverOpen: boolean;
  setIsMainPopoverOpen: (open: boolean) => void;
  viewType: string;
  tempFrom: Date | undefined;
  setTempFrom: (date: Date | undefined) => void;
  tempTo: Date | undefined;
  setTempTo: (date: Date | undefined) => void;
  handleApplyRange: () => void;
}

const DateRangePicker = ({
  isMainPopoverOpen,
  setIsMainPopoverOpen,
  viewType,
  tempFrom,
  setTempFrom,
  tempTo,
  setTempTo,
  handleApplyRange,
}: DateRangePickerProps) => {
  const calendarStartLimit = new Date("2025-01-01");
  const today = new Date();

  return (
    <Popover open={isMainPopoverOpen} onOpenChange={setIsMainPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className={`px-2 py-1 rounded-lg border transition-all ${
            viewType === "Custom"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-aut0 px-2 pt-0 pb-2 shadow-xl border-slate-200 bg-white rounded-xl z-50"
        align="center"
      >
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            {/* FROM SELECTOR */}
            <div className="flex-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">
                From
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full h-6 justify-start text-left font-normal text-[11px] px-2 ${
                      !tempFrom && "text-muted-foreground"
                    }`}
                  >
                    {tempFrom ? format(tempFrom, "dd MMM, yy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto scale-75 p-0 z-[60]"
                  align="end"
                >
                  <Calendar
                    mode="single"
                    selected={tempFrom}
                    onSelect={setTempFrom}
                    fromDate={calendarStartLimit}
                    toDate={today}
                    disabled={(date) =>
                      date > today || date < calendarStartLimit
                    }
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* TO SELECTOR */}
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">
                To
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full h-6 justify-start text-left font-normal text-[11px] px-2 ${
                      !tempTo && "text-muted-foreground"
                    }`}
                  >
                    {tempTo ? format(tempTo, "dd MMM, yy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto scale-75 p-0 z-[60]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={tempTo}
                    onSelect={setTempTo}
                    fromDate={tempFrom || calendarStartLimit}
                    toDate={today}
                    disabled={(date) =>
                      date > today ||
                      (tempFrom ? date < tempFrom : date < calendarStartLimit)
                    }
                    captionLayout="dropdown"
                    className="rounded-md border "
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            className="w-full h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
            onClick={handleApplyRange}
            disabled={!tempFrom || !tempTo}
          >
            Apply Range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
