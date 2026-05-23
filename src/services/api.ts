import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const ACCESS_TOKEN_KEY = 'gasofind_access_token';
const REFRESH_TOKEN_KEY = 'gasofind_refresh_token';

export type ApiError = {
  status: number;
  message: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

// Mutex to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${BASE_URL}/auth/frentista/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();

  // Update tokens in SecureStore
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
  ]);

  return data.accessToken;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  // Use provided token or get from storage
  const authToken = token ?? (await getAccessToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && authToken && path !== '/auth/frentista/refresh') {
    try {
      // Use mutex to prevent multiple simultaneous refreshes
      let newAccessToken: string;
      if (isRefreshing && refreshPromise) {
        newAccessToken = await refreshPromise;
      } else {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
        newAccessToken = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;
      }

      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
      });
    } catch (refreshError) {
      // Refresh failed - clear tokens and force re-login
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync('gasofind_user'),
      ]);
      
      isRefreshing = false;
      refreshPromise = null;

      const error: ApiError = {
        status: 401,
        message: 'Sessão expirada. Faça login novamente.',
      };
      throw error;
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error: ApiError = {
      status: response.status,
      message: (payload as { message?: string }).message ?? 'Erro desconhecido',
    };
    throw error;
  }

  return response.json() as Promise<T>;
}
