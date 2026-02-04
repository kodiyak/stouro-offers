"use client";

import CreateManifest from "@/components/forms/create-manifest";
import { Button } from "@/components/ui/button";
import { useDisclosure } from "@/lib/hooks";

export default function CreateManifestButton() {
  const create = useDisclosure();

  return (
    <>
      <CreateManifest {...create} />
      <Button onClick={create.onOpen} variant={"outline"} size={"drawer"}>
        <span>Criar Ficha</span>
      </Button>
    </>
  );
}
