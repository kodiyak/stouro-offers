import { PlusCircleIcon } from "lucide-react";
import React from "react";

export default function CreateCustomerButton() {
  return (
    <button
      type={"button"}
      className="p-2 rounded-xl text-muted-foreground border-2 bg-card border-dashed aspect-video flex flex-col items-center justify-center gap-4"
    >
      <PlusCircleIcon className="size-12" />
      <span className="text-sm font-bold">Adicionar novo cliente</span>
    </button>
  );
}
