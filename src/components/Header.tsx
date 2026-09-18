import React from 'react';
import { Building2, Database, Code2, MapPin, RefreshCw, Layers } from 'lucide-react';
import { ApiConfig } from '../types';

interface HeaderProps {
  apiConfig: ApiConfig;
  onOpenApiModal: () => void;
  onOpenDistrictModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiConfig,
  onOpenApiModal,
  onOpenDistrictModal,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Market Descriptor */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Singapore Private Property Prices
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Residential
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>URA & Realis Transaction Standard</span>
                <span className="text-slate-300">•</span>
                <span>Currency: SGD ($)</span>
                <span className="text-slate-300">•</span>
                <span>Unit: SQ FT &amp; SQ M</span>
              </p>
            </div>
          </div>

          {/* Action Hub & Connection Status */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Status indicator */}
            <div
              id="api-status-badge"
              onClick={onOpenApiModal}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                apiConfig.recordsReceived > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
              title="Click to view API integration details"
            >
              <span className="relative flex h-2 w-2">
                {apiConfig.recordsReceived > 0 ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </>
                )}
              </span>
              <span>
                {apiConfig.recordsReceived > 0
                  ? `Backend Connected (${apiConfig.recordsReceived} records)`
                  : 'Awaiting Backend Connection (0 data)'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="Refresh / Re-fetch from API endpoint"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
            </button>

            {/* District Guide Button */}
            <button
              id="btn-open-districts-guide"
              onClick={onOpenDistrictModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <span>Singapore Districts</span>
            </button>

            {/* API Integration Details Button */}
            <button
              id="btn-open-api-modal"
              onClick={onOpenApiModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <Code2 className="h-3.5 w-3.5 text-amber-400" />
              <span>API Integration Hub</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
