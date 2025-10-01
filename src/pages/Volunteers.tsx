import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Users,
  Calendar as CalendarIcon,
  Flag,
  Mail,
  Award,
  Zap,
  Search,
  Plus,
  MessageCircle,
  Star,
  X,
} from "lucide-react";
import volunteerImg from "../assets/volunteer.png";
import OpportunityForm from "../components/OpportunityForm";
import * as api from "../services/api";

/* -------------------------
   Types
   ------------------------- */
type Volunteer = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  availability: "Available" | "Busy" | "Limited";
  skills: string[];
  hours: number;
};

type Opportunity = {
  id: string;
  title: string;
  ministry: string;
  date: string; // ISO date string (preferred start)
  skillsRequired: string[];
  spots: number;
  description?: string;
  color?: string;
};

type Assignment = {
  id: string;
  oppId: string;
  volunteerId: string;
  date: string; // assigned date (ISO)
  notes?: string;
};

const STORAGE_KEY = "volunteers_app_state_v1";

/* -------------------------
   Initial samples (kept similar)
   ------------------------- */
const sampleVolunteer: Volunteer = {
  id: "v1",
  name: "Grace Mensah",
  role: "Volunteer Coordinator",
  avatar: "/assets/volunteers/grace.jpg",
  availability: "Available",
  skills: ["Leadership", "Public Speaking", "Event Planning"],
  hours: 432,
};

const initialOpportunities: Opportunity[] = [
  {
    id: "o1",
    title: "Community Outreach - Food Drive",
    ministry: "Outreach",
    date: new Date().toISOString().slice(0, 10),
    skillsRequired: ["Logistics", "Teamwork"],
    spots: 12,
    description:
      "Help collect and distribute food packages to families in need.",
    color: "from-yellow-300 to-yellow-500",
  },
  {
    id: "o2",
    title: "Sunday Choir Support",
    ministry: "Worship",
    date: new Date(Date.now() + 2 * 24 * 3600e3).toISOString().slice(0, 10),
    skillsRequired: ["Music", "Rehearsal"],
    spots: 6,
    description: "Assist with choir setup and coordination before service.",
    color: "from-sky-300 to-sky-500",
  },
  {
    id: "o3",
    title: "Tech Team - Live Stream",
    ministry: "Media",
    date: new Date(Date.now() + 1 * 24 * 3600e3).toISOString().slice(0, 10),
    skillsRequired: ["AV", "Camera"],
    spots: 3,
    description:
      "Operate cameras and manage the livestream for Sunday service.",
    color: "from-indigo-300 to-indigo-600",
  },
  {
    id: "o4",
    title: "Youth Mentorship Night",
    ministry: "Youth",
    date: new Date(Date.now() + 4 * 24 * 3600e3).toISOString().slice(0, 10),
    skillsRequired: ["Mentoring", "Facilitation"],
    spots: 8,
    description: "Small group mentoring and discussion for teens.",
    color: "from-pink-300 to-pink-500",
  },
];

/* -------------------------
   Helper utilities
   ------------------------- */
function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

function persistState(state: unknown) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* -------------------------
   Small UI helpers
   ------------------------- */
function HeroDecoration() {
  return (
    <svg
      className="absolute right-0 top-0 w-48 h-48 opacity-20 -translate-y-8 translate-x-12"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#FFCE6B" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="50" r="80" fill="url(#g1)" />
    </svg>
  );
}

/* -------------------------
   Main Page (enhanced UI)
   ------------------------- */
export default function Volunteers() {
  const saved = loadState();

  const [volunteer, setVolunteer] = useState<Volunteer>(
    saved?.volunteer ?? sampleVolunteer
  );
  const [opps, setOpps] = useState<Opportunity[]>(
    saved?.opps ?? initialOpportunities
  );
  const [assignments, setAssignments] = useState<Assignment[]>(
    saved?.assignments ?? []
  );
  const [messages, setMessages] = useState<
    { id: string; from: string; text: string; ts: number }[]
  >(saved?.messages ?? []);
  const [query, setQuery] = useState("");
  const [filterMinistry, setFilterMinistry] = useState<string>("All");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    persistState({ volunteer, opps, assignments, messages });
  }, [volunteer, opps, assignments, messages]);

  const ministries = useMemo(
    () => ["All", ...Array.from(new Set(opps.map((o) => o.ministry)))],
    [opps]
  );

  const filteredOpps = useMemo(
    () =>
      opps.filter((o) => {
        if (filterMinistry !== "All" && o.ministry !== filterMinistry)
          return false;
        if (
          query &&
          !`${o.title} ${o.description} ${o.ministry}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [opps, query, filterMinistry]
  );

  // Join opportunity (same logic)
  function joinOpportunity(oppId: string, date?: string) {
    setOpps((prev) =>
      prev.map((p) =>
        p.id === oppId ? { ...p, spots: Math.max(0, p.spots - 1) } : p
      )
    );
    const a: Assignment = {
      id: uid("a_"),
      oppId,
      volunteerId: volunteer.id,
      date:
        date ??
        opps.find((o) => o.id === oppId)?.date ??
        new Date().toISOString().slice(0, 10),
    };
    setAssignments((s) => [...s, a]);
    setVolunteer((v) => ({ ...v, hours: v.hours + 4 }));
    setNotice("Successfully joined opportunity");
    setTimeout(() => setNotice(null), 2400);
  }

  // Cancel assignment
  function cancelAssignment(aid: string) {
    const a = assignments.find((x) => x.id === aid);
    if (!a) return;
    setOpps((prev) =>
      prev.map((p) => (p.id === a.oppId ? { ...p, spots: p.spots + 1 } : p))
    );
    setAssignments((s) => s.filter((x) => x.id !== aid));
    setVolunteer((v) => ({ ...v, hours: Math.max(0, v.hours - 4) }));
    setNotice("Assignment cancelled");
    setTimeout(() => setNotice(null), 1800);
  }

  // Reschedule assignment
  function rescheduleAssignment(aid: string, newDate: string) {
    setAssignments((s) =>
      s.map((x) => (x.id === aid ? { ...x, date: newDate } : x))
    );
    setNotice("Assignment rescheduled");
    setTimeout(() => setNotice(null), 1600);
  }

  // Drag & Drop handlers for calendar
  function handleDragStartAssignment(e: React.DragEvent, aid: string) {
    e.dataTransfer.setData("type", "assignment");
    e.dataTransfer.setData("assignmentId", aid);
    e.dataTransfer.effectAllowed = "move";
  }
  function handleDropOnDate(e: React.DragEvent, date: string) {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    if (type === "opp") {
      const oppId = e.dataTransfer.getData("oppId");
      joinOpportunity(oppId, date);
    } else if (type === "assignment") {
      const aid = e.dataTransfer.getData("assignmentId");
      rescheduleAssignment(aid, date);
    }
  }

  // AI Recommendation action (simple)
  function autoSuggestAndJoin(opp: Opportunity) {
    joinOpportunity(opp.id);
  }

  // Messaging (Comm Hub)
  function sendMessage(text: string) {
    if (!text.trim()) return;
    const m = {
      id: uid("m_"),
      from: volunteer.name,
      text: text.trim(),
      ts: Date.now(),
    };
    setMessages((s) => [m, ...s].slice(0, 50));
  }

  // Badges & Gamification
  const badges = useMemo(() => {
    const b: { id: string; label: string; earned: boolean }[] = [
      { id: "b1", label: "100 Hours", earned: volunteer.hours >= 100 },
      { id: "b2", label: "250 Hours", earned: volunteer.hours >= 250 },
      { id: "b3", label: "Top Volunteer", earned: volunteer.hours >= 400 },
    ];
    return b;
  }, [volunteer.hours]);

  const shellCard =
    "rounded-lg bg-white border border-slate-100 shadow-sm p-4 transition";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white/80 to-blue-50 antialiased text-slate-900 pb-12">
      {/* Header / Hero */}
      <header className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative">
          <div
            className="rounded-xl overflow-hidden relative bg-cover bg-center shadow-2xl ring-1 ring-amber-200/30"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(255,243,205,0.85), rgba(59,130,246,0.06)), url(${volunteerImg})`,
              minHeight: 260,
            }}
          >
            <HeroDecoration />
            <div className="absolute inset-0 bg-gradient-to-b from-black/6 to-transparent" />

            {/* small inline styles for glowing CTA (kept local & simple) */}
            <style>{`
              .pulse-glow { animation: pulseGlow 2.8s infinite; }
              @keyframes pulseGlow {
                0% { box-shadow: 0 8px 18px rgba(250,205,60,0.18); }
                50% { box-shadow: 0 18px 48px rgba(250,205,60,0.26); transform: translateY(-1px); }
                100% { box-shadow: 0 8px 18px rgba(250,205,60,0.18); transform: translateY(0); }
              }
            `}</style>

            <div className="relative z-10 px-6 py-8 md:px-10 md:py-12 flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 shadow-sm text-amber-900">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Volunteer Hub</span>
                  </div>
                  <div className="ml-3 px-2 py-1 rounded-full text-xs font-medium bg-white/80 border border-amber-200 text-amber-700">
                    Call to Service
                  </div>
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
                  Call to Serve
                </h1>
                <p className="mt-2 text-slate-700 max-w-2xl">
                  "Each of you should use whatever gift you have received to
                  serve others" — find roles, manage your schedule, and be
                  recognized. Join the movement — your time makes a visible
                  difference.
                </p>

                <div className="mt-5 flex flex-wrap gap-3 items-center">
                  <button
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-900 font-semibold shadow-2xl pulse-glow transform transition hover:scale-105"
                    onClick={() =>
                      document
                        .getElementById("opportunities")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    aria-label="Browse Opportunities"
                  >
                    <Star className="w-5 h-5 text-amber-900" />
                    <span className="text-sm">Browse Opportunities</span>
                  </button>

                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-blue-700 font-medium shadow hover:scale-[1.02] transition"
                    onClick={() =>
                      document
                        .getElementById("calendar")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    aria-label="My Schedule"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    My Schedule
                  </button>

                  <div className="ml-2 hidden md:flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500">Featured</div>
                      <div className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium shadow-sm">
                        High Visibility
                      </div>
                    </div>
                  </div>
                </div>

                {/* subtle underline accent */}
                <div className="mt-4 h-1 w-48 rounded-full bg-gradient-to-r from-amber-300 to-blue-300 opacity-90" />
              </div>

              <aside className="w-full md:w-96">
                <div className="rounded-lg bg-white/95 p-4 shadow-lg border border-slate-100">
                  <ProfileCard
                    volunteer={volunteer}
                    assignments={assignments}
                    onCancel={cancelAssignment}
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section
          id="opportunities"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-8 space-y-6">
            {/* Search & Filters */}
            <div className="flex items-center gap-4 bg-white rounded-lg p-3 border border-slate-100 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-transparent bg-white placeholder:text-slate-400"
                  placeholder="Search opportunities, skills, ministry..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                value={filterMinistry}
                onChange={(e) => setFilterMinistry(e.target.value)}
                className="px-3 py-2 rounded-md border border-slate-100 bg-white"
              >
                {ministries.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                className="px-3 py-2 rounded-md bg-amber-400 text-slate-900 flex items-center gap-2 hover:shadow"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>

            {/* Opportunities grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredOpps.map((o) => (
                <div
                  key={o.id}
                  className="relative border rounded-lg p-4 bg-white shadow hover:shadow-md transition transform hover:-translate-y-1"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{
                      background: `linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02)), ${
                        o.color ? undefined : ""
                      }`,
                    }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-md flex items-center justify-center text-white bg-gradient-to-br ${
                          o.color ?? "from-sky-300 to-sky-500"
                        }`}
                      >
                        <Flag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {o.title}
                        </h3>
                        <div className="text-xs text-slate-500">
                          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-full mr-2 text-xs">
                            {o.ministry}
                          </span>
                          <span>{o.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-500">
                        {o.spots} spots
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                          onClick={() => joinOpportunity(o.id)}
                        >
                          Join
                        </button>
                        <button
                          className="px-2 py-1 rounded-md bg-white border text-sm"
                          onClick={() => setSelectedOpp(o)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-700 line-clamp-3">
                    {o.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.skillsRequired.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar / Schedule */}
            <div id="calendar" className={`${shellCard} mt-2`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />{" "}
                  <h4 className="font-medium">Upcoming Assignments</h4>
                </div>
                <div className="text-xs text-slate-500">
                  Drag & drop to reschedule
                </div>
              </div>

              <CalendarView
                assignments={assignments}
                opps={opps}
                onDropDate={handleDropOnDate}
                onDragStartAssignment={handleDragStartAssignment}
                onCancel={cancelAssignment}
              />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className={shellCard}>
              <RecognitionCard volunteer={volunteer} badges={badges} />
            </div>

            <div className={shellCard}>
              <AIRecommendations
                volunteer={volunteer}
                opportunities={opps}
                onSuggest={autoSuggestAndJoin}
              />
            </div>

            <div className={shellCard}>
              <CommHub messages={messages} onSend={sendMessage} />
            </div>
          </aside>
        </section>
      </main>

      {/* Modal details for selected opportunity */}
      {selectedOpp && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedOpp(null)}
          />
          <div className="relative w-full max-w-xl rounded-md bg-white p-5 shadow-lg border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedOpp.title}</h2>
                <div className="text-sm text-slate-600">
                  {selectedOpp.ministry} • {selectedOpp.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded-md bg-blue-600 text-white"
                  onClick={() => {
                    joinOpportunity(selectedOpp.id);
                    setSelectedOpp(null);
                  }}
                >
                  Join
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-white border"
                  onClick={() => setSelectedOpp(null)}
                >
                  Close
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-rose-500 text-white"
                  onClick={async () => {
                    if (!confirm("Delete this opportunity?")) return;
                    // optimistic remove
                    const before = opps;
                    setOpps((p) => p.filter((x) => x.id !== selectedOpp.id));
                    setAssignments((a) =>
                      a.filter((x) => x.oppId !== selectedOpp.id)
                    );
                    setSelectedOpp(null);
                    setNotice("Deleting...");
                    try {
                      await api.removeOpportunity(selectedOpp.id);
                      setNotice("Deleted");
                    } catch {
                      // revert
                      setOpps(before);
                      setNotice("Delete failed");
                    } finally {
                      setTimeout(() => setNotice(null), 1600);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-3 text-slate-700">{selectedOpp.description}</p>
          </div>
        </div>
      )}

      {/* Opportunity Form Modal (optimistic create/update via API wrapper) */}
      {showForm && (
        <OpportunityForm
          onClose={() => setShowForm(false)}
          onSave={async (opp) => {
            const exists = opps.some((x) => x.id === opp.id);

            if (exists) {
              // optimistic update
              setOpps((p) =>
                p.map((x) => (x.id === opp.id ? { ...x, ...opp } : x))
              );
              setShowForm(false);
              setNotice("Saving changes...");
              try {
                const saved = await api.updateOpportunity(opp.id, opp);
                setOpps((p) => p.map((x) => (x.id === opp.id ? saved : x)));
                setNotice("Opportunity updated");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (err) {
                // revert: fetch latest from API or fallback remove local change
                setOpps((p) =>
                  p.map((x) => (x.id === opp.id ? { ...x, ...opp } : x))
                );
                setNotice("Update failed");
              } finally {
                setTimeout(() => setNotice(null), 1600);
              }
              return;
            }

            // create new (optimistic)
            const tempId = opp.id || uid("temp_");
            const temp = { ...opp, id: tempId };
            setOpps((p) => [temp, ...p]);
            setShowForm(false);
            setNotice("Creating opportunity...");
            try {
              const created = await api.createOpportunity(opp);
              // replace temp id with created id
              setOpps((p) => p.map((x) => (x.id === tempId ? created : x)));
              setNotice("Opportunity created");
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
              // revert on failure
              setOpps((p) => p.filter((x) => x.id !== tempId));
              setNotice("Create failed");
            } finally {
              setTimeout(() => setNotice(null), 1600);
            }
          }}
        />
      )}

      {/* small toast/notice */}
      {notice && (
        <div className="fixed right-6 bottom-6 z-50 rounded-md px-4 py-2 bg-blue-600 text-white shadow">
          {notice}
        </div>
      )}
    </div>
  );
}

/* -------------------------
   Subcomponents reused (unchanged except small visual tweaks)
   ------------------------- */

function ProfileCard({
  volunteer,
  assignments,
  onCancel,
}: {
  volunteer: Volunteer;
  assignments: Assignment[];
  onCancel: (aid: string) => void;
}) {
  const upcoming = assignments.filter(
    (a) => a.volunteerId === volunteer.id
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden relative shadow-sm ring-1 ring-white/40">
          <img
            src={volunteer.avatar ?? "/assets/avatars/default.jpg"}
            alt={volunteer.name}
            className="w-full h-full object-cover"
          />
          <span
            className={`absolute right-0 bottom-0 block w-4 h-4 rounded-full ring-2 ring-white ${
              volunteer.availability === "Available"
                ? "bg-emerald-400"
                : volunteer.availability === "Busy"
                ? "bg-rose-400"
                : "bg-amber-400"
            }`}
            title={volunteer.availability}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate">
              <div className="text-lg font-medium truncate">
                {volunteer.name}
              </div>
              <div className="text-sm text-slate-600 truncate">
                {volunteer.role}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500">Total hours</div>
              <div className="text-xl font-semibold">{volunteer.hours}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {volunteer.skills.map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded-md text-xs bg-amber-50 border border-amber-100 text-amber-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-sm hover:scale-[1.02] transition"
          onClick={() => window.alert("Viewing profile...")}
        >
          <User className="w-4 h-4 text-white" /> View Profile
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-medium shadow-sm hover:scale-[1.02] transition"
          onClick={() => window.alert("Contacting leader...")}
        >
          <Mail className="w-4 h-4 text-amber-800" /> Contact
        </button>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <div className="text-sm text-slate-600 mb-2">
          Upcoming assignments ({upcoming})
        </div>
        <div className="flex flex-col gap-2">
          {assignments.slice(0, 4).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 bg-white p-2 rounded-md border border-slate-100"
            >
              <div className="text-sm truncate">
                {a.date} • {a.oppId}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded-md bg-white text-sm border"
                  onClick={() => onCancel(a.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {!assignments.length && (
            <div className="text-xs text-slate-500">
              No upcoming assignments
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Lightweight calendar: week-view columns with drop targets (no logic changes) */
function CalendarView({
  assignments,
  opps,
  onDropDate,
  onDragStartAssignment,
  onCancel,
}: {
  assignments: Assignment[];
  opps: Opportunity[];
  onDropDate: (e: React.DragEvent, date: string) => void;
  onDragStartAssignment: (e: React.DragEvent, aid: string) => void;
  onCancel: (aid: string) => void;
}) {
  // show 7-day window starting today
  const days = Array.from({ length: 7 }).map((_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + i);
    return dt.toISOString().slice(0, 10);
  });

  const assignmentsByDate: Record<string, Assignment[]> = {};
  assignments.forEach((a) => {
    assignmentsByDate[a.date] = assignmentsByDate[a.date] || [];
    assignmentsByDate[a.date].push(a);
  });

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-7 gap-3 overflow-x-auto">
      {days.map((d) => (
        <div
          key={d}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropDate(e, d)}
          className="min-h-[140px] p-2 rounded-lg bg-white/70 border border-white/20 flex flex-col"
        >
          <div className="text-xs font-medium mb-2 flex items-center justify-between">
            <span>
              {new Date(d).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-xs text-slate-500">
              {assignmentsByDate[d]?.length ?? 0}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-auto">
            {(assignmentsByDate[d] || []).map((a) => {
              const opp = opps.find((o) => o.id === a.oppId);
              return (
                <div
                  key={a.id}
                  draggable
                  onDragStart={(e) => onDragStartAssignment(e, a.id)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-2 rounded-md flex items-center justify-between gap-2"
                >
                  <div className="text-sm truncate">
                    {opp?.title ?? a.oppId}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onCancel(a.id)}
                      className="p-1 rounded bg-white/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Drop an opportunity here to join
          </div>
        </div>
      ))}
    </div>
  );
}

function RecognitionCard({
  volunteer,
  badges,
}: {
  volunteer: Volunteer;
  badges: { id: string; label: string; earned: boolean }[];
}) {
  const progress = Math.min(100, Math.round((volunteer.hours / 500) * 100));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">Progress</div>
          <div className="text-lg font-semibold">{volunteer.hours} hrs</div>
        </div>
        <Award className="w-6 h-6 text-amber-500" />
      </div>

      <div>
        <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Top volunteer leaderboard rotates monthly ·{" "}
          <strong className="text-slate-700">{progress}%</strong>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-2 rounded-md text-center ${
              b.earned
                ? "bg-amber-50 border border-amber-200"
                : "bg-white/70 border border-white/30"
            }`}
          >
            <div className="text-xs font-semibold">{b.label}</div>
            <div className="text-xs mt-1">{b.earned ? "Earned" : "Locked"}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          View Badges
        </button>
        <button className="px-3 py-2 rounded-md bg-white/70">Nominate</button>
      </div>
    </div>
  );
}

function AIRecommendations({
  volunteer,
  opportunities,
  onSuggest,
}: {
  volunteer: Volunteer;
  opportunities: Opportunity[];
  onSuggest: (o: Opportunity) => void;
}) {
  // simple score based on matching skills + open spots
  const scored = opportunities
    .map((o) => {
      const score =
        o.skillsRequired.filter((s) =>
          volunteer.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
        ).length *
          10 +
        Math.max(0, 5 - o.spots);
      return { o, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.o)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h4 className="font-medium">Smart Matches</h4>
        </div>
        <div className="text-xs text-slate-500">AI-assisted</div>
      </div>

      <div className="space-y-2">
        {scored.length ? (
          scored.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-slate-500">{s.ministry}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                  onClick={() => onSuggest(s)}
                >
                  Suggest
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">
            No immediate suggestions — try broadening filters.
          </div>
        )}
      </div>
    </div>
  );
}

function CommHub({
  messages,
  onSend,
}: {
  messages: { id: string; from: string; text: string; ts: number }[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium">Communication Hub</h4>
        </div>
        <div className="text-xs text-slate-500">Real-time (local)</div>
      </div>

      <div className="space-y-3 max-h-40 overflow-auto">
        {messages.length ? (
          messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-slate-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {m.from}{" "}
                  <span className="text-xs text-slate-400">
                    · {new Date(m.ts).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-slate-600">{m.text}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">No recent messages</div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(text);
          setText("");
        }}
      >
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a quick message..."
            className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/60"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

/* small helper icon for Download used above */
