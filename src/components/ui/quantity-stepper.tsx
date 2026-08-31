"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  helpers?: number[];
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  helpers = [5, 10, 100],
}: QuantityStepperProps) {
  const steps = [
    { delta: 1, icon: <PlusIcon /> },
    ...helpers.map((increment) => ({
      delta: increment,
      icon: (
        <>
          <PlusIcon />
          <span className="text-lg font-bold">{increment}</span>
        </>
      ),
    })),
    { delta: -1, icon: <MinusIcon /> },
    ...helpers.map((decrement) => ({
      delta: -decrement,
      icon: (
        <>
          <MinusIcon />
          <span className="text-lg font-bold">{decrement}</span>
        </>
      ),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <span className="text-5xl font-black">{value}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {steps.map(({ delta, icon }) => (
          <Button
            key={delta}
            variant={"outline"}
            disabled={value + delta < min}
            onClick={() => onChange(Math.max(min, value + delta))}
          >
            {icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
