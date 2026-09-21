import React, { useState, useEffect } from 'react';
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
  Key,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ApiConfig } from '../types';
import {
  tradeUraToken,
  fetchUraBatchTransactions,
  syncUraDataset,
  getUraStatus,
} from '../services/propertyApi';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  onPing: () => Promise<void>;
  isPinging: boolean;
  onLoadSampleData: () => void;
  onClearData: () => void;
  onDataChanged?: () => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onPing,
  isPinging,
  onLoadSampleData,
  onClearData,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'ura' | 'endpoints' | 'schema' | 'curl' | 'test'>('ura');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // URA Interactive state
  const [manualAccessKey, setManualAccessKey] = useState<string>('');
  const [uraStatus, setUraStatus] = useState<any>(null);
  const [uraLoading, setUraLoading] = useState<boolean>(false);
  const [uraConsoleLog, setUraConsoleLog] = useState<{
    type: 'idle' | 'success' | 'error' | 'info';
    title: string;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      getUraStatus()
        .then((data) => setUraStatus(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestToken = async () => {
    setUraLoading(true);
    setUraConsoleLog({
      type: 'info',
      title: 'Trading AccessKey for Daily Token...',
      message: 'Calling /api/token -> URA /insertNewToken/v1',
    });
    try {
      const res = await tradeUraToken(manualAccessKey || undefined, true);
      if (res.status === 'Success' && res.token) {
        setUraConsoleLog({
          type: 'success',
          title: 'Daily Token Received Successfully',
          message: res.message || "Token generated and cached for today's requests.",
          details: {
            token: res.token,
            date: (res as any).date,
            cached: res.cached,
          },
        });
      } else {
        setUraConsoleLog({
          type: 'error',
          title: 'Token Exchange Unsuccessful',
          message: res.error || (res as any).Message || 'Failed to exchange token.',
          details: res,
        });
      }
    } catch (err: any) {
      setUraConsoleLog({
        type: 'error',
        title: 'Network / Client Error',
        message: err.message,
      });
    } finally {
      setUraLoading(false);
    }
  };

  const handleTestFetchUra = async () => {
    setUraLoading(true);
    setUraConsoleLog({
      type: 'info',
      title: 'Invoking URA DataService (Batch 1)...',
      message: 'Calling /api/transactions?batch=1 with AccessKey + Token headers...',
    });
    try {
      const res = await fetchUraBatchTransactions(1, manualAccessKey || undefined);
      if (res.success) {
        setUraConsoleLog({
          type: 'success',
          title: `URA Batch 1 Fetched (${res.totalTransactions} transactions)`,
          message: `Retrieved ${res.totalProjects} residential projects from service PMI_Resi_Transaction.`,
          details: {
            totalProjects: res.totalProjects,
            totalTransactions: res.totalTransactions,
            sample: res.data?.slice(0, 2),
          },
        });
      } else {
        setUraConsoleLog({
          type: 'error',
          title: 'URA Query Failed',
          message: res.error || 'Failed to fetch URA dataset.',
          details: res,
        });
      }
    } catch (err: any) {
      setUraConsoleLog({
        type: 'error',
        title: 'Error calling /api/transactions',
        message: err.message,
      });
    } finally {
      setUraLoading(false);
    }
  };

  const handleSyncUra = async () => {
    setUraLoading(true);
    setUraConsoleLog({
      type: 'info',
      title: 'Synchronizing URA Dataset into Application...',
      message: 'Calling /api/ura/sync (exchanging token, fetching batch 1, transforming to property records)...',
    });
    try {
      const res = await syncUraDataset(1, manualAccessKey || undefined);
      if (res.success) {
        setUraConsoleLog({
          type: 'success',
          title: 'Sync Complete!',
          message: res.message,
          details: res,
        });
        if (onDataChanged) {
          onDataChanged();
        }
      } else {
        setUraConsoleLog({
          type: 'error',
          title: 'Sync Failed',
          message: res.error || 'Unable to sync dataset.',
          details: res,
        });
      }
    } catch (err: any) {
      setUraConsoleLog({
        type: 'error',
        title: 'Sync Error',
        message: err.message,
      });
    } finally {
      setUraLoading(false);
    }
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

  const curlUraTokenExample = `# 1. Trade AccessKey for Today's Token:
curl -X GET "http://localhost:3000/api/token" \\
  -H "AccessKey: YOUR_URA_ACCESS_KEY"`;

  const curlUraDataExample = `# 2. Invoke URA DataService (PMI_Resi_Transaction):
curl -X GET "http://localhost:3000/api/transactions?batch=1" \\
  -H "AccessKey: YOUR_URA_ACCESS_KEY" \\
  -H "Token: YOUR_TODAY_TOKEN"`;

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
              <h2 className="text-base font-bold tracking-tight">API Integration &amp; URA DataService</h2>
              <p className="text-xs text-slate-300">
                Serverless connection for Singapore Urban Redevelopment Authority datasets
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
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-600">Active Records:</span>
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
                  ? `${apiConfig.recordsReceived} records loaded`
                  : '0 records (Awaiting Data)'}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              URA_ACCESS_KEY: {uraStatus?.configured ? (
                <span className="text-emerald-700 font-semibold">Configured (.env)</span>
              ) : (
                <span className="text-amber-700 font-medium">Not in .env (Use Input Below)</span>
              )}
            </span>
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
            onClick={() => setActiveTab('ura')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ura'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-500" />
            <span>URA DataService (Serverless)</span>
          </button>
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
            JSON Schema
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
            Testing Sandbox
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* URA DataService Tab */}
          {activeTab === 'ura' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-600" />
                  <span>URA Private Residential Property Transactions Architecture</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  The serverless connector in <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">/api</code> implements the exact 2-step protocol required by URA:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-900 block text-[11px] mb-1">
                      Step 1: Daily Token Trade
                    </span>
                    <p className="text-[11px] text-slate-500 mb-1">
                      Trades <code className="bg-slate-100 px-1 py-0.5 rounded">AccessKey</code> for today's token at <code className="text-slate-800">/insertNewToken/v1</code> and caches it for the day.
                    </p>
                    <code className="text-[10px] text-emerald-800 font-mono block">
                      GET /api/token
                    </code>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-900 block text-[11px] mb-1">
                      Step 2: Dual-Header Data Call
                    </span>
                    <p className="text-[11px] text-slate-500 mb-1">
                      Sends BOTH <code className="bg-slate-100 px-1 py-0.5 rounded">AccessKey</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">Token</code> to query <code className="text-slate-800">PMI_Resi_Transaction</code>.
                    </p>
                    <code className="text-[10px] text-blue-800 font-mono block">
                      GET /api/transactions?batch=1
                    </code>
                  </div>
                </div>
              </div>

              {/* AccessKey Input (Not hardcoded) */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <label className="block font-semibold text-slate-700">
                  URA AccessKey (Manual Entry or Environment Override):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={manualAccessKey}
                    onChange={(e) => setManualAccessKey(e.target.value)}
                    placeholder="Enter your URA AccessKey (or configure URA_ACCESS_KEY in .env)"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Keys are never hardcoded. You can enter your key above for testing, or set <code className="bg-slate-100 px-1 py-0.5 rounded">URA_ACCESS_KEY</code> in your environment file.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleTestToken}
                  disabled={uraLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  <span>1. Trade for Daily Token</span>
                </button>

                <button
                  onClick={handleTestFetchUra}
                  disabled={uraLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5 text-slate-500" />
                  <span>2. Query URA (Batch 1)</span>
                </button>

                <button
                  onClick={handleSyncUra}
                  disabled={uraLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${uraLoading ? 'animate-spin' : ''}`} />
                  <span>3. Sync URA Data to App</span>
                </button>
              </div>

              {/* Console Output Log */}
              {uraConsoleLog && (
                <div
                  className={`p-3.5 rounded-xl border font-mono text-xs ${
                    uraConsoleLog.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : uraConsoleLog.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>{uraConsoleLog.title}</span>
                    <span className="text-[10px] font-sans text-slate-400">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] mb-1 font-sans">{uraConsoleLog.message}</p>
                  {uraConsoleLog.details && (
                    <pre className="p-2 bg-black/5 rounded text-[10px] overflow-x-auto max-h-40">
                      {JSON.stringify(uraConsoleLog.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-3.5">
              <p className="text-slate-600 leading-relaxed">
                The serverless backend in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">/api</code> provides ready endpoints for both the application and URA DataService.
              </p>

              <div className="space-y-2 font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800">GET /api/token</span>
                    <span className="text-[11px] font-sans text-slate-500">Step 1 Token</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Trades AccessKey for today's daily token from URA (/insertNewToken/v1).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">GET /api/transactions?batch=1</span>
                    <span className="text-[11px] font-sans text-slate-500">Step 2 Data</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Calls URA PMI_Resi_Transaction sending BOTH AccessKey and Token headers.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">POST /api/ura/sync</span>
                    <span className="text-[11px] font-sans text-slate-500">Auto Ingestion</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Performs token trade + data fetch + transforms into private property price state.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">GET /api/properties</span>
                    <span className="text-[11px] font-sans text-slate-500">App Query</span>
                  </div>
                  <p className="text-slate-600 font-sans mt-1 text-[11px]">
                    Returns filtered private residential transactions by district, region, price, etc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">SingaporeProperty Standard Format</span>
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
                  <span className="font-semibold text-slate-700">1. Trade AccessKey for Today's Token</span>
                  <button
                    onClick={() => copyToClipboard(curlUraTokenExample, 'curl-token')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                  >
                    {copiedKey === 'curl-token' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'curl-token' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {curlUraTokenExample}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700">2. Query URA (Dual Headers)</span>
                  <button
                    onClick={() => copyToClipboard(curlUraDataExample, 'curl-data')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                  >
                    {copiedKey === 'curl-data' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'curl-data' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {curlUraDataExample}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900">Developer Testing Sandbox</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  You can inject 3 sample URA-format records to test the table layouts and price calculations,
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
                    <span>Inject 3 Sample Records</span>
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
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Active Records in App: <strong className="text-slate-900">{apiConfig.recordsReceived}</strong>
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
