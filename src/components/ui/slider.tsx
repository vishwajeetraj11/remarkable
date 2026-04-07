"use client"

import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  defaultValue?: number[]
  value?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number) => void
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
}: SliderProps) {
  const current = value?.[0] ?? defaultValue?.[0] ?? min

  return (
    <input
      type="range"
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={current}
      disabled={disabled}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      className={cn(
        "w-full appearance-none bg-transparent cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-shadow",
        "[&::-webkit-slider-thumb]:hover:ring-3 [&::-webkit-slider-thumb]:hover:ring-ring/50",
        "[&::-webkit-slider-thumb]:focus-visible:ring-3 [&::-webkit-slider-thumb]:focus-visible:ring-ring/50",
        "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
        "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm",
        "focus-visible:outline-none",
        className,
      )}
    />
  )
}

export { Slider }
