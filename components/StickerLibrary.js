import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { IconSquareRoundedX } from '@tabler/icons-react-native';
import { stickerPacks } from '../stickerData';
import { Image } from 'expo-image';

const stickerDir = `${FileSystem.documentDirectory}stickers/`;

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
          uri: uri,
          remoteUrl: sticker.url,
        })
      }
    >
      {uri && (
        <Image
          source={{ uri }}
          style={styles.stickerPreview}
          contentFit='contain'
          transition={500}
        />
      )}
    </TouchableOpacity>
  );
};

const StickerLibrary = ({ visible, onClose, onSelectSticker }) => {
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

    if (visible) checkDownloadedPacks();
  }, [visible]);

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

      setDownloadedPacks([...downloadedPacks, pack.id]);
      setDownloadingPackId(null);
      setDownloadProgress(0);
      alert(`Downloaded ${pack.name}`);
    } catch (error) {
      console.error('Error downloading pack:', error);
      alert('Failed to download pack');
      setDownloadingPackId(null);
      setDownloadProgress(0);
    }
  };

  const deletePack = async (packId) => {
    try {
      const packDir = `${stickerDir}${packId}/`;
      await FileSystem.deleteAsync(packDir, { idempotent: true });
      setDownloadedPacks(downloadedPacks.filter((id) => id !== packId));
    } catch (err) {
      console.error('Error deleting pack:', err);
    }
  };

  const clearAllStickers = async () => {
    try {
      await FileSystem.deleteAsync(stickerDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(stickerDir, { intermediates: true });
      setDownloadedPacks([]);
      alert('All stickers cleared');
    } catch (err) {
      console.error('Error clearing stickers:', err);
      alert('Failed to clear stickers');
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
                  onSelectSticker={onSelectSticker}
                />
              )}
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sticker Library</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSquareRoundedX />
          </TouchableOpacity>
        </View>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  packContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  packName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stickerPreview: {
    width: 60,
    height: 60,
    marginRight: 8,
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
  list: {
    paddingBottom: 16,
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
