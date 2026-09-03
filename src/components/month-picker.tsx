"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function MonthPicker() {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button size={"icon"} variant={"outline"}>
        <ChevronLeftIcon />
      </Button>
      <div className="flex-1">
        <Button className="w-full" variant={"ghost"}>
          <span>Janeiro 2024</span>
        </Button>
      </div>
      <Button size={"icon"} variant={"outline"}>
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
