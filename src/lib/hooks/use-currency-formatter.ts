export function useCurrencyFormatter() {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

  const formatCurrencyNumber = (value?: string | number | null) => {
    if (!value) return 0;
    const [money, cents = "00"] = String(value).split(/,|\.|[^0-9]/g);

    const result = Number(`${money}.${cents}`) * 100;
    return result;
  };

  const formatCurrency = (value: number | string, divide = 100) => {
    let formattedValue = value;
    if (typeof value === "string") {
      formattedValue = formatCurrencyNumber(value);
    }

    if (typeof formattedValue !== "number") {
      throw new Error("Value must be a number or numeric string");
    }

    const result = formatter.format(formattedValue / divide);
    return result;
  };

  return {
    formatCurrency,
  };
}
