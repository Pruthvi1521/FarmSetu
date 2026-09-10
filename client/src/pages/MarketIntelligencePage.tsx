import React from 'react';
import { MarketIntelligenceView } from '../components/farmer/MarketIntelligenceView';
import { MarketStoryStrip } from '../components/common/MarketStoryStrip';

export const MarketIntelligencePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <MarketStoryStrip
        eyebrow="Read the season"
        title="Good decisions start with knowing the ground."
        description="Market intelligence turns field conditions, produce demand, and mandi prices into a clearer next step."
      />
      <MarketIntelligenceView />
    </div>
  );
};

export default MarketIntelligencePage;
