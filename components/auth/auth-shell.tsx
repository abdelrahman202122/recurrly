import images from '@/constants/images';
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  trustItems?: string[];
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  trustItems = ['Encrypted session', 'Email verification', 'Private by default'],
}: AuthShellProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="relative">
            <Image
              source={images.splashPattern}
              resizeMode="contain"
              className="absolute -right-10 -top-14 size-52 opacity-25"
            />

            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Smart billing</Text>
                </View>
              </View>

              <Text className="auth-title">{title}</Text>
              <Text className="auth-subtitle">{subtitle}</Text>

              <View className="mt-4 flex-row flex-wrap justify-center gap-2">
                {trustItems.map((item) => (
                  <View
                    key={item}
                    className="rounded-full border border-border bg-background px-3 py-2"
                  >
                    <Text className="text-xs font-sans-semibold text-muted-foreground">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="auth-card">{children}</View>
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
