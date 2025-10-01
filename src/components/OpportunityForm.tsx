import React, { useState } from "react";

type Opportunity = {
  id: string;
  title: string;
  ministry: string;
  date: string;
  skillsRequired: string[];
  spots: number;
  description?: string;
  color?: string;
};

export default function OpportunityForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Opportunity;
  onSave: (opp: Opportunity) => Promise<void> | void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [ministry, setMinistry] = useState(initial?.ministry ?? "General");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [spots, setSpots] = useState(initial?.spots?.toString() ?? "5");
  const [skills, setSkills] = useState((initial?.skillsRequired ?? []).join(", "));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? "from-amber-300 to-amber-500");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!title.trim()) return "Title is required";
    if (!date) return "Date is required";
    if (!/^\d+$/.test(spots) || Number(spots) < 0) return "Spots must be a non-negative integer";
    return null;
  }

  async function handleSave() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSaving(true);
    const opp: Opportunity = {
      id: initial?.id ?? `o_${Math.random().toString(36).slice(2,9)}`,
      title: title.trim(),
      ministry: ministry.trim() || "General",
      date,
      skillsRequired: skills.split(",").map(s => s.trim()).filter(Boolean),
      spots: Number(spots),
      description: description.trim(),
      color,
    };
    try {
      await onSave(opp);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-lg shadow-xl p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{initial ? "Edit Opportunity" : "New Opportunity"}</h3>
          <button className="text-sm text-slate-500" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600">Ministry</label>
              <input value={ministry} onChange={e=>setMinistry(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600">Spots</label>
              <input value={spots} onChange={e=>setSpots(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Color</label>
              <select value={color} onChange={e=>setColor(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="from-amber-300 to-amber-500">Amber</option>
                <option value="from-sky-300 to-sky-500">Sky</option>
                <option value="from-indigo-300 to-indigo-600">Indigo</option>
                <option value="from-pink-300 to-pink-500">Pink</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600">Skills (comma separated)</label>
            <input value={skills} onChange={e=>setSkills(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} />
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <button className="px-3 py-2 rounded bg-white border" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="px-4 py-2 rounded bg-amber-400 text-slate-900 font-semibold shadow" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}