import z from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Board title is required').max(100),
    description: z.string().max(1000),
  }),
});

export const updateBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Board title is required').max(100).optional(),
    description: z.string().max(1000).optional(),
  }),
});

export const boardMembersSchema = z.object({
  body: z.object({
    role: z.enum(['owner', 'editor', 'viewer']),
    joinedAt: z.date(),
  }),
});

export const inviteMemberToBoardSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    role: z.enum(['editor', 'viewer']),
  }),
});

export const updateBoardMemberSchema = z.object({
  body: z.object({
    role: z.enum(['editor', 'viewer']),
  }),
});
