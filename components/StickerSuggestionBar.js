import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useMessageInputContext } from 'stream-chat-expo';
import * as FileSystem from 'expo-file-system';
import { stickerPacks } from '../stickerData';
import { Image } from 'expo-image';
import { incrementStickerUsage, getStickerUsage } from '../utils/stickerUsageUtils';

const StickerSuggestionBar = ({ channel }) => {
    const { text, setText } = useMessageInputContext();
    const [suggestions, setSuggestions] = useState([]);
    const slideAnim = useRef(new Animated.Value(100)).current; // initial Y offset

    useEffect(() => {
        const fetchSuggestions = async () => {
            const lastWord = text.trim().split(' ').pop().toLowerCase();

            if (lastWord.length > 1) {
                const matched = [];

                stickerPacks.forEach((pack) => {
                    pack.stickers.forEach((sticker) => {
                        if (sticker.keywords?.some((k) => k.includes(lastWord))) {
                            matched.push({ ...sticker, packId: pack.id });
                        }
                    });
                });

                const usage = await getStickerUsage();

                matched.sort((a, b) => {
                    const usageA = usage[a.id] || 0;
                    const usageB = usage[b.id] || 0;
                    return usageB - usageA;
                });

                setSuggestions(matched.slice(0, 6));
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [text]);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: suggestions.length > 0 ? 0 : 100,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [suggestions]);

    const handleStickerSend = async (sticker) => {
        try {
            const extension = sticker.url.split('.').pop().split(/\#|\?/)[0];
            const localPath = `${FileSystem.documentDirectory}stickers/${sticker.packId}/${sticker.id}.${extension}`;

            await channel.sendMessage({
                attachments: [
                    {
                        type: 'image',
                        image_url: sticker.url,
                        extra_data: {
                            isSticker: true,
                            localPath: localPath,
                            caption: '',
                        },
                    },
                ],
            });

            await incrementStickerUsage(sticker.id);
            setText('');
            setSuggestions([]);
        } catch (err) {
            console.error('Failed to send sticker:', err);
        }
    };

    if (suggestions.length === 0) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <FlatList
                horizontal
                keyboardShouldPersistTaps="always"
                data={suggestions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableWithoutFeedback onPress={() => handleStickerSend(item)}>
                        <Image
                            source={{ uri: item.url }}
                            style={styles.sticker}
                            contentFit='contain'
                            transition={500}
                        />
                    </TouchableWithoutFeedback>
                )}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 65, // just above input field, adjust as needed
        left: 0,
        right: 0,
        backgroundColor: '#171717',
        borderTopWidth: 1,
        borderColor: 'transparent',
        paddingVertical: 6,
        elevation: 5,
    },
    list: {
        paddingHorizontal: 10,
    },
    sticker: {
        width: 75,
        height: 75,
        marginRight: 8,
    },
});

export default StickerSuggestionBar;
