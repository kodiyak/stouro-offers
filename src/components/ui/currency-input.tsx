import ReactCurrencyInput, {
  type CurrencyInputProps as ICurrencyInputProps,
} from "react-currency-input-field";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface CurrencyInputProps
  extends Omit<ICurrencyInputProps, "value" | "onValueChange" | "onChange"> {
  value?: string | number | null;
  onChange?: (value: string | number | null | undefined) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
}
function CurrencyInput({
  value,
  className,
  onBlur,
  onChange,
  ...rest
}: CurrencyInputProps) {
  return (
    <ReactCurrencyInput
      className={cn("", className)}
      customInput={Input}
      decimalsLimit={2}
      intlConfig={{
        locale: "pt-BR",
        currency: "BRL",
      }}
      onValueChange={(_, __, v) => onChange?.(v?.value)}
      value={value ?? ""}
      {...rest}
    />
  );
}
export { CurrencyInput };
