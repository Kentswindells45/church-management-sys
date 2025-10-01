/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

export default function EditMemberModal({
  member,
  onClose,
  onEdit,
}: {
  member: any;
  onClose: () => void;
  onEdit: (member: any) => void;
}) {
  const [form, setForm] = useState({ ...member });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onEdit(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full relative border-2 border-indigo-100"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-gradient-to-r from-indigo-600 via-pink-500 to-purple-600 bg-clip-text text-center drop-shadow">
          Edit Member
        </h2>
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-indigo-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
          />
          <select
            name="ministry"
            value={form.ministry}
            onChange={handleChange}
            required
            className="w-full border border-pink-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-pink-400"
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
            className="w-full border border-purple-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-cyan-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-cyan-400"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-indigo-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="avatar"
            placeholder="Avatar URL (optional)"
            value={form.avatar}
            onChange={handleChange}
            className="w-full border border-pink-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-pink-400"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border border-purple-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <button
          type="submit"
          className="mt-8 w-full bg-gradient-to-r from-indigo-600 via-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
