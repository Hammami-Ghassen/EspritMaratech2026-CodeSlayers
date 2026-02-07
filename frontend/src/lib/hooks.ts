'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi, trainingsApi, enrollmentsApi, attendanceApi, certificatesApi, groupsApi, seancesApi, notificationsApi, trainersApi } from './api-client';
import type {
    StudentCreateInput,
    StudentUpdateInput,
    TrainingCreateInput,
    TrainingUpdateInput,
    EnrollmentCreateInput,
    AttendanceMarkInput,
    GroupCreateInput,
    GroupUpdateInput,
    SeanceCreateInput,
    SessionReportInput,
} from './types';

// ──────────────── Query Keys ────────────────
export const queryKeys = {
    students: {
        all: ['students'] as const,
        list: (params?: { query?: string; page?: number; size?: number }) => ['students', 'list', params] as const,
        detail: (id: string) => ['students', 'detail', id] as const,
        enrollments: (id: string) => ['students', 'enrollments', id] as const,
        progress: (id: string) => ['students', 'progress', id] as const,
    },
    trainings: {
        all: ['trainings'] as const,
        list: () => ['trainings', 'list'] as const,
        detail: (id: string) => ['trainings', 'detail', id] as const,
        enrollments: (id: string) => ['trainings', 'enrollments', id] as const,
    },
    enrollments: {
        detail: (id: string) => ['enrollments', 'detail', id] as const,
        progress: (id: string) => ['enrollments', 'progress', id] as const,
    },
    certificates: {
        meta: (enrollmentId: string) => ['certificates', 'meta', enrollmentId] as const,
    },
    groups: {
        all: ['groups'] as const,
        list: (trainingId?: string) => ['groups', 'list', trainingId] as const,
        detail: (id: string) => ['groups', 'detail', id] as const,
    },
    attendance: {
        session: (trainingId: string, sessionId: string) => ['attendance', 'session', trainingId, sessionId] as const,
    },
    seances: {
        all: ['seances'] as const,
        list: (params?: Record<string, string>) => ['seances', 'list', params] as const,
        detail: (id: string) => ['seances', 'detail', id] as const,
        my: (from?: string, to?: string) => ['seances', 'my', from, to] as const,
        reports: (id: string) => ['seances', 'reports', id] as const,
        availability: (trainerId: string, date: string, startTime: string, endTime: string) =>
            ['seances', 'availability', trainerId, date, startTime, endTime] as const,
    },
    notifications: {
        all: ['notifications'] as const,
        list: () => ['notifications', 'list'] as const,
        unread: () => ['notifications', 'unread'] as const,
        unreadCount: () => ['notifications', 'unreadCount'] as const,
    },
    trainers: {
        all: ['trainers'] as const,
        list: () => ['trainers', 'list'] as const,
    },
};

// ──────────────── Student Hooks ────────────────
export function useStudents(params?: { query?: string; page?: number; size?: number }) {
    return useQuery({
        queryKey: queryKeys.students.list(params),
        queryFn: () => studentsApi.list(params),
    });
}

export function useStudent(id: string) {
    return useQuery({
        queryKey: queryKeys.students.detail(id),
        queryFn: () => studentsApi.get(id),
        enabled: !!id,
    });
}

export function useStudentEnrollments(studentId: string) {
    return useQuery({
        queryKey: queryKeys.students.enrollments(studentId),
        queryFn: () => studentsApi.enrollments(studentId),
        enabled: !!studentId,
    });
}

export function useStudentProgress(studentId: string) {
    return useQuery({
        queryKey: queryKeys.students.progress(studentId),
        queryFn: () => studentsApi.progress(studentId),
        enabled: !!studentId,
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StudentCreateInput) => studentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
        },
    });
}

export function useUpdateStudent(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StudentUpdateInput) => studentsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) });
        },
    });
}

export function useDeleteStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => studentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
        },
    });
}

// ──────────────── Training Hooks ────────────────
export function useTrainings() {
    return useQuery({
        queryKey: queryKeys.trainings.list(),
        queryFn: () => trainingsApi.list(),
    });
}

export function useTraining(id: string) {
    return useQuery({
        queryKey: queryKeys.trainings.detail(id),
        queryFn: () => trainingsApi.get(id),
        enabled: !!id,
    });
}

export function useTrainingEnrollments(trainingId: string) {
    return useQuery({
        queryKey: queryKeys.trainings.enrollments(trainingId),
        queryFn: () => trainingsApi.enrollments(trainingId),
        enabled: !!trainingId,
    });
}

export function useCreateTraining() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TrainingCreateInput) => trainingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all });
        },
    });
}

export function useUpdateTraining(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TrainingUpdateInput) => trainingsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.detail(id) });
        },
    });
}

export function useDeleteTraining() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => trainingsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all });
        },
    });
}

// ──────────────── Enrollment Hooks ────────────────
export function useCreateEnrollment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EnrollmentCreateInput) => enrollmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all });
        },
    });
}

export function useEnrollmentProgress(enrollmentId: string) {
    return useQuery({
        queryKey: queryKeys.enrollments.progress(enrollmentId),
        queryFn: () => enrollmentsApi.progress(enrollmentId),
        enabled: !!enrollmentId,
    });
}

// ──────────────── Attendance Hooks ────────────────
export function useMarkAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AttendanceMarkInput) => attendanceApi.mark(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all });
        },
    });
}

export function useReassignGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ enrollmentId, newGroupId }: { enrollmentId: string; newGroupId: string }) =>
            enrollmentsApi.reassignGroup(enrollmentId, newGroupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        },
    });
}

// ──────────────── Certificate Hooks ────────────────
export function useCertificateMeta(enrollmentId: string) {
    return useQuery({
        queryKey: queryKeys.certificates.meta(enrollmentId),
        queryFn: () => certificatesApi.getMeta(enrollmentId),
        enabled: !!enrollmentId,
    });
}

// ──────────────── Group Hooks ────────────────
export function useGroups(trainingId?: string) {
    return useQuery({
        queryKey: queryKeys.groups.list(trainingId),
        queryFn: () => groupsApi.list(trainingId),
    });
}

export function useGroup(id: string) {
    return useQuery({
        queryKey: queryKeys.groups.detail(id),
        queryFn: () => groupsApi.get(id),
        enabled: !!id,
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: GroupCreateInput) => groupsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        },
    });
}

export function useUpdateGroup(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: GroupUpdateInput) => groupsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(id) });
        },
    });
}

export function useDeleteGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => groupsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        },
    });
}

export function useAddStudentToGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
            groupsApi.addStudent(groupId, studentId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
        },
    });
}

export function useRemoveStudentFromGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
            groupsApi.removeStudent(groupId, studentId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
        },
    });
}

// ──────────────── Attendance Session Hook ────────────────
export function useSessionAttendance(trainingId: string, sessionId: string) {
    return useQuery({
        queryKey: queryKeys.attendance.session(trainingId, sessionId),
        queryFn: () => attendanceApi.getSession(sessionId, trainingId),
        enabled: !!trainingId && !!sessionId,
    });
}

// ──────────────── Seance Hooks ────────────────
export function useSeances(params?: { trainerId?: string; groupId?: string; trainingId?: string; from?: string; to?: string; date?: string }) {
    return useQuery({
        queryKey: queryKeys.seances.list(params as Record<string, string> | undefined),
        queryFn: () => seancesApi.list(params),
    });
}

export function useSeance(id: string) {
    return useQuery({
        queryKey: queryKeys.seances.detail(id),
        queryFn: () => seancesApi.get(id),
        enabled: !!id,
    });
}

export function useMySeances(from?: string, to?: string) {
    return useQuery({
        queryKey: queryKeys.seances.my(from, to),
        queryFn: () => seancesApi.mySeances(from, to),
    });
}

export function useCreateSeance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SeanceCreateInput) => seancesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

export function useUpdateSeance(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<SeanceCreateInput>) => seancesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.detail(id) });
        },
    });
}

export function useUpdateSeanceStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => seancesApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.all });
        },
    });
}

export function useDeleteSeance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => seancesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.all });
        },
    });
}

export function useReportSeance(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SessionReportInput) => seancesApi.report(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.seances.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

export function useSeanceReports(seanceId: string) {
    return useQuery({
        queryKey: queryKeys.seances.reports(seanceId),
        queryFn: () => seancesApi.getReports(seanceId),
        enabled: !!seanceId,
    });
}

export function useTrainerAvailability(trainerId: string, date: string, startTime: string, endTime: string) {
    return useQuery({
        queryKey: queryKeys.seances.availability(trainerId, date, startTime, endTime),
        queryFn: () => seancesApi.checkAvailability(trainerId, date, startTime, endTime),
        enabled: !!trainerId && !!date && !!startTime && !!endTime,
    });
}

// ──────────────── Notification Hooks ────────────────
export function useNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: () => notificationsApi.list(),
    });
}

export function useUnreadNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications.unread(),
        queryFn: () => notificationsApi.unread(),
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: queryKeys.notifications.unreadCount(),
        queryFn: () => notificationsApi.unreadCount(),
        refetchInterval: 30000, // poll every 30s
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationsApi.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationsApi.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

// ──────────────── Trainer Hooks ────────────────
export function useTrainers() {
    return useQuery({
        queryKey: queryKeys.trainers.list(),
        queryFn: () => trainersApi.list(),
    });
}
