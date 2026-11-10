
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

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

export default function HomepageAdmin({ onBack }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [selectedBranch, setSelectedBranch] = useState("ทุกสาขา");
  const [showDropdown, setShowDropdown] = useState(false);

  const branchOptions = ["ทุกสาขา", ...branches.map((b) => b.name)];

  const displayedBranches =
    selectedBranch === "ทุกสาขา"
      ? branches
      : branches.filter((b) => b.name === selectedBranch);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                ยินดีต้อนรับสู่ระบบจัดการเว็บรับฝากสัตว์เลี้ยง
              </Text>
              <Text style={styles.subtitle}>
                ดูภาพรวมสถานะสัตว์เลี้ยงและข้อมูลทุกสาขาได้ที่นี่
              </Text>
            </View>

            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}
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
          </View>

          <View style={styles.headerLine} />

          {/* Decorative paws */}
          <PawPrint style={styles.pawLeft} />
          <PawPrint style={styles.pawRight} />

          {/* Main content */}
          <View
            style={[
              styles.mainContent,
              isMobile && styles.mainContentMobile,
            ]}
          >
            {/* Left: Branch information */}
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
                      {branch.animals.map((animal, animalIndex) => (
                        <Text
                          key={animalIndex}
                          style={styles.animalText}
                        >
                          {animal.type}  {animal.count} ตัว
                        </Text>
                      ))}
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

            {/* Right: Dashboard */}
            <View
              style={[
                styles.rightColumn,
                isMobile && styles.rightColumnMobile,
              ]}
            >
              {/* Animal summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  ชนิดสัตว์เลี้ยง (รวมทุกสาขา)
                </Text>

                <View style={styles.yellowLine} />

                <View style={styles.summaryContent}>
                  <View style={styles.totalNumberContainer}>
                    <Text style={styles.totalNumber}>800 ตัว</Text>
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

              {/* Overall status */}
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
    </View>
  );
}

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
    marginTop: 42,
    position: "relative",
  },

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

  dropdownContainer: {
    position: "relative",
    zIndex: 999,
    elevation: 999,
  },

  dropdownButton: {
    backgroundColor: "#FFBD00",
    paddingHorizontal: 14,
    paddingVertical: 6,
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

    zIndex: 999,
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

  headerLine: {
    height: 1,
    backgroundColor: "#555555",
    marginTop: 2,
    marginBottom: 26,
  },

  mainContent: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },

  mainContentMobile: {
    flexDirection: "column",
  },

  // Branch card
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
    shadowOffset: { width: 0, height: 3 },
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

  // Right column
  rightColumn: {
    flex: 1.05,
    gap: 10,
  },

  rightColumnMobile: {
    flex: 0,
  },

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
    shadowOffset: { width: 0, height: 3 },
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

  // Status card
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
    shadowOffset: { width: 0, height: 3 },
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

  // Paw decorations
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
});
