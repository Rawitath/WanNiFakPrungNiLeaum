import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";

export default function ForgotPassword({
    onBack,
    onSubmit,
}) {
    const [email, setEmail] = useState("");

    return (
        <View style={styles.container}>

            {/* ฝั่งซ้าย: Logo และชื่อเว็บไซต์ */}
            <View style={styles.leftSide}>
                {/* อุ้งเท้ามุมซ้ายบน */}
                <View style={styles.pawTopLeft}>
                    <svg
                        width="50"
                        height="50"
                        viewBox="-10 -10 120 120"
                        fill="#83a9c4"
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
                        fill="#83a9c4"
                        opacity="1"
                    >
                        <ellipse cx="50" cy="65" rx="35" ry="30" />
                        <ellipse cx="10" cy="25" rx="15" ry="15" />
                        <ellipse cx="50" cy="10" rx="15" ry="15" />
                        <ellipse cx="95" cy="22" rx="15" ry="15" />
                    </svg>
                </View>

                {/* อุ้งเท้ามุมซ้ายล่าง */}
                <View style={styles.pawBottomLeft}>
                    <svg
                        width="50"
                        height="50"
                        viewBox="-10 -10 120 120"
                        fill="#83a9c4"
                        opacity="1"
                    >
                        <ellipse cx="50" cy="65" rx="35" ry="30" />
                        <ellipse cx="10" cy="25" rx="15" ry="15" />
                        <ellipse cx="50" cy="10" rx="15" ry="15" />
                        <ellipse cx="95" cy="22" rx="15" ry="15" />
                    </svg>
                </View>
                <View style={styles.brandContainer}>
                    <Image
                        source={require("../1assets/piclogo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <Text style={styles.webName}>
                        StayTodayForgotTomorrow
                    </Text>
                </View>
            </View>

            {/* ฝั่งขวา: Forgot Password Form */}
            <ScrollView
                style={styles.rightSide}
                contentContainerStyle={styles.formContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* ปุ่มย้อนกลับ */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Text style={styles.backText}>ย้อนกลับ</Text>
                </TouchableOpacity>

                {/* Logo */}
                <Image
                    source={require("../1assets/resetpassword_logo.png")}
                    style={styles.logo3}
                    resizeMode="contain"
                />

                <Text style={styles.description}>
                    Please enter your registered email to reset your password
                </Text>

                {/* Gmail */}
                <Text style={styles.label}>Gmail</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                // placeholder="กรอก Gmail ของคุณ"
                />

                {/* ปุ่มส่งคำขอ */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => {
                        if (!email.trim()) {
                            alert("กรุณากรอกอีเมลจ้าบักหล่า");
                            return;
                        }

                        onSubmit?.(email.trim());
                    }}
                >
                    <Text style={styles.submitButtonText}>
                        ส่งรหัสไปยังอีเมล
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
    },

    // ฝั่งซ้าย
    leftSide: {
        flex: 1,
        backgroundColor: "#123B65",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    pawTopLeft: {
        position: "absolute",
        top: 100,
        left: 50,
        transform: [{ rotate: "50deg" }],
    },

    pawTopRight: {
        position: "absolute",
        top: 240,
        right: 130,
        transform: [{ rotate: "-20deg" }],
    },

    pawBottomLeft: {
        position: "absolute",
        bottom: 100,
        left: 150,
        transform: [{ rotate: "20deg" }],
    },

    brandContainer: {
        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        width: 300,
        height: 300,
        marginBottom: -20,
    },

    
    logo3: {
        width: 330,
        height: 250,
        alignSelf: "center",
        marginBottom: -60,
    },

    webName: {
        color: "#e0a020",
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
    },

    // ฝั่งขวา
    rightSide: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    formContainer: {
        flexGrow: 1,
        justifyContent: "flex-start",
        paddingTop: 15,
        paddingBottom: 20,
    },

    backButton: {
        alignSelf: "flex-end",
        marginBottom: 15,
        marginRight: 30,
        backgroundColor: "#105a8f",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },

    backText: {
        color: "#f7f9fb",
        fontSize: 12,
        fontWeight: "bold",
    },

    description: {
        color: "#757373",
        fontSize: 16,
        textAlign: "center",
        width: "75%",
        alignSelf: "center",
        marginBottom: 50,
        fontWeight: "bold",
    },

    label: {
        color: "#222222",
        fontSize: 16,
        marginBottom: 20,
        width: "60%",
        alignSelf: "center",
        fontWeight: "bold",
    },

    input: {
        height: 50,
        width: "60%",
        alignSelf: "center",
        borderWidth: 2,
        borderColor: "#085779",
        borderRadius: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#222222",
        marginBottom: 40,
        backgroundColor: "#FFFFFF",
    },

    submitButton: {
        height: 50,
        backgroundColor: "#ebb31a",
        width: "60%",
        borderRadius: 1,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },

    submitButtonText: {
        color: "#242323",
        fontSize: 15,
        fontWeight: "bold",
    },
});