export type FuelType = 'gasoline' | 'ethanol' | 'diesel' | 'diesel_s10';

export const FuelTypeLabels: Record<FuelType, string> = {
  gasoline: 'Gasolina Comum',
  ethanol: 'Etanol',
  diesel: 'Diesel Comum',
  diesel_s10: 'Diesel S-10',
};

export type UpdateFuelStatusRequest = {
  stationId: string;
  fuelType: FuelType;
  price: number;
};

export type UpdateFuelStatusResponse = {
  id: string;
  stationId: string;
  frentistaId: string;
  fuelType: FuelType;
  price: number;
  reportedAt: string;
};
