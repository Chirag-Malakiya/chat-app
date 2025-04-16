import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function Stickers() {
  return (
    <View style={styles?.background}>
      <Text>Stickers</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});