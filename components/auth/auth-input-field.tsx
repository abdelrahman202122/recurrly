import { clsx } from 'clsx';
import React from 'react';
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

type AuthInputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function AuthInputField({
  label,
  error,
  helper,
  actionLabel,
  onActionPress,
  className,
  ...inputProps
}: AuthInputFieldProps) {
  return (
    <View className="auth-field">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="auth-label">{label}</Text>
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} hitSlop={8}>
            <Text className="text-xs font-sans-semibold text-accent">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <TextInput
        {...inputProps}
        className={clsx('auth-input', error && 'auth-input-error', className)}
        placeholderTextColor="rgba(8, 17, 38, 0.38)"
      />

      {error ? (
        <Text className="auth-error">{error}</Text>
      ) : helper ? (
        <Text className="auth-helper">{helper}</Text>
      ) : null}
    </View>
  );
}
