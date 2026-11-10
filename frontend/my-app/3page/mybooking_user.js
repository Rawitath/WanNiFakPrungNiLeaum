
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const bookingData = [
  {
    id: "#O11",
    branch: "ลาดกระบัง",
    name: "นางสาววิลักษณ์ อ่อน",
    phone: "089xxxxxxxx",
    pet: "มีนา",
    breed: "สุริน โกลเด้น",
    age: "โตเต็มวัย",
    startDate: "10/03/2569",
    endDate: "13/03/2569",
    status: "จองสำเร็จ",
  },
  {
    id: "#O10",
    branch: "ลาดกระบัง",
    name: "นางสาววิลักษณ์ อ่อน",
    phone: "089xxxxxxxx",
    pet: "มีนา",
    breed: "สุริน โกลเด้น",
    age: "โตเต็มวัย",
    startDate: "10/03/2569",
    endDate: "13/03/2569",
    status: "กำลังดำเนินการ",
  },
  {
    id: "#O19",
    branch: "ลาดกระบัง",
    name: "นางสาววิลักษณ์ อ่อน",
    phone: "089xxxxxxxx",
    pet: "มีนา",
    breed: "สุริน โกลเด้น",
    age: "โตเต็มวัย",
    startDate: "10/03/2569",
    endDate: "13/03/2569",
    status: "จองไม่สำเร็จ",
  },
  {
    id: "#O17",
    branch: "ลาดกระบัง",
    name: "นางสาววิลักษณ์ อ่อน",
    phone: "089xxxxxxxx",
    pet: "มีนา",
    breed: "สุริน โกลเด้น",
    age: "โตเต็มวัย",
    startDate: "10/03/2569",
    endDate: "13/03/2569",
    status: "จองไม่สำเร็จ",
  },
  {
    id: "#O18",
    branch: "ลาดกระบัง",
    name: "นางสาววิลักษณ์ อ่อน",
    phone: "089xxxxxxxx",
    pet: "มีนา",
    breed: "สุริน โกลเด้น",
    age: "โตเต็มวัย",
    startDate: "10/03/2569",
    endDate: "13/03/2569",
    status: "จองไม่สำเร็จ",
  },
];

export default function MyBookingUser({
  visible = false,
  onBack,
}) {
  const [filter, setFilter] = useState("ทั้งหมด");
  const [showFilter, setShowFilter] = useState(false);

  const filteredBookings =
    filter === "ทั้งหมด"
      ? bookingData
      : bookingData.filter(
          (item) => item.status === filter
        );

  const getStatusColor = (status) => {
    switch (status) {
      case "จองสำเร็จ":
        return "#279b45";
      case "กำลังดำเนินการ":
        return "#f39c12";
      case "จองไม่สำเร็จ":
        return "#e53935";
      default:
        return "#333";
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>
            ย้อนกลับ
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          การจองของฉัน
        </Text>
      </View>

      {/* FILTER AREA - FIXED ไม่เลื่อนตามรายการ */}
      <View style={styles.filterArea}>
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(!showFilter)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterText}>
              {filter === "ทั้งหมด"
                ? "สถานะ"
                : filter} ▼
            </Text>
          </TouchableOpacity>

          {/* DROPDOWN */}
          {showFilter && (
            <View style={styles.filterDropdown}>
              {[
                "ทั้งหมด",
                "จองสำเร็จ",
                "กำลังดำเนินการ",
                "จองไม่สำเร็จ",
              ].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.filterOption}
                  onPress={() => {
                    setFilter(status);
                    setShowFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filter === status &&
                        styles.selectedFilterText,
                    ]}
                  >
                    {status}
                    {filter === status ? " ✓" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* BOOKING LIST - เลื่อนเฉพาะรายการ */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookingList}>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <View
                key={booking.id}
                style={styles.bookingCard}
              >
                {/* แถบสีน้ำเงินด้านซ้าย */}
                <View style={styles.cardBar} />

                <View style={styles.cardContent}>
                  {/* รหัสและสถานะ */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.bookingId}>
                      รหัสนัดหมาย {booking.id}
                    </Text>

                    <Text
                      style={[
                        styles.bookingStatus,
                        {
                          color: getStatusColor(
                            booking.status
                          ),
                        },
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>

                  <Text style={styles.branchText}>
                    สาขา {booking.branch}
                  </Text>

                  {/* ข้อมูล */}
                  <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>
                        ข้อมูลผู้จอง
                      </Text>

                      <Text style={styles.infoValue}>
                        {booking.name}
                      </Text>

                      <Text style={styles.infoValue}>
                        {booking.phone}
                      </Text>
                    </View>

                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>
                        ข้อมูลสัตว์เลี้ยง
                      </Text>

                      <Text style={styles.infoValue}>
                        {booking.pet}
                      </Text>

                      <Text style={styles.infoValue}>
                        {booking.breed}
                      </Text>

                      <Text style={styles.infoValue}>
                        {booking.age}
                      </Text>
                    </View>

                    <View style={styles.dateColumn}>
                      <Text style={styles.infoLabel}>
                        วันที่เริ่ม-สิ้นสุดบริการ
                      </Text>

                      <Text style={styles.infoValue}>
                        {booking.startDate}-
                        {booking.endDate}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              ไม่พบรายการจอง
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },

  // HEADER
  header: {
    height: 135,
    backgroundColor: "#0b2d47",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  backButton: {
    alignSelf: "flex-start",
    marginTop: 20,
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

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },

  // FILTER AREA
  filterArea: {
    paddingHorizontal: 300,
    paddingTop: 25,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    zIndex: 100,
    elevation: 100,
  },

  filterWrapper: {
    alignItems: "flex-end",
    position: "relative",
    zIndex: 100,
  },

  filterButton: {
    borderWidth: 1,
    borderColor: "#647b8e",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 90,
  },

  filterText: {
    fontSize: 12,
    color: "#15344d",
    textAlign: "center",
  },

  filterDropdown: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 15,
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  filterOption: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
  },

  filterOptionText: {
    fontSize: 12,
    color: "#333333",
  },

  selectedFilterText: {
    color: "#246AA5",
    fontWeight: "bold",
  },

  // CONTENT
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingHorizontal: 300,
    paddingTop: 10,
    paddingBottom: 40,
  },

  // BOOKING LIST
  bookingList: {
    gap: 22,
    paddingHorizontal: 5,
  },

  bookingCard: {
    flexDirection: "row",
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: "hidden",
  },

  cardBar: {
    width: 37,
    backgroundColor: "#216ca7",
    borderRadius: 8,
  },

  cardContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 5,
  },

  bookingId: {
    color: "#ff7100",
    fontSize: 15,
    fontWeight: "600",
  },

  bookingStatus: {
    fontSize: 11,
  },

  branchText: {
    fontSize: 11,
    color: "#111111",
    marginBottom: 7,
  },

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  infoColumn: {
    flex: 1,
  },

  dateColumn: {
    flex: 1.5,
  },

  infoLabel: {
    color: "#216ca7",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },

  infoValue: {
    color: "#111111",
    fontSize: 10,
    marginBottom: 3,
  },

  emptyText: {
    textAlign: "center",
    color: "#888888",
    marginTop: 50,
    fontSize: 14,
  },
});
