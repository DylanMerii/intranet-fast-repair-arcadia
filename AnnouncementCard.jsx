import { AlertTriangle, Info, Bell, Trash2 } from "lucide-react";
import moment from "moment";
import { Button } from "@/components/ui/button";

const priorityConfig = {
  normal: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  important: { icon: Bell, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  urgent: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
};

export default function AnnouncementCard({ announcement, isAdmin, onDelete }) {
  const config = priorityConfig[announcement.priority] || priorityConfig.normal;
  const Icon = config.icon;

  return (
    <div className={`bg-card border ${config.border} rounded-xl p-4 transition-all duration-300 hover:border-primary/20`}>
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground">{announcement.title}</h3>
            {isAdmin && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(announcement.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{announcement.content}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            {announcement.author} • {moment(announcement.created_date).fromNow()}
          </p>
        </div>
      </div>
    </div>
  );
}
