import React, { useEffect, useState } from 'react';
import HeatMap from '@uiw/react-heat-map';
import axios from 'axios';
import { useAppSelector } from '../redux/store';

const AttendanceHeatmap: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    axios.get(`/api/attendance/${user.id}`)
      .then(res => {
        const attendance = res.data.data.map((rec: any) => ({
          date: new Date(rec.date).toISOString().slice(0, 10).replace(/-/g, '/'),
          count: rec.status === 'present' ? 1 : 0
        }));
        setData(attendance);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div
      className="my-6 px-2"
      style={{ fontFamily: "var(--font-primary, 'Inter', 'Helvetica Neue', Arial, sans-serif)" }}
    >
      <div
        className="mb-3 text-lg font-bold tracking-wide flex items-center gap-2"
        style={{ color: 'var(--color-true-turquoise)', letterSpacing: 1.2 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-true-turquoise)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2" fill="var(--color-true-turquoise)" opacity="0.18"/><rect x="14" y="3" width="7" height="7" rx="2" fill="var(--color-true-turquoise)" opacity="0.18"/><rect x="14" y="14" width="7" height="7" rx="2" fill="var(--color-true-turquoise)" opacity="0.18"/><rect x="3" y="14" width="7" height="7" rx="2" fill="var(--color-true-turquoise)" opacity="0.18"/></svg>
        Attendance
      </div>
      <div
        className="rounded-xl shadow-lg border"
        style={{
          background: 'linear-gradient(135deg, var(--color-offblack) 80%, var(--color-true-turquoise) 120%)',
          borderColor: 'var(--color-soft-gray)',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 'var(--border-radius, 8px)',
          padding: 20,
        }}
      >
        {loading ? (
          <div className="text-teal-light text-xs" style={{ color: 'var(--color-teal-light)' }}>Loading attendance...</div>
        ) : (
          <HeatMap
            value={data}
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            panelColors={{
              0: 'var(--color-offblack, #121212)',
              1: 'var(--color-true-turquoise, #00B8D9)',
            }}
            rectProps={{
              rx: 5,
              style: {
                stroke: 'var(--color-soft-gray, #E5E7EB)',
                strokeWidth: 0.7,
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                cursor: 'pointer',
              },
              onMouseOver: (e: React.MouseEvent<SVGRectElement>) => {
                (e.target as SVGRectElement).style.filter = 'brightness(1.2) drop-shadow(0 0 4px var(--color-true-turquoise, #00B8D9))';
              },
              onMouseOut: (e: React.MouseEvent<SVGRectElement>) => {
                (e.target as SVGRectElement).style.filter = '';
              },
            }}
            weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
            monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            rectRender={(props, d) => (
              <rect {...props}>
                <title>{d.date + ': ' + (d.count ? 'Present' : 'Absent')}</title>
              </rect>
            )}
            style={{ width: '100%', minWidth: 220, maxWidth: 320, margin: '0 auto', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceHeatmap; 