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

  // Build a full 7xN grid for the current month, including empty hexes
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
  for (let r = 0; r < weeks; r++) { // r = row (week)
    for (let q = 0; q < days; q++) { // q = column (day)
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

  // Calculate leading and trailing empty hexes for centering
  const firstDayOfWeek = start.getDay();
  const totalCells = weeks * days;
  const filledCells = daysInMonth + firstDayOfWeek;
  const trailingEmpty = totalCells - filledCells;
  // Center horizontally: shift origin by half the number of leading empty hexes
  const horizontalOffset = firstDayOfWeek / 2;
  // Center vertically: shift origin by half the number of trailing empty rows (if any)
  const verticalOffset = trailingEmpty > 0 ? trailingEmpty / days / 2 : 0;

  // Tooltip
  const tooltip = hovered ? (() => {
    const hex = hexes.find(h => h.date === hovered);
    if (!hex) return null;
    return (
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-50 px-2 py-0.5 rounded-lg bg-offblack border border-softgray text-[10px] text-paperwhite shadow-lg pointer-events-none animate-fade-in font-primary">
        <div className="font-bold tracking-wide">{hex.date}</div>
        <div>{hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No Data'}</div>
      </div>
    );
  })() : null;

  return (
    <div className="flex justify-center w-full font-primary">
      <div className="bg-offblack rounded-xl p-2">
        {loading ? (
          <div className="text-xs text-teallight font-primary">Loading attendance...</div>
        ) : (
          <div className="flex justify-center py-1 relative w-full">
            {tooltip}
            <HexGrid width={180} height={100} viewBox="-1.2 -1.2 7.8 4.2" className="mx-auto h-auto">
              <Layout size={{ x: 0.7, y: 0.7 }} flat={false} spacing={1.1} origin={{ x: horizontalOffset, y: verticalOffset }}>
                {hexes.map((hex, idx) => {
                  const isHovered = hovered === hex.date && !hex.isEmpty;
                  let fillClass =
                    hex.isEmpty
                      ? 'fill-gray-800'
                      : hex.count === 1
                      ? 'fill-trueturquoise'
                      : hex.count === 0
                      ? 'fill-softgray'
                      : 'fill-gray-700';
                  if (isHovered) fillClass = 'fill-trueturquoise';
                  return (
                    <motion.g
                      key={hex.date + idx}
                      whileHover={hex.isEmpty ? {} : { scale: 1.35, filter: 'drop-shadow(0 0 18px #00B8D9)' }}
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
                          fillClass,
                          isHovered ? 'ring-2 ring-trueturquoise/90 shadow-2xl' : '',
                          'stroke-none transition-all duration-200 cursor-pointer',
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
  );
};

export default AttendanceHeatmap;
