import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/utils';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'label'
  | 'caption'
  | 'mono';

// Warm editorial scale — real contrast between display and body, not a uniform ramp.
const VARIANTS: Record<TextVariant, string> = {
  display: 'font-extrabold text-[34px] leading-[38px] tracking-tight text-ink',
  title: 'font-bold text-[26px] leading-[30px] tracking-tight text-ink',
  heading: 'font-semibold text-[19px] leading-[24px] text-ink',
  body: 'font-sans text-[15px] leading-[22px] text-slate',
  label: 'font-semibold text-[13px] leading-[16px] text-ink',
  caption: 'font-medium text-[12px] leading-[15px] text-mute',
  mono: 'font-medium text-[13px] leading-[18px] tracking-wide text-slate',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <RNText className={cn(VARIANTS[variant], className)} {...props} />;
}
