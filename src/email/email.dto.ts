import { z } from 'zod';

export const EmailOptionsSchema = z
  .object({
    to: z.string().email(),
    subject: z.string().min(1),
    html: z.string(),
    text: z.string(),
  })
  .refine((data) => data.html || data.text, {
    message: 'Minimal salah satu: html atau text harus ada',
  });

export type EmailOptions = z.infer<typeof EmailOptionsSchema>;
