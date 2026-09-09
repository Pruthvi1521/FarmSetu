import React from 'react';
import { MarketIntelligenceView } from '../components/farmer/MarketIntelligenceView';

export const MarketIntelligencePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MarketIntelligenceView />
    </div>
  );
};

export default MarketIntelligencePage;
