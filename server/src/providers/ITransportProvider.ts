import { ITransportEstimate, BookingVehicleType } from '../../../shared/types';

export interface IVehicleRecommendation {
  vehicleType: BookingVehicleType;
  vehicleLabel: string;
  reason: string;
}

/**
 * Provider interface for transport logistics.
 * Current implementation: LocalTransportProvider (uses TransportService).
 * Future implementation: ExternalLogisticsProvider (real API).
 */
export interface ITransportProvider {
  /**
   * Calculates transport estimate between two coordinate points for a given quantity.
   * Returns distance, vehicle type (verbose, for ITransportEstimate compatibility),
   * rate per km, and estimated cost.
   */
  estimateTransport(
    farmerCoords: { lat: number; lng: number },
    destinationCoords: { lat: number; lng: number },
    quantityKg: number
  ): ITransportEstimate;

  /**
   * Recommends a vehicle type based purely on quantity.
   * Returns the short enum value for DB storage and a human-readable label.
   */
  recommendVehicle(quantityKg: number): IVehicleRecommendation;
}
