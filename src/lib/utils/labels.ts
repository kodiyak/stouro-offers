export const getOrderPosition = (position: number) => {
  return `#${position.toString().padStart(3, "0")}`;
};

export const getYearlyPosition = (year: number, position: number) => {
  return [year, position.toString().padStart(5, "0")].join("");
};
