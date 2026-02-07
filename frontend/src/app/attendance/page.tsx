'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  useTrainings,
  useTrainingEnrollments,
  useMarkAttendance,
  useGroups,
  useSessionAttendance,
  useReassignGroup,
} from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState, LoadingSkeleton } from '@/components/layout/states';
import { useToast } from '@/components/ui/toast';
import { todayISO } from '@/lib/utils';
import type { AttendanceStatus, Training, Level, Session } from '@/lib/types';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  AlertTriangle,
  CalendarDays,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth, canMarkAttendance } from '@/lib/auth-provider';

interface AttendanceRow {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  autoExcused: boolean;
  enrollmentId: string;
}

export default function AttendancePage() {
  const t = useTranslations('attendance');
  const tc = useTranslations('common');
  const tt = useTranslations('trainings');
  const tg = useTranslations('groups');
  const { addToast } = useToast();
  const searchParams = useSearchParams();

  const { user } = useAuth();
  const canMark = canMarkAttendance(user);

  const { data: trainings, isLoading: trainingsLoading } = useTrainings();
  const markMutation = useMarkAttendance();
  const reassignMutation = useReassignGroup();

  const [selectedTraining, setSelectedTraining] = useState(searchParams.get('trainingId') || '');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [confirmBulk, setConfirmBulk] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED' | null>(null);
  const [reassignStudent, setReassignStudent] = useState<{ studentId: string; studentName: string; enrollmentId: string } | null>(null);
  const [reassignTargetGroup, setReassignTargetGroup] = useState('');

  // Derived data
  const training: Training | undefined = trainings?.find((tr) => tr.id === selectedTraining);

  // Fetch groups for the selected training
  const { data: groups } = useGroups(selectedTraining || undefined);

  const levels: Level[] = training?.levels?.length
    ? training.levels
    : selectedTraining
    ? Array.from({ length: 4 }, (_, i) => ({
        levelNumber: i + 1,
        sessions: Array.from({ length: 6 }, (_, j) => ({
          sessionId: `session-${i + 1}-${j + 1}`,
          sessionNumber: j + 1,
        })),
      }))
    : [];

  const level: Level | undefined = levels.find((l) => String(l.levelNumber) === selectedLevel);
  const sessions: Session[] = level?.sessions ?? [];
  const session: Session | undefined = sessions.find((s) => s.sessionId === selectedSession);

  // Fetch enrolled students for the selected training
  const { data: enrollments, isLoading: enrollmentsLoading } = useTrainingEnrollments(selectedTraining);

  // Fetch existing attendance for the selected session
  const { data: sessionAttendance } = useSessionAttendance(selectedTraining, selectedSession);

  // Filter enrollments by group if a group is selected
  const filteredEnrollments = enrollments?.filter((e) => {
    if (!selectedGroup || selectedGroup === '__all__') return true;
    return e.groupId === selectedGroup;
  });

  // Records state for attendance marking
  const [records, setRecords] = useState<AttendanceRow[]>([]);

  // Build records from enrollments + existing attendance for a given session
  const buildRecordsForSession = useCallback((sessionId: string) => {
    if (!filteredEnrollments) {
      setRecords([]);
      return;
    }

    const newRecords: AttendanceRow[] = filteredEnrollments.map((e) => {
      const existingEntry = e.attendance?.[sessionId];
      const existingFromApi = sessionAttendance?.find((sa) => sa.studentId === e.studentId);

      let status: AttendanceStatus = 'PRESENT';
      let autoExcused = false;

      if (existingEntry) {
        status = existingEntry.status;
        autoExcused = existingEntry.status === 'EXCUSED';
      } else if (existingFromApi && existingFromApi.status) {
        status = existingFromApi.status;
        autoExcused = existingFromApi.status === 'EXCUSED';
      }

      return {
        studentId: e.studentId,
        studentName: e.student
          ? `${e.student.firstName} ${e.student.lastName}`
          : e.studentId,
        status,
        autoExcused,
        enrollmentId: e.id,
      };
    });
    setRecords(newRecords);
  }, [filteredEnrollments, sessionAttendance]);

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
    buildRecordsForSession(sessionId);
  };

  // Toggle single student status
  const toggleStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, status: newStatus, autoExcused: false } : r
      )
    );
  };

  // Bulk status change
  const handleBulkChange = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status, autoExcused: false })));
    setConfirmBulk(null);
  };

  // Submit
  const handleSubmit = async () => {
    if (!selectedTraining || !selectedSession) return;
    try {
      await markMutation.mutateAsync({
        trainingId: selectedTraining,
        sessionId: selectedSession,
        date: todayISO(),
        records: records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
        })),
      });
      addToast(t('attendanceMarked'), 'success');
    } catch {
      addToast(tc('error'), 'error');
    }
  };

  // Format session date/time
  const formatSessionDate = (s: Session | undefined) => {
    if (!s?.plannedAt) return null;
    try {
      const date = new Date(s.plannedAt);
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formatSessionTime = (s: Session | undefined) => {
    if (!s?.plannedAt) return null;
    try {
      const date = new Date(s.plannedAt);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('title')}
      </h1>

      {/* Step 1: Select training / group / level / session */}
      <Card>
        <CardHeader>
          <CardTitle>{t('markAttendance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Training */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('selectTraining')}
              </label>
              {trainingsLoading ? (
                <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ) : (
                <Select
                  value={selectedTraining}
                  onValueChange={(v) => {
                    setSelectedTraining(v);
                    setSelectedGroup('');
                    setSelectedLevel('');
                    setSelectedSession('');
                    setRecords([]);
                  }}
                >
                  <SelectTrigger aria-label={t('selectTraining')}>
                    <SelectValue placeholder={t('selectTraining')} />
                  </SelectTrigger>
                  <SelectContent>
                    {trainings?.map((tr) => (
                      <SelectItem key={tr.id} value={tr.id}>
                        {tr.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Group (optional filter) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('selectGroup')}
              </label>
              <Select
                value={selectedGroup}
                onValueChange={(v) => {
                  setSelectedGroup(v);
                  setRecords([]);
                }}
                disabled={!selectedTraining}
              >
                <SelectTrigger aria-label={t('selectGroup')}>
                  <SelectValue placeholder={t('selectGroup')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{tc('all')}</SelectItem>
                  {groups?.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('selectLevel')}
              </label>
              <Select
                value={selectedLevel}
                onValueChange={(v) => {
                  setSelectedLevel(v);
                  setSelectedSession('');
                  setRecords([]);
                }}
                disabled={!selectedTraining}
              >
                <SelectTrigger aria-label={t('selectLevel')}>
                  <SelectValue placeholder={t('selectLevel')} />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.levelNumber} value={String(l.levelNumber)}>
                      {tt('level')} {l.levelNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('selectSession')}
              </label>
              <Select
                value={selectedSession}
                onValueChange={handleSessionSelect}
                disabled={!selectedLevel}
              >
                <SelectTrigger aria-label={t('selectSession')}>
                  <SelectValue placeholder={t('selectSession')} />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.sessionId} value={s.sessionId}>
                      <span className="flex items-center gap-2">
                        {tt('session')} {s.sessionNumber}
                        {s.plannedAt && (
                          <span className="text-xs text-gray-400">
                            ({new Date(s.plannedAt).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session date/time info */}
          {session && (session.plannedAt || session.title) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {session.title && (
                <Badge variant="outline" className="gap-1 text-sm">
                  {session.title}
                </Badge>
              )}
              {formatSessionDate(session) && (
                <Badge variant="outline" className="gap-1 text-sm">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatSessionDate(session)}
                </Badge>
              )}
              {formatSessionTime(session) && (
                <Badge variant="outline" className="gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatSessionTime(session)}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Mark attendance */}
      {selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>{t('studentList')}</span>
              {canMark && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmBulk('PRESENT')}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                    {t('markAllPresent')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmBulk('ABSENT')}
                  >
                    <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                    {t('markAllAbsent')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmBulk('EXCUSED')}
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    {t('markAllExcused')}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {enrollmentsLoading ? (
              <div className="p-6">
                <LoadingSkeleton rows={4} />
              </div>
            ) : records.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title={t('noEnrollments')}
                  description={t('noEnrollmentsDesc')}
                  icon={<Users className="h-12 w-12" />}
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableCaption>
                    {t('sessionCaption', { session: session?.sessionNumber ?? '' })}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{t('student')}</TableHead>
                      <TableHead scope="col">{t('statusCol')}</TableHead>
                      <TableHead scope="col">{t('notes')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.studentId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                              aria-hidden="true"
                            >
                              {record.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="font-medium">{record.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <fieldset>
                            <legend className="sr-only">
                              {t('statusCol')} – {record.studentName}
                            </legend>
                            <div
                              className="flex gap-2"
                              role="radiogroup"
                              aria-label={`${t('statusCol')} ${record.studentName}`}
                            >
                              <StatusButton
                                label={tc('present')}
                                active={record.status === 'PRESENT'}
                                variant="success"
                                onClick={() => toggleStatus(record.studentId, 'PRESENT')}
                                disabled={!canMark}
                              />
                              <StatusButton
                                label={tc('absent')}
                                active={record.status === 'ABSENT'}
                                variant="danger"
                                onClick={() => toggleStatus(record.studentId, 'ABSENT')}
                                disabled={!canMark}
                              />
                              <StatusButton
                                label={tc('excused')}
                                active={record.status === 'EXCUSED'}
                                variant="warning"
                                onClick={() => toggleStatus(record.studentId, 'EXCUSED')}
                                disabled={!canMark}
                              />
                            </div>
                          </fieldset>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.autoExcused && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              >
                                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                {t('autoExcused')}
                              </Badge>
                            )}
                            {record.status === 'ABSENT' && canMark && groups && groups.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => {
                                  setReassignStudent({
                                    studentId: record.studentId,
                                    studentName: record.studentName,
                                    enrollmentId: record.enrollmentId,
                                  });
                                  setReassignTargetGroup('');
                                }}
                              >
                                <ArrowRightLeft className="h-3 w-3" aria-hidden="true" />
                                {t('reassignGroup')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
                  <Button
                    onClick={handleSubmit}
                    disabled={markMutation.isPending || !canMark}
                    className="min-w-[200px]"
                  >
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    {t('submitAttendance')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk confirm dialog */}
      <Dialog open={!!confirmBulk} onOpenChange={() => setConfirmBulk(null)}>
        <DialogContent aria-labelledby="bulk-confirm-title">
          <DialogHeader>
            <DialogTitle id="bulk-confirm-title">{tc('confirm')}</DialogTitle>
            <DialogDescription>{t('confirmBulk')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBulk(null)}>
              {tc('cancel')}
            </Button>
            <Button onClick={() => confirmBulk && handleBulkChange(confirmBulk)}>
              {tc('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign group dialog */}
      <Dialog open={!!reassignStudent} onOpenChange={() => setReassignStudent(null)}>
        <DialogContent aria-labelledby="reassign-title">
          <DialogHeader>
            <DialogTitle id="reassign-title">{t('reassignGroup')}</DialogTitle>
            <DialogDescription>
              {t('reassignGroupDesc', { student: reassignStudent?.studentName ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reassignTargetGroup')}
              </label>
              <Select
                value={reassignTargetGroup}
                onValueChange={setReassignTargetGroup}
              >
                <SelectTrigger aria-label={t('reassignTargetGroup')}>
                  <SelectValue placeholder={tg('selectGroup')} />
                </SelectTrigger>
                <SelectContent>
                  {groups
                    ?.filter((g) => g.id !== selectedGroup)
                    .map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                        {g.dayOfWeek && g.startTime && (
                          <span className="text-xs text-gray-400 ml-2">
                            ({g.dayOfWeek} {g.startTime})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignStudent(null)}>
              {tc('cancel')}
            </Button>
            <Button
              disabled={!reassignTargetGroup || reassignMutation.isPending}
              onClick={async () => {
                if (!reassignStudent || !reassignTargetGroup) return;
                try {
                  await reassignMutation.mutateAsync({
                    enrollmentId: reassignStudent.enrollmentId,
                    newGroupId: reassignTargetGroup,
                  });
                  addToast(t('reassignSuccess'), 'success');
                  setReassignStudent(null);
                } catch {
                  addToast(tc('error'), 'error');
                }
              }}
            >
              {tc('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusButton({
  label,
  active,
  variant,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  variant: 'success' | 'danger' | 'warning';
  onClick: () => void;
  disabled?: boolean;
}) {
  const colors = {
    success: active
      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
      : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    danger: active
      ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
      : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    warning: active
      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700'
      : 'bg-white text-gray-500 border-gray-200 hover:bg-amber-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
  };

  const icons = {
    success: <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />,
    danger: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
    warning: <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />,
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${colors[variant]}`}
    >
      {icons[variant]}
      {label}
    </button>
  );
}
