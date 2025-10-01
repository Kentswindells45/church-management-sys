/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Modal component for creating new events
 * Handles form input and validation
 * Supports image upload and date selection
 */
interface AddEventModalProps {
  onClose: () => void;
  onAdd: (eventData: any) => void;
}

export default function AddEventModal({ onClose, onAdd }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: new Date(),
    time: "12:00",
    location: "",
    attendees: 0,
    description: "",
    organizer: "",
    imageUrl: "",
    category: "general",
    isRecurring: false,
    recurringFrequency: "weekly",
    maxAttendees: 0,
    registrationRequired: false,
    registrationDeadline: new Date(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    { value: "general", label: "General Event" },
    { value: "worship", label: "Worship Service" },
    { value: "youth", label: "Youth Program" },
    { value: "children", label: "Children's Program" },
    { value: "community", label: "Community Outreach" },
    { value: "prayer", label: "Prayer Meeting" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Event name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.maxAttendees < 0) newErrors.maxAttendees = "Invalid number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const eventDateTime = new Date(formData.date);
    const [hours, minutes] = formData.time.split(":");
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));

    onAdd({
      ...formData,
      id: Date.now(),
      date: eventDateTime.toISOString(),
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Info size={16} className="text-primary" />
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 
                  focus:ring-primary/20 focus:border-primary ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter event name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Date *
              </label>
              <DatePicker
                selected={formData.date}
                onChange={(date) =>
                  setFormData({ ...formData, date: date || new Date() })
                }
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/20 focus:border-primary"
                dateFormat="MMMM d, yyyy"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter location"
              />
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Maximum Attendees
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAttendees: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/20 focus:border-primary"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={4}
              placeholder="Enter event description"
            />
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-900">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Recurring Event
              </label>
              <label className="flex items-center gap-2 text-gray-900">
                <input
                  type="checkbox"
                  checked={formData.registrationRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationRequired: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Registration Required
              </label>
            </div>

            {formData.registrationRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Registration Deadline
                </label>
                <DatePicker
                  selected={formData.registrationDeadline}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      registrationDeadline: date || new Date(),
                    })
                  }
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Event Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="event-image"
                />
                <label
                  htmlFor="event-image"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 
                    rounded-lg cursor-pointer hover:bg-gray-50 text-gray-900"
                >
                  <ImageIcon size={18} />
                  Choose Image
                </label>
              </div>
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Event
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
