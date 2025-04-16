import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import {
    Channel,
    MessageInput,
    MessageList,
    useAttachmentPickerContext,
    AttachButton
} from "stream-chat-expo";
import { Stack, useRouter } from "expo-router";
import * as FileSystem from 'expo-file-system';
import { AppContext } from "../../../contexts/AppContext";
import { useHeaderHeight } from "@react-navigation/elements";
import CustomMessage from "../../../components/CustomMessage";
import { IconMoodHappy } from "@tabler/icons-react-native";
import StickerSuggestionBar from "../../../components/StickerSuggestionBar";
import StickerPanel from "../../../components/sticker_panel/StickerPanel";


export default function ChannelScreen() {
    const router = useRouter();
    const { setThread, channel } = useContext(AppContext);
    const { setTopInset } = useAttachmentPickerContext();
    const headerHeight = useHeaderHeight();
    const [isStickerPickerVisible, setStickerPickerVisible] = useState(false);
    const [showStickerPanel, setShowStickerPanel] = useState(false);

    useEffect(() => {
        setTopInset(headerHeight);
    }, [headerHeight, setTopInset]);

    // const handleSendSticker = async (sticker) => {
    //     try {
    //         await channel.sendMessage({
    //             attachments: [
    //                 {
    //                     type: 'image',
    //                     image_url: sticker.remoteUrl,
    //                     extra_data: {
    //                         isSticker: true,
    //                         localPath: sticker.uri,
    //                         caption: '',
    //                     },
    //                 },
    //             ],
    //         });
    //         setStickerPickerVisible(false);
    //     } catch (error) {
    //         console.error('Error sending sticker:', error);
    //         alert('Failed to send sticker');
    //     }
    // };

    const handleStickerSend = async (sticker) => {
        const ext = sticker.uri.split('.').pop();
        const localPath = `${FileSystem.documentDirectory}stickers/${sticker.packId}/${sticker.id}.${ext}`;

        try {
            await channel.sendMessage({
                attachments: [
                    {
                        type: 'image',
                        image_url: sticker.remoteUrl,
                        extra_data: {
                            isSticker: true,
                            localPath,
                            caption: '',
                        },
                    },
                ],
            });
            // setShowStickerPanel(false);
        } catch (err) {
            console.error('Failed to send sticker:', err);
        }
    };

    if (!channel) {
        return (
            <SafeAreaView>
                <Text>Loading chat...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ title: "Channel Screen" }} />
            {channel ? (
                <Channel channel={channel} keyboardVerticalOffset={headerHeight} MessageSimple={CustomMessage} audioRecordingEnabled>
                    <MessageList
                        onThreadSelect={(thread) => {
                            setThread(thread);
                            router.push(`/channel/${channel.cid}/thread/${thread.cid}`);
                        }}
                    />

                    {/* <StickerLibrary
                        visible={isStickerPickerVisible}
                        onClose={() => setStickerPickerVisible(false)}
                        onSelectSticker={handleSendSticker}
                    /> */}

                    <StickerSuggestionBar channel={channel} />

                    <MessageInput
                        InputButtons={(props) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => setShowStickerPanel(!showStickerPanel)}>
                                    <IconMoodHappy />
                                </TouchableOpacity>
                                <AttachButton {...props} />
                            </View>
                        )}
                    />
                    <StickerPanel visible={showStickerPanel} setShowStickerPanel={setShowStickerPanel} onSelectSticker={handleStickerSend} />

                </Channel>
            ) : null}
        </SafeAreaView>
    );
}
