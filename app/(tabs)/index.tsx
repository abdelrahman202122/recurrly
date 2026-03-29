import { Text, View } from "react-native";
import {Link} from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href='/onboarding' className="text-xl font-bold text-primary">Onboarding</Link>
      <Link href='/(auth)/sign-in' className="text-xl font-bold text-primary">Sign In</Link>
      <Link href='/(auth)/sign-up' className="text-xl font-bold text-primary">Sign Up</Link>
      <Link href='/subscriptions/spotify' className="text-xl font-bold text-primary">Spotify Subscription</Link>
      <Link href={{pathname: '/subscriptions/[id]', params: {id:"claude"}}} className="text-xl font-bold text-primary">Claude Subscription</Link>
    </View>
  );
}
