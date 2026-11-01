
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import LogoutNavbar from "./2components/logoutnavbar";
import Navbar from "./2components/navbar";
import Popup from "./2components/popup";

export default function App() {
  const [popupType, setPopupType] = useState(null);

  const closePopup = () => {
    setPopupType(null);
  };

  return (
    <View style={styles.container}>

      <LogoutNavbar
        onLogin={() => console.log("เปิดหน้าเข้าสู่ระบบ")}
      />

      <View style={styles.content}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setPopupType("loginSuccess")}
        >
          <Text style={styles.buttonText}>
            Login Success
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setPopupType("loginFailed")}
        >
          <Text style={styles.buttonText}>
            Login Failed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setPopupType("bookingSuccess")}
        >
          <Text style={styles.buttonText}>
            Booking Success
          </Text>
        </TouchableOpacity>

      </View>

      <Popup
        visible={popupType !== null}
        type={popupType}
        onClose={closePopup}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },

  button: {
    backgroundColor: "#246AA5",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
