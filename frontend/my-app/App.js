
import React from "react";
import { View, StyleSheet } from "react-native";

import LogoutNavbar from "./2components/logoutnavbar";
import PetDetails from "./3page/petdetails";

export default function App() {

  // ข้อมูลสัตว์เลี้ยงทั้งหมดจัดการที่นี่
  const petData = {
    id: "P001",
    name: "น้องจุ๊ดจุ๊ด",
    type: "สุนัข",
    breed: "สายพันธุ์ โกลเด้นรีทรีฟเวอร์",
    age: "2 ปี 3 เดือน",
    gender: "ผู้",
    weight: "2 กิโล",
    limitation: "แพ้ช็อกโกแลต",
    checkIn: "29/03/2569",
    checkOut: "01/04/2569",
  };

  return (
    <View style={styles.container}>

      {/* Navbar */}
      <LogoutNavbar
        onLogin={() => console.log("เปิดหน้าเข้าสู่ระบบ")}
      />

      {/* Pet Details Page */}
      <PetDetails
        onBack={() => console.log("ย้อนกลับ")}
        pet={petData}
        initialStatus="In Care"
        onStatusChange={(value) => {
          console.log("สถานะสัตว์เลี้ยง:", value);
        }}
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
