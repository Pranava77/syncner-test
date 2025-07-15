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

  // Centering logic
  const firstDayOfWeek = start.getDay();
  const totalCells = weeks * days;
  const filledCells = daysInMonth + firstDayOfWeek;
  const trailingEmpty = totalCells - filledCells;
  const horizontalOffset = firstDayOfWeek / 2;
  const verticalOffset = trailingEmpty > 0 ? trailingEmpty / days / 2 : 0;

  const colorMap = {
    present: 'fill-[#00D084]', // Vibrant green
    absent: 'fill-[#FF5A5F]',  // Vibrant red
    nodata: 'fill-[#B0BEC5]',  // Soft gray
    empty: 'fill-gray-800',
  };

  // Tooltip
  const tooltip = hovered ? (() => {
    const hex = hexes.find(h => h.date === hovered);
    if (!hex) return null;
    return (
      <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-3 py-1 rounded-xl bg-[#23272F] border border-[#00D084] text-xs text-white shadow-2xl pointer-events-none animate-fade-in font-primary flex flex-col items-center gap-1">
        <div className="font-bold tracking-wide text-[#00D084]">{hex.date}</div>
        <div className="text-sm">{hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No Data'}</div>
      </div>
    );
  })() : null;

  // Legend
  const legend = (
    <div className="flex justify-center gap-6 mt-4 mb-2 text-xs font-primary">
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block bg-[#00D084] border border-[#00D084]"></span> Present</div>
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block bg-[#FF5A5F] border border-[#FF5A5F]"></span> Absent</div>
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block bg-[#B0BEC5] border border-[#B0BEC5]"></span> No Data</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full font-primary">
      <div className="w-full flex flex-col items-center">
        <h2 className="text-lg font-bold text-paperwhite mb-2 mt-1 tracking-wide">Attendance Heatmap</h2>
        <div className="bg-offblack rounded-2xl p-4 shadow-lg w-full max-w-xl flex flex-col items-center">
          {loading ? (
            <div className="text-xs text-teallight font-primary">Loading attendance...</div>
          ) : (
            <div className="flex flex-col items-center w-full relative">
              {tooltip}
              <HexGrid width="100%" height="180px" viewBox="-0.5 -0.5 7 4" className="w-full h-[180px] mx-auto">
                <Layout size={{ x: 1.6, y: 1.6 }} flat={false} spacing={1.0} origin={{ x: horizontalOffset, y: verticalOffset }}>
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
                    if (isHovered) fillClass = 'fill-[#00D084]';
                    return (
                      <motion.g
                        key={hex.date + idx}
                        whileHover={hex.isEmpty ? {} : { scale: 1.25, filter: 'drop-shadow(0 0 16px #00D084)' }}
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
                            isHovered ? 'ring-2 ring-[#00D084]/90 shadow-2xl' : '',
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
              {legend}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
