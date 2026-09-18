import React from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Trash2,
  FileCode2,
  CheckCircle2,
} from 'lucide-react';
import { SingaporeProperty } from '../types';

interface PropertyTableProps {
  properties: SingaporeProperty[];
  isLoading: boolean;
  onOpenApiModal: () => void;
  onLoadSampleData: () => void;
  onClearData: () => void;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  isLoading,
  onOpenApiModal,
  onLoadSampleData,
  onClearData,
}) => {
  const formatSGD = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-SG').format(val);
  };

  const getRegionBadge = (region: string) => {
    switch (region) {
      case 'CCR':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'RCR':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'OCR':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getSaleTypeBadge = (saleType: string) => {
    switch (saleType) {
      case 'New Sale':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Resale':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Sub Sale':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-3"></div>
        <p className="text-sm font-medium text-slate-700">Querying Singapore Property API...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to API endpoint placeholder</p>
      </div>
    );
  }

  // 2. Empty State (Default initial state per user request: "Do not include any data as of now")
  if (properties.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-2xs text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Building2 className="h-8 w-8 text-slate-600" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              API Integration Placeholder Active
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Awaiting Singapore Private Property Data
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              No private property transaction records are currently stored. The UI layout,
              district query filters, and price aggregation tables are ready to receive data from your backend.
            </p>
          </div>

          {/* Quick Endpoint Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ready API Endpoints
              </span>
              <span className="text-[11px] font-mono text-slate-400">Express + REST</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-800">
                  <span className="font-semibold text-emerald-700">GET</span> /api/properties
                </span>
                <span className="text-slate-400 font-sans text-[11px]">Filtered transactions</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-800">
                  <span className="font-semibold text-emerald-700">GET</span> /api/properties/stats
                </span>
                <span className="text-slate-400 font-sans text-[11px]">Median &amp; PSF stats</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-800">
                  <span className="font-semibold text-blue-700">POST</span> /api/properties
                </span>
                <span className="text-slate-400 font-sans text-[11px]">Ingest records</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-open-api-hub-empty"
              onClick={onOpenApiModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Code2 className="h-4 w-4 text-amber-400" />
              <span>Open API Integration Hub &amp; Schema</span>
            </button>

            <button
              id="btn-load-schema-test"
              onClick={onLoadSampleData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              title="Test table rendering with 3 sample URA-format records"
            >
              <FileCode2 className="h-4 w-4 text-slate-500" />
              <span>Test with Sample Schema Payload</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Populated State (States private property prices)
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/70">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Singapore Private Property Transactions
          </h2>
          <p className="text-xs text-slate-500">
            Showing {properties.length} recorded transaction{properties.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearData}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
            title="Clear data and return to initial zero-data state"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset to 0 Data</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
              <th className="py-3 px-4">Project &amp; Location</th>
              <th className="py-3 px-3">District / Region</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-right">Floor Area</th>
              <th className="py-3 px-3 text-right">Transacted Price</th>
              <th className="py-3 px-3 text-right">Price (PSF)</th>
              <th className="py-3 px-3">Tenure</th>
              <th className="py-3 px-4">Sale Date / Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {properties.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Project & Location */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 text-sm">{item.projectName}</div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{item.streetName || item.districtName}</span>
                  </div>
                </td>

                {/* District & Region */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{item.district}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRegionBadge(
                        item.marketSegment
                      )}`}
                    >
                      {item.marketSegment}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] truncate max-w-[130px] mt-0.5">
                    {item.districtName}
                  </div>
                </td>

                {/* Property Type */}
                <td className="py-3.5 px-3">
                  <span className="font-medium text-slate-800">{item.propertyType}</span>
                  {item.floorRange && (
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Flr {item.floorRange}
                    </div>
                  )}
                </td>

                {/* Floor Area */}
                <td className="py-3.5 px-3 text-right">
                  <div className="font-medium text-slate-900">
                    {formatNumber(item.areaSqft)} sq ft
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    ({formatNumber(item.areaSqm)} sq m)
                  </div>
                </td>

                {/* Transacted Price */}
                <td className="py-3.5 px-3 text-right">
                  <div className="font-bold text-emerald-800 text-sm">
                    {formatSGD(item.price)}
                  </div>
                  <div className="text-slate-400 text-[10px]">Singapore Dollars</div>
                </td>

                {/* Price PSF */}
                <td className="py-3.5 px-3 text-right">
                  <div className="font-bold text-slate-900">
                    ${formatNumber(item.pricePsf)} <span className="text-[11px] font-normal text-slate-500">PSF</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    (${formatNumber(item.pricePsm)} PSM)
                  </div>
                </td>

                {/* Tenure */}
                <td className="py-3.5 px-3">
                  <span className="inline-block px-2 py-0.5 text-[11px] rounded bg-slate-100 text-slate-700 font-medium">
                    {item.tenure}
                  </span>
                </td>

                {/* Contract Date & Sale Type */}
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{item.contractDate}</span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded border ${getSaleTypeBadge(
                        item.saleType
                      )}`}
                    >
                      {item.saleType}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="block lg:hidden divide-y divide-slate-200">
        {properties.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{item.projectName}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{item.streetName || item.districtName}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{item.district}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRegionBadge(
                    item.marketSegment
                  )}`}
                >
                  {item.marketSegment}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Transacted Price
                </span>
                <span className="font-bold text-emerald-800 text-sm">
                  {formatSGD(item.price)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Unit Price
                </span>
                <span className="font-bold text-slate-900">
                  ${formatNumber(item.pricePsf)} PSF
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Floor Area
                </span>
                <span className="text-slate-700">
                  {formatNumber(item.areaSqft)} sqft ({formatNumber(item.areaSqm)} sqm)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Type &amp; Tenure
                </span>
                <span className="text-slate-700">
                  {item.propertyType} • {item.tenure}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSaleTypeBadge(
                  item.saleType
                )}`}
              >
                {item.saleType}
              </span>
              <span>Contract: {item.contractDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
