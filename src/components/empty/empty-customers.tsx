import { UsersIcon } from "lucide-react";
import EmptyScreen from "./empty-screen";

export default function EmptyCustomers() {
  return (
    <EmptyScreen
      icon={<UsersIcon className="size-8 text-muted-foreground" />}
      title={"Não há clientes."}
      description={"Você não possui clientes cadastrados para listar."}
    />
  );
}
