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
  apiUpdateStaffPetHealth,
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
import { getBranchValue } from "./2components/branchConfig";
const APP_STORAGE_KEY = "pet_app_page_state";
// =====================================================
// PET STATUS
// สถานะการจองเก็บไว้ที่ booking.status เพียงจุดเดียว
// =====================================================
const PET_STATUSES = [
  "รอยืนยันคิว",
  "รอรับเข้า",
  "In Care",
  "พร้อมรับกลับ",
  "รับกลับแล้ว",
  "ถูกปฏิเสธ",
];
const normalizePetStatus = (status) => {
  const backendStatuses = {
    pending: "รอยืนยันคิว",
    accepted: "รอรับเข้า",
    confirmed: "รอรับเข้า",
    rejected: "ถูกปฏิเสธ",
    cancelled: "ถูกปฏิเสธ",
    completed: "รับกลับแล้ว",
    in_care: "In Care",
    "in care": "In Care",
    confirmed: "รอรับเข้า",
    "อยู่ระหว่างดูแล": "In Care",
    "รอรับกลับ": "พร้อมรับกลับ",
    "พร้อมรับกลับบ้าน": "พร้อมรับกลับ",
    "รับกลับบ้านแล้ว": "รับกลับแล้ว",
    "ปฏิเสธแล้ว": "ถูกปฏิเสธ",
  };
  const normalizedStatus = backendStatuses[status] || status;
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
// เริ่มแรกทุกบัญชีจะไม่มีสัตว์อยู่เลย
// =====================================================
const INITIAL_DATA = [];
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
    branch: getBranchValue(oldBooking.branch || oldBooking.branchName || oldBooking.branch_name || ""),
    branchId: oldBooking.branchId || oldBooking.branch_id || null,
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
  const [adminOverview, setAdminOverview] = useState(null);
  // USER PET DATA & BOOKINGS
  // เริ่มแรกทุกบัญชีจะไม่มีสัตว์อยู่เลย ผู้ใช้จะเห็นเฉพาะสัตว์และการจองของบัญชีตนเอง
  const userDatasets =
    activeUser && activeUser.role === "user"
      ? dataSets.filter((item) => {
          const uName = (activeUser.username || "").toLowerCase();
          const uEmail = (activeUser.email || "").toLowerCase();
          const itemUName = (item.owner?.username || "").toLowerCase();
          const itemEmail = (item.owner?.email || "").toLowerCase();
          const itemName = item.owner?.name || "";
          return (
            (itemUName && itemUName === uName) ||
            (itemEmail && itemEmail === uEmail) ||
            (itemName && itemName === activeUser.name)
          );
        })
      : dataSets;

  // ส่งข้อมูลสัตว์เลี้ยงพร้อมข้อมูลการจองให้หน้า PetDetails
  const pets = userDatasets.map((item) => ({
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
  const bookings = userDatasets.map((item) => ({
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
  // รายการที่ยืนยันคิวแล้วจะย้ายมาอยู่ในบันทึกเข้า-ออกรับคืน
  // รอรับเข้า = ปุ่มรับเข้าพัก, In Care/รอรับกลับ = ปุ่มรับกลับ
  const staffActivityList = dataSets
    .filter((item) =>
      ["รอรับเข้า", "In Care", "พร้อมรับกลับ"].includes(
        normalizePetStatus(item.booking?.status)
      )
    )
    .map((item) => {
      const status = normalizePetStatus(item.booking?.status);
      return {
        id: `ACT-${item.booking?.id || getPetId(item)}`,
        petId: getPetId(item),
        bookingId: item.booking?.id,
        name: item.pet?.name || "",
        branch: item.booking?.branch || "",
        branchId: item.booking?.branchId || null,
        action: status === "รอรับเข้า" ? "รับเข้าพัก" : "รับกลับ",
        detail: `${item.owner?.name || ""} - ${item.booking?.startDate || item.booking?.checkIn || ""} ถึง ${item.booking?.endDate || item.booking?.checkOut || ""}`,
        color: status === "รอรับเข้า" ? "#174F83" : "#FACC15",
      };
    });

  // STAFF PET DATA
  const staffPets = dataSets.map((item) => ({
    id: getPetId(item),
    name: item.pet.name || "",
    image: item.pet.image || require("./1assets/piclogo.png"),
    owner: item.owner?.name || "",
    status: normalizePetStatus(item.booking.status),
    branch: item.booking.branch || item.pet.branch || "",
    branchId: item.booking.branchId || item.pet.branchId || null,
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

    reservationDate:
      item.booking.reservationDate ||
      item.booking.reservation_date ||
      null,

    time: item.queue?.time || item.booking.bookingTime || item.booking.time || "--:--",
    name: item.pet.name || "",
    branch: item.booking.branch || "",
    branchId: item.booking.branchId || null,
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
  const [accounts, setAccounts] = useState([]);
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
          let restoredData = [];
          if (Array.isArray(data.dataSets)) {
            const hasOldMock = data.dataSets.some((d) => d?.owner?.name === "คุณวิลักษณ์");
            if (!hasOldMock) {
              restoredData = data.dataSets.map(cleanSavedData);
            }
          }
          setDataSets(restoredData);
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

  const loadCustomerData = async () => {
    try {
      const [resRes, petRes] = await Promise.all([
        apiGetCustomerReservations(),
        apiGetCustomerPets(),
      ]);

      const customerPetRows = Array.isArray(petRes?.data)
        ? petRes.data
        : Array.isArray(petRes?.data?.pets)
        ? petRes.data.pets
        : [];

      if (resRes.ok && Array.isArray(resRes.data)) {
        const backendDataSets = resRes.data.map((r, idx) => {
          const branchName = getBranchValue(r.branch || r.branch_name || "");
          const reservationId = String(r.reservationId || r.id || idx);
          const matchedPet = customerPetRows.find((pet) => {
            const sameName =
              String(pet.petName || pet.pet_name || "").trim().toLowerCase() ===
              String(r.petName || r.pet_name || "").trim().toLowerCase();
            const reservationEmail = String(r.customerEmail || r.customer_email || "").trim().toLowerCase();
            const petEmail = String(pet.customerEmail || pet.customer_email || "").trim().toLowerCase();
            const sameEmail = !reservationEmail || !petEmail || reservationEmail === petEmail;
            const petBranch = getBranchValue(pet.branch || pet.branch_name || "");
            const sameBranch = !branchName || !petBranch || branchName === petBranch;
            // ไม่เทียบวัน check-in เพราะ Backend จะเขียนเวลาจริงทับ check_in
            // เมื่อเจ้าหน้าที่กดรับเข้า ทำให้วันจริงอาจไม่ตรงกับวันที่จองไว้
            return sameName && sameEmail && sameBranch;
          });

          const lifecycleStatus = matchedPet?.status;
          const isLifecycleStatus = ["In Care", "พร้อมรับกลับ", "รับกลับแล้ว"].includes(lifecycleStatus);
          const bookingStatus = isLifecycleStatus
            ? lifecycleStatus
            : normalizePetStatus(r.status);

          return {
            owner: {
              id: r.customerName || r.customer_name || `O${idx}`,
              username: activeUser?.username || "",
              name: r.customerName || r.customer_name || activeUser?.name || "ลูกค้า",
              phone: r.customerPhone || r.customer_phone || "",
              email: r.customerEmail || r.customer_email || "",
            },
            pet: {
              id: String(matchedPet?.petId || matchedPet?.pet_id || reservationId),
              branch: branchName,
              branchId: r.branchId || r.branch_id || matchedPet?.branchId || matchedPet?.branch_id || null,
              name: r.petName || r.pet_name || "สัตว์เลี้ยง",
              petType: r.petType || r.pet_type || "สุนัข",
              breed: r.petBreed || r.pet_breed || "",
              gender: r.petSex || r.pet_sex || "ผู้",
              birth: r.petBirth || r.pet_birth || "",
              weight: String(r.petWeight || r.pet_weight || ""),
              health: r.petCondition || r.pet_condition || "",
              careNotes: r.petNote || r.pet_note || "",
              image: require("./1assets/piclogo.png"),
            },
            booking: {
              id: reservationId,
              branch: branchName,
              branchId: r.branchId || r.branch_id || matchedPet?.branchId || matchedPet?.branch_id || null,
              reservationDate: r.reservationDate || r.reservation_date || null,
              startDate: (r.checkIn || r.check_in) ? new Date(r.checkIn || r.check_in).toLocaleDateString("th-TH") : "",
              endDate: (r.checkOut || r.check_out) ? new Date(r.checkOut || r.check_out).toLocaleDateString("th-TH") : "",
              checkIn: (r.checkIn || r.check_in) ? new Date(r.checkIn || r.check_in).toLocaleDateString("th-TH") : "",
              checkOut: (r.checkOut || r.check_out) ? new Date(r.checkOut || r.check_out).toLocaleDateString("th-TH") : "",
              bookingTime: (r.reservationDate || r.reservation_date)
                ? new Date(r.reservationDate || r.reservation_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "10:00",
              time: "10:00",
              status: bookingStatus,
            },
            queue: { id: `Q${idx}`, time: "10:00" },
          };
        });
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

      if (resRes.ok && Array.isArray(resRes.data)) {
        const staffPetRows = Array.isArray(petRes?.data)
          ? petRes.data
          : Array.isArray(petRes?.data?.pets)
          ? petRes.data.pets
          : [];

        const backendStaffSets = resRes.data.map((r, idx) => {
          const reservationId = String(r.reservationId || r.id || idx);
          const branchName = getBranchValue(r.branch || r.branch_name || "");
          const branchId = r.branchId || r.branch_id || null;
          const matchedPet = staffPetRows.find((pet) => {
            const sameName = String(pet.petName || pet.pet_name || "").trim().toLowerCase() ===
              String(r.petName || "").trim().toLowerCase();
            const sameEmail = !r.customerEmail || !pet.customerEmail ||
              String(pet.customerEmail).trim().toLowerCase() === String(r.customerEmail).trim().toLowerCase();
            const sameBranch = branchId && (pet.branchId || pet.branch_id)
              ? String(pet.branchId || pet.branch_id) === String(branchId)
              : getBranchValue(pet.branch || pet.branch_name || "") === branchName;
            return sameName && sameEmail && sameBranch;
          });

          // หลังยืนยันคิว Backend สร้าง pet_id ใหม่ จึงต้องใช้ petId จาก /staff/pets
          // เพื่อให้การบันทึกเข้า-ออกรับคืนอ้างอิงรหัสสัตว์ที่ถูกต้อง
          const actualPetId = matchedPet?.petId || matchedPet?.pet_id || reservationId;
          const plannedCheckIn = r.checkIn || r.check_in;
          const plannedCheckOut = r.checkOut || r.check_out;
          const actualCheckIn = matchedPet?.checkIn || matchedPet?.check_in;
          const actualCheckOut = matchedPet?.checkOut || matchedPet?.check_out;
          const hasCheckedOut = Boolean(actualCheckOut && plannedCheckOut &&
            Math.abs(new Date(actualCheckOut).getTime() - new Date(plannedCheckOut).getTime()) > 60000);
          const hasCheckedIn = Boolean(actualCheckIn && plannedCheckIn &&
            Math.abs(new Date(actualCheckIn).getTime() - new Date(plannedCheckIn).getTime()) > 60000);
          let bookingStatus = normalizePetStatus(r.status);
          const petLifecycleStatus = matchedPet?.status;
          if (["In Care", "พร้อมรับกลับ", "รับกลับแล้ว"].includes(petLifecycleStatus)) {
            bookingStatus = petLifecycleStatus;
          }
          if (hasCheckedOut) bookingStatus = "รับกลับแล้ว";
          else if (hasCheckedIn && bookingStatus === "รอรับเข้า") bookingStatus = "In Care";

          return {
            owner: {
              id: r.customerName || `O${idx}`,
              name: r.customerName || "ลูกค้า",
              phone: r.customerPhone || "",
              email: r.customerEmail || "",
            },
            pet: {
              id: String(actualPetId),
              branch: branchName,
              branchId,
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
              id: reservationId,
              branch: branchName,
              branchId,
              reservationDate: r.reservationDate || r.reservation_date || null,
              startDate: plannedCheckIn ? new Date(plannedCheckIn).toLocaleDateString("th-TH") : "",
              endDate: plannedCheckOut ? new Date(plannedCheckOut).toLocaleDateString("th-TH") : "",
              checkIn: plannedCheckIn ? new Date(plannedCheckIn).toLocaleDateString("th-TH") : "",
              checkOut: plannedCheckOut ? new Date(plannedCheckOut).toLocaleDateString("th-TH") : "",
              bookingTime: r.reservationDate ? new Date(r.reservationDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00",
              time: "10:00",
              status: bookingStatus,
            },
            queue: { id: `Q${idx}`, time: "10:00" },
          };
        });
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
      branch: getBranchValue(formData.branch) || "ลาดกระบัง",
    };

    try {
      const res = await apiCreateReservation(reservationPayload);
      if (!res?.ok) {
        const message = res?.data?.error || res?.data?.message || "ไม่สามารถบันทึกการจองได้ กรุณาลองใหม่";
        showLoginError(message);
        return;
      }

      await loadCustomerData();
      setShowBooking(false);
      setShowMyBooking(true);
      setPopupType("loginFailed");
      setPopupMessage("การจองสำเร็จแล้ว!");
      setPopupVisible(true);
    } catch (err) {
      console.warn("apiCreateReservation error:", err);
      showLoginError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ จึงยังไม่ได้บันทึกการจอง");
    }
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
    const allowedStatuses = ["In Care", "พร้อมรับกลับ"];
    if (!allowedStatuses.includes(newStatus)) {
      console.log("Invalid pet status:", newStatus);
      return;
    }

    try {
      const result = await apiUpdateStaffPetHealth({ id: petId, status: newStatus });
      if (!result?.ok) {
        console.warn("อัปเดตสถานะสัตว์ไม่สำเร็จ:", result?.data);
        return;
      }

      setDataSets((prev) =>
        prev.map((item) =>
          String(getPetId(item)) === String(petId)
            ? { ...item, booking: { ...item.booking, status: newStatus } }
            : item
        )
      );
      setSelectedPet((prev) =>
        prev && String(prev.id) === String(petId)
          ? { ...prev, status: newStatus }
          : prev
      );
    } catch (err) {
      console.warn("apiUpdateStaffPetHealth error:", err);
    }
  };

  // =====================================================
  // CONFIRM / REJECT BOOKING QUEUE
  // =====================================================
  const handleQueueDecision = async (queueItem, accepted) => {
    const targetId = queueItem.bookingId || queueItem.id;
    try {
      const result = await apiConfirmStaffReservation(targetId, accepted);
      if (!result?.ok) {
        console.warn("ยืนยัน/ปฏิเสธคิวไม่สำเร็จ:", result?.data);
        return;
      }
      await loadStaffData();
    } catch (err) {
      console.warn("apiConfirmStaffReservation error:", err);
      return;
    }
    const newStatus = accepted ? "รอรับเข้า" : "ถูกปฏิเสธ";
    setDataSets((prev) =>
      prev.map((item) =>
        String(item.booking?.id) === String(targetId)
          ? { ...item, booking: { ...item.booking, status: newStatus } }
          : item
      )
    );
  };

  // =====================================================
  // STAFF ACTIVITY
  // =====================================================
  const handleActivity = async (item, action) => {
    const targetId = item.petId || item.id;
    const entryType = action === "รับเข้าพัก" ? "check-in" : "check-out";

    try {
      const result = await apiRecordStaffPetEntry({
        id: String(targetId),
        type: entryType,
        timestamp: new Date().toISOString(),
      });

      if (!result?.ok) {
        console.warn("บันทึกการรับเข้า-รับกลับไม่สำเร็จ:", result?.data);
        return;
      }

      // Backend ของโปรเจกต์นี้เปลี่ยน pets.status ให้แล้วใน endpoint /staff/pets/entry
      // check-in => In Care, check-out => รับกลับแล้ว
      const newStatus = action === "รับเข้าพัก" ? "In Care" : "รับกลับแล้ว";

      setDataSets((prev) =>
        prev.map((row) =>
          String(getPetId(row)) === String(targetId)
            ? { ...row, booking: { ...row.booking, status: newStatus } }
            : row
        )
      );

      await loadStaffData();
    } catch (err) {
      console.warn("apiRecordStaffPetEntry error:", err);
      return;
    }

    setActivityList((prev) => [
      {
        id: `A${Date.now()}`,
        name: item.name || "",
        petId: item.petId || null,
        branch: item.branch,
        action,
        detail: `${action} • ${item.detail || ""}`,
        color: action === "รับเข้าพัก" ? "#174F83" : "#FACC15",
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
              activityList={staffActivityList}
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