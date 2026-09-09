import {
  ICommodity,
  IMarketRecommendationResult,
  ISaleLot,
  IOffer,
  ITransaction,
  IFarmerAnalytics,
  IBuyerAnalytics,
  INotification,
  IMarketSummary
} from '../../../shared/types';

const API_BASE_URL = '/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('farmsetu_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred during request execution.');
  }

  return data as T;
}

export const marketApi = {
  getCommodities: () => apiFetch<ICommodity[]>('/market-intelligence/commodities'),

  getMarketRecommendation: (body: {
    queryText?: string;
    commodityId?: string;
    quantityKg?: number;
    availabilityDays?: number;
    farmerLocation?: { coordinates: { lat: number; lng: number } };
  }) =>
    apiFetch<IMarketRecommendationResult>('/market-intelligence/recommend', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getPriceHistory: (commodityId: string, marketId: string, days: number = 30) =>
    apiFetch<any[]>(`/market-intelligence/prices/history?commodityId=${commodityId}&marketId=${marketId}&days=${days}`),

  getCurrentPrices: (commodityId?: string) =>
    apiFetch<any[]>(`/market-intelligence/prices/current${commodityId ? `?commodityId=${commodityId}` : ''}`)
};

export const lotApi = {
  createLot: async (lotData: {
    commodityId?: string;
    commodityName: string;
    quantityKg: number;
    harvestDate: string;
    availableDays: number;
    qualityGrade: string;
    askingPricePerKg?: number;
    expectedNetRevenue?: number;
    recommendedMarketId?: string;
    recommendedMarketName?: string;
  }) => {
    const res = await apiFetch<{ message: string; lot: ISaleLot }>('/lots', {
      method: 'POST',
      body: JSON.stringify(lotData)
    });
    return res.lot || (res as unknown as ISaleLot);
  },

  getFarmerLots: () => apiFetch<ISaleLot[]>('/lots'),

  getMarketplaceLots: (crop?: string, status?: string) => {
    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (status) params.append('status', status);
    const queryString = params.toString();
    return apiFetch<ISaleLot[]>(`/lots${queryString ? `?${queryString}` : ''}`);
  },

  getLotById: (id: string) => apiFetch<{ lot: ISaleLot; offers: IOffer[] }>(`/lots/${id}`),

  getOffersForLot: (lotId: string) => apiFetch<IOffer[]>(`/lots/${lotId}/offers`),

  submitOffer: async (lotId: string, offerData: {
    pricePerKg: number;
    transportationTerms?: string;
    paymentTerms?: string;
    validDays?: number;
  }) => {
    const res = await apiFetch<{ message: string; offer: IOffer }>(`/lots/${lotId}/offers`, {
      method: 'POST',
      body: JSON.stringify(offerData)
    });
    return res.offer || (res as unknown as IOffer);
  },

  acceptOffer: async (offerId: string) => {
    const res = await apiFetch<{ message: string; transaction: ITransaction }>(`/lots/offers/${offerId}/accept`, {
      method: 'POST'
    });
    return res.transaction || (res as unknown as ITransaction);
  }
};

export const transactionApi = {
  getTransactions: () => apiFetch<ITransaction[]>('/transactions'),

  getTransactionById: (id: string) => apiFetch<ITransaction>(`/transactions/${id}`),

  updateStatus: async (id: string, status: string, note?: string) => {
    const res = await apiFetch<{ message: string; transaction: ITransaction }>(`/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
    return res.transaction || (res as unknown as ITransaction);
  }
};

export const analyticsApi = {
  getFarmerAnalytics: () => apiFetch<IFarmerAnalytics>('/analytics/farmer-summary'),
  getBuyerAnalytics: () => apiFetch<IBuyerAnalytics>('/analytics/buyer-summary'),
  getMarketSummary: () => apiFetch<IMarketSummary>('/analytics/market-summary'),
  getCommodityPriceTrend: (commodityId: string, days: number = 30) =>
    apiFetch<{ date: string; avgModalPrice: number; avgMinPrice: number; avgMaxPrice: number; marketCount: number }[]>(
      `/analytics/price-trend?commodityId=${commodityId}&days=${days}`
    )
};

export const notificationApi = {
  getAll: () => apiFetch<INotification[]>('/notifications'),
  getUnreadCount: () => apiFetch<{ count: number }>('/notifications/unread-count'),
  markOneRead: (id: string) => apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch<{ message: string }>('/notifications/read-all', { method: 'PATCH' })
};
