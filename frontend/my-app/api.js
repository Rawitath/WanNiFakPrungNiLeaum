import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL จาก .env หรือ compose.yml environments ผ่าน process.env
const BASE_URL_PRIMARY =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://backend:3000";

let currentToken = null;
const TOKEN_KEY = "stayforget_access_token";

// Helper: ถอดรหัส JWT Payload เพื่อดึง role, userid
export function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    try {
      // Fallback สำหรับ environments ที่ atob อาจไม่มี
      const base64Url = token.split(".")[1];
      const json = typeof atob === "function" ? atob(base64Url) : Buffer.from(base64Url, "base64").toString("utf-8");
      return JSON.parse(json);
    } catch (e) {
      console.warn("parseJwt error:", e);
      return null;
    }
  }
}

export async function setAuthToken(token) {
  currentToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn("Storage setAuthToken error:", e);
  }
}

export async function getAuthToken() {
  if (currentToken) return currentToken;
  try {
    const saved = await AsyncStorage.getItem(TOKEN_KEY);
    if (saved) {
      currentToken = saved;
      return saved;
    }
  } catch (e) {
    console.warn("Storage getAuthToken error:", e);
  }
  return null;
}

export async function clearAuthToken() {
  currentToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn("Storage clearAuthToken error:", e);
  }
}

// ฟังก์ชันแกนกลางสำหรับการเรียก API พร้อมแนบ Bearer token และ auto-retry fallback
export async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // เตรียม URL
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let primaryUrl = `${BASE_URL_PRIMARY}${cleanEndpoint}`;

  // หาก BASE_URL_PRIMARY เป็น http://backend:3000 แต่เปิดจาก Web Browser นอก docker network
  // ให้เตรียม fallback ไปยัง localhost:3000
  let fallbackUrl = null;
  if (
    typeof window !== "undefined" &&
    window.location &&
    BASE_URL_PRIMARY.includes("backend:3000")
  ) {
    fallbackUrl = `http://localhost:3000${cleanEndpoint}`;
  }

  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers,
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (networkError) {
    // ถ้าเรียก primaryUrl ไม่สำเร็จและมี fallbackUrl ให้ลอง fallback
    if (fallbackUrl) {
      try {
        const res = await fetch(fallbackUrl, {
          ...options,
          headers,
        });
        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { raw: text };
        }
        return { ok: res.ok, status: res.status, data };
      } catch (err2) {
        console.warn("API fallback error:", err2);
      }
    }
    return {
      ok: false,
      status: 0,
      data: { error: networkError.message || "Network error" },
    };
  }
}

// =====================================================
// AUTH ENDPOINTS (ตรงตาม Swagger ใน backend/src)
// =====================================================

/** POST /api/register */
export async function apiRegister({ username, password, email, phone }) {
  return apiRequest("/api/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email, phone }),
  });
}

/** POST /api/login */
export async function apiLogin({ username, password }) {
  const res = await apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (res.ok && res.data && res.data.accessToken) {
    await setAuthToken(res.data.accessToken);
  }
  return res;
}

/** POST /api/forget */
export async function apiForgetPassword({ username }) {
  return apiRequest("/api/forget", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

/** GET /api/forget/reset */
export async function apiCheckResetToken(resetToken) {
  return apiRequest(`/api/forget/reset?resetToken=${encodeURIComponent(resetToken)}`, {
    method: "GET",
  });
}

/** POST /api/forget/reset */
export async function apiResetPassword({ resetToken, password }) {
  return apiRequest("/api/forget/reset", {
    method: "POST",
    body: JSON.stringify({ resetToken, password }),
  });
}

/** POST /api/manager/register (Admin/Manager create staff) */
export async function apiManagerRegisterStaff({ username, password, email, phone, branch_id }) {
  return apiRequest("/api/manager/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email, phone, branch_id }),
  });
}

/** PUT /api/manager/staff/:userid */
export async function apiManagerUpdateStaff(userid, updateData) {
  return apiRequest(`/api/manager/staff/${userid}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

// =====================================================
// PROFILE ENDPOINTS
// =====================================================

/** GET /api/profile */
export async function apiGetProfile() {
  return apiRequest("/api/profile", {
    method: "GET",
  });
}

/** POST /api/profile */
export async function apiUpdateProfile({ username, phone, email }) {
  return apiRequest("/api/profile", {
    method: "POST",
    body: JSON.stringify({ username, phone, email }),
  });
}

// =====================================================
// CUSTOMER RESERVATION & PETS
// =====================================================

/** GET /api/customer/reservation */
export async function apiGetCustomerReservations(id = null) {
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  return apiRequest(`/api/customer/reservation${query}`, {
    method: "GET",
  });
}

/** POST /api/customer/reservation */
export async function apiCreateReservation(reservationData) {
  return apiRequest("/api/customer/reservation", {
    method: "POST",
    body: JSON.stringify(reservationData),
  });
}

/** POST /api/customer/reservation/cancel */
export async function apiCancelReservation(id) {
  return apiRequest("/api/customer/reservation/cancel", {
    method: "POST",
    body: JSON.stringify({ id: String(id) }),
  });
}

/** GET /api/customer/detail */
export async function apiGetCustomerDetail() {
  return apiRequest("/api/customer/detail", {
    method: "GET",
  });
}

/** GET /api/customer/pets */
export async function apiGetCustomerPets(petId = null) {
  const query = petId ? `?petId=${encodeURIComponent(petId)}` : "";
  return apiRequest(`/api/customer/pets${query}`, {
    method: "GET",
  });
}

// =====================================================
// STAFF PETS & RESERVATIONS
// =====================================================

/** GET /api/staff/pets */
export async function apiGetStaffPets(petId = null) {
  const query = petId ? `?petId=${encodeURIComponent(petId)}` : "";
  return apiRequest(`/api/staff/pets${query}`, {
    method: "GET",
  });
}

/** POST /api/staff/pets/status (or /api/staff/status) */
export async function apiUpdateStaffPetStatus({ id, status }) {
  return apiRequest("/api/staff/pets/status", {
    method: "POST",
    body: JSON.stringify({ id: String(id), status }),
  });
}

/** POST /api/staff/pets/entry */
export async function apiRecordStaffPetEntry({ id, type, timestamp }) {
  return apiRequest("/api/staff/pets/entry", {
    method: "POST",
    body: JSON.stringify({
      id: String(id),
      type,
      timestamp: timestamp || new Date().toISOString(),
    }),
  });
}

/** GET /api/staff/pets/detail */
export async function apiGetStaffPetsDetail() {
  return apiRequest("/api/staff/pets/detail", {
    method: "GET",
  });
}

/** POST /api/staff/pets/detail */
export async function apiUpsertStaffPetDetail({ animal, detail }) {
  return apiRequest("/api/staff/pets/detail", {
    method: "POST",
    body: JSON.stringify({ animal, detail }),
  });
}

/** GET /api/staff/reservation */
export async function apiGetStaffReservations(id = null) {
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  return apiRequest(`/api/staff/reservation${query}`, {
    method: "GET",
  });
}

/** PUT /api/staff/reservation */
export async function apiUpdateStaffReservation(data) {
  return apiRequest("/api/staff/reservation", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** PUT /api/staff/reservation/:reservationId/confirm */
export async function apiConfirmStaffReservation(reservationId, accept) {
  return apiRequest(`/api/staff/reservation/${reservationId}/confirm`, {
    method: "PUT",
    body: JSON.stringify({ id: String(reservationId), accept: Boolean(accept) }),
  });
}

/** GET /api/staff/reservation/:reservationId/callcustomer */
export async function apiGetStaffReservationCallCustomer(reservationId) {
  return apiRequest(`/api/staff/reservation/${reservationId}/callcustomer`, {
    method: "GET",
  });
}

/** GET /api/staff/callcustomer */
export async function apiGetStaffCallCustomerList() {
  return apiRequest("/api/staff/callcustomer", {
    method: "GET",
  });
}

// =====================================================
// MANAGER / ADMIN STATUS & STATS
// =====================================================

/** GET /api/manager/status */
export async function apiGetManagerStatus() {
  return apiRequest("/api/manager/status", {
    method: "GET",
  });
}
