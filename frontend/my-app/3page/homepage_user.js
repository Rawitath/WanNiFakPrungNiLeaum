
import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";

export default function HomePageUser({
    onBooking,
    pets = [],
}) {
    // แสดงสัตว์เลี้ยงครั้งละไม่เกิน 4 ตัว
    const [currentPetPage, setCurrentPetPage] = useState(0);
    const PETS_PER_PAGE = 4;

    const totalPetPages = Math.ceil(pets.length / PETS_PER_PAGE);

    // ถ้าจำนวนสัตว์เลี้ยงลดลง ให้กลับมาอยู่หน้าที่มีข้อมูล
    React.useEffect(() => {
        if (currentPetPage >= totalPetPages) {
            setCurrentPetPage(Math.max(0, totalPetPages - 1));
        }
    }, [currentPetPage, totalPetPages]);

    const previousPetPage = () => {
        setCurrentPetPage((prev) => Math.max(0, prev - 1));
    };

    const nextPetPage = () => {
        setCurrentPetPage((prev) =>
            Math.min(totalPetPages - 1, prev + 1)
        );
    };

    const displayedPets = pets.slice(
        currentPetPage * PETS_PER_PAGE,
        currentPetPage * PETS_PER_PAGE + PETS_PER_PAGE
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* ======================================
                ส่วนที่ 1: ด้านบนของ Guest
                คงโครงสร้างเดิม เปลี่ยนเฉพาะ Navbar
            ====================================== */}
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

                {/* Logo และชื่อระบบ: เหมือน Guest */}
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


            {/* ======================================
                ส่วนที่ 2: ด้านล่างของ Guest
                เก็บ CTA และ Copyright ไว้ทั้งหมด
            ====================================== */}
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

                {/* ข้อความตรงกลาง: เก็บของ Guest ไว้ */}
                <View style={styles.centerContent}>

                    <Text style={styles.startTitle}>
                        พร้อมจัดการสัตว์เลี้ยงของคุณแล้วหรือยัง?
                    </Text>

                    {/* ปุ่มเริ่มงาน */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={onBooking}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.startButtonText}>
                            เริ่มใช้งาน
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>


            {/* ======================================
                ส่วนที่ 3: ส่วนบนของพื้นที่ User
                แสดง titlelogo.png ทางซ้าย
            ====================================== */}
            <View style={styles.userTopSection}>

                <Image
                    source={require("../1assets/titlelogo.png")}
                    style={styles.titleLogo}
                    resizeMode="contain"
                />

            </View>


            {/* ======================================
                ส่วนที่ 4: ส่วนล่างของพื้นที่ User
                สัตว์ที่กำลังเข้าพัก
            ====================================== */}
            <View style={styles.petStaySection}>

                {/* เส้นแบ่งสองชั้น + โลโก้ */}
                <View style={styles.curveContainer}>

                    <svg
                        width="100%"
                        height="100"
                        viewBox="0 -25 1000 150"
                        preserveAspectRatio="none"
                    >
                        {/* พื้นที่สีน้ำเงินที่มีขอบบนเป็นเส้นโค้ง */}
                        <path
                            d="
                                M 0 75
                                H 680
                                C 740 75 730 -15 800 -15
                                C 870 -15 860 75 920 75
                                H 1000
                                V 110
                                H 0
                                Z
                            "
                            fill="#103357"
                        />

                        {/* เส้นขอบสีน้ำเงินเข้ม */}
                        <path
                            d="
                                M 0 75
                                H 680
                                C 740 75 730 -15 800 -15
                                C 870 -15 860 75 920 75
                                H 1000
                            "
                            stroke="#071D35"
                            strokeWidth="20"
                            fill="none"
                        />

                        {/* เส้นขอบสีน้ำเงินอ่อน */}
                        <path
                            d="
                                M 0 85
                                H 680
                                C 740 85 740 -5 800 -5
                                C 860 -5 860 85 920 85
                                H 1000
                            "
                            stroke="#4D86A8"
                            strokeWidth="15"
                            fill="none"
                        />
                    </svg>

                    {/* โลโก้สัตว์ตรงบริเวณยอดโค้ง */}
                    <Image
                        source={require("../1assets/piclogo.png")}
                        style={styles.curveLogo}
                        resizeMode="contain"
                    />

                </View>

                {/* พื้นที่เนื้อหาด้านใน */}
                <View style={styles.contentSection}>
                                        {/* อุ้งเท้ามุมขวาล่าง */}
                <View style={styles.pawTopRight5}>
                    <svg
                        width="50"
                        height="50"
                        viewBox="-10 -10 120 120"
                        fill="#3a5f81"
                        opacity="1"
                    >
                        <ellipse cx="50" cy="65" rx="35" ry="30" />
                        <ellipse cx="10" cy="25" rx="15" ry="15" />
                        <ellipse cx="50" cy="10" rx="15" ry="15" />
                        <ellipse cx="95" cy="22" rx="15" ry="15" />
                    </svg>
                </View>

                    <Text style={styles.sectionTitle}>
                        สัตว์ที่กำลังเข้าพัก
                    </Text>

                    {/* คำอธิบาย + ปุ่มต่อไป */}
                    <View style={styles.descriptionRow}>

                        <Text style={styles.description}>
                            ติดตามข้อมูลและสถานะของสัตว์เลี้ยงที่อยู่ในการดูแลทั้งหมดของเรา
                        </Text>

                    </View>

                    {/* การ์ดสัตว์เลี้ยง */}
                    <View style={styles.petSection}>

                        {displayedPets.length === 0 ? (
                            <Text style={styles.emptyPetText}>
                                ยังไม่มีข้อมูลสัตว์เลี้ยง
                            </Text>
                        ) : displayedPets.map((pet) => (
                            <View
                                key={pet.id}
                                style={styles.petCard}
                            >
                                {/* รูปสัตว์แบบวงกลม */}
                                <Image
                                    source={pet.image}
                                    style={styles.petImage}
                                    resizeMode="cover"
                                />

                                {/* ชื่อสัตว์ */}
                                <Text style={styles.petName}>
                                    {pet.name}
                                </Text>

                                {/* สถานะ */}
                                <View style={styles.statusBox}>
                                    <Text style={styles.statusText}>
                                        {pet.status}
                                    </Text>
                                </View>

                            </View>
                        ))}

                    </View>
                        {pets.length > PETS_PER_PAGE && (
                            <View style={styles.petPagination}>
                                <TouchableOpacity
                                    onPress={previousPetPage}
                                    disabled={currentPetPage === 0}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.arrowButton,
                                        currentPetPage === 0 && styles.arrowButtonDisabled,
                                    ]}
                                >
                                    <Text style={styles.arrowText}>‹</Text>
                                </TouchableOpacity>

                                <Text style={styles.pageText}>
                                    {currentPetPage + 1} / {totalPetPages}
                                </Text>

                                <TouchableOpacity
                                    onPress={nextPetPage}
                                    disabled={currentPetPage >= totalPetPages - 1}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.arrowButton,
                                        currentPetPage >= totalPetPages - 1 && styles.arrowButtonDisabled,
                                    ]}
                                >
                                    <Text style={styles.arrowText}>›</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                </View>
                
                {/* อุ้งเท้ามุมขวาล่าง */}
                <View style={styles.pawTopRight6}>
                    <svg
                        width="50"
                        height="50"
                        viewBox="-10 -10 120 120"
                        fill="#3a5f81"
                        opacity="1"
                    >
                        <ellipse cx="50" cy="65" rx="35" ry="30" />
                        <ellipse cx="10" cy="25" rx="15" ry="15" />
                        <ellipse cx="50" cy="10" rx="15" ry="15" />
                        <ellipse cx="95" cy="22" rx="15" ry="15" />
                    </svg>
                </View>
                {/* Copyright */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2026 StayTodayForgotTomorrow. All rights reserved.
                    </Text>
                </View>
            </View>

        </ScrollView>
    );
}


const styles = StyleSheet.create({

    // ======================================
    // Style เดิมของ homepage_guest.js
    // ======================================

    container: {
        flex: 1,
        backgroundColor: "#FFF0C9",
    },

    // ส่วนบน Guest
    topSection: {
        flex: 1,
        paddingTop: 30,
        minHeight: "25%",
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

    // Logo และชื่อระบบ Guest
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

    welcomeSection: {
        alignItems: "center",
        paddingBottom: 15,
    },


    // ส่วนล่าง Guest
    bottomSection: {
        paddingTop: 15,
        minHeight: 350,
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

    pawTopRight3: {
        position: "absolute",
        top: 40,
        right: 430,
        transform: [{ rotate: "10deg" }],
    },

    pawTopRight6: {
        position: "absolute",
        top: 50,
        right: 460,
        transform: [{ rotate: "-20deg" }],
    },
    
    pawTopRight5: {
        position: "absolute",
        top: 170,
        left: 60,
        transform: [{ rotate: "30deg" }],
    },

    centerContent: {
        minHeight: 350,
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

    startButton: {
        backgroundColor: "#F28C28",
        paddingVertical: 14,
        paddingHorizontal: 65,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    startButtonText: {
        color: "#fefefe",
        fontSize: 18,
        fontWeight: "regular",
        fontFamily: "Itim",
    },

    footer: {
        position: "absolute",
        bottom: 12,
        right: 18,
    },

    footerText: {
        color: "#8b8a8a",
        fontSize: 12,
    },


    // ======================================
    // Style ใหม่ของพื้นที่ User
    // ======================================

    // ส่วนบนที่มี titlelogo.png
    userTopSection: {
        minHeight: 250,
        backgroundColor: "#FFF0C9",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingHorizontal: 50,
        paddingVertical: 20,
    },

    titleLogo: {
        width: 600,
        height: 400,
        marginLeft: 50,
    },

    // ส่วนล่างสีน้ำเงิน
    petStaySection: {
        minHeight: 300,
        backgroundColor: "#103357",
        position: "relative",
        paddingBottom: 70,
    },

    // เส้นโค้งสองชั้น
    curveContainer: {
        position: "relative",
        width: "100%",
        height: 90,
        marginTop: -70,
    },

    // โลโก้สัตว์บนยอดโค้ง
    curveLogo: {
        position: "absolute",
        width: 400,
        height: 500,
        top: -300,
        left: "65%",
    },

    // เนื้อหาสัตว์เลี้ยง
    contentSection: {
        paddingHorizontal: 55,
        paddingTop: 30,
        marginLeft: 20,
    },

    sectionTitle: {
        fontSize: 30,
        color: "#f4f2ee",
        fontFamily: "Itim",
        fontWeight: "regular",
    },

    descriptionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 5,
        gap: 18,
    },

    description: {
        fontSize: 18,
        color: "#FFFFFF",
        fontFamily: "Itim",
        flex: 1,
    },

    // รายการสัตว์เลี้ยง: แสดงได้ไม่เกิน 4 การ์ดต่อหน้า
    petSection: {
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 35,
        marginTop: 25,
        marginLeft: 0,
    },

    petCard: {
        alignItems: "center",
        width: 140,
    },

    emptyPetText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "Itim",
        marginVertical: 30,
    },

    petImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#FFB012",
    },

    petName: {
        fontSize: 20,
        color: "#FFFFFF",
        fontFamily: "Itim",
        marginTop: 10,
    },

    statusBox: {
        backgroundColor: "#D9EAD3",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 8,
    },

    statusText: {
        color: "#347343",
        fontSize: 18,
        fontFamily: "Itim",
    },

    petPagination: {
        marginTop: 40,
        flexDirection: "row",
        alignSelf: "center",
        gap: 12,
    },

    arrowButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F28C28",
        alignItems: "center",
        justifyContent: "center",
    },

    arrowButtonDisabled: {
        opacity: 0.35,
    },

    arrowText: {
        color: "#FFFFFF",
        fontSize: 30,
        lineHeight: 34,
        fontWeight: "bold",
    },

    pageText: {
        paddingTop: 8,
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "Itim",
    },

});
