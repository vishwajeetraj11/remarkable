"use client";

import { DEVICES, type DeviceKey } from "@/lib/templates/constants";
import type {
  TemplateVariants,
  WeekStart,
  Handedness,
  Orientation,
} from "@/lib/templates/variants";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors focus:outline-none ${checked ? "bg-foreground border-foreground" : "bg-muted border-border"}`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
      <Label className="cursor-pointer" onClick={onToggle}>
        {label}
      </Label>
    </div>
  );
}

export function VariantControls({
  variants,
  onChange,
  showWeekStart,
}: {
  variants: TemplateVariants;
  onChange: (v: TemplateVariants) => void;
  showWeekStart?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label>Device / page size</Label>
        <Select
          value={variants.device}
          onValueChange={(v) => onChange({ ...variants, device: v as DeviceKey })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEVICES).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Orientation</Label>
        <Select
          value={variants.orientation}
          onValueChange={(v) =>
            onChange({ ...variants, orientation: v as Orientation })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Layout handedness</Label>
        <Select
          value={variants.handedness}
          onValueChange={(v) =>
            onChange({ ...variants, handedness: v as Handedness })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="right">Right-handed (margin left)</SelectItem>
            <SelectItem value="left">Left-handed (margin right)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showWeekStart && (
        <div className="space-y-1.5">
          <Label>Week starts on</Label>
          <Select
            value={variants.weekStart}
            onValueChange={(v) =>
              onChange({ ...variants, weekStart: v as WeekStart })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export { Toggle };
