
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function MyBookingUser({
  visible = false,
  onBack,
  bookings = [],
  onCancelBooking,
}) {
  const [filter, setFilter] = useState("ทั้งหมด");
  const [showFilter, setShowFilter] = useState(false);

  const statusOptions = [
    "ทั้งหมด",
    "จองสำเร็จ",
    "รอยืนยันคิว",
    "ถูกปฏิเสธ",
  ];

  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "ไม่ได้ระบุ";
    }
    return String(value);
  };

  const getFirstValue = (...values) => {
    return values.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    );
  };

  const getDisplayStatus = (status) => {
    if (
      ["รอรับเข้า", "In Care", "พร้อมรับกลับ", "รับกลับแล้ว"].includes(status)
    ) {
      return "จองสำเร็จ";
    }
    return status || "ไม่ได้ระบุ";
  };

  // Backend ใช้ reservationDate เป็นเวลาที่สร้างรายการจอง
  const getBookingTimestamp = (booking) => {
    return getFirstValue(
      booking?.reservationDate,
      booking?.reservation_date,
      booking?.bookingTimestamp,
      booking?.booking_timestamp,
      booking?.bookingTime,
      booking?.booking_time,
      booking?.createdAt,
      booking?.created_at,
      booking?.requestedAt,
      booking?.requested_at,
      booking?.submittedAt,
      booking?.submitted_at,
      booking?.timestamp,
      booking?.time
    );
  };

  const formatBookingTimestamp = (value) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return "ไม่ได้ระบุ";
    }

    let dateValue = value;

    // รองรับ Unix timestamp ทั้งวินาทีและมิลลิวินาที
    if (
      typeof dateValue === "number" ||
      /^\d+$/.test(String(dateValue).trim())
    ) {
      dateValue = Number(dateValue);

      if (dateValue < 100000000000) {
        dateValue *= 1000;
      }
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "ไม่ได้ระบุ";
    }

    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const displayBranch = (value) => {
    const branchName = displayValue(value);

    if (branchName === "ไม่ได้ระบุ") {
      return branchName;
    }

    return branchName.startsWith("สาขา")
      ? branchName
      : `สาขา${branchName}`;
  };

  // รองรับชื่อ Field จาก Backend และชื่อเดิมของแอป
  const getBookingInfo = (booking) => ({
    id: getFirstValue(
      booking?.reservationId,
      booking?.reservation_id,
      booking?.id
    ),
    name: getFirstValue(
      booking?.name,
      booking?.customerName,
      booking?.customer_name
    ),
    phone: getFirstValue(
      booking?.phone,
      booking?.customerPhone,
      booking?.customer_phone
    ),
    email: getFirstValue(
      booking?.email,
      booking?.customerEmail,
      booking?.customer_email
    ),
    pet: getFirstValue(
      booking?.pet,
      booking?.petName,
      booking?.pet_name
    ),
    petType: getFirstValue(
      booking?.petType,
      booking?.pet_type
    ),
    breed: getFirstValue(
      booking?.breed,
      booking?.petBreed,
      booking?.pet_breed
    ),
    gender: getFirstValue(
      booking?.gender,
      booking?.petSex,
      booking?.pet_sex
    ),
    birth: getFirstValue(
      booking?.birth,
      booking?.petBirth,
      booking?.pet_birth,
      booking?.age
    ),
    weight: getFirstValue(
      booking?.weight,
      booking?.petWeight,
      booking?.pet_weight
    ),
    health: getFirstValue(
      booking?.health,
      booking?.petCondition,
      booking?.pet_condition
    ),
    careNotes: getFirstValue(
      booking?.careNotes,
      booking?.petNote,
      booking?.pet_note
    ),
    branch: getFirstValue(
      booking?.branch,
      booking?.branchName,
      booking?.branch_name
    ),
    startDate: getFirstValue(
      booking?.startDate,
      booking?.checkIn,
      booking?.check_in
    ),
    endDate: getFirstValue(
      booking?.endDate,
      booking?.checkOut,
      booking?.check_out
    ),
  });

  const filteredBookings = useMemo(() => {
    if (filter === "ทั้งหมด") {
      return bookings;
    }

    return bookings.filter(
      (item) => getDisplayStatus(item.status) === filter
    );
  }, [bookings, filter]);

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);

    if (displayStatus === "จองสำเร็จ") return "#279b45";
    if (displayStatus === "รอยืนยันคิว") return "#f39c12";
    if (displayStatus === "ถูกปฏิเสธ") return "#e53935";

    return "#333333";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>ย้อนกลับ</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>การจองของฉัน</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterArea}>
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterText}>
              {filter === "ทั้งหมด" ? "สถานะ" : filter} ▼
            </Text>
          </TouchableOpacity>

          {showFilter && (
            <View style={styles.filterDropdown}>
              {statusOptions.map((status) => (
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
                      filter === status && styles.selectedFilterText,
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

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookingList}>
          {filteredBookings.length ? (
            filteredBookings.map((booking, idx) => {
              const info = getBookingInfo(booking);
              const bookingStatus = getDisplayStatus(booking.status);
              const bookingTimestamp = getBookingTimestamp(booking);

              return (
                <View
                  key={String(info.id || idx)}
                  style={styles.bookingCard}
                >
                  <View style={styles.cardBar} />

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.bookingId}>
                        รหัสนัดหมาย {displayValue(info.id)}
                      </Text>

                      <Text
                        style={[
                          styles.bookingStatus,
                          { color: getStatusColor(booking.status) },
                        ]}
                      >
                        {bookingStatus}
                      </Text>
                    </View>

                    <Text style={styles.branchText}>
                      {displayBranch(info.branch)}
                    </Text>

                    <View style={styles.infoContainer}>
                      {/* ข้อมูลผู้จอง */}
                      <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>
                          ข้อมูลผู้จอง
                        </Text>

                        <Text style={styles.infoValue}>
                          {displayValue(info.name)}
                        </Text>

                        <Text style={styles.infoValue}>
                          {displayValue(info.phone)}
                        </Text>

                        <Text style={styles.infoValue}>
                          {displayValue(info.email)}
                        </Text>
                      </View>

                      {/* ข้อมูลสัตว์เลี้ยง */}
                      <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>
                          ข้อมูลสัตว์เลี้ยง
                        </Text>

                        <Text style={styles.infoValue}>
                          {displayValue(info.pet)}
                        </Text>

                        <Text style={styles.infoValue}>
                          ประเภท: {displayValue(info.petType)}
                        </Text>

                        <Text style={styles.infoValue}>
                          สายพันธุ์: {displayValue(info.breed)}
                        </Text>

                        <Text style={styles.infoValue}>
                          เพศ: {displayValue(info.gender)}
                        </Text>

                        <Text style={styles.infoValue}>
                          วันเกิด: {displayValue(info.birth)}
                        </Text>

                        <Text style={styles.infoValue}>
                          น้ำหนัก:{" "}
                          {info.weight !== undefined &&
                          info.weight !== null &&
                          String(info.weight).trim() !== ""
                            ? `${info.weight} กก.`
                            : "ไม่ได้ระบุ"}
                        </Text>

                        <Text style={styles.infoValue}>
                          สุขภาพ: {displayValue(info.health)}
                        </Text>

                        <Text style={styles.infoValue}>
                          คำแนะนำ: {displayValue(info.careNotes)}
                        </Text>
                      </View>

                      {/* วันที่และเวลา */}
                      <View style={styles.dateColumn}>
                        <Text style={styles.infoLabel}>
                          วันที่เริ่ม-สิ้นสุดบริการ
                        </Text>

                        <Text style={styles.infoValue}>
                          {displayValue(info.startDate)} -{" "}
                          {displayValue(info.endDate)}
                        </Text>

                        <Text style={styles.infoLabel}>
                          วันที่และเวลาที่กดจอง
                        </Text>

                        <Text style={styles.bookingTimestamp}>
                          {formatBookingTimestamp(bookingTimestamp)}
                        </Text>

                        {bookingStatus !== "ถูกปฏิเสธ" &&
                          String(booking.status || "").trim() !== "รับกลับแล้ว" && (
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() =>
                                onCancelBooking &&
                                onCancelBooking(info.id)
                              }
                            >
                              <Text style={styles.cancelButtonText}>
                                ยกเลิกการจอง
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
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

  filterArea: {
    paddingHorizontal: 30,
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
    shadowOffset: { width: 0, height: 3 },
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

  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 40,
  },

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
    shadowOffset: { width: 0, height: 2 },
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

  bookingTimestamp: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
  },

  emptyText: {
    textAlign: "center",
    color: "#888888",
    marginTop: 50,
    fontSize: 14,
  },

  cancelButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#FCE0E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E53935",
  },

  cancelButtonText: {
    color: "#E53935",
    fontSize: 10,
    fontWeight: "bold",
  },
});
