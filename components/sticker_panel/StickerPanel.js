import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Dimensions,
    Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { stickerPacks } from '../../stickerData';
import StickerItem from './StickerItem';

const screenHeight = Dimensions.get('window').height;
const stickerDir = `${FileSystem.documentDirectory}stickers/`;

const StickerPanel = ({ visible, setShowStickerPanel, onSelectSticker }) => {
    const [activePackId, setActivePackId] = useState(null);
    const [downloadedPacks, setDownloadedPacks] = useState([]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setShowStickerPanel(false); // 👈 auto-hide sticker panel
            }
        );
        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        if (visible) {
            Keyboard.dismiss();
            checkDownloaded();
        }
    }, [visible]);

    const checkDownloaded = async () => {
        try {
            const dirInfo = await FileSystem.readDirectoryAsync(stickerDir);
            setDownloadedPacks(dirInfo);
        } catch (err) {
            await FileSystem.makeDirectoryAsync(stickerDir, { intermediates: true });
            setDownloadedPacks([]);
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {stickerPacks.map((pack) => (
                    <TouchableOpacity
                        key={pack.id}
                        onPress={() => setActivePackId(pack.id)}
                        style={[
                            styles.tabButton,
                            activePackId === pack.id && styles.activeTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activePackId === pack.id && styles.activeTabText,
                            ]}
                        >
                            {pack.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={
                    stickerPacks.find((p) => p.id === activePackId)?.stickers || []
                }
                keyExtractor={(item) => item.id}
                horizontal
                contentContainerStyle={styles.stickerRow}
                renderItem={({ item }) => {
                    const baseDir = `${stickerDir}${activePackId}/`;
                    return (
                        <StickerItem
                            sticker={item}
                            isDownloaded={downloadedPacks.includes(activePackId)}
                            baseDir={`${stickerDir}${activePackId}/`}
                            onSelectSticker={(s) =>
                                onSelectSticker({
                                    ...s,
                                    id: item.id,
                                    remoteUrl: item.url,
                                    packId: activePackId, // <- pass it here instead
                                })
                            }
                        />
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        bottom: 0,
        width: '100%',
        height: screenHeight * 0.3,
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -3 },
        elevation: 10,
    },
    tabBar: {
        flexDirection: 'row',
        padding: 8,
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tabText: {
        color: '#444',
        fontWeight: '500',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    stickerRow: {
        paddingHorizontal: 12,
        paddingTop: 12,
    },
});

export default StickerPanel;
