import { CornerUpLeftIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export default function CustomerLine() {
  return (
    <Item variant={"outline"}>
      <ItemMedia>
        <Image
          src={`https://avatar.vercel.sh/${"Fabio Mix"}`}
          alt={"Fabio Mix"}
          width={300}
          height={300}
          className="rounded-xl w-full"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Fábio Mix</ItemTitle>
        <ItemContent>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CornerUpLeftIcon className="size-3.5" />
              <span className="font-mono font-semibold">R$ 209,02</span>
            </div>
          </div>
        </ItemContent>
      </ItemContent>
      <ItemActions>
        <Button variant={"outline"} size={"xs"}>
          <span>Editar</span>
        </Button>
      </ItemActions>
    </Item>
  );
}
