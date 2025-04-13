import { z } from "zod";

export const paginationSchema = z.object({
  nextPageKey: z.string().nullable().optional(),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .nullable()
    .default(10)
    .optional()
    .default(10),
});
