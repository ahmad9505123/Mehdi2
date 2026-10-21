import { z } from 'zod';
export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'اسم الخدمة مطلوب').max(150),
  price: z.number().finite().min(0).max(999999999999).nullable(),
  currency: z.string().trim().max(30),
  available: z.boolean(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
export type Service = ServiceInput & { id: string };
