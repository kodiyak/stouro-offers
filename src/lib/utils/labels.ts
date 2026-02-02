export const getOrderPosition = (position: number) => {
  return `#${position.toString().padStart(3, "0")}`;
};
