// ──────────────────────────────────────────────
// ASTBA – TypeScript domain types
// Matches the REST API contract
// ──────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    phone?: string;
    email: string;
    imageUrl?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface StudentCreateInput {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    imageUrl?: string;
    notes?: string;
}

export type StudentUpdateInput = Partial<StudentCreateInput>;

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // current page (0-based)
    size: number;
}

export interface Session {
    sessionId: string;
    sessionNumber: number;
    title?: string;
    plannedAt?: string;
}

export interface Level {
    levelNumber: number;
    title?: string;
    sessions: Session[];
}

export interface Training {
    id: string;
    title: string;
    description?: string;
    levels: Level[];
    createdAt?: string;
    updatedAt?: string;
}

export interface TrainingCreateInput {
    title: string;
    description?: string;
}

export type TrainingUpdateInput = Partial<TrainingCreateInput>;

export interface Enrollment {
    id: string;
    studentId: string;
    trainingId: string;
    groupId?: string;
    enrolledAt?: string;
    student?: Student;
    training?: Training;
    attendance?: Record<string, AttendanceEntry>;
    progressSnapshot?: ProgressSnapshot;
    createdAt?: string;
}

export interface EnrollmentCreateInput {
    studentId: string;
    trainingId: string;
    groupId?: string;
}

// ──────────────────────────────────────────────
// Group
// ──────────────────────────────────────────────
export interface Group {
    id: string;
    name: string;
    trainingId: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    studentIds: string[];
    studentCount: number;
    trainingTitle?: string;
    students?: Student[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GroupCreateInput {
    name: string;
    trainingId: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    studentIds?: string[];
}

export type GroupUpdateInput = Partial<Omit<GroupCreateInput, 'trainingId'>>;

export interface SessionAttendanceInfo {
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    status: AttendanceStatus | null;
}

export interface AttendanceRecord {
    studentId: string;
    status: AttendanceStatus;
}

export interface AttendanceMarkInput {
    trainingId: string;
    sessionId: string;
    date: string;
    records: AttendanceRecord[];
}

export interface AttendanceEntry {
    status: AttendanceStatus;
    markedAt?: string;
}

export interface ProgressSnapshot {
    totalSessions: number;
    attendedCount: number;
    missedCount: number;
    levelsValidated: number[];
    completed: boolean;
    completedAt?: string;
    eligibleForCertificate: boolean;
    certificateIssuedAt?: string;
}

export interface MissedSessionInfo {
    sessionId: string;
    levelNumber: number;
    sessionNumber: number;
    sessionTitle?: string;
    status?: string;
}

export interface StudentProgress {
    enrollmentId: string;
    trainingId: string;
    trainingTitle: string;
    progressSnapshot: ProgressSnapshot;
    missedSessions: MissedSessionInfo[];
}

export interface CertificateMeta {
    eligible: boolean;
    completedAt?: string;
    issuedAt?: string;
    studentName?: string;
    trainingTitle?: string;
}

// Dashboard stats
export interface DashboardStats {
    totalStudents: number;
    totalTrainings: number;
    sessionsToday: number;
    eligibleCertificates: number;
}

// ──────────────────────────────────────────────
// Auth types
// ──────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MANAGER' | 'TRAINER';

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'PENDING';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    status: UserStatus;
    provider?: 'LOCAL' | 'GOOGLE';
    lastLoginAt?: string;
    createdAt?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    requestedRole?: 'TRAINER' | 'MANAGER';
}
