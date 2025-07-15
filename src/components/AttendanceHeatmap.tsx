import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../redux/store';

// Hexagon SVG helper
const hexPoints = (cx: number, cy: number, r: number) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i;
    points.push([
      cx + r * Math.cos(angle),
      cy + r * Math.sin(angle)
    ]);
  }
  return points.map(p => p.join(",")).join(" ");
};

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

  // Build a 7x15 grid (7 days x 15 weeks = 105 cells, enough for 1 year)
  const weeks = 15;
  const days = 7;
  const r = 9; // hex radius
  const xStep = r * 1.75;
  const yStep = r * 1.52;
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  // Map attendance data by date string
  const dataMap = Object.fromEntries(data.map(d => [d.date, d.count]));

  // Build grid data
  const grid: { x: number; y: number; date: string; count: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + w * 7 + d);
      if (cellDate > today) continue;
      const dateStr = cellDate.toISOString().slice(0, 10);
      grid.push({
        x: w * xStep + (d % 2 === 1 ? xStep / 2 : 0),
        y: d * yStep,
        date: dateStr,
        count: dataMap[dateStr] ?? -1 // -1 = empty, 0 = absent, 1 = present
      });
    }
  }

  return (
    <div className="my-4 max-w-xs mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-2 h-2 rounded-full bg-trueturquoise shadow-[0_0_8px_#00B8D9]" />
        <span className="text-paperwhite font-bold tracking-widest uppercase text-xs select-none">Attendance</span>
      </div>
      <div className="bg-offblack border border-softgray shadow-lg rounded-xl p-4 ring-1 ring-trueturquoise/10">
        {loading ? (
          <div className="text-xs text-teallight">Loading attendance...</div>
        ) : (
          <div className="py-2 flex justify-center">
            <svg
              width={weeks * xStep + r}
              height={days * yStep + r}
              className="block"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {grid.map((cell) => (
                <polygon
                  key={cell.date}
                  points={hexPoints(cell.x + r, cell.y + r, r)}
                  className={
                    cell.count === 1
                      ? 'fill-trueturquoise drop-shadow-[0_0_8px_#00B8D9] hover:fill-teallight hover:drop-shadow-[0_0_16px_#A0D8EF] transition-all duration-200'
                      : cell.count === 0
                      ? 'fill-softgray opacity-70'
                      : 'fill-offblack opacity-40'
                  }
                >
                  <title>{cell.date + ': ' + (cell.count === 1 ? 'Present' : cell.count === 0 ? 'Absent' : 'No data')}</title>
                </polygon>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHeatmap; 