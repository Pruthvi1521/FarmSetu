import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { IMarketRankingItem } from '../../../../shared/types';
import { MapPin, Navigation } from 'lucide-react';

interface MarketMapLeafletProps {
  farmerCoords: { lat: number; lng: number };
  markets: IMarketRankingItem[];
}

// Marker Icons setup
const farmerIcon = L.divIcon({
  className: 'custom-farmer-pin',
  html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);"><span style="color: #0f172a; font-weight: 900; font-size: 12px;">👨‍🌾</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const topMarketIcon = L.divIcon({
  className: 'custom-top-market-pin',
  html: `<div style="background-color: #f59e0b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);"><span style="color: #0f172a; font-weight: 900; font-size: 14px;">👑</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const standardMarketIcon = L.divIcon({
  className: 'custom-market-pin',
  html: `<div style="background-color: #0284c7; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(2, 132, 199, 0.5);"><span style="color: #ffffff; font-weight: 800; font-size: 10px;">🏛️</span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// APMC Market Coordinates mapping (matching seed data)
const marketCoordinatesMap: Record<string, { lat: number; lng: number }> = {
  'Madanapalle APMC Market': { lat: 13.5504, lng: 78.5028 },
  'Kolar APMC Market': { lat: 13.1367, lng: 78.1292 },
  'Tirupati Market Yard': { lat: 13.6288, lng: 79.4192 },
  'Bangalore APMC Market (Yeshwanthpur)': { lat: 13.0238, lng: 77.5501 },
  'Anantapur Market Yard': { lat: 14.6819, lng: 77.6006 }
};

export const MarketMapLeaflet: React.FC<MarketMapLeafletProps> = ({
  farmerCoords,
  markets
}) => {
  const centerLat = farmerCoords.lat || 13.5504;
  const centerLng = farmerCoords.lng || 78.5028;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <span>Regional APMC Markets Map</span>
          </h3>
          <p className="text-xs text-slate-400">
            Interactive OpenStreetMap visualization showing your harvest location and target APMC centers.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Your Farm</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Top Market</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span>APMC Centers</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={8}
          scrollWheelZoom={false}
          className="h-full w-full bg-slate-950"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Farmer Location Marker */}
          <Marker position={[centerLat, centerLng]} icon={farmerIcon}>
            <Popup>
              <div className="p-1 text-slate-900 text-xs">
                <strong className="font-bold block text-sm">Your Location (Farm)</strong>
                <span>Madanapalle Village, AP</span>
              </div>
            </Popup>
          </Marker>

          {/* APMC Market Markers & Connection Lines */}
          {markets.map((m, idx) => {
            const coords = marketCoordinatesMap[m.marketName] || {
              lat: centerLat + (idx === 0 ? 0.05 : idx * 0.15),
              lng: centerLng + (idx === 0 ? 0.05 : idx * 0.1)
            };

            const isTop = idx === 0;

            return (
              <React.Fragment key={m.marketId}>
                <Marker position={[coords.lat, coords.lng]} icon={isTop ? topMarketIcon : standardMarketIcon}>
                  <Popup>
                    <div className="p-1 text-slate-900 text-xs space-y-1">
                      <strong className="font-bold text-sm block">
                        {isTop ? '👑 ' : ''}{m.marketName}
                      </strong>
                      <div>District: <strong>{m.district}</strong></div>
                      <div>Distance: <strong>{m.distanceKm} km</strong></div>
                      <div>Forecast Price: <strong>₹{m.expectedPricePerKg}/kg</strong></div>
                      <div>Expected Net Revenue: <strong className="text-emerald-700">₹{m.expectedNetRevenue.toLocaleString()}</strong></div>
                    </div>
                  </Popup>
                </Marker>

                {/* Polyline connect from farmer to top market */}
                {isTop && (
                  <Polyline
                    positions={[
                      [centerLat, centerLng],
                      [coords.lat, coords.lng]
                    ]}
                    pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '6, 8' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
