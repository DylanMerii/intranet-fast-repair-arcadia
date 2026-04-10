import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Zap } from "lucide-react";
import ActiveWorkerCard from "../components/ActiveWorkerCard";
import AnnouncementCard from "../components/AnnouncementCard";
import AddAnnouncementDialog from "../components/AddAnnouncementDialog";

export default function Accueil() {
  const [activeShifts, setActiveShifts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [shifts, annonces, me] = await Promise.all([
      base44.entities.ServiceShift.filter({ is_active: true }),
      base44.entities.Announcement.list("-created_date", 20),
      base44.auth.me(),
    ]);
    setActiveShifts(shifts);
    setAnnouncements(annonces);
    setUser(me);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = user?.role === "admin";

  const handleDeleteAnnouncement = async (id) => {
    await base44.entities.Announcement.delete(id);
    loadData();
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
          Tableau de bord
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Bienvenue, {user?.full_name || "Dépanneur"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{activeShifts.length}</p>
            <p className="text-xs text-muted-foreground">Dépanneurs en service</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Zap className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">Opérationnel</p>
            <p className="text-xs text-muted-foreground">Statut du garage</p>
          </div>
        </div>
      </div>

      {/* Active Workers */}
      <div>
        <h2 className="font-oswald text-lg font-semibold tracking-wide text-foreground uppercase mb-4">
          En service actuellement
        </h2>
        {activeShifts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucun dépanneur en service</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeShifts.map((shift) => (
              <ActiveWorkerCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>

      {/* Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-oswald text-lg font-semibold tracking-wide text-foreground uppercase">
            Informations
          </h2>
          {isAdmin && <AddAnnouncementDialog user={user} onCreated={loadData} />}
        </div>
        {announcements.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucune annonce pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} isAdmin={isAdmin} onDelete={handleDeleteAnnouncement} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
