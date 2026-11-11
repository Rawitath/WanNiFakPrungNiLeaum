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

const APP_STORAGE_KEY = "pet_app_page_state";

// =====================================================
// PET STATUS
// สถานะการจองเก็บไว้ที่ booking.status เพียงจุดเดียว
// =====================================================

const PET_STATUSES = [
  "รอยืนยันคิว",
  "รอรับเข้า",
  "In Care",
  "รอรับกลับ",
  "รับกลับแล้ว",
  "ถูกปฏิเสธ",
];

const normalizePetStatus = (status) => {
  const legacyStatuses = {
    "อยู่ระหว่างดูแล": "In Care",
    "พร้อมรับกลับ": "รอรับกลับ",
    "ปฏิเสธแล้ว": "ถูกปฏิเสธ",
  };

  const normalizedStatus = legacyStatuses[status] || status;

  return PET_STATUSES.includes(normalizedStatus)
    ? normalizedStatus
    : "รอรับเข้า";
};

// =====================================================
// INITIAL DATA
// =====================================================

const INITIAL_DATA = [
  {
    owner: {
      id: "#O001",
      name: "คุณวิลักษณ์",
      phone: "089xxxxxxxx",
      email: "wilak@example.com",
    },
    pet: {
      name: "น้องคุกกี้",
      petType: "สุนัข",
      breed: "โกลเด้น รีทรีฟเวอร์",
      gender: "เมีย",
      birth: "15/06/2565",
      weight: "25",
      health: "ไม่มีโรคประจำตัวหรือประวัติแพ้ยา/อาหาร",
      careNotes: "ชอบเดินเล่น ต้องการพื้นที่ออกกำลังกาย",
    },
    booking: {
      id: "#O001",
      branch: "ลาดกระบัง",
      startDate: "10/03/2569",
      endDate: "13/03/2569",
      time: "10:00",
      status: "In Care",
      checkIn: "10/03/2569",
      checkOut: "13/03/2569",
      bookingTime: "10:00",
    },
  },

  {
    owner: {
      id: "#O002",
      name: "คุณสายฝน",
      phone: "086xxxxxxxx",
      email: "saifon@example.com",
    },
    pet: {
      name: "น้องมะลิ",
      petType: "แมว",
      breed: "เปอร์เซีย",
      gender: "เมีย",
      birth: "20/08/2567",
      weight: "4.5",
      health: "แพ้อาหารทะเล",
      careNotes: "ให้อาหารสูตรสำหรับแมวแพ้ง่าย",
    },
    booking: {
      id: "#O002",
      branch: "ลาดกระบัง",
      startDate: "11/03/2569",
      endDate: "14/03/2569",
      time: "13:00",
      status: "รอรับกลับ",
      checkIn: "11/03/2569",
      checkOut: "14/03/2569",
      bookingTime: "10:00",
    },
  },

  {
    owner: {
      id: "#O003",
      name: "คุณหมวย",
      phone: "081xxxxxxxx",
      email: "muay@example.com",
    },
    pet: {
      name: "น้องโมจิ",
      petType: "สุนัข",
      breed: "ชิบะอินุ",
      gender: "ผู้",
      birth: "12/01/2568",
      weight: "8",
      health: "ไม่มีโรคประจำตัว",
      careNotes: "ไม่ค่อยคุ้นเคยกับสัตว์เลี้ยงตัวอื่น",
    },
    booking: {
      id: "#O003",
      branch: "บางนา",
      startDate: "12/03/2569",
      endDate: "15/03/2569",
      time: "14:30",
      status: "ถูกปฏิเสธ",
      checkIn: "12/03/2569",
      checkOut: "15/03/2569",
      bookingTime: "10:00",
    },
  },

  {
    owner: {
      id: "#O004",
      name: "คุณจุ๊ด",
      phone: "082xxxxxxxx",
      email: "jud@example.com",
    },
    pet: {
      name: "น้องจู",
      petType: "สุนัข",
      breed: "ปอมเมอเรเนียน",
      gender: "เมีย",
      birth: "05/04/2566",
      weight: "3.2",
      health: "มีประวัติแพ้ยาบางชนิด",
      careNotes: "ห้ามให้ยาหากไม่ได้รับคำแนะนำจากเจ้าของ",
    },
    booking: {
      id: "#O004",
      branch: "ลาดกระบัง",
      startDate: "13/03/2569",
      endDate: "16/03/2569",
      time: "16:00",
      status: "รอรับเข้า",
      checkIn: "13/03/2569",
      checkOut: "16/03/2569",
      bookingTime: "10:00",
    },
  },

  {
    owner: {
      id: "#O005",
      name: "คุณกานต์",
      phone: "084xxxxxxxx",
      email: "kan@example.com",
    },
    pet: {
      name: "น้องบ๊อบ",
      petType: "สุนัข",
      breed: "ลาบราดอร์",
      gender: "ผู้",
      birth: "18/11/2564",
      weight: "30",
      health: "ไม่มีโรคประจำตัว",
      careNotes: "ต้องการพาเดินเล่นวันละ 2 ครั้ง",
    },
    booking: {
      id: "#O005",
      branch: "บางนา",
      startDate: "14/03/2569",
      endDate: "18/03/2569",
      time: "17:00",
      status: "In Care",
      checkIn: "14/03/2569",
      checkOut: "18/03/2569",
      bookingTime: "10:00",
    },
  },
];

// =====================================================
// CLEAN OLD SAVED DATA
// ล้างข้อมูลเก่าให้เหลือโครงสร้างใหม่
// =====================================================

const cleanSavedData = (item) => {
  const cleanItem = { ...item };

  delete cleanItem.staffPet;
  delete cleanItem.activity;

  const oldPet = cleanItem.pet || {};
  const oldBooking = cleanItem.booking || {};

  // ย้ายรายละเอียดสัตว์เลี้ยงที่เคยอยู่ใน booking มาไว้ใน pet
  const cleanPetData = {
    ...oldPet,
    petType: oldPet.petType || oldBooking.petType || "",
    breed: oldPet.breed || oldBooking.breed || "",
    gender: oldPet.gender || oldBooking.gender || "",
    age: oldPet.age || oldBooking.age || "",
    weight: oldPet.weight || oldBooking.weight || "",
    health: oldPet.health || oldBooking.health || "",
    careNotes: oldPet.careNotes || oldBooking.careNotes || "",
  };

  // สถานะเก็บไว้ที่ booking.status
  const cleanBooking = { ...oldBooking };

  cleanBooking.status = normalizePetStatus(
    oldBooking.status || oldPet.status
  );

  // ลบรายละเอียดสัตว์เลี้ยงที่ซ้ำออกจาก booking
  delete cleanBooking.petType;
  delete cleanBooking.breed;
  delete cleanBooking.gender;
  delete cleanBooking.age;
  delete cleanBooking.weight;
  delete cleanBooking.health;
  delete cleanBooking.careNotes;

  // ลบ status เก่าที่เคยอยู่ใน pet
  delete cleanPetData.status;
  delete cleanPetData.detailStatus;

  cleanItem.pet = {
    ...cleanPetData,
    id: cleanPetData.id || `P${String(Date.now()).slice(-6)}`,
    image: cleanPetData.image || require("./1assets/piclogo.png"),
    name: cleanPetData.name || "",
    petType: cleanPetData.petType || "",
    breed: cleanPetData.breed || "",
    gender: cleanPetData.gender || "",
    age: cleanPetData.age || "",
    weight: cleanPetData.weight || "",
    health: cleanPetData.health || "",
    careNotes: cleanPetData.careNotes || "",
  };

  cleanItem.booking = {
    ...cleanBooking,
    startDate: cleanBooking.startDate || cleanBooking.checkIn || "",
    endDate: cleanBooking.endDate || cleanBooking.checkOut || "",
    time: cleanBooking.time || cleanBooking.checkInTime || "--:--",
  };

  return cleanItem;
};

// =====================================================
// APP
// =====================================================

export default function App() {
  const [currentPage, setCurrentPage] = useState("guest");

  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showMyBooking, setShowMyBooking] = useState(false);
  const [showPetDetails, setShowPetDetails] = useState(false);

  const [selectedPet, setSelectedPet] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [activeUser, setActiveUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // DATA STATE
  const [dataSets, setDataSets] = useState(INITIAL_DATA);

  const [activityList, setActivityList] = useState([]);

  // USER PET DATA
  // ส่ง status ให้หน้าแสดงสัตว์เลี้ยง แต่ข้อมูลจริงอยู่ใน booking.status
  const pets = dataSets.map((item) => ({
    ...item.pet,
    status: item.booking.status,
    owner: item.owner,
  }));

  // BOOKING DATA
  const bookings = dataSets.map((item) => ({
    ...item.booking,
    pet: item.pet.name,
    name: item.owner.name,
    phone: item.owner.phone,
  }));

  // STAFF PET DATA
  const staffPets = dataSets.map((item) => ({
    id: item.pet.id,
    name: item.pet.name,
    image: item.pet.image,
    owner: item.owner.name,
    status: item.booking.status,
  }));

  // BOOKING QUEUE DATA
  const bookingQueue = dataSets.map((item) => ({
    bookingId: item.booking.id,
    time: item.queue.time,
    name: item.pet.name,
    detail: `${item.owner.name} - ${item.booking.startDate} ถึง ${item.booking.endDate}`,
  }));

  // ACCOUNT STATE
  const [accounts, setAccounts] = useState([
    {
      username: "a",
      password: "123",
      role: "user",
      name: "ผู้ใช้งาน A",
      phone: "083xxxxxxx",
      email: "user@gmail.com",
    },
    {
      username: "b",
      password: "123",
      role: "staff",
      name: "พนักงาน B",
      phone: "084xxxxxxx",
      email: "staff@gmail.com",
    },
    {
      username: "c",
      password: "123",
      role: "admin",
      name: "ผู้ดูแลระบบ C",
      phone: "085xxxxxxx",
      email: "admin@gmail.com",
    },
  ]);

  // POPUP STATE
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState("loginFailed");
  const [popupMessage, setPopupMessage] = useState("");

  // FONT
  const [fontsLoaded] = useFonts({
    Itim: require("./1assets/Itim-Regular.ttf"),
  });

    // =====================================================
  // RESTORE APP STATE
  // =====================================================

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

          // RESTORE PET DATA
          let restoredData = INITIAL_DATA;

          if (Array.isArray(data.dataSets)) {
            restoredData = data.dataSets.map(cleanSavedData);
            setDataSets(restoredData);
          }

          // RESTORE ACTIVITY
          if (Array.isArray(data.activityList)) {
            const cleanedActivities = data.activityList.map((item) => {
              const cleanActivity = { ...item };
              delete cleanActivity.status;
              return cleanActivity;
            });

            setActivityList(cleanedActivities);
          }

          // RESTORE SELECTED PET
          if (data.showPetDetails && data.selectedPetId) {
            const savedPet = restoredData.find(
              (item) => item.pet.id === data.selectedPetId
            );

            if (savedPet) {
              setSelectedPet({
                ...savedPet.pet,
                status: savedPet.booking.status,
                owner: savedPet.owner,
              });

              setShowPetDetails(true);
            }
          }

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

  // =====================================================
  // SAVE APP STATE
  // =====================================================

  useEffect(() => {
    if (isRestoring) return;

    const saveAppState = async () => {
      try {
        const safeUser = activeUser
          ? {
              username: activeUser.username,
              role: activeUser.role,
              name: activeUser.name,
              email: activeUser.email,
              phone: activeUser.phone,
            }
          : null;

        await AsyncStorage.setItem(
          APP_STORAGE_KEY,
          JSON.stringify({
            currentPage,
            activeUser: safeUser,
            showRegister,
            showForgotPassword,
            showBooking,
            showMyBooking,
            showPetDetails,
            selectedPetId: selectedPet?.id || null,
            dataSets,
            activityList,
          })
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
    showPetDetails,
    selectedPet?.id,
    dataSets,
    activityList,
  ]);

  // LOADING
  if (!fontsLoaded || isRestoring) {
    return null;
  }

  // =====================================================
  // POPUP ERROR
  // =====================================================

  const showLoginError = (message) => {
    setPopupType("loginFailed");
    setPopupMessage(message);
    setPopupVisible(true);
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (username, password) => {
    const account = accounts.find(
      (item) =>
        item.username === username.trim() &&
        item.password === password
    );

    if (!account) {
      return showLoginError("ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง");
    }

    if (!["user", "staff", "admin"].includes(account.role)) {
      return showLoginError("ไม่พบสิทธิ์ของบัญชีนี้");
    }

    setActiveUser(account);
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowBooking(false);
    setShowMyBooking(false);
    setShowPetDetails(false);
    setSelectedPet(null);
    setShowProfile(false);
    setCurrentPage(account.role);
  };

  // =====================================================
  // REGISTER
  // =====================================================

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
      return showLoginError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }

    if (password !== confirmPassword) {
      return showLoginError("รหัสผ่านไม่ตรงกัน");
    }

    if (
      accounts.some(
        (item) =>
          item.username.toLowerCase() === cleanUsername.toLowerCase()
      )
    ) {
      return showLoginError("ชื่อบัญชีนี้ถูกใช้งานแล้ว");
    }

    const newAccount = {
      username: cleanUsername,
      password,
      role: "user",
      name: cleanUsername,
      email: email.trim(),
      phone: phone.trim(),
    };

    setAccounts((prev) => [...prev, newAccount]);

    setShowRegister(false);
    setShowForgotPassword(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    setActiveUser(null);
    setCurrentPage("guest");
    setShowBooking(false);
    setShowMyBooking(false);
    setShowPetDetails(false);
    setSelectedPet(null);
    setShowProfile(false);
    setShowRegister(false);
    setShowForgotPassword(false);
  };

  // =====================================================
  // ADD BOOKING
  // =====================================================

  const handleBookingSubmit = (bookingData) => {
    const timestamp = Date.now();

    const newId = `P${String(timestamp).slice(-6)}`;
    const newBookingId = `#O${String(timestamp).slice(-5)}`;

    const ownerName =
      bookingData.ownerName || activeUser?.name || "ผู้ใช้งาน";

    const ownerPhone = bookingData.phone || activeUser?.phone || "";
    const ownerEmail = bookingData.email || activeUser?.email || "";

    const petName = bookingData.petName || "สัตว์เลี้ยงใหม่";

    // เวลาที่ผู้ใช้กดจองจริง
    const bookingTime = new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newData = {
      owner: {
        id: newBookingId,
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
      },

      // รายละเอียดสัตว์เลี้ยงทั้งหมดเก็บไว้ใน pet
      pet: {
        id: newId,
        name: petName,
        image:
          bookingData.image ||
          require("./1assets/piclogo.png"),
        petType: bookingData.petType || "",
        breed: bookingData.breed || "",
        gender: bookingData.gender || "",
        age: bookingData.age || "",
        weight: bookingData.weight || "",
        health: bookingData.health || "",
        careNotes: bookingData.careNotes || "",
      },

      // ข้อมูลการจองและสถานะเก็บไว้ใน booking
      booking: {
        id: newBookingId,
        branch: bookingData.branch || "",
        startDate: bookingData.checkIn || "",
        endDate: bookingData.checkOut || "",
        time: bookingTime,
        status: "รอรับเข้า",
        checkIn: bookingData.checkIn || "",
        checkOut: bookingData.checkOut || "",
        checkInTime: bookingData.checkInTime || "",
        checkOutTime: bookingData.checkOutTime || "",
      },

      queue: {
        id: `Q${String(timestamp).slice(-6)}`,
        time: bookingData.checkInTime || "--:--",
      },
    };

    setDataSets((prev) => [newData, ...prev]);

    // บันทึกเฉพาะเหตุการณ์ ไม่มี status
    setActivityList((prev) => [
      {
        id: `A${Date.now()}`,
        name: petName,
        detail: `มีการจองใหม่ • ${ownerName}`,
        action: "จองใหม่",
        color: "#D99035",
        petId: newId,
      },
      ...prev,
    ]);

    setShowBooking(false);
  };

    // =====================================================
  // UPDATE PET STATUS
  // เปลี่ยนสถานะจริงจาก booking.status จุดเดียว
  // =====================================================

  const handlePetStatusChange = (petId, newStatus) => {
    if (!PET_STATUSES.includes(newStatus)) {
      console.log("Invalid pet status:", newStatus);
      return;
    }

    setDataSets((prev) =>
      prev.map((item) =>
        item.pet.id === petId
          ? {
              ...item,
              booking: {
                ...item.booking,
                status: newStatus,
              },
            }
          : item
      )
    );

    setSelectedPet((prev) =>
      prev && prev.id === petId
        ? {
            ...prev,
            status: newStatus,
          }
        : prev
    );
  };

  // =====================================================
  // CONFIRM / REJECT BOOKING QUEUE
  // =====================================================

  const handleQueueDecision = (queueItem, accepted) => {
    if (!accepted) {
      handlePetStatusChange(queueItem.petId, "ถูกปฏิเสธ");
    }
  };

  // =====================================================
  // STAFF ACTIVITY
  // =====================================================

  const handleActivity = (item, action) => {
    if (item.petId) {
      let newStatus = null;

      if (action === "รับเข้าพัก") {
        newStatus = "In Care";
      } else if (action === "รับกลับ") {
        newStatus = "รับกลับแล้ว";
      }

      if (newStatus) {
        handlePetStatusChange(item.petId, newStatus);
      }
    }

    setActivityList((prev) => [
      {
        id: `A${Date.now()}`,
        name: item.name || "",
        petId: item.petId || null,
        action,
        detail: `${action} • ${item.detail || ""}`,
        color:
          action === "รับเข้าพัก"
            ? "#174F83"
            : "#F39A13",
      },
      ...prev,
    ]);
  };

  // =====================================================
  // PROFILE DATA
  // =====================================================

  const profileData = {
    name: activeUser?.name || "ผู้ใช้งาน",
    phone: activeUser?.phone || "083xxxxxxx",
    email: activeUser?.email || "user@gmail.com",
  };

  const renderProfile = () => (
    <UserProfile
      visible={showProfile}
      onClose={() => setShowProfile(false)}
      title={profileData.name}
      name={profileData.name}
      phone={profileData.phone}
      email={profileData.email}
    />
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View style={styles.container}>
      {/* GUEST */}
      {currentPage === "guest" && (
        <View style={styles.pageContainer}>
          <LogoutNavbar
            onLogin={() => setCurrentPage("login")}
          />

          <HomePageGuest
            onLogin={() => setCurrentPage("login")}
          />
        </View>
      )}

      {/* LOGIN / REGISTER / FORGOT PASSWORD */}
      {currentPage === "login" &&
        (showForgotPassword ? (
          <ForgotPassword
            onBack={() => setShowForgotPassword(false)}
            onSubmit={(email) =>
              console.log("อีเมลสำหรับรีเซ็ตรหัสผ่าน:", email)
            }
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
            onGoogleLogin={() => console.log("Google Login")}
            onRegister={() => setShowRegister(true)}
          />
        ))}

      {/* USER */}
      {currentPage === "user" && (
        <View style={styles.userContainer}>
          <NavbarUser
            onProfile={() => setShowProfile(true)}
            onMyBooking={() => {
              setShowMyBooking(true);
              setShowBooking(false);
              setShowProfile(false);
              setShowPetDetails(false);
            }}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>
            {renderProfile()}

            {/* PET DETAILS */}
            {showPetDetails && selectedPet ? (
              <PetDetails
                key={selectedPet.id}
                pet={selectedPet}
                petImage={selectedPet.image}
                initialStatus={selectedPet.status}
                onBack={() => setShowPetDetails(false)}
                onStatusChange={(newStatus) =>
                  handlePetStatusChange(selectedPet.id, newStatus)
                }
              />
            ) : showBooking ? (
              <BookingUser
                onBack={() => setShowBooking(false)}
                onSubmit={handleBookingSubmit}
              />
            ) : showMyBooking ? (
              <MyBookingUser
                visible={showMyBooking}
                bookings={bookings}
                onBack={() => setShowMyBooking(false)}
              />
            ) : (
              <HomePageUser
                pets={pets}
                onPetPress={(pet) => {
                  setSelectedPet(pet);
                  setShowPetDetails(true);
                  setShowBooking(false);
                  setShowMyBooking(false);
                  setShowProfile(false);
                }}
                onBooking={() => {
                  setShowBooking(true);
                  setShowMyBooking(false);
                  setShowPetDetails(false);
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
              bookingQueue={bookingQueue}
              activityList={activityList}
              petList={staffPets}
              onUpdatePetStatus={handlePetStatusChange}
              onConfirmQueue={(item) =>
                handleQueueDecision(item, true)
              }
              onRejectQueue={(item) =>
                handleQueueDecision(item, false)
              }
              onCheckIn={(item) =>
                handleActivity(item, "รับเข้าพัก")
              }
              onCheckOut={(item) =>
                handleActivity(item, "รับกลับ")
              }
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
            <HomepageAdmin onBack={() => {}} />
          </View>
        </View>
      )}

      {/* POPUP */}
      <Popup
        visible={popupVisible}
        type={popupType}
        message={popupMessage}
        onClose={() => setPopupVisible(false)}
      />
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

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