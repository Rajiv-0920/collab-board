import z from 'zod';

export const createCardSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Card title is required').max(100),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    labels: z
      .array(z.string())
      .optional()
      .transform((labels) => labels?.map((label) => label.toLowerCase()) || []),
    assigneeIds: z.array(z.string()),
  }),
});

export const updateCardSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Card title is required').max(100),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    labels: z
      .array(z.string())
      .optional()
      .transform((labels) => labels?.map((label) => label.toLowerCase())),
    assigneeIds: z.array(z.string()).optional(),
    prevOrder: z.number().optional().nullable(),
    nextOrder: z.number().optional().nullable(),
    version: z.number().optional(),
    listId: z.string().optional(),
  }),
});
