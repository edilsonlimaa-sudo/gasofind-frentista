import { apiRequest } from './api';

export type FrentistaUser = {
  id: string;
  name: string;
  email: string;
  stationId: string;
};

export type LoginResponse = {
  token: string;
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
