import { BuyerProfile } from '../models/BuyerProfile';
import { User } from '../models/User';
import { TransportService } from './TransportService';
import { IBuyerMatchItem } from '../../../shared/types';

export class BuyerMatchingService {
  /**
   * Matches verified buyers for a specific commodity lot
   */
  public static async matchBuyers(
    commodityName: string,
    quantityKg: number,
    qualityGrade: string,
    farmerCoords: { lat: number; lng: number }
  ): Promise<IBuyerMatchItem[]> {
    const buyers = await BuyerProfile.find({}).populate('userId').lean();
    if (!buyers || buyers.length === 0) return [];

    const matches: IBuyerMatchItem[] = [];

    for (const b of buyers) {
      const u = b.userId as any;
      if (!u) continue;

      const preferredCrops = b.preferredCrops || [];
      const cropMatch = preferredCrops.some(
        (c: string) => c.toLowerCase() === commodityName.toLowerCase()
      );

      // Crop Score (30%)
      const cropScore = cropMatch ? 100 : 20;

      // Quantity Score (20%) - Buyers like bulk quantities between 500kg and 10000kg
      const qtyScore = Math.min(100, Math.max(50, Math.round((quantityKg / 2000) * 85)));

      // Quality Score (15%)
      const qualityScore = qualityGrade === 'Grade A' ? 100 : qualityGrade === 'Grade B' ? 80 : 60;

      // Location Proximity (15%)
      const buyerCoords = b.location?.coordinates || u.location?.coordinates || { lat: 13.55, lng: 78.5 };
      const distanceKm = TransportService.calculateHaversineDistance(
        farmerCoords.lat,
        farmerCoords.lng,
        buyerCoords.lat,
        buyerCoords.lng
      );
      const distScore = Math.max(20, Math.round((1 - distanceKm / 200) * 100));

      // Reliability Score (10%)
      const reliabilityScore = b.reliabilityScore || 90;

      // Total Match Percentage (0 - 100)
      const matchScore = Math.round(
        0.3 * cropScore +
          0.2 * qtyScore +
          0.15 * qualityScore +
          0.15 * distScore +
          0.1 * 90 +
          0.1 * reliabilityScore
      );

      const matchReasons: string[] = [];
      if (cropMatch) matchReasons.push(`✓ Active buyer requirement for ${commodityName}`);
      if (b.verificationStatus === 'VERIFIED') matchReasons.push(`✓ Verified ${b.businessType.toLowerCase()}`);
      if (qualityGrade === 'Grade A') matchReasons.push(`✓ Accepts ${qualityGrade} produce`);
      if (distanceKm <= 50) matchReasons.push(`✓ Nearby buyer (${distanceKm} km)`);
      if (b.reliabilityScore >= 90) matchReasons.push(`✓ Excellent payment reliability rating (${b.reliabilityScore}%)`);

      matches.push({
        buyerId: u._id.toString(),
        name: u.name,
        businessName: b.businessName,
        businessType: b.businessType,
        verificationStatus: b.verificationStatus,
        reliabilityScore: b.reliabilityScore,
        matchScore,
        matchReasons,
        district: b.location?.district || u.location?.district || 'Chittoor',
        distanceKm
      });
    }

    // Sort by matchScore descending
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
}
