import AuthInputField from '@/components/auth/auth-input-field';
import AuthShell from '@/components/auth/auth-shell';
import {
  hasFieldErrors,
  normalizeClerkError,
  validateCode,
  validateSignUp,
  type AuthFieldErrors,
} from '@/lib/auth';
import { useSignUp } from '@clerk/expo';
import { Link, type Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function SignUp() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<AuthFieldErrors>({});
  const [resendIn, setResendIn] = React.useState(0);

  const isBusy = fetchStatus === 'fetching';
  const needsEmailVerification =
    signUp?.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  React.useEffect(() => {
    if (!resendIn) {
      return;
    }

    const timeout = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendIn]);

  const clearFieldError = React.useCallback((field: keyof AuthFieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const applyClerkError = React.useCallback((error: unknown) => {
    const normalized = normalizeClerkError(error);
    setFieldErrors(normalized.fieldErrors);
    setFormError(normalized.formError || '');
  }, []);

  const completeSignUp = React.useCallback(async () => {
    if (!signUp) {
      return;
    }

    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setFormError('Your account was created, but one more security step is required before entry.');
          return;
        }

        const url = decorateUrl('/');
        if (typeof window !== 'undefined' && url.startsWith('http')) {
          window.location.href = url;
          return;
        }

        router.replace(url as Href);
      },
    });
  }, [router, signUp]);

  const handleSubmit = React.useCallback(async () => {
    if (!signUp) {
      return;
    }

    const nextFieldErrors = validateSignUp({
      emailAddress,
      password,
      confirmPassword,
    });

    if (hasFieldErrors(nextFieldErrors)) {
      setFieldErrors(nextFieldErrors);
      setFormError('');
      return;
    }

    setFieldErrors({});
    setFormError('');

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        applyClerkError(error);
        return;
      }

      await signUp.verifications.sendEmailCode();
      setResendIn(30);
    } catch (error) {
      applyClerkError(error);
    }
  }, [
    applyClerkError,
    confirmPassword,
    emailAddress,
    password,
    signUp,
  ]);

  const handleVerify = React.useCallback(async () => {
    if (!signUp) {
      return;
    }

    const nextFieldErrors = validateCode(code);
    if (hasFieldErrors(nextFieldErrors)) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setFormError('');

    try {
      await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (signUp.status === 'complete') {
        await completeSignUp();
        return;
      }

      setFormError('We verified that code, but the account setup is not complete yet.');
    } catch (error) {
      applyClerkError(error);
    }
  }, [applyClerkError, code, completeSignUp, signUp]);

  const handleResend = React.useCallback(async () => {
    if (!signUp || resendIn > 0) {
      return;
    }

    setFormError('');

    try {
      await signUp.verifications.sendEmailCode();
      setResendIn(30);
    } catch (error) {
      applyClerkError(error);
    }
  }, [applyClerkError, resendIn, signUp]);

  if (needsEmailVerification) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="We sent a confirmation code to protect your account before your workspace opens."
        trustItems={['New account security', 'Quick email check', 'Protected billing access']}
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already verified elsewhere?</Text>
            <Link href="/(auth)/sign-in">
              <Text className="auth-link">Sign in</Text>
            </Link>
          </View>
        }
      >
        <View className="auth-form">
          {formError ? (
            <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <Text className="text-sm font-sans-medium text-destructive">{formError}</Text>
            </View>
          ) : null}

          <AuthInputField
            label="Verification code"
            value={code}
            onChangeText={(value) => {
              setCode(value);
              clearFieldError('code');
            }}
            placeholder="Enter the 6-digit code"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            error={fieldErrors.code}
            editable={!isBusy}
            helper={`Sent to ${emailAddress.trim()}`}
          />

          <Pressable
            className={`auth-button ${isBusy ? 'auth-button-disabled' : ''}`}
            disabled={isBusy}
            onPress={handleVerify}
          >
            <Text className="auth-button-text">
              {isBusy ? 'Verifying...' : 'Verify and continue'}
            </Text>
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            disabled={isBusy || resendIn > 0}
            onPress={handleResend}
          >
            <Text className="auth-secondary-button-text">
              {resendIn > 0 ? `Send a new code in ${resendIn}s` : 'Send a new code'}
            </Text>
          </Pressable>
        </View>

        <View nativeID="clerk-captcha" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking every renewal with one secure home for subscriptions, spend, and reminders."
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="auth-link">Sign in</Text>
          </Link>
        </View>
      }
    >
      <View className="auth-form">
        {formError ? (
          <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
            <Text className="text-sm font-sans-medium text-destructive">{formError}</Text>
          </View>
        ) : null}

        <AuthInputField
          label="Email"
          value={emailAddress}
          onChangeText={(value) => {
            setEmailAddress(value);
            clearFieldError('emailAddress');
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={fieldErrors.emailAddress}
          editable={!isBusy}
        />

        <AuthInputField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearFieldError('password');
          }}
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          error={fieldErrors.password}
          editable={!isBusy}
          actionLabel={showPassword ? 'Hide' : 'Show'}
          onActionPress={() => setShowPassword((value) => !value)}
          helper="Use 8 or more characters to keep your billing dashboard secure."
        />

        <AuthInputField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            clearFieldError('confirmPassword');
          }}
          placeholder="Re-enter your password"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="password"
          error={fieldErrors.confirmPassword}
          editable={!isBusy}
          actionLabel={showConfirmPassword ? 'Hide' : 'Show'}
          onActionPress={() => setShowConfirmPassword((value) => !value)}
        />

        <View className="rounded-2xl border border-border bg-background px-4 py-3">
          <Text className="text-sm font-sans-medium text-muted-foreground">
            By continuing, you agree to receive account security and subscription reminders at this email.
          </Text>
        </View>

        <Pressable
          className={`auth-button ${isBusy ? 'auth-button-disabled' : ''}`}
          disabled={isBusy}
          onPress={handleSubmit}
        >
          <Text className="auth-button-text">
            {isBusy ? 'Creating account...' : 'Create account'}
          </Text>
        </Pressable>
      </View>

      <View nativeID="clerk-captcha" />
    </AuthShell>
  );
}
