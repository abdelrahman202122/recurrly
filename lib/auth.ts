export type AuthField = 'emailAddress' | 'password' | 'confirmPassword' | 'code';
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

type ClerkErrorShape = {
  errors?: Array<{
    message?: string;
    longMessage?: string;
    meta?: {
      paramName?: string;
      name?: string;
    };
  }>;
  message?: string;
};

type SignInValues = {
  emailAddress: string;
  password: string;
};

type SignUpValues = SignInValues & {
  confirmPassword: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignIn(values: SignInValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = values.emailAddress.trim();

  if (!email) {
    errors.emailAddress = 'Enter the email linked to your account.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.emailAddress = 'Use a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Enter your password.';
  }

  return errors;
}

export function validateSignUp(values: SignUpValues): AuthFieldErrors {
  const errors = validateSignIn(values);

  if (!values.password) {
    errors.password = 'Create a password.';
  } else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function validateCode(code: string): AuthFieldErrors {
  if (!code.trim()) {
    return { code: 'Enter the verification code we sent.' };
  }

  return {};
}

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function normalizeClerkError(error: unknown): {
  fieldErrors: AuthFieldErrors;
  formError?: string;
} {
  const parsed = error as ClerkErrorShape | undefined;
  const issues = Array.isArray(parsed?.errors) ? parsed.errors : [];
  const fieldErrors: AuthFieldErrors = {};
  let formError = '';

  for (const issue of issues) {
    const message =
      issue.longMessage ||
      issue.message ||
      'Something went wrong. Please try again.';
    const field = mapFieldName(issue.meta?.paramName || issue.meta?.name);

    if (field && !fieldErrors[field]) {
      fieldErrors[field] = message;
      continue;
    }

    if (!formError) {
      formError = message;
    }
  }

  if (!formError && typeof parsed?.message === 'string') {
    formError = parsed.message;
  }

  return {
    fieldErrors,
    formError: formError || 'We could not complete that request. Please try again.',
  };
}

function mapFieldName(value?: string): AuthField | undefined {
  switch (value) {
    case 'identifier':
    case 'email_address':
    case 'emailAddress':
      return 'emailAddress';
    case 'password':
      return 'password';
    case 'code':
      return 'code';
    case 'confirm_password':
    case 'confirmPassword':
      return 'confirmPassword';
    default:
      return undefined;
  }
}
