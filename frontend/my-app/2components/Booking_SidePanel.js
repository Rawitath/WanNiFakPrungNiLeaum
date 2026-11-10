
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
const PANEL_WIDTH = SCREEN_WIDTH / 3;

export default function StaffSidePanel({ visible, onClose, pet }) {
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

    // ข้อมูลตัวอย่าง สามารถแก้ไขภายหลังได้
    const booking = {
        bookingId: "B001",

        customer: [
            { label: "ชื่อ", value: "คุณสมหญิง" },
            { label: "เบอร์", value: "08X-XXX-XXXX" },
            { label: "อีเมล", value: "example@email.com" },
        ],

        pet: [
            { label: "ชื่อ", value: "เบย" },
            { label: "ชนิด", value: "สุนัข" },
            { label: "สายพันธุ์", value: "โกลเด้น" },
            { label: "น้ำหนัก", value: "2 กิโล" },
            { label: "เพศ", value: "ผู้" },
            { label: "วันเกิด", value: "23/01/2564" },
            { label: "โรคประจำตัว", value: "-" },
            { label: "ข้อจำกัด", value: "ไม่ชอบคนเสียงดัง" },
        ],

        detail: [
            { label: "วันที่เข้าพัก", value: "13/01/2569" },
            { label: "วันที่รับกลับ", value: "14/01/2569" },
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
                                รายละเอียดการจอง
                            </Text>

                            <Pressable
                                onPress={closePanel}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeText}>✕</Text>
                            </Pressable>
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
                            {booking.bookingId}
                        </Text>

                        {/* ข้อมูลลูกค้า */}
                        {renderSection(
                            "ข้อมูลลูกค้า",
                            booking.customer
                        )}

                        {/* ข้อมูลสัตว์ */}
                        {renderSection(
                            "ข้อมูลสัตว์",
                            booking.pet
                        )}

                        {/* รายละเอียด */}
                        {renderSection(
                            "รายละเอียด",
                            booking.detail
                        )}
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
                        {/* ปุ่ม */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => { }}
                            >
                                <Text style={styles.actionButtonText}>
                                    ยืนยัน
                                </Text>
                            </TouchableOpacity>
                        

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => { }}
                            >
                                <Text style={styles.actionButtonText}>
                                    ติดต่อลูกค้า
                                </Text>
                            </TouchableOpacity>
                        </View>

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
        width: "100%",
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginBottom: 0,
    },

    panelBorder2: {
        backgroundColor: "#03314c",
        width: "100%",
        paddingVertical: 15,
        paddingHorizontal: 0,
        marginBottom: 20,
    },

    pawTopLeft2: {
        position: "absolute",
        top: 90,
        left: 300,
        transform: [{ rotate: "30deg" }],
    },

    pawTopLeft3: {
        position: "absolute",
        top: 345,
        left: 350,
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

    closeButton: {
        position: "absolute",
        right: 0,
        top: 0,
        padding: 5,
    },

    closeText: {
        color: "#FFFFFF",
        fontSize: 15,
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
        marginLeft: 57,
    },

    section: {
        marginBottom: 20,
    },

    sectionHeader: {
        backgroundColor: "#9BD4F5",
        alignSelf: "flex-end",
        width: "87%",
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

    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        marginLeft: 40,
        width: "80%",
    },

    actionButton: {
        backgroundColor: "#f8931f",
        width: "30%",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",

    },

    actionButtonText: {
        color: "#fbf7f7",
        fontSize: 15,
        fontWeight: "regular",
    },

    footerLine: {
        height: 3,
        backgroundColor: "#fcaf3b",
        width: "90%",
        marginBottom: 12,
        marginLeft: 30,
    },

    footerText: {
        color: "#fcaf3b",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
    },

});
