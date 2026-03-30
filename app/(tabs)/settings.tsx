import images from '@/constants/images';
import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const displayName = user?.fullName || user?.firstName || 'Recurrly member';
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  const handleSignOut = React.useCallback(async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setIsSigningOut(false);
    }
  }, [router, signOut]);

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <View className="gap-5">
        <View>
          <Text className="text-3xl font-sans-bold text-primary">Account</Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            Manage the profile connected to your subscription workspace.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            <Image source={avatarSource} className="size-16 rounded-full" />
            <View className="flex-1">
              <Text className="text-xl font-sans-bold text-primary">{displayName}</Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress || 'No primary email'}
              </Text>
            </View>
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-background px-4 py-4">
            <Text className="text-sm font-sans-semibold text-primary">Session security</Text>
            <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
              Your account is protected with secure session storage and email verification.
            </Text>
          </View>

          <Pressable
            className="mt-5 items-center rounded-2xl bg-primary py-4"
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="text-base font-sans-bold text-background">Sign out</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default Settings;
