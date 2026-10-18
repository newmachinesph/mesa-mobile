import { useState } from 'react';
// Clipboard is deprecated in RN core but still shipped (and provided by
// react-native-web on web) — using it avoids adding a dependency for one call.
import { Clipboard, Platform, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
import { Check, Copy, ImageUp, Lock, ShieldAlert } from 'lucide-react-native';
import {
  formatDateLong,
  formatPeso,
  formatTime12,
  paymentMethodLabel,
  type Deposit,
  type DepositPolicy,
} from '@/core';
import { Surface, Divider } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Field, TextInput } from '@/components/ui/field';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/ui/button';
import { useMesaStore } from '@/lib/store';

// --- Manila-time stamping (fixed +08:00, no DST — mirrors core/format.ts) ----
const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const HOLD_HOURS = 24;

function manilaStamp(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 8 * 60 * 60 * 1000);
  const dateISO = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  return `${formatDateLong(dateISO)} · ${formatTime12(time)}`;
}

async function copyText(text: string): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    toast.success('Copied');
  } catch {
    toast.error('Could not copy');
  }
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-line bg-paper px-3.5 py-2.5">
      <View className="flex-1">
        <Text variant="caption" className="text-mute">
          {label}
        </Text>
        <Text className="mt-0.5 font-bold text-[15px] text-ink">{value}</Text>
      </View>
      <IconButton icon={Copy} accessibilityLabel={`Copy ${label}`} variant="surface" size={18} onPress={() => copyText(value)} />
    </View>
  );
}

function ProofPreview({ uri }: { uri: string }) {
  return (
    <View className="overflow-hidden rounded-xl border border-line bg-sand">
      <Image source={{ uri }} contentFit="cover" transition={200} style={{ width: '100%', height: 200 }} />
    </View>
  );
}

function MethodChips({ policy }: { policy: DepositPolicy }) {
  return (
    <View>
      <Text variant="caption" className="mb-2 text-mute">
        Accepted payment
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {policy.methods.map((m) => (
          <View key={m} className="rounded-full bg-sand px-3 py-1">
            <Text className="text-[12px] font-semibold text-slate">{paymentMethodLabel(m)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- The reference + screenshot form (awaiting_proof and re-upload) ----------
function ProofForm({
  reservationId,
  deposit,
  submitLabel,
}: {
  reservationId: string;
  deposit: Deposit;
  submitLabel: string;
}) {
  const uploadProof = useMesaStore((s) => s.uploadProof);
  const [reference, setReference] = useState(deposit.reference ?? '');
  const [uri, setUri] = useState<string | undefined>(deposit.proofUri);
  const [refError, setRefError] = useState<string | undefined>();
  const [picking, setPicking] = useState(false);

  const pickImage = async () => {
    setPicking(true);
    try {
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          toast.error('Photo access is needed to upload your proof of payment.');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setUri(result.assets[0].uri);
    } catch {
      toast.error('Could not open your photos. Please try again.');
    } finally {
      setPicking(false);
    }
  };

  const submit = () => {
    const ref = reference.trim();
    if (!ref) {
      setRefError('Enter the reference number from your payment');
      return;
    }
    if (!uri) {
      toast.error('Add a screenshot of your payment first.');
      return;
    }
    uploadProof(reservationId, uri, ref);
    toast.success('Salamat! We got your proof — checking it now.');
  };

  return (
    <View className="gap-3">
      <Field label="Reference number" required error={refError} hint="The GCash / bank reference on your receipt">
        <TextInput
          value={reference}
          onChangeText={(t) => {
            setReference(t);
            if (refError) setRefError(undefined);
          }}
          placeholder="e.g. GC-8817263"
          autoCapitalize="characters"
          error={Boolean(refError)}
        />
      </Field>

      {uri ? (
        <View className="gap-2">
          <ProofPreview uri={uri} />
          <SecondaryButton icon={ImageUp} onPress={pickImage} loading={picking}>
            Choose a different screenshot
          </SecondaryButton>
        </View>
      ) : (
        <SecondaryButton icon={ImageUp} onPress={pickImage} loading={picking}>
          Upload proof of payment
        </SecondaryButton>
      )}

      <PrimaryButton onPress={submit} fullWidth>
        {submitLabel}
      </PrimaryButton>
    </View>
  );
}

// --- Public: renders the right card for the deposit's status -----------------
interface DepositSectionProps {
  deposit: Deposit | undefined;
  policy: DepositPolicy;
  reservationId: string;
  createdAt: string;
}

export function DepositSection({ deposit, policy, reservationId, createdAt }: DepositSectionProps) {
  if (!deposit || deposit.status === 'none') {
    return (
      <Surface className="p-4">
        <Text variant="body" className="text-slate">
          No deposit needed for this booking.
        </Text>
      </Surface>
    );
  }

  if (deposit.status === 'verified') {
    return (
      <Surface className="border-ok/30 bg-ok-bg p-4">
        <View className="flex-row items-center gap-2">
          <Lock size={17} color="#2f8f5b" strokeWidth={2.25} />
          <Text variant="heading" className="text-[16px] text-ok">
            Deposit verified
          </Text>
        </View>
        <Text variant="body" className="mt-1.5 text-slate">
          {formatPeso(deposit.amount)} received and confirmed.
          {deposit.verifiedBy ? ` Verified by ${deposit.verifiedBy}` : ''}
          {deposit.verifiedAt ? ` on ${manilaStamp(deposit.verifiedAt)}.` : '.'}
        </Text>
        {deposit.reference ? (
          <Text variant="caption" className="mt-2 text-mute">
            Reference {deposit.reference}
          </Text>
        ) : null}
      </Surface>
    );
  }

  if (deposit.status === 'forfeited') {
    return (
      <Surface className="border-danger/30 bg-danger-bg p-4">
        <View className="flex-row items-center gap-2">
          <ShieldAlert size={17} color="#b3261e" strokeWidth={2.25} />
          <Text variant="heading" className="text-[16px] text-danger">
            Deposit forfeited
          </Text>
        </View>
        <Text variant="body" className="mt-1.5 text-slate">
          The {formatPeso(deposit.amount)} deposit was forfeited due to a no-show. It is non-refundable and cannot be
          restored.
        </Text>
      </Surface>
    );
  }

  if (deposit.status === 'pending_review') {
    return (
      <Surface className="p-4">
        <View className="flex-row items-center gap-2">
          <Check size={17} color="#2f5f8f" strokeWidth={2.25} />
          <Text variant="heading" className="text-[16px] text-info">
            We&apos;re checking your payment
          </Text>
        </View>
        <Text variant="body" className="mt-1.5 text-slate">
          Usually within an hour. We&apos;ll confirm your table once the {formatPeso(deposit.amount)} deposit clears.
        </Text>

        {deposit.proofUri ? (
          <View className="mt-3">
            <ProofPreview uri={deposit.proofUri} />
          </View>
        ) : null}
        {deposit.reference ? (
          <Text variant="caption" className="mt-2 text-mute">
            Reference {deposit.reference}
            {deposit.uploadedAt ? ` · sent ${manilaStamp(deposit.uploadedAt)}` : ''}
          </Text>
        ) : null}

        <Divider className="my-4" />
        <Text variant="label" className="mb-2.5 text-slate">
          Sent the wrong screenshot? Replace it below.
        </Text>
        <ProofForm reservationId={reservationId} deposit={deposit} submitLabel="Re-upload proof" />
      </Surface>
    );
  }

  // awaiting_proof — the core PH ritual.
  const heldUntil = manilaStamp(new Date(new Date(createdAt).getTime() + HOLD_HOURS * 60 * 60 * 1000).toISOString());

  return (
    <Surface className="p-4">
      <View className="flex-row items-baseline justify-between">
        <Text variant="heading" className="text-[16px]">
          Deposit due
        </Text>
        <Text variant="title" className="text-[24px] text-terracotta">
          {formatPeso(deposit.amount)}
        </Text>
      </View>

      <Text variant="body" className="mt-2 text-slate">
        Send your deposit via GCash, then upload a screenshot of the proof of payment with its reference number to
        confirm your table.
      </Text>

      <View className="mt-3 gap-2">
        <CopyField label="GCash number" value={policy.gcashNumber} />
        <CopyField label="Account name" value={policy.gcashName} />
      </View>

      <View className="mt-4">
        <MethodChips policy={policy} />
      </View>

      <View className="mt-3.5 rounded-xl bg-warn-bg px-3.5 py-3">
        <Text variant="caption" className="font-semibold text-warn">
          Held until {heldUntil}
        </Text>
        <Text variant="caption" className="mt-1 text-slate">
          Send your deposit before then or the table is released.
        </Text>
        {policy.nonRefundable ? (
          <Text variant="caption" className="mt-1 text-slate">
            This deposit is non-refundable and goes toward your bill on the night.
          </Text>
        ) : null}
      </View>

      <Divider className="my-4" />
      <ProofForm reservationId={reservationId} deposit={deposit} submitLabel="Submit proof of payment" />
    </Surface>
  );
}
