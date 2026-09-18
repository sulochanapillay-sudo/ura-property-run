import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { PropertyFilters } from '../types';
import { SINGAPORE_DISTRICTS } from '../constants/singaporeDistricts';

interface FilterBarProps {
  filters: PropertyFilters;
  onChange: (updated: Partial<PropertyFilters>) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
      {/* Search and Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search input */}
        <div className="md:col-span-4 relative">
          <label htmlFor="search-project" className="block text-xs font-semibold text-slate-600 mb-1">
            Search Project / Street Name
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-project"
              type="text"
              value={filters.query}
              onChange={(e) => onChange({ query: e.target.value })}
              placeholder="e.g. Marina Bay, Amber, Leedon..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
            />
          </div>
        </div>

        {/* District Selector */}
        <div className="md:col-span-3">
          <label htmlFor="select-district" className="block text-xs font-semibold text-slate-600 mb-1">
            Postal District (D01 - D28)
          </label>
          <select
            id="select-district"
            value={filters.district}
            onChange={(e) => onChange({ district: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
          >
            <option value="ALL">All Districts (Islandwide)</option>
            {SINGAPORE_DISTRICTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} - {d.region}: {d.name.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Market Segment / Region */}
        <div className="md:col-span-3">
          <label htmlFor="select-region" className="block text-xs font-semibold text-slate-600 mb-1">
            Market Region
          </label>
          <select
            id="select-region"
            value={filters.marketSegment}
            onChange={(e) => onChange({ marketSegment: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
          >
            <option value="ALL">All Segments (CCR, RCR, OCR)</option>
            <option value="CCR">CCR - Core Central Region</option>
            <option value="RCR">RCR - Rest of Central Region</option>
            <option value="OCR">OCR - Outside Central Region</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="md:col-span-2">
          <label htmlFor="select-property-type" className="block text-xs font-semibold text-slate-600 mb-1">
            Property Type
          </label>
          <select
            id="select-property-type"
            value={filters.propertyType}
            onChange={(e) => onChange({ propertyType: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
          >
            <option value="ALL">All Types</option>
            <option value="Condominium">Condominium</option>
            <option value="Apartment">Apartment</option>
            <option value="Executive Condominium">Executive Condo (EC)</option>
            <option value="Terrace House">Terrace House</option>
            <option value="Semi-Detached House">Semi-Detached</option>
            <option value="Detached House">Detached Bungalow</option>
            <option value="Strata Landed">Strata Landed</option>
          </select>
        </div>
      </div>

      {/* Secondary Row: Tenure, Sale Type, Price Sort & Reset */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tenure */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tenure:</span>
            <select
              id="filter-tenure"
              value={filters.tenure}
              onChange={(e) => onChange({ tenure: e.target.value })}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            >
              <option value="ALL">Any Tenure</option>
              <option value="Freehold">Freehold</option>
              <option value="99-year Leasehold">99-year Leasehold</option>
              <option value="999-year Leasehold">999-year Leasehold</option>
            </select>
          </div>

          {/* Sale Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sale Type:</span>
            <select
              id="filter-sale-type"
              value={filters.saleType}
              onChange={(e) => onChange({ saleType: e.target.value })}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            >
              <option value="ALL">All Sales</option>
              <option value="New Sale">New Sale (Developer)</option>
              <option value="Resale">Resale</option>
              <option value="Sub Sale">Sub Sale</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as any })}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            >
              <option value="price">Transacted Price ($)</option>
              <option value="pricePsf">Price PSF ($/sqft)</option>
              <option value="contractDate">Transaction Date</option>
              <option value="areaSqft">Floor Area (sqft)</option>
            </select>
            <button
              onClick={() => onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-slate-700 font-medium transition-colors"
              title="Toggle sort direction"
            >
              {filters.sortOrder === 'asc' ? 'Asc ↑' : 'Desc ↓'}
            </button>
          </div>
        </div>

        {/* Reset Filters */}
        <button
          id="btn-reset-filters"
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};
