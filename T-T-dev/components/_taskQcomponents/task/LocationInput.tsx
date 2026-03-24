"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
  labelStyle: string;
}

export const LocationInput = ({
  value,
  onChange,
  labelStyle,
}: LocationInputProps) => {
  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        onChange(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        ),
      () => toast.error("Permission denied"),
    );
  };

  return (
    <div className="space-y-1.5 flex-1">
      <label className={labelStyle}>Location</label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter location or pin"
          className="h-7 rounded-xl pr-10 border-slate-200 text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-slate-100 rounded-lg"
          onClick={handleGetLocation}
        >
          <MapPin size={14} className="text-slate-500" />
        </Button>
      </div>
    </div>
  );
};
