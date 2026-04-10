import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AddAnnouncementDialog({ user, onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await base44.entities.Announcement.create({
      title,
      content,
      priority,
      author: user.full_name || user.email,
    });
    setTitle("");
    setContent("");
    setPriority("normal");
    setOpen(false);
    setLoading(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Nouvelle annonce</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary border-border" />
          <Textarea placeholder="Contenu de l'annonce..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="bg-secondary border-border" />
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Publication..." : "Publier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
