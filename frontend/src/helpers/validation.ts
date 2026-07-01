import z from 'zod';

export const loginSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const jobSchema = z
    .object({
        title: z.string().min(2, 'Job title is required'),
        department: z.string().default('engineering'),
        type: z.string().default('full-time'),
        experienceMin: z.coerce.number().min(0, 'Must be positive').optional().or(z.literal('')),
        experienceMax: z.coerce.number().min(0, 'Must be positive').optional().or(z.literal('')),
        ctcMin: z.coerce.number().min(0, 'Must be positive').optional().or(z.literal('')),
        ctcMax: z.coerce.number().min(0, 'Must be positive').optional().or(z.literal('')),
        location: z.string().optional().or(z.literal('')),
        keySkills: z.string().optional().or(z.literal('')),
        description: z.string().min(10, 'Description needs detailed information'),
    })
    .refine(
        data => {
            if (typeof data.experienceMin === 'number' && typeof data.experienceMax === 'number') {
                return data.experienceMin <= data.experienceMax;
            }
            return true;
        },
        {
            message: 'Min experience must be <= Max',
            path: ['experienceMax'],
        }
    )
    .refine(
        data => {
            if (typeof data.ctcMin === 'number' && typeof data.ctcMax === 'number') {
                return data.ctcMin <= data.ctcMax;
            }
            return true;
        },
        {
            message: 'Min CTC must be <= Max',
            path: ['ctcMax'],
        }
    );

export type JobFormValues = z.infer<typeof jobSchema>;
