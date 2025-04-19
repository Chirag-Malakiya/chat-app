import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { MessageSimple, useMessageContext } from 'stream-chat-expo';
import { Image } from 'expo-image';

const CustomStickerAttachment = () => {
  const { message, isMyMessage, onLongPress } = useMessageContext();
  const [localUri, setLocalUri] = useState(null);

  const stickerAttachment = message.attachments?.find(
    (att) => att.type === 'image' && att.extra_data?.isSticker
  );

  const stickerDir = `${FileSystem.documentDirectory}stickers/received/`;

  useEffect(() => {
    const downloadSticker = async () => {
      if (!stickerAttachment) return;

      const remoteUrl = stickerAttachment.image_url;
      const fileName = remoteUrl?.split('/').pop();
      const localPath = `${stickerDir}${fileName}`;

      if (stickerAttachment.extra_data?.localPath) {
        setLocalUri(stickerAttachment.extra_data.localPath);
        return;
      }

      try {
        await FileSystem.makeDirectoryAsync(stickerDir, { intermediates: true });
        const fileInfo = await FileSystem.getInfoAsync(localPath);

        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(remoteUrl, localPath);
        }

        setLocalUri(localPath);
      } catch (error) {
        console.error('Error downloading sticker:', error);
        setLocalUri(remoteUrl); // fallback to remote if download fails
      }
    };

    downloadSticker();
  }, [stickerAttachment]);

  if (!stickerAttachment) return <MessageSimple />;

  message.text = 'Sticker';

  return (
    <Pressable
      onLongPress={() => onLongPress?.()}
      delayLongPress={300}
    >
      <View
        style={[
          styles.stickerContainer,
          isMyMessage ? styles.mySticker : styles.otherSticker,
        ]}
      >
        <Image
          source={{ uri: localUri }}
          style={styles.stickerImage}
          contentFit="contain"
          transition={500}
          placeholder={require('../assets/images/stickers/sticker-placeholder.png')}
          placeholderContentFit="contain"
        />
        {stickerAttachment.extra_data?.caption && (
          <Text style={styles.caption}>{stickerAttachment.extra_data.caption}</Text>
        )}
      </View>
    </Pressable>
  );
};

const CustomMessage = () => {
  return (
    <MessageSimple
      MessageContent={CustomStickerAttachment}
    />
  );
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