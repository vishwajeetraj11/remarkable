"use client"

import { captureUiInputChanged, getAnalyticsControlName } from "@/lib/analytics"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  id?: string
  name?: string
  defaultValue?: number[]
  value?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number) => void
  analyticsName?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}

function Slider({
  className,
  id,
  name,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
  analyticsName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: SliderProps) {
  const current = value?.[0] ?? defaultValue?.[0] ?? min

  function captureValue(element: HTMLInputElement, changeReason: string) {
    captureUiInputChanged({
      controlName: getAnalyticsControlName(element, analyticsName || "slider"),
      controlType: "range",
      value: Number(element.value),
      changeReason,
    })
  }

  return (
    <input
      type="range"
      data-slot="slider"
      id={id}
      name={name}
      min={min}
      max={max}
      step={step}
      value={current}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      onPointerUp={(event) => captureValue(event.currentTarget, "pointer")}
      onKeyUp={(event) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
          captureValue(event.currentTarget, "keyboard")
        }
      }}
      className={cn(
        "min-h-11 w-full appearance-none bg-transparent cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-shadow",
        "[&::-webkit-slider-thumb]:hover:ring-3 [&::-webkit-slider-thumb]:hover:ring-ring/50",
        "[&::-webkit-slider-thumb]:focus-visible:ring-3 [&::-webkit-slider-thumb]:focus-visible:ring-ring/50",
        "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
        "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm",
        "focus-visible:outline-none",
        className,
      )}
    />
  )
}

export { Slider }
