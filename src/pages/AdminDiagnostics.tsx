import React, { useEffect } from 'react';
import { ReloadIcon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';
import { fetchDiagnostics } from '../redux/slices/diagnosticsSlice';
import { useAppDispatch } from '../redux/store';
import LoadingScreen from '../components/LoadingScreen';



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
  }, [dispatch]);

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

  if (loading) {
    return <LoadingScreen message="Loading diagnostics..." />;
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-8 bg-black">
      <div className="flex items-center mb-8 gap-3">
        <CheckCircledIcon className="h-7 w-7 text-trueturquoise" />
        <h1 className="text-2xl text-paperwhite font-heading">System Diagnostics</h1>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-teallight text-sm font-label">
          Last checked: {timestamp ? new Date(timestamp).toLocaleString() : '—'}
        </div>
        <button
          onClick={refreshDiagnostics}
          className="flex items-center gap-2 px-3 py-1.5 bg-trueturquoise text-offblack rounded hover:bg-teallight hover:text-offblack transition font-semibold"
          disabled={loading}
        >
          <ReloadIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="mb-4">
        <span className={`${healthyCount === totalCount ? 'text-trueturquoise' : 'text-rust'} font-label`}>{healthyCount}/{totalCount}</span>
        {' '}<span className="text-teallight font-label">services healthy</span>
      </div>
      {error && (
        <div className="bg-rust/10 text-rust px-4 py-2 rounded mb-4 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-offblack shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-paperwhite bg-paperwhite/10">Service</th>
              <th className="px-4 py-2 text-left text-paperwhite bg-paperwhite/10">Status</th>
              <th className="px-4 py-2 text-left text-paperwhite bg-paperwhite/10">Message</th>
              <th className="px-4 py-2 text-left text-paperwhite bg-paperwhite/10">Error</th>
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
                <tr key={diag.module} className={`transition-colors ${diag.healthy ? 'bg-paperwhite/10 hover:bg-paperwhite/20' : 'bg-rust/10 hover:bg-rust/20'}`}>
                  <td className="px-4 py-2 font-medium text-paperwhite">{diag.module}</td>
                  <td className="px-4 py-2">
                    {diag.healthy ? (
                      <span className="flex items-center gap-1 text-trueturquoise">
                        <CheckCircledIcon className="h-4 w-4" /> Healthy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rust">
                        <ExclamationTriangleIcon className="h-4 w-4" /> Unhealthy
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-paperwhite">{!errorText ? diag.message : ''}</td>
                  <td className="px-4 py-2 text-xs text-rust">{errorText || '—'}</td>
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