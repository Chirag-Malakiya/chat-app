import { IconHeartFilled } from '@tabler/icons-react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import {
    View,
    Animated,
    StyleSheet,
    Dimensions,
    Image,
    ImageBackground,
    Easing,
    Text
} from 'react-native';
import { Image as ExpoImg } from "expo-image";


const { width, height } = Dimensions.get('window');
const radius = 100;
const dotSize = 15;

const centerX = width / 2 - dotSize / 2;
const centerY = height / 2 - dotSize / 2;

const offsetX = 30;
const offsetY = -32;

const CircleAnimation = () => {
    const position = useRef(new Animated.ValueXY({
        x: centerX + offsetX,
        y: centerY + offsetY
    })).current;

    const angle = useRef(0);
    const animationFrameId = useRef(null);

    const startAnimationLoop = () => {
        // 1. Bounce animation at starting position
        const bounce = Animated.sequence([
            Animated.timing(position, {
                toValue: {
                    x: centerX + offsetX,
                    y: centerY + offsetY - 10,
                },
                duration: 150,
                useNativeDriver: false,
                easing: Easing.out(Easing.quad),
            }),
            Animated.timing(position, {
                toValue: {
                    x: centerX + offsetX,
                    y: centerY + offsetY,
                },
                duration: 150,
                useNativeDriver: false,
                easing: Easing.in(Easing.quad),
            }),
        ]);

        // 2. Move upward to top of circle
        const moveUp = Animated.timing(position, {
            toValue: {
                x: centerX + 25,
                y: centerY - radius,
            },
            duration: 150,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.quad),
        });

        // Animation sequence
        Animated.sequence([
            bounce,
            moveUp
        ]).start(() => {
            // 3. Start circular motion for 3 rounds
            startCircularMotion(2, () => {
                // 4. Return to custom start position
                Animated.timing(position, {
                    toValue: {
                        x: centerX + offsetX,
                        y: centerY + offsetY,
                    },
                    duration: 350,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.quad),
                }).start(() => {
                    // Restart the loop
                    startAnimationLoop();
                });
            });
        });
    };

    // Function to perform circular motion
    const startCircularMotion = (rounds = 1, onComplete = () => { }) => {
        let localAngle = 0;
        const totalSteps = Math.round((Math.PI * 2 * rounds) / 0.05);

        const animate = () => {
            localAngle += 0.1;
            angle.current = localAngle;

            const x = centerX + radius * Math.sin(localAngle + 0.25);
            const y = centerY - radius * Math.cos(localAngle);

            position.setValue({ x, y });

            if (localAngle <= Math.PI * 2 * rounds) {
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationFrameId.current);
                onComplete();
            }
        };

        animate();
    };

    useEffect(() => {
        startAnimationLoop();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return (
        <ImageBackground
            source={require("../assets/images/sign-in/background.png")}
            style={styles.container}
            resizeMode="cover"
        >
            <StatusBar style="light" />
            <View style={styles.logoContainer}>
                {/* <Image
                    source={require("../assets/images/loading-screen/logo.png")}
                    style={styles.logo}
                /> */}
                <ExpoImg
                    style={styles.logo}
                    source={require("../assets/images/loading-screen/logo.png")}
                    transition={500}
                />
            </View>

            <Animated.View style={[styles.dot, position.getLayout()]} />

            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>Made with</Text>
                <Image
                    source={require("../assets/images/loading-screen/heart.png")}
                    style={styles.icon}
                />
                <Text style={styles.subtitle}>in India</Text>
                <Image
                    source={require("../assets/images/loading-screen/india.png")}
                    style={styles.icon}
                />
            </View>

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    dot: {
        width: dotSize,
        height: dotSize,
        backgroundColor: 'white',
        borderRadius: dotSize / 2,
        position: 'absolute',
    },
    logoContainer: {
        position: 'absolute',
        left: width / 2 - 25,
        top: height / 2 - 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 125,
        height: 125,
        resizeMode: 'contain',
        aspectRatio: 1
    },
    subtitleContainer: {
        color: 'white',
        position: 'absolute',
        bottom: 12,
        fontSize: 15,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    subtitle: {
        color: 'white',
        fontSize: 15,
    },
    icon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        marginHorizontal: 5
    },
});

export default CircleAnimation;
