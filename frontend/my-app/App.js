
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
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

  const profileData = {
    name: "นายคุ๊กกี้ อร่อย",
    phone: "083xxxxxxx",
    email: "cookie@gmail.com",
  };

  const handleLogout = () => {
    setCurrentPage("guest");
    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);
  };

  return (
    <View style={styles.container}>

      {/* หน้า Guest */}
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

      {/* หน้า Login ไม่มี Navbar */}
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
        ) : (
          <Login
            onBack={() => {
              setCurrentPage("guest");
            }}
            onLogin={(username, password) => {
              if (username === "a" && password === "123") {
                console.log("เข้าสู่ระบบสำเร็จ");
                setCurrentPage("user");
              } else {
                alert("ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง");
              }
            }}
            onForgotPassword={() => setShowForgotPassword(true)}
            onGoogleLogin={() => console.log("Google Login")}
            onRegister={() => setShowRegister(true)}
          />
        )
      )}

      {/* หน้า User */}
      {currentPage === "user" && (
        <>
          <NavbarUser
            onProfile={() => setShowProfile(true)}
            onMyBooking={() => setShowMyBooking(true)}
            onLogout={handleLogout}
          />

          <UserProfile
            visible={showProfile}
            onClose={() => setShowProfile(false)}
            title={profileData.name}
            name={profileData.name}
            phone={profileData.phone}
            email={profileData.email}
          />

          {showMyBooking ? (
            <MyBookingUser
              visible={showMyBooking}
              onBack={() => setShowMyBooking(false)}
            />
          ) : (
            <HomePageUser
              visible={showBooking}
              onBooking={() => setShowBooking(true)}
            />
          )}
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
