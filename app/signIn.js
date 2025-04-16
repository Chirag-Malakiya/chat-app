import { IconExclamationCircle } from "@tabler/icons-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  // Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ImageBackground
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "../contexts/authContext";

export default function SignIn() {
  const { login, confirmCode, user, logout } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'code'

  const bgColorAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bgColorAnim, {
      toValue: phone.length === 10 ? 1 : 0,
      duration: 300, // Transition duration
      useNativeDriver: false,
    }).start();
  }, [phone]);

  useEffect(() => {
    let val = 0;
    if (phone.length > 10) {
      val = 1;
    } else {
      val = 0;
    }
    Animated.timing(fadeAnim, {
      toValue: val, // End fully visible
      duration: 500, // Animation duration in ms
      useNativeDriver: true,
    }).start();
  }, [phone]);

  // Interpolating background color based on phone input
  const backgroundColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ededed", "#007AFF"], // Gray to Blue transition
  });

  const handlePhoneSubmit = async () => {
    try {
      await login(`+91${phone}`);
      setStep('code');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCodeSubmit = async () => {
    try {
      await confirmCode(code);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <View
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground
        source={require("../assets/images/sign-in/background.png")} // Replace with your image path
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Image */}
            <Image
              style={{ height: 175, aspectRatio: 1, marginBottom: 20 }}
              source={require("../assets/images/sign-in/signin.png")}
              transition={500}
            />
            {/* Title */}
            <Text style={styles.title}>Welcome to Hike</Text>
            <Text style={styles.subtitle}>Connect with your friends in a fun way</Text>

          </View>
        </TouchableWithoutFeedback>
        {/* Input Field */}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ paddingLeft: 2, paddingRight: 2 }}
        >
          <Text style={styles.bottomText}>By continuing, I accept the Terms of Service</Text>
          {step === 'phone' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {/* Next Button with Animated Background */}
              {phone.length <= 10 ?
                <Animated.View style={[styles.nextButton, { backgroundColor }]}>
                  <TouchableOpacity disabled={phone.length < 10} onPress={() => handlePhoneSubmit()}>
                    <Text style={styles.nextText}>NEXT</Text>
                  </TouchableOpacity>
                </Animated.View>
                :
                <Animated.View style={{ opacity: fadeAnim }}>
                  <IconExclamationCircle color="red" size={25} />
                </Animated.View>
              }
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter One Time Password"
                keyboardType="phone-pad"
                value={code}
                onChangeText={setCode}
              />
              {/* Next Button with Animated Background */}
              {code.length <= 6 ?
                <Animated.View style={[styles.nextButton, { backgroundColor }]}>
                  <TouchableOpacity disabled={phone.length < 6} onPress={() => handleCodeSubmit()}>
                    <Text style={styles.nextText}>VERIFY</Text>
                  </TouchableOpacity>
                </Animated.View>
                :
                <Animated.View style={{ opacity: fadeAnim }}>
                  <IconExclamationCircle color="red" size={25} />
                </Animated.View>
              }
            </View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 175,
    height: 175,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    marginBottom: 30,
  },
  bottomText: {
    fontSize: 12,
    color: "white",
    marginBottom: 10,
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 7.5,
    borderTopRightRadius: 7.5,
    paddingHorizontal: 10,
    width: "100%",
    height: 55,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#ededed",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
