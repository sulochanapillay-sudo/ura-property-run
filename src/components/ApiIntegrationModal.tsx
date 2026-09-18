import React, { useState } from 'react';
import {
  X,
  Code2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Copy,
  Check,
  Send,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ApiConfig } from '../types';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  onPing: () => Promise<void>;
  isPinging: boolean;
  onLoadSampleData: () => void;
  onClearData: () => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onPing,
  isPinging,
  onLoadSampleData,
  onClearData,
}) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schema' | 'curl' | 'test'>('endpoints');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleJsonRecord = `{
  "id": "sg-prop-101",
  "projectName": "The Sail @ Marina Bay",
  "streetName": "Marina Boulevard",
  "district": "D01",
  "districtName": "Raffles Place, Cecil, Marina",
  "marketSegment": "CCR",
  "propertyType": "Condominium",
  "price": 2450000,
  "areaSqft": 1033,
  "areaSqm": 96,
  "pricePsf": 2372,
  "pricePsm": 25520,
  "tenure": "99-year Leasehold",
  "contractDate": "2025-01-15",
  "saleType": "Resale",
  "floorRange": "31 to 35",
  "numberOfBedrooms": 2,
  "postalCode": "018987"
}`;

  const curlGetExample = `curl -X GET "http://localhost:3000/api/properties?district=D09&minPrice=1500000"`;

  const curlPostExample = `curl -X POST "http://localhost:3000/api/properties" \\
  -H "Content-Type: application/json" \\
  -d '{
    "properties": [
      ${sampleJsonRecord}
    ]
  }'`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">API Integration &amp; Backend Placeholders</h2>
              <p className="text-xs text-slate-300">
                Connect your backend database, URA Realis API, or property microservice
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

        {/* Live Connectivity Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-600">API Status:</span>
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  apiConfig.recordsReceived > 0
                    ? 'bg-emerald-500'
                    : 'bg-amber-500 animate-pulse'
                }`}
              ></span>
              <span className="text-slate-800">
                {apiConfig.recordsReceived > 0
                  ? `Populated (${apiConfig.recordsReceived} records)`
                  : 'Awaiting Backend Connection (0 data)'}
              </span>
            </div>
            {apiConfig.lastPingTime && (
              <span className="text-slate-400">
                Ping: {new Date(apiConfig.lastPingTime).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPing}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-md font-semibold text-slate-700 transition-colors"
            >
              <Send className={`h-3 w-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'Ping /api/properties'}</span>
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'endpoints'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            JSON Schema &amp; Types
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'curl'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            cURL Snippets
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'test'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Testing &amp; Ingestion
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'endpoints' && (
            <div className="space-y-3.5">
              <p className="text-slate-600 leading-relaxed">
                The Express backend server provides pre-wired endpoint placeholders ready for your
                real private property data ingestion or proxying to Singapore URA/Realis.
              </p>

              <div className="space-y-2 font-mono">
                {/* Endpoint 1 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">GET /api/properties</span>
                    <span className="text-[11px] font-sans text-slate-500">Query &amp; Filter</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Returns list of transactions. Supports params: <code className="bg-slate-200 px-1 py-0.5 rounded">district</code>,{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">marketSegment (CCR|RCR|OCR)</code>,{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">propertyType</code>,{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">minPrice</code>,{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">maxPrice</code>,{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">minPsf</code>,{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">sortBy</code>.
                  </p>
                </div>

                {/* Endpoint 2 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">GET /api/properties/stats</span>
                    <span className="text-[11px] font-sans text-slate-500">Metrics</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Returns median price, average price, median PSF ($/sqft), and segment breakdown.
                  </p>
                </div>

                {/* Endpoint 3 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">POST /api/properties</span>
                    <span className="text-[11px] font-sans text-slate-500">Data Ingestion</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Accepts a single or array of property objects to populate the application.
                  </p>
                </div>

                {/* Endpoint 4 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800">GET /api/properties/districts</span>
                    <span className="text-[11px] font-sans text-slate-500">Singapore Reference</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Returns the master list of all 28 Singapore postal districts (D01-D28) and regions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">SingaporeProperty Interface (TypeScript)</span>
                <button
                  onClick={() => copyToClipboard(sampleJsonRecord, 'json')}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                >
                  {copiedKey === 'json' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'json' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed max-h-72">
                {sampleJsonRecord}
              </pre>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700">1. Query Properties (GET)</span>
                  <button
                    onClick={() => copyToClipboard(curlGetExample, 'curl-get')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                  >
                    {copiedKey === 'curl-get' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'curl-get' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono">
                  {curlGetExample}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700">2. Ingest Properties (POST)</span>
                  <button
                    onClick={() => copyToClipboard(curlPostExample, 'curl-post')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                  >
                    {copiedKey === 'curl-post' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'curl-post' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {curlPostExample}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900">Developer Testing Sandbox</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  As requested, the database starts completely empty (0 data). If you want to temporarily verify that the
                  price calculations and table layout render properly before you connect your backend, you can inject a 3-record URA sample payload,
                  or reset back to 0 records anytime.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      onLoadSampleData();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5 text-amber-400" />
                    <span>Inject 3 Sample Records (Test Layout)</span>
                  </button>

                  <button
                    onClick={() => {
                      onClearData();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset to 0 Data</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                Tip: When you are ready to connect to your live backend, point your data pipeline or proxy to{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">POST /api/properties</code>, or update{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">src/services/propertyApi.ts</code> to your remote backend URL.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Database records currently loaded: <strong className="text-slate-900">{apiConfig.recordsReceived}</strong>
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
