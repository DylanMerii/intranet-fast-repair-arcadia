import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Truck } from "lucide-react";
import moment from "moment";
import AddVehicleDialog from "../components/AddVehicleDialog";

const statusColors = {
  "En fourrière": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Récupéré": "bg-green-500/15 text-green-400 border-green-500/20",
  "En attente de destruction": "bg-red-500/15 text-red-400 border-red-500/20",
  "Détruit": "bg-muted text-muted-foreground border-border",
};

export default function Fourriere() {
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [list, me] = await Promise.all([
      base44.entities.FourriereVehicle.list("-created_date", 100),
      base44.auth.me(),
    ]);
    setVehicles(list);
    setUser(me);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-3xl font-bold tracking-wide text-foreground uppercase">
            Fourrière
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gestion des véhicules en fourrière</p>
        </div>
        <AddVehicleDialog user={user} onCreated={loadData} />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-4">
        <Truck className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{vehicles.filter((v) => v.status === "En fourrière").length}</span> véhicule(s) actuellement en fourrière
        </span>
      </div>

      {/* Table */}
      {vehicles.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucun véhicule en fourrière</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Propriétaire</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Véhicule</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Mise en fourrière</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Avant destruction</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{v.owner_name}</td>
                    <td className="px-5 py-4 text-sm text-foreground">{v.vehicle_name}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {moment(v.impound_date).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {moment(v.destruction_date).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[v.status] || "bg-muted text-muted-foreground"}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
