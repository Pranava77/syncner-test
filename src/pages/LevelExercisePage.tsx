import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import LevelsSidebar from '../components/LevelsSidebar';

const randomStatus = () => (Math.random() > 0.5 ? 'Completed' : 'Pending');

const mandatoryTasks = [
  { id: 1, name: 'Explain & Record', brief: 'Explain the topic your friend & record', difficulty: 'Easy', points: 5, status: randomStatus() },
  { id: 2, name: 'Explain & Record', brief: 'Explain the topic your friend & record', difficulty: 'Medium', points: 10, status: randomStatus() },
  { id: 3, name: 'Explain & Record', brief: 'Explain the topic your friend & record', difficulty: 'Medium', points: 10, status: randomStatus() },
  { id: 4, name: 'Explain & Record', brief: 'Explain the topic your friend & record', difficulty: 'Hard', points: 15, status: randomStatus() },
];

const optionalTasks = [
  { id: 1, name: 'Explain & Record', brief: 'Explain the topic your friend & record', difficulty: 'Hard', points: 15, status: randomStatus() },
  { id: 2, name: 'Explain & Record', brief: 'Explain the topic your friend & record', difficulty: 'Extreme', points: 20, status: randomStatus() },
];

const statusColor = (status: string) =>
  status === 'Completed' ? 'bg-trueturquoise/20 text-trueturquoise' : 'bg-paperwhite/10 text-teallight';

const LevelExercisePage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const levelNum = Number(levelId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-offblack overflow-x-hidden">
      <LevelsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentLevel={levelNum} currentSection="exercise" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-offblack max-w-full flex flex-col items-center">
        <div className="w-full max-w-5xl bg-paperwhite/5 rounded-xl border border-paperwhite/20 shadow-lg p-6 mb-8">
          <h1 className="text-xl font-bold text-paperwhite mb-6">Mandatory Task</h1>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-teallight uppercase border-b border-paperwhite/10">
                  <th className="py-2 px-3  font-semibold">S.No</th>
                  <th className="py-2 px-3 font-semibold">Task name</th>
                  <th className="py-2 px-3 font-semibold">Brief</th>
                  <th className="py-2 px-3 font-semibold">Difficulty Level</th>
                  <th className="py-2 px-3 font-semibold">Credit Points</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {mandatoryTasks.map((task, idx) => (
                  <tr key={task.id} className="border-b border-paperwhite/10 last:border-b-0 hover:bg-paperwhite/10 transition">
                    <td className="py-3 px-3 text-paperwhite/90">{idx + 1}</td>
                    <td className="py-3 px-3 text-paperwhite font-semibold">{task.name}</td>
                    <td className="py-3 px-3 text-teallight">{task.brief}</td>
                    <td className="py-3 px-3">
                      <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-xs uppercase">{task.difficulty}</span>
                    </td>
                    <td className="py-3 px-3 text-trueturquoise font-bold">{task.points}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${statusColor(task.status)}`}>{task.status}</span>
                        <button className="bg-paperwhite text-offblack px-4 py-1 rounded font-bold text-sm shadow hover:bg-trueturquoise hover:text-offblack transition-colors">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="text-lg font-bold text-paperwhite mt-8 mb-4">Optional</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-teallight uppercase border-b border-paperwhite/10">
                  <th className="py-2 px-3 font-semibold">S.No</th>
                  <th className="py-2 px-3 font-semibold">Task name</th>
                  <th className="py-2 px-3 font-semibold">Brief</th>
                  <th className="py-2 px-3 font-semibold">Difficulty Level</th>
                  <th className="py-2 px-3 font-semibold">Credit Points</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {optionalTasks.map((task, idx) => (
                  <tr key={task.id} className="border-b border-paperwhite/10 last:border-b-0 hover:bg-paperwhite/10 transition">
                    <td className="py-3 px-3 text-paperwhite/90">{idx + 1}</td>
                    <td className="py-3 px-3 text-paperwhite font-semibold">{task.name}</td>
                    <td className="py-3 px-3 text-teallight">{task.brief}</td>
                    <td className="py-3 px-3">
                      <span className="px-3 py-1 rounded-full bg-paperwhite/10 text-trueturquoise font-semibold text-xs uppercase">{task.difficulty}</span>
                    </td>
                    <td className="py-3 px-3 text-trueturquoise font-bold">{task.points}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${statusColor(task.status)}`}>{task.status}</span>
                        <button className="bg-paperwhite text-offblack px-4 py-1 rounded font-bold text-sm shadow hover:bg-trueturquoise hover:text-offblack transition-colors">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button className="mt-4 bg-trueturquoise text-offblack px-10 py-3 rounded-lg font-bold text-lg shadow hover:bg-teallight transition-colors">Submit</button>
      </main>
    </div>
  );
};

export default LevelExercisePage; 