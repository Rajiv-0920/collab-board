import z from 'zod';

export const createCardSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Card title is required').max(100),
  }),
});
