
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
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function BookingUser({ onBack, onSubmit }) {
  const [showBranches, setShowBranches] = useState(false);
  const [branch, setBranch] = useState("สาขา");

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
    checkIn: "",
    checkOut: "",
    checkInTime: "",
    checkOutTime: "",
  });

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

  const handleSubmit = () => {
    if (
      !form.ownerName ||
      !form.phone ||
      !form.petName ||
      !form.checkIn ||
      !form.checkOut ||
      !branch
    ) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    if (onSubmit) {
      onSubmit({ ...form, branch });
    } else {
      Alert.alert("สำเร็จ", "ส่งข้อมูลการจองเรียบร้อยแล้ว");
    }
  };

  const Field = ({ label, value, onChangeText, placeholder, style }) => (
    <View style={[styles.fieldContainer, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ""}
        placeholderTextColor="#8293A0"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </TouchableOpacity>

      {/* Main Section */}
      <View style={styles.mainWrapper}>
        <View style={styles.mainSection}>
            {/* Left Side */}
            <View style={styles.leftSection}>
            <Image
                source={require("../1assets/titlelogo.png")}
                style={styles.titlelogo}
                resizeMode="cover"
            />
            </View>

            {/* Right Side */}
            <View style={styles.rightSection}>
            <Text style={styles.title}>Booking Form</Text>

            <View style={styles.formColumns}>
                {/* Column 1 */}
                <View style={styles.formColumn}>
                <Text style={styles.sectionTitle}>ข้อมูลผู้จอง</Text>

                <Field
                    label="ชื่อ"
                    value={form.ownerName}
                    onChangeText={(v) => updateForm("ownerName", v)}
                />

                <Field
                    label="เบอร์โทรติดต่อ"
                    value={form.phone}
                    onChangeText={(v) => updateForm("phone", v)}
                />

                <Field
                    label="email"
                    value={form.email}
                    onChangeText={(v) => updateForm("email", v)}
                />

                <Text style={styles.sectionTitle}>ข้อมูลสัตว์เลี้ยง</Text>

                <Field
                    label="ชื่อสัตว์เลี้ยง"
                    value={form.petName}
                    onChangeText={(v) => updateForm("petName", v)}
                />

                <Field
                    label="ประเภท"
                    value={form.petType}
                    onChangeText={(v) => updateForm("petType", v)}
                />

                <Field
                    label="สายพันธุ์"
                    value={form.breed}
                    onChangeText={(v) => updateForm("breed", v)}
                />

                <Field
                    label="เพศ"
                    value={form.gender}
                    onChangeText={(v) => updateForm("gender", v)}
                />

                <Field
                    label="วันเกิด"
                    value={form.age}
                    onChangeText={(v) => updateForm("age", v)}
                />

                <Field
                    label="น้ำหนัก"
                    value={form.weight}
                    onChangeText={(v) => updateForm("weight", v)}
                />

                <Field
                    label="โรคประจำตัว/ประวัติการแพ้ยา-อาหาร"
                    value={form.health}
                    onChangeText={(v) => updateForm("health", v)}
                />

                <Field
                    label="ข้อจำกัด/คำแนะนำในการดูแล"
                    value={form.health}
                    onChangeText={(v) => updateForm("health", v)}
                />
                </View>

                {/* Column 2 */}
                <View style={styles.formColumn}>
                <Text style={styles.sectionTitle}>ข้อมูลการเข้าพัก</Text>

                <Field
                    label="วันที่ฝาก"
                    value={form.checkIn}
                    onChangeText={(v) => updateForm("checkIn", v)}
                    placeholder="วัน/เดือน/ปี"
                />

                <Field
                    label="วันที่เข้ารับ"
                    value={form.checkOut}
                    onChangeText={(v) => updateForm("checkOut", v)}
                    placeholder="วัน/เดือน/ปี"
                />

                <Field
                    label="เวลาเข้าพัก"
                    value={form.checkInTime}
                    onChangeText={(v) => updateForm("checkInTime", v)}
                    placeholder="00:00"
                />

                <Field
                    label="เวลารับกลับ"
                    value={form.checkOutTime}
                    onChangeText={(v) => updateForm("checkOutTime", v)}
                    placeholder="00:00"
                />

                <Text style={styles.branchTitle}>เลือกสาขา</Text>

                <TouchableOpacity
                    style={styles.branchButton}
                    onPress={() => setShowBranches(!showBranches)}
                >
                    <Text style={styles.branchText}>{branch}</Text>
                    <Text style={styles.arrow}>▼</Text>
                </TouchableOpacity>

                {showBranches && (
                    <View style={styles.dropdown}>
                    {branches.map((item, index) => (
                        <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                            setBranch(item);
                            setShowBranches(false);
                        }}
                        >
                        <Text style={styles.dropdownText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.confirmText}>ยืนยัน</Text>
                </TouchableOpacity>
                </View>
            </View>
            </View>

            {/* Pet decoration */}
            <View style={styles.petDecoration}>
            <Image
                source={require("../1assets/piclogo.png")}
                style={styles.petpic}
                resizeMode="cover"
            />
            </View>
        </View>
      </View>
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
    // marginVertical: 30,
    minHeight: 420,
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

  bigPaw: {
    fontSize: 45,
    marginRight: 15,
  },

  logoText: {
    fontSize: 37,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  smallPaw: {
    fontSize: 32,
    marginLeft: 15,
  },

  rightSection: {
    flex: 1.35,
    zIndex: 2,
    paddingHorizontal: 15,
  },

  title: {
    color: "#F5A400",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 22,
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
    marginTop: 3,
  },

  fieldContainer: {
    marginBottom: 6,
  },

  fieldLabel: {
    color: "#D6E0E8",
    fontSize: 10,
    marginBottom: 1,
  },

  input: {
    height: 21,
    borderBottomWidth: 1,
    borderBottomColor: "#405467",
    color: "#FFFFFF",
    fontSize: 10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    outlineStyle: "none",
  },

  branchTitle: {
    color: "#F5A400",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },

  branchButton: {
    height: 27,
    backgroundColor: "#F47B0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  branchText: {
    color: "#FFFFFF",
    fontSize: 11,
  },

  arrow: {
    color: "#F5B52A",
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
    height: 37,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 75,
    marginHorizontal: 15,
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  petDecoration: {
    position: "absolute",
    right: 330,
    bottom: 140,
    flexDirection: "row",
    opacity: 0.15,
    zIndex: 1,
  },

  petpic: {
    width: 500,
    height: 320,
  },
});
