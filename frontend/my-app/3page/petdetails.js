import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const PetDetails = ({
  onBack,
  pet,
  petImage,
  initialStatus,
  onStatusChange,
}) => {

const currentInitialStatus =
  pet?.status || initialStatus || "รอยืนยันคิว";

const [status, setStatus] = useState(currentInitialStatus);

useEffect(() => {
  setStatus(
    pet?.status || initialStatus || "รอยืนยันคิว"
  );
}, [initialStatus, pet?.id, pet?.status]);

const statusOptions = [
  "รอรับเข้า",
  "In Care",
  "พร้อมรับกลับ",
  "รับกลับแล้ว",
];

const isPendingOrRejected =
  status === "รอยืนยันคิว" ||
  status === "ถูกปฏิเสธ" ||
  status === "pending" ||
  status === "rejected";

const shouldShowStatusStepper =
  !isPendingOrRejected &&
  statusOptions.includes(status);

const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "ไม่ได้ระบุ";
  }

  return String(value);
};

const activeStatusIndex = isPendingOrRejected
  ? -1
  : statusOptions.indexOf(status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </TouchableOpacity>

      {/* Page Heading */}
      <View style={styles.heading}>
        <View style={styles.titleRow}>
          <Image
            source={require("../1assets/titlelogo.png")}
            style={styles.titlelogo}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Ticket */}
      <View style={styles.ticket}>
        {/* Left Ticket Strip */}
        <View style={styles.ticketLeft}>
          <View style={styles.leftCircle} />
          <Text style={styles.ticketVertical}>TICKET</Text>
        </View>

        {/* Ticket Main */}
        <View style={styles.ticketMain}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketLogo}>StayTodayForgotTomorrow</Text>
            <View style={styles.petId}>
              <Text style={styles.petIdText}>{displayValue(pet?.id || pet?.bookingId)}</Text>
            </View>
          </View>

          {/* Pet Information */}
          <View style={styles.ticketBody}>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{displayValue(pet?.name)}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ชนิด</Text>
                <Text style={styles.infoValue}>{displayValue(pet?.petType || pet?.type)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>สายพันธุ์</Text>
                <Text style={styles.infoValue}>{displayValue(pet?.breed)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>วันเกิด</Text>
                <Text style={styles.infoValue}>{displayValue(pet?.birth || pet?.age)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>เพศ</Text>
                <Text style={styles.infoValue}>{displayValue(pet?.gender)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>น้ำหนัก</Text>
                <Text style={styles.infoValue}>
                  {pet?.weight ? `${pet.weight} กก.` : "ไม่ได้ระบุ"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>สุขภาพ/การแพ้</Text>
                <Text style={styles.infoValue}>{displayValue(pet?.health || pet?.limitation)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>คำแนะนำดูแล</Text>
                <Text style={styles.infoValue}>{displayValue(pet?.careNotes)}</Text>
              </View>
            </View>

            {/* Pet Image */}
            <View style={styles.petImageContainer}>
              {petImage || pet?.image ? (
                <Image
                  source={petImage || pet?.image}
                  style={styles.petImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>NO IMAGE</Text>
                </View>
              )}

              {/* <Text style={styles.dateText}>
                วันที่เข้าพัก {displayValue(pet?.startDate || pet?.checkIn)} - {displayValue(pet?.endDate || pet?.checkOut)}
              </Text>
              <Text style={styles.dateText}>
                สาขา {displayValue(pet?.branch)}
              </Text> */}
            </View>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.barcodeSide}>
          <View style={styles.barcode}>
            {Array.from({ length: 32 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.barcodeLine,
                  {
                    height: index % 3 === 0 ? 3 : 2,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Status Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>
          สถานะปัจจุบัน: {displayValue(status)}
        </Text>

        {isPendingOrRejected ? (
          <View style={styles.emptyStatusStepper}>
            <View style={styles.emptyStepperTrack}>
              <Text style={styles.emptyStepperText}>
                {status === "ถูกปฏิเสธ" || status === "rejected"
                  ? "คำขอการจองถูกปฏิเสธ — ไม่มีความคืบหน้า"
                  : "รอยืนยันคิวจากเจ้าหน้าที่ — ยังไม่มีความคืบหน้า"}
              </Text>
            </View>
          </View>
        ) : shouldShowStatusStepper ? (
          <View style={styles.statusStepper}>
            <View style={styles.statusProgressLine} />

            {statusOptions.map((item, index) => {
              const active = index === activeStatusIndex;
              const completed = index < activeStatusIndex;

              return (
                <View key={item} style={styles.statusStep}>
                  <View
                    style={[
                      styles.statusCircle,
                      (active || completed) &&
                        styles.statusCircleActive,
                      active && styles.statusCircleCurrent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusCircleText,
                        (active || completed) &&
                          styles.statusCircleTextActive,
                      ]}
                    >
                      {completed ? "✓" : index + 1}
                    </Text>
                  </View>

                  <View style={styles.statusIndicator}>
                    <View
                      style={[
                        styles.statusIndicatorLine,
                        (active || completed) &&
                          styles.statusIndicatorLineActive,
                      ]}
                    />
                    <View
                      style={[
                        styles.statusIndicatorLine,
                        (active || completed) &&
                          styles.statusIndicatorLineActive,
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.statusStepLabel,
                      active && styles.statusStepLabelActive,
                      completed && styles.statusStepLabelCompleted,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyStatusStepper} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerContent: {
    paddingHorizontal: 30,
    paddingBottom: 35,
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
  heading: {
    alignItems: "center",
    marginBottom: 30,
  },
  titleRow: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 20,
  },
  titlelogo: {
    width: 370,
    height: 150,
  },
  ticket: {
    width: 850,
    height: 250,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#0B2B45",
    elevation: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 3, height: 4 },
  },
  ticketLeft: {
    width: 55,
    backgroundColor: "#246AA5",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  leftCircle: {
    width: 26,
    height: 26,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  ticketVertical: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    transform: [{ rotate: "-90deg" }],
    marginBottom: 33,
    textAlign: "center",
  },
  ticketMain: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketLogo: {
    color: "#FFAA00",
    fontSize: 20,
    fontWeight: "900",
  },
  petId: {
    marginTop: 5,
    marginRight: 20,
    backgroundColor: "#9CF0A9",
    width: 250,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: "center",
  },
  petIdText: {
    color: "#12642A",
    fontSize: 11,
  },
  ticketBody: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  petInfo: {
    flex: 1,
    justifyContent: "center",
  },
  petName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 7,
  },
  infoLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    width: 75,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 11,
    flexShrink: 1,
  },
  petImageContainer: {
    width: 205,
    alignItems: "center",
    justifycontent: "center",
    marginTop: 15,
    marginLeft: 10,
  },
  petImage: {
    width: 180,
    height: 120,
    backgroundColor: "#FFFFFF",
  },
  imagePlaceholder: {
    width: 180,
    height: 120,
    backgroundColor: "#203B50",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 12,
  },
  barcodeSide: {
    width: 58,
    backgroundColor: "#246AA5",
    padding: 7,
    justifyContent: "center",
  },
  barcode: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "space-evenly",
    paddingHorizontal: 3,
  },
  barcodeLine: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#246AA5",
  },
  statusBox: {
    width: 460,
    alignSelf: "center",
    marginTop: 55,
    padding: 23,
    borderWidth: 2,
    borderColor: "#CAD2DB",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0B2B45",
    marginBottom: 20,
  },
  emptyStatusStepper: {
    height: 0,
  },
  statusStepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    width: "100%",
  },
  statusProgressLine: {
    position: "absolute",
    top: 13,
    left: "10%",
    right: "10%",
    height: 3,
    backgroundColor: "#246AA5",
  },
  statusStep: {
    flex: 1,
    alignItems: "center",
    zIndex: 1,
  },
  statusCircle: {
    width: 27,
    height: 27,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#246AA5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  statusCircleActive: {
    backgroundColor: "#246AA5",
    borderColor: "#246AA5",
  },
  statusCircleCurrent: {
    borderWidth: 2,
    borderColor: "#246AA5",
    backgroundColor: "#246AA5",
    width: 30,
    height: 30,
    marginTop: -1.5,
  },
  statusCircleText: {
    fontSize: 12,
    color: "#246AA5",
    fontWeight: "600",
  },
  statusCircleTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  statusStepLabel: {
    fontSize: 9,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  statusStepLabelActive: {
    color: "#246AA5",
    fontWeight: "bold",
  },
  statusStepLabelCompleted: {
    color: "#246AA5",
    fontWeight: "600",
  },
  emptyStatusStepper: {
    width: "100%",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStepperTrack: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    alignItems: "center",
    minWidth: 260,
  },
  emptyStepperText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default PetDetails;