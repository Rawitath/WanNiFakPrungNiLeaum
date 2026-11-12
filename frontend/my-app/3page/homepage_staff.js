import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import StaffSidePanel from "../2components/booking_SidePanel.js";
import UserSidePanel from "../2components/information_SidePanel.js";
import { BRANCHES, getBranchValue, getBranchLabel } from "../2components/branchConfig";

export default function HomePageStaff({
  staffName = "พนักงาน",
  bookingQueue = [],
  activityList = [],
  petList = [],
  onViewBooking,
  onViewPet,
  onCheckIn,
  onCheckOut,
  onUpdatePetStatus,
  onConfirmQueue,
  onRejectQueue,
}) {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]?.value || "ลาดกระบัง");
  const [showBranches, setShowBranches] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showInformationPanel, setShowInformationPanel] = useState(false);
  const [selectedInformation, setSelectedInformation] = useState(null);
  const [showStatusDropdownId, setShowStatusDropdownId] = useState(null);

  const formatQueueTime = (reservationDate) => {
    if (!reservationDate) return "--:--";

    const date = new Date(reservationDate);

    if (Number.isNaN(date.getTime())) return "--:--";

    return date.toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const normalizeBranch = (branch) =>
    getBranchValue(branch).toLowerCase().replace(/\s+/g, "").trim();

  const isMatchingBranch = (item) => {
    const itemBranch = item?.branch || item?.branchName || item?.branch_name;
    if (!itemBranch) return false;
    return normalizeBranch(itemBranch) === normalizeBranch(selectedBranch);
  };

  // แสดงเฉพาะคิวที่ยังรอยืนยัน และข้อมูลของสาขาที่เลือกเท่านั้น
  const filteredPetList = petList.filter(
    (pet) => isMatchingBranch(pet) && ["In Care", "พร้อมรับกลับ"].includes(pet.status)
  );
  const filteredBookingQueue = bookingQueue.filter(
    (booking) => isMatchingBranch(booking) && booking.status === "รอยืนยันคิว"
  );
  const filteredActivityList = activityList.filter((activity) => isMatchingBranch(activity));

  const handleSelectStatus = (pet, newStatus) => {
    onUpdatePetStatus && onUpdatePetStatus(pet.petId || pet.id, newStatus);
    setShowStatusDropdownId(null);
  };

  const handleViewPet = (pet) => {
    setSelectedPet(pet);
    setShowPanel(true);
    onViewPet && onViewPet(pet);
  };

  const handleViewInformation = (information) => {
    const normalize = (value) => String(value || "").trim().toLowerCase();
    const email = normalize(information?.customerEmail || information?.email);
    const phone = normalize(information?.customerPhone || information?.phone);
    const customerName = normalize(information?.customerName || information?.owner);

    // petList มีข้อมูลครบทุกสถานะ ส่วน filteredPetList ใช้กรองเฉพาะตารางหลัก
    const customerPets = petList.filter((candidate) => {
      const candidateEmail = normalize(candidate?.customerEmail || candidate?.email);
      const candidatePhone = normalize(candidate?.customerPhone || candidate?.phone);
      const candidateName = normalize(candidate?.customerName || candidate?.owner);

      if (email) return candidateEmail === email;
      if (phone) return candidatePhone === phone;
      return Boolean(customerName && candidateName === customerName);
    });

    // ใช้รหัสสัตว์เลี้ยงตัดรายการซ้ำที่อาจเกิดจากการจองหลายครั้ง
    const uniqueCustomerPets = Array.from(
      new Map(
        customerPets.map((candidate, index) => [
          String(candidate?.petId || candidate?.id || `pet-${index}`),
          candidate,
        ])
      ).values()
    );

    setSelectedInformation({ ...information, pets: uniqueCustomerPets });
    setShowInformationPanel(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText}>สวัสดี, {staffName}</Text>
            <View style={styles.branchContainer}>
              <TouchableOpacity style={styles.branchButton} onPress={() => setShowBranches((v) => !v)}>
                <Text style={styles.branchText}>{getBranchLabel(selectedBranch)}</Text>
                <Text style={styles.branchArrow}>▼</Text>
              </TouchableOpacity>
              {showBranches && (
                <View style={styles.branchDropdown}>
                  {BRANCHES.map((branch) => (
                    <TouchableOpacity key={branch.value} style={styles.branchItem} onPress={() => { setSelectedBranch(branch.value); setShowBranches(false); }}>
                      <Text style={styles.branchItemText}>{branch.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {filteredPetList.filter((p) => p.status === "In Care").length}
            </Text>
            <Text style={styles.statLabel}>กำลังเข้าพัก</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {filteredPetList.filter((p) => p.status === "พร้อมรับกลับ").length}
            </Text>
            <Text style={styles.statLabel}>รอรับคืน</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topCards}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>จัดการคิวฝาก</Text>
              <Text style={styles.cardSubtitle}>คิวทั้งหมด {filteredBookingQueue.length}</Text>
            </View>
            <ScrollView style={styles.cardInnerScroll} nestedScrollEnabled>
              {filteredBookingQueue.map((item) => (
                <View key={item.id} style={styles.queueRow}>
                <Text style={styles.queueTime}>
                  {formatQueueTime(item.reservationDate)}
                </Text>
                  <View style={styles.queueInfo}>
                    <Text style={styles.queueName}>{item.name}</Text>
                    <Text style={styles.queueDetail}>{item.detail}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: item.color || "#FCE9CC" }]}>
                    <Text style={[styles.statusText, { color: item.textColor || "#D99035" }]}>{item.status}</Text>
                  </View>
                  {item.status === "รอรับเข้า" || item.status === "รอยืนยันคิว" || item.status === "pending" ? (
                    <>
                      <TouchableOpacity style={styles.detailButton} onPress={() => onConfirmQueue ? onConfirmQueue(item) : onViewBooking && onViewBooking(item)}>
                        <Text style={styles.detailButtonText}>ยืนยัน</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton} onPress={() => onRejectQueue ? onRejectQueue(item) : onViewBooking && onViewBooking(item)}>
                        <Text style={styles.rejectButtonText}>ปฏิเสธ</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.detailButton} onPress={() => onViewBooking ? onViewBooking(item) : handleViewPet(item)}>
                      <Text style={styles.detailButtonText}>รายละเอียด</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {!filteredBookingQueue.length && <Text style={styles.emptyText}>ไม่มีคิวฝากในสาขานี้</Text>}
            </ScrollView>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}><Text style={styles.cardTitle}>บันทึกเข้า-ออกรับคืน</Text></View>
            <ScrollView style={styles.cardInnerScroll} nestedScrollEnabled>
              {filteredActivityList.map((item) => (
                <View key={item.id} style={styles.activityRow}>
                  <View style={styles.petAvatar} />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{item.name}</Text>
                    <Text style={styles.activityDetail}>{item.detail}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.activityButton, { backgroundColor: item.action === "รับกลับ" ? "#FACC15" : (item.color || "#174F83") }]}
                    onPress={() => item.action === "รับเข้าพัก" ? onCheckIn && onCheckIn(item) : onCheckOut && onCheckOut(item)}
                  >
                    <Text style={[styles.activityButtonText, item.action === "รับกลับ" && { color: "#713F12" }]}>{item.action}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {!filteredActivityList.length && <Text style={styles.emptyText}>ยังไม่มีประวัติกิจกรรมในสาขานี้</Text>}
            </ScrollView>
          </View>
        </View>

        <View style={styles.petTableCard}>
          <View style={styles.tableHeader}><Text style={styles.cardTitle}>สัตว์ที่รับฝาก ({getBranchLabel(selectedBranch)})</Text></View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeading, styles.petNameCol]}>สัตว์เลี้ยง</Text>
            <Text style={[styles.tableHeading, styles.ownerCol]}>เจ้าของ</Text>
            <Text style={[styles.tableHeading, styles.statusCol]}>สถานะ</Text>
            <Text style={[styles.tableHeading, styles.actionCol]}>จัดการ</Text>
          </View>
          <ScrollView style={styles.petTableScroll} nestedScrollEnabled>
            {filteredPetList.map((pet) => {
              const inCare = pet.status === "In Care" || pet.status === "สบายดี";
              return (
                <View key={pet.id} style={[styles.tableRow, { zIndex: showStatusDropdownId === (pet.petId || pet.id) ? 100 : 1 }]}>
                  <Text style={[styles.tableText, styles.petNameCol]}>{pet.name}</Text>
                  <Text style={[styles.tableText, styles.ownerCol]}>{pet.owner}</Text>
                  <View style={[styles.statusCol, { zIndex: showStatusDropdownId === (pet.petId || pet.id) ? 101 : 1 }]}>
                    <TouchableOpacity
                      style={[styles.tableStatus, { backgroundColor: inCare ? "#DDF1E5" : "#FCE9CC" }]}
                      onPress={() => setShowStatusDropdownId(showStatusDropdownId === (pet.petId || pet.id) ? null : (pet.petId || pet.id))}
                    >
                      <Text style={[styles.tableStatusText, { color: inCare ? "#4B9D73" : "#D99035" }]}>{pet.status} ▼</Text>
                    </TouchableOpacity>
                    {showStatusDropdownId === (pet.petId || pet.id) && (
                      <View style={styles.statusDropdown}>
                        {statusOptions.map((option) => (
                          <TouchableOpacity key={option} style={styles.statusDropdownItem} onPress={() => handleSelectStatus(pet, option)}>
                            <Text style={[styles.statusDropdownText, pet.status === option && styles.selectedStatusText]}>{option}{pet.status === option ? " ✓" : ""}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={[styles.actionCol, styles.actionButtons]}>
                    <TouchableOpacity style={styles.tableButton} onPress={() => handleViewPet(pet)}><Text style={styles.tableButtonText}>ดูรายละเอียด</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.tableButton} onPress={() => handleViewInformation(pet)}><Text style={styles.tableButtonText}>ข้อมูลเจ้าของ</Text></TouchableOpacity>
                  </View>
                </View>
              );
            })}
            {!filteredPetList.length && <Text style={styles.emptyText}>ไม่มีสัตว์เลี้ยงในสาขานี้</Text>}
          </ScrollView>
          <StaffSidePanel visible={showPanel} pet={selectedPet} onClose={() => setShowPanel(false)} />
          <UserSidePanel visible={showInformationPanel} information={selectedInformation} onClose={() => setShowInformationPanel(false)} />
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
    height: 106,
    backgroundColor: "#0C2B43",
    paddingHorizontal: 68,
    paddingTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 100,
    elevation: 100,
  },

  welcomeSection: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 2,
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
    marginTop: 29,
  },

  mainContent: {
    paddingHorizontal: 50,
    paddingBottom: 35,
  },

  // TOP CARDS
  topCards: {
    flexDirection: "row",
    gap: 14,
    alignItems: "stretch",
  },

  card: {
    flex: 1,
    minWidth: 0,
    height: 330,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingHorizontal: 24,
    paddingVertical: 20,
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

  cardInnerScroll: {
    flex: 1,
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

  rejectButton: {
    borderWidth: 1,
    borderColor: "#F0D2D2",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  rejectButtonText: {
    color: "#D9534F",
    fontSize: 10
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
    height: 360,
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

  petTableScroll: {
    flex: 1,
  },

  // STATUS DROPDOWN
  statusDropdown: {
    position: "absolute",
    top: 38,
    left: 0,
    width: 145,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 12,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    overflow: "hidden",
  },

  statusDropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F3",
  },

  statusDropdownText: {
    color: "#314B62",
    fontSize: 12,
  },

  selectedStatusText: {
    color: "#F39A13",
    fontWeight: "bold",
  },

  // ACTION BUTTONS
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
