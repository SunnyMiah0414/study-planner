import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#f43f5e", // Rose
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm",
            value === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
