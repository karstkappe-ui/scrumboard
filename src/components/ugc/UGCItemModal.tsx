'use client';
import { useState, useEffect } from 'react';
import {
  Film,
  LayoutGrid,
  FileImage,
  BookOpen,
  Video,
  Clapperboard,
  Instagram,
  Youtube,
  Globe,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useUGCStore, type UGCItem, type UGCType, type UGCPlatform, type UGCStatus } from '@/store/ugcStore';

interface UGCItemModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  editItem?: UGCItem | null;
}

const TYPE_OPTIONS: { value: UGCType; label: string; icon: React.ReactNode }[] = [
  { value: 'reel', label: 'Reel', icon: <Film size={14} /> },
  { value: 'carousel', label: 'Carousel', icon: <LayoutGrid size={14} /> },
  { value: 'post', label: 'Post', icon: <FileImage size={14} /> },
  { value: 'story', label: 'Story', icon: <BookOpen size={14} /> },
  { value: 'video', label: 'Video', icon: <Video size={14} /> },
  { value: 'ugc_video', label: 'UGC Video', icon: <Clapperboard size={14} /> },
];

const PLATFORM_OPTIONS: { value: UGCPlatform; label: string; icon: React.ReactNode }[] = [
  { value: 'instagram', label: 'Instagram', icon: <Instagram size={14} /> },
  { value: 'tiktok', label: 'TikTok', icon: <span className="text-xs font-black">T</span> },
  { value: 'youtube', label: 'YouTube', icon: <Youtube size={14} /> },
  { value: 'alle', label: 'Alle', icon: <Globe size={14} /> },
];

const STATUS_OPTIONS: { value: UGCStatus; label: string; color: string; dot: string }[] = [
  { value: 'idee', label: 'Idee', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
  { value: 'gepland', label: 'Gepland', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'in_productie', label: 'In productie', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'klaar', label: 'Klaar', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'gepubliceerd', label: 'Gepubliceerd', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
];

export function UGCItemModal({ open, onClose, defaultDate, editItem }: UGCItemModalProps) {
  const { addItem, updateItem, deleteItem } = useUGCStore();

  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [type, setType] = useState<UGCType>('reel');
  const [platform, setPlatform] = useState<UGCPlatform>('instagram');
  const [status, setStatus] = useState<UGCStatus>('idee');
  const [creator, setCreator] = useState('');
  const [notes, setNotes] = useState('');
  const [titleError, setTitleError] = useState('');

  const isEditing = !!editItem;

  useEffect(() => {
    if (open) {
      if (editItem) {
        setDate(editItem.date);
        setTitle(editItem.title);
        setType(editItem.type);
        setPlatform(editItem.platform);
        setStatus(editItem.status);
        setCreator(editItem.creator ?? '');
        setNotes(editItem.notes ?? '');
      } else {
        setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
        setTitle('');
        setType('reel');
        setPlatform('instagram');
        setStatus('idee');
        setCreator('');
        setNotes('');
      }
      setTitleError('');
    }
  }, [open, editItem, defaultDate]);

  function handleSave() {
    if (!title.trim()) {
      setTitleError('Vul een titel in');
      return;
    }
    const payload = {
      date,
      title: title.trim(),
      type,
      platform,
      status,
      creator: creator.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEditing && editItem) {
      updateItem(editItem.id, payload);
    } else {
      addItem(payload);
    }
    onClose();
  }

  function handleDelete() {
    if (editItem) {
      deleteItem(editItem.id);
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Item bewerken' : 'Nieuw UGC item'}
      size="md"
      footer={
        <>
          {isEditing && (
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />} onClick={handleDelete} className="mr-auto">
              Verwijderen
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuleren
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {isEditing ? 'Opslaan' : 'Toevoegen'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Date */}
        <Input
          label="Datum"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Title */}
        <Input
          label="Titel"
          placeholder="Bijv. Productreview zomercollectie"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
          error={titleError}
        />

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700">Type</span>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                  type === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700">Platform</span>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPlatform(opt.value)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                  platform === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                  status === opt.value
                    ? `${opt.color} ring-2 ring-offset-1 ring-indigo-400`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full flex-shrink-0', opt.dot)} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Creator */}
        <Input
          label="Creator (optioneel)"
          placeholder="Naam van de UGC creator"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
        />

        {/* Notes */}
        <Textarea
          label="Notities (optioneel)"
          placeholder="Extra info, briefing, links…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
