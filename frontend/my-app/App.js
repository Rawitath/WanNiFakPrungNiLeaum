
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";

// Components
import LogoutNavbar from "./2components/logoutnavbar";
import NavbarUser from "./2components/navbar_user";
import NavbarSA from "./2components/navbar_s_a";
import UserProfile from "./2components/userprofile";
import Popup from "./2components/popup";

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
  // PET DATA
  // ข้อมูลสัตว์เลี้ยงส่งต่อไปยัง HomePageUser
  // เพิ่ม/ลบ/แก้ไขข้อมูลได้จากส่วนนี้
  // ===============================
  const [pets, setPets] = useState([
    {
      id: "P001",
      name: "น้องคุกกี้",
      image: require("./1assets/piclogo.png"),
      status: "อยู่ระหว่างดูแล",
    },
    {
      id: "P002",
      name: "น้องมะลิ",
      image: require("./1assets/piclogo.png"),
      status: "อยู่ระหว่างดูแล",
    },
    {
      id: "P003",
      name: "น้องโมจิ",
      image: require("./1assets/piclogo.png"),
      status: "อยู่ระหว่างดูแล",
    },
    {
      id: "P004",
      name: "น้องจู",
      image: require("./1assets/piclogo.png"),
      status: "ตาย",
    },
    // ตัวอย่าง: เพิ่มสัตว์เลี้ยงตัวที่ 5 ได้
    {
      id: "P005",
      name: "น้อง...",
      image: require("./1assets/piclogo.png"),
      status: "อยู่ระหว่างดูแล",
    },
    
  ]);

  // ===============================
  // POPUP STATE
  // ใช้เฉพาะ Login ไม่สำเร็จ
  // ===============================
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState("loginFailed");
  const [popupMessage, setPopupMessage] = useState("");

  const showLoginError = (message) => {
    setPopupType("loginFailed");
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
  };

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

    // Login ไม่สำเร็จ
    if (!account) {
      showLoginError("ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // ตรวจสอบ Role
    if (
      account.role !== "user" &&
      account.role !== "staff" &&
      account.role !== "admin"
    ) {
      showLoginError("ไม่พบสิทธิ์ของบัญชีนี้");
      return;
    }

    // Login สำเร็จ ไม่แสดง Popup
    setActiveUser(account);

    // ปิดหน้าต่างและหน้ารองทั้งหมด
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

    // เปลี่ยนหน้าตาม Role ทันที
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
        setCurrentPage("guest");
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
      showLoginError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (password !== confirmPassword) {
      showLoginError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (
      accounts.some(
        (item) =>
          item.username.toLowerCase() ===
          cleanUsername.toLowerCase()
      )
    ) {
      showLoginError("ชื่อบัญชีนี้ถูกใช้งานแล้ว");
      return;
    }

    // บัญชีที่สมัครใหม่เป็น USER เท่านั้น
    const newAccount = {
      username: cleanUsername,
      password: password,
      role: "user",
      name: cleanUsername,
      email: email.trim(),
      phone: phone.trim(),
    };

    setAccounts((prev) => [...prev, newAccount]);

    // สมัครสำเร็จ กลับไปหน้า Login
    setShowRegister(false);
    setShowForgotPassword(false);
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

    setShowBooking(false);
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
                pets={pets}
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

      {/* =================================
          SHARED POPUP
          แสดงเฉพาะกรณี Login ไม่สำเร็จ
      ================================= */}
      <Popup
        visible={popupVisible}
        type={popupType}
        message={popupMessage}
        onClose={handlePopupClose}
      />

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
