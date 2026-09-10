import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingBag, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { FarmerStoryScroll } from '../components/common/FarmerStoryScroll';

export const HomePage: React.FC = () => {
  const { loginDemo } = useAuth();

  return (
    <div className="landing-editorial min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between [overflow-x:clip]">
      {/* Hero Section */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-12 text-center lg:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sprout className="w-4 h-4" />
              <span>Smart AgMarknet & APMC Price Discovery</span>
            </div>

            <h1 className="landing-heading text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Smarter Market Linkages for <span>Indian Farmers</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              FarmSetu connects farmers directly to peak APMC markets, reliable price forecasts, transport logistics, and verified bulk buyers — maximizing farmgate returns with full transparency.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/farmer"
                onClick={() => loginDemo('FARMER')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-lg flex items-center justify-center space-x-3 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Sprout className="w-6 h-6" />
                <span>Launch Farmer Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/buyer"
                onClick={() => loginDemo('BUYER')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-lg flex items-center justify-center space-x-3 transition-all"
              >
                <ShoppingBag className="w-6 h-6" />
                <span>Buyer Marketplace</span>
              </Link>
            </div>
          </div>

          <div className="relative hidden sm:block">
            <div className="absolute -inset-3 rounded-[2rem] bg-emerald-500/15 rotate-3" />
            <div className="relative overflow-hidden rounded-[2rem] border-8 border-white/80 shadow-2xl shadow-emerald-950/20 bg-emerald-900">
              <img
                src="https://images.pexels.com/photos/20445206/pexels-photo-20445206.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="Happy Indian farmers harvesting leafy crops together"
                className="h-[360px] w-full object-cover"
                loading="eager"
              />
              <div className="image-overlay-text absolute bottom-4 left-4 right-4 rounded-2xl bg-[#203b2b]/90 px-4 py-3 text-left text-white backdrop-blur-sm">
                <p className="text-sm font-bold">Raised here. Sold with care.</p>
                <p className="text-xs text-emerald-100/80 mt-1">A clearer path for every harvest.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Story Strip */}
        <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto lg:mx-0">
          {[
            ['https://images.unsplash.com/photo-1632776350300-11016768b521?auto=format&fit=crop&w=600&q=80', 'Fresh greens'],
            ['https://images.unsplash.com/photo-1485637701894-09ad422f6de6?auto=format&fit=crop&w=600&q=80', 'Market ready'],
            ['https://images.unsplash.com/photo-1596650499077-17bc92afd85f?auto=format&fit=crop&w=600&q=80', 'Better prices']
          ].map(([src, label]) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl border border-white/30 shadow-md bg-emerald-900">
              <img
                src={src}
                alt={label}
                className="h-24 sm:h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="image-overlay-text absolute bottom-2 left-2 rounded-full bg-[#203b2b]/85 px-2.5 py-1 text-[11px] font-bold text-white">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <section className="pt-4" aria-labelledby="farmer-story-heading">
          <div className="flex items-end justify-between gap-4 mb-4 text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-500">A farmer's journey</p>
              <h2 id="farmer-story-heading" className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                Every harvest deserves a fair chance.
              </h2>
            </div>
            <Sprout className="hidden sm:block h-8 w-8 text-emerald-500" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {[
              { src: 'https://images.pexels.com/photos/20445206/pexels-photo-20445206.jpeg?auto=compress&cs=tinysrgb&w=900', title: '01 - Grow', text: 'Care, patience, and early mornings.' },
              { src: 'https://images.pexels.com/photos/20445203/pexels-photo-20445203.jpeg?auto=compress&cs=tinysrgb&w=900', title: '02 - Harvest', text: 'The day your hard work becomes produce.' },
              { src: 'https://images.unsplash.com/photo-1632776350300-11016768b521?auto=format&fit=crop&w=900&q=80', title: '03 - Prepare', text: 'Fresh greens ready for the journey.' },
              { src: 'https://images.unsplash.com/photo-1485637701894-09ad422f6de6?auto=format&fit=crop&w=900&q=80', title: '04 - Reach', text: 'A better market, a better return home.' }
            ].map((item) => (
              <article key={item.title} className="image-story-card group relative min-h-[210px] overflow-hidden rounded-2xl border border-white/30 bg-emerald-950 shadow-md">
                <img
                  src={item.src}
                  alt={item.text}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142b20] via-[#142b20]/35 to-transparent" />
                <div className="relative flex h-full min-h-[210px] flex-col justify-end p-3 text-white">
                  <div className="rounded-xl bg-[#142b20]/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
                    <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-emerald-200">{item.title}</p>
                    <p className="mt-1 text-sm font-semibold leading-snug">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Scroll Story Component */}
        <FarmerStoryScroll />

        {/* Feature Highlights Grid */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/60 space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Open Mandi Data Engine</h3>
            <p className="text-sm text-slate-400">
              Seeded from real Open Mandi government datasets with deterministic WMA + Holt forecasting algorithms.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-700/60 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Competitive Bidding</h3>
            <p className="text-sm text-slate-400">
              Bulk buyers submit competitive offers. Compare prices, delivery terms, and buyer reliability ratings.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-700/60 space-y-3 hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">End-to-End Tracking</h3>
            <p className="text-sm text-slate-400">
              Track transactions live from offer acceptance to pickup, transit, delivery, and payment completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
