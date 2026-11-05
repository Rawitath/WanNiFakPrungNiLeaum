
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

export default function Login({
    onBack,
    onLogin,
    onForgotPassword,
    onGoogleLogin,
    onRegister,
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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

                {/* หัวข้อ Login */}
                <Image
                    source={require("../1assets/login_logo.png")}
                    style={styles.logo2}
                    resizeMode="contain"
                />

                {/* ชื่อบัญชี */}
                <Text style={styles.label}>ชื่อบัญชี</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    //   placeholder="กรอกชื่อบัญชี"
                    //   placeholderTextColor="#999"
                    autoCapitalize="none"
                />

                {/* รหัสผ่าน */}
                <Text style={styles.label}>รหัสผ่าน</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    //   placeholder="กรอกรหัสผ่าน"
                    //   placeholderTextColor="#999"
                    secureTextEntry
                />

                {/* ลืมรหัสผ่าน */}
                <TouchableOpacity
                    style={styles.forgotButton}
                    onPress={onForgotPassword}
                >
                    <Text style={styles.forgotText}>
                        ลืมรหัสผ่าน?
                    </Text>
                </TouchableOpacity>

                {/* ปุ่มเข้าสู่ระบบ */}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => onLogin?.(username, password)}
                >
                    <Text style={styles.loginButtonText}>
                        เข้าสู่ระบบ
                    </Text>
                </TouchableOpacity>

                {/* หรือ */}
                <Text style={styles.orText}>หรือ</Text>

                {/* Google Login */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={onGoogleLogin}
                >
                    <Text style={styles.googleLogo}>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 48 48"
                            >
                            <path
                                fill="#4285F4"
                                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.6-4.2 6v5h6.8c4-3.7 6-8.8 6-14.7z"
                            />
                            <path
                                fill="#34A853"
                                d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.8-5c-1.8 1.2-4 1.9-6.7 1.9-5.2 0-9.6-3.5-11.2-8.2H5.8v5.2C9.2 39.6 16 44 24 44z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M12.8 27.9c-.4-1.2-.7-2.5-.7-3.9s.3-2.7.7-3.9v-5.2H5.8C4.3 17.9 3.5 20.9 3.5 24s.8 6.1 2.3 9.1l7-5.2z"
                            />
                            <path
                                fill="#EA4335"
                                d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4 16 4 9.2 8.4 5.8 14.9l7 5.2c1.6-4.7 6-8.2 11.2-8.2z"
                            />
                            </svg>
                    </Text>
                    <Text style={styles.googleButtonText}>
                        เข้าสู่ระบบด้วย Google
                    </Text>
                </TouchableOpacity>

                {/* สมัครสมาชิก */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        ยังไม่มีบัญชี?
                    </Text>

                    <TouchableOpacity onPress={onRegister}>
                        <Text style={styles.registerLink}>
                            ลงทะเบียน
                        </Text>
                    </TouchableOpacity>
                </View>
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
        width: 150,
        height: 150,
        alignSelf: "center",
        marginBottom: 6,
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

    label: {
        color: "#222222",
        fontSize: 16,
        marginBottom: 10,
        width: "65%",
        alignSelf: "center",
    },

    input: {
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

    forgotButton: {
        alignSelf: "flex-end",
        marginTop: -10,
        marginBottom: 25,
        marginRight: 120,
    },

    forgotText: {
        color: "#f9aa16",
        fontSize: 16,
    },

    loginButton: {
        height: 50,
        backgroundColor: "#ebb31a",
        width: "65%",
        borderRadius: 1,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },

    loginButtonText: {
        color: "#242323",
        fontSize: 15,
        fontWeight: "bold",
    },

    orText: {
        textAlign: "center",
        color: "#555555",
        fontSize: 13,
        marginVertical: 20,
    },

    // Google
    googleButton: {
        height: 50,
        backgroundColor: "#000000",
        borderRadius: 1,
        width: "65%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },

    googleLogo: {
        color: "#4285F4",
        fontSize: 20,
        fontWeight: "bold",
        marginRight: 12,
    },

    googleButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "bold",
    },

    // ลงทะเบียน
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
        gap: 8,
    },

    registerText: {
        color: "#333333",
        fontSize: 15,
        fontWeight: "bold",
    },

    registerLink: {
        color: "#e8a92a",
        fontSize: 15,
        marginLeft: 15,
        fontWeight: "bold",
    },
});
