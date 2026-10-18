import { type ReactNode, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { isValidPhMobile, toE164 } from '@/core';
import { Text } from './text';
import { IconButton } from './button';
import { cn } from '@/lib/utils';

const PLACEHOLDER = '#9c9486';

// --- Field wrapper: label + control + error/hint ----------------------------
export interface FieldProps {
  children: ReactNode;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}
export function Field({ children, label, hint, error, required, className }: FieldProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      {label ? (
        <Text variant="label" className="text-slate">
          {label}
          {required ? <Text className="text-terracotta"> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" className="text-mute">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

// --- Text inputs ------------------------------------------------------------
export interface TextInputProps extends RNTextInputProps {
  error?: boolean;
  className?: string;
}
export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { error, className, ...props },
  ref,
) {
  return (
    <RNTextInput
      ref={ref}
      placeholderTextColor={PLACEHOLDER}
      className={cn(
        'h-12 rounded-xl border bg-chalk px-4 font-sans text-[15px] text-ink',
        error ? 'border-danger' : 'border-line',
        className,
      )}
      {...props}
    />
  );
});

export interface TextAreaProps extends RNTextInputProps {
  error?: boolean;
  className?: string;
}
export const TextArea = forwardRef<RNTextInput, TextAreaProps>(function TextArea(
  { error, className, ...props },
  ref,
) {
  return (
    <RNTextInput
      ref={ref}
      multiline
      textAlignVertical="top"
      placeholderTextColor={PLACEHOLDER}
      className={cn(
        'min-h-[96px] rounded-xl border bg-chalk px-4 py-3 font-sans text-[15px] leading-[22px] text-ink',
        error ? 'border-danger' : 'border-line',
        className,
      )}
      {...props}
    />
  );
});

// --- PhoneField: +63 prefix, formats 0917 123 4567, validates PH mobile -----
function nationalDigits(value: string): string {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('63')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10); // national significant number (9XXXXXXXXX)
}
function toDisplay(national: string): string {
  if (!national) return '';
  const full = `0${national}`;
  return [full.slice(0, 4), full.slice(4, 7), full.slice(7, 11)].filter(Boolean).join(' ');
}

export interface PhoneFieldProps {
  value: string; // E.164, e.g. '+639171234567' (or '' when empty)
  onChangeText: (e164: string) => void;
  label?: string;
  error?: string;
}
export function PhoneField({ value, onChangeText, label, error }: PhoneFieldProps) {
  const national = nationalDigits(value);
  const showError =
    error ?? (value.length > 0 && !isValidPhMobile(value) ? 'Enter a valid PH mobile number' : undefined);

  const handleChange = (text: string) => {
    const nat = nationalDigits(text);
    onChangeText(nat ? toE164(`0${nat}`) : '');
  };

  return (
    <Field label={label} error={showError}>
      <View
        className={cn(
          'h-12 flex-row items-center rounded-xl border bg-chalk pl-3',
          showError ? 'border-danger' : 'border-line',
        )}
      >
        <Text className="font-semibold text-[15px] text-slate">+63</Text>
        <View className="ml-3 mr-3 h-6 w-px bg-line" />
        <RNTextInput
          value={toDisplay(national)}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          placeholder="917 123 4567"
          placeholderTextColor={PLACEHOLDER}
          maxLength={13}
          className="h-12 flex-1 pr-4 font-sans text-[15px] text-ink"
        />
      </View>
    </Field>
  );
}

// --- PartySizeStepper -------------------------------------------------------
export interface PartySizeStepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}
export function PartySizeStepper({ value, onChange, min = 1, max = 20 }: PartySizeStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-line bg-chalk px-3 py-2.5">
      <IconButton icon={Minus} accessibilityLabel="Fewer guests" variant="surface" onPress={dec} disabled={value <= min} />
      <View className="flex-row items-baseline gap-1.5">
        <Text className="font-extrabold text-[26px] leading-[28px] text-ink">{value}</Text>
        <Text variant="body" className="text-mute">
          {value === 1 ? 'guest' : 'guests'}
        </Text>
      </View>
      <IconButton icon={Plus} accessibilityLabel="More guests" variant="surface" onPress={inc} disabled={value >= max} />
    </View>
  );
}
