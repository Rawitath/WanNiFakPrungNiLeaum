
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const logoutNavbar = ({ onLogin }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, isMobile && styles.logoMobile]}>
        StayTodayForgotTomorrow
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={onLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 56,
    backgroundColor: "#246AA5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 10,
  },

  logo: {
    color: "#FFAA00",
    fontSize: 25,
    fontWeight: "900",
    textShadowColor: "#102D45",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    flexShrink: 1,
  },

  logoMobile: {
    fontSize: 18,
  },

  loginButton: {
    backgroundColor: "#8CC4F2",
    minHeight: 28,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#071D30",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default logoutNavbar;
