import * as SecureStore from 'expo-secure-store';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

import { FrentistaUser, loginFrentista, logoutFrentista as logoutFrentistaService } from '@/services/auth.service';

const ACCESS_TOKEN_KEY = 'gasofind_access_token';
const REFRESH_TOKEN_KEY = 'gasofind_refresh_token';
const USER_KEY = 'gasofind_user';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  frentista: FrentistaUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [frentista, setFrentista] = useState<FrentistaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [savedAccessToken, savedRefreshToken, savedUser] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (savedAccessToken && savedRefreshToken && savedUser) {
          setAccessToken(savedAccessToken);
          setRefreshToken(savedRefreshToken);
          setFrentista(JSON.parse(savedUser) as FrentistaUser);
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    const response = await loginFrentista(email, password);

    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.frentista)),
    ]);

    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setFrentista(response.frentista);
  }

  async function updateTokens(newAccessToken: string, newRefreshToken: string) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken),
    ]);

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  }

  async function logout() {
    // Revoke refresh token on server
    if (refreshToken) {
      try {
        await logoutFrentistaService(refreshToken);
      } catch (error) {
        // Silently fail - logout locally anyway
        console.warn('Failed to revoke refresh token on server:', error);
      }
    }

    // Clear local storage
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    setAccessToken(null);
    setRefreshToken(null);
    setFrentista(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, frentista, isLoading, login, logout, updateTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
