import React, { useEffect, useState } from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAppSelector } from '../redux/store';

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

  // Build hexes for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const start = new Date(year, month, 1);
  const dataMap = Object.fromEntries(data.map(d => [d.date, d.count]));
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
          q, r, s: -q - r, date: dateStr, count: dataMap[dateStr] ?? -1
        });
      }
      dayCounter++;
    }
  }

  // Tooltip
  const tooltip = hovered ? (() => {
    const hex = hexes.find(h => h.date === hovered);
    if (!hex) return null;
    return (
      <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-50 px-3 py-1 rounded-lg bg-offblack border border-softgray text-xs text-paperwhite shadow-lg pointer-events-none animate-fade-in font-primary">
        <div className="font-bold tracking-wide">{hex.date}</div>
        <div>{hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No Data'}</div>
      </div>
    );
  })() : null;

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
            <HexGrid width={300} height={170} viewBox="-1.5 -1.5 9 7" className="w-full h-auto">
              <Layout size={{ x: 1.1, y: 1.1 }} flat={false} spacing={1.12} origin={{ x: 0, y: 0 }}>
                {hexes.map((hex) => {
                  const isHovered = hovered === hex.date;
                  let fillClass =
                    hex.count === 1
                      ? 'fill-trueturquoise'
                      : hex.count === 0
                      ? 'fill-softgray'
                      : 'fill-gray-700';
                  if (isHovered) fillClass = 'fill-trueturquoise';
                  return (
                    <motion.g
                      key={hex.date}
                      whileHover={{ scale: 1.35, filter: 'drop-shadow(0 0 18px #00B8D9)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{ zIndex: isHovered ? 20 : 1 }}
                      onMouseEnter={() => setHovered(hex.date)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <Hexagon
                        q={hex.q}
                        r={hex.r}
                        s={hex.s}
                        className={[
                          fillClass,
                          isHovered ? 'ring-2 ring-trueturquoise/90 shadow-2xl' : '',
                          'stroke-none transition-all duration-200 cursor-pointer',
                        ].join(' ')}
                      >
                        <title>{hex.date + ': ' + (hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No data')}</title>
                      </Hexagon>
                    </motion.g>
                  );
                })}
              </Layout>
            </HexGrid>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
