import type {
    UpdateFuelStatusRequest,
    UpdateFuelStatusResponse,
} from '@/types/station';
import { apiRequest } from './api';

export async function updateFuelStatus(
  payload: UpdateFuelStatusRequest,
): Promise<UpdateFuelStatusResponse> {
  return apiRequest<UpdateFuelStatusResponse>('/stations/fuel-status', {
    method: 'POST',
    body: payload,
  });
}
