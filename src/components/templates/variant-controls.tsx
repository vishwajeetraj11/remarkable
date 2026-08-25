"use client";

import { useId } from "react";

import { DEVICES, type DeviceKey } from "@/lib/templates/constants";
import type {
  TemplateVariants,
  WeekStart,
  Handedness,
  Orientation,
  InkIntensity,
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
  const controlId = useId();
  const labelId = `${controlId}-label`;

  return (
    <div className="flex items-center gap-3">
      <button
        id={controlId}
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors ${checked ? "border-foreground bg-foreground" : "border-border bg-muted"}`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-background transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </span>
      </button>
      <Label id={labelId} htmlFor={controlId} className="cursor-pointer">
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
  const deviceId = useId();
  const orientationId = useId();
  const handednessId = useId();
  const inkIntensityId = useId();
  const weekStartId = useId();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor={deviceId}>Device / page size</Label>
        <Select
          value={variants.device}
          onValueChange={(v) => onChange({ ...variants, device: v as DeviceKey })}
        >
          <SelectTrigger id={deviceId} className="w-full">
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
        <Label htmlFor={orientationId}>Orientation</Label>
        <Select
          value={variants.orientation}
          onValueChange={(v) =>
            onChange({ ...variants, orientation: v as Orientation })
          }
        >
          <SelectTrigger id={orientationId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={handednessId}>Layout handedness</Label>
        <Select
          value={variants.handedness}
          onValueChange={(v) =>
            onChange({ ...variants, handedness: v as Handedness })
          }
        >
          <SelectTrigger id={handednessId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="right">Right-handed (margin left)</SelectItem>
            <SelectItem value="left">Left-handed (margin right)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={inkIntensityId}>Ink</Label>
        <Select
          value={variants.inkIntensity}
          onValueChange={(v) =>
            onChange({ ...variants, inkIntensity: v as InkIntensity })
          }
        >
          <SelectTrigger id={inkIntensityId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light (fainter lines)</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="bold">Bold (darker lines)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showWeekStart && (
        <div className="space-y-1.5">
          <Label htmlFor={weekStartId}>Week starts on</Label>
          <Select
            value={variants.weekStart}
            onValueChange={(v) =>
              onChange({ ...variants, weekStart: v as WeekStart })
            }
          >
            <SelectTrigger id={weekStartId} className="w-full">
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
