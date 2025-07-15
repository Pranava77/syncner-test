import React, { useEffect, useState } from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import axios from 'axios';
import { useAppSelector } from '../redux/store';
import { motion } from 'framer-motion';

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
  const gridWidth = 260;
  const gridHeight = 140;
  const hexSize = 1;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const start = new Date(year, month, 1);
  const dataMap = Object.fromEntries(data.map(d => [d.date, d.count]));

  // Build hexes for current month (7 columns, up to 5 rows)
  const weeks = Math.ceil((daysInMonth + start.getDay()) / 7);
  const days = 7;
  const hexes = [];
  let dayCounter = 1 - start.getDay();
  for (let q = 0; q < weeks; q++) {
    for (let r = 0; r < days; r++) {
      const cellDate = new Date(year, month, dayCounter);
      if (dayCounter > 0 && dayCounter <= daysInMonth) {
        const dateStr = cellDate.toISOString().slice(0, 10);
        hexes.push({
          q,
          r,
          s: -q - r,
          date: dateStr,
          count: dataMap[dateStr] ?? -1
        });
      }
      dayCounter++;
    }
  }

  // Tooltip content
  const tooltip = hovered
    ? (() => {
        const hex = hexes.find(h => h.date === hovered);
        if (!hex) return null;
        return (
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-50 px-3 py-1 rounded-lg bg-offblack border border-softgray text-xs text-paperwhite shadow-lg pointer-events-none animate-fade-in font-primary">
            <div className="font-bold tracking-wide">{hex.date}</div>
            <div>
              {hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No Data'}
            </div>
          </div>
        );
      })()
    : null;

  return (
    <div className="my-2 max-w-xs mx-auto font-primary">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-2 h-2 rounded-full bg-trueturquoise shadow-[0_0_8px_#00B8D9]" />
        <span className="text-paperwhite font-bold tracking-widest uppercase select-none drop-shadow text-xs font-primary">Attendance</span>
      </div>
      <div className="bg-offblack rounded-xl p-2">
        {loading ? (
          <div className="text-xs text-teallight font-primary">Loading attendance...</div>
        ) : (
          <div className="flex justify-center py-1 relative w-full">
            {tooltip}
            <HexGrid width={gridWidth} height={gridHeight} viewBox={`-1.5 -1.5 8.5 6.5`} className="w-full h-auto">
              <Layout size={{ x: hexSize, y: hexSize }} flat={false} spacing={1.05} origin={{ x: 0, y: 0 }}>
                {hexes.map((hex) => (
                  <motion.g
                    key={hex.date}
                    whileHover={{ scale: 1.35, filter: 'drop-shadow(0 0 16px #00B8D9)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{ zIndex: hovered === hex.date ? 20 : 1 }}
                    onMouseEnter={() => setHovered(hex.date)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <Hexagon
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
                          'cursor-pointer',
                        ].join(' ')
                      }
                    >
                      <title>{hex.date + ': ' + (hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No data')}</title>
                    </Hexagon>
                  </motion.g>
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
