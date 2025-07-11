import React, { useEffect } from 'react';
import { useAppSelector } from '../redux/store';
import { ShieldIcon, ReloadIcon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { useDispatch, useSelector } from 'react-redux';
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

  if (loading) {
    return <LoadingScreen message="Loading diagnostics..." />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center mb-6 gap-3">
        <ShieldCheck className="h-7 w-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-white">System Diagnostics</h1>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-600 text-sm">
          Last checked: {timestamp ? new Date(timestamp).toLocaleString() : '—'}
        </div>
        <button
          onClick={refreshDiagnostics}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="mb-4">
        <span className={`font-semibold ${healthyCount === totalCount ? 'text-green-600' : 'text-red-600'}`}>{healthyCount}/{totalCount}</span>
        {' '}modules healthy
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-white bg-gray-800">Module</th>
              <th className="px-4 py-2 text-left text-white bg-gray-800">Status</th>
              <th className="px-4 py-2 text-left text-white bg-gray-800">Message</th>
              <th className="px-4 py-2 text-left text-white bg-gray-800">Error</th>
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
                <tr key={diag.module} className={`transition-colors ${diag.healthy ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-800'}`}>
                  <td className="px-4 py-2 font-medium text-white">{diag.module}</td>
                  <td className="px-4 py-2">
                    {diag.healthy ? (
                      <span className="flex items-center gap-1 text-green-400 font-semibold">
                        <CheckCircledIcon className="h-4 w-4" /> Healthy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-semibold">
                        <ExclamationTriangleIcon className="h-4 w-4" /> Unhealthy
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-white">{!errorText ? diag.message : ''}</td>
                  <td className="px-4 py-2 text-xs text-red-400">{errorText || '—'}</td>
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