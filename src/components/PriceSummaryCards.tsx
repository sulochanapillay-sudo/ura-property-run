import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Building, ShieldAlert } from 'lucide-react';
import { PropertyStatistics } from '../types';

interface PriceSummaryCardsProps {
  stats: PropertyStatistics;
  recordCount: number;
  onOpenApiModal: () => void;
}

export const PriceSummaryCards: React.FC<PriceSummaryCardsProps> = ({
  stats,
  recordCount,
  onOpenApiModal,
}) => {
  const isLoaded = recordCount > 0;

  const formatSGD = (val: number) => {
    if (!val) return '--';
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    if (!val) return '--';
    return new Intl.NumberFormat('en-SG').format(val);
  };

  return (
    <div className="space-y-3">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Median Price */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Median Price
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLoaded ? formatSGD(stats.medianPrice) : '-- SGD'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isLoaded
                ? `Avg: ${formatSGD(stats.averagePrice)}`
                : 'Awaiting backend data connection'}
            </p>
          </div>
        </div>

        {/* Card 2: Median PSF */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Median PSF ($ / sqft)
            </span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLoaded ? `$${formatNumber(stats.medianPsf)} PSF` : '-- PSF'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isLoaded
                ? `Avg: $${formatNumber(stats.averagePsf)} PSF`
                : 'Unit price per square foot'}
            </p>
          </div>
        </div>

        {/* Card 3: Total Transactions Recorded */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Transactions Stated
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLoaded ? formatNumber(stats.totalTransactions) : '0 Records'}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {isLoaded ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-amber-700 font-medium">CCR: {stats.byRegion.CCR}</span>
                  <span>•</span>
                  <span className="text-blue-700 font-medium">RCR: {stats.byRegion.RCR}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">OCR: {stats.byRegion.OCR}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Database empty by request</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: PSF Range or Placeholder Ingestion Guide */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PSF High / Low Span
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {isLoaded
                ? `$${formatNumber(stats.lowestPsf)} - $${formatNumber(stats.highestPsf)}`
                : '-- to --'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isLoaded ? 'Islandwide transacted range' : 'Ready for backend API payload'}
            </p>
          </div>
        </div>
      </div>

      {/* Notice Banner when database is empty (as requested) */}
      {!isLoaded && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Zero-Data State Active:</strong> No property transactions are loaded in the
              database yet. The API integration placeholders and query system are ready for your backend connection.
            </span>
          </div>
          <button
            onClick={onOpenApiModal}
            className="self-start sm:self-auto shrink-0 px-2.5 py-1 bg-amber-900 text-white hover:bg-amber-800 rounded-md font-medium transition-colors"
          >
            Configure &amp; View Schema
          </button>
        </div>
      )}
    </div>
  );
};
