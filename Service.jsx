import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Square, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

function getWeekStart() {
  // Week starts Sunday at 12:00
  const now = moment();
  let weekStart = moment(now).startOf("isoWeek").subtract(1, "day").hour(12).minute(0).second(0);
  if (now.isBefore(weekStart)) {
    weekStart.subtract(7, "days");
  }
  return weekStart.toISOString();
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function LiveTimer({ startTime }) {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = moment.duration(moment().diff(moment(startTime)));
      const h = Math.floor(diff.asHours());
      const m = diff.minutes();
      const s = diff.seconds();
      setElapsed(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className="font-mono text-primary font-semibold">{elapsed}</span>;
}

export default function Service() {
  const [user, setUser] = useState(null);
  const [myActiveShift, setMyActiveShift] = useState(null);
  const [allShifts, setAllShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const weekStart = getWeekStart();

  const loadData = useCallback(async () => {
    const me = await base44.auth.me();
    setUser(me);

    const [activeShifts, weekShifts] = await Promise.all([
      base44.entities.ServiceShift.filter({ is_active: true }),
      base44.entities.ServiceShift.filter({ week_start: weekStart }, "-start_time", 200),
    ]);

    const myActive = activeShifts.find((s) => s.user_email === me.email);
    setMyActiveShift(myActive || null);

    // Aggregate weekly totals per user
    const userMap = {};
    weekShifts.forEach((s) => {
      if (!userMap[s.user_email]) {
        userMap[s.user_email] = { user_name: s.user_name, user_email: s.user_email, total_minutes: 0, is_active: false, active_start: null };
      }
      if (s.is_active) {
        userMap[s.user_email].is_active = true;
        userMap[s.user_email].active_start = s.start_time;
      }
      userMap[s.user_email].total_minutes += s.duration_minutes || 0;
    });

    // Add current session time for active shifts
    activeShifts.forEach((s) => {
      if (userMap[s.user_email]) {
        const currentSessionMin = moment().diff(moment(s.start_time), "minutes", true);
        userMap[s.user_email].total_minutes += currentSessionMin;
      }
    });

    setAllShifts(Object.values(userMap).sort((a, b) => b.total_minutes - a.total_minutes));
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const startService = async () => {
    setActionLoading(true);
    await base44.entities.ServiceShift.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      start_time: new Date().toISOString(),
      is_active: true,
      duration_minutes: 0,
      week_start: weekStart,
    });
    await loadData();
    setActionLoading(false);
  };

  const endService = async () => {
    if (!myActiveShift) return;
    setActionLoading(true);
    const duration = moment().diff(moment(myActiveShift.start_time), "minutes", true);
    await base44.entities.ServiceShift.update(myActiveShift.id, {
      is_active: false,
      end_time: new Date().toISOString(),
      duration_minutes: Math.round(duration * 100) / 100,
    });
    await loadData();
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-oswald text-3xl font-bold tracking-wide text-foreground uppercase">
          Gestion du service
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Prenez votre service et suivez vos heures</p>
      </div>

      {/* My Service Toggle */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-oswald text-lg font-semibold tracking-wide text-foreground uppercase mb-4">
          Mon service
        </h2>
        {myActiveShift ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">Vous êtes en service</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <LiveTimer startTime={myActiveShift.start_time} />
                </div>
              </div>
            </div>
            <Button onClick={endService} disabled={actionLoading} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" />
              Fin de service
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Vous n'êtes pas en service</p>
            </div>
            <Button onClick={startService} disabled={actionLoading} className="gap-2">
              <Play className="h-4 w-4" />
              Prendre le service
            </Button>
          </div>
        )}
      </div>

      {/* All workers this week */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-oswald text-lg font-semibold tracking-wide text-foreground uppercase">
            Équipe cette semaine
          </h2>
        </div>

        {allShifts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucun service cette semaine</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Dépanneur</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Statut</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Session en cours</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Total semaine</th>
                  </tr>
                </thead>
                <tbody>
                  {allShifts.map((worker) => (
                    <tr key={worker.user_email} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-foreground">{worker.user_name}</td>
                      <td className="px-5 py-4">
                        {worker.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            En service
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Hors service</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {worker.is_active && worker.active_start ? (
                          <LiveTimer startTime={worker.active_start} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-mono font-semibold text-foreground">
                        {formatDuration(worker.total_minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
