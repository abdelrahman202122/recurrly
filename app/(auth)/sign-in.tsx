import {View, Text} from 'react-native'
import React from 'react'
import {Link} from "expo-router";

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(tabs)">Home</Link>
    </View>
  )
}
export default SignIn
