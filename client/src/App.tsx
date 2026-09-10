import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { MarketIntelligencePage } from './pages/MarketIntelligencePage';
import { AdminDashboard } from './pages/AdminDashboard';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-shell min-h-screen flex flex-col bg-slate-950 text-slate-100">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/farmer/*" element={<FarmerDashboard />} />
                <Route path="/buyer/*" element={<BuyerDashboard />} />
                <Route path="/intelligence" element={<MarketIntelligencePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
              <p>FarmSetu SIH 2026 PS132 Prototype • Strengthening Market Linkages for Farmers</p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
