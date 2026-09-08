import { ShirtIcon } from "lucide-react";
import EmptyScreen from "./empty-screen";

export default function EmptyProducts() {
  return (
    <EmptyScreen
      icon={<ShirtIcon className="size-8 text-muted-foreground" />}
      title={"Não há produtos."}
      description={"Você não possui produtos para exibir aqui."}
    />
  );
}
