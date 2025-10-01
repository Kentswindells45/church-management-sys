/* eslint-disable @typescript-eslint/no-unused-vars */
/* Redesigned Members page with modern, ultra-realistic UI.
   Functionality (fetch, add, edit, delete, modals) is preserved. */
import React, { useEffect, useState } from "react";
import MemberModal from "../components/MemberModal";
import AddMemberModal from "../components/AddMemberModal";
import EditMemberModal from "../components/EditMemberModal";
import {
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  Search,
  Users as UsersIcon,
  Badge,
} from "lucide-react";

/* Member type: unchanged from prior implementation */
type Member = {
  id: string;
  name?: string;
  ministry?: string;
  joined?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  notes?: string;
  address?: string;
  additional?: string;
};

/* Ministries list — keep same values and colors */
const ministries = [
  { name: "All", color: "bg-gradient-to-r from-gray-300 to-gray-100" },
  { name: "Choir", color: "bg-gradient-to-r from-pink-400 to-fuchsia-500" },
  { name: "Youth", color: "bg-gradient-to-r from-blue-400 to-cyan-400" },
  { name: "Ushering", color: "bg-gradient-to-r from-green-400 to-emerald-500" },
  { name: "Media", color: "bg-gradient-to-r from-purple-400 to-indigo-500" },
  { name: "Pastoral", color: "bg-gradient-to-r from-yellow-400 to-amber-500" },
];

/* Reusable action button used in the table footer and header */
const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = "primary",
}: {
  label: string;
  icon: React.ElementType;
  onClick: (e?: React.MouseEvent) => void;
  variant?: "primary" | "export" | "danger";
}) => {
  // All action buttons use blue background + white text (consistent and non-disruptive)
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm shadow-md focus:outline-none focus:ring-2 transition";
  const blueBg = "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300";

  // Icon colors still depict function (natural/semantic hues) while the button bg is blue
  const iconColors: Record<string, string> = {
    primary: "text-emerald-200", // add -> greenish icon tint
    export: "text-sky-100", // export -> sky tint
    danger: "text-rose-200", // danger -> red tint
  };

  return (
    <button onClick={onClick} className={`${base} ${blueBg}`}>
      <Icon
        size={16}
        className={`${iconColors[variant] ?? "text-white"} shrink-0`}
      />
      {label}
    </button>
  );
};

/* Small icon-only button for row actions (keeps existing handlers stable) */
const IconButton = ({
  onClick,
  icon: Icon,
  title,
  variant = "default",
}: {
  onClick: (e?: React.MouseEvent) => void;
  icon: React.ElementType;
  title?: string;
  variant?: "view" | "edit" | "delete" | "default";
}) => {
  // base styles: consistent blue button with white text
  const base =
    "p-2 rounded-md inline-flex items-center justify-center transition-transform focus:outline-none focus:ring-2";
  const blueBtn = "bg-blue-500 text-white hover:bg-blue-600 shadow-sm";

  // icon color map — icons keep their semantic/natural color while button bg remains blue
  const iconColorMap: Record<string, string> = {
    view: "text-blue-100", // view icon: blue hue
    edit: "text-emerald-100", // edit icon: green hue
    delete: "text-rose-100", // delete icon: red hue
    default: "text-white", // fallback
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${base} ${blueBtn}`}
      aria-label={title}
    >
      <Icon size={16} className={`${iconColorMap[variant] ?? "text-white"}`} />
    </button>
  );
};

export default function Members() {
  /* state & behavior preserved */
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [ministry, setMinistry] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [modalPosition, setModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null); // track expanded card

  /* fetch members (unchanged API behavior) */
  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (ministry !== "All") params.append("ministry", ministry);

      try {
        const res = await fetch(`/api/members?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        setMembers(data);
      } catch (err: unknown) {
        setError("Could not load members.");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [search, ministry]);

  /* CRUD helpers (same behavior) */
  function handleAddMember(newMember: Member) {
    setMembers((prev) => [newMember, ...prev]);
  }

  function handleEditMember(updated: Member) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleDeleteMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  /* Export CSV — keeps original behavior but improved CSV quoting */
  function handleExport() {
    if (!members.length) return;
    const keys = [
      "id",
      "name",
      "ministry",
      "joined",
      "phone",
      "email",
      "notes",
    ];
    const rows = members.map((m) =>
      keys
        .map((k) => `"${String((m as never)[k] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [keys.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Member Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organized list of church members — view, edit or export membership
            data.
          </p>
        </div>

        {/* Controls: search, ministry filter, actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 py-2 w-64 rounded-lg border border-slate-200 bg-white shadow-sm text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="Search members"
            />
          </div>

          <select
            value={ministry}
            onChange={(e) => setMinistry(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Filter by ministry"
          >
            {ministries.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <ActionButton
              icon={Plus}
              label="Add Member"
              onClick={() => setShowAddModal(true)}
              variant="primary"
            />
            <ActionButton
              icon={Download}
              label="Export"
              onClick={handleExport}
              variant="export"
            />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl bg-white shadow-md p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50">
            <UsersIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">
              {members.length}
            </div>
            <div className="text-xs text-slate-500">Total Members</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-md p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-pink-50 to-fuchsia-50">
            <Badge className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-200">
              {ministries.length - 1}
            </div>
            <div className="text-xs text-slate-500">Ministries</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-md p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <UsersIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">
              {
                members.filter(
                  (m) =>
                    m.joined &&
                    new Date(m.joined).getMonth() === new Date().getMonth() &&
                    new Date(m.joined).getFullYear() ===
                      new Date().getFullYear()
                ).length
              }
            </div>
            <div className="text-xs text-slate-500">New This Month</div>
          </div>
        </div>
      </div>

      {/* Members container */}
      <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">Members</div>
          <div className="text-xs text-slate-500">{members.length} results</div>
        </div>

        {/* Responsive cards grid (no horizontal scroll) */}
        <div>
          {loading ? (
            <div className="p-6 text-center text-slate-500">
              Loading members...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-600">Error: {error}</div>
          ) : members.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No members found.
            </div>
          ) : (
            <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => {
                const ministryColor =
                  ministries.find((m) => m.name === member.ministry)?.color ||
                  "bg-gradient-to-r from-gray-200 to-gray-100";

                return (
                  <article
                    key={member.id}
                    className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg,#eef2ff 0%, #fee2e2 100%)",
                        }}
                      >
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-700">
                            {member.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {member.joined ?? "—"}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {member.notes ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div>
                        <div className="text-xs text-slate-500">Ministry</div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mt-1 ${ministryColor}`}
                        >
                          {member.ministry ?? "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Phone</div>
                        <div className="mt-1">{member.phone ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Email</div>
                        <div className="mt-1 break-words">
                          {member.email ?? "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Joined</div>
                        <div className="mt-1">{member.joined ?? "—"}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <IconButton
                          icon={Eye}
                          title="View"
                          variant="view"
                          onClick={(e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            const rect = (
                              e?.target as HTMLElement
                            )?.getBoundingClientRect?.();
                            setModalPosition(
                              rect
                                ? { x: rect.left - 300, y: rect.bottom }
                                : null
                            );
                            setSelectedMember(member);
                          }}
                        />
                        <IconButton
                          icon={Edit2}
                          title="Edit"
                          variant="edit"
                          onClick={(e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            setEditMember(member);
                          }}
                        />
                        <IconButton
                          icon={Trash2}
                          title="Delete"
                          variant="delete"
                          onClick={(e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            if (window.confirm("Delete this member?"))
                              handleDeleteMember(member.id);
                          }}
                        />
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === member.id ? null : member.id
                          )
                        }
                        className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md"
                        aria-expanded={expandedId === member.id}
                      >
                        {expandedId === member.id ? "Collapse" : "Details"}
                      </button>
                    </div>

                    {/* optional expanded details area */}
                    {expandedId === member.id && (
                      <div className="mt-3 text-sm text-slate-600 border-t pt-3">
                        <div>
                          <strong>Notes:</strong> {member.notes ?? "—"}
                        </div>
                        <div className="mt-1">
                          <strong>Address:</strong> {member.address ?? "—"}
                        </div>
                        <div className="mt-1">
                          <strong>Additional:</strong>{" "}
                          {member.additional ?? "—"}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: actions & pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ActionButton
              icon={Plus}
              label="Add Member"
              onClick={() => setShowAddModal(true)}
              variant="primary"
            />
            <ActionButton
              icon={Download}
              label="Export"
              onClick={handleExport}
              variant="export"
            />
          </div>

          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">{members.length}</span>{" "}
            members
          </div>
        </div>
      </div>

      {/* Modals: behaviour preserved exactly */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
        />
      )}

      {selectedMember && modalPosition && (
        <MemberModal
          member={selectedMember}
          onClose={() => {
            setSelectedMember(null);
            setModalPosition(null);
          }}
          position={modalPosition}
        />
      )}

      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onEdit={handleEditMember}
        />
      )}
    </div>
  );
}
