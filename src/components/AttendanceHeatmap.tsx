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
    const userId = user?._id || user?.id;
    if (!userId) return;
    setLoading(true);
    axios.get(`/api/attendance/${userId}`)
      .then(res => {
        console.log('[AttendanceHeatmap] API response:', res);
        const attendance = (res.data.data || []).map((rec: any) => ({
          date: new Date(rec.date).toISOString().slice(0, 10),
          count: rec.status === 'present' ? 1 : 0
        }));
        setData(attendance);
      })
      .finally(() => setLoading(false));
  }, [user?._id, user?.id]);

  if (!user?._id && !user?.id) return null;

  // Group attendance data by month and year
  const attendanceByMonth: Record<string, { date: string; count: number }[]> = {};
  data.forEach((rec) => {
    const d = new Date(rec.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!attendanceByMonth[key]) attendanceByMonth[key] = [];
    attendanceByMonth[key].push(rec);
  });

  // Get all months sorted
  const allMonths = Object.keys(attendanceByMonth).sort();

  // Helper to get days in a month
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  return (
    <div className="flex flex-col items-center w-full font-primary">
      <div className="w-full flex flex-col items-center">
        <div className="bg-paperwhite/10 rounded-xl shadow-lg border border-paperwhite/20 w-full flex flex-col items-center p-2 sm:p-4">
          {loading ? (
            <div className="text-xs text-teallight font-primary">Loading attendance...</div>
          ) : (
            <div className="flex flex-col items-center w-full relative gap-6">
              {allMonths.length === 0 && (
                <div className="text-xs text-teallight font-primary">No attendance data available.</div>
              )}
              {allMonths.map((monthKey) => {
                const [year, month] = monthKey.split('-').map(Number);
                const daysInMonth = getDaysInMonth(year, month - 1);
                const dataMap = Object.fromEntries(
                  (attendanceByMonth[monthKey] || []).map(d => [new Date(d.date).toISOString().slice(0, 10), d.count])
                );
                const columns = Math.ceil(daysInMonth / 2);
                const rows = 2;
                const hexes = [];
                let dayCounter = 1;
                for (let r = 0; r < rows; r++) {
                  for (let q = 0; q < columns; q++) {
                    const cellDate = new Date(year, month - 1, dayCounter);
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
                return (
                  <div key={monthKey} className="w-full mb-4">
                    <div className="text-sm text-paperwhite font-label mb-2">
                      {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <HexGrid 
                      width="100%" 
                      height="min(80px,18vw)" 
                      viewBox={`-0.5 -0.5 ${columns} 2`} 
                      className="w-full max-w-[98vw] h-[80px] sm:h-[90px] md:h-[100px] lg:h-[110px] mx-auto flex justify-center items-center">
                      <defs>
                        <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-true-turquoise)" />
                          <stop offset="100%" stopColor="var(--color-true-turquoise)" />
                        </linearGradient>
                        <linearGradient id="absent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-rust)" />
                          <stop offset="100%" stopColor="var(--color-rust)" />
                        </linearGradient>
                        <linearGradient id="paperwhite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-paper-white)" />
                          <stop offset="100%" stopColor="var(--color-paper-white)" />
                        </linearGradient>
                      </defs>
                      <Layout size={{ x: 0.4, y: 0.4 }} flat={false} spacing={1.25} origin={{ x: 0, y: 0 }}>
                        {hexes.map((hex, idx) => {
                          const isHovered = hovered === hex.date && !hex.isEmpty;
                          let fillId =
                            hex.isEmpty
                              ? 'paperwhite'
                              : hex.count === 1
                              ? 'present'
                              : hex.count === 0
                              ? 'absent'
                              : 'paperwhite';
                          if (isHovered) fillId = 'present';
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
                                fill={fillId}
                                className={[
                                  'stroke-[var(--color-paper-white)]/20',
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
