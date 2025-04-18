import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { stickerPacks } from '../../stickerData';

const stickerDir = `${FileSystem.documentDirectory}stickers/`;

const StickerItem = ({ sticker, isDownloaded, baseDir }) => {
  const [uri, setUri] = useState(isDownloaded ? null : sticker.url);

  useEffect(() => {
    const getLocalUri = async () => {
      try {
        const files = await FileSystem.readDirectoryAsync(baseDir);
        const file = files.find((f) => f.startsWith(sticker.id));
        if (file) setUri(`${baseDir}${file}`);
      } catch (e) {
        console.warn('Error reading local sticker URI:', e);
      }
    };

    if (isDownloaded) getLocalUri();
  }, [isDownloaded]);

  return (
    <View style={styles.stickerWrapper}>
      {uri && (
        <Image
          source={{ uri }}
          style={styles.stickerPreview}
          contentFit="contain"
          transition={500}
        />
      )}
    </View>
  );
};

const StickerLibrary = () => {
  const [downloadedPacks, setDownloadedPacks] = useState([]);
  const [downloadingPackId, setDownloadingPackId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const checkDownloadedPacks = async () => {
      try {
        const dirInfo = await FileSystem.readDirectoryAsync(stickerDir);
        setDownloadedPacks(dirInfo);
      } catch (err) {
        await FileSystem.makeDirectoryAsync(stickerDir, { intermediates: true });
        setDownloadedPacks([]);
      }
    };

    checkDownloadedPacks();
  }, []);

  const downloadPack = async (pack) => {
    try {
      const packDir = `${stickerDir}${pack.id}/`;
      await FileSystem.makeDirectoryAsync(packDir, { intermediates: true });

      setDownloadingPackId(pack.id);
      setDownloadProgress(0);

      for (let i = 0; i < pack.stickers.length; i++) {
        const sticker = pack.stickers[i];
        const extension = sticker.url.split('.').pop().split(/\#|\?/)[0];
        const localPath = `${packDir}${sticker.id}.${extension}`;
        await FileSystem.downloadAsync(sticker.url, localPath);
        setDownloadProgress((i + 1) / pack.stickers.length);
      }

      setDownloadedPacks((prev) => [...prev, pack.id]);
      setDownloadingPackId(null);
      setDownloadProgress(0);
      Alert.alert('Download Complete', `Downloaded ${pack.name}`);
    } catch (error) {
      console.error('Error downloading pack:', error);
      Alert.alert('Download Failed', 'Unable to download sticker pack.');
      setDownloadingPackId(null);
      setDownloadProgress(0);
    }
  };

  const deletePack = async (packId) => {
    try {
      const packDir = `${stickerDir}${packId}/`;
      await FileSystem.deleteAsync(packDir, { idempotent: true });
      setDownloadedPacks((prev) => prev.filter((id) => id !== packId));
    } catch (err) {
      console.error('Error deleting pack:', err);
    }
  };

  const clearAllStickers = async () => {
    try {
      await FileSystem.deleteAsync(stickerDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(stickerDir, { intermediates: true });
      setDownloadedPacks([]);
      Alert.alert('Stickers Cleared', 'All sticker packs have been removed.');
    } catch (err) {
      console.error('Error clearing stickers:', err);
      Alert.alert('Error', 'Failed to clear stickers');
    }
  };

  const renderPack = ({ item }) => {
    const isDownloaded = downloadedPacks.includes(item.id);
    const baseDir = `${stickerDir}${item.id}/`;
    const isDownloading = downloadingPackId === item.id;

    return (
      <View style={styles.packContainer}>
        <Text style={styles.packName}>{item.name}</Text>

        {isDownloading ? (
          <View style={styles.downloadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.downloadProgress}>
              {Math.round(downloadProgress * 100)}%
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={item.stickers}
              horizontal
              keyExtractor={(sticker) => sticker.id}
              renderItem={({ item: sticker }) => (
                <StickerItem
                  sticker={sticker}
                  isDownloaded={isDownloaded}
                  baseDir={baseDir}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />

            {isDownloaded ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePack(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadPack(item)}
              >
                <Text style={styles.downloadText}>Download</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sticker Library</Text>
      <TouchableOpacity style={styles.clearButton} onPress={clearAllStickers}>
        <Text style={styles.clearText}>Clear All Stickers</Text>
      </TouchableOpacity>

      <FlatList
        data={stickerPacks}
        keyExtractor={(pack) => pack.id}
        renderItem={renderPack}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: {
    paddingBottom: 16,
  },
  packContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  packName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stickerWrapper: {
    marginRight: 8,
  },
  stickerPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  clearText: {
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'right',
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  downloadProgress: {
    marginLeft: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default StickerLibrary;

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 100
//   },
// });
