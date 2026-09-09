export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';
export type BusinessType = 'WHOLESALER' | 'RETAILER' | 'PROCESSOR' | 'RESTAURANT' | 'INSTITUTION';
export type VerificationStatus = 'VERIFIED' | 'PENDING';
export type CommodityCategory = 'VEGETABLE' | 'GRAIN' | 'PULSE' | 'FRUIT';
export type DataType = 'OPEN_DATA' | 'DEMO_DATA';
export type LotStatus = 'ACTIVE' | 'OFFERS_RECEIVED' | 'SOLD' | 'CANCELLED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type TransactionStatus = 'OFFER_ACCEPTED' | 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';
export type TransportTerms = 'BUYER_PICKUP' | 'FARMER_DELIVERY';
export type DemandLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionRecommendation = 'SELL_NOW' | 'WAIT' | 'FIND_BUYER_NOW';

export interface ILocation {
  village?: string;
  city?: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  location: ILocation;
  createdAt?: string;
}

export interface IFarmerProfile {
  _id?: string;
  userId: string;
  farmSizeAcres: number;
  preferredLanguage: string;
  bankAccountVerified: boolean;
}

export interface IBuyerProfile {
  _id?: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  verificationStatus: VerificationStatus;
  reliabilityScore: number; // 0 - 100
  preferredCrops: string[];
  location: ILocation;
}

export interface ICommodity {
  _id: string;
  name: string;
  category: CommodityCategory;
  unit: string; // 'kg', 'quintal', 'tonne'
  shelfLifeDays: number;
  grades: string[]; // e.g. ['Grade A', 'Grade B', 'Grade C']
  icon?: string;
}

export interface IMarket {
  _id: string;
  name: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operatingDays: string[];
  apmcFeePercent: number;
}

export interface IMarketPrice {
  _id: string;
  marketId: string;
  marketName?: string;
  commodityId: string;
  commodityName?: string;
  date: string;
  minPrice: number; // ₹/kg
  maxPrice: number; // ₹/kg
  modalPrice: number; // ₹/kg
  dataType: DataType;
  source: string;
}

export interface IMarketArrival {
  _id: string;
  marketId: string;
  commodityId: string;
  date: string;
  arrivalQuantityTonnes: number;
  dataType: DataType;
}

export interface IDemandRecord {
  _id: string;
  district: string;
  commodityId: string;
  demandLevel: DemandLevel;
  buyerCount: number;
  avgBuyerPrice: number;
  dataType: DataType;
}

export interface IWeatherRecord {
  _id: string;
  district: string;
  date: string;
  tempC: number;
  rainfallMm: number;
  condition: string; // 'Sunny', 'Rainy', 'Cloudy'
  alert?: string;
}

export interface ISaleLot {
  _id: string;
  farmerId: string | IUser;
  commodityId: string | ICommodity;
  commodityName: string;
  quantityKg: number;
  harvestDate: string;
  availableDays: number;
  qualityGrade: string; // 'Grade A' | 'Grade B' | 'Grade C'
  askingPricePerKg?: number;
  expectedNetRevenue?: number;
  recommendedMarketId?: string;
  recommendedMarketName?: string;
  status: LotStatus;
  createdAt: string;
  offersCount?: number;
}

export interface IOffer {
  _id: string;
  lotId: string | ISaleLot;
  buyerId: string | IUser;
  buyerName?: string;
  buyerBusinessName?: string;
  buyerVerificationStatus?: VerificationStatus;
  buyerReliabilityScore?: number;
  pricePerKg: number;
  totalValue: number;
  transportationTerms: TransportTerms;
  paymentTerms: string;
  validUntil: string;
  status: OfferStatus;
  createdAt: string;
}

export interface ITransactionTimelineStep {
  status: TransactionStatus;
  timestamp: string;
  note: string;
}

export interface ITransaction {
  _id: string;
  lotId: string | ISaleLot;
  acceptedOfferId: string | IOffer;
  farmerId: string | IUser;
  buyerId: string | IUser;
  commodityName: string;
  quantityKg: number;
  agreedPricePerKg: number;
  totalAmount: number;
  transportationTerms: TransportTerms;
  status: TransactionStatus;
  timeline: ITransactionTimelineStep[];
  createdAt: string;
}

export interface ITransportEstimate {
  distanceKm: number;
  vehicleType: 'Small Truck (1-3 Tonnes)' | 'Medium Truck (3-8 Tonnes)' | 'Tractor (1-2 Tonnes)';
  ratePerKm: number;
  estimatedCost: number;
}

// Input parsing & recommendation DTOs
export interface IInputParseResult {
  commodity: string;
  commodityId?: string;
  quantityKg: number;
  availabilityDays: number;
  originalText: string;
  confidence: number;
}

export interface IPriceForecast {
  currentModalPrice: number;
  forecastDate: string;
  forecastedPrice: number;
  expectedMin: number;
  expectedMax: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  confidenceScore: number; // 0 - 100
  historicalPrices: { date: string; price: number }[];
}

export interface IMarketRankingItem {
  marketId: string;
  marketName: string;
  district: string;
  distanceKm: number;
  expectedPricePerKg: number;
  transportCost: number;
  apmcFee: number;
  expectedNetRevenue: number;
  recommendationScore: number; // 0 - 100
  demandLevel: DemandLevel;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  explanations: string[];
}

export interface IBuyerMatchItem {
  buyerId: string;
  name: string;
  businessName: string;
  businessType: BusinessType;
  verificationStatus: VerificationStatus;
  reliabilityScore: number;
  matchScore: number; // 0 - 100
  matchReasons: string[];
  district: string;
  distanceKm: number;
}

export interface IMarketRecommendationResult {
  parsedInput: IInputParseResult;
  currentPrice: number;
  forecast: IPriceForecast;
  actionRecommendation: {
    action: ActionRecommendation;
    title: string;
    rationale: string;
    targetDays: number;
  };
  rankedMarkets: IMarketRankingItem[];
  topMarket: IMarketRankingItem;
  matchedBuyers: IBuyerMatchItem[];
  transportEstimate: ITransportEstimate;
}

export interface IFarmerAnalytics {
  totalRevenue: number;
  totalSalesCount: number;
  totalQuantitySoldKg: number;
  averagePricePerKg: number;
  topCropSold: string;
  totalTransportCostPaid: number;
  bestPriceRealizedPerKg: number;
  monthlyRevenue: { month: string; revenue: number; count: number }[];
  salesByCrop: { crop: string; amount: number; quantityKg: number }[];
}

export interface IBuyerAnalytics {
  totalSpend: number;
  totalPurchasesCount: number;
  totalQuantityPurchasedKg: number;
  averagePurchasePricePerKg: number;
  topCommodityBought: string;
  monthlySpend: { month: string; spend: number; count: number }[];
  purchasesByCrop: { crop: string; spend: number; quantityKg: number }[];
}

export type NotificationType =
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'LOT_SOLD'
  | 'TRANSACTION_UPDATED'
  | 'PRICE_ALERT';

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IMarketSummary {
  topCommodities: { name: string; avgPrice: number; trend: string }[];
  totalActiveLotsCount: number;
  totalMarketplaceValue: number;
}
