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
    <div className="my-6 px-2">
      <div className="text-xs font-semibold mb-2 text-paperwhite tracking-wide">Attendance</div>
      <div className="rounded-xl bg-offblack p-3 shadow border border-soft-gray/10">
        {loading ? (
          <div className="text-teal-light text-xs">Loading attendance...</div>
        ) : (
          <HeatMap
            value={data}
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            panelColors={{
              0: '#222222', // offblack
              1: '#00B8D9', // true turquoise
            }}
            rectProps={{ rx: 3, style: { stroke: '#E5E7EB', strokeWidth: 0.5 } }}
            weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
            monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            rectRender={(props, d) => (
              <rect {...props}>
                <title>{d.date + ': ' + (d.count ? 'Present' : 'Absent')}</title>
              </rect>
            )}
            style={{ width: '100%', minWidth: 220, maxWidth: 320 }}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceHeatmap; 