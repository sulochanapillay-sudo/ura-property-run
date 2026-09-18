import React, { useState } from 'react';
import { X, MapPin, Building, Info, Check } from 'lucide-react';
import { SINGAPORE_DISTRICTS, REGION_DESCRIPTIONS } from '../constants/singaporeDistricts';
import { MarketSegment } from '../types';

interface DistrictGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistrict?: (code: string) => void;
}

export const DistrictGuideModal: React.FC<DistrictGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectDistrict,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredDistricts =
    selectedRegion === 'ALL'
      ? SINGAPORE_DISTRICTS
      : SINGAPORE_DISTRICTS.filter((d) => d.region === selectedRegion);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Singapore Postal Districts &amp; Market Segments</h2>
              <p className="text-xs text-slate-300">
                Official URA classification for private residential property pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Region Explanation Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(REGION_DESCRIPTIONS).map(([key, reg]) => (
            <div
              key={key}
              onClick={() => setSelectedRegion(selectedRegion === key ? 'ALL' : key)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedRegion === key
                  ? 'bg-white border-slate-800 shadow-xs ring-1 ring-slate-800'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{reg.label}</span>
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  {reg.full}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                {reg.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Filter Region:</span>
            {['ALL', 'CCR', 'RCR', 'OCR'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  selectedRegion === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All (D01 - D28)' : r}
              </button>
            ))}
          </div>
          <span className="text-slate-400 text-xs">
            Showing {filteredDistricts.length} districts
          </span>
        </div>

        {/* Districts Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {filteredDistricts.map((district) => (
            <div
              key={district.code}
              onClick={() => {
                if (onSelectDistrict) {
                  onSelectDistrict(district.code);
                  onClose();
                }
              }}
              className="p-3 bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs rounded-xl cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{district.code}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      district.region === 'CCR'
                        ? 'bg-amber-100 text-amber-900'
                        : district.region === 'RCR'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {district.region}
                  </span>
                </div>
                <p className="text-slate-700 font-medium leading-snug">{district.name}</p>
              </div>
              <div className="mt-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                Postal Sectors: {district.postalSectors.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Click any district card to apply it to the transaction query filter
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
