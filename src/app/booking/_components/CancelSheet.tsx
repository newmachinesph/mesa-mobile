import { View } from 'react-native';
import { AppBottomSheet } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { PrimaryButton, GhostButton } from '@/components/ui/button';

interface CancelSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  showRefundWarning: boolean;
}

export function CancelSheet({ open, onClose, onConfirm, showRefundWarning }: CancelSheetProps) {
  return (
    <AppBottomSheet open={open} onClose={onClose} title="Cancel this booking?">
      <Text variant="body" className="text-slate">
        Your table will be released and this can&apos;t be undone.
      </Text>

      {showRefundWarning ? (
        <View className="mt-3 rounded-xl bg-danger-bg px-3.5 py-3">
          <Text variant="caption" className="font-semibold text-danger">
            Your verified deposit is non-refundable
          </Text>
          <Text variant="caption" className="mt-1 text-slate">
            Cancelling now means the deposit you already paid will not be returned.
          </Text>
        </View>
      ) : null}

      <View className="mt-5 gap-2">
        <PrimaryButton className="bg-danger" onPress={onConfirm} fullWidth>
          Yes, cancel booking
        </PrimaryButton>
        <GhostButton onPress={onClose} fullWidth>
          Keep my booking
        </GhostButton>
      </View>
    </AppBottomSheet>
  );
}
