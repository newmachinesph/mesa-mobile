import { View } from 'react-native';
import { Check, Clock, Sparkles, X, type LucideIcon } from 'lucide-react-native';
import {
  statusLabel,
  statusTone,
  depositStatusLabel,
  depositStatusTone,
  type ReservationStatus,
  type DepositStatus,
  type Occasion,
  type GuestTag,
  type Tone,
  type AvailabilityLevel,
} from '@/core';
import { Text } from './text';
import { cn } from '@/lib/utils';

// Tone -> chip styling. brass/neutral have no *-bg token, so they use literals.
const TONE_STYLES: Record<Tone, { bg: string; text: string; hex: string }> = {
  ok: { bg: 'bg-ok-bg', text: 'text-ok', hex: '#2f8f5b' },
  warn: { bg: 'bg-warn-bg', text: 'text-warn', hex: '#b5730f' },
  danger: { bg: 'bg-danger-bg', text: 'text-danger', hex: '#b3261e' },
  info: { bg: 'bg-info-bg', text: 'text-info', hex: '#2f5f8f' },
  brass: { bg: 'bg-[#f5e9d2]', text: 'text-brass', hex: '#c9973f' },
  neutral: { bg: 'bg-sand', text: 'text-slate', hex: '#3a372f' },
};

interface PillProps {
  tone: Tone;
  label: string;
  icon?: LucideIcon;
  className?: string;
}
function Pill({ tone, label, icon: Icon, className }: PillProps) {
  const s = TONE_STYLES[tone];
  return (
    <View className={cn('flex-row items-center gap-1 self-start rounded-full px-2.5 py-1', s.bg, className)}>
      {Icon ? <Icon size={12} color={s.hex} strokeWidth={2.5} /> : null}
      <Text className={cn('font-bold text-[11px] leading-[13px]', s.text)}>{label}</Text>
    </View>
  );
}

export function StatusPill({ status, className }: { status: ReservationStatus; className?: string }) {
  return <Pill tone={statusTone(status)} label={statusLabel(status)} className={className} />;
}

export function DepositPill({ status, className }: { status: DepositStatus; className?: string }) {
  return <Pill tone={depositStatusTone(status)} label={depositStatusLabel(status)} className={className} />;
}

const OCCASION_LABELS: Record<Occasion, string> = {
  birthday: 'Birthday',
  debut: 'Debut',
  anniversary: 'Anniversary',
  christening: 'Christening',
  graduation: 'Graduation',
  despedida: 'Despedida',
  blowout: 'Blowout',
  other: 'Celebration',
};
export function OccasionChip({ occasion, className }: { occasion: Occasion; className?: string }) {
  return <Pill tone="brass" label={OCCASION_LABELS[occasion]} icon={Sparkles} className={className} />;
}

export function TagChip({ tag, className }: { tag: GuestTag; className?: string }) {
  return <Pill tone={tag.tone} label={tag.label} className={className} />;
}

const AVAILABILITY: Record<AvailabilityLevel, { tone: Tone; label: string; icon: LucideIcon }> = {
  available: { tone: 'ok', label: 'Available', icon: Check },
  tight: { tone: 'warn', label: 'Few left', icon: Clock },
  unavailable: { tone: 'danger', label: 'Fully booked', icon: X },
};
export function AvailabilityBadge({ level, className }: { level: AvailabilityLevel; className?: string }) {
  const a = AVAILABILITY[level];
  return <Pill tone={a.tone} label={a.label} icon={a.icon} className={className} />;
}
