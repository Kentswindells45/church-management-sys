/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

export default function EditEventModal({
  event,
  onClose,
  onEdit,
}: {
  event: any;
  onClose: () => void;
  onEdit: (event: any) => void;
}) {
  const [form, setForm] = useState({ ...event });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onEdit({ ...form, attendees: Number(form.attendees) || 0 });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full relative border-2 border-green-100"
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
        <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-gradient-to-r from-green-500 via-teal-400 to-cyan-500 bg-clip-text text-center drop-shadow">
          Edit Event
        </h2>
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Event Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-green-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-green-400"
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border border-cyan-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-cyan-400"
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full border border-teal-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-teal-400"
          />
          <input
            name="organizer"
            placeholder="Organizer"
            value={form.organizer}
            onChange={handleChange}
            className="w-full border border-green-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-green-400"
          />
          <input
            name="attendees"
            type="number"
            min="0"
            placeholder="Attendees"
            value={form.attendees}
            onChange={handleChange}
            className="w-full border border-cyan-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-cyan-400"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-teal-200 rounded px-3 py-2 text-black focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <button
          type="submit"
          className="mt-8 w-full bg-gradient-to-r from-green-500 via-teal-400 to-cyan-500 text-white py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
