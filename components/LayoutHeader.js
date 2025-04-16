import { Animated, View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { blurhash } from '../utils/common';
import { useAuth } from '../contexts/authContext';
import { useScroll } from '../contexts/ScrollContext';

const ios = Platform.OS === "ios";
const HEADER_HEIGHT = 100;

export default function LayoutHeader() {
    const { top } = useSafeAreaInsets();
    const { login, confirmCode, user, logout } = useAuth();

    const { headerTranslateY } = useScroll();

    return (
        <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}>
            <View style={{ height: 100, width: '100%', paddingTop: wp(8.5) }}>
                <Image
                    source={require('../assets/images/sign-in/background.png')}
                    style={styles?.background}
                />
                <View style={styles?.container}>
                    <TouchableOpacity onPress={() => logout()}>
                        <Image
                            style={styles?.logo}
                            source={require("../assets/images/header/logo.png")}
                        />
                    </TouchableOpacity>
                    <View style={styles?.rowContainer}>
                        <Image
                            style={styles?.icon}
                            source={require("../assets/images/header/search.png")}
                        />
                        <Image
                            style={styles?.icon}
                            source={require("../assets/images/header/chat-plus.png")}
                        />
                        <Image
                            style={styles?.profilePic}
                            source={{ uri: "https://randomuser.me/api/portraits/women/2.jpg" }}
                        />
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        // backgroundColor: '#1d58f2f5',
        backgroundColor: 'trensprent',
        justifyContent: 'center',
        zIndex: 100,
        elevation: 4,
    },
    background: {
        width: '100%',
        height: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        resizeMode: 'cover',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 15,
    },
    logo: {
        height: hp(3.25),
        aspectRatio: 1
    },
    profilePic: {
        height: hp(4.5),
        aspectRatio: 1,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: 'white'
    },
    icon: {
        height: hp(3.25),
        aspectRatio: 1,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 140,
    },
});
