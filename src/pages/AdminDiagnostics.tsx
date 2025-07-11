import React, { useEffect } from 'react';
import { useAppSelector } from '../redux/store';
import { ReloadIcon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-white dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 py-8 px-2 md:px-8 relative overflow-x-hidden">
      {/* Glassmorphism & Animated Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-tr from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-gradient-move" />
      </div>
      <div className="relative z-10 w-full max-w-4xl animate-fadein">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/30 rounded-3xl shadow-2xl border border-blue-200/20 dark:border-blue-900/30 px-8 py-10 mx-auto animate-fadein">
          <div className="flex items-center mb-6 gap-3 animate-slidein">
            <CheckCircledIcon className="h-9 w-9 text-blue-500 animate-glow" />
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 drop-shadow-lg">System Diagnostics</h1>
              <p className="text-purple-700 dark:text-purple-200 mt-1 text-base font-medium animate-fadein-slow">Ensuring your platform is healthy and robust 🩺</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 animate-fadein-slow">
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Last checked: {timestamp ? new Date(timestamp).toLocaleString() : '—'}
            </div>
            <button
              onClick={refreshDiagnostics}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:scale-105 active:scale-95 duration-150"
              disabled={loading}
            >
              <ReloadIcon className={`h-5 w-5 ${loading ? 'animate-spin' : 'animate-spin-on-hover'}`} />
              Refresh
            </button>
          </div>
          <div className="mb-4 animate-fadein-slow">
            <span className={`font-extrabold text-lg px-3 py-1 rounded-xl shadow ${healthyCount === totalCount ? 'bg-green-100 text-green-700 animate-glow' : 'bg-red-100 text-red-700 animate-shake'}`}>{healthyCount}/{totalCount}</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">modules healthy</span>
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 flex items-center gap-2 animate-fadein-slow">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="overflow-x-auto animate-fadein-slow">
            <table className="min-w-full bg-gray-900/90 shadow rounded-2xl overflow-hidden">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-white bg-gray-800/90">Module</th>
                  <th className="px-4 py-2 text-left text-white bg-gray-800/90">Status</th>
                  <th className="px-4 py-2 text-left text-white bg-gray-800/90">Message</th>
                  <th className="px-4 py-2 text-left text-white bg-gray-800/90">Error</th>
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
                    <tr key={diag.module} className={`transition-all duration-200 ${diag.healthy ? 'bg-gray-800 hover:bg-blue-900/40' : 'bg-gray-700 hover:bg-red-900/40'} group cursor-pointer hover:scale-[1.01]`}>
                      <td className="px-4 py-2 font-semibold text-white text-base">{diag.module}</td>
                      <td className="px-4 py-2">
                        {diag.healthy ? (
                          <span className="flex items-center gap-1 text-green-400 font-bold animate-pulse-on-healthy">
                            <CheckCircledIcon className="h-5 w-5 animate-glow" /> Healthy
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 font-bold animate-shake-on-unhealthy">
                            <ExclamationTriangleIcon className="h-5 w-5 animate-shake" /> Unhealthy
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
      </div>
      {/* Animations */}
      <style>{`
        @keyframes gradient-move { 0%{background-position:0% 50%;} 100%{background-position:100% 50%;} }
        .animate-gradient-move { background-size: 200% 200%; animation: gradient-move 12s ease-in-out infinite; }
        .animate-fadein { animation: fadein 1s ease; }
        .animate-fadein-slow { animation: fadein 2s ease; }
        .animate-slidein { animation: slidein 1.2s cubic-bezier(.4,0,.2,1); }
        .animate-glow { box-shadow: 0 0 16px 2px #a78bfa88, 0 0 8px 1px #6366f188; }
        .animate-pulse-on-healthy { animation: pulse 1.5s cubic-bezier(.4,0,.6,1) infinite; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-shake-on-unhealthy { animation: shake 1s cubic-bezier(.36,.07,.19,.97) infinite; }
        .animate-spin-on-hover:hover { animation: spin 1.2s linear infinite; }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }
        @keyframes slidein { from { opacity: 0; transform: translateX(-40px);} to { opacity: 1; transform: none;} }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
      `}</style>
    </div>
  );
};

export default AdminDiagnostics;