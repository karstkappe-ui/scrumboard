'use client';
import { useForm } from 'react-hook-form';
import { useSprintStore } from '@/store/sprintStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { CreateSprintInput, Sprint } from '@/types';

interface CreateSprintModalProps {
  open: boolean;
  onClose: () => void;
  editSprint?: Sprint;
}

export function CreateSprintModal({ open, onClose, editSprint }: CreateSprintModalProps) {
  const { createSprint, updateSprint } = useSprintStore();
  const isEditing = !!editSprint;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateSprintInput>({
    defaultValues: editSprint
      ? { name: editSprint.name, goal: editSprint.goal, startDate: editSprint.startDate, endDate: editSprint.endDate }
      : { name: '', goal: '', startDate: '', endDate: '' },
  });

  const onSubmit = (data: CreateSprintInput) => {
    if (isEditing) {
      updateSprint(editSprint!.id, data);
    } else {
      createSprint(data);
    }
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={isEditing ? 'Edit Sprint' : 'Create Sprint'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)}>
            {isEditing ? 'Save changes' : 'Create sprint'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Sprint Name"
          placeholder="e.g. Sprint 4 — Landing Page"
          error={errors.name?.message}
          {...register('name', { required: 'Sprint name is required' })}
        />
        <Textarea
          label="Sprint Goal"
          placeholder="What does the team aim to achieve in this sprint?"
          rows={2}
          {...register('goal')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate', { required: 'Start date is required' })}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate', { required: 'End date is required' })}
          />
        </div>
      </div>
    </Modal>
  );
}
