import { type ReactNode, useCallback, useRef } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Text } from './text';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: (string | number)[];
}

// A gorhom bottom sheet on native; a plain bottom-anchored Modal on web so
// `expo start --web` never touches the native-gesture path.
export function AppBottomSheet({ open, onClose, children, title, snapPoints }: BottomSheetProps) {
  if (Platform.OS === 'web') {
    return (
      <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-[#00000066]">
          <Pressable accessibilityLabel="Close" className="absolute inset-0" onPress={onClose} />
          <View className="w-full max-w-[560px] self-center rounded-t-3xl border-t border-line bg-chalk px-5 pb-8 pt-3">
            <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-line" />
            {title ? (
              <Text variant="heading" className="mb-3">
                {title}
              </Text>
            ) : null}
            {children}
          </View>
        </View>
      </Modal>
    );
  }
  return <NativeSheet open={open} onClose={onClose} title={title} snapPoints={snapPoints}>{children}</NativeSheet>;
}

function NativeSheet({ open, onClose, children, title, snapPoints }: BottomSheetProps) {
  const ref = useRef<BottomSheet>(null);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );
  // Modal provides the full-screen portal; the sheet handles its own animation.
  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enableDynamicSizing={!snapPoints}
          enablePanDownToClose
          onClose={onClose}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: '#ffffff' }}
          handleIndicatorStyle={{ backgroundColor: '#e3ddd1' }}
        >
          <BottomSheetView>
            <View className="px-5 pb-8 pt-1">
              {title ? (
                <Text variant="heading" className="mb-3">
                  {title}
                </Text>
              ) : null}
              {children}
            </View>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}
