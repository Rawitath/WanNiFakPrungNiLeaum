import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Animated,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = SCREEN_WIDTH / 4;

export default function UserSidePanel({ visible, onClose, pet, information }) {
    const slideAnim = useRef(
        new Animated.Value(PANEL_WIDTH)
    ).current;

    const [modalVisible, setModalVisible] = useState(visible);

    useEffect(() => {
        if (visible) {
            setModalVisible(true);

            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else if (modalVisible) {
            Animated.timing(slideAnim, {
                toValue: PANEL_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    setModalVisible(false);
                }
            });
        }
    }, [visible]);

    const closePanel = () => {
        onClose();
    };

    const target = information || pet;
    const booking = {
        bookingId: target?.bookingId || target?.id || "0001",

        customer: [
            { label: "ชื่อ", value: target?.customerName || target?.owner?.name || (typeof target?.owner === "string" ? target.owner : "คุณลูกค้า") },
            { label: "เบอร์", value: target?.customerPhone || target?.owner?.phone || target?.phone || "08X-XXX-XXXX" },
            { label: "อีเมล", value: target?.customerEmail || target?.owner?.email || target?.email || "example@email.com" },
        ],

        pets: [
            {
                petId: target?.petId || target?.id || "P001",
                petName: target?.petName || target?.name || "สัตว์เลี้ยง",
                type: target?.petType || target?.type || "สุนัข",
                breed: target?.petBreed || target?.breed || "-",
            },
        ],
    };

    // Component สำหรับแสดงหัวข้อและข้อมูล
    const renderSection = (title, data) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                    {title}
                </Text>
            </View>

            <View style={styles.infoContainer}>
                {data.map((item, index) => (
                    <View style={styles.infoRow} key={index}>
                        <Text style={styles.infoLabel}>
                            {item.label}
                        </Text>

                        <Text style={styles.infoValue}>
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            onRequestClose={closePanel}
        >
            <View style={styles.overlay}>

                {/* พื้นที่ด้านนอก Panel */}
                <Pressable
                    style={styles.backdrop}
                    onPress={closePanel}
                />

                {/* Side Panel */}
                <Animated.View
                    style={[
                        styles.panel,
                        {
                            transform: [
                                { translateX: slideAnim }
                            ],
                        },
                    ]}
                >
                    <View style={styles.panelBorder2}>
                        {/* หัวข้อ */}
                        <View style={styles.topHeader}>
                            <Text style={styles.title}>
                                ข้อมูลลูกค้า
                            </Text>
                        </View>

                        {/* กรอบสีน้ำเงินอ่อน */}
                        <View style={styles.panelBorder}>
                        </View>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >

                        {/* รหัสการจอง */}
                        <Text style={styles.bookingId}>
                            รหัสลูกค้า: {booking.bookingId}
                        </Text>

                        {/* ข้อมูลลูกค้า */}
                        {renderSection(
                            "ข้อมูลลูกค้า",
                            booking.customer
                        )}

                        {/* รายละเอียด */}
                        {/* ตารางข้อมูลสัตว์เลี้ยง */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>ข้อมูลสัตว์เลี้ยง</Text>
                            </View>

                            <View style={styles.petTable}>
                                {/* หัวตาราง */}
                                <View style={styles.petTableRow}>
                                    <Text style={styles.petTableHeader}>PetID</Text>
                                    <Text style={styles.petTableHeader}>Petname</Text>
                                    <Text style={styles.petTableHeader}>Type</Text>
                                    <Text style={styles.petTableHeader}>Breed</Text>
                                </View>

                            {/* เส้นสีเหลือง */}
                            <View style={styles.footerLine2} />

                                {/* ข้อมูลในตาราง */}
                                {booking.pets.map((pet) => (
                                    <View key={pet.petId} style={styles.petTableRow}>
                                        <Text style={styles.petTableCell}>{pet.petId}</Text>
                                        <Text style={styles.petTableCell}>{pet.petName}</Text>
                                        <Text style={styles.petTableCell}>{pet.type}</Text>
                                        <Text style={styles.petTableCell}>{pet.breed}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* อุ้งเท้ามุมซ้ายล่าง */}
                        <View style={styles.pawTopLeft3}>
                            <svg
                                width="50"
                                height="50"
                                viewBox="-10 -10 120 120"
                                fill="#345172"
                                opacity="1"
                            >
                                <ellipse cx="50" cy="65" rx="35" ry="30" />
                                <ellipse cx="10" cy="25" rx="15" ry="15" />
                                <ellipse cx="50" cy="10" rx="15" ry="15" />
                                <ellipse cx="95" cy="22" rx="15" ry="15" />
                            </svg>
                        </View>

                    </ScrollView>

                    {/* อุ้งเท้ามุมซ้ายล่าง */}
                    <View style={styles.pawTopLeft2}>
                        <svg
                            width="50"
                            height="50"
                            viewBox="-10 -10 120 120"
                            fill="#345172"
                            opacity="1"
                        >
                            <ellipse cx="50" cy="65" rx="35" ry="30" />
                            <ellipse cx="10" cy="25" rx="15" ry="15" />
                            <ellipse cx="50" cy="10" rx="15" ry="15" />
                            <ellipse cx="95" cy="22" rx="15" ry="15" />
                        </svg>
                    </View>

                    {/* ส่วนล่างของ Panel */}
                    <View style={styles.bottomContainer}>

                        {/* เส้นสีเหลือง */}
                        <View style={styles.footerLine} />

                        {/* ชื่อระบบ */}
                        <Text style={styles.footerText}>
                            StayTodayForgotTomorrow
                        </Text>

                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
    },

    panel: {
        width: PANEL_WIDTH,
        height: "100%",
        backgroundColor: "#0d2f52",
        padding: 5,
        elevation: 10,
    },

    panelBorder: {
        backgroundColor: "#1a6692",
        width: 500,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginBottom: 0,
    },

    panelBorder2: {
        backgroundColor: "#03314c",
        width: 500,
        paddingVertical: 15,
        paddingHorizontal: 0,
        marginBottom: 20,
    },

    pawTopLeft2: {
        position: "absolute",
        top: 230,
        left: 300,
        transform: [{ rotate: "30deg" }],
    },

    pawTopLeft3: {
        position: "absolute",
        top: 445,
        left: 50,
        transform: [{ rotate: "300deg" }],
    },

    topHeader: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    title: {
        color: "#f6c236",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
    },

    scrollContent: {
        paddingBottom: 5,
    },

    bookingId: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 26,
        marginTop: 5,
        marginLeft: 40,
    },

    section: {
        marginBottom: 20,
    },

    sectionHeader: {
        backgroundColor: "#9BD4F5",
        alignSelf: "flex-end",
        width: "92%",
        marginTop: 10,
        paddingVertical: 9,
        paddingHorizontal: 15,
        marginBottom: 12,
    },

    sectionHeaderText: {
        color: "#123B65",
        fontSize: 13,
        fontWeight: "bold",
    },

    infoContainer: {
        paddingHorizontal: 60,
        gap: 5,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    infoLabel: {
        color: "#FFFFFF",
        fontSize: 13,
        width: 100,
        fontWeight: "Regular",
    },

    infoValue: {
        color: "#FFFFFF",
        fontSize: 12,
        flex: 1,
        fontWeight: "Regular",
    },

    bottomContainer: {
        paddingTop: 10,
        paddingBottom: 10,
    },

    footerLine: {
        height: 3,
        backgroundColor: "#fcaf3b",
        width: "90%",
        marginBottom: 12,
        marginLeft: 30,
    },
    
    footerLine2: {
        height: 3,
        backgroundColor: "#faf8f5",
        width: "100%",
        marginBottom: 12,
        marginLeft: 10,
    },

    footerText: {
        color: "#fcaf3b",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
    },
    
    petTable: {
        width: "80%",
        borderWidth: "none",
        borderColor: "none",
        marginTop: 10,
        marginLeft: 60,
    },

    petTableRow: {
        flexDirection: "row",
        borderBottomWidth: "none",
        borderBottomColor: "none",
    },

    petTableHeader: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        paddingVertical: 10,
        borderRightWidth: "none",
        borderRightColor: "none",
    },

    petTableCell: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 12,
        textAlign: "center",
        paddingVertical: 12,
        borderRightWidth: "none",
        borderRightColor: "none",
    },
});
