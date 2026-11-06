
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function HomePageStaff({
  onViewBooking,
  onViewPet,
  onCheckIn,
  onCheckOut,
}) {
  const [selectedBranch, setSelectedBranch] = useState("สาขา");
  const [showBranches, setShowBranches] = useState(false);

  const branches = [
    "สาขาลาดกระบัง",
    "สาขาร่มเกล้า",
    "สาขาปราจีนบุรี",
    "สาขาหาดใหญ่",
  ];

  // ข้อมูลคิวฝากสัตว์เลี้ยง
  const bookingQueue = [
    {
      id: 1,
      time: "10:00",
      name: "มิลค์ - แมว",
      detail: "คุณจุ๊ดจุ๊ด - 12-15 ธ.ค.",
      status: "รอรับเข้า",
      color: "#FCE9CC",
      textColor: "#D99035",
    },
    {
      id: 2,
      time: "13:00",
      name: "โบโบ้ - สุนัข",
      detail: "คุณหมวย - 13-20 ธ.ค.",
      status: "รอรับเข้า",
      color: "#FCE9CC",
      textColor: "#D99035",
    },
    {
      id: 3,
      time: "14:30",
      name: "คุกกี้ - สุนัข",
      detail: "คุณหมวย - 14-16 ธ.ค.",
      status: "ยืนยันแล้ว",
      color: "#DDF1E5",
      textColor: "#4B9D73",
    },
    {
      id: 4,
      time: "16:00",
      name: "มินนี่ - แมว",
      detail: "คุณหมวย - 18-22 ธ.ค.",
      status: "ยืนยันแล้ว",
      color: "#DDF1E5",
      textColor: "#4B9D73",
    },
  ];

  // ข้อมูลบันทึกเข้า-ออกรับคืน
  const activityList = [
    {
      id: 1,
      name: "มิลค์ - แมว",
      detail: "เข้า 10:00 • คุณจุ๊ดจุ๊ด",
      action: "รับเข้าพัก",
      color: "#174F83",
    },
    {
      id: 2,
      name: "มินนี่ - สุนัข",
      detail: "ออก 14:00 • คุณหมวย",
      action: "รับกลับออก",
      color: "#F39A13",
    },
    {
      id: 3,
      name: "โบโบ้ - สุนัข",
      detail: "เข้า 16:00 • คุณหมวย",
      action: "รับเข้าพัก",
      color: "#174F83",
    },
  ];

  // ข้อมูลสัตว์เลี้ยงที่รับฝาก
  const petList = [
    {
      id: 1,
      name: "แมวขาวดำ - สุขี",
      room: "A2",
      owner: "คุณสายฝน",
      status: "In Care",
      statusColor: "#FCE9CC",
      textColor: "#D99035",
    },
    {
      id: 2,
      name: "หมี - แมว",
      room: "A5",
      owner: "คุณหมวย",
      status: "ไม่ผ่าน",
      statusColor: "#FCE1DC",
      textColor: "#DB6658",
    },
    {
      id: 3,
      name: "โบ้ - สุนัข",
      room: "B1",
      owner: "คุณจุ๊ด",
      status: "พร้อมรับกลับ",
      statusColor: "#DDF1E5",
      textColor: "#4B9D73",
    },
  ];

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setShowBranches(false);
  };

  return (
    <View style={styles.container}>

      {/* TOP DARK SECTION */}
      <View style={styles.topSection}>

        <View style={styles.welcomeSection}>
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText}>
              สวัสดี, พี่มิลค์
            </Text>

            {/* BRANCH DROPDOWN */}
            <View style={styles.branchContainer}>
              <TouchableOpacity
                style={styles.branchButton}
                onPress={() => setShowBranches(!showBranches)}
              >
                <Text style={styles.branchText}>
                  {selectedBranch}
                </Text>
                <Text style={styles.branchArrow}>▼</Text>
              </TouchableOpacity>

              {showBranches && (
                <View style={styles.branchDropdown}>
                  {branches.map((branch, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.branchItem}
                      onPress={() => handleBranchSelect(branch)}
                    >
                      <Text style={styles.branchItemText}>
                        {branch}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

        </View>

        {/* STATISTICS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>
              กำลังเข้าพัก
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>
              รอรับคืน
            </Text>
          </View>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >

        {/* TOP CARDS */}
        <View style={styles.topCards}>

          {/* BOOKING QUEUE */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                จัดการคิวฝาก
              </Text>

              <Text style={styles.cardSubtitle}>
                รอยืนยัน 3 · ยืนยันแล้ว 5
              </Text>
            </View>

            {bookingQueue.map((item) => (
              <View key={item.id} style={styles.queueRow}>

                <Text style={styles.queueTime}>
                  {item.time}
                </Text>

                <View style={styles.queueInfo}>
                  <Text style={styles.queueName}>
                    {item.name}
                  </Text>

                  <Text style={styles.queueDetail}>
                    {item.detail}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.textColor },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    onViewBooking && onViewBooking(item)
                  }
                >
                  <Text style={styles.detailButtonText}>
                    เลื่อนดู
                  </Text>
                </TouchableOpacity>

              </View>
            ))}
          </View>

          {/* CHECK IN / OUT */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                บันทึกเข้า-ออกรับคืน
              </Text>
            </View>

            {activityList.map((item) => (
              <View key={item.id} style={styles.activityRow}>

                <View style={styles.petAvatar} />

                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>
                    {item.name}
                  </Text>

                  <Text style={styles.activityDetail}>
                    {item.detail}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.activityButton,
                    { backgroundColor: item.color },
                  ]}
                  onPress={() => {
                    if (item.action === "รับเข้าพัก") {
                      onCheckIn && onCheckIn(item);
                    } else {
                      onCheckOut && onCheckOut(item);
                    }
                  }}
                >
                  <Text style={styles.activityButtonText}>
                    {item.action}
                  </Text>
                </TouchableOpacity>

              </View>
            ))}
          </View>

        </View>

        {/* PET TABLE */}
        <View style={styles.petTableCard}>

          <View style={styles.tableHeader}>
            <Text style={styles.cardTitle}>
              สัตว์ที่รับฝาก
            </Text>

            <TouchableOpacity
              onPress={() => onViewPet && onViewPet()}
            >
              <Text style={styles.viewAllText}>
                ดูทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>

          {/* TABLE HEAD */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeading, styles.petNameCol]}>
              สัตว์เลี้ยง
            </Text>

            <Text style={[styles.tableHeading, styles.roomCol]}>
              ห้อง
            </Text>

            <Text style={[styles.tableHeading, styles.ownerCol]}>
              เจ้าของ
            </Text>

            <Text style={[styles.tableHeading, styles.statusCol]}>
              สถานะ
            </Text>

            <Text style={[styles.tableHeading, styles.actionCol]}>
              จัดการ
            </Text>
          </View>

          {/* TABLE DATA */}
          {petList.map((pet) => (
            <View key={pet.id} style={styles.tableRow}>

              <Text style={[styles.tableText, styles.petNameCol]}>
                {pet.name}
              </Text>

              <Text style={[styles.tableText, styles.roomCol]}>
                {pet.room}
              </Text>

              <Text style={[styles.tableText, styles.ownerCol]}>
                {pet.owner}
              </Text>

              <View style={styles.statusCol}>
                <View
                  style={[
                    styles.tableStatus,
                    { backgroundColor: pet.statusColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableStatusText,
                      { color: pet.textColor },
                    ]}
                  >
                    {pet.status} ▼
                  </Text>
                </View>
              </View>

              <View style={[styles.actionCol, styles.actionButtons]}>
                <TouchableOpacity
                  style={styles.tableButton}
                  onPress={() => onViewPet && onViewPet(pet)}
                >
                  <Text style={styles.tableButtonText}>
                    ดูรายละเอียด
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tableButton}
                  onPress={() => onViewBooking && onViewBooking(pet)}
                >
                  <Text style={styles.tableButtonText}>
                    ดูรายละเอียดห้อง
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          ))}

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F9",
  },

  // TOP SECTION
  topSection: {
    height: 146,
    backgroundColor: "#0C2B43",
    paddingHorizontal: 68,
    paddingTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  welcomeSection: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 5,
  },

  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },

  welcomeText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },

  // BRANCH
  branchContainer: {
    zIndex: 20,
  },

  branchButton: {
    backgroundColor: "#F5A000",
    borderRadius: 8,
    height: 32,
    minWidth: 70,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  branchText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  branchArrow: {
    color: "#FFFFFF",
    fontSize: 11,
  },

  branchDropdown: {
    position: "absolute",
    top: 32,
    left: 0,
    width: 125,
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    elevation: 8,
    zIndex: 30,
  },

  branchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  branchItemText: {
    fontSize: 11,
    color: "#17344D",
  },

  // STATISTICS
  statsContainer: {
    flexDirection: "row",
    gap: 8,
  },

  statCard: {
    width: 85,
    height: 86,
    backgroundColor: "#163954",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  statNumber: {
    color: "#F5A000",
    fontSize: 26,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#D5DFE8",
    fontSize: 12,
    marginTop: 3,
  },

  // MAIN CONTENT
  mainScroll: {
    flex: 1,
    marginTop: -29,
  },

  mainContent: {
    paddingHorizontal: 50,
    paddingBottom: 35,
  },

  topCards: {
    flexDirection: "row",
    gap: 14,
  },

  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 180,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    color: "#19344C",
    fontSize: 23,
    fontWeight: "bold",
  },

  cardSubtitle: {
    color: "#8795A3",
    fontSize: 12,
  },

  // QUEUE
  queueRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    gap: 20,
  },

  queueTime: {
    width: 40,
    color: "#73869A",
    fontSize: 15,
  },

  queueInfo: {
    flex: 1,
    minWidth: 0,
  },

  queueName: {
    color: "#24435E",
    fontSize: 15,
    fontWeight: "bold",
  },

  queueDetail: {
    color: "#8B9AA9",
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  detailButton: {
    borderWidth: 1,
    borderColor: "#DCE4EC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  detailButtonText: {
    color: "#286BA5",
    fontSize: 11,
  },

  // ACTIVITY
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 55,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    gap: 8,
  },

  petAvatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#69C1E0",
  },

  activityInfo: {
    flex: 1,
    minWidth: 0,
  },

  activityName: {
    color: "#24435E",
    fontSize: 15,
    fontWeight: "bold",
  },

  activityDetail: {
    color: "#8999A8",
    fontSize: 11,
    marginTop: 4,
  },

  activityButton: {
    minWidth: 49,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },

  activityButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  // PET TABLE
  petTableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginTop: 19,
    marginHorizontal: "10%",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F3",
  },

  tableHeading: {
    color: "#8795A3",
    fontSize: 15,
  },

  tableText: {
    color: "#314B62",
    fontSize: 15,
  },

  petNameCol: {
    flex: 1.5,
  },

  roomCol: {
    flex: 0.7,
  },

  ownerCol: {
    flex: 1,
  },

  statusCol: {
    flex: 1,
  },

  actionCol: {
    flex: 1.8,
  },

  tableStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  tableStatusText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },

  tableButton: {
    borderWidth: 1,
    borderColor: "#DCE4EC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  tableButtonText: {
    color: "#286BA5",
    fontSize: 11,
  },
});
