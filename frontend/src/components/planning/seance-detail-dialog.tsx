'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Seance } from '@/lib/types';
import { Clock, MapPin, Users, User, BookOpen, Pencil, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  REPORTED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

interface SeanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seance: Seance | null;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function SeanceDetailDialog({ open, onOpenChange, seance, canManage, onEdit, onDelete }: SeanceDetailDialogProps) {
  const t = useTranslations('planning');
  const tc = useTranslations('common');

  if (!seance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {seance.title || seance.trainingTitle}
            <Badge className={STATUS_COLORS[seance.status] ?? ''}>{t(`status_${seance.status}`)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{seance.date} · {seance.startTime} – {seance.endTime}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            <span>{seance.trainingTitle} — {t('level')} {seance.levelNumber}, {t('sessionNum')} {seance.sessionNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{seance.groupName || t('noGroup')}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>{seance.trainerName || t('noTrainer')}</span>
          </div>
        </div>

        {canManage && (
          <div className="flex justify-end gap-2 pt-3 border-t dark:border-gray-700">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 me-1.5" /> {tc('edit')}
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 me-1.5" /> {tc('delete')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
