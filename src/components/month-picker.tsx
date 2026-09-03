"use client";

import { addMonths, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

function monthLabel(month: string) {
  const label = format(parseISO(`${month}-01`), "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface MonthPickerProps {
  month?: string; // "yyyy-MM"
  onChange?: (month: string) => void;
}

export default function MonthPicker({
  month: controlledMonth,
  onChange,
}: MonthPickerProps) {
  const [internalMonth, setInternalMonth] = useState(() =>
    format(new Date(), "yyyy-MM"),
  );

  const month = controlledMonth ?? internalMonth;
  const currentMonth = format(new Date(), "yyyy-MM");
  const canGoNext = month < currentMonth;

  const selectMonth = (next: string) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternalMonth(next);
    }
  };

  const navigate = (direction: 1 | -1) => {
    const base = parseISO(`${month}-01`);
    selectMonth(format(addMonths(base, direction), "yyyy-MM"));
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button
        size={"icon"}
        variant={"outline"}
        onClick={() => navigate(-1)}
        aria-label={"Mês anterior"}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="flex-1">
        <Button className="w-full" variant={"ghost"} type={"button"}>
          <span className="capitalize">{monthLabel(month)}</span>
        </Button>
      </div>
      <Button
        size={"icon"}
        variant={"outline"}
        onClick={() => navigate(1)}
        disabled={!canGoNext}
        aria-label={"Próximo mês"}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
