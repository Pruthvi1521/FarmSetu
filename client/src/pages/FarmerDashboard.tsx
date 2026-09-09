import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FarmerNavigation } from '../components/farmer/FarmerNavigation';
import { QuickInputSection } from '../components/farmer/QuickInputSection';
import { RecommendationSummary } from '../components/farmer/RecommendationSummary';
import { MarketRankingList } from '../components/farmer/MarketRankingList';
import { MarketComparisonTable } from '../components/farmer/MarketComparisonTable';
import { MarketMapLeaflet } from '../components/farmer/MarketMapLeaflet';
import { BuyerMatchList } from '../components/farmer/BuyerMatchList';
import { CreateLotModal } from '../components/farmer/CreateLotModal';
import { SaleLotList } from '../components/farmer/SaleLotList';
import { OffersView } from '../components/farmer/OffersView';
import { TransactionTracker } from '../components/farmer/TransactionTracker';
import { FarmerAnalyticsView } from '../components/farmer/FarmerAnalyticsView';
import { FarmerProfileView } from '../components/farmer/FarmerProfileView';
import { MarketIntelligenceView } from '../components/farmer/MarketIntelligenceView';

import { marketApi } from '../services/api';
import {
  IMarketRecommendationResult,
  IMarketRankingItem,
  ISaleLot
} from '../../../shared/types';
import { CheckCircle2, TrendingUp } from 'lucide-react';

export const FarmerDashboardPage: React.FC = () => {
  const [recommendationResult, setRecommendationResult] = useState<IMarketRecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showCreateLotModal, setShowCreateLotModal] = useState(false);
  const [selectedMarketForLot, setSelectedMarketForLot] = useState<IMarketRankingItem | undefined>(undefined);
  const [createdLotSuccess, setCreatedLotSuccess] = useState<ISaleLot | null>(null);

  const navigate = useNavigate();

  const handleQuerySubmit = async (queryText: string) => {
    setIsLoading(true);
    setError(null);
    setCreatedLotSuccess(null);

    try {
      const result = await marketApi.getMarketRecommendation({ queryText });
      setRecommendationResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMarketForLot = (market: IMarketRankingItem) => {
    setSelectedMarketForLot(market);
    setShowCreateLotModal(true);
  };

  const handleLotCreatedSuccess = (newLot: ISaleLot) => {
    setShowCreateLotModal(false);
    setCreatedLotSuccess(newLot);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <FarmerNavigation />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Routes>
          {/* 1. Main Dashboard View */}
          <Route
            path="/"
            element={
              <div className="space-y-8">
                {/* Prominent Quick Input */}
                <QuickInputSection
                  onSubmit={handleQuerySubmit}
                  isLoading={isLoading}
                  error={error}
                />

                {createdLotSuccess && (
                  <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-emerald-300">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold">Sale Lot #{createdLotSuccess._id.slice(-6)} Published!</h4>
                        <p className="text-xs text-slate-300">
                          {createdLotSuccess.commodityName} ({createdLotSuccess.quantityKg} kg) listed at ₹{createdLotSuccess.askingPricePerKg}/kg.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/farmer/lots')}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors"
                    >
                      View My Lots
                    </button>
                  </div>
                )}

                {/* Recommendation Results Display */}
                {recommendationResult && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Summary Cards & Guidance */}
                    <RecommendationSummary
                      data={recommendationResult}
                      onCreateLotClick={() => handleSelectMarketForLot(recommendationResult.topMarket)}
                    />

                    {/* Ranked APMC Markets List */}
                    <MarketRankingList
                      markets={recommendationResult.rankedMarkets}
                      onSelectMarket={handleSelectMarketForLot}
                      onCompareClick={() => setShowComparisonModal(true)}
                    />

                    {/* OpenStreetMap Regional APMC Map */}
                    <MarketMapLeaflet
                      farmerCoords={{ lat: 13.5504, lng: 78.5028 }}
                      markets={recommendationResult.rankedMarkets}
                    />

                    {/* Matched Verified Buyers */}
                    <BuyerMatchList
                      buyers={recommendationResult.matchedBuyers}
                      onCreateLotClick={() => handleSelectMarketForLot(recommendationResult.topMarket)}
                    />
                  </div>
                )}
              </div>
            }
          />

          {/* 2. Market Intelligence View */}
          <Route
            path="/intelligence"
            element={<MarketIntelligenceView />}
          />

          {/* 3. My Sale Lots */}
          <Route
            path="/lots"
            element={<SaleLotList onSelectLotForOffers={(lotId) => navigate(`/farmer/offers?lotId=${lotId}`)} />}
          />

          {/* 4. Offers */}
          <Route path="/offers" element={<OffersView onOfferAccepted={() => navigate('/farmer/transactions')} />} />

          {/* 5. Transactions */}
          <Route path="/transactions" element={<TransactionTracker />} />

          {/* 6. Analytics */}
          <Route path="/analytics" element={<FarmerAnalyticsView />} />

          {/* 7. Profile */}
          <Route path="/profile" element={<FarmerProfileView />} />
        </Routes>

        {/* Side-by-Side Comparison Modal */}
        {showComparisonModal && recommendationResult && (
          <MarketComparisonTable
            markets={recommendationResult.rankedMarkets}
            onClose={() => setShowComparisonModal(false)}
            onSelectMarket={handleSelectMarketForLot}
          />
        )}

        {/* Sale Lot Creation Modal */}
        {showCreateLotModal && (
          <CreateLotModal
            parsedInput={recommendationResult?.parsedInput}
            selectedMarket={selectedMarketForLot || recommendationResult?.topMarket}
            forecastPrice={recommendationResult?.forecast.forecastedPrice}
            onClose={() => setShowCreateLotModal(false)}
            onSuccess={handleLotCreatedSuccess}
          />
        )}
      </div>
    </div>
  );
};

export const FarmerDashboard = FarmerDashboardPage;
export default FarmerDashboardPage;
