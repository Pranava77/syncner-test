import React, { useEffect, useState } from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useAppSelector } from '../redux/store';
import { CalendarIcon } from '@radix-ui/react-icons';

const AttendanceHeatmap: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setLoading(true);
    apiService.getAttendance(userId)
      .then(res => {
        // Deduplicate by date, prefer 'present' if multiple records for the same day
        const attendanceMap: Record<string, number> = {};
        (res.data || []).forEach((rec: { date: string, status: string }) => {
          const dateStr = new Date(rec.date).toISOString().slice(0, 10);
          // If multiple records for the same day, prefer 'present'
          if (attendanceMap[dateStr] !== 1) {
            attendanceMap[dateStr] = rec.status === 'present' ? 1 : 0;
          }
        });
        const attendance = Object.entries(attendanceMap).map(([date, count]) => ({ date, count }));
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

  // Get the range of months to display
  const monthRange: string[] = [];
  if (data.length > 0) {
    const dates = data.map(d => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    while (current <= end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      monthRange.push(key);
      current.setMonth(current.getMonth() + 1);
    }
  }

  // Helper to get days in a month
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Calculate attendance statistics
  const totalDays = data.length;
  const presentDays = data.filter(d => d.count === 1).length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-paperwhite/5 to-paperwhite/10 rounded-2xl shadow-2xl p-6 lg:p-8 border border-paperwhite/20 backdrop-blur-sm">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-trueturquoise/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-trueturquoise" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-paperwhite">Attendance Tracker</h2>
              <p className="text-teallight text-sm">Monitor your daily learning commitment</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-trueturquoise">{attendanceRate}%</div>
            <div className="text-xs text-teallight">Attendance Rate</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center bg-gradient-to-br from-trueturquoise/10 to-blue-500/10 rounded-lg p-3 border border-trueturquoise/20">
            <div className="text-xl font-bold text-trueturquoise">{totalDays}</div>
            <div className="text-xs text-teallight">Total Days</div>
          </div>
          <div className="text-center bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 border border-green-500/20">
            <div className="text-xl font-bold text-green-400">{presentDays}</div>
            <div className="text-xs text-teallight">Present</div>
          </div>
          <div className="text-center bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20">
            <div className="text-xl font-bold text-orange-400">{totalDays - presentDays}</div>
            <div className="text-xs text-teallight">Absent</div>
          </div>
        </div>

        {/* Heatmap Container */}
        <div className="bg-gradient-to-r from-paperwhite/5 to-paperwhite/10 rounded-xl p-4 border border-paperwhite/20 shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center w-full relative gap-6">
              {/* Single month skeleton to match the actual structure */}
              <div className="w-full flex items-center justify-between">
                {/* Hexagonal grid skeleton */}
                <div className="w-full max-w-[98vw] h-[80px] sm:h-[90px] md:h-[100px] lg:h-[110px] mx-auto flex justify-center items-center">
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 16 }).map((_, i) => {
                      // Create varied opacity for more realistic appearance
                      const opacityVariants = ['10', '20', '30', '40'];
                      const randomOpacity = opacityVariants[Math.floor(Math.random() * opacityVariants.length)];
                      
                      return (
                        <div
                          key={i}
                          className={`w-4 h-4 bg-paperwhite/${randomOpacity} rounded-sm animate-pulse`}
                          style={{
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Month label skeleton */}
                <div className="text-sm font-label mb-2 ml-4 whitespace-nowrap min-w-[90px] text-right">
                  <div className="h-4 bg-paperwhite/20 rounded w-20 animate-pulse mb-1" />
                  <div className="h-3 bg-paperwhite/10 rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full relative gap-6">
              {monthRange.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-sm text-teallight font-primary">No attendance data available.</div>
                  <div className="text-xs text-teallight mt-2">Start tracking your daily progress!</div>
                </div>
              )}
              {monthRange.map((monthKey) => {
                const [year, month] = monthKey.split('-').map(Number);
                const daysInMonth = getDaysInMonth(year, month - 1);
                const monthData = attendanceByMonth[monthKey] || [];
                const dataMap = Object.fromEntries(
                  monthData.map(d => [new Date(d.date).toISOString().slice(0, 10), d.count])
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
                        q, r, s: -q - r, date: dateStr, count: dataMap[dateStr] ?? -1, isEmpty: !(dateStr in dataMap)
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
                const hasData = monthData.length > 0;
                const monthPresent = monthData.filter(d => d.count === 1).length;
                const monthRate = Math.round((monthPresent / daysInMonth) * 100);
                
                return (
                  <div key={monthKey} className="w-full flex items-center justify-between">
                    <HexGrid 
                      width="100%" 
                      height="min(80px,18vw)" 
                      viewBox={`-0.5 -0.5 ${columns} 2`} 
                      className="w-full max-w-[98vw] h-[80px] sm:h-[90px] md:h-[100px] lg:h-[110px] mx-auto flex justify-center items-center">
                      <Layout size={{ x: 0.4, y: 0.4 }} flat={false} spacing={1.25} origin={{ x: 0, y: 0 }}>
                        {hexes.map((hex, idx) => {
                          const isHovered = hovered === hex.date && !hex.isEmpty && hasData;
                          let fillColor = hex.isEmpty
                            ? 'var(--color-black)'
                            : hex.count === 1
                            ? 'var(--color-true-turquoise)'
                            : hex.count === 0
                            ? 'var(--color-rust)'
                            : 'var(--color-black)';
                          // Keep original color on hover, just add brightness
                          if (isHovered) {
                            if (hex.count === 1) {
                              fillColor = 'var(--color-true-turquoise)'; // Keep blue for present
                            } else if (hex.count === 0) {
                              fillColor = 'var(--color-rust)'; // Keep red for absent
                            }
                          }
                          return (
                            <motion.g
                              key={hex.date + idx}
                              whileHover={hex.isEmpty || !hasData ? {} : { 
                                scale: 1.25, 
                                filter: hex.count === 1 
                                  ? 'drop-shadow(0 0 16px var(--color-true-turquoise))' 
                                  : hex.count === 0 
                                  ? 'drop-shadow(0 0 16px var(--color-rust))' 
                                  : 'drop-shadow(0 0 16px var(--color-true-turquoise))'
                              }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              style={{ zIndex: isHovered ? 20 : 1 }}
                              onMouseEnter={e => {
                                if (!hex.isEmpty && hasData) {
                                  setHovered(hex.date);
                                  const rect = (e.target as SVGElement).getBoundingClientRect();
                                  setTooltip({
                                    x: rect.left + window.scrollX,
                                    y: rect.top + window.scrollY,
                                    content: `${hex.date}: ${hex.count === 1 ? 'Present' : hex.count === 0 ? 'Absent' : 'No data'}`
                                  });
                                }
                              }}
                              onMouseLeave={() => {
                                setHovered(null);
                                setTooltip(null);
                              }}
                            >
                              <Hexagon
                                q={hex.q}
                                r={hex.r}
                                s={hex.s}
                                style={{ fill: fillColor }}
                                className={[
                                  'stroke-[var(--color-paper-white)]/20',
                                  isHovered ? `ring-2 shadow-2xl ${
                                    hex.count === 1 
                                      ? 'ring-[var(--color-true-turquoise)]/90' 
                                      : hex.count === 0 
                                      ? 'ring-[var(--color-rust)]/90' 
                                      : 'ring-[var(--color-true-turquoise)]/90'
                                  }` : '',
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
                    <div
                      className="text-sm font-label mb-2 ml-4 whitespace-nowrap min-w-[90px] text-right"
                      style={{ color: hasData ? 'var(--color-grey-label)' : 'var(--color-black)' }}
                    >
                      <div className="text-paperwhite font-semibold">
                        {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                      {hasData && (
                        <div className="text-xs mt-1 font-label text-teallight">
                          <div className="text-trueturquoise font-semibold">{monthRate}%</div>
                          <div>Present: {monthPresent}/{daysInMonth}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-paperwhite/10">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-teallight">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-trueturquoise rounded-sm"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rust rounded-sm"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-paperwhite/20 rounded-sm border border-paperwhite/30"></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x - 160, // 160px to the left of the hovered hex
            top: tooltip.y - 32, // slightly above the hex
            zIndex: 1000,
            pointerEvents: 'none',
          }}
          className="bg-gradient-to-br from-paperwhite/10 to-paperwhite/5 text-paperwhite px-4 py-2 rounded-xl shadow-2xl border border-paperwhite/20 text-xs font-label whitespace-nowrap animate-fade-in backdrop-blur-sm"
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default AttendanceHeatmap;
