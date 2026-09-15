import z from 'zod';

export const createListSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'List title is required').max(100),
  }),
});
