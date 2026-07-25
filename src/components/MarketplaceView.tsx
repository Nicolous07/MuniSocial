import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { MarketplaceItem, UserProfile } from '../types';

interface MarketplaceViewProps {
  items: MarketplaceItem[];
  user: UserProfile;
  isDarkMode: boolean;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  user,
  isDarkMode
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [boughtItem, setBoughtItem] = useState<MarketplaceItem | null>(null);

  const filteredItems = items.filter(i => {
    const matchesCat = selectedCategory === 'all' || i.category === selectedCategory;
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl">MuniMarketplace</h1>
            <p className="text-xs text-slate-400">Digital courses, 3D LUTs, hardware, and instant downloads</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
          {['all', 'courses', 'digital', 'electronics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:border-indigo-500/50 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-400 border border-slate-700">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono">
                  <span>{item.category}</span>
                  <span className="text-indigo-400 font-bold">{item.condition}</span>
                </div>

                <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                <div className="pt-2 flex items-center gap-2 text-xs">
                  <img src={item.seller.avatar} alt={item.seller.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-bold text-slate-300 text-[11px]">{item.seller.name}</span>
                  <div className="ml-auto flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                    <Star className="w-3 h-3 fill-amber-400" /> {item.seller.rating}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setBoughtItem(item)}
                className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Now (${item.price.toFixed(2)})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instant Checkout Simulator Modal */}
      {boughtItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Instant Purchase Confirmed!
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img src={boughtItem.image} alt="Bought" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-xs">{boughtItem.title}</h4>
                <p className="text-[10px] text-slate-400">${boughtItem.price.toFixed(2)} USD • {boughtItem.condition}</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Your order has been recorded securely on Municryptrix marketplace Ledger. Digital access links have been dispatched to your profile.
            </p>
            <button
              onClick={() => setBoughtItem(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Close & Download
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
