import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";

export default function UserProfile({
  visible = false,
  onClose,
  name = "",
  phone = "",
  email = "",
}) {
  // ใช้ชื่อ User เป็น Title
  const title = name?.trim() || "ขุนศรีหมีตัวใหญ่";

  const barcodeLines = Array.from({ length: 32 }, (_, index) => ({
    height: index % 4 === 0 ? 3 : 2,
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* พื้นหลัง กดแล้วปิด Popup */}
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        {/* กล่อง Popup กดแล้วไม่ปิด */}
        <Pressable
          style={styles.popup}
          onPress={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.userTitle}>
                {title}
              </Text>

              <Text style={styles.headerPaw}>
                🐾
              </Text>
            </View>

            <Text style={styles.brand}>
              StayTodayForgotTomorrow
            </Text>
          </View>

          {/* Gold Line */}
          <View style={styles.goldLine} />

          {/* Content */}
          <View style={styles.content}>
            {/* Pet Image */}
            <View style={styles.imageSection}>
              <Image
                source={require("../1assets/piclogo.png")}
                style={styles.petImage}
                resizeMode="cover"
              />
            </View>

            {/* Profile Information */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  ชื่อ
                </Text>

                <Text style={styles.infoValue}>
                  {name || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  เบอร์
                </Text>

                <Text style={styles.infoValue}>
                  {phone || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  อีเมล
                </Text>

                <Text style={styles.infoValue}>
                  {email || "-"}
                </Text>
              </View>
            </View>

            {/* Barcode */}
            <View style={styles.barcode}>
              {barcodeLines.map((line, index) => (
                <View
                  key={index}
                  style={{
                    height: line.height,
                    width: "100%",
                    backgroundColor: "#DCE2E8",
                    marginBottom: 2.5,
                  }}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  popup: {
    width: "100%",
    maxWidth: 544,
    minHeight: 308,
    backgroundColor: "#0C2B43",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  userTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#E8EAF0",
  },

  headerPaw: {
    fontSize: 30,
    opacity: 0.12,
    marginLeft: 10,
  },

  brand: {
    color: "#F5A000",
    fontSize: 16,
    fontWeight: "bold",
  },

  goldLine: {
    height: 17,
    backgroundColor: "#E7A000",
  },

  content: {
    flex: 1,
    minHeight: 175,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 40,
  },

  imageSection: {
    paddingRight: 40,
    width: "43%",
    alignItems: "center",
    justifyContent: "center",
  },

  petImage: {
    width: 200,
    height: 150,
  },

  infoSection: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoLabel: {
    width: 65,
    color: "#E5E9EF",
    fontSize: 16,
    fontWeight: "bold",
  },

  infoValue: {
    flex: 1,
    color: "#E5E9EF",
    fontSize: 16,
    fontWeight: "bold",
  },

  barcode: {
    width: 44,
    height: 164,
    backgroundColor: "#0C2B43",
    marginLeft: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
});