import React, { useEffect, useState } from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import axios from 'axios';
import { useAppSelector } from '../redux/store';

const WEEKS = 15;
const DAYS = 7;

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
          date: new Date(rec.date).toISOString().slice(0, 10),
          count: rec.status === 'present' ? 1 : 0
        }));
        setData(attendance);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user?.id) return null;

  // Map attendance data by date string
  const dataMap = Object.fromEntries(data.map(d => [d.date, d.count]));
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);

  // Build hexes for 7x15 grid
  const hexes = [];
  for (let q = 0; q < WEEKS; q++) {
    for (let r = 0; r < DAYS; r++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + q * 7 + r);
      if (cellDate > today) continue;
      const dateStr = cellDate.toISOString().slice(0, 10);
      hexes.push({
        q,
        r,
        s: -q - r,
        date: dateStr,
        count: dataMap[dateStr] ?? -1
      });
    }
  }

  return (
    <div className="my-4 max-w-xs mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-2 h-2 rounded-full bg-trueturquoise shadow-[0_0_8px_#00B8D9]" />
        <span className="text-paperwhite font-bold tracking-widest uppercase text-xs select-none">Attendance</span>
      </div>
      <div className="bg-offblack border border-paperwhite/10 rounded-xl p-2">
        {loading ? (
          <div className="text-xs text-teallight">Loading attendance...</div>
        ) : (
          <div className="flex justify-center py-1">
            <HexGrid width={210} height={120} viewBox="-2 -2 18 8">
              <Layout size={{ x: 1, y: 1 }} flat={false} spacing={1.05} origin={{ x: 0, y: 0 }}>
                {hexes.map((hex) => (
                  <Hexagon
                    key={hex.date}
                    q={hex.q}
                    r={hex.r}
                    s={hex.s}
                    className={
                      hex.count === 1
                        ? 'fill-trueturquoise stroke-none hover:fill-green-400 transition-all duration-200'
                        : hex.count === 0
                        ? 'fill-softgray stroke-none opacity-90'
                        : 'fill-gray-700 stroke-none opacity-60'
                    }
                  >
                    <title>{hex.date + ': ' + (hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No data')}</title>
                  </Hexagon>
                ))}
              </Layout>
            </HexGrid>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
