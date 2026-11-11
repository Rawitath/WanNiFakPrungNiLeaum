
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

export default function Register({
    onBack,
    onRegister,
    onLogin,
}) {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

            {/* ฝั่งขวา: Login Form */}
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

                {/* หัวข้อ Register */}
                <Image
                    source={require("../1assets/register_logo.png")}
                    style={styles.logo2}
                    resizeMode="contain"
                />

                {/* ชื่อบัญชี */}
                <Text style={styles.label1}>ชื่อ</Text>
                <TextInput
                    style={styles.input1}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                {/* แถวที่ 1: Gmail และเบอร์โทร */}
                    <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>อีเมล</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                    </View>

                    {/* เบอร์โทร*/}
                    <Text style={styles.label1}>เบอร์โทร</Text>
                    <TextInput
                        style={styles.input1}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    {/* แถวที่ 2: รหัสผ่าน และยืนยันรหัสผ่าน */}
                    <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>รหัสผ่าน</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>


                {/* ปุ่มลงทะเบียน */}
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => onRegister?.(
                        username,
                        email,
                        phone,
                        password,
                        confirmPassword
                    )}
                >
                    <Text style={styles.registerButtonText}>
                        ลงทะเบียน
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



    // ฝั่งซ้าย
    leftSide: {
        flex: 1,
        backgroundColor: "#123B65",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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

    logo2: {
        width: 250,
        height: 250,
        alignSelf: "center",
        marginBottom: -50,
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

    title: {
        color: "#000000",
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },

    label1: {
        color: "#222222",
        fontSize: 16,
        marginBottom: 10,
        width: "65%",
        alignSelf: "center",
    },

    input1: {
        height: 50,
        width: "65%",
        alignSelf: "center",
        borderWidth: 2,
        borderColor: "#085779",
        borderRadius: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#222222",
        marginBottom: 20,
        backgroundColor: "#FFFFFF",
    },

    label: {
        color: "#222222",
        fontSize: 16,
        marginBottom: 10,
        width: "100%",
        alignSelf: "center",
    },

    input: {
        height: 50,
        width: "100%",
        alignSelf: "center",
        borderWidth: 2,
        borderColor: "#085779",
        borderRadius: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#222222",
        marginBottom: 5,
        backgroundColor: "#FFFFFF",
    },

    inputRow: {
        flexDirection: "row",
        width: "65%",
        alignSelf: "center",
        gap: 15,
        marginBottom: 20,
    },

    inputGroup: {
        flex: 1,
    },

    registerButton: {
        height: 50,
        backgroundColor: "#ebb31a",
        width: "65%",
        borderRadius: 1,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },

    registerButtonText: {
        color: "#242323",
        fontSize: 15,
        fontWeight: "bold",
    },
});
