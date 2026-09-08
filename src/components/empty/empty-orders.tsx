import EmptyScreen from "./empty-screen";

export default function EmptyOrders() {
  return (
    <EmptyScreen
      title={"Não há pedidos."}
      description={"Você não possui pedidos nesse status para serem listados."}
    />
  );
}
