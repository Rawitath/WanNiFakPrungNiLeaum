

// แพรเพิ่ม
import React, { useState } from "react"; 
import { View, StyleSheet } from "react-native";

import LogoutNavbar from "./2components/logoutnavbar";
import NavbarUser from "./2components/navbar_user";
import NavbarSA from "./2components/navbar_s_a";

import PetDetails from "./3page/petdetails";
import BookingUser from "./3page/booking_user";
import MyBookingUser from "./3page/mybooking_user";
import Login from "./3page/login";
import Register from "./3page/register";
import ForgotPassword from "./3page/forgotpassword";

export default function App() {

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // ข้อมูลสัตว์เลี้ยงทั้งหมดจัดการที่นี่
  const petData = {
    id: "P001",
    name: "น้องจุ๊ดจุ๊ด",
    type: "สุนัข",
    breed: "สายพันธุ์ โกลเด้นรีทรีฟเวอร์",
    age: "2 ปี 4 เดือน",
    gender: "ผู้",
    weight: "2 กิโล",
    limitation: "แพ้ช็อกโกแลต",
    checkIn: "29/03/2569",
    checkOut: "01/04/2569",
  };

return (
    <View style={styles.container}>

        {showForgotPassword ? (
            // หน้า Forgot Password
            <ForgotPassword
                onBack={() => setShowForgotPassword(false)}
                onSubmit={(email) => {
                    console.log("อีเมลสำหรับรีเซ็ตรหัสผ่าน:", email);
                }}
            />

        ) : showRegister ? (
            // หน้า Register
            <Register
                onBack={() => setShowRegister(false)}
                onRegister={(username, email, phone, password, confirmPassword) => {
                    console.log("ข้อมูลสมัครสมาชิก:", {
                        username,
                        email,
                        phone,
                        password,
                        confirmPassword,
                    });
                }}
            />

        ) : showLogin ? (
            // หน้า Login
            <Login
                onBack={() => setShowLogin(false)}
                onLogin={(username, password) => {
                    console.log("เข้าสู่ระบบ", username);
                }}
                onForgotPassword={() => setShowForgotPassword(true)}
                onGoogleLogin={() => console.log("Google Login")}
                onRegister={() => setShowRegister(true)}
            />

        ) : (
            // หน้าเดิมของเพื่อน
            <>
                <NavbarSA
                    onLogin={() => setShowLogin(true)}
                />

                <BookingUser />
            </>
        )}

    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
});
