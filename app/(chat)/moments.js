import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function Moments() {
  return (
    <View style={styles?.background}>
      <Text>Moments</Text>
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