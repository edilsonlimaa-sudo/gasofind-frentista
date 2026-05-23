import * as SecureStore from 'expo-secure-store';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

import { FrentistaUser, loginFrentista } from '@/services/auth.service';

const TOKEN_KEY = 'gasofind_token';
const USER_KEY = 'gasofind_user';

type AuthState = {
  token: string | null;
  frentista: FrentistaUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [frentista, setFrentista] = useState<FrentistaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [savedToken, savedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (savedToken && savedUser) {
          setToken(savedToken);
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
      SecureStore.setItemAsync(TOKEN_KEY, response.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.frentista)),
    ]);

    setToken(response.token);
    setFrentista(response.frentista);
  }

  async function logout() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    setToken(null);
    setFrentista(null);
  }

  return (
    <AuthContext.Provider value={{ token, frentista, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
