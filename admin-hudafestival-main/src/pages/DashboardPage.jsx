import GridLoader from '@/components/smoothui/grid-loader';
import React, { useEffect, useState } from 'react';
import { Users, Calendar, Trophy, BarChart3 } from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import GettingStartedCard from '../components/GettingStartedCard';
import DashboardHero from '../components/DashboardHero';

const DashboardPage = () => {
  const [stats, setStats] = useState({ teams: 0, programmes: 0, candidates: 0, published: 0 });
  const [progressData, setProgressData] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, progsRes, candsRes, lbRes, progRes] = await Promise.all([
          api.get('/teams'),
          api.get('/programmes'),
          api.get('/candidates'),
          api.get('/leaderboards'),
          api.get('/settings/dashboard-progress')
        ]);
        setStats({
          teams: teamsRes.data.length,
          programmes: progsRes.data.length,
          candidates: candsRes.data.length,
          published: progsRes.data.filter(p => p.isResultPublished).length,
        });
        setLeaderboard(lbRes.data);
        setProgressData(progRes.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto">
      <DashboardHero 
        userName={userInfo?.userName || 'Admin'} 
        roleName={userInfo?.role?.replace('_', ' ') || 'Admin'} 
      />

      {loading ? (
        <div className="flex justify-center p-12"><GridLoader size="lg" color="#ea580c" mode="pulse" pattern="solo-center" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Active Teams" value={stats.teams} color="bg-red-500 text-white" />
            <StatCard icon={Calendar} label="Programmes" value={stats.programmes} color="bg-orange-500 text-white" />
            <StatCard icon={Trophy} label="Candidates" value={stats.candidates} color="bg-emerald-500 text-white" />
            <StatCard icon={BarChart3} label="Published Results" value={stats.published} color="bg-indigo-600 text-white" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Getting Started Guide */}
            <div className="lg:col-span-1">
               <GettingStartedCard progressData={progressData} />
            </div>

            {/* Scoreboard */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Leaderboard */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col h-full">
                <h3 className="font-bold text-lg text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-[var(--color-primary)]" /> Team Scoreboard
                </h3>
                {leaderboard?.teamLeaderboard?.length > 0 ? (
                  <div className="space-y-3 pr-2">
                    {leaderboard.teamLeaderboard.map((team, index) => (
                      <div key={team._id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                        <div className="flex items-center gap-3">
                          <div className="w-6 font-bold text-[var(--color-text-muted)] text-sm">{index + 1}</div>
                          <div className="w-3 h-10 rounded-full" style={{ backgroundColor: team.color || '#ccc' }}></div>
                          <div>
                            <div className="font-bold text-[var(--color-text-heading)]">{team.name}</div>
                            {team.motto && <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{team.motto}</div>}
                          </div>
                        </div>
                        <div className="text-xl font-bold text-[var(--color-primary)]">{team.totalPoints}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--color-text-muted)] italic">No team scores available.</div>
                )}
              </div>

              {/* Category Toppers */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col h-full">
                <h3 className="font-bold text-lg text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-emerald-500" /> Category Toppers
                </h3>
                {leaderboard?.categoryTopStudents?.length > 0 ? (
                  <div className="space-y-4 flex-1 overflow-auto pr-2">
                    {leaderboard.categoryTopStudents.map(categoryData => {
                      const topper = categoryData.candidates?.[0];
                      if (!topper) return null;
                      return (
                        <div key={categoryData.category} className="pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                          <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                            {categoryData.category}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-[var(--color-text-heading)] text-sm">{topper.name}</div>
                              <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: topper.team?.color || '#ccc' }}></span>
                                {topper.team?.name || 'Unknown Team'}
                              </div>
                            </div>
                            <div className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded text-sm">
                              {topper.totalPoints} pts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--color-text-muted)] italic">No candidate scores available.</div>
                )}
              </div>
            </div>
          </div>
          
          {progressData?.teamWise && progressData.teamWise.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-6">Team Wise Progress</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {progressData.teamWise.map((teamData) => (
                  <GettingStartedCard key={teamData.teamId} progressData={teamData} title={teamData.teamName} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;