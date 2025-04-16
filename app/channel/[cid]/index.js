import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import {
    Channel,
    MessageInput,
    MessageList,
    useAttachmentPickerContext,
} from "stream-chat-expo";
import { Stack, useRouter } from "expo-router";
import { AppContext } from "../../../contexts/AppContext";
import { useHeaderHeight } from "@react-navigation/elements";
import StickerPicker from "../../../components/StickerPicker";
import { IconMoodHappy } from "@tabler/icons-react-native";
import CustomMessage from "../../../components/CustomMessage";

export default function ChannelScreen() {
    const router = useRouter();
    const { setThread, channel } = useContext(AppContext);
    const { setTopInset } = useAttachmentPickerContext();
    const headerHeight = useHeaderHeight();
    const [isStickerPickerVisible, setStickerPickerVisible] = useState(false);

    const stickers = [
        {
            id: 'sticker_1',
            uri: 'https://cdn-icons-png.flaticon.com/512/742/742751.png', // laughing emoji
        },
        {
            id: 'sticker_2',
            uri: 'https://cdn-icons-png.flaticon.com/512/742/742751.png', // same for demo, change if needed
        },
        {
            id: 'sticker_3',
            uri: 'https://cdn-icons-png.flaticon.com/512/742/742774.png', // heart eyes emoji
        },
        {
            id: 'sticker_4',
            uri: 'https://cdn-icons-png.flaticon.com/512/742/742760.png', // thumbs up
        },
        {
            id: 'sticker_5',
            uri: 'https://cdn-icons-png.flaticon.com/512/6815/6815042.png', // wow emoji
        },
        {
            id: 'sticker_6',
            uri: 'https://cdn-icons-png.flaticon.com/512/2583/2583117.png', // fire
        },
        {
            id: 'sticker_7',
            uri: 'https://cdn-icons-png.flaticon.com/512/2583/2583126.png', // sad face
        },
        {
            id: 'sticker_8',
            uri: 'https://cdn-icons-png.flaticon.com/512/2583/2583106.png', // cool glasses
        },
        {
            id: 'sticker_9',
            uri: 'https://cdn-icons-png.flaticon.com/512/2583/2583143.png', // love heart
        },
        {
            id: 'sticker_10',
            uri: 'https://cdn-icons-png.flaticon.com/512/2583/2583115.png', // crying face
        },
    ];

    useEffect(() => {
        setTopInset(headerHeight);
    }, [headerHeight, setTopInset]);

    const handleSendSticker = async (sticker) => {
        try {
            await channel.sendMessage({
                attachments: [
                    {
                        type: 'image', // Use 'image' for stickers
                        image_url: sticker.uri,
                        extra_data: {
                            isSticker: true, // Custom flag to identify stickers
                            caption: '', // Optional caption
                        },
                    },
                ],
            });
            setStickerPickerVisible(false);
        } catch (error) {
            console.error('Error sending sticker:', error);
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
                    <StickerPicker
                        visible={isStickerPickerVisible}
                        onClose={() => setStickerPickerVisible(false)}
                        onSelectSticker={handleSendSticker}
                        stickers={stickers}
                    />
                    <TouchableOpacity onPress={() => setStickerPickerVisible(true)}>
                        <IconMoodHappy />
                    </TouchableOpacity>
                    <MessageInput />
                </Channel>
            ) : null}
        </SafeAreaView>
    );
}
