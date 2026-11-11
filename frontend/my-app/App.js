import React, { useState, useEffect } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  apiLogin,
  apiRegister,
  apiForgetPassword,
  apiGetProfile,
  apiGetCustomerReservations,
  apiCreateReservation,
  apiGetStaffPets,
  apiUpdateStaffPetStatus,
  apiRecordStaffPetEntry,
  apiGetStaffReservations,
  apiConfirmStaffReservation,
  apiGetManagerStatus,
  parseJwt,
  clearAuthToken,
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
  item?.pet?.id || item?.booking?.id || item?.owner?.id || item?.pet?.name || "";

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

  const [dataSets, setDataSets] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [adminOverview, setAdminOverview] = useState(null);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState("loginFailed");
  const [popupMessage, setPopupMessage] = useState("");

  const [fontsLoaded] = useFonts({
    Itim: require("./1assets/Itim-Regular.ttf"),
  });

  const userDatasets =
    activeUser && activeUser.role === "user"
      ? dataSets.filter((item) => {
          const uName = (activeUser.username || "").toLowerCase();
          const uEmail = (activeUser.email || "").toLowerCase();
          const itemUName = (item.owner?.username || "").toLowerCase();
          const itemEmail = (item.owner?.email || "").toLowerCase();
          return (
            (itemUName && itemUName === uName) ||
            (itemEmail && itemEmail === uEmail)
          );
        })
      : dataSets;

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

  const staffPets = dataSets.map((item) => ({
    id: getPetId(item),
    name: item.pet.name || "",
    image: item.pet.image || require("./1assets/piclogo.png"),
    owner: item.owner?.name || "",
    status: normalizePetStatus(item.booking.status),
    branch: item.booking.branch || "สาขาลาดกระบัง",
    petId: getPetId(item),
    petName: item.pet.name,
    customerName: item.owner?.name,
    customerPhone: item.owner?.phone,
    customerEmail: item.owner?.email,
    bookingId: item.booking.id,
    checkIn: item.booking.startDate || item.booking.checkIn,
    checkOut: item.booking.endDate || item.booking.checkOut,
  }));

  const bookingQueue = dataSets.map((item) => ({
    id: item.booking.id || item.queue?.id,
    bookingId: item.booking.id,
    petId: getPetId(item),
    time: item.queue?.time || item.booking.bookingTime || "10:00",
    name: item.pet.name || "",
    branch: item.booking.branch || "สาขาลาดกระบัง",
    status: normalizePetStatus(item.booking.status),
    detail: `${item.owner?.name || ""} - ${item.booking.startDate || ""} ถึง ${item.booking.endDate || ""}`,
    customerName: item.owner?.name,
    customerPhone: item.owner?.phone,
    customerEmail: item.owner?.email,
  }));

  const loadCustomerData = async () => {
    try {
      const resRes = await apiGetCustomerReservations();
      if (resRes.ok && Array.isArray(resRes.data)) {
        const backendDataSets = resRes.data.map((r, idx) => ({
          owner: {
            id: r.customerName || `O${idx}`,
            username: activeUser?.username || "",
            name: r.customerName || activeUser?.name || "ลูกค้า",
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
            status:
              r.status === "accepted" || r.status === "confirmed"
                ? "รอรับเข้า"
                : r.status === "in_care"
                ? "In Care"
                : r.status === "rejected" || r.status === "cancelled"
                ? "ถูกปฏิเสธ"
                : r.status === "completed"
                ? "รับกลับแล้ว"
                : "รอยืนยันคิว",
          },
          queue: { id: `Q${idx}`, time: "10:00" },
        }));
        setDataSets(backendDataSets);
      }
    } catch (err) {
      console.warn("loadCustomerData error:", err);
    }
  };

  const loadStaffData = async () => {
    try {
      const resRes = await apiGetStaffReservations();
      if (resRes.ok && Array.isArray(resRes.data)) {
        const backendStaffSets = resRes.data.map((r, idx) => {
          const statusMap = {
            pending: "รอยืนยันคิว",
            confirmed: "รอรับเข้า",
            accepted: "รอรับเข้า",
            in_care: "In Care",
            rejected: "ถูกปฏิเสธ",
            cancelled: "ถูกปฏิเสธ",
            completed: "รับกลับแล้ว",
          };
          const currentStatus = statusMap[r.status] || "รอยืนยันคิว";

          return {
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
              status: currentStatus,
            },
            queue: { id: `Q${idx}`, time: "10:00" },
          };
        });

        setDataSets(backendStaffSets);

        // กำหนดรายการในกิจกรรม บันทึกเข้า-ออกรับคืน
        const initialActivities = backendStaffSets
          .filter((item) => item.booking.status === "รอรับเข้า" || item.booking.status === "In Care")
          .map((item) => ({
            id: `ACT-${item.booking.id}`,
            name: item.pet.name,
            petId: getPetId(item),
            bookingId: item.booking.id,
            branch: item.booking.branch,
            action: item.booking.status === "In Care" ? "รับกลับ" : "รับเข้าพัก",
            detail: `${item.booking.status === "In Care" ? "รับกลับ" : "รับเข้าพัก"} • ${item.owner.name} - ${item.booking.startDate} ถึง ${item.booking.endDate}`,
          }));

        setActivityList(initialActivities);
      }
    } catch (err) {
      console.warn("loadStaffData error:", err);
    }
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
        setPopupMessage("การจองสำเร็จ! สถานะเป็น 'รอยืนยันคิว'");
        setPopupVisible(true);
        return;
      }
    } catch (err) {
      console.warn("apiCreateReservation error:", err);
    }

    // In-memory Fallback
    const newBookingId = `#B${String(Date.now()).slice(-4)}`;
    const newEntry = {
      owner: {
        id: activeUser?.username || `#O${Date.now()}`,
        username: activeUser?.username || "",
        name: formData.ownerName || activeUser?.name || "ลูกค้า",
        phone: formData.phone || activeUser?.phone || "",
        email: formData.email || activeUser?.email || "",
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
        id: newBookingId,
        branch: formData.branch,
        startDate: formData.checkIn,
        endDate: formData.checkOut,
        bookingTime: formData.checkInTime || "10:00",
        status: "รอยืนยันคิว",
      },
      queue: { id: `Q${Date.now()}`, time: formData.checkInTime || "10:00" },
    };

    setDataSets((prev) => [newEntry, ...prev]);
    setShowBooking(false);
    setShowMyBooking(true);
    setPopupType("loginFailed");
    setPopupMessage("การจองสำเร็จ! สถานะเป็น 'รอยืนยันคิว'");
    setPopupVisible(true);
  };

  // =====================================================
  // CONFIRM / REJECT QUEUE (พนักงาน)
  // =====================================================
  const handleQueueDecision = async (queueItem, accepted) => {
    const targetId = queueItem.bookingId || queueItem.id;
    try {
      await apiConfirmStaffReservation(targetId, accepted);
    } catch (err) {
      console.warn("apiConfirmStaffReservation error:", err);
    }

    if (accepted) {
      // 1. กดกดยืนยันคิว: คิวในจัดการคิวฝากจะหายไป และย้ายไปบันทึกเข้า-ออกรับคืน (status: 'รอรับเข้า')
      setDataSets((prev) =>
        prev.map((item) =>
          item.booking.id === targetId || getPetId(item) === queueItem.petId
            ? { ...item, booking: { ...item.booking, status: "รอรับเข้า" } }
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
      // 2. ถ้ากดปฏิเสธคิว: คิวหายไปทันที (status: 'ถูกปฏิเสธ')
      setDataSets((prev) =>
        prev.map((item) =>
          item.booking.id === targetId || getPetId(item) === queueItem.petId
            ? { ...item, booking: { ...item.booking, status: "ถูกปฏิเสธ" } }
            : item
        )
      );
      setActivityList((prev) => prev.filter((a) => a.bookingId !== targetId));
    }
  };

  // =====================================================
  // STAFF ACTIVITY (กดปุ่ม รับเข้าพัก / รับกลับ)
  // =====================================================
  const handleActivity = async (item, action) => {
    const targetId = item.bookingId || item.petId || item.id;
    const entryType = action === "รับเข้าพัก" ? "check-in" : "check-out";
    
    try {
      await apiRecordStaffPetEntry({
        id: targetId,
        type: entryType,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("apiRecordStaffPetEntry error:", err);
    }

    if (action === "รับเข้าพัก") {
      // กดรับเข้าพัก:
      // - ปุ่มเปลี่ยนเป็น 'รับกลับ'
      // - แสดงในส่วนสัตว์ที่รับฝาก โดย status เป็น 'In Care'
      setDataSets((prev) =>
        prev.map((d) =>
          d.booking.id === targetId || getPetId(d) === item.petId
            ? { ...d, booking: { ...d.booking, status: "In Care" } }
            : d
        )
      );

      setActivityList((prev) =>
        prev.map((a) =>
          a.id === item.id || a.bookingId === targetId
            ? { ...a, action: "รับกลับ", detail: `รับกลับ • ${item.detail || ""}` }
            : a
        )
      );
    } else if (action === "รับกลับ") {
      // กดรับกลับ:
      // - status เป็น 'รับกลับแล้ว'
      // - คิวหายไปจากหน้า staff
      setDataSets((prev) =>
        prev.map((d) =>
          d.booking.id === targetId || getPetId(d) === item.petId
            ? { ...d, booking: { ...d.booking, status: "รับกลับแล้ว" } }
            : d
        )
      );

      setActivityList((prev) => prev.filter((a) => a.bookingId !== targetId && a.id !== item.id));
    }
  };

  // =====================================================
  // DROPDOWN STATUS CHANGE
  // =====================================================
  const handlePetStatusChange = async (petId, newStatus) => {
    try {
      await apiUpdateStaffPetStatus({ id: petId, status: newStatus });
    } catch (err) {
      console.warn("apiUpdateStaffPetStatus error:", err);
    }

    setDataSets((prev) =>
      prev.map((item) =>
        getPetId(item) === petId || item.booking.id === petId
          ? { ...item, booking: { ...item.booking, status: newStatus } }
          : item
      )
    );
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await apiLogin({ username: username.trim(), password });
      if (res.ok && res.data && res.data.accessToken) {
        const payload = parseJwt(res.data.accessToken);
        const role = payload?.role === "manager" ? "admin" : payload?.role || "user";

        let profile = { name: username, email: "", phone: "" };
        const profRes = await apiGetProfile();
        if (profRes.ok && profRes.data) {
          profile = {
            name: profRes.data.username || username,
            email: profRes.data.email || "",
            phone: profRes.data.phone || "",
          };
        }

        const userObj = { username: username.trim(), role, ...profile };
        setActiveUser(userObj);
        setCurrentPage(role);

        if (role === "user") loadCustomerData();
        else if (role === "staff") loadStaffData();
        return;
      }
    } catch (err) {
      console.warn("handleLogin error:", err);
    }
  };

  return (
    <View style={styles.container}>
      {currentPage === "guest" && (
        <View style={styles.pageContainer}>
          <LogoutNavbar onLogin={() => setCurrentPage("login")} />
          <HomePageGuest onLogin={() => setCurrentPage("login")} />
        </View>
      )}

      {currentPage === "login" && (
        <Login
          onBack={() => setCurrentPage("guest")}
          onLogin={handleLogin}
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
            onLogout={() => {
              setActiveUser(null);
              setCurrentPage("guest");
            }}
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
            onLogout={() => {
              setActiveUser(null);
              setCurrentPage("guest");
            }}
          />
          <View style={styles.pageContent}>
            <HomePageStaff
              staffName={activeUser?.name || "พนักงาน"}
              bookingQueue={bookingQueue}
              activityList={activityList}
              petList={staffPets}
              onUpdatePetStatus={handlePetStatusChange}
              onConfirmQueue={(item) => handleQueueDecision(item, true)}
              onRejectQueue={(item) => handleQueueDecision(item, false)}
              onCheckIn={(item) => handleActivity(item, "รับเข้าพัก")}
              onCheckOut={(item) => handleActivity(item, "รับกลับ")}
            />
          </View>
        </View>
      )}

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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  pageContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  userContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  pageContent: { flex: 1, backgroundColor: "#FFFFFF" },
});