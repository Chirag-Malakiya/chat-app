import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';

const StickerItem = ({ sticker, isDownloaded, baseDir, onSelectSticker }) => {
    const [uri, setUri] = useState(isDownloaded ? null : sticker.url);

    useEffect(() => {
        const getLocalStickerUri = async () => {
            try {
                const files = await FileSystem.readDirectoryAsync(baseDir);
                const file = files.find((f) => f.startsWith(sticker.id));
                if (file) setUri(`${baseDir}${file}`);
            } catch (e) {
                console.warn('Error reading local sticker URI:', e);
            }
        };

        if (isDownloaded) getLocalStickerUri();
    }, [isDownloaded]);

    return (
        <TouchableOpacity
            onPress={() =>
                isDownloaded &&
                onSelectSticker({
                    uri,
                    remoteUrl: sticker.url,
                    id: sticker.id,
                })
            }
        >
            {uri && (
                <Image
                    source={{ uri }}
                    style={styles.sticker}
                    contentFit="contain"
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    sticker: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 10,
    },
});

export default StickerItem;
