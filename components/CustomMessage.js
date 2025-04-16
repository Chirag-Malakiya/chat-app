// CustomMessage.js
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { MessageSimple, useMessageContext } from 'stream-chat-expo';

const CustomMessage = () => {
    const { message, isMyMessage } = useMessageContext();

    // Check for sticker attachment
    const stickerAttachment = message.attachments?.find(
        (att) => att.type === 'image' && att.extra_data?.isSticker
    );

    if (stickerAttachment) {
        return (
            <View
                style={[
                    styles.stickerContainer,
                    isMyMessage ? styles.mySticker : styles.otherSticker,
                ]}
            >
                <Image
                    source={{ uri: stickerAttachment.image_url }}
                    style={styles.stickerImage}
                    resizeMode="contain"
                />
                {stickerAttachment.extra_data?.caption && (
                    <Text style={styles.caption}>
                        {stickerAttachment.extra_data.caption}
                    </Text>
                )}
            </View>
        );
    }

    // Fallback to default message rendering for non-sticker messages
    return <MessageSimple />;
};

const styles = StyleSheet.create({
    stickerContainer: {
        maxWidth: 200,
        margin: 8,
        padding: 8,
        borderRadius: 12,
    },
    mySticker: {
        backgroundColor: 'transparent',
        alignSelf: 'flex-end',
    },
    otherSticker: {
        backgroundColor: 'transparent',
        alignSelf: 'flex-start',
    },
    stickerImage: {
        width: 150,
        height: 150,
    },
    caption: {
        fontSize: 12,
        marginTop: 4,
        color: '#000',
    },
});

export default CustomMessage;