import { z } from 'zod';
import { BaseMitraSchema } from './create-mitra.dto';

export type UpdateMitraDto = z.infer<typeof BaseMitraSchema>;
