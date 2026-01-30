import type { HTMLProps } from "@base-ui/react";

interface PressionableProps extends HTMLProps<HTMLButtonElement> {}

export default function Pressionable({ onClick, ...rest }: PressionableProps) {
  return <button type={"button"} onClick={onClick} {...rest} />;
}
