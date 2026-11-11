import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";

// แปลงวันที่เป็น DD/MM/YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// แปลง DD/MM/YYYY เป็น Date
const parseDate = (value) => {
  if (!value) return null;
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  return date;
};

// ช่องกรอกข้อมูล
const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || ""}
      placeholderTextColor="#8293A0"
      multiline={multiline}
      keyboardType={keyboardType}
      autoCorrect={false}
    />
  </View>
);

export default function BookingUser({ onBack, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [branch, setBranch] = useState("สาขาลาดกระบัง");

  const [form, setForm] = useState({
    ownerName: "",
    phone: "",
    email: "",
    petName: "",
    petType: "",
    breed: "",
    gender: "",
    age: "",
    weight: "",
    health: "",
    careNotes: "",
    checkIn: "",
    checkOut: "",
    bookingTime: "",
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("10");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const branches = [
    "สาขาลาดกระบัง",
    "สาขาร่มเกล้า",
    "สาขาปราจีนบุรี",
    "สาขาหาดใหญ่",
  ];

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // เปิดปฏิทิน
  const openDatePicker = (type) => {
    setPickerType(type);

    const currentDate = parseDate(form[type]) || new Date();

    setCalendarMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );

    setPickerVisible(true);
  };

  // เปิดตัวเลือกเวลา
  const openTimePicker = (type) => {
    setPickerType(type);

    const currentTime = form[type] || "10:00";
    const [hour, minute] = currentTime.split(":");

    setSelectedHour(hour || "10");
    setSelectedMinute(minute || "00");

    setPickerVisible(true);
  };

  // เลือกวันที่
  const handleSelectDate = (day) => {
    const selectedDate = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );

    // วันเกิดต้องไม่เป็นวันที่ในอนาคต
    if (pickerType === "age") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        Alert.alert(
          "แจ้งเตือน",
          "วันเกิดไม่สามารถเป็นวันที่ในอนาคตได้"
        );
        return;
      }
    }

    updateForm(pickerType, formatDate(selectedDate));
    setPickerVisible(false);
  };

  // ยืนยันเวลา
  const handleConfirmTime = () => {
    const selectedTime = `${selectedHour}:${selectedMinute}`;
    updateForm(pickerType, selectedTime);
    setPickerVisible(false);
  };

  // เปลี่ยนเดือน
  const changeMonth = (amount) => {
    setCalendarMonth((prev) => {
      const nextMonth = new Date(
        prev.getFullYear(),
        prev.getMonth() + amount,
        1
      );

      // วันเกิดไม่สามารถเลื่อนไปยังเดือนในอนาคต
      if (pickerType === "age") {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        if (nextMonth > currentMonth) {
          return prev;
        }
      }

      return nextMonth;
    });
  };

  // จำนวนวันในเดือน
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();

  // วันเริ่มต้นของสัปดาห์
  const firstDay = (
    new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    ).getDay() + 6
  ) % 7;

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const weekDays = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

  const isBirthdayPicker = pickerType === "age";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentCalendarMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  // ตรวจสอบและส่งข้อมูลการจอง
  const handleSubmit = () => {
    if (
      !form.petName.trim() ||
      !form.checkIn ||
      !form.checkOut ||
      !branch
    ) {
      Alert.alert(
        "แจ้งเตือน",
        "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน"
      );
      return;
    }

    const checkInDate = parseDate(form.checkIn);
    const checkOutDate = parseDate(form.checkOut);

    if (!checkInDate || !checkOutDate) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกวันที่ให้ถูกต้อง");
      return;
    }

    if (checkOutDate < checkInDate) {
      Alert.alert(
        "แจ้งเตือน",
        "วันที่รับกลับต้องไม่อยู่ก่อนวันที่ฝาก"
      );
      return;
    }

    const bookingData = {
      ...form,
      branch,
    };

    if (onSubmit && !isSubmitting) {
      setIsSubmitting(true);

      Promise.resolve(onSubmit(bookingData))
        .finally(() => setIsSubmitting(false));
    }
  };

  // ช่องเลือกวันที่
  const DateField = ({ label, value, type, placeholder }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => openDatePicker(type)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pickerButtonText,
            !value && styles.placeholderText,
          ]}
        >
          {value || placeholder || "เลือกวันที่"}
        </Text>

        <Text style={styles.pickerIcon}>▦</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </TouchableOpacity>

      <View style={styles.mainWrapper}>
        <View style={styles.mainSection}>
          <View style={styles.leftSection}>
            <Image
              source={require("../1assets/titlelogo.png")}
              style={styles.titlelogo}
              resizeMode="cover"
            />
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.title}>Booking Form</Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formColumns}>
                {/* COLUMN 1 */}
                <View style={styles.formColumn}>
                  <Text style={styles.sectionTitle}>
                    ข้อมูลสัตว์เลี้ยง
                  </Text>

                  <Field
                    label="ชื่อสัตว์เลี้ยง"
                    value={form.petName}
                    onChangeText={(v) => updateForm("petName", v)}
                    placeholder="กรอกชื่อสัตว์เลี้ยง"
                  />

                  <Field
                    label="ประเภท"
                    value={form.petType}
                    onChangeText={(v) => updateForm("petType", v)}
                    placeholder="เช่น สุนัข / แมว"
                  />

                  <Field
                    label="สายพันธุ์"
                    value={form.breed}
                    onChangeText={(v) => updateForm("breed", v)}
                    placeholder="กรอกสายพันธุ์"
                  />

                  <Field
                    label="เพศ"
                    value={form.gender}
                    onChangeText={(v) => updateForm("gender", v)}
                    placeholder="กรอกเพศ"
                  />

                  <DateField
                    label="วันเกิด"
                    value={form.age}
                    type="age"
                    placeholder="วันเกิด"
                  />

                  <Field
                    label="น้ำหนัก"
                    value={form.weight}
                    onChangeText={(v) => updateForm("weight", v)}
                    placeholder="น้ำหนัก (กิโลกรัม)"
                    keyboardType="decimal-pad"
                  />

                  <Field
                    label="โรคประจำตัว/ประวัติการแพ้ยา-อาหาร"
                    value={form.health}
                    onChangeText={(v) => updateForm("health", v)}
                    placeholder="กรอกรายละเอียด"
                    multiline
                  />

                  <Field
                    label="ข้อจำกัด/คำแนะนำในการดูแล"
                    value={form.careNotes}
                    onChangeText={(v) => updateForm("careNotes", v)}
                    placeholder="กรอกรายละเอียด"
                    multiline
                  />
                </View>

                {/* COLUMN 2 */}
                <View style={styles.formColumn}>
                  <Text style={styles.sectionTitle}>
                    ข้อมูลการเข้าพัก
                  </Text>

                  <DateField
                    label="วันที่ฝาก"
                    value={form.checkIn}
                    type="checkIn"
                    placeholder="เลือกวันที่ฝาก"
                  />

                  <DateField
                    label="วันที่เข้ารับกลับ"
                    value={form.checkOut}
                    type="checkOut"
                    placeholder="เลือกวันที่รับกลับ"
                  />

                  <Text style={styles.branchTitle}>
                    เลือกสาขา
                  </Text>

                  <TouchableOpacity
                    style={styles.branchButton}
                    onPress={() => setShowBranches(!showBranches)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.branchText,
                        !branch && styles.branchPlaceholder,
                      ]}
                    >
                      {branch || "เลือกสาขา"}
                    </Text>

                    <Text style={styles.arrow}>▼</Text>
                  </TouchableOpacity>

                  {showBranches && (
                    <View style={styles.dropdown}>
                      {branches.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setBranch(item);
                            setShowBranches(false);
                          }}
                        >
                          <Text style={styles.dropdownText}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmText}>
                      {isSubmitting
                        ? "กำลังบันทึก..."
                        : "ยืนยันการจอง"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* DATE / TIME PICKER MODAL */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            {pickerType === "age" ||
            pickerType === "checkIn" ||
            pickerType === "checkOut" ? (
              <>
                <Text style={styles.modalTitle}>
                  {pickerType === "age"
                    ? "เลือกวันเกิดสัตว์เลี้ยง"
                    : pickerType === "checkIn"
                    ? "เลือกวันที่ฝาก"
                    : "เลือกวันที่รับกลับ"}
                </Text>

                {/* หัวปฏิทิน */}
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={styles.monthButton}
                    onPress={() => changeMonth(-1)}
                  >
                    <Text style={styles.monthButtonText}>‹</Text>
                  </TouchableOpacity>

                  <Text style={styles.monthTitle}>
                    {monthNames[calendarMonth.getMonth()]}{" "}
                    {calendarMonth.getFullYear() + 543}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.monthButton,
                      isBirthdayPicker &&
                        isCurrentCalendarMonth &&
                        styles.disabledMonthButton,
                    ]}
                    onPress={() => changeMonth(1)}
                    disabled={
                      isBirthdayPicker && isCurrentCalendarMonth
                    }
                  >
                    <Text
                      style={[
                        styles.monthButtonText,
                        isBirthdayPicker &&
                          isCurrentCalendarMonth &&
                          styles.disabledCalendarText,
                      ]}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* วันในสัปดาห์ */}
                <View style={styles.calendarGrid}>
                  {weekDays.map((day) => (
                    <View
                      key={day}
                      style={styles.calendarCell}
                    >
                      <Text style={styles.weekDayText}>
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* วันที่ในปฏิทิน */}
                <View style={styles.calendarGrid}>
                  {Array.from(
                    { length: firstDay },
                    (_, index) => (
                      <View
                        key={`empty-${index}`}
                        style={styles.calendarCell}
                      />
                    )
                  )}

                  {Array.from(
                    { length: daysInMonth },
                    (_, index) => {
                      const day = index + 1;

                      const selectedDate = parseDate(
                        form[pickerType]
                      );

                      const isSelected =
                        selectedDate &&
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() ===
                          calendarMonth.getMonth() &&
                        selectedDate.getFullYear() ===
                          calendarMonth.getFullYear();

                      const dateToCheck = new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth(),
                        day
                      );

                      const isFutureBirthday =
                        isBirthdayPicker &&
                        dateToCheck > today;

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.calendarCell,
                            isSelected &&
                              styles.selectedCalendarCell,
                            isFutureBirthday &&
                              styles.disabledCalendarCell,
                          ]}
                          onPress={() => handleSelectDate(day)}
                          disabled={isFutureBirthday}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              isSelected &&
                                styles.selectedCalendarText,
                              isFutureBirthday &&
                                styles.disabledCalendarText,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setPickerVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    ยกเลิก
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {pickerType === "checkInTime"
                    ? "เลือกเวลาเข้าพัก"
                    : "เลือกเวลารับกลับ"}
                </Text>

                <View style={styles.timePreview}>
                  <Text style={styles.timePreviewText}>
                    {selectedHour}:{selectedMinute}
                  </Text>
                </View>

                <View style={styles.timeColumns}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeColumnTitle}>
                      ชั่วโมง
                    </Text>

                    <ScrollView
                      style={styles.timeScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={true}
                    >
                      <View style={styles.timeGrid}>
                        {Array.from(
                          { length: 24 },
                          (_, index) =>
                            String(index).padStart(2, "0")
                        ).map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.timeOption,
                              selectedHour === hour &&
                                styles.selectedTimeOption,
                            ]}
                            onPress={() =>
                              setSelectedHour(hour)
                            }
                          >
                            <Text
                              style={[
                                styles.timeOptionText,
                                selectedHour === hour &&
                                  styles.selectedTimeText,
                              ]}
                            >
                              {hour}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <View style={styles.timeColumn}>
                    <Text style={styles.timeColumnTitle}>
                      นาที
                    </Text>

                    <ScrollView
                      style={styles.timeScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={true}
                    >
                      <View style={styles.timeGrid}>
                        {Array.from(
                          { length: 60 },
                          (_, index) =>
                            String(index).padStart(2, "0")
                        )
                          .filter((m) => Number(m) % 5 === 0)
                          .map((minute) => (
                            <TouchableOpacity
                              key={minute}
                              style={[
                                styles.timeOption,
                                selectedMinute === minute &&
                                  styles.selectedTimeOption,
                              ]}
                              onPress={() =>
                                setSelectedMinute(minute)
                              }
                            >
                              <Text
                                style={[
                                  styles.timeOptionText,
                                  selectedMinute === minute &&
                                    styles.selectedTimeText,
                                ]}
                              >
                                {minute}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setPickerVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>
                      ยกเลิก
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.timeConfirmButton}
                    onPress={handleConfirmTime}
                  >
                    <Text style={styles.timeConfirmText}>
                      เลือกเวลานี้
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 20,
    marginLeft: 30,
    backgroundColor: "#246AA5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  mainWrapper: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 70,
  },
  mainSection: {
    minHeight: 520,
    backgroundColor: "#0C2B43",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 35,
    paddingVertical: 20,
    position: "relative",
    overflow: "hidden",
  },
  leftSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  titlelogo: {
    width: 420,
    height: 170,
  },
  rightSection: {
    flex: 1.35,
    zIndex: 2,
    paddingHorizontal: 15,
    alignSelf: "stretch",
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: "#F5A400",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 22,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingBottom: 20,
  },
  formColumns: {
    flexDirection: "row",
    gap: 25,
  },
  formColumn: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    color: "#F5A400",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 7,
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#D6E0E8",
    fontSize: 10,
    marginBottom: 4,
  },
  input: {
    minHeight: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#405467",
    color: "#FFFFFF",
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  multilineInput: {
    minHeight: 48,
    textAlignVertical: "top",
  },
  pickerButton: {
    height: 34,
    borderBottomWidth: 1,
    borderBottomColor: "#405467",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  pickerButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  placeholderText: {
    color: "#8293A0",
  },
  pickerIcon: {
    color: "#F5A400",
    fontSize: 17,
  },
  branchTitle: {
    color: "#F5A400",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  branchButton: {
    height: 34,
    backgroundColor: "#F47B0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  branchText: {
    color: "#FFFFFF",
    fontSize: 11,
  },
  branchPlaceholder: {
    color: "#FFE0C2",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    marginTop: 2,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItem: {
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  dropdownText: {
    fontSize: 11,
    color: "#0C2B43",
  },
  confirmButton: {
    backgroundColor: "#F0A000",
    height: 42,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
    marginHorizontal: 15,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pickerModal: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    color: "#0C2B43",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF1F6",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    color: "#246AA5",
    fontSize: 25,
    fontWeight: "bold",
  },
  disabledMonthButton: {
    opacity: 0.35,
  },
  disabledCalendarCell: {
    backgroundColor: "#F3F5F7",
  },
  disabledCalendarText: {
    color: "#B8C1C9",
  },
  monthTitle: {
    color: "#0C2B43",
    fontSize: 16,
    fontWeight: "bold",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.2857%",
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  weekDayText: {
    color: "#8293A0",
    fontSize: 12,
    fontWeight: "bold",
  },
  calendarDayText: {
    color: "#314B62",
    fontSize: 13,
  },
  selectedCalendarCell: {
    backgroundColor: "#246AA5",
  },
  selectedCalendarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  timePreview: {
    backgroundColor: "#EAF1F6",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  timePreviewText: {
    color: "#246AA5",
    fontSize: 30,
    fontWeight: "bold",
  },
  timeColumns: {
    flexDirection: "row",
    gap: 15,
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnTitle: {
    color: "#0C2B43",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  timeScroll: {
    height: 180,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
  },
  timeOption: {
    width: "30%",
    minWidth: 35,
    height: 34,
    backgroundColor: "#F0F3F6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTimeOption: {
    backgroundColor: "#246AA5",
  },
  timeOptionText: {
    color: "#314B62",
    fontSize: 12,
  },
  selectedTimeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E8EDF1",
    marginTop: 15,
  },
  cancelButtonText: {
    color: "#526779",
    fontSize: 12,
    fontWeight: "bold",
  },
  timeConfirmButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#246AA5",
    marginTop: 15,
  },
  timeConfirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});