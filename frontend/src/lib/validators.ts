import { z } from 'zod';

// ──────────────────────────────────────────────
// Student schemas
// ──────────────────────────────────────────────
export const studentCreateSchema = z.object({
    firstName: z.string().min(1, 'validation.required').max(100),
    lastName: z.string().min(1, 'validation.required').max(100),
    email: z.string().min(1, 'validation.required').email('validation.invalidEmail'),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    imageUrl: z.string().max(500).optional().or(z.literal('')),
    notes: z.string().max(500).optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export type StudentCreateFormData = z.infer<typeof studentCreateSchema>;
export type StudentUpdateFormData = z.infer<typeof studentUpdateSchema>;

// ──────────────────────────────────────────────
// Training schemas
// ──────────────────────────────────────────────
export const trainingCreateSchema = z.object({
    title: z.string().min(1, 'validation.required').max(200),
    description: z.string().optional(),
});

export const trainingUpdateSchema = trainingCreateSchema.partial();

export type TrainingCreateFormData = z.infer<typeof trainingCreateSchema>;
export type TrainingUpdateFormData = z.infer<typeof trainingUpdateSchema>;

// ──────────────────────────────────────────────
// Enrollment schema
// ──────────────────────────────────────────────
export const enrollmentCreateSchema = z.object({
    studentId: z.string().min(1, 'validation.required'),
    trainingId: z.string().min(1, 'validation.required'),
});

export type EnrollmentCreateFormData = z.infer<typeof enrollmentCreateSchema>;

// ──────────────────────────────────────────────
// Attendance schema
// ──────────────────────────────────────────────
export const attendanceRecordSchema = z.object({
    studentId: z.string(),
    status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED']),
});

export const attendanceMarkSchema = z.object({
    trainingId: z.string().min(1),
    sessionId: z.string().min(1),
    date: z.string().min(1),
    records: z.array(attendanceRecordSchema).min(1),
});

export type AttendanceMarkFormData = z.infer<typeof attendanceMarkSchema>;

// ──────────────────────────────────────────────
// Group schemas
// ──────────────────────────────────────────────
export const groupCreateSchema = z.object({
    name: z.string().min(1, 'validation.required').max(100),
    trainingId: z.string().min(1, 'validation.required'),
    dayOfWeek: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    studentIds: z.array(z.string()).optional(),
});

export const groupUpdateSchema = groupCreateSchema.omit({ trainingId: true }).partial();

export type GroupCreateFormData = z.infer<typeof groupCreateSchema>;
export type GroupUpdateFormData = z.infer<typeof groupUpdateSchema>;

// ──────────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().min(1, 'validation.required').email('validation.invalidEmail'),
    password: z.string().min(1, 'validation.required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    firstName: z.string().min(1, 'validation.required').max(100),
    lastName: z.string().min(1, 'validation.required').max(100),
    email: z.string().min(1, 'validation.required').email('validation.invalidEmail'),
    password: z
        .string()
        .min(1, 'validation.required')
        .min(8, 'validation.passwordMin'),
    requestedRole: z.enum(['TRAINER', 'MANAGER']).optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
