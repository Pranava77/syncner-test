import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../redux/store';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDiagnostics } from '../redux/slices/diagnosticsSlice';
import { useAppDispatch } from '../redux/store';

interface Diagnostic {
  module: string;
  healthy: boolean;
  message: string;
  error: string | null;
}

const AdminDiagnostics: React.FC = () => {
  const dispatch = useAppDispatch();
  const diagnosticsState = useSelector((state: any) => state.diagnostics);
  const diagnosticsData = diagnosticsState.data;
  const loading = diagnosticsState.loading;
  const error = diagnosticsState.error;

  useEffect(() => {
    if (!diagnosticsData || diagnosticsState.lastFetched === null) {
      dispatch(fetchDiagnostics());
    }
  }, [diagnosticsData, diagnosticsState.lastFetched, dispatch]);

  const refreshDiagnostics = async () => {
    try {
      await dispatch(fetchDiagnostics()).unwrap();
    } catch (err) {
      // error handled in Redux state
    }
  };

  const diagnostics = diagnosticsData?.diagnostics || [];
  const timestamp = diagnosticsData?.timestamp || '';

  const healthyCount = diagnostics.filter((d: any) => d.healthy).length;
  const totalCount = diagnostics.length;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 bg-[var(--brand-bg)] min-h-[80vh] rounded-xl shadow-xl transition-colors">
      <div className="flex items-center mb-6 gap-3">
        <ShieldCheck className="h-7 w-7 text-[var(--brand-primary)]" />
        <h1 className="text-2xl font-bold text-[var(--brand-text)]">System Diagnostics</h1>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[var(--brand-text-alt)] text-sm">
          Last checked: {timestamp ? new Date(timestamp).toLocaleString() : '—'}
        </div>
        <button
          onClick={refreshDiagnostics}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-accent)] transition"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="mb-4">
        <span className={`font-semibold ${healthyCount === totalCount ? 'text-[var(--brand-success)]' : 'text-[var(--brand-danger)]'}`}>{healthyCount}/{totalCount}</span>
        {' '}modules healthy
      </div>
      {error && (
        <div className="bg-[var(--brand-danger-bg)] text-[var(--brand-danger)] px-4 py-2 rounded mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[var(--brand-bg-alt)] shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-[var(--brand-text)] bg-[var(--brand-bg)]">Module</th>
              <th className="px-4 py-2 text-left text-[var(--brand-text)] bg-[var(--brand-bg)]">Status</th>
              <th className="px-4 py-2 text-left text-[var(--brand-text)] bg-[var(--brand-bg)]">Message</th>
              <th className="px-4 py-2 text-left text-[var(--brand-text)] bg-[var(--brand-bg)]">Error</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((diag: any) => {
              // Determine what to show in the error column
              let errorText = diag.error;
              if (!errorText && diag.message && /error|not found|failed|unhealthy/i.test(diag.message)) {
                errorText = diag.message;
              }
              return (
                <tr key={diag.module} className={`transition-colors ${diag.healthy ? 'bg-[var(--brand-bg-alt)] hover:bg-[var(--brand-bg)]' : 'bg-[var(--brand-bg)] hover:bg-[var(--brand-bg-alt)]'}`}>
                  <td className="px-4 py-2 font-medium text-[var(--brand-text)]">{diag.module}</td>
                  <td className="px-4 py-2">
                    {diag.healthy ? (
                      <span className="flex items-center gap-1 text-[var(--brand-success)] font-semibold">
                        <CheckCircle className="h-4 w-4" /> Healthy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--brand-danger)] font-semibold">
                        <AlertTriangle className="h-4 w-4" /> Unhealthy
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-[var(--brand-text)]">{!errorText ? diag.message : ''}</td>
                  <td className="px-4 py-2 text-xs text-[var(--brand-danger)]">{errorText || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDiagnostics; 