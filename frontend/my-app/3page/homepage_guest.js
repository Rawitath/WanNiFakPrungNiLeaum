
import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import LogoutNavbar from "../2components/logoutnavbar";

export default function HomePageGuest({ onLogin }) {
    return (
        <View style={styles.container}>

            {/* ส่วนบน: พื้นหลังสีน้ำเงิน */}
            <View style={styles.topSection}>

            {/* อุ้งเท้ามุมซ้ายบน */}
                            <View style={styles.pawTopLeft}>
                                <svg
                                    width="50"
                                    height="50"
                                    viewBox="-10 -10 120 120"
                                    fill="#2f5f80"
                                    opacity="1"
                                >
                                    <ellipse cx="50" cy="65" rx="35" ry="30" />
                                    <ellipse cx="10" cy="25" rx="15" ry="15" />
                                    <ellipse cx="50" cy="10" rx="15" ry="15" />
                                    <ellipse cx="95" cy="22" rx="15" ry="15" />
                                </svg>
                            </View>
            
                            {/* อุ้งเท้ามุมขวาบน */}
                            <View style={styles.pawTopRight}>
                                <svg
                                    width="50"
                                    height="50"
                                    viewBox="-10 -10 120 120"
                                    fill="#2f5f80"
                                    opacity="1"
                                >
                                    <ellipse cx="50" cy="65" rx="35" ry="30" />
                                    <ellipse cx="10" cy="25" rx="15" ry="15" />
                                    <ellipse cx="50" cy="10" rx="15" ry="15" />
                                    <ellipse cx="95" cy="22" rx="15" ry="15" />
                                </svg>
                            </View>

                                                        {/* อุ้งเท้ามุมขวาบน */}
                            <View style={styles.pawTopRight1}>
                                <svg
                                    width="50"
                                    height="50"
                                    viewBox="-10 -10 120 120"
                                    fill="#2f5f80"
                                    opacity="1"
                                >
                                    <ellipse cx="50" cy="65" rx="35" ry="30" />
                                    <ellipse cx="10" cy="25" rx="15" ry="15" />
                                    <ellipse cx="50" cy="10" rx="15" ry="15" />
                                    <ellipse cx="95" cy="22" rx="15" ry="15" />
                                </svg>
                            </View>

                {/* Navbar */}
                <LogoutNavbar onLogin={onLogin} />

                {/* Logo และชื่อระบบ */}
                <View style={styles.brandSection}>
                    <Image
                        source={require("../1assets/piclogo.png")}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />

                    <View style={styles.textContainer}>
                        <Text style={styles.brandText}>
                            StayToday{"\n"}ForgotTomorrow
                        </Text>

                        <Text style={styles.welcomeText}>
                            วันนี้ฝากพรุ่งนี้ลืม เว็บไซต์ของเรา เป็นเว็บไซต์รับฝากสัตว์เลี้ยงที่เกิดจากความเข้าใจว่าเวลาต้องเดินทางหรือไม่อยู่บ้าน{"\n"}
                            สิ่งที่ทำให้กังวลที่สุดคือใครจะดูแลน้อง เราจึงออกแบบที่พักที่ให้ทั้งความสบายและความอุ่นใจ ทั้งห้องพักสะอาด{"\n"}
                            การดูแลโดยผู้ที่มีประสบการณ์และระบบจองออนไลน์ที่ช่วยให้คุณติดตามสถานะของสัตว์เลี้ยงได้ทุกวัน
                        </Text>
                    </View>
                </View>
            </View>


            {/* ส่วนล่าง: พื้นหลังสีเหลืองครีม */}
            <View style={styles.bottomSection}>
                            {/* อุ้งเท้ามุมซ้ายล่าง */}
                            <View style={styles.pawTopLeft2}>
                                <svg
                                    width="50"
                                    height="50"
                                    viewBox="-10 -10 120 120"
                                    fill="#fcb03c"
                                    opacity="1"
                                >
                                    <ellipse cx="50" cy="65" rx="35" ry="30" />
                                    <ellipse cx="10" cy="25" rx="15" ry="15" />
                                    <ellipse cx="50" cy="10" rx="15" ry="15" />
                                    <ellipse cx="95" cy="22" rx="15" ry="15" />
                                </svg>
                            </View>
            
                            {/* อุ้งเท้ามุมขวาล่าง */}
                            <View style={styles.pawTopRight2}>
                                <svg
                                    width="50"
                                    height="50"
                                    viewBox="-10 -10 120 120"
                                    fill="#fcb03c"
                                    opacity="1"
                                >
                                    <ellipse cx="50" cy="65" rx="35" ry="30" />
                                    <ellipse cx="10" cy="25" rx="15" ry="15" />
                                    <ellipse cx="50" cy="10" rx="15" ry="15" />
                                    <ellipse cx="95" cy="22" rx="15" ry="15" />
                                </svg>
                            </View>

                             {/* อุ้งเท้ามุมขวาล่าง */}
                            <View style={styles.pawTopRight3}>
                                <svg
                                    width="50"
                                    height="50"
                                    viewBox="-10 -10 120 120"
                                    fill="#fcb03c"
                                    opacity="1"
                                >
                                    <ellipse cx="50" cy="65" rx="35" ry="30" />
                                    <ellipse cx="10" cy="25" rx="15" ry="15" />
                                    <ellipse cx="50" cy="10" rx="15" ry="15" />
                                    <ellipse cx="95" cy="22" rx="15" ry="15" />
                                </svg>
                            </View>
                {/* ข้อความตรงกลาง */}
                <View style={styles.centerContent}>

                    <Text style={styles.startTitle}>
                        พร้อมจัดการสัตว์เลี้ยงของคุณแล้วหรือยัง?
                    </Text>

                    {/* ปุ่มเริ่มงาน */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={onLogin}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.startButtonText}>
                            เริ่มใช้งาน
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* Copyright */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2026 StayTodayForgotTomorrow. All rights reserved.
                    </Text>
                </View>

            </View>

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF0C9",
    },

    // ส่วนบน
    topSection: {
        flex: 1,
        backgroundColor: "#103357",
    },

    pawTopLeft: {
        position: "absolute",
        top: 100,
        left: 50,
        transform: [{ rotate: "50deg" }],
    },

    pawTopRight: {
        position: "absolute",
        top: 130,
        right: 600,
        transform: [{ rotate: "50deg" }],
    },

    pawTopRight1: {
        position: "absolute",
        top: 240,
        right: 130,
        transform: [{ rotate: "-10deg" }],
    },


    // Logo และชื่อระบบ
    brandSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 200,
        gap: 20,
    },

    textContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
    },

    brandText: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#ffb012",
        // เงาสีน้ำเงิน
        textShadowColor: "#153453",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
    },

    welcomeText: {
        fontSize: 16,
        color: "#FFFFFF",
        marginTop: 10,
        fontWeight: "regular",
        fontFamily: "Itim",
    },

    logoImage: {
        width: 300,
        height: 350,
        marginLeft: -50,
    },

    brandTitle: {
        color: "#FFAA00",
        fontSize: 45,
        fontWeight: "bold",
        fontFamily: "Itim",
    },

    // ข้อความยินดีต้อนรับ
    welcomeSection: {
        alignItems: "center",
        paddingBottom: 15,
    },


    // ส่วนล่าง
    bottomSection: {
        flex: 1,
        backgroundColor: "#FFF0C9",
        position: "relative",
    },

    pawTopLeft2: {
        position: "absolute",
        top: 270,
        left: 150,
        transform: [{ rotate: "300deg" }],
    },

    pawTopRight2: {
        position: "absolute",
        top: 240,
        right: 130,
        transform: [{ rotate: "70deg" }],
    },

    pawTopRight3: {
        position: "absolute",
        top: 10,
        right: 530,
        transform: [{ rotate: "10deg" }],
    },

    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 25,
    },

    startTitle: {
        fontSize: 25,
        fontWeight: "regular",
        color: "#333333",
        fontFamily: "Itim",
    },

    // ปุ่มเริ่มงาน
    startButton: {
        backgroundColor: "#F28C28",
        paddingVertical: 14,
        paddingHorizontal: 65,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    startButtonText: {
        color: "#f7dfbf",
        fontSize: 18,
        fontWeight: "regular",
        fontFamily: "Itim",
    },

    // Copyright มุมขวาล่าง
    footer: {
        position: "absolute",
        bottom: 12,
        right: 18,
    },

    footerText: {
        color: "#555555",
        fontSize: 12,
    },

});
