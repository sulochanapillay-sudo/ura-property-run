import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PriceSummaryCards } from './components/PriceSummaryCards';
import { FilterBar } from './components/FilterBar';
import { PropertyTable } from './components/PropertyTable';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { DistrictGuideModal } from './components/DistrictGuideModal';
import {
  SingaporeProperty,
  PropertyFilters,
  PropertyStatistics,
  ApiConfig,
} from './types';
import {
  fetchProperties,
  fetchPropertyStats,
  pingBackend,
  ingestProperties,
  resetBackendData,
  SAMPLE_VERIFICATION_PAYLOAD,
} from './services/propertyApi';

const DEFAULT_FILTERS: PropertyFilters = {
  query: '',
  district: 'ALL',
  marketSegment: 'ALL',
  propertyType: 'ALL',
  tenure: 'ALL',
  saleType: 'ALL',
  minPrice: null,
  maxPrice: null,
  minPsf: null,
  maxPsf: null,
  sortBy: 'contractDate',
  sortOrder: 'desc',
};

const DEFAULT_STATS: PropertyStatistics = {
  totalTransactions: 0,
  medianPrice: 0,
  averagePrice: 0,
  medianPsf: 0,
  averagePsf: 0,
  highestPsf: 0,
  lowestPsf: 0,
  byRegion: { CCR: 0, RCR: 0, OCR: 0 },
  byPropertyType: {},
};

export default function App() {
  const [properties, setProperties] = useState<SingaporeProperty[]>([]);
  const [stats, setStats] = useState<PropertyStatistics>(DEFAULT_STATS);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState<boolean>(false);

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    endpointUrl: '/api/properties',
    backendConnected: false,
    status: 'awaiting_data',
    lastPingTime: null,
    errorMessage: null,
    recordsReceived: 0,
  });

  // Load properties and calculated stats from the API endpoint
  const loadData = useCallback(async (currentFilters: PropertyFilters) => {
    setIsLoading(true);
    try {
      const [propRes, statRes] = await Promise.all([
        fetchProperties(currentFilters),
        fetchPropertyStats(currentFilters),
      ]);

      if (propRes.success && Array.isArray(propRes.data)) {
        setProperties(propRes.data);
        setApiConfig((prev) => ({
          ...prev,
          backendConnected: true,
          status: propRes.data.length > 0 ? 'connected' : 'awaiting_data',
          recordsReceived: propRes.data.length,
          lastPingTime: new Date().toISOString(),
        }));
      } else {
        setProperties([]);
        setApiConfig((prev) => ({
          ...prev,
          backendConnected: true,
          status: 'awaiting_data',
          recordsReceived: 0,
        }));
      }

      if (statRes.success && statRes.data) {
        setStats(statRes.data);
      } else {
        setStats(DEFAULT_STATS);
      }
    } catch (err: any) {
      setProperties([]);
      setStats(DEFAULT_STATS);
      setApiConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err.message,
      }));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(filters);
  }, [loadData, filters]);

  // Handle filter changes
  const handleFilterChange = (updated: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(filters);
  };

  const handlePing = async () => {
    setIsPinging(true);
    const result = await pingBackend();
    setApiConfig((prev) => ({
      ...prev,
      backendConnected: result.connected,
      status: result.status,
      recordsReceived: result.count,
      lastPingTime: result.timestamp,
      errorMessage: result.connected ? null : result.message,
    }));
    setIsPinging(false);
  };

  // Temporary sample schema injection for developer preview
  const handleLoadSampleData = async () => {
    try {
      setIsLoading(true);
      await ingestProperties(SAMPLE_VERIFICATION_PAYLOAD);
      await loadData(filters);
    } catch (err: any) {
      console.error('Failed to load test payload:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to 0 records (clean zero-data state)
  const handleClearData = async () => {
    try {
      setIsLoading(true);
      await resetBackendData();
      await loadData(filters);
    } catch (err: any) {
      console.error('Failed to reset data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Application Header */}
      <Header
        apiConfig={apiConfig}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenDistrictModal={() => setIsDistrictModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Statistical Summary KPI Cards */}
        <section id="section-price-summary" aria-label="Singapore Price Summary Metrics">
          <PriceSummaryCards
            stats={stats}
            recordCount={properties.length}
            onOpenApiModal={() => setIsApiModalOpen(true)}
          />
        </section>

        {/* Transaction Query Filters */}
        <section id="section-filters" aria-label="Transaction Filters">
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </section>

        {/* Property Price Statement Table / Card Section */}
        <section id="section-properties" aria-label="Singapore Private Property Prices">
          <PropertyTable
            properties={properties}
            isLoading={isLoading}
            onOpenApiModal={() => setIsApiModalOpen(true)}
            onLoadSampleData={handleLoadSampleData}
            onClearData={handleClearData}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Singapore Private Residential Property Prices • Urban Redevelopment Authority (URA)
            Standard
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="hover:text-slate-900 hover:underline"
            >
              API Placeholder Docs
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDistrictModalOpen(true)}
              className="hover:text-slate-900 hover:underline"
            >
              Districts &amp; Regions
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiConfig={apiConfig}
        onPing={handlePing}
        isPinging={isPinging}
        onLoadSampleData={handleLoadSampleData}
        onClearData={handleClearData}
        onDataChanged={() => loadData(filters)}
      />

      <DistrictGuideModal
        isOpen={isDistrictModalOpen}
        onClose={() => setIsDistrictModalOpen(false)}
        onSelectDistrict={(districtCode) => {
          handleFilterChange({ district: districtCode });
        }}
      />
    </div>
  );
}
