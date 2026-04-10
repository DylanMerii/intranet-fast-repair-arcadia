import { User, Clock } from "lucide-react";
import moment from "moment";
import { useState, useEffect } from "react";

export default function ActiveWorkerCard({ shift }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const start = moment(shift.start_time);
      const diff = moment.duration(moment().diff(start));
      const h = Math.floor(diff.asHours());
      const m = diff.minutes();
      const s = diff.seconds();
      setElapsed(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [shift.start_time]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-300">
      <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{shift.user_name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">En service depuis {elapsed}</span>
        </div>
      </div>
      <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
    </div>
  );
}
