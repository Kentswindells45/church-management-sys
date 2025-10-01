import React from "react";

type Member = {
  id: string;
  name?: string;
  ministry?: string;
  joined?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  notes?: string;
};

export default function MemberModal({
  member,
  onClose,
  position,
}: {
  member: Member;
  onClose: () => void;
  position: { x: number; y: number };
}) {
  // Calculate modal position to keep it in viewport
  const modalWidth = 400;
  const modalHeight = 340;
  const padding = 16;
  let left = position.x;
  let top = position.y;

  if (left + modalWidth > window.innerWidth - padding) {
    left = window.innerWidth - modalWidth - padding;
  }
  if (top + modalHeight > window.innerHeight - padding) {
    top = window.innerHeight - modalHeight - padding;
  }
  left = Math.max(left, padding);
  top = Math.max(top, padding);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Modal */}
      <div
        className="fixed z-50 bg-white rounded-lg p-6 max-w-md w-full shadow-lg"
        style={{
          left: left,
          top: top,
          width: modalWidth,
          minWidth: 280,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold">{member.name}</h2>
            <p className="text-gray-500">{member.ministry}</p>
          </div>
        </div>
        <div className="space-y-1 text-gray-700">
          <div>
            <strong>Joined:</strong> {member.joined}
          </div>
          <div>
            <strong>Phone:</strong> {member.phone}
          </div>
          <div>
            <strong>Email:</strong> {member.email}
          </div>
          <div>
            <strong>Notes:</strong> {member.notes}
          </div>
        </div>
      </div>
    </>
  );
}
