import z from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Comment text is required'),
  }),
});
