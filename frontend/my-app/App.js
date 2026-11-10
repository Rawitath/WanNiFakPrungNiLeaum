
import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useFonts } from "expo-font";

// Components
import LogoutNavbar from "./2components/logoutnavbar";
import NavbarUser from "./2components/navbar_user";
import NavbarSA from "./2components/navbar_s_a";
import UserProfile from "./2components/userprofile";

// Pages
import Login from "./3page/login";
import Register from "./3page/register";
import ForgotPassword from "./3page/forgotpassword";

import HomePageGuest from "./3page/homepage_guest";
import HomePageUser from "./3page/homepage_user";
import HomePageStaff from "./3page/homepage_staff";
import HomepageAdmin from "./3page/homepage_admin";

import PetDetails from "./3page/petdetails";
import BookingUser from "./3page/booking_user";
import MyBookingUser from "./3page/mybooking_user";

export default function App() {
  // ===============================
  // PAGE STATE
  // ===============================
  const [currentPage, setCurrentPage] = useState("guest");

  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [showBooking, setShowBooking] = useState(false);
  const [showMyBooking, setShowMyBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [activeUser, setActiveUser] = useState(null);

  // ===============================
  // ACCOUNT SYSTEM
  // ===============================
  const [accounts, setAccounts] = useState([
    {
      username: "a",
      password: "123",
      role: "user",
      name: "ผู้ใช้งาน A",
    },
    {
      username: "b",
      password: "123",
      role: "staff",
      name: "พนักงาน B",
    },
    {
      username: "c",
      password: "123",
      role: "admin",
      name: "ผู้ดูแลระบบ C",
    },
  ]);

  const [fontsLoaded] = useFonts({
    Itim: require("./1assets/Itim-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // ===============================
  // PROFILE DATA
  // ===============================
  const profileData = {
    name: activeUser?.name || "ผู้ใช้งาน",
    phone: "083xxxxxxx",
    email: "user@gmail.com",
  };

  // ===============================
  // LOGIN
  // ===============================
  const handleLogin = (username, password) => {
    const account = accounts.find(
      (item) =>
        item.username === username.trim() &&
        item.password === password
    );

    if (!account) {
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        "ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง"
      );
      return;
    }

    // บันทึกข้อมูลบัญชีที่เข้าสู่ระบบ
    setActiveUser(account);

    // ปิดหน้าต่างและหน้ารองทั้งหมด
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

    // เปลี่ยนหน้าตาม Role
    switch (account.role) {
      case "user":
        setCurrentPage("user");
        break;

      case "staff":
        setCurrentPage("staff");
        break;

      case "admin":
        setCurrentPage("admin");
        break;

      default:
        Alert.alert("ข้อผิดพลาด", "ไม่พบสิทธิ์ของบัญชีนี้");
        break;
    }
  };

  // ===============================
  // REGISTER
  // สมัครสมาชิกได้เฉพาะ USER
  // ===============================
  const handleRegister = (
    username,
    email,
    phone,
    password,
    confirmPassword
  ) => {
    const cleanUsername = username.trim();

    if (
      !cleanUsername ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (
      accounts.some(
        (item) =>
          item.username.toLowerCase() === cleanUsername.toLowerCase()
      )
    ) {
      Alert.alert("แจ้งเตือน", "ชื่อบัญชีนี้ถูกใช้งานแล้ว");
      return;
    }

    // ทุกบัญชีที่สมัครใหม่จะเป็น USER เท่านั้น
    const newAccount = {
      username: cleanUsername,
      password: password,
      role: "user",
      name: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    setAccounts((prev) => [...prev, newAccount]);

    Alert.alert(
      "สมัครสมาชิกสำเร็จ",
      "สร้างบัญชีผู้ใช้งานเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ",
      [
        {
          text: "ตกลง",
          onPress: () => {
            setShowRegister(false);
            setShowForgotPassword(false);
          },
        },
      ]
    );
  };

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    setActiveUser(null);

    setCurrentPage("guest");

    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

    setShowRegister(false);
    setShowForgotPassword(false);
  };

  // ===============================
  // BOOKING SUBMIT
  // ===============================
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

  // ===============================
  // PROFILE
  // ===============================
  const renderProfile = () => (
    <UserProfile
      visible={showProfile}
      onClose={() => setShowProfile(false)}
      title={profileData.name}
      name={profileData.name}
      phone={activeUser?.phone || profileData.phone}
      email={activeUser?.email || profileData.email}
    />
  );

  // ===============================
  // LOADING
  // ===============================
  return (
    <View style={styles.container}>

      {/* =================================
          GUEST
      ================================= */}
      {currentPage === "guest" && (
        <View style={styles.pageContainer}>
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
        </View>
      )}

      {/* =================================
          LOGIN / REGISTER / FORGOT
      ================================= */}
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
            onLogin={() => setShowRegister(false)}
            onRegister={handleRegister}
          />
        ) : (
          <Login
            onBack={() => {
              setCurrentPage("guest");
              setShowRegister(false);
              setShowForgotPassword(false);
            }}
            onLogin={handleLogin}
            onForgotPassword={() => setShowForgotPassword(true)}
            onGoogleLogin={() => {
              console.log("Google Login");
            }}
            onRegister={() => setShowRegister(true)}
          />
        )
      )}

      {/* =================================
          USER ROLE
      ================================= */}
      {currentPage === "user" && (
        <View style={styles.userContainer}>

          {/* Navbar User */}
          <NavbarUser
            onProfile={() => setShowProfile(true)}
            onMyBooking={() => {
              setShowMyBooking(true);
              setShowBooking(false);
              setShowProfile(false);
            }}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>

            {renderProfile()}

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

      {/* =================================
          STAFF ROLE
      ================================= */}
      {currentPage === "staff" && (
        <View style={styles.userContainer}>

          {/* Navbar Staff / Admin */}
          <NavbarSA
            onProfile={() => setShowProfile(true)}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>

            {renderProfile()}

            <HomePageStaff
              onViewBooking={(item) => {
                console.log("ดูรายละเอียดการจอง:", item);
              }}
              onViewPet={(item) => {
                console.log("ดูรายละเอียดสัตว์เลี้ยง:", item);
              }}
              onCheckIn={(item) => {
                console.log("รับสัตว์เลี้ยงเข้าพัก:", item);
              }}
              onCheckOut={(item) => {
                console.log("รับสัตว์เลี้ยงกลับ:", item);
              }}
            />

          </View>
        </View>
      )}

      {/* =================================
          ADMIN ROLE
      ================================= */}
      {currentPage === "admin" && (
        <View style={styles.userContainer}>

          {/* Navbar Staff / Admin */}
          <NavbarSA
            onProfile={() => setShowProfile(true)}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>

            {renderProfile()}

            <HomepageAdmin
              onBack={() => {
                // คงอยู่ในหน้า Admin
              }}
            />

          </View>
        </View>
      )}

    </View>
  );
}

// ===============================
// STYLES
// ===============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  pageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
