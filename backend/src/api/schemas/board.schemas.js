import z from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Board title is required').max(100),
    description: z.string().max(1000),
  }),
});

export const boardMembersSchema = z.object({
  body: z.object({
    role: z.enum(['owner', 'editor', 'viewer']),
    joinedAt: z.date(),
  }),
});
