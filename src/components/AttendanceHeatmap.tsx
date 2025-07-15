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
      className="my-4"
      style={{
        fontFamily: "var(--font-primary, 'Inter', 'Helvetica Neue', Arial, sans-serif)",
        maxWidth: 220,
        margin: '0 auto',
      }}
    >
      <div
        className="mb-2 text-sm font-semibold tracking-wide"
        style={{ color: 'var(--color-paper-white, #FAFAFA)' }}
      >
        Attendance
      </div>
      <div
        className="shadow border"
        style={{
          background: 'var(--color-offblack, #121212)',
          borderColor: 'var(--color-soft-gray, #E5E7EB)',
          boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.06))',
          borderRadius: 'var(--border-radius, 8px)',
          padding: 14,
        }}
      >
        {loading ? (
          <div className="text-xs" style={{ color: 'var(--color-teal-light, #A0D8EF)' }}>Loading attendance...</div>
        ) : (
          <HeatMap
            value={data}
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            panelColors={{
              0: 'var(--color-soft-gray, #E5E7EB)', // Absent
              1: 'var(--color-true-turquoise, #00B8D9)', // Present
            }}
            rectProps={{
              rx: 3,
              style: {
                stroke: 'var(--color-offblack, #121212)',
                strokeWidth: 1,
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                cursor: 'pointer',
              },
              onMouseOver: (e: React.MouseEvent<SVGRectElement>) => {
                (e.target as SVGRectElement).style.filter = 'brightness(1.15) drop-shadow(0 0 2px var(--color-true-turquoise, #00B8D9))';
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
            style={{ width: '100%', minWidth: 180, maxWidth: 220, margin: '0 auto', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceHeatmap; 