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

  // Sidebar usable width: 208px, so use 200px for SVG
  // Build a 2-row grid for the current month, distributing days across columns
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dataMap = Object.fromEntries(data.map(d => [d.date, d.count]));
  const columns = Math.ceil(daysInMonth / 2);
  const rows = 2;
  const hexes = [];
  let dayCounter = 1;
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < columns; q++) {
      const cellDate = new Date(year, month, dayCounter);
      let hexObj;
      if (dayCounter > 0 && dayCounter <= daysInMonth) {
        const dateStr = cellDate.toISOString().slice(0, 10);
        hexObj = {
          q, r, s: -q - r, date: dateStr, count: dataMap[dateStr] ?? -1, isEmpty: false
        };
      } else {
        hexObj = {
          q, r, s: -q - r, date: '', count: -2, isEmpty: true
        };
      }
      hexes.push(hexObj);
      dayCounter++;
    }
  }

  // Centering logic for 2 rows
  const horizontalOffset = 0;
  const verticalOffset = 0;

  const colorMap = {
    present: 'fill-[var(--color-true-turquoise)]', // #00B8D9
    absent: 'fill-[var(--color-rust)]',           // #B7410E
    nodata: 'fill-[var(--color-soft-gray)]',      // #E5E7EB
    empty: 'fill-[var(--color-offblack)]',        // #121212
  };

  // Tooltip
  const tooltip = hovered ? (() => {
    const hex = hexes.find(h => h.date === hovered);
    if (!hex) return null;
    return (
      <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-3 py-1 rounded-xl bg-[var(--color-offblack)] border border-[var(--color-true-turquoise)] text-xs text-[var(--color-paper-white)] shadow-2xl pointer-events-none animate-fade-in font-primary flex flex-col items-center gap-1">
        <div className="font-bold tracking-wide text-[var(--color-true-turquoise)]">{hex.date}</div>
        <div className="text-sm">{hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No Data'}</div>
      </div>
    );
  })() : null;

  return (
    <div className="flex flex-col items-center w-full font-primary">
      <div className="w-full flex flex-col items-center">
        <div className="bg-paperwhite/10 rounded-xl shadow-lg border border-paperwhite/20 w-full flex flex-col items-center p-2 sm:p-4">
          {loading ? (
            <div className="text-xs text-teallight font-primary">Loading attendance...</div>
          ) : (
            <div className="flex flex-col items-center w-full relative">
              {tooltip}
              <HexGrid 
                width="100%" 
                height="min(80px,18vw)" 
                viewBox={`-0.5 -0.5 ${columns} 2`} 
                className="w-full max-w-[98vw] h-[80px] sm:h-[90px] md:h-[100px] lg:h-[110px] mx-auto flex justify-center items-center">
                <Layout size={{ x: 0.4, y: 0.4 }} flat={false} spacing={1.25} origin={{ x: horizontalOffset, y: verticalOffset }}>
                  {hexes.map((hex, idx) => {
                    const isHovered = hovered === hex.date && !hex.isEmpty;
                    let fillClass =
                      hex.isEmpty
                        ? colorMap.empty
                        : hex.count === 1
                        ? colorMap.present
                        : hex.count === 0
                        ? colorMap.absent
                        : colorMap.nodata;
                    if (isHovered) fillClass = 'fill-[var(--color-true-turquoise)]';
                    return (
                      <motion.g
                        key={hex.date + idx}
                        whileHover={hex.isEmpty ? {} : { scale: 1.25, filter: 'drop-shadow(0 0 16px var(--color-true-turquoise))' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        style={{ zIndex: isHovered ? 20 : 1 }}
                        onMouseEnter={() => !hex.isEmpty && setHovered(hex.date)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <Hexagon
                          q={hex.q}
                          r={hex.r}
                          s={hex.s}
                          className={[
                
                            isHovered ? 'ring-2 ring-[var(--color-true-turquoise)]/90 shadow-2xl' : '',
                            'stroke-2 transition-all duration-200 cursor-pointer',
                          ].join(' ')}
                        >
                          {hex.date && (
                            <title>{hex.date + ': ' + (hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No data')}</title>
                          )}
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
    </div>
  );
};

export default AttendanceHeatmap;
