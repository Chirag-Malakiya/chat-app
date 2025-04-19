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
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { stickerPacks } from '../../stickerData';
import StickerItem from './StickerItem';
import { addToRecentStickers, loadRecentStickers } from '../../utils/recentStickerUtils';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const stickerDir = `${FileSystem.documentDirectory}stickers/`;

const StickerPanel = ({ visible, setShowStickerPanel, onSelectSticker }) => {
  const [recentStickers, setRecentStickers] = useState([]);
  const [downloadedPacks, setDownloadedPacks] = useState([]);
  const [downloadingPackId, setDownloadingPackId] = useState(null);
  const [index, setIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const routes = [
    { key: 'recent', title: 'Recent' },
    ...stickerPacks.map((pack) => ({ key: pack.id, title: pack.name })),
  ];
  
  useEffect(() => {
    if (index === 0) {
      fetchRecentStickers();
    }
  }, [index]);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setShowStickerPanel(false)
    );
    return () => keyboardListener.remove();
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
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloadingPackId(null);
    }
  };

  const renderStickerList = (stickers, packId, isRecent = false) => {
    const baseDir = `${stickerDir}${packId}/`;

    return (
      <FlatList
        data={stickers}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.stickerGrid}
        renderItem={({ item }) => (
          <StickerItem
            sticker={item}
            isDownloaded={true}
            baseDir={baseDir}
            onSelectSticker={async (s) => {
              onSelectSticker({
                ...s,
                id: item.id,
                remoteUrl: item.url,
                packId,
              });
              await addToRecentStickers({ ...item, packId });
              if (!isRecent) await fetchRecentStickers();
            }}
          />
        )}
      />
    );
  };

  const renderScene = ({ route }) => {
    if (route.key === 'recent') {
      return renderStickerList(recentStickers, recentStickers[0]?.packId || '', true);
    }

    const currentPack = stickerPacks.find((p) => p.id === route.key);
    const isDownloaded = downloadedPacks.includes(route.key);
    const isDownloading = downloadingPackId === route.key;

    if (!isDownloaded) {
      return isDownloading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={{ marginLeft: 10 }}>Downloading...</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => downloadPack(currentPack)}
          style={styles.downloadButton}
        >
          <Text style={styles.downloadText}>Download Pack</Text>
        </TouchableOpacity>
      );
    }

    return renderStickerList(currentPack.stickers, route.key);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{ backgroundColor: '#007AFF' }}
            style={{ backgroundColor: '#fff' }}
            labelStyle={{ color: '#007AFF', fontWeight: '600' }}
            inactiveColor="#444"
            activeColor="#007AFF"
          />
        )}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: screenHeight * 0.4,
    backgroundColor: '#fff',
  },
  stickerGrid: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  downloadButton: {
    margin: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 16,
  },
});

export default StickerPanel;
