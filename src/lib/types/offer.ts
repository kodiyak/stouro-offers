import { z } from "zod";

export const offerSchema = z.object({});
export type Offer = z.infer<typeof offerSchema>;
