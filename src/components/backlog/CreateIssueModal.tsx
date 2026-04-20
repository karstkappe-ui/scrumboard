'use client';
import { useForm } from 'react-hook-form';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { ISSUE_TYPES, PRIORITIES, STORY_POINTS, ISSUE_STATUSES } from '@/lib/constants';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { CreateIssueInput, Issue } from '@/types';

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  defaultSprintId?: string;
  editIssue?: Issue;
}

export function CreateIssueModal({ open, onClose, defaultSprintId, editIssue }: CreateIssueModalProps) {
  const { createIssue, updateIssue } = useIssueStore();
  const { getAllSprints } = useSprintStore();
  const isEditing = !!editIssue;

  const sprints = getAllSprints().filter((s) => s.status !== 'completed');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateIssueInput>({
    defaultValues: editIssue
      ? {
          title: editIssue.title,
          description: editIssue.description,
          type: editIssue.type,
          priority: editIssue.priority,
          status: editIssue.status,
          assigneeId: editIssue.assigneeId,
          sprintId: editIssue.sprintId,
          storyPoints: editIssue.storyPoints,
          acceptanceCriteria: editIssue.acceptanceCriteria,
        }
      : {
          type: 'story',
          priority: 'medium',
          status: 'backlog',
          sprintId: defaultSprintId ?? '',
        },
  });

  const onSubmit = (data: CreateIssueInput) => {
    const clean = {
      ...data,
      sprintId: data.sprintId || undefined,
      assigneeId: data.assigneeId || undefined,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : undefined,
    };
    if (isEditing) {
      updateIssue(editIssue!.id, clean);
    } else {
      createIssue(clean);
    }
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={isEditing ? 'Edit Issue' : 'Create Issue'}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)}>
            {isEditing ? 'Save changes' : 'Create issue'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={ISSUE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            {...register('type', { required: true })}
          />
          <Select
            label="Priority"
            options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
            {...register('priority', { required: true })}
          />
        </div>

        <Input
          label="Title"
          placeholder="Enter issue title…"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />

        <Textarea
          label="Description"
          placeholder="Describe the issue in detail…"
          rows={3}
          {...register('description')}
        />

        <Textarea
          label="Acceptance Criteria"
          placeholder="- Criterion 1&#10;- Criterion 2"
          rows={3}
          {...register('acceptanceCriteria')}
        />

        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Status"
            options={ISSUE_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            {...register('status')}
          />
          <Select
            label="Assignee"
            placeholder="Unassigned"
            options={MOCK_USERS.map((u) => ({ value: u.id, label: u.name }))}
            {...register('assigneeId')}
          />
          <Select
            label="Story Points"
            placeholder="—"
            options={STORY_POINTS.map((p) => ({ value: String(p), label: String(p) }))}
            {...register('storyPoints')}
          />
        </div>

        <Select
          label="Sprint"
          placeholder="Product Backlog (no sprint)"
          options={sprints.map((s) => ({ value: s.id, label: s.name }))}
          {...register('sprintId')}
        />
      </div>
    </Modal>
  );
}
