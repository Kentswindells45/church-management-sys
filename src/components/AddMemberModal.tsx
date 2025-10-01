import React, { useState } from "react";

export default function AddMemberModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (member: any) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    ministry: "",
    joined: "",
    phone: "",
    email: "",
    avatar: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      ...form,
      id: Date.now().toString(),
      avatar: form.avatar || "https://i.pravatar.cc/100",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur rounded-2xl p-8 max-w-md w-full shadow-xl relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-primary">Add New Member</h2>
        <div className="space-y-3">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <select
            name="ministry"
            value={form.ministry}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Ministry</option>
            <option value="Choir">Choir</option>
            <option value="Youth">Youth</option>
            <option value="Ushering">Ushering</option>
            <option value="Media">Media</option>
            <option value="Pastoral">Pastoral</option>
          </select>
          <input
            name="joined"
            type="date"
            value={form.joined}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="avatar"
            placeholder="Avatar URL (optional)"
            value={form.avatar}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-primary to-indigo-500 text-white py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
        >
          Add Member
        </button>
      </form>
    </div>
  );
}
