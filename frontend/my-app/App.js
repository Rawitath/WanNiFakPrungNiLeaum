
import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useFonts } from "expo-font";

import LogoutNavbar from "./2components/logoutnavbar";
import NavbarUser from "./2components/navbar_user";
import NavbarSA from "./2components/navbar_s_a";
import UserProfile from "./2components/userprofile";

import Login from "./3page/login";
import Register from "./3page/register";
import ForgotPassword from "./3page/forgotpassword";
import PetDetails from "./3page/petdetails";
import BookingUser from "./3page/booking_user";
import MyBookingUser from "./3page/mybooking_user";
import HomePageStaff from "./3page/homepage_staff";
import HomePageGuest from "./3page/homepage_guest";
import HomePageUser from "./3page/homepage_user";

export default function App() {
  const [currentPage, setCurrentPage] = useState("guest");

  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [showBooking, setShowBooking] = useState(false);
  const [showMyBooking, setShowMyBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [fontsLoaded] = useFonts({
    Itim: require("./1assets/Itim-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // ข้อมูลผู้ใช้
  const profileData = {
    name: "นายคุ๊กกี้ อร่อย",
    phone: "083xxxxxxx",
    email: "cookie@gmail.com",
  };

  // ข้อมูลสัตว์เลี้ยง
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

  // ออกจากระบบ
  const handleLogout = () => {
    setCurrentPage("guest");

    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

    setShowRegister(false);
    setShowForgotPassword(false);
  };

  // กลับหน้า User หลังจากส่งข้อมูลการจอง
  const handleBookingSubmit = (bookingData) => {
    console.log("ข้อมูลการจอง:", bookingData);

    Alert.alert(
      "สำเร็จ",
      "ส่งข้อมูลการจองเรียบร้อยแล้ว",
      [
        {
          text: "ตกลง",
          onPress: () => {
            setShowBooking(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* ================= หน้า Guest ================= */}
      {currentPage === "guest" && (
        <>
          <LogoutNavbar
            onLogin={() => {
              setCurrentPage("login");
            }}
          />

          <HomePageGuest
            onLogin={() => {
              setCurrentPage("login");
            }}
          />
        </>
      )}

      {/* ================= หน้า Login ================= */}
      {currentPage === "login" && (
        showForgotPassword ? (
          <ForgotPassword
            onBack={() => setShowForgotPassword(false)}
            onSubmit={(email) => {
              console.log("อีเมลสำหรับรีเซ็ตรหัสผ่าน:", email);
            }}
          />
        ) : showRegister ? (
          <Register
            onBack={() => setShowRegister(false)}
            onRegister={(
              username,
              email,
              phone,
              password,
              confirmPassword
            ) => {
              console.log("ข้อมูลสมัครสมาชิก:", {
                username,
                email,
                phone,
                password,
                confirmPassword,
              });
            }}
          />
        ) : (
          <Login
            onBack={() => {
              setCurrentPage("guest");
              setShowRegister(false);
              setShowForgotPassword(false);
            }}
            onLogin={(username, password) => {
              if (username === "a" && password === "123") {
                console.log("เข้าสู่ระบบสำเร็จ");

                setCurrentPage("user");
                setShowBooking(false);
                setShowMyBooking(false);
                setShowProfile(false);
              } else {
                Alert.alert(
                  "เข้าสู่ระบบไม่สำเร็จ",
                  "ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง"
                );
              }
            }}
            onForgotPassword={() => setShowForgotPassword(true)}
            onGoogleLogin={() => console.log("Google Login")}
            onRegister={() => setShowRegister(true)}
          />
        )
      )}

      {/* ================= หน้า User ================= */}
      {currentPage === "user" && (
        <View style={styles.userContainer}>

          {/* Navbar อยู่ด้านบนตลอด */}
          <NavbarUser
            onProfile={() => {
              setShowProfile(true);
            }}
            onMyBooking={() => {
              setShowMyBooking(true);
              setShowBooking(false);
              setShowProfile(false);
            }}
            onLogout={handleLogout}
          />

          {/* พื้นที่เนื้อหาด้านล่าง Navbar */}
          <View style={styles.pageContent}>

            <UserProfile
              visible={showProfile}
              onClose={() => setShowProfile(false)}
              title={profileData.name}
              name={profileData.name}
              phone={profileData.phone}
              email={profileData.email}
            />

            {showBooking ? (
              <BookingUser
                onBack={() => setShowBooking(false)}
                onSubmit={handleBookingSubmit}
              />
            ) : showMyBooking ? (
              <MyBookingUser
                visible={showMyBooking}
                onBack={() => setShowMyBooking(false)}
              />
            ) : (
              <HomePageUser
                visible={true}
                onBooking={() => {
                  setShowBooking(true);
                  setShowMyBooking(false);
                  setShowProfile(false);
                }}
              />
            )}

          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },

  userContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  pageContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
