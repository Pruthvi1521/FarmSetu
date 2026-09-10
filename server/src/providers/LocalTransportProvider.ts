import { ITransportEstimate, BookingVehicleType, VEHICLE_LABELS } from '../../../shared/types';
import { ITransportProvider, IVehicleRecommendation } from './ITransportProvider';
import { TransportService } from '../services/TransportService';

/**
 * LocalTransportProvider — active transport provider.
 *
 * All cost/tier logic lives exclusively in TransportService.
 * This class adds the vehicle-type-enum mapping without duplicating any calculations.
 *
 * To swap in a real logistics API, implement ITransportProvider in a new class
 * and change the export at the bottom of this file.
 */
export class LocalTransportProvider implements ITransportProvider {
  /**
   * Delegates entirely to TransportService.estimateTransport.
   * Returns verbose vehicleType strings for ITransportEstimate API compatibility.
   */
  estimateTransport(
    farmerCoords: { lat: number; lng: number },
    destinationCoords: { lat: number; lng: number },
    quantityKg: number
  ): ITransportEstimate {
    return TransportService.estimateTransport(farmerCoords, destinationCoords, quantityKg);
  }

  /**
   * Maps quantityKg to the short BookingVehicleType enum.
   * Thresholds mirror TransportService exactly — TransportService remains the
   * single source of truth; this mapping is purely for the persisted enum value.
   */
  recommendVehicle(quantityKg: number): IVehicleRecommendation {
    let vehicleType: BookingVehicleType;
    let reason: string;

    if (quantityKg <= 1500) {
      vehicleType = 'TRACTOR';
      reason = 'Tractor is suitable for quantities up to 1,500 kg';
    } else if (quantityKg <= 3500) {
      vehicleType = 'SMALL_TRUCK';
      reason = 'Small truck is suitable for quantities between 1,500 kg and 3,500 kg';
    } else {
      vehicleType = 'MEDIUM_TRUCK';
      reason = 'Medium truck required for quantities exceeding 3,500 kg';
    }

    return {
      vehicleType,
      vehicleLabel: VEHICLE_LABELS[vehicleType],
      reason
    };
  }
}

/** Singleton instance — swap class here to change the active provider */
export const transportProvider = new LocalTransportProvider();
