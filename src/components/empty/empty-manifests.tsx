import { FileTextIcon } from "lucide-react";
import EmptyScreen from "./empty-screen";

export default function EmptyManifests() {
  return (
    <EmptyScreen
      icon={<FileTextIcon className="size-8 text-muted-foreground" />}
      title={"Não há romaneios."}
      description={"Você não possui romaneios vinculados a este pedido."}
    />
  );
}
