import { ITransportEstimate } from '../../../shared/types';

export class TransportService {
  /**
   * Calculates Haversine distance between two lat/lng points in Kilometers
   */
  public static calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    return Math.round(distanceKm * 10) / 10;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculates transportation cost estimate based on quantity and distance
   */
  public static estimateTransport(
    farmerCoords: { lat: number; lng: number },
    destinationCoords: { lat: number; lng: number },
    quantityKg: number
  ): ITransportEstimate {
    const distanceKm = Math.max(
      5,
      this.calculateHaversineDistance(
        farmerCoords.lat,
        farmerCoords.lng,
        destinationCoords.lat,
        destinationCoords.lng
      )
    );

    let vehicleType: 'Small Truck (1-3 Tonnes)' | 'Medium Truck (3-8 Tonnes)' | 'Tractor (1-2 Tonnes)' =
      'Small Truck (1-3 Tonnes)';
    let ratePerKm = 25;

    if (quantityKg <= 1500) {
      vehicleType = 'Tractor (1-2 Tonnes)';
      ratePerKm = 20;
    } else if (quantityKg <= 3500) {
      vehicleType = 'Small Truck (1-3 Tonnes)';
      ratePerKm = 25;
    } else {
      vehicleType = 'Medium Truck (3-8 Tonnes)';
      ratePerKm = 38;
    }

    const calculatedCost = Math.round(distanceKm * ratePerKm);
    const estimatedCost = Math.max(800, calculatedCost);

    return {
      distanceKm,
      vehicleType,
      ratePerKm,
      estimatedCost
    };
  }
}
