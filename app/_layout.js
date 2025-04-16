import "react-native-gesture-handler";
import { StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import "../global.css"
import { Stack, useRouter, useSegments } from 'expo-router'
import { AuthContextProvider, useAuth } from '../contexts/authContext';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import LayoutHeader from '../components/LayoutHeader';
import { ScrollProvider } from '../contexts/ScrollContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatWrapper } from "../components/ChatWrapper";
import { AppProvider } from "../contexts/AppContext";
import LoadingScreen from "../components/LoadingScreen";

LogBox.ignoreLogs([
  'Failed to initialize reCAPTCHA Enterprise config',
  'Support for defaultProps will be removed',
]);

const RedirectGate = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const segment = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated == 'undefined') return;
    const allowedSegments = ['(chat)', 'channel'];
    const inApp = allowedSegments.includes(segment[0]);
    if (isAuthenticated && !inApp) {
      // redirect to home
      setTimeout(() => {
        router.replace('/(chat)/chat');
      }, 2000);
    } else if (isAuthenticated == false) {
      // redirect to signin
      setTimeout(() => {
        router.replace('/signIn');
      }, 2000);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return null;
};

export default function _layout() {
  return (
    // <AuthContextProvider>
    //   <ScrollProvider>
    //     <RedirectGate />
    //     <Stack>
    //       <Stack.Screen name="index" options={{ headerShown: false }} />
    //       <Stack.Screen name="signIn" options={{ headerShown: false }} />
    //       <Stack.Screen
    //         name="(chat)"
    //         options={{
    //           title: 'Channel List Screen',
    //           headerShadowVisible: false,
    //           header: () => <LayoutHeader />,
    //         }}
    //       />
    //     </Stack>
    //   </ScrollProvider>
    // </AuthContextProvider>

    <AuthContextProvider>
      <StatusBar style="light" />
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ChatWrapper>
            <AppProvider>
              <ScrollProvider>
                <RedirectGate />
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="signIn" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(chat)"
                    options={{
                      title: 'Channel List Screen',
                      headerShadowVisible: false,
                      header: () => <LayoutHeader />,
                    }}
                  />
                </Stack>
              </ScrollProvider>
            </AppProvider>
          </ChatWrapper>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthContextProvider>
  )
}
