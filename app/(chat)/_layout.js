import { Tabs } from 'expo-router';
import { Image, ImageBackground, Platform, StyleSheet } from 'react-native';
import LayoutHeader from '../../components/LayoutHeader';

const ios = Platform.OS === "ios";

export default function Layout() {
    return (
        <ImageBackground
            source={require('../../assets/images/sign-in/background.png')} // your background image
            style={styles.background}
            resizeMode="cover"
        >
            <Tabs
                screenOptions={{
                    header: () => <LayoutHeader />, // Top header
                    headerShown: false,
                    tabBarActiveTintColor: '#007AFF',
                    tabBarStyle: {
                        paddingVertical: 8,
                        paddingTop: 8,
                        height: ios ? 80 : 65,
                    },
                    sceneStyle: {
                        backgroundColor: '#1d58f2f5', // Change to any color you prefer
                    },
                }}
            >
                <Tabs.Screen
                    name="moments"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Image
                                source={
                                    focused
                                        ? require('../../assets/images/bottom-tabs/moments-active.png')
                                        : require('../../assets/images/bottom-tabs/moments.png')
                                }
                                style={{ width: 24, height: 24 }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Image
                                source={
                                    focused
                                        ? require('../../assets/images/bottom-tabs/chat-active.png')
                                        : require('../../assets/images/bottom-tabs/chat.png')
                                }
                                style={{ width: 24, height: 24 }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="stickers"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Image
                                source={
                                    focused
                                        ? require('../../assets/images/bottom-tabs/sticker-active.png')
                                        : require('../../assets/images/bottom-tabs/sticker.png')
                                }
                                style={{ width: 24, height: 24 }}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
            </Tabs >
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
});
