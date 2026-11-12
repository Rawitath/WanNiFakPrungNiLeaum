import AsyncStorage from "@react-native-async-storage/async-storage";

// ตั้งค่าได้ผ่าน EXPO_PUBLIC_API_URL ในไฟล์ .env
// Android Emulator: http://10.0.2.2:3000
// iOS Simulator: http://localhost:3000
// โทรศัพท์จริง: http://<LAN-IP-ของคอมพิวเตอร์>:3000
const ENV_API_URL =
  (typeof process !== "undefined" && process.env &&
    (process.env.EXPO_PUBLIC_API_URL || process.env.API_URL)) || "";

function getBaseUrl() {
  if (ENV_API_URL) return ENV_API_URL.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:3000`;
  }
  return "http://localhost:3000";
}

export const API_BASE_URL = getBaseUrl();
const TOKEN_KEY = "stayforget_access_token";
let memoryToken = null;

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  if (typeof atob === "function") return atob(padded);
  // React Native/Hermes ที่ไม่มี atob
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let buffer = 0;
  let bits = 0;
  for (const char of padded.replace(/=/g, "")) {
    const index = chars.indexOf(char);
    if (index < 0) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 255);
    }
  }
  return output;
}

export function parseJwt(token) {
  try {
    if (!token) return null;
    const part = token.split(".")[1];
    if (!part) return null;
    const binary = decodeBase64Url(part);
    const percentEncoded = Array.from(binary)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("");
    return JSON.parse(decodeURIComponent(percentEncoded));
  } catch (error) {
    console.warn("parseJwt error:", error);
    return null;
  }
}

export async function setAuthToken(token) {
  memoryToken = token || null;
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn("setAuthToken storage error:", error);
  }
}

export async function getAuthToken() {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = await AsyncStorage.getItem(TOKEN_KEY);
    return memoryToken;
  } catch (error) {
    console.warn("getAuthToken storage error:", error);
    return null;
  }
}

export async function clearAuthToken() {
  memoryToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn("clearAuthToken storage error:", error);
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    const raw = await response.text();
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
    }
    if (response.status === 401 && !path.startsWith("/api/login") && !path.startsWith("/api/register")) {
      // ไม่ลบ token อัตโนมัติระหว่าง request เพื่อให้หน้า UI จัดการ logout เองได้
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { error: error?.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", message: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" },
    };
  }
}

// AUTH: backend รับ username/password และตอบ { accessToken }
export async function apiRegister({ username, password, email, phone }) {
  return apiRequest("/api/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email, phone }),
  });
}

export async function apiLogin({ username, password }) {
  const result = await apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (result.ok && result.data?.accessToken) await setAuthToken(result.data.accessToken);
  return result;
}

export async function apiForgetPassword({ username }) {
  return apiRequest("/api/forget", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function apiCheckResetToken(resetToken) {
  return apiRequest(`/api/forget/reset?resetToken=${encodeURIComponent(resetToken)}`, { method: "GET" });
}

export async function apiResetPassword({ resetToken, password }) {
  return apiRequest("/api/forget/reset", {
    method: "POST",
    body: JSON.stringify({ resetToken, password }),
  });
}

export async function apiManagerRegisterStaff({ username, password, email, phone, branch_id }) {
  return apiRequest("/api/manager/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email, phone, ...(branch_id ? { branch_id } : {}) }),
  });
}

export async function apiManagerUpdateStaff(userid, updateData) {
  return apiRequest(`/api/manager/staff/${encodeURIComponent(userid)}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

// PROFILE
export async function apiGetProfile() {
  return apiRequest("/api/profile", { method: "GET" });
}

export async function apiUpdateProfile({ username, phone, email }) {
  return apiRequest("/api/profile", {
    method: "POST",
    body: JSON.stringify({ username, phone, email }),
  });
}

// CUSTOMER
export async function apiGetCustomerReservations(id = null) {
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  return apiRequest(`/api/customer/reservation${query}`, { method: "GET" });
}

export async function apiCreateReservation(data) {
  const payload = {
    ...data,
    branch: String(data?.branch ?? "").trim(),
  };

  console.log("========== CREATE RESERVATION ==========");
  console.log("Branch ที่กำลังส่ง:", payload.branch);
  console.log("ข้อมูลทั้งหมด:", payload);

  const result = await apiRequest("/api/customer/reservation", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("ผลตอบกลับจาก Backend:", result);
  console.log("========================================");

  return result;
}

export async function apiCancelReservation(id) {
  return apiRequest("/api/customer/reservation/cancel", {
    method: "POST",
    body: JSON.stringify({ id: String(id) }),
  });
}

export async function apiGetCustomerDetail() {
  return apiRequest("/api/customer/detail", { method: "GET" });
}

export async function apiGetCustomerPets(petId = null) {
  const query = petId ? `?petId=${encodeURIComponent(petId)}` : "";
  return apiRequest(`/api/customer/pets${query}`, { method: "GET" });
}

// STAFF
export async function apiGetStaffPets(petId = null) {
  const query = petId ? `?petId=${encodeURIComponent(petId)}` : "";
  return apiRequest(`/api/staff/pets${query}`, { method: "GET" });
}

// อัปเดตสถานะการดูแลสัตว์ในตาราง pets (ไม่ใช่สถานะสุขภาพ)
export async function apiUpdateStaffPetStatus({ id, status }) {
  return apiRequest("/api/staff/pets/status", {
    method: "POST",
    body: JSON.stringify({ id: String(id), status }),
  });
}

// คงชื่อเดิมไว้เพื่อรองรับไฟล์อื่นที่อาจเรียกใช้
export const apiUpdateStaffPetHealth = apiUpdateStaffPetStatus;

export async function apiRecordStaffPetEntry({ id, type, timestamp }) {
  return apiRequest("/api/staff/pets/entry", {
    method: "POST",
    body: JSON.stringify({ id: String(id), type, timestamp: timestamp || new Date().toISOString() }),
  });
}

export async function apiGetStaffPetsDetail() {
  return apiRequest("/api/staff/pets/detail", { method: "GET" });
}

export async function apiUpsertStaffPetDetail({ animal, detail }) {
  return apiRequest("/api/staff/pets/detail", {
    method: "POST",
    body: JSON.stringify({ animal, detail }),
  });
}

export async function apiGetStaffReservations(id = null) {
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  return apiRequest(`/api/staff/reservation${query}`, { method: "GET" });
}

export async function apiUpdateStaffReservation(data) {
  return apiRequest("/api/staff/reservation", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiConfirmStaffReservation(reservationId, accept) {
  return apiRequest(`/api/staff/reservation/${encodeURIComponent(reservationId)}/confirm`, {
    method: "PUT",
    body: JSON.stringify({ id: String(reservationId), accept: Boolean(accept) }),
  });
}

export async function apiGetStaffReservationCallCustomer(reservationId) {
  return apiRequest(`/api/staff/reservation/${encodeURIComponent(reservationId)}/callcustomer`, { method: "GET" });
}

export async function apiGetStaffCallCustomerList() {
  return apiRequest("/api/staff/callcustomer", { method: "GET" });
}

// ADMIN / MANAGER
export async function apiGetManagerStatus() {
  return apiRequest("/api/manager/status", { method: "GET" });
}

export async function oAuthLogin() {
  return `${API_BASE_URL}/api/oauth/google`;
}

export async function oAuthCallback(code) {
  const query = code ? `?code=${encodeURIComponent(code)}` : "";
  const result = await apiRequest(`/api/oauth/google/callback${query}`, { method: "GET" });
  if (result.ok && result.data?.accessToken) {
    await setAuthToken(result.data.accessToken);
  }
  return result;
}
