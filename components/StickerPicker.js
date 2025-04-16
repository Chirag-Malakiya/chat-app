import React from 'react';
import { Modal, View, FlatList, Image, TouchableOpacity } from 'react-native';

const StickerPicker = ({ visible, onClose, onSelectSticker, stickers }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <FlatList
          data={stickers}
          keyExtractor={(item) => item.id}
          numColumns={4}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectSticker(item)}>
              <Image
                source={{ uri: item.uri }}
                style={{ width: 60, height: 60, margin: 8 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

export default StickerPicker;
