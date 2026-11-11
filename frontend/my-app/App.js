import React, { useState, useEffect } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
// API Services
import {
  apiLogin,
  apiRegister,
  apiForgetPassword,
  apiGetProfile,
  apiUpdateProfile,
  apiGetCustomerReservations,
  apiCreateReservation,
  apiCancelReservation,
  apiGetCustomerPets,
  apiGetStaffPets,
  apiUpdateStaffPetStatus,
  apiRecordStaffPetEntry,
  apiGetStaffReservations,
  apiConfirmStaffReservation,
  apiGetManagerStatus,
  apiManagerRegisterStaff,
  parseJwt,
  clearAuthToken,
  getAuthToken,
} from "./api";
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
    "พร้อมรับกลับบ้าน": "รอรับกลับ",
    "รับกลับบ้านแล้ว": "รับกลับแล้ว",
    "ปฏิเสธแล้ว": "ถูกปฏิเสธ",
  };
  const normalizedStatus = legacyStatuses[status] || status;
  return PET_STATUSES.includes(normalizedStatus)
    ? normalizedStatus
    : "รอรับเข้า";
};
// ใช้ booking.id เป็นรหัสสัตว์เลี้ยงชั่วคราวเมื่อ INITIAL_DATA ไม่มี pet.id
// ไม่ต้องแก้ไข INITIAL_DATA และรหัสนี้คงที่ระหว่างเปิดแอป
const getPetId = (item) =>
  item?.pet?.id || item?.booking?.id || item?.owner?.id || item?.pet?.name || "";
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
      id: "#B001",
      branch: "ลาดกระบัง",
      startDate: "10/03/2569",
      endDate: "13/03/2569",
      bookingTime: "10:00",
      status: "In Care",
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
      id: "#B002",
      branch: "ลาดกระบัง",
      startDate: "10/03/2569",
      endDate: "13/03/2569",
      bookingTime: "10:00",
      status: "In Care",
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
      id: "#B003",
      branch: "ลาดกระบัง",
      startDate: "10/03/2569",
      endDate: "13/03/2569",
      bookingTime: "10:00",
      status: "รอรับกลับ",
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
      id: "#B004",
      branch: "สาขาร่มเกล้า",
      startDate: "10/03/2569",
      endDate: "13/03/2569",
      bookingTime: "10:00",
      status: "ถูกปฏิเสธ",
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
      id: "#B005",
      branch: "สาขาร่มเกล้า",
      startDate: "10/03/2569",
      endDate: "13/03/2569",
      bookingTime: "10:00",
      status: "รอยืนยันคิว",
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
  const oldQueue = cleanItem.queue || {};
  const petBirth =
    oldPet.birth || oldPet.age || oldBooking.birth || oldBooking.age || "";
  const cleanPet = {
    ...oldPet,
    id: oldPet.id || oldBooking.id || cleanItem.owner?.id || `P${String(Date.now()).slice(-6)}`,
    name: oldPet.name || "",
    petType: oldPet.petType || oldPet.type || oldBooking.petType || oldBooking.type || "",
    breed: oldPet.breed || oldBooking.breed || "",
    gender: oldPet.gender || oldBooking.gender || "",
    birth: petBirth,
    age: petBirth,
    weight: oldPet.weight || oldBooking.weight || "",
    health: oldPet.health || oldPet.limitation || oldBooking.health || "",
    careNotes: oldPet.careNotes || oldBooking.careNotes || "",
    image: oldPet.image || require("./1assets/piclogo.png"),
  };
  const cleanBooking = {
    ...oldBooking,
    status: normalizePetStatus(oldBooking.status || oldPet.status),
    startDate: oldBooking.startDate || oldBooking.checkIn || "",
    endDate: oldBooking.endDate || oldBooking.checkOut || "",
    time: oldBooking.time || oldBooking.bookingTime || "--:--",
    bookingTime: oldBooking.bookingTime || oldBooking.time || "--:--",
  };
  delete cleanBooking.petType;
  delete cleanBooking.type;
  delete cleanBooking.breed;
  delete cleanBooking.gender;
  delete cleanBooking.age;
  delete cleanBooking.birth;
  delete cleanBooking.weight;
  delete cleanBooking.health;
  delete cleanBooking.careNotes;
  delete cleanPet.status;
  delete cleanPet.detailStatus;
  delete cleanPet.type;
  delete cleanPet.limitation;
  cleanItem.pet = cleanPet;
  cleanItem.booking = cleanBooking;
  cleanItem.queue = {
    ...oldQueue,
    id: oldQueue.id || `Q${String(Date.now()).slice(-6)}`,
    time: oldQueue.time || cleanBooking.bookingTime || cleanBooking.time || "--:--",
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
  // ส่งข้อมูลสัตว์เลี้ยงพร้อมข้อมูลการจองให้หน้า PetDetails
  const pets = dataSets.map((item) => ({
    ...item.pet,
    id: getPetId(item),
    image: item.pet.image || require("./1assets/piclogo.png"),
    status: normalizePetStatus(item.booking.status),
    checkIn: item.booking.checkIn || item.booking.startDate || "",
    checkOut: item.booking.checkOut || item.booking.endDate || "",
    startDate: item.booking.startDate || item.booking.checkIn || "",
    endDate: item.booking.endDate || item.booking.checkOut || "",
    branch: item.booking.branch || "",
    bookingId: item.booking.id || "",
    bookingTime: item.booking.bookingTime || item.booking.time || "",
    checkInTime: item.booking.checkInTime || "",
    checkOutTime: item.booking.checkOutTime || "",
    owner: item.owner || {},
  }));
  // BOOKING DATA
  // รวมข้อมูลจาก owner, pet และ booking เพื่อให้หน้า MyBookingUser แสดงครบ
  const bookings = dataSets.map((item) => ({
    ...item.booking,
    id: item.booking.id || item.owner?.id || item.pet.id,
    pet: item.pet.name || "",
    petType: item.pet.petType || item.pet.type || "",
    breed: item.pet.breed || "",
    gender: item.pet.gender || "",
    age: item.pet.birth || item.pet.age || "",
    birth: item.pet.birth || item.pet.age || "",
    weight: item.pet.weight || "",
    health: item.pet.health || "",
    careNotes: item.pet.careNotes || "",
    name: item.owner?.name || "",
    phone: item.owner?.phone || "",
    email: item.owner?.email || "",
    status: normalizePetStatus(item.booking.status),
  }));
  // STAFF PET DATA
  const staffPets = dataSets.map((item) => ({
    id: getPetId(item),
    name: item.pet.name || "",
    image: item.pet.image || require("./1assets/piclogo.png"),
    owner: item.owner?.name || "",
    status: normalizePetStatus(item.booking.status),
    branch: item.booking.branch || item.pet.branch || "สาขาลาดกระบัง",
    petId: getPetId(item),
    petName: item.pet.name,
    petType: item.pet.petType,
    petBreed: item.pet.breed,
    petSex: item.pet.gender,
    petWeight: item.pet.weight,
    petBirth: item.pet.birth || item.pet.age,
    petCondition: item.pet.health,
    petNote: item.pet.careNotes,
    customerName: item.owner?.name,
    customerPhone: item.owner?.phone,
    customerEmail: item.owner?.email,
    bookingId: item.booking.id,
    checkIn: item.booking.startDate || item.booking.checkIn,
    checkOut: item.booking.endDate || item.booking.checkOut,
  }));
  // BOOKING QUEUE DATA
  const bookingQueue = dataSets.map((item) => ({
    id: item.queue?.id || item.booking.id,
    bookingId: item.booking.id,
    petId: getPetId(item),
    time: item.queue?.time || item.booking.bookingTime || item.booking.time || "--:--",
    name: item.pet.name || "",
    branch: item.booking.branch || "สาขาลาดกระบัง",
    status: normalizePetStatus(item.booking.status),
    detail: `${item.owner?.name || ""} - ${item.booking.startDate || item.booking.checkIn || ""} ถึง ${item.booking.endDate || item.booking.checkOut || ""}`,
    customerName: item.owner?.name,
    customerPhone: item.owner?.phone,
    customerEmail: item.owner?.email,
    petName: item.pet.name,
    petType: item.pet.petType,
    petBreed: item.pet.breed,
    petSex: item.pet.gender,
    petWeight: item.pet.weight,
    petBirth: item.pet.birth || item.pet.age,
    petCondition: item.pet.health,
    petNote: item.pet.careNotes,
    checkIn: item.booking.startDate || item.booking.checkIn,
    checkOut: item.booking.endDate || item.booking.checkOut,
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
              (item) => getPetId(item) === data.selectedPetId
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
  // API LOADERS
  // =====================================================
  const [adminOverview, setAdminOverview] = useState(null);

  const loadCustomerData = async () => {
    try {
      const [resRes, petRes] = await Promise.all([
        apiGetCustomerReservations(),
        apiGetCustomerPets(),
      ]);

      if (resRes.ok && Array.isArray(resRes.data) && resRes.data.length > 0) {
        const backendDataSets = resRes.data.map((r, idx) => ({
          owner: {
            id: r.customerName || `O${idx}`,
            name: r.customerName || "ลูกค้า",
            phone: r.customerPhone || "",
            email: r.customerEmail || "",
          },
          pet: {
            id: String(r.reservationId || r.id || idx),
            name: r.petName || "สัตว์เลี้ยง",
            petType: r.petType || "สุนัข",
            breed: r.petBreed || "",
            gender: r.petSex || "ผู้",
            birth: r.petBirth || "",
            weight: String(r.petWeight || ""),
            health: r.petCondition || "",
            careNotes: r.petNote || "",
            image: require("./1assets/piclogo.png"),
          },
          booking: {
            id: String(r.reservationId || r.id || idx),
            branch: r.branch || "สาขาลาดกระบัง",
            startDate: r.checkIn ? new Date(r.checkIn).toLocaleDateString("th-TH") : "",
            endDate: r.checkOut ? new Date(r.checkOut).toLocaleDateString("th-TH") : "",
            checkIn: r.checkIn ? new Date(r.checkIn).toLocaleDateString("th-TH") : "",
            checkOut: r.checkOut ? new Date(r.checkOut).toLocaleDateString("th-TH") : "",
            bookingTime: r.reservationDate ? new Date(r.reservationDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00",
            time: "10:00",
            status:
              r.status === "accepted" || r.status === "confirmed"
                ? "In Care"
                : r.status === "rejected" || r.status === "cancelled"
                ? "ถูกปฏิเสธ"
                : "รอยืนยันคิว",
          },
          queue: {
            id: `Q${idx}`,
            time: "10:00",
          },
        }));
        setDataSets(backendDataSets);
      }
    } catch (err) {
      console.warn("loadCustomerData error:", err);
    }
  };

  const loadStaffData = async () => {
    try {
      const [resRes, petRes] = await Promise.all([
        apiGetStaffReservations(),
        apiGetStaffPets(),
      ]);

      if (resRes.ok && Array.isArray(resRes.data) && resRes.data.length > 0) {
        const backendStaffSets = resRes.data.map((r, idx) => ({
          owner: {
            id: r.customerName || `O${idx}`,
            name: r.customerName || "ลูกค้า",
            phone: r.customerPhone || "",
            email: r.customerEmail || "",
          },
          pet: {
            id: String(r.reservationId || r.id || idx),
            name: r.petName || "สัตว์เลี้ยง",
            petType: r.petType || "สุนัข",
            breed: r.petBreed || "",
            gender: r.petSex || "ผู้",
            birth: r.petBirth || "",
            weight: String(r.petWeight || ""),
            health: r.petCondition || "",
            careNotes: r.petNote || "",
            image: require("./1assets/piclogo.png"),
          },
          booking: {
            id: String(r.reservationId || r.id || idx),
            branch: r.branch || "สาขาลาดกระบัง",
            startDate: r.checkIn ? new Date(r.checkIn).toLocaleDateString("th-TH") : "",
            endDate: r.checkOut ? new Date(r.checkOut).toLocaleDateString("th-TH") : "",
            checkIn: r.checkIn ? new Date(r.checkIn).toLocaleDateString("th-TH") : "",
            checkOut: r.checkOut ? new Date(r.checkOut).toLocaleDateString("th-TH") : "",
            bookingTime: "10:00",
            time: "10:00",
            status:
              r.status === "accepted" || r.status === "confirmed"
                ? "In Care"
                : r.status === "rejected" || r.status === "cancelled"
                ? "ถูกปฏิเสธ"
                : "รอรับเข้า",
          },
          queue: {
            id: `Q${idx}`,
            time: "10:00",
          },
        }));
        setDataSets(backendStaffSets);
      }
    } catch (err) {
      console.warn("loadStaffData error:", err);
    }
  };

  const loadAdminData = async () => {
    try {
      const res = await apiGetManagerStatus();
      if (res.ok && res.data) {
        setAdminOverview(res.data);
      }
    } catch (err) {
      console.warn("loadAdminData error:", err);
    }
  };

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
  const handleLogin = async (username, password) => {
    try {
      const res = await apiLogin({ username: username.trim(), password });
      if (res.ok && res.data && res.data.accessToken) {
        const payload = parseJwt(res.data.accessToken);
        const userRole =
          payload && (payload.role === "manager" ? "admin" : payload.role);
        const role = ["user", "staff", "admin"].includes(userRole)
          ? userRole
          : "user";

        let profile = { name: username, email: "", phone: "" };
        const profRes = await apiGetProfile();
        if (profRes.ok && profRes.data) {
          profile = {
            name: profRes.data.username || username,
            email: profRes.data.email || "",
            phone: profRes.data.phone || "",
          };
        }

        const userObj = {
          username: username.trim(),
          role,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        };

        setActiveUser(userObj);
        setShowRegister(false);
        setShowForgotPassword(false);
        setShowBooking(false);
        setShowMyBooking(false);
        setShowPetDetails(false);
        setSelectedPet(null);
        setShowProfile(false);
        setCurrentPage(role);

        if (role === "user") loadCustomerData();
        else if (role === "staff") loadStaffData();
        else if (role === "admin") loadAdminData();
        return;
      }
    } catch (err) {
      console.warn("apiLogin error:", err);
    }

    // In-memory fallback
    const account = accounts.find(
      (item) =>
        item.username === username.trim() && item.password === password
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
  const handleRegister = async (
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

    try {
      const res = await apiRegister({
        username: cleanUsername,
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (res.ok) {
        setPopupType("loginFailed");
        setPopupMessage("ลงทะเบียนสำเร็จแล้ว สามารถเข้าสู่ระบบได้ทันที");
        setPopupVisible(true);
        setShowRegister(false);
        setShowForgotPassword(false);
        return;
      } else {
        const errorMsg =
          res.data?.message || res.data?.error || "เกิดข้อผิดพลาดในการลงทะเบียน";
        return showLoginError(errorMsg);
      }
    } catch (err) {
      console.warn("apiRegister error:", err);
    }

    // In-memory fallback
    if (
      accounts.some(
        (item) => item.username.toLowerCase() === cleanUsername.toLowerCase()
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
  // FORGOT PASSWORD
  // =====================================================
  const handleForgotPasswordSubmit = async (emailOrUsername) => {
    if (!emailOrUsername || !emailOrUsername.trim()) {
      return showLoginError("กรุณากรอกอีเมลหรือชื่อผู้ใช้");
    }
    try {
      const res = await apiForgetPassword({ username: emailOrUsername.trim() });
      if (res.ok) {
        setPopupType("loginFailed");
        setPopupMessage("ระบบได้รับคำขอรีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
        setPopupVisible(true);
        setShowForgotPassword(false);
        return;
      }
    } catch (err) {
      console.warn("apiForgetPassword error:", err);
    }
    showLoginError("ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = async () => {
    await clearAuthToken();
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
  const handleBookingSubmit = async (formData) => {
    const toIsoDateTime = (dateStr, timeStr) => {
      if (!dateStr) return new Date().toISOString();
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        const [h, min] = (timeStr || "10:00").split(":");
        return new Date(
          Number(y),
          Number(m) - 1,
          Number(d),
          Number(h || 10),
          Number(min || 0)
        ).toISOString();
      }
      return new Date().toISOString();
    };

    const reservationPayload = {
      customerName: formData.ownerName || activeUser?.name || "ลูกค้า",
      customerPhone: formData.phone || activeUser?.phone || "0812345678",
      customerEmail: formData.email || activeUser?.email || "customer@example.com",
      petName: formData.petName || "สัตว์เลี้ยง",
      petType: formData.petType || "สุนัข",
      petBreed: formData.breed || "ทั่วไป",
      petSex: formData.gender || "ผู้",
      petWeight: Number(formData.weight) || 5,
      petBirth: formData.age || "2022-01-01",
      petCondition: formData.health || "ไม่มี",
      petNote: formData.careNotes || "ไม่มี",
      checkIn: toIsoDateTime(formData.checkIn, formData.checkInTime),
      checkOut: toIsoDateTime(formData.checkOut, formData.checkOutTime),
      branch: formData.branch || "สาขาลาดกระบัง",
    };

    try {
      const res = await apiCreateReservation(reservationPayload);
      if (res.ok) {
        await loadCustomerData();
        setShowBooking(false);
        setShowMyBooking(true);
        setPopupType("loginFailed");
        setPopupMessage("การจองสำเร็จแล้ว!");
        setPopupVisible(true);
        return;
      }
    } catch (err) {
      console.warn("apiCreateReservation error:", err);
    }

    // In-memory fallback
    const newEntry = {
      owner: {
        id: `#O${Date.now()}`,
        name: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
      },
      pet: {
        id: `P${Date.now()}`,
        name: formData.petName,
        petType: formData.petType,
        breed: formData.breed,
        gender: formData.gender,
        birth: formData.age,
        weight: formData.weight,
        health: formData.health,
        careNotes: formData.careNotes,
        image: require("./1assets/piclogo.png"),
      },
      booking: {
        id: `#B${String(Date.now()).slice(-4)}`,
        branch: formData.branch,
        startDate: formData.checkIn,
        endDate: formData.checkOut,
        bookingTime: formData.checkInTime || "10:00",
        time: "10:00",
        status: "รอยืนยันคิว",
      },
      queue: {
        id: `Q${Date.now()}`,
        time: "10:00",
      },
    };
    setDataSets((prev) => [newEntry, ...prev]);
    setShowBooking(false);
    setShowMyBooking(true);
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================
  const handleCancelBooking = async (bookingId) => {
    try {
      await apiCancelReservation(bookingId);
      await loadCustomerData();
    } catch (err) {
      console.warn("apiCancelReservation error:", err);
    }
    setDataSets((prev) =>
      prev.map((item) =>
        item.booking?.id === bookingId || getPetId(item) === bookingId
          ? {
              ...item,
              booking: {
                ...item.booking,
                status: "ถูกปฏิเสธ",
              },
            }
          : item
      )
    );
  };

  // =====================================================
  // UPDATE PET STATUS
  // เปลี่ยนสถานะจริงจาก booking.status จุดเดียว
  // =====================================================
  const handlePetStatusChange = async (petId, newStatus) => {
    if (!PET_STATUSES.includes(newStatus)) {
      console.log("Invalid pet status:", newStatus);
      return;
    }
    try {
      // เรียก backend API หากเป็น staff/admin
      if (currentPage === "staff" || currentPage === "admin") {
        await apiUpdateStaffPetStatus({ id: petId, status: newStatus === "In Care" ? "สบายดี" : (newStatus === "ถูกปฏิเสธ" ? "ไม่สบาย" : newStatus) });
      }
    } catch (err) {
      console.warn("apiUpdateStaffPetStatus error:", err);
    }

    setDataSets((prev) =>
      prev.map((item) =>
        getPetId(item) === petId
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
  const handleQueueDecision = async (queueItem, accepted) => {
    const targetId = queueItem.bookingId || queueItem.id;
    try {
      await apiConfirmStaffReservation(targetId, accepted);
      await loadStaffData();
    } catch (err) {
      console.warn("apiConfirmStaffReservation error:", err);
    }
    const newStatus = accepted ? "In Care" : "ถูกปฏิเสธ";
    handlePetStatusChange(queueItem.petId || targetId, newStatus);
  };

  // =====================================================
  // STAFF ACTIVITY
  // =====================================================
  const handleActivity = async (item, action) => {
    const targetId = item.petId || item.id;
    const entryType = action === "รับเข้าพัก" ? "check-in" : "check-out";
    try {
      await apiRecordStaffPetEntry({
        id: targetId,
        type: entryType,
        timestamp: new Date().toISOString(),
      });
      await loadStaffData();
    } catch (err) {
      console.warn("apiRecordStaffPetEntry error:", err);
    }

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
        branch: item.branch,
        action,
        detail: `${action} • ${item.detail || ""}`,
        color: action === "รับเข้าพัก" ? "#174F83" : "#F39A13",
      },
      ...prev,
    ]);
  };

  // =====================================================
  // ADMIN CREATE STAFF
  // =====================================================
  const handleAdminCreateStaff = async (staffData) => {
    try {
      const res = await apiManagerRegisterStaff({
        username: staffData.username,
        email: staffData.email,
        phone: staffData.phone,
        password: staffData.password,
        branch_id: staffData.branch_id || null,
      });
      if (res.ok) {
        await loadAdminData();
        return true;
      } else {
        const msg =
          res.data?.message ||
          res.data?.error ||
          "ไม่สามารถสร้างบัญชีพนักงานได้";
        showLoginError(msg);
        return false;
      }
    } catch (err) {
      showLoginError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      return false;
    }
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
            onSubmit={handleForgotPasswordSubmit}
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
              const base =
                process.env.EXPO_PUBLIC_API_URL ||
                process.env.API_URL ||
                "http://localhost:3000";
              Linking.openURL(`${base}/api/oauth/google`);
            }}
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
                onCancelBooking={handleCancelBooking}
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
              staffName={activeUser?.name || "พนักงาน"}
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
            <HomepageAdmin
              onBack={() => {}}
              onCreateStaff={handleAdminCreateStaff}
              overviewData={adminOverview}
            />
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