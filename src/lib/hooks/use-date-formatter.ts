import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useDateFormatter() {
  const formatDate = (value: string | Date, fmt = "Pp") => {
    return format(new Date(value), fmt, { locale: ptBR });
  };

  return { formatDate };
}
