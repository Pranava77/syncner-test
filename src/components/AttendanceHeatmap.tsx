import React, { useEffect, useState } from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import axios from 'axios';
import { useAppSelector } from '../redux/store';

const WEEKS = 15;
const DAYS = 7;

const COLOR_PRESENT = 'fill-trueturquoise';
const COLOR_ABSENT = 'fill-softgray';
const COLOR_EMPTY = 'fill-gray-700';
const COLOR_PRESENT_GLOW = 'drop-shadow-[0_0_12px_#00B8D9]';
const COLOR_ABSENT_GLOW = 'drop-shadow-[0_0_8px_#E5E7EB]';
const COLOR_EMPTY_GLOW = '';

const AttendanceHeatmap: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

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

  // Responsive grid size
  const gridWidth = 210;
  const gridHeight = 120;
  const hexSize = 1;
  const weeks = WEEKS;
  const days = DAYS;
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const dataMap = Object.fromEntries(data.map(d => [d.date, d.count]));

  // Build hexes for 7x15 grid
  const hexes = [];
  for (let q = 0; q < weeks; q++) {
    for (let r = 0; r < days; r++) {
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

  // Legend
  const legend = [
    { color: 'bg-trueturquoise', label: 'Present' },
    { color: 'bg-softgray', label: 'Absent' },
    { color: 'bg-gray-700', label: 'No Data' },
  ];

  // Tooltip content
  const tooltip = hovered
    ? (() => {
        const hex = hexes.find(h => h.date === hovered);
        if (!hex) return null;
        return (
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-50 px-3 py-1 rounded-lg bg-offblack border border-softgray text-xs text-paperwhite shadow-lg pointer-events-none animate-fade-in">
            <div className="font-bold tracking-wide">{hex.date}</div>
            <div>
              {hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No Data'}
            </div>
          </div>
        );
      })()
    : null;

  return (
    <div className="my-4 max-w-xs mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-2 h-2 rounded-full bg-trueturquoise shadow-[0_0_8px_#00B8D9]" />
        <span className="text-paperwhite font-extrabold tracking-widest uppercase text-xs select-none drop-shadow">Attendance</span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded-full border border-paperwhite/20 ${item.color}`}></span>
            <span className="text-xs text-teallight font-medium select-none">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-offblack border border-paperwhite/10 rounded-xl p-2 relative">
        {loading ? (
          <div className="text-xs text-teallight">Loading attendance...</div>
        ) : (
          <div className="flex justify-center py-1 relative">
            {tooltip}
            <HexGrid width={gridWidth} height={gridHeight} viewBox="-2 -2 18 8">
              <Layout size={{ x: hexSize, y: hexSize }} flat={false} spacing={1.05} origin={{ x: 0, y: 0 }}>
                {hexes.map((hex) => (
                  <Hexagon
                    key={hex.date}
                    q={hex.q}
                    r={hex.r}
                    s={hex.s}
                    className={
                      [
                        hex.count === 1
                          ? `${COLOR_PRESENT} ${COLOR_PRESENT_GLOW}`
                          : hex.count === 0
                          ? `${COLOR_ABSENT} ${COLOR_ABSENT_GLOW}`
                          : `${COLOR_EMPTY} ${COLOR_EMPTY_GLOW}`,
                        'stroke-none transition-all duration-200',
                        hovered === hex.date ? 'scale-125 z-10 ring-2 ring-trueturquoise/60 shadow-lg' : '',
                        'cursor-pointer',
                      ].join(' ')
                    }
                    onMouseEnter={() => setHovered(hex.date)}
                    onMouseLeave={() => setHovered(null)}
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
