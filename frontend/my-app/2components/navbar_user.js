
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const NavbarUser = ({
  onProfile,
  onMyBookings,
  onLogin,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, isMobile && styles.logoMobile]}>
        StayTodayForgotTomorrow
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={onProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>โปรไฟล์</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onMyBookings}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>การจองของฉัน</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
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
    flexWrap: "wrap",
    gap: 10,
  },

  logo: {
    color: "#FFAA00",
    fontSize: 25,
    fontWeight: "900",
    textShadowColor: "#102D45",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
  },

  logoMobile: {
    fontSize: 18,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },

  button: {
    backgroundColor: "#092B46",
    minHeight: 28,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: "#8CC4F2",
  },

  loginText: {
    color: "#071D30",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default NavbarUser;
