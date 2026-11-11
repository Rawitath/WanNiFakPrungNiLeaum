import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, Platform, Linking } from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBranchValue } from "./2components/branchConfig";

import {
  apiLogin,
  apiRegister,
  apiForgetPassword,
  apiGetProfile,
  apiGetCustomerReservations,
  apiGetCustomerPets,
  apiCreateReservation,
  apiCancelReservation,
  apiGetStaffPets,
  apiRecordStaffPetEntry,
  apiGetStaffReservations,
  apiConfirmStaffReservation,
  apiGetManagerStatus,
  parseJwt,
  getAuthToken,
  clearAuthToken,
  apiManagerRegisterStaff,
  oAuthLogin,
  oAuthCallback
} from "./api";

import LogoutNavbar from "./2components/logoutnavbar";
import NavbarUser from "./2components/navbar_user";
import NavbarSA from "./2components/navbar_s_a";
import UserProfile from "./2components/userprofile";
import Popup from "./2components/popup";

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

const getPetId = (item) =>
  item?.pet?.id ||
  item?.booking?.id ||
  item?.owner?.id ||
  item?.pet?.name ||
  "";

const getBookingTimestamp = (booking) => {
  return (
    booking?.bookingTime ||
    booking?.booking_time ||
    booking?.bookingTimestamp ||
    booking?.booking_timestamp ||
    booking?.createdAt ||
    booking?.created_at ||
    booking?.requestedAt ||
    booking?.requested_at ||
    booking?.timestamp ||
    booking?.submittedAt ||
    booking?.submitted_at ||
    null
  );
};

const formatBookingTime = (value) => {
  if (!value) return "ไม่ได้ระบุ";

  let dateValue = value;

  // รองรับ Unix timestamp ทั้งวินาทีและมิลลิวินาที
  if (typeof dateValue === "number") {
    if (dateValue < 100000000000) {
      dateValue *= 1000;
    }
  } else if (
    typeof dateValue === "string" &&
    /^\d+$/.test(dateValue.trim())
  ) {
    dateValue = Number(dateValue);
    if (dateValue < 100000000000) {
      dateValue *= 1000;
    }
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatClockTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

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
  const processedOAuthCodeRef = useRef(null);

  // ตรวจจับ OAuth Callback (เช่น http://localhost:8081/oauth/google/callback หรือ deep link)                                                                                                     
      useEffect(() => {                                                             
        const handleOAuthUrl = async (rawUrl) => {                                  
          if (!rawUrl) return;                                                      
          try {                                                                     
            const parsedUrl = new URL(rawUrl, "http://localhost:8081");             
            if (                                                                    
              parsedUrl.pathname.includes("/oauth/google/callback") ||              
              parsedUrl.pathname.includes("/oauth/callback")                        
            ) {                                                                     
              const code = parsedUrl.searchParams.get("code");                      
              // ถ้าไม่มี code หรือ code นี้ถูกประมวลผลไปแล้ว ให้ข้ามทันที                      
              if (!code || processedOAuthCodeRef.current === code) return;          
              processedOAuthCodeRef.current = code;                                 
                                                                                    
              // เคลียร์ URL บน browser ทันทีเพื่อไม่ให้ค้าง query string                    
              if (Platform.OS === "web" && typeof window !== "undefined" &&         
              window.history?.replaceState) {                                       
                window.history.replaceState({}, document.title,                     
                window.location.pathname.replace(/\/oauth\/.*$/, "") || "/");       
              }                                                                     
                                                                                    
              const res = await oAuthCallback(code);                                
              if (!res.ok || !res.data?.accessToken) {                              
                showMessage(res.data?.message || res.data?.error ||                 
                "ยืนยันการเข้าสู่ระบบด้วย Google ไม่สำเร็จ");                                
                return;                                                             
              }                                                                     
              await processUserAuth(res.data.accessToken);                          
            }                                                                       
          } catch (err) {                                                           
            console.warn("handleOAuthUrl error:", err);                             
          }                                                                         
        }

    // 1. ตรวจสอบในโหมด Web
    if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
      handleOAuthUrl(window.location.href);
    }

    // 2. ตรวจสอบ Initial URL สำหรับ Native หรือ Deep Link
    Linking.getInitialURL().then((url) => {
      if (url) handleOAuthUrl(url);
    });

    // 3. ฟัง URL Event ในกรณี redirect กลับมาตอนแอปเปิดอยู่
    const subscription = Linking.addEventListener("url", (event) => {
      handleOAuthUrl(event.url);
    });

    return () => {
      subscription?.remove?.();
    };
  }, []);

  const [dataSets, setDataSets] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [adminOverview, setAdminOverview] = useState(null);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState("loginFailed");
  const [popupMessage, setPopupMessage] = useState("");

  const [fontsLoaded] = useFonts({
    Itim: require("./1assets/Itim-Regular.ttf"),
  });

  // =====================================================
  // FILTER USER DATA
  // =====================================================

  const userDatasets =
    activeUser && activeUser.role === "user"
      ? dataSets.filter((item) => {
          const uEmail = (activeUser.email || "").trim().toLowerCase();
          const itemEmail = (item.owner?.email || "").trim().toLowerCase();

          return Boolean(
            uEmail && itemEmail && itemEmail === uEmail
          );
        })
      : dataSets;

  // =====================================================
  // PET DATA
  // =====================================================

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
    owner: item.owner || {},
  }));

  // =====================================================
  // BOOKING DATA
  // =====================================================

  const bookings = userDatasets.map((item) => ({
    ...item.booking,
    id: item.booking.id || item.owner?.id || item.pet.id,
    pet: item.pet.name || "",
    petType: item.pet.petType || "",
    breed: item.pet.breed || "",
    gender: item.pet.gender || "",
    age: item.pet.birth || item.pet.age || "",
    weight: item.pet.weight || "",
    health: item.pet.health || "",
    careNotes: item.pet.careNotes || "",
    name: item.owner?.name || "",
    phone: item.owner?.phone || "",
    email: item.owner?.email || "",
    status: normalizePetStatus(item.booking.status),
  }));

  // =====================================================
  // STAFF PET DATA
  // =====================================================

  const staffPets = dataSets.map((item) => ({
    id: getPetId(item),
    name: item.pet.name || "",
    image: item.pet.image || require("./1assets/piclogo.png"),
    owner: item.owner?.name || "",
    status: normalizePetStatus(item.booking.status),
    branch: item.booking.branch || "",
    petId: getPetId(item),
    petName: item.pet.name,
    customerName: item.owner?.name,
    customerPhone: item.owner?.phone,
    customerEmail: item.owner?.email,
    bookingId: item.booking.id,
    checkIn: item.booking.startDate || item.booking.checkIn,
    checkOut: item.booking.endDate || item.booking.checkOut,
  }));

  // =====================================================
  // BOOKING QUEUE
  // =====================================================

  const bookingQueue = dataSets.map((item) => ({
    id: item.booking.id || item.queue?.id,
    bookingId: item.booking.id,
    petId: getPetId(item),
    time: item.queue?.time || item.booking.bookingTime || "10:00",
    name: item.pet.name || "",
    branch: item.booking.branch || "",
    status: normalizePetStatus(item.booking.status),
    detail: `${item.owner?.name || ""} - ${item.booking.startDate || ""} ถึง ${item.booking.endDate || ""}`,
    customerName: item.owner?.name,
    customerPhone: item.owner?.phone,
    customerEmail: item.owner?.email,
  }));

  // =====================================================
  // LOAD CUSTOMER DATA
  // =====================================================

  const loadCustomerData = async (userOverride = null) => {
    const customer = userOverride || activeUser;

    try {
      const [resRes, petsRes] = await Promise.all([
        apiGetCustomerReservations(),
        apiGetCustomerPets(),
      ]);

      const reservationRows = Array.isArray(resRes.data)
        ? resRes.data
        : (
            resRes.data?.reservations ||
            resRes.data?.data ||
            resRes.data?.items ||
            []
          );

      const petRows = Array.isArray(petsRes.data)
        ? petsRes.data
        : (
            petsRes.data?.pets ||
            petsRes.data?.data ||
            []
          );

      if (resRes.ok && Array.isArray(reservationRows)) {
        const backendPets =
          petsRes.ok && Array.isArray(petRows)
            ? petRows
            : [];

        const accountEmail = String(
          customer?.email || ""
        ).trim().toLowerCase();

        const ownReservations = accountEmail
          ? reservationRows.filter((r) =>
              String(
                r.customerEmail || r.email || ""
              ).trim().toLowerCase() === accountEmail
            )
          : reservationRows;

        const backendDataSets = ownReservations.map((r, idx) => {
          const matchedPet = backendPets.find((p) =>
            String(p.customerEmail || "").trim().toLowerCase() ===
              String(r.customerEmail || "").trim().toLowerCase() &&
            String(p.petName || "").trim().toLowerCase() ===
              String(r.petName || "").trim().toLowerCase()
          );

          const plannedIn = r.checkIn
            ? new Date(r.checkIn).getTime()
            : 0;

          const actualIn = matchedPet?.checkIn
            ? new Date(matchedPet.checkIn).getTime()
            : 0;

          const plannedOut = r.checkOut
            ? new Date(r.checkOut).getTime()
            : 0;

          const actualOut = matchedPet?.checkOut
            ? new Date(matchedPet.checkOut).getTime()
            : 0;

          const checkedIn =
            actualIn &&
            (!plannedIn || Math.abs(actualIn - plannedIn) > 60000);

          const checkedOut =
            actualOut &&
            (!plannedOut || Math.abs(actualOut - plannedOut) > 60000);

          const bookingStatus = matchedPet
            ? (
                checkedOut
                  ? "รับกลับแล้ว"
                  : checkedIn
                  ? "In Care"
                  : "รอรับเข้า"
              )
            : (
                r.status === "accepted" || r.status === "confirmed"
                  ? "รอรับเข้า"
                  : r.status === "in_care"
                  ? "In Care"
                  : r.status === "rejected" || r.status === "cancelled"
                  ? "ถูกปฏิเสธ"
                  : r.status === "completed"
                  ? "รับกลับแล้ว"
                  : "รอยืนยันคิว"
              );

          return {
            owner: {
              id: r.customerName || `O${idx}`,
              username: customer?.username || "",
              name: r.customerName || customer?.name || "ลูกค้า",
              phone: r.customerPhone || "",
              email: r.customerEmail || "",
            },

            pet: {
              id: String(
                matchedPet?.petId ||
                matchedPet?.id ||
                r.reservationId ||
                r.id ||
                idx
              ),
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
              branch: r.branch || r.branchName || r.branch_name || "",

              startDate: r.checkIn
                ? new Date(r.checkIn).toLocaleDateString("th-TH")
                : "",

              endDate: r.checkOut
                ? new Date(r.checkOut).toLocaleDateString("th-TH")
                : "",

              checkIn: r.checkIn
                ? new Date(r.checkIn).toLocaleDateString("th-TH")
                : "",

              checkOut: r.checkOut
                ? new Date(r.checkOut).toLocaleDateString("th-TH")
                : "",

              // เก็บเวลาที่กดจองจริง
              bookingTimestamp: getBookingTimestamp(r),

              bookingTime: formatBookingTime(
                getBookingTimestamp(r)
              ),

              checkInTime: r.checkIn
                ? formatClockTime(r.checkIn)
                : "",

              checkOutTime: r.checkOut
                ? formatClockTime(r.checkOut)
                : "",

              status: bookingStatus,
            },

            queue: {
              id: `Q${idx}`,
              time: formatBookingTime(
                r.bookingTime ||
                r.booking_time ||
                r.createdAt ||
                r.created_at ||
                r.requestedAt ||
                r.timestamp
              ),
            },
          };
        });

        setDataSets(backendDataSets);
      }
    } catch (err) {
      console.warn("loadCustomerData error:", err);
    }
  };

  // =====================================================
  // LOAD STAFF DATA
  // =====================================================

  const loadStaffData = async () => {
    try {
      const [resRes, petsRes] = await Promise.all([
        apiGetStaffReservations(),
        apiGetStaffPets(),
      ]);

      if (resRes.ok && Array.isArray(resRes.data)) {
        const backendPets =
          petsRes.ok && Array.isArray(petsRes.data)
            ? petsRes.data
            : [];

        const backendStaffSets = resRes.data.map((r, idx) => {
          const matchedPet = backendPets.find((p) =>
            String(p.customerEmail || "").trim().toLowerCase() ===
              String(r.customerEmail || "").trim().toLowerCase() &&
            String(p.petName || "").trim().toLowerCase() ===
              String(r.petName || "").trim().toLowerCase()
          );

          const statusMap = {
            pending: "รอยืนยันคิว",
            confirmed: "รอรับเข้า",
            accepted: "รอรับเข้า",
            in_care: "In Care",
            rejected: "ถูกปฏิเสธ",
            cancelled: "ถูกปฏิเสธ",
            completed: "รับกลับแล้ว",
          };

          let currentStatus =
            statusMap[r.status] || "รอยืนยันคิว";

          if (matchedPet) {
            const plannedIn = r.checkIn
              ? new Date(r.checkIn).getTime()
              : 0;

            const actualIn = matchedPet.checkIn
              ? new Date(matchedPet.checkIn).getTime()
              : 0;

            const plannedOut = r.checkOut
              ? new Date(r.checkOut).getTime()
              : 0;

            const actualOut = matchedPet.checkOut
              ? new Date(matchedPet.checkOut).getTime()
              : 0;

            const checkedIn =
              actualIn &&
              (!plannedIn || Math.abs(actualIn - plannedIn) > 60000);

            const checkedOut =
              actualOut &&
              (!plannedOut || Math.abs(actualOut - plannedOut) > 60000);

            currentStatus = checkedOut
              ? "รับกลับแล้ว"
              : checkedIn
              ? "In Care"
              : "รอรับเข้า";
          }

          return {
            owner: {
              id: r.customerName || `O${idx}`,
              name: r.customerName || "ลูกค้า",
              phone: r.customerPhone || "",
              email: r.customerEmail || "",
            },

            pet: {
              id: String(
                matchedPet?.petId ||
                matchedPet?.id ||
                r.reservationId ||
                r.id ||
                idx
              ),
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
              branch: r.branch || r.branchName || r.branch_name || "",
              startDate: r.checkIn
                ? new Date(r.checkIn).toLocaleDateString("th-TH")
                : "",
              endDate: r.checkOut
                ? new Date(r.checkOut).toLocaleDateString("th-TH")
                : "",
              checkIn: r.checkIn
                ? new Date(r.checkIn).toLocaleDateString("th-TH")
                : "",
              checkOut: r.checkOut
                ? new Date(r.checkOut).toLocaleDateString("th-TH")
                : "",
              bookingTime: formatBookingTime(
                r.bookingTime ||
                r.booking_time ||
                r.createdAt ||
                r.created_at ||
                r.requestedAt ||
                r.timestamp
              ),
              status: currentStatus,
            },

            queue: {
              id: `Q${idx}`,
              time: formatBookingTime(
                r.bookingTime ||
                r.booking_time ||
                r.createdAt ||
                r.created_at ||
                r.requestedAt ||
                r.timestamp
              ),
            },
          };
        });

        setDataSets(backendStaffSets);

        const initialActivities = backendStaffSets
          .filter(
            (item) =>
              item.booking.status === "รอรับเข้า" ||
              item.booking.status === "In Care"
          )
          .map((item) => ({
            id: `ACT-${item.booking.id}`,
            name: item.pet.name,
            petId: getPetId(item),
            bookingId: item.booking.id,
            branch: item.booking.branch,
            action:
              item.booking.status === "In Care"
                ? "รับกลับ"
                : "รับเข้าพัก",
            detail: `${
              item.booking.status === "In Care"
                ? "รับกลับ"
                : "รับเข้าพัก"
            } • ${item.owner.name} - ${item.booking.startDate} ถึง ${item.booking.endDate}`,
          }));

        setActivityList(initialActivities);
      }
    } catch (err) {
      console.warn("loadStaffData error:", err);
    }
  };

  // =====================================================
  // RESTORE PAGE AFTER REFRESH
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const restoreAppState = async () => {
      try {
        const savedText = await AsyncStorage.getItem(APP_STORAGE_KEY);
        const savedState = savedText ? JSON.parse(savedText) : {};
        const token = await getAuthToken();

        if (token) {
          const payload = parseJwt(token) || {};

          const tokenExpired =
            payload.exp &&
            Number(payload.exp) * 1000 <= Date.now();

          if (tokenExpired) {
            await clearAuthToken();
          } else {
            const backendRole = String(
              payload.role || savedState.role || ""
            ).toLowerCase();

            const role =
              backendRole === "customer"
                ? "user"
                : backendRole === "manager"
                ? "admin"
                : backendRole;

            if (["user", "staff", "admin"].includes(role)) {
              const profileResult = await apiGetProfile();

              const profile = profileResult.ok
                ? profileResult.data || {}
                : {};

              const userObj = {
                userid:
                  payload.userid ||
                  payload.userId ||
                  payload.id ||
                  payload.sub ||
                  "",
                username:
                  profile.username ||
                  payload.username ||
                  savedState.username ||
                  "",
                name:
                  profile.username ||
                  payload.username ||
                  savedState.name ||
                  "ผู้ใช้",
                email:
                  profile.email ||
                  payload.email ||
                  savedState.email ||
                  "",
                phone:
                  profile.phone ||
                  payload.phone ||
                  savedState.phone ||
                  "",
                role,
              };

              const savedAccountKey = String(
                savedState.accountKey || ""
              );

              const currentAccountKeys = [
                userObj.userid,
                userObj.email,
                userObj.username,
              ]
                .map((value) =>
                  String(value || "").trim().toLowerCase()
                )
                .filter(Boolean);

              const sameAccount =
                !savedAccountKey ||
                currentAccountKeys.includes(
                  savedAccountKey.trim().toLowerCase()
                );

              if (cancelled) return;

              setActiveUser(userObj);
              setCurrentPage(role);

              setShowRegister(false);
              setShowForgotPassword(false);

              setShowProfile(
                sameAccount && Boolean(savedState.showProfile)
              );

              if (role === "user" && sameAccount) {
                const restoreBooking = Boolean(
                  savedState.showBooking
                );

                const restoreMyBooking = Boolean(
                  savedState.showMyBooking
                );

                setShowBooking(restoreBooking);

                setShowMyBooking(
                  !restoreBooking && restoreMyBooking
                );
              } else {
                setShowBooking(false);
                setShowMyBooking(false);
              }

              // โหลดข้อมูลใหม่จาก Backend ตามบัญชีที่ Login อยู่
              if (role === "user") {
                await loadCustomerData(userObj);
              } else if (role === "staff") {
                await loadStaffData();
              } else if (role === "admin") {
                const overview = await apiGetManagerStatus();

                if (!cancelled && overview.ok) {
                  setAdminOverview(overview.data);
                }
              }

              return;
            }
          }
        }

        if (cancelled) return;

        setActiveUser(null);
        setShowBooking(false);
        setShowMyBooking(false);
        setShowProfile(false);

        // กรณีที่ยังอยู่หน้า Login ก่อน Refresh
        if (savedState.currentPage === "login") {
          setCurrentPage("login");

          setShowRegister(
            Boolean(savedState.showRegister)
          );

          setShowForgotPassword(
            Boolean(savedState.showForgotPassword)
          );
        } else {
          setCurrentPage("guest");
          setShowRegister(false);
          setShowForgotPassword(false);
        }
      } catch (error) {
        console.warn("restoreAppState error:", error);

        if (!cancelled) {
          setActiveUser(null);
          setShowBooking(false);
          setShowMyBooking(false);
          setShowProfile(false);
          setShowRegister(false);
          setShowForgotPassword(false);
          setCurrentPage("guest");
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    };

    restoreAppState();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // SAVE CURRENT PAGE
  // =====================================================

  useEffect(() => {
    if (isRestoring) return;

    const pageState = {
      currentPage,

      showRegister:
        currentPage === "login" && showRegister,

      showForgotPassword:
        currentPage === "login" && showForgotPassword,

      showBooking:
        currentPage === "user" && showBooking,

      showMyBooking:
        currentPage === "user" && showMyBooking,

      showProfile: Boolean(activeUser && showProfile),

      role: activeUser?.role || "",

      accountKey: activeUser
        ? String(
            activeUser.userid ||
            activeUser.email ||
            activeUser.username ||
            ""
          )
        : "",

      username: activeUser?.username || "",
      name: activeUser?.name || "",
      email: activeUser?.email || "",
      phone: activeUser?.phone || "",
    };

    AsyncStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify(pageState)
    ).catch((error) => {
      console.warn("save app page state error:", error);
    });
  }, [
    isRestoring,
    currentPage,
    showRegister,
    showForgotPassword,
    showBooking,
    showMyBooking,
    showProfile,
    activeUser,
  ]);

  // =====================================================
  // ADD BOOKING
  // =====================================================

  const handleBookingSubmit = async (formData) => {
    const selectedBranch = getBranchValue(formData?.branch);

    if (!selectedBranch) {
      showMessage("กรุณาเลือกสาขาก่อนยืนยันการจอง");
      return;
    }

    // บันทึกเวลาจริง ณ ตอนที่กดปุ่มจองคิว
    const bookingTimestamp = new Date().toISOString();

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

      // เวลาที่กดจองคิว
      timestamp: bookingTimestamp,
      bookingTime: bookingTimestamp,
      createdAt: bookingTimestamp,

      // วันและเวลาที่ฝากสัตว์เลี้ยง
      checkIn: toIsoDateTime(
        formData.checkIn,
        formData.checkInTime
      ),

      // วันและเวลาที่รับสัตว์เลี้ยงกลับ
      checkOut: toIsoDateTime(
        formData.checkOut,
        formData.checkOutTime
      ),

      branch: selectedBranch,
    };

    try {
      const res = await apiCreateReservation(reservationPayload);

      if (!res.ok) {
        showMessage(
          res.data?.message ||
          res.data?.error ||
          "บันทึกการจองไม่สำเร็จ"
        );
        return;
      }

      await loadCustomerData();

      setShowBooking(false);
      setShowMyBooking(true);

      showMessage("ส่งคำขอจองสำเร็จ สถานะรอการยืนยันคิว");

    } catch (err) {
      console.warn("apiCreateReservation error:", err);

      showMessage(
        "เชื่อมต่อ Backend ไม่สำเร็จ จึงยังไม่ได้บันทึกการจอง"
      );
    }
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const handleCancelBooking = async (bookingId) => {
    try {
      const result = await apiCancelReservation(bookingId);

      if (!result.ok) {
        showMessage(
          result.data?.message ||
          result.data?.error ||
          "ยกเลิกการจองไม่สำเร็จ"
        );
        return;
      }

      await loadCustomerData();

      showMessage("ส่งคำขอยกเลิกการจองแล้ว");
    } catch (error) {
      console.warn("handleCancelBooking error:", error);
      showMessage("เชื่อมต่อ Backend ไม่สำเร็จ");
    }
  };

  // =====================================================
  // CONFIRM / REJECT QUEUE (STAFF)
  // =====================================================

  const handleQueueDecision = async (queueItem, accepted) => {
    const targetId = queueItem.bookingId || queueItem.id;

    try {
      const result = await apiConfirmStaffReservation(
        targetId,
        accepted
      );

      if (!result.ok) {
        setPopupType("loginFailed");

        setPopupMessage(
          result.data?.message ||
          result.data?.error ||
          "ไม่สามารถบันทึกผลการยืนยันคิวได้"
        );

        setPopupVisible(true);
        return;
      }
    } catch (err) {
      console.warn("apiConfirmStaffReservation error:", err);

      setPopupType("loginFailed");
      setPopupMessage(
        "เชื่อมต่อ Backend ไม่สำเร็จ ไม่ได้เปลี่ยนสถานะคิว"
      );
      setPopupVisible(true);

      return;
    }

    if (accepted) {
      setDataSets((prev) =>
        prev.map((item) =>
          item.booking.id === targetId ||
          getPetId(item) === queueItem.petId
            ? {
                ...item,
                booking: {
                  ...item.booking,
                  status: "รอรับเข้า",
                },
              }
            : item
        )
      );

      setActivityList((prev) => [
        {
          id: `ACT-${targetId}`,
          name: queueItem.name || queueItem.petName,
          petId: queueItem.petId,
          bookingId: targetId,
          branch: queueItem.branch,
          action: "รับเข้าพัก",
          detail: `รับเข้าพัก • ${queueItem.detail}`,
        },
        ...prev.filter((a) => a.bookingId !== targetId),
      ]);
    } else {
      setDataSets((prev) =>
        prev.map((item) =>
          item.booking.id === targetId ||
          getPetId(item) === queueItem.petId
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

      setActivityList((prev) =>
        prev.filter((a) => a.bookingId !== targetId)
      );
    }

    if (accepted) {
      await loadStaffData();
    }
  };

  // =====================================================
  // STAFF ACTIVITY
  // =====================================================

  const handleActivity = async (item, action) => {
    const targetId = item.petId || item.id || item.bookingId;

    const entryType =
      action === "รับเข้าพัก"
        ? "check-in"
        : "check-out";

    try {
      const result = await apiRecordStaffPetEntry({
        id: targetId,
        type: entryType,
        timestamp: new Date().toISOString(),
      });

      if (!result.ok) {
        setPopupType("loginFailed");

        setPopupMessage(
          result.data?.message ||
          result.data?.error ||
          "บันทึกเวลาเข้า-ออกไม่สำเร็จ"
        );

        setPopupVisible(true);
        return;
      }
    } catch (err) {
      console.warn("apiRecordStaffPetEntry error:", err);

      setPopupType("loginFailed");
      setPopupMessage("เชื่อมต่อ Backend ไม่สำเร็จ");
      setPopupVisible(true);

      return;
    }

    if (action === "รับเข้าพัก") {
      setDataSets((prev) =>
        prev.map((d) =>
          d.booking.id === targetId ||
          getPetId(d) === item.petId
            ? {
                ...d,
                booking: {
                  ...d.booking,
                  status: "In Care",
                },
              }
            : d
        )
      );

      setActivityList((prev) =>
        prev.map((a) =>
          a.id === item.id || a.bookingId === targetId
            ? {
                ...a,
                action: "รับกลับ",
                detail: `รับกลับ • ${item.detail || ""}`,
              }
            : a
        )
      );
    } else if (action === "รับกลับ") {
      setDataSets((prev) =>
        prev.map((d) =>
          d.booking.id === targetId ||
          getPetId(d) === item.petId
            ? {
                ...d,
                booking: {
                  ...d.booking,
                  status: "รับกลับแล้ว",
                },
              }
            : d
        )
      );

      setActivityList((prev) =>
        prev.filter(
          (a) =>
            a.bookingId !== targetId &&
            a.id !== item.id
        )
      );
    }
  };

  // =====================================================
  // PET STATUS CHANGE
  // =====================================================

  const handlePetStatusChange = async (petId, newStatus) => {
    setDataSets((prev) =>
      prev.map((item) =>
        getPetId(item) === petId ||
        item.booking.id === petId
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
  };

  // =====================================================
  // POPUP MESSAGE
  // =====================================================

  const showMessage = (message) => {
    setPopupType("loginFailed");
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const processUserAuth = async (token) => {
    const payload = parseJwt(token);
    const backendRole = String(payload?.role || "customer").toLowerCase();
    const role = backendRole === "customer" ? "user" :
      backendRole === "manager" ? "admin" : backendRole;

    const profRes = await apiGetProfile();
    const profile = profRes.ok ? profRes.data : {};
    const userObj = {
      userid: payload?.userid || "",
      username: profile.username || payload?.username || payload?.email || "ผู้ใช้งาน",
      name: profile.username || profile.name || payload?.name || payload?.email || "ผู้ใช้งาน",
      email: profile.email || payload?.email || "",
      phone: profile.phone || payload?.phone || "",
      role,
    };

    setActiveUser(userObj);
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);
    setCurrentPage(role);
    setDataSets([]);

    if (role === "user") await loadCustomerData(userObj);
    else if (role === "staff") await loadStaffData();
    else if (role === "admin") {
      const overview = await apiGetManagerStatus();
      if (overview.ok) setAdminOverview(overview.data);
    }
  };

  const handleLogin = async (username, password) => {
    if (!username?.trim() || !password) {
      showMessage("กรุณากรอกชื่อบัญชีและรหัสผ่าน");
      return;
    }

    try {
      const res = await apiLogin({
        username: username.trim(),
        password,
      });

      if (!res.ok || !res.data?.accessToken) {
        showMessage(
          res.data?.message ||
          res.data?.error ||
          "ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง"
        );
        return;
      }

      await processUserAuth(res.data.accessToken);
    } catch (err) {
      console.warn("handleLogin error:", err);

      showMessage(
        "ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบการเชื่อมต่อ Backend"
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const loginUrl = await oAuthLogin();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = loginUrl;
      } else {
        await Linking.openURL(loginUrl);
      }
    } catch (err) {
      console.warn("handleGoogleLogin error:", err);
      showMessage("ไม่สามารถเปิดหน้าเข้าสู่ระบบของ Google ได้");
    }
  };

  const handleRegister = async (username, email, phone, password, confirmPassword) => {
    if (!username?.trim() || !email?.trim() || !phone?.trim() || !password) {
      showMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    const result = await apiRegister({
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });

    if (!result.ok) {
      showMessage(
        result.data?.message ||
        result.data?.error ||
        "สมัครสมาชิกไม่สำเร็จ"
      );
      return;
    }

    setShowRegister(false);
    setCurrentPage("login");

    showMessage("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async (email) => {
    const result = await apiForgetPassword({
      username: email.trim(),
    });

    if (!result.ok) {
      showMessage(
        result.data?.message ||
        result.data?.error ||
        "ส่งคำขอไม่สำเร็จ"
      );
      return;
    }

    setShowForgotPassword(false);
    setCurrentPage("login");

    showMessage(
      "หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้"
    );
  };

  // =====================================================
  // CREATE STAFF
  // =====================================================

  const handleCreateStaff = async (staffData) => {
    const result = await apiManagerRegisterStaff(staffData);

    if (!result.ok) {
      throw new Error(
        result.data?.message ||
        result.data?.error ||
        "สร้างบัญชีพนักงานไม่สำเร็จ"
      );
    }

    return true;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    await clearAuthToken();

    setActiveUser(null);
    setDataSets([]);
    setActivityList([]);

    setShowBooking(false);
    setShowMyBooking(false);
    setShowProfile(false);

    setShowRegister(false);
    setShowForgotPassword(false);

    setCurrentPage("guest");
  };

  // =====================================================
  // WAIT FOR PAGE RESTORE
  // =====================================================

  if (isRestoring) {
    return <View style={styles.container} />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View style={styles.container}>
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

      {currentPage === "login" && !showRegister && !showForgotPassword && (
        <Login
          onBack={() => setCurrentPage("guest")}
          onLogin={handleLogin}
          onRegister={() => setShowRegister(true)}
          onForgotPassword={() => setShowForgotPassword(true)}
          onGoogleLogin={handleGoogleLogin}
        />
      )}

      {currentPage === "login" && showRegister && (
        <Register
          onBack={() => setShowRegister(false)}
          onRegister={handleRegister}
          onLogin={() => {
            setShowRegister(false);
            setCurrentPage("login");
          }}
        />
      )}

      {currentPage === "login" && showForgotPassword && (
        <ForgotPassword
          onBack={() => setShowForgotPassword(false)}
          onSubmit={handleForgotPassword}
        />
      )}

      {currentPage === "user" && (
        <View style={styles.userContainer}>
          <NavbarUser
            onProfile={() => setShowProfile(true)}
            onMyBooking={() => {
              setShowMyBooking(true);
              setShowBooking(false);
            }}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>
            {showBooking ? (
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
                onBooking={() => setShowBooking(true)}
              />
            )}
          </View>
        </View>
      )}

      {currentPage === "staff" && (
        <View style={styles.userContainer}>
          <NavbarSA
            onProfile={() => setShowProfile(true)}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>
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

      {currentPage === "admin" && (
        <View style={styles.userContainer}>
          <NavbarSA
            onProfile={() => setShowProfile(true)}
            onLogout={handleLogout}
          />

          <View style={styles.pageContent}>
            <HomepageAdmin
              overviewData={adminOverview}
              onCreateStaff={handleCreateStaff}
            />
          </View>
        </View>
      )}

      <UserProfile
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        name={activeUser?.name || ""}
        phone={activeUser?.phone || ""}
        email={activeUser?.email || ""}
      />

      <Popup
        visible={popupVisible}
        type={popupType}
        message={popupMessage}
        onClose={() => setPopupVisible(false)}
      />
    </View>
  );
}

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
