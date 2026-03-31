import AuthInputField from '@/components/auth/auth-input-field';
import AuthShell from '@/components/auth/auth-shell';
import {
  hasFieldErrors,
  normalizeClerkError,
  validateCode,
  validateSignIn,
  type AuthFieldErrors,
} from '@/lib/auth';
import { useClerk, useSignIn } from '@clerk/expo';
import { Link, useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function SignIn() {
  const clerk = useClerk();
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<AuthFieldErrors>({});
  const [resendIn, setResendIn] = React.useState(0);

  const isBusy = !signIn || fetchStatus === 'fetching';
  const needsEmailCode =
    signIn?.status === 'needs_client_trust' ||
    (signIn?.status === 'needs_second_factor' &&
      signIn.supportedSecondFactors.some(
        (factor) => factor.strategy === 'email_code',
      ));

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

  const startEmailCodeChallenge = React.useCallback(async () => {
    if (!signIn) {
      return false;
    }

    const emailCodeFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === 'email_code',
    );

    if (!emailCodeFactor) {
      return false;
    }

    await signIn.mfa.sendEmailCode();
    setFormError('');
    setResendIn(30);
    return true;
  }, [signIn]);

  const handoffToTaskFlow = React.useCallback(async () => {
    await clerk.redirectToTasks({
      signInFallbackRedirectUrl: '/(auth)/sign-in',
    });
  }, [clerk]);

  const completeSignIn = React.useCallback(async () => {
    if (!signIn) {
      return;
    }

    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setFormError(
            'One more security step is required before we can open your workspace.',
          );
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
  }, [router, signIn]);

  const handleSubmit = React.useCallback(async () => {
    if (!signIn) {
      return;
    }

    const nextFieldErrors = validateSignIn({ emailAddress, password });
    if (hasFieldErrors(nextFieldErrors)) {
      setFieldErrors(nextFieldErrors);
      setFormError('');
      return;
    }

    setFieldErrors({});
    setFormError('');

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        applyClerkError(error);
        return;
      }

      if (signIn.status === 'complete') {
        await completeSignIn();
        return;
      }

      if (signIn.status === 'needs_client_trust') {
        const startedEmailCode = await startEmailCodeChallenge();

        if (!startedEmailCode) {
          setFormError(
            'Your account needs a different security step. Please try again from the same device.',
          );
        }
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        const startedEmailCode = await startEmailCodeChallenge();

        if (startedEmailCode) {
          return;
        }

        if (signIn.supportedSecondFactors.length > 0) {
          await handoffToTaskFlow();
          return;
        }

        setFormError(
          'Additional verification is required, but no supported second factor is available for this sign-in.',
        );
        return;
      }

      setFormError('We could not finish signing you in. Please try again.');
    } catch (error) {
      applyClerkError(error);
    }
  }, [
    applyClerkError,
    completeSignIn,
    emailAddress,
    handoffToTaskFlow,
    password,
    signIn,
    startEmailCodeChallenge,
  ]);

  const handleVerify = React.useCallback(async () => {
    if (!signIn) {
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
      await signIn.mfa.verifyEmailCode({ code: code.trim() });

      if (signIn.status === 'complete') {
        await completeSignIn();
        return;
      }

      setFormError(
        'The code was accepted, but we still could not finish signing you in.',
      );
    } catch (error) {
      applyClerkError(error);
    }
  }, [applyClerkError, code, completeSignIn, signIn]);

  const handleResend = React.useCallback(async () => {
    if (!signIn || resendIn > 0) {
      return;
    }

    setFormError('');

    try {
      await signIn.mfa.sendEmailCode();
      setResendIn(30);
    } catch (error) {
      applyClerkError(error);
    }
  }, [applyClerkError, resendIn, signIn]);

  const handleReset = React.useCallback(async () => {
    if (!signIn) {
      return;
    }

    await signIn.reset();
    setCode('');
    setFormError('');
    setFieldErrors({});
    setResendIn(0);
  }, [signIn]);

  if (needsEmailCode) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="Enter the verification code sent to your email to confirm it is really you."
        trustItems={[
          'Private account access',
          'Timed security code',
          'Trusted device check',
        ]}
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Need a different account?</Text>
            <Pressable onPress={handleReset} hitSlop={8}>
              <Text className="auth-link">Start over</Text>
            </Pressable>
          </View>
        }
      >
        <View className="auth-form">
          {formError ? (
            <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <Text className="text-sm font-sans-medium text-destructive">
                {formError}
              </Text>
            </View>
          ) : null}

          <AuthInputField
            label="Verification code"
            value={code}
            onChangeText={(value) => {
              setCode(value);
              clearFieldError('code');
            }}
            placeholder="Enter the code from your email"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            error={fieldErrors.code}
            editable={!isBusy}
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
              {resendIn > 0
                ? `Send a new code in ${resendIn}s`
                : 'Send a new code'}
            </Text>
          </Pressable>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to stay on top of renewals, spending, and every subscription in one place."
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurrly?</Text>
          <Link href="/(auth)/sign-up">
            <Text className="auth-link">Create account</Text>
          </Link>
        </View>
      }
    >
      <View className="auth-form">
        {formError ? (
          <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
            <Text className="text-sm font-sans-medium text-destructive">
              {formError}
            </Text>
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
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          error={fieldErrors.password}
          editable={!isBusy}
          actionLabel={showPassword ? 'Hide' : 'Show'}
          onActionPress={() => setShowPassword((value) => !value)}
        />

        <View className="rounded-2xl border border-border bg-background px-4 py-3">
          <Text className="text-sm font-sans-medium text-muted-foreground">
            We only use your email for account access, verification, and
            important billing alerts.
          </Text>
        </View>

        <Pressable
          className={`auth-button ${isBusy ? 'auth-button-disabled' : ''}`}
          disabled={isBusy}
          onPress={handleSubmit}
        >
          <Text className="auth-button-text">
            {isBusy ? 'Signing in...' : 'Sign in'}
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
