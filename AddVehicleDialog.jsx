import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AddVehicleDialog({ user, onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    owner_name: "",
    vehicle_name: "",
    impound_date: "",
    destruction_date: "",
    status: "En fourrière",
  });

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.owner_name || !form.vehicle_name || !form.impound_date || !form.destruction_date) return;
    setLoading(true);
    await base44.entities.FourriereVehicle.create({
      ...form,
      added_by: user.full_name || user.email,
    });
    setForm({ owner_name: "", vehicle_name: "", impound_date: "", destruction_date: "", status: "En fourrière" });
    setOpen(false);
    setLoading(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un véhicule
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Ajouter un véhicule en fourrière</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder="Nom du propriétaire" value={form.owner_name} onChange={(e) => update("owner_name", e.target.value)} className="bg-secondary border-border" />
          <Input placeholder="Nom du véhicule" value={form.vehicle_name} onChange={(e) => update("vehicle_name", e.target.value)} className="bg-secondary border-border" />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date de mise en fourrière</label>
            <Input type="datetime-local" value={form.impound_date} onChange={(e) => update("impound_date", e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date avant destruction</label>
            <Input type="datetime-local" value={form.destruction_date} onChange={(e) => update("destruction_date", e.target.value)} className="bg-secondary border-border" />
          </div>
          <Select value={form.status} onValueChange={(v) => update("status", v)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="En fourrière">En fourrière</SelectItem>
              <SelectItem value="Récupéré">Récupéré</SelectItem>
              <SelectItem value="En attente de destruction">En attente de destruction</SelectItem>
              <SelectItem value="Détruit">Détruit</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
