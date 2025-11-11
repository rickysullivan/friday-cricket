import React, { useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, Animated, Dimensions, Modal, TouchableOpacity, Text } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

interface SlidePanelProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function SlidePanel({ visible, onClose, title, children }: SlidePanelProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: SIZES.BORDER_RADIUS_LG,
    borderTopRightRadius: SIZES.BORDER_RADIUS_LG,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.SPACING_MD,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
  },
  title: {
    fontSize: SIZES.FONT_MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  closeButton: {
    minHeight: SIZES.TOUCH_TARGET_MIN / 2,
    minWidth: SIZES.TOUCH_TARGET_MIN / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.SPACING_MD,
  },
});
