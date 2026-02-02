import z from "zod";

export const orderStatusEnum = z.enum(["DRAFT", "APPROVED"]);
export type OrderStatus = z.infer<typeof orderStatusEnum>;
