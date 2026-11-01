
import React from "react";
import { View, StyleSheet } from "react-native";

import LogoutNavbar from "./2components/logoutnavbar";
import Navbar from "./2components/navbar";
import PetDetails from "./3page/petdetails";

export default function App() {
  return (
    <View style={styles.container}>

      {/* Navbar */}
      <LogoutNavbar
        onLogin={() => console.log("เปิดหน้าเข้าสู่ระบบ")}
      />

      {/* Pet Details Page */}
      <PetDetails
        onBack={() => console.log("ย้อนกลับ")}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
});
