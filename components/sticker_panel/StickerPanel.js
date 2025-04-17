import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Dimensions,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { stickerPacks } from '../../stickerData';
import StickerItem from './StickerItem';
import { addToRecentStickers, loadRecentStickers } from '../../utils/recentStickerUtils';

const screenHeight = Dimensions.get('window').height;
const stickerDir = `${FileSystem.documentDirectory}stickers/`;

const StickerPanel = ({ visible, setShowStickerPanel, onSelectSticker }) => {
  const [recentStickers, setRecentStickers] = useState([]);

  const [activePackId, setActivePackId] = useState('recent');
  const [downloadedPacks, setDownloadedPacks] = useState([]);
  const [downloadingPackId, setDownloadingPackId] = useState(null);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setShowStickerPanel(false)
    );
    return () => keyboardDidShowListener.remove();
  }, []);

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      checkDownloaded();
      fetchRecentStickers();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchRecentStickers = async () => {
    const recents = await loadRecentStickers();
    setRecentStickers(recents);
  };

  const checkDownloaded = async () => {
    try {
      const dirInfo = await FileSystem.readDirectoryAsync(stickerDir);
      setDownloadedPacks(dirInfo);
    } catch {
      await FileSystem.makeDirectoryAsync(stickerDir, { intermediates: true });
      setDownloadedPacks([]);
    }
  };

  const downloadPack = async (pack) => {
    try {
      const packDir = `${stickerDir}${pack.id}/`;
      await FileSystem.makeDirectoryAsync(packDir, { intermediates: true });

      setDownloadingPackId(pack.id);
      for (let sticker of pack.stickers) {
        const ext = sticker.url.split('.').pop().split(/\#|\?/)[0];
        const path = `${packDir}${sticker.id}.${ext}`;
        await FileSystem.downloadAsync(sticker.url, path);
      }

      setDownloadedPacks((prev) => [...prev, pack.id]);
      setDownloadingPackId(null);
    } catch (e) {
      console.error('Download error:', e);
      setDownloadingPackId(null);
    }
  };

  const renderStickerItem = ({ item }) => {

    const isRecent = activePackId === 'recent';
    const isDownloaded = isRecent || downloadedPacks.includes(activePackId);
    const baseDir = isRecent ? `${stickerDir}${item.packId}/` : `${stickerDir}${activePackId}/`;

    return (
      <StickerItem
        sticker={item}
        isDownloaded={isDownloaded}
        baseDir={baseDir}
        onSelectSticker={async (s) => {
          onSelectSticker({
            ...s,
            id: item.id,
            remoteUrl: item.url,
            packId: isRecent ? item.packId : activePackId,
          });
          await addToRecentStickers({
            ...item,
            packId: isRecent ? item.packId : activePackId,
          });
          await fetchRecentStickers();
        }}
      />
    );
  };

  if (!visible) return null;

  const activeStickers =
    activePackId === 'recent'
      ? recentStickers
      : stickerPacks.find((p) => p.id === activePackId)?.stickers || [];

  const currentPack = stickerPacks.find((p) => p.id === activePackId);
  const isDownloading = downloadingPackId === activePackId;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            onPress={() => setActivePackId('recent')}
            style={[styles.tabButton, activePackId === 'recent' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activePackId === 'recent' && styles.activeTabText]}>
              Recent
            </Text>
          </TouchableOpacity>

          {stickerPacks.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              onPress={() => setActivePackId(pack.id)}
              style={[styles.tabButton, activePackId === pack.id && styles.activeTab]}
            >
              <Text style={[styles.tabText, activePackId === pack.id && styles.activeTabText]}>
                {pack.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activePackId !== 'recent' &&
        !downloadedPacks.includes(activePackId) &&
        !isDownloading && (
          <TouchableOpacity
            onPress={() => downloadPack(currentPack)}
            style={styles.downloadButton}
          >
            <Text style={styles.downloadText}>Download Pack</Text>
          </TouchableOpacity>
        )}

      {isDownloading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={{ marginLeft: 10 }}>Downloading...</Text>
        </View>
      )}

      <FlatList
        data={activeStickers}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.stickerGrid}
        renderItem={renderStickerItem}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    bottom: 0,
    width: '100%',
    height: screenHeight * 0.4,
    backgroundColor: '#fff',
    // borderTopLeftRadius: 16,
    // borderTopRightRadius: 16,
    // elevation: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
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
  stickerGrid: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  downloadButton: {
    margin: 12,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontWeight: '600',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 8,
  },
});

export default StickerPanel;
