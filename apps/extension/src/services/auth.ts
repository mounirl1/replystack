/**
 * Auth storage and utilities for the extension.
 */

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  plan: string;
  quota_remaining: number | 'unlimited';
  responseStyleConfigured: boolean;
  firstLocationId: number | null;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

/**
 * Get the current auth state from storage.
 */
export async function getAuthState(): Promise<AuthState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token', 'user'], (result) => {
      resolve({
        token: result.token || null,
        user: result.user || null,
      });
    });
  });
}

/**
 * Set the auth state in storage.
 */
export async function setAuthState(token: string, user: AuthUser): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ token, user }, () => {
      resolve();
    });
  });
}

/**
 * Clear the auth state from storage.
 */
export async function clearAuthState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['token', 'user'], () => {
      resolve();
    });
  });
}

/**
 * Get the current authenticated user from storage.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const { user } = await getAuthState();
  return user;
}

/**
 * Check if the user is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const { token } = await getAuthState();
  return !!token;
}

/**
 * Check if the user has quota remaining.
 */
export async function hasQuotaRemaining(): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;
  if (user.quota_remaining === 'unlimited') return true;
  return (user.quota_remaining ?? 0) > 0;
}

/**
 * Update the user's quota in storage.
 */
export async function updateUserQuota(quota: number | 'unlimited'): Promise<void> {
  const { user } = await getAuthState();
  if (user) {
    user.quota_remaining = quota;
    await chrome.storage.local.set({ user });
  }
}

/**
 * Login with email and password.
 * Returns the auth token and user on success.
 */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const apiUrl = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();

  // Fetch user quota and response style status in parallel
  const [quotaRes, styleRes] = await Promise.all([
    fetch(`${apiUrl}/api/user/quota`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
    fetch(`${apiUrl}/api/user/response-style-status`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
  ]);

  const quotaData = quotaRes.ok ? await quotaRes.json() : { quota: { remaining: 0 } };
  const styleData = styleRes.ok ? await styleRes.json() : { onboardingCompleted: false, locationId: null };

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name || data.user.email.split('@')[0],
    plan: data.user.plan,
    quota_remaining: quotaData.quota.remaining,
    responseStyleConfigured: styleData.onboardingCompleted,
    firstLocationId: styleData.locationId,
  };

  // Save to storage
  await setAuthState(data.token, user);

  return { token: data.token, user };
}

/**
 * Register a new user with email and password.
 * Returns the auth token and user on success.
 */
export async function register(
  email: string,
  password: string,
  passwordConfirmation: string,
  name?: string
): Promise<{ token: string; user: AuthUser }> {
  const apiUrl = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: name || undefined,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Handle validation errors
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
    }
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();

  // Fetch user quota and response style status in parallel
  const [quotaRes, styleRes] = await Promise.all([
    fetch(`${apiUrl}/api/user/quota`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
    fetch(`${apiUrl}/api/user/response-style-status`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
  ]);

  const quotaData = quotaRes.ok ? await quotaRes.json() : { quota: { remaining: 10 } };
  const styleData = styleRes.ok ? await styleRes.json() : { onboardingCompleted: false, locationId: null };

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name || data.user.email.split('@')[0],
    plan: data.user.plan,
    quota_remaining: quotaData.quota.remaining,
    responseStyleConfigured: styleData.onboardingCompleted,
    firstLocationId: styleData.locationId,
  };

  // Save to storage
  await setAuthState(data.token, user);

  return { token: data.token, user };
}

/**
 * Logout the user.
 */
export async function logout(): Promise<void> {
  const { token } = await getAuthState();
  const apiUrl = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

  // Try to logout on server (optional, don't fail if it doesn't work)
  if (token) {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
    } catch {
      // Ignore errors
    }
  }

  await clearAuthState();
}

/**
 * Create a magic token and return the full URL for authentication.
 * This allows opening web app pages without requiring re-login.
 */
export async function createMagicLink(redirectUrl: string): Promise<string | null> {
  const { token } = await getAuthState();
  if (!token) return null;

  const apiUrl = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';
  const webUrl = process.env.PLASMO_PUBLIC_WEB_URL || 'http://localhost:5173';

  try {
    const response = await fetch(`${apiUrl}/api/auth/magic-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ redirect_url: redirectUrl }),
    });

    if (!response.ok) {
      // If magic token creation fails, return direct URL (user will need to login)
      return `${webUrl}${redirectUrl}`;
    }

    const data = await response.json();
    return `${webUrl}/auth/magic?token=${data.token}`;
  } catch {
    // Fallback to direct URL
    return `${webUrl}${redirectUrl}`;
  }
}

/**
 * Open a web app URL with magic authentication.
 */
export async function openWithMagicAuth(redirectUrl: string): Promise<void> {
  const magicUrl = await createMagicLink(redirectUrl);
  if (magicUrl) {
    window.open(magicUrl, '_blank');
  }
}

/**
 * Refresh the user's profile and quota from the server.
 */
export async function refreshUserProfile(): Promise<AuthUser | null> {
  const { token } = await getAuthState();
  if (!token) return null;

  const apiUrl = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const [userRes, quotaRes, styleRes] = await Promise.all([
      fetch(`${apiUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }),
      fetch(`${apiUrl}/api/user/quota`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }),
      fetch(`${apiUrl}/api/user/response-style-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }),
    ]);

    if (!userRes.ok) {
      // Token might be invalid
      await clearAuthState();
      return null;
    }

    const userData = await userRes.json();
    const quotaData = quotaRes.ok ? await quotaRes.json() : { quota: { remaining: 0 } };
    const styleData = styleRes.ok ? await styleRes.json() : { onboardingCompleted: false, locationId: null };

    const user: AuthUser = {
      id: userData.user.id,
      email: userData.user.email,
      name: userData.user.name || userData.user.email.split('@')[0],
      plan: userData.user.plan,
      quota_remaining: quotaData.quota.remaining,
      responseStyleConfigured: styleData.onboardingCompleted,
      firstLocationId: styleData.locationId,
    };

    await setAuthState(token, user);
    return user;
  } catch {
    return null;
  }
}
