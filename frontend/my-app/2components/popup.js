
import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";

const POPUP_CONFIG = {
  loginSuccess: {
    icon: "✓",
    color: "#00B900",
    borderColor: "#008F00",
    message: "เข้าสู่ระบบสำเร็จ",
  },

  loginFailed: {
    icon: "✕",
    color: "#D90000",
    borderColor: "#B80000",
    message: "เข้าสู่ระบบล้มเหลว",
  },

  bookingSuccess: {
    icon: "✓",
    color: "#00B900",
    borderColor: "#008F00",
    message: "จองสำเร็จ",
  },

  bookingFailed: {
    icon: "✕",
    color: "#D90000",
    borderColor: "#B80000",
    message: "จองล้มเหลว",
  },
};

const Paw = ({ style }) => (
  <View style={[styles.paw, style]}>
    <View style={styles.pawCenter} />
    <View style={[styles.pawDot, styles.dot1]} />
    <View style={[styles.pawDot, styles.dot2]} />
    <View style={[styles.pawDot, styles.dot3]} />
  </View>
);

const Popup = ({
  visible = false,
  type = "loginSuccess",
  onClose,
  message,
}) => {
  const { width } = useWindowDimensions();

const config = POPUP_CONFIG[type];
    if (!config) {
    return null;
    }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View
          style={[
            styles.popup,
            { width: Math.min(width - 32, 402) },
          ]}
        >
          {/* ลายอุ้งเท้า */}
          <Paw style={styles.pawTopLeft} />
          <Paw style={styles.pawTopRight} />
          <Paw style={styles.pawMiddleLeft} />
          <Paw style={styles.pawMiddleRight} />
          <Paw style={styles.pawBottomLeft} />
          <Paw style={styles.pawBottomRight} />

          {/* Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: config.color,
                borderColor: config.borderColor,
              },
            ]}
          >
            <Text style={styles.iconText}>
              {config.icon}
            </Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            {message || config.message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  popup: {
    height: 228,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 3,
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 50,
    fontWeight: "900",
    lineHeight: 65,
    textAlign: "center",
    includeFontPadding: false,
  },

  message: {
    color: "#092B46",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    zIndex: 2,
  },

  // Paw print
  paw: {
    width: 20,
    height: 20,
    position: "absolute",
    opacity: 0.35,
  },

  pawCenter: {
    width: 9,
    height: 8,
    backgroundColor: "#82909A",
    borderRadius: 8,
    position: "absolute",
    bottom: 0,
    left: 5,
  },

  pawDot: {
    width: 6,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#82909A",
    position: "absolute",
  },

  dot1: {
    top: 1,
    left: 1,
  },

  dot2: {
    top: 0,
    left: 9,
  },

  dot3: {
    top: 7,
    left: 14,
  },

  pawTopLeft: {
    top: 65,
    left: 80,
  },

  pawTopRight: {
    top: 20,
    right: 32,
  },

  pawMiddleLeft: {
    top: 175,
    left: 30,
  },

  pawMiddleRight: {
    top: 130,
    right: 130,
  },

  pawBottomLeft: {
    bottom: 25,
    left: 50,
  },

  pawBottomRight: {
    bottom: 22,
    right: 35,
  },
});

export default Popup;
