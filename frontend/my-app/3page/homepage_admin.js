
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";

// ==============================
// BRANCH DATA
// ==============================
const branches = [
  {
    name: "สาขาลาดกระบัง",
    animals: [
      { type: "สุนัข", count: 12 },
      { type: "แมว", count: 12 },
    ],
    total: 24,
  },
  {
    name: "สาขาร่มเกล้า",
    animals: [
      { type: "สุนัข", count: 16 },
      { type: "นก", count: 15 },
    ],
    total: 31,
  },
  {
    name: "สาขาปราจีนบุรี",
    animals: [
      { type: "สุนัข", count: 20 },
      { type: "นก", count: 15 },
      { type: "แมว", count: 4 },
      { type: "ไก่", count: 3 },
    ],
    total: 42,
  },
  {
    name: "สาขาขาดใหญ่",
    animals: [
      { type: "สุนัข", count: 20 },
      { type: "นก", count: 15 },
      { type: "แมว", count: 4 },
      { type: "ไก่", count: 3 },
    ],
    total: 42,
  },
];

const statusData = [
  { label: "กำลังเข้าพัก", count: 1700, percent: 80 },
  { label: "พร้อมรับกลับ", count: 10, percent: 38 },
  { label: "อยู่ระหว่างตรวจสุขภาพ", count: 5, percent: 27 },
  { label: "ออกจากสาขาแล้ว", count: 220, percent: 22 },
];

const animalSummary = [
  { name: "สุนัข", count: 80 },
  { name: "กระต่าย", count: 45 },
  { name: "แมว", count: 360 },
  { name: "วัว", count: 16 },
  { name: "นก", count: 400 },
  { name: "หนู", count: 35 },
];

// ==============================
// PAW PRINT
// ==============================
function PawPrint({ style }) {
  return (
    <View style={[styles.paw, style]}>
      <View style={styles.pawToe1} />
      <View style={styles.pawToe2} />
      <View style={styles.pawToe3} />
      <View style={styles.pawToe4} />
      <View style={styles.pawMain} />
    </View>
  );
}

// ==============================
// STATUS BAR
// ==============================
function StatusBar({ item }) {
  return (
    <View style={styles.statusItem}>
      <View style={styles.statusTop}>
        <Text style={styles.statusLabel}>{item.label}</Text>

        <Text style={styles.statusCount}>
          {item.count.toLocaleString()} ตัว
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${item.percent}%` },
          ]}
        />
      </View>
    </View>
  );
}

// ==============================
// HOMEPAGE ADMIN
// ==============================
export default function HomepageAdmin({
  onBack,
  onCreateStaff,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [selectedBranch, setSelectedBranch] = useState("ทุกสาขา");
  const [showDropdown, setShowDropdown] = useState(false);

  // CREATE STAFF MODAL
  const [showCreateStaff, setShowCreateStaff] = useState(false);

  const [staffForm, setStaffForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const branchOptions = [
    "ทุกสาขา",
    ...branches.map((b) => b.name),
  ];

  const displayedBranches =
    selectedBranch === "ทุกสาขา"
      ? branches
      : branches.filter((b) => b.name === selectedBranch);

  // ==============================
  // OPEN CREATE STAFF
  // ==============================
  const openCreateStaff = () => {
    setStaffForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowCreateStaff(true);
  };

  // ==============================
  // CLOSE CREATE STAFF
  // ==============================
  const closeCreateStaff = () => {
    setShowCreateStaff(false);

    setStaffForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ==============================
  // UPDATE FORM
  // ==============================
  const updateStaffForm = (field, value) => {
    setStaffForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==============================
  // CREATE STAFF ACCOUNT
  // ==============================
  const handleCreateStaff = async () => {
    const {
      username,
      email,
      password,
      confirmPassword,
    } = staffForm;

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "แจ้งเตือน",
        "กรุณากรอกข้อมูลให้ครบทุกช่อง"
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "แจ้งเตือน",
        "กรุณากรอก Email ให้ถูกต้อง"
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "แจ้งเตือน",
        "Password ต้องมีอย่างน้อย 6 ตัวอักษร"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "แจ้งเตือน",
        "Password และ Confirm Password ไม่ตรงกัน"
      );
      return;
    }

    if (typeof onCreateStaff !== "function") {
      Alert.alert(
        "แจ้งเตือน",
        "ยังไม่ได้เชื่อมต่อระบบสร้างบัญชีพนักงาน"
      );
      return;
    }

    try {
      const result = await onCreateStaff({
        username: username.trim(),
        email: email.trim(),
        password,
        role: "staff",
      });

      if (result === false) {
        return;
      }

      closeCreateStaff();

      Alert.alert(
        "สำเร็จ",
        "สร้างบัญชีพนักงานเรียบร้อยแล้ว"
      );
    } catch (error) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.message || "ไม่สามารถสร้างบัญชีพนักงานได้"
      );
    }
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                ยินดีต้อนรับสู่ระบบจัดการเว็บรับฝากสัตว์เลี้ยง
              </Text>

              <Text style={styles.subtitle}>
                ดูภาพรวมสถานะสัตว์เลี้ยงและข้อมูลทุกสาขาได้ที่นี่
              </Text>
            </View>

            {/* BRANCH DROPDOWN */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() =>
                  setShowDropdown(!showDropdown)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>
                  {selectedBranch} ▼
                </Text>
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdownMenu}>
                  {branchOptions.map((branch, index) => (
                    <TouchableOpacity
                      key={`${branch}-${index}`}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedBranch(branch);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>
                        {branch}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* CREATE STAFF BUTTON */}
            <View style={styles.CreateStaff}>
              <TouchableOpacity
                style={styles.CreateStaffButton}
                onPress={openCreateStaff}
                activeOpacity={0.8}
              >
                <Text style={styles.CreateStaffText}>
                  + เพิ่มพนักงาน
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerLine} />

          {/* PAW DECORATIONS */}
          <PawPrint style={styles.pawLeft} />
          <PawPrint style={styles.pawRight} />

          {/* MAIN CONTENT */}
          <View
            style={[
              styles.mainContent,
              isMobile && styles.mainContentMobile,
            ]}
          >
            {/* BRANCH INFORMATION */}
            <View
              style={[
                styles.branchCard,
                isMobile && styles.branchCardMobile,
              ]}
            >
              <Text style={styles.branchTitle}>
                ข้อมูลแต่ละสาขา
              </Text>

              <View style={styles.cardLine} />

              {displayedBranches.map((branch, index) => (
                <View
                  key={`${branch.name}-${index}`}
                  style={styles.branchItem}
                >
                  <View style={styles.branchInfo}>
                    <Text style={styles.branchName}>
                      {branch.name}
                    </Text>

                    <View style={styles.animalList}>
                      {branch.animals.map(
                        (animal, animalIndex) => (
                          <Text
                            key={animalIndex}
                            style={styles.animalText}
                          >
                            {animal.type} {animal.count} ตัว
                          </Text>
                        )
                      )}
                    </View>
                  </View>

                  <View style={styles.totalBadge}>
                    <Text style={styles.totalText}>
                      รวม {branch.total} ตัว
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* RIGHT DASHBOARD */}
            <View
              style={[
                styles.rightColumn,
                isMobile && styles.rightColumnMobile,
              ]}
            >
              {/* ANIMAL SUMMARY */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  ชนิดสัตว์เลี้ยง (รวมทุกสาขา)
                </Text>

                <View style={styles.yellowLine} />

                <View style={styles.summaryContent}>
                  <View style={styles.totalNumberContainer}>
                    <Text style={styles.totalNumber}>
                      800 ตัว
                    </Text>
                  </View>

                  <View style={styles.animalSummaryList}>
                    {animalSummary.map((animal, index) => (
                      <Text
                        key={index}
                        style={styles.summaryAnimalText}
                      >
                        {animal.name} {animal.count} ตัว
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {/* OVERALL STATUS */}
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>
                  สถานะสัตว์เลี้ยงโดยรวม
                </Text>

                <View style={styles.yellowLine} />

                <View style={styles.statusList}>
                  {statusData.map((item, index) => (
                    <StatusBar key={index} item={item} />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ==================================
          CREATE STAFF MODAL
      ================================== */}
      <Modal
        visible={showCreateStaff}
        transparent
        animationType="fade"
        onRequestClose={closeCreateStaff}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  สร้างบัญชีพนักงาน
                </Text>

                <Text style={styles.modalSubtitle}>
                  กรอกข้อมูลเพื่อเพิ่มพนักงานเข้าสู่ระบบ
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeCreateStaff}
              >
                <Text style={styles.closeButtonText}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* USERNAME */}
              <Text style={styles.inputLabel}>
                Username
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="กรอก Username"
                placeholderTextColor="#A0A0A0"
                value={staffForm.username}
                onChangeText={(value) =>
                  updateStaffForm("username", value)
                }
                autoCapitalize="none"
              />

              {/* EMAIL */}
              <Text style={styles.inputLabel}>
                Email
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="กรอก Email"
                placeholderTextColor="#A0A0A0"
                value={staffForm.email}
                onChangeText={(value) =>
                  updateStaffForm("email", value)
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />

            {/* Phone */}
              <Text style={styles.inputLabel}>
                Phone
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="กรอกเบอร์โทร"
                placeholderTextColor="#A0A0A0"
                value={staffForm.email}
                onChangeText={(value) =>
                  updateStaffForm("email", value)
                }
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              {/* PASSWORD */}
              <Text style={styles.inputLabel}>
                Password
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="กรอก Password"
                  placeholderTextColor="#A0A0A0"
                  value={staffForm.password}
                  onChangeText={(value) =>
                    updateStaffForm("password", value)
                  }
                  secureTextEntry={!showPassword}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? "ซ่อน" : "แสดง"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CONFIRM PASSWORD */}
              <Text style={styles.inputLabel}>
                Confirm Password
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="ยืนยัน Password"
                  placeholderTextColor="#A0A0A0"
                  value={staffForm.confirmPassword}
                  onChangeText={(value) =>
                    updateStaffForm("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <Text style={styles.showPasswordText}>
                    {showConfirmPassword ? "ซ่อน" : "แสดง"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* BUTTONS */}
              <View style={styles.modalButtons}>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateStaff}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    สร้างบัญชี
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================================
// STYLES
// ==================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 35,
  },

  content: {
    width: "86%",
    maxWidth: 1100,
    alignSelf: "center",
    marginTop: 72,
    position: "relative",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
    position: "relative",
    zIndex: 100,
    elevation: 100,
  },

  headerText: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    color: "#102F4B",
    fontSize: 23,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#102F4B",
    fontSize: 12,
    marginTop: 8,
  },

  // DROPDOWN
  dropdownContainer: {
    position: "relative",
    zIndex: 9999,
    elevation: 9999,
  },

  dropdownButton: {
    backgroundColor: "#FFBD00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  dropdownText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "600",
  },

  dropdownMenu: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    zIndex: 9999,
  },

  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
  },

  dropdownOptionText: {
    fontSize: 12,
    color: "#222222",
  },

  // CREATE STAFF BUTTON
  CreateStaff: {
    position: "relative",
    marginLeft: 12,
    zIndex: 999,
    elevation: 999,
  },

  CreateStaffButton: {
    backgroundColor: "#FFBD00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  CreateStaffText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "600",
  },

  headerLine: {
    height: 1,
    backgroundColor: "#555555",
    marginTop: 2,
    marginBottom: 26,
  },

  // MAIN CONTENT
  mainContent: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },

  mainContentMobile: {
    flexDirection: "column",
  },

  // BRANCH CARD
  branchCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    paddingTop: 22,
    minHeight: 400,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  branchCardMobile: {
    flex: 0,
    minHeight: 0,
  },

  branchTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111111",
    marginBottom: 7,
  },

  cardLine: {
    height: 1,
    backgroundColor: "#555555",
    marginBottom: 10,
  },

  branchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 75,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  branchInfo: {
    flex: 1,
  },

  branchName: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },

  animalList: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 3,
    paddingLeft: 15,
  },

  animalText: {
    color: "#111111",
    fontSize: 11,
  },

  totalBadge: {
    backgroundColor: "#EF710B",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 5,
  },

  totalText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  // RIGHT COLUMN
  rightColumn: {
    flex: 1.05,
    gap: 10,
  },

  rightColumnMobile: {
    flex: 0,
  },

  // SUMMARY CARD
  summaryCard: {
    backgroundColor: "#0D2C46",
    borderRadius: 10,
    padding: 16,
    paddingHorizontal: 20,
    minHeight: 183,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 7,
  },

  yellowLine: {
    height: 2,
    backgroundColor: "#FFB900",
    marginBottom: 8,
  },

  summaryContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  totalNumberContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  totalNumber: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
  },

  animalSummaryList: {
    width: "34%",
    paddingLeft: 5,
    justifyContent: "center",
  },

  summaryAnimalText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 19,
  },

  // STATUS CARD
  statusCard: {
    backgroundColor: "#0D2C46",
    borderRadius: 10,
    padding: 16,
    paddingHorizontal: 18,
    minHeight: 230,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  statusTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 7,
  },

  statusList: {
    gap: 9,
    paddingHorizontal: 6,
  },

  statusItem: {
    width: "100%",
  },

  statusTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  statusLabel: {
    color: "#FFFFFF",
    fontSize: 11,
  },

  statusCount: {
    color: "#FFFFFF",
    fontSize: 11,
  },

  progressBackground: {
    width: "100%",
    height: 15,
    backgroundColor: "#E5EDF2",
    borderRadius: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#216EAD",
    borderRadius: 20,
  },

  // PAW DECORATIONS
  paw: {
    width: 35,
    height: 35,
    position: "absolute",
    zIndex: -1,
  },

  pawMain: {
    width: 15,
    height: 17,
    borderRadius: 10,
    backgroundColor: "#F5A000",
    position: "absolute",
    bottom: 0,
    left: 9,
  },

  pawToe1: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#F5A000",
    position: "absolute",
    top: 0,
    left: 0,
  },

  pawToe2: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#F5A000",
    position: "absolute",
    top: -4,
    left: 14,
  },

  pawToe3: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#F5A000",
    position: "absolute",
    top: 5,
    right: 0,
  },

  pawToe4: {
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: "#F5A000",
    position: "absolute",
    top: 15,
    left: 1,
  },

  pawLeft: {
    left: -65,
    top: 120,
  },

  pawRight: {
    right: -42,
    top: -30,
    transform: [{ scale: 1.1 }],
  },

  // ==================================
  // CREATE STAFF MODAL
  // ==================================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 25,
    elevation: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#102F4B",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 5,
  },

  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    fontSize: 20,
    color: "#777777",
  },

  modalDivider: {
    height: 1,
    backgroundColor: "#DDDDDD",
    marginVertical: 18,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#17344D",
    marginBottom: 7,
    marginTop: 12,
  },

  modalInput: {
    height: 43,
    borderWidth: 1,
    borderColor: "#D9E0E6",
    borderRadius: 7,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },

  passwordContainer: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E0E6",
    borderRadius: 7,
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    color: "#222222",
  },

  showPasswordText: {
    color: "#216AA8",
    fontSize: 12,
    fontWeight: "bold",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 25,
    marginBottom: 5,
  },

  submitButton: {
    backgroundColor: "#216AA8",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 7,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
