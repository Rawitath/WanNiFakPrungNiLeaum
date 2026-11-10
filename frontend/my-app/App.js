
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Key สำหรับเก็บสถานะหน้า
const APP_STORAGE_KEY = "pet_app_page_state";

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

  // ป้องกันการบันทึกค่าเริ่มต้นทับข้อมูลเดิมก่อนโหลดเสร็จ
  const [isRestoring, setIsRestoring] = useState(true);

  // ===============================
  // RESTORE PAGE STATE
  // โหลดสถานะเดิมเมื่อเปิดแอป
  // ===============================
  useEffect(() => {
    const restoreAppState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(APP_STORAGE_KEY);

        if (savedState) {
          const data = JSON.parse(savedState);

          const validPages = [
            "guest",
            "login",
            "user",
            "staff",
            "admin",
          ];

          if (validPages.includes(data.currentPage)) {
            setCurrentPage(data.currentPage);
          }

          setActiveUser(data.activeUser || null);

          setShowRegister(data.showRegister || false);
          setShowForgotPassword(data.showForgotPassword || false);

          setShowBooking(data.showBooking || false);
          setShowMyBooking(data.showMyBooking || false);

          // ไม่เปิด Popup หรือ Profile ค้างหลัง Refresh
          setShowProfile(false);
        }
      } catch (error) {
        console.log("Restore app state error:", error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreAppState();
  }, []);

  // ===============================
  // SAVE PAGE STATE
  // บันทึกทุกครั้งที่เปลี่ยนหน้า
  // ===============================
  useEffect(() => {
    if (isRestoring) return;

    const saveAppState = async () => {
      try {
        // ไม่เก็บรหัสผ่านลง Storage
        const safeUser = activeUser
          ? {
              username: activeUser.username,
              role: activeUser.role,
              name: activeUser.name,
              email: activeUser.email,
              phone: activeUser.phone,
            }
          : null;

        const appState = {
          currentPage,
          activeUser: safeUser,
          showRegister,
          showForgotPassword,
          showBooking,
          showMyBooking,
        };

        await AsyncStorage.setItem(
          APP_STORAGE_KEY,
          JSON.stringify(appState)
        );
      } catch (error) {
        console.log("Save app state error:", error);
      }
    };

    saveAppState();
  }, [
    isRestoring,
    currentPage,
    activeUser,
    showRegister,
    showForgotPassword,
    showBooking,
    showMyBooking,
  ]);

  // ===============================
  // PET DATA
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
    {
      id: "P005",
      name: "น้อง...",
      image: require("./1assets/piclogo.png"),
      status: "อยู่ระหว่างดูแล",
    },
  ]);

  // ===============================
  // POPUP STATE
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

  // รอโหลด Font และสถานะเดิมให้เสร็จก่อนแสดงหน้า
  if (!fontsLoaded || isRestoring) {
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
      showLoginError("ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    if (
      account.role !== "user" &&
      account.role !== "staff" &&
      account.role !== "admin"
    ) {
      showLoginError("ไม่พบสิทธิ์ของบัญชีนี้");
      return;
    }

    setActiveUser(account);

    setShowRegister(false);
    setShowForgotPassword(false);
    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

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

    const newAccount = {
      username: cleanUsername,
      password: password,
      role: "user",
      name: cleanUsername,
      email: email.trim(),
      phone: phone.trim(),
    };

    setAccounts((prev) => [...prev, newAccount]);

    setShowRegister(false);
    setShowForgotPassword(false);
  };

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = async () => {
    setActiveUser(null);

    setCurrentPage("guest");

    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

    setShowRegister(false);
    setShowForgotPassword(false);

    // ล้างสถานะที่บันทึกไว้
    try {
      await AsyncStorage.removeItem(APP_STORAGE_KEY);
    } catch (error) {
      console.log("Clear app state error:", error);
    }
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
  // RENDER
  // ===============================
  return (
    <View style={styles.container}>

      {/* GUEST */}
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

      {/* LOGIN / REGISTER / FORGOT */}
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

      {/* USER */}
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

      {/* STAFF */}
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

      {/* ADMIN */}
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

      {/* SHARED POPUP */}
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
