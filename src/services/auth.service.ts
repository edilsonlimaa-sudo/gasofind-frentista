import { apiRequest } from './api';

export type FrentistaUser = {
  id: string;
  name: string;
  email: string;
  stationId: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  frentista: FrentistaUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  frentista: FrentistaUser;
};

export async function loginFrentista(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/frentista/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponse> {
  return apiRequest<RefreshResponse>('/auth/frentista/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function logoutFrentista(refreshToken: string): Promise<void> {
  await apiRequest<void>('/auth/frentista/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}
