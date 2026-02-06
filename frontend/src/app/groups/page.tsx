'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/layout/states';
import { FormField } from '@/components/layout/form-field';
import { useToast } from '@/components/ui/toast';
import {
  useGroups,
  useTrainings,
  useCreateGroup,
  useDeleteGroup,
} from '@/lib/hooks';
import { groupCreateSchema, type GroupCreateFormData } from '@/lib/validators';
import { useAuth, canManageTrainings } from '@/lib/auth-provider';
import {
  Plus,
  Trash2,
  UsersRound,
  Clock,
  Calendar,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export default function GroupsPage() {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const { addToast } = useToast();
  const { user } = useAuth();
  const canManage = canManageTrainings(user);

  const [selectedTraining, setSelectedTraining] = useState('');
  const { data: trainings, isLoading: trainingsLoading } = useTrainings();
  const {
    data: groups,
    isLoading: groupsLoading,
    error,
    refetch,
  } = useGroups(selectedTraining && selectedTraining !== '__all__' ? selectedTraining : undefined);

  const createMutation = useCreateGroup();
  const deleteMutation = useDeleteGroup();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupCreateFormData>({
    resolver: zodResolver(groupCreateSchema),
  });

  useEffect(() => {
    if (showCreate) {
      reset({
        name: '',
        trainingId: selectedTraining && selectedTraining !== '__all__' ? selectedTraining : '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        studentIds: [],
      });
    }
  }, [showCreate, selectedTraining, reset]);

  const onCreateSubmit = async (data: GroupCreateFormData) => {
    try {
      await createMutation.mutateAsync(data);
      addToast(t('createSuccess'), 'success');
      setShowCreate(false);
    } catch {
      addToast(tc('error'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addToast(t('deleteSuccess'), 'success');
      setDeleteId(null);
    } catch {
      addToast(tc('error'), 'error');
    }
  };

  const getDayLabel = (day?: string) => {
    if (!day) return '—';
    const dayMap: Record<string, string> = {
      MONDAY: t('monday'),
      TUESDAY: t('tuesday'),
      WEDNESDAY: t('wednesday'),
      THURSDAY: t('thursday'),
      FRIDAY: t('friday'),
      SATURDAY: t('saturday'),
      SUNDAY: t('sunday'),
    };
    return dayMap[day] ?? day;
  };

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        {canManage && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('addGroup')}
          </Button>
        )}
      </div>

      {/* Filter by training */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('training')}
            </label>
            {trainingsLoading ? (
              <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            ) : (
              <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                <SelectTrigger aria-label={t('training')}>
                  <SelectValue placeholder={tc('all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{tc('all')}</SelectItem>
                  {trainings?.map((tr) => (
                    <SelectItem key={tr.id} value={tr.id}>
                      {tr.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Groups list */}
      {groupsLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !groups || groups.length === 0 ? (
        <EmptyState
          title={t('noGroups')}
          description={t('noGroupsDesc')}
          icon={<UsersRound className="h-12 w-12" />}
          action={
            canManage
              ? { label: t('addGroup'), onClick: () => setShowCreate(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="group relative">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <UsersRound className="h-5 w-5 text-sky-600" aria-hidden="true" />
                    {group.name}
                  </span>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(group.id)}
                      className="text-red-500 opacity-0 transition-opacity hover:text-red-700 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.trainingTitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {group.trainingTitle}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {group.dayOfWeek && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {getDayLabel(group.dayOfWeek)}
                    </Badge>
                  )}
                  {group.startTime && group.endTime && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {group.startTime} – {group.endTime}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('studentsCount', { count: group.studentCount })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addGroup')}</DialogTitle>
            <DialogDescription>{t('noGroupsDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <FormField label={t('groupName')} name="name" error={errors.name}>
              <Input {...register('name')} id="name" placeholder={t('groupName')} />
            </FormField>

            <FormField label={t('training')} name="trainingId" error={errors.trainingId}>
              <Select
                value={watch('trainingId') || ''}
                onValueChange={(v) => setValue('trainingId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('training')} />
                </SelectTrigger>
                <SelectContent>
                  {trainings?.map((tr) => (
                    <SelectItem key={tr.id} value={tr.id}>
                      {tr.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('dayOfWeek')} name="dayOfWeek">
              <Select
                value={watch('dayOfWeek') || ''}
                onValueChange={(v) => setValue('dayOfWeek', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dayOfWeek')} />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {getDayLabel(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('startTime')} name="startTime">
                <Input type="time" id="startTime" {...register('startTime')} />
              </FormField>
              <FormField label={t('endTime')} name="endTime">
                <Input type="time" id="endTime" {...register('endTime')} />
              </FormField>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {tc('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tc('confirm')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {tc('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {tc('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
