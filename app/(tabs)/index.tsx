import { Link } from 'expo-router';

import { Text } from 'react-native';

import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-7xl  font-sans-extrabold">Home</Text>
      <Link href="/onboarding" className="text-xl font-bold text-primary">
        Onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="text-xl font-bold text-primary">
        Sign In
      </Link>
      <Link href="/(auth)/sign-up" className="text-xl font-bold text-primary">
        Sign Up
      </Link>
      <Link
        href={{ pathname: '/subscriptions/[id]', params: { id: 'spotify' } }}
        className="text-xl font-bold text-primary"
      >
        Spotify Subscription
      </Link>
      <Link
        href={{ pathname: '/subscriptions/[id]', params: { id: 'claude' } }}
        className="text-xl font-bold text-primary"
      >
        Claude Subscription
      </Link>
    </SafeAreaView>
  );
}
