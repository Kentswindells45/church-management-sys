/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  DownloadCloud,
  List,
  Grid,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
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
  date: string;
  skillsRequired: string[];
  spots: number;
  description?: string;
  color?: string;
};

type Assignment = {
  id: string;
  oppId: string;
  volunteerId: string;
  date: string;
  notes?: string;
};

const STORAGE_KEY = "volunteers_app_state_v1";

/* -------------------------
   Samples
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
   Utilities
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
   Performance-oriented 3D tilt wrapper
   - Uses direct DOM transforms updated with RAF to avoid re-renders
   ------------------------- */
function useTilt3D() {
  const elRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({
    tx: 0,
    ty: 0,
    tz: 0,
    rx: 0,
    ry: 0,
    target: { rx: 0, ry: 0, tz: 0, tx: 0, ty: 0 },
  });

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const setElement = (el: HTMLElement | null) => {
    elRef.current = el;
  };

  const onPointerMove = (e: PointerEvent) => {
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const nx = px - 0.5;
    const ny = py - 0.5;
    stateRef.current.target.ry = nx * 10;
    stateRef.current.target.rx = -ny * 6;
    stateRef.current.target.tz = 10;
    stateRef.current.target.tx = nx * 6;
    stateRef.current.target.ty = ny * 6;
    if (rafRef.current) return;
    const step = () => {
      const s = stateRef.current;
      s.rx += (s.target.rx - s.rx) * 0.12;
      s.ry += (s.target.ry - s.ry) * 0.12;
      s.tz += (s.target.tz - s.tz) * 0.08;
      s.tx += (s.target.tx - s.tx) * 0.08;
      s.ty += (s.target.ty - s.ty) * 0.08;
      const t = `translate3d(${s.tx}px, ${s.ty}px, ${s.tz}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
      if (elRef.current) {
        elRef.current.style.transform = t;
        elRef.current.style.willChange = "transform";
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const onPointerLeave = () => {
    stateRef.current.target = { rx: 0, ry: 0, tz: 0, tx: 0, ty: 0 };
    if (rafRef.current) return;
    const step = () => {
      const s = stateRef.current;
      s.rx += (s.target.rx - s.rx) * 0.12;
      s.ry += (s.target.ry - s.ry) * 0.12;
      s.tz += (s.target.tz - s.tz) * 0.08;
      s.tx += (s.target.tx - s.tx) * 0.08;
      s.ty += (s.target.ty - s.ty) * 0.08;
      const t = `translate3d(${s.tx}px, ${s.ty}px, ${s.tz}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
      if (elRef.current) {
        elRef.current.style.transform = t;
      }
      const resting =
        Math.abs(s.rx) < 0.02 &&
        Math.abs(s.ry) < 0.02 &&
        Math.abs(s.tz) < 0.5 &&
        Math.abs(s.tx) < 0.5 &&
        Math.abs(s.ty) < 0.5;
      if (resting) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  return { setElement, onPointerMove, onPointerLeave };
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
   Main Page
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

  // New UI state: view mode and sorting
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "spots" | "newest">("date");

  // New modal state for badges & nomination
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [nominateOpen, setNominateOpen] = useState(false);

  useEffect(() => {
    persistState({ volunteer, opps, assignments, messages });
  }, [volunteer, opps, assignments, messages]);

  // close modals / dialog on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedOpp(null);
        setBadgesOpen(false);
        setNominateOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* -------------------------
     NOTE: exportBadgesSVG moved below badges declaration to avoid TDZ
     ------------------------- */

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

  // new: sorted list based on sortBy
  const sortedOpps = useMemo(() => {
    const copy = [...filteredOpps];
    if (sortBy === "spots") {
      copy.sort((a, b) => b.spots - a.spots);
    } else if (sortBy === "newest") {
      copy.sort((a, b) => b.id.localeCompare(a.id));
    } else {
      // sort by date asc
      copy.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
    }
    return copy;
  }, [filteredOpps, sortBy]);

  const badges = useMemo(() => {
    return [
      { id: "b1", label: "100 Hours", earned: volunteer.hours >= 100 },
      { id: "b2", label: "250 Hours", earned: volunteer.hours >= 250 },
      { id: "b3", label: "Top Volunteer", earned: volunteer.hours >= 400 },
    ];
  }, [volunteer.hours]);

  // small helper to escape text into SVG (placed after badges)
  function escapeHtml(s: string) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // export badges as a simple SVG for sharing (now defined after badges)
  const exportBadgesSVG = React.useCallback(() => {
    const width = 620;
    const height = 80 + badges.length * 56;
    const header = `<text x="24" y="32" font-size="18" font-weight="700" fill="#0f172a">${escapeHtml(
      `Badges — ${volunteer.name}`
    )}</text>`;
    const items = badges
      .map((b, i) => {
        const y = 60 + i * 56;
        const bg = b.earned ? "#FFFBEB" : "#F8FAFC";
        const stroke = b.earned ? "#F59E0B" : "#E6EEF8";
        return `<g transform="translate(12, ${y})">
            <rect rx="10" width="${
              width - 24
            }" height="48" fill="${bg}" stroke="${stroke}" />
            <text x="20" y="30" font-size="14" fill="#0f172a">${escapeHtml(
              `${b.label} — ${b.earned ? "Earned" : "Locked"}`
            )}</text>
          </g>`;
      })
      .join("\n");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>text{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}</style>
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${header}
      ${items}
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `badges_${volunteer.id}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice("Badges exported");
    setTimeout(() => setNotice(null), 1400);
  }, [badges, volunteer]);

  // Handlers memoized (preserve)
  const joinOpportunity = useCallback(
    (oppId: string, date?: string) => {
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
    },
    [opps, volunteer.id]
  );

  const cancelAssignment = useCallback(
    (aid: string) => {
      const a = assignments.find((x) => x.id === aid);
      if (!a) return;
      setOpps((prev) =>
        prev.map((p) => (p.id === a.oppId ? { ...p, spots: p.spots + 1 } : p))
      );
      setAssignments((s) => s.filter((x) => x.id !== aid));
      setVolunteer((v) => ({ ...v, hours: Math.max(0, v.hours - 4) }));
      setNotice("Assignment cancelled");
      setTimeout(() => setNotice(null), 1800);
    },
    [assignments]
  );

  const rescheduleAssignment = useCallback((aid: string, newDate: string) => {
    setAssignments((s) =>
      s.map((x) => (x.id === aid ? { ...x, date: newDate } : x))
    );
    setNotice("Assignment rescheduled");
    setTimeout(() => setNotice(null), 1600);
  }, []);

  const handleDragStartAssignment = useCallback(
    (e: React.DragEvent, aid: string) => {
      e.dataTransfer.setData("type", "assignment");
      e.dataTransfer.setData("assignmentId", aid);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDropOnDate = useCallback(
    (e: React.DragEvent, date: string) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("type");
      if (type === "opp") {
        const oppId = e.dataTransfer.getData("oppId");
        joinOpportunity(oppId, date);
      } else if (type === "assignment") {
        const aid = e.dataTransfer.getData("assignmentId");
        rescheduleAssignment(aid, date);
      }
    },
    [joinOpportunity, rescheduleAssignment]
  );

  const autoSuggestAndJoin = useCallback(
    (opp: Opportunity) => {
      joinOpportunity(opp.id);
    },
    [joinOpportunity]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const m = {
        id: uid("m_"),
        from: volunteer.name,
        text: text.trim(),
        ts: Date.now(),
      };
      setMessages((s) => [m, ...s].slice(0, 50));
    },
    [volunteer.name]
  );

  const shellCard =
    "rounded-lg bg-white border border-slate-100 shadow-sm p-4 transition";

  /* -------------------------
     Inline advanced visual styles (scoped)
     ------------------------- */
  const styleTag = (
    <style>{`
      :root {
        --glass-bg: rgba(255,255,255,0.75);
        --glass-border: rgba(255,255,255,0.6);
        --muted: #64748b;
      }
      .tilt-card { transform-style: preserve-3d; will-change: transform; transition: box-shadow 260ms ease, transform 260ms cubic-bezier(.2,.9,.3,1); border-radius: 12px; }
      .tilt-card:focus-within { outline: 3px solid rgba(99,102,241,0.14); }
      .tilt-card:hover { box-shadow: 0 30px 70px rgba(2,6,23,0.12); }
      .card-gloss { position: absolute; inset: 0; pointer-events: none; border-radius: 12px; background: linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); mix-blend-mode: overlay; opacity: 0.95; }
      .sparkle { position:absolute; right:-30px; top:-30px; filter: blur(36px); opacity:0.65; pointer-events:none; }
      .opportunity-flag { width:48px; height:48px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; color:white; font-weight:600; box-shadow: 0 8px 18px rgba(2,6,23,0.06); }
      .gradient-sweep { position:absolute; inset:0; pointer-events:none; background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.12), rgba(255,255,255,0)); transform: skewX(-18deg) translateX(-200%); transition: transform 900ms linear; }
      .tilt-card:hover .gradient-sweep { transform: skewX(-18deg) translateX(40%); }
      .glass-panel { background: var(--glass-bg); backdrop-filter: blur(6px) saturate(120%); border: 1px solid rgba(255,255,255,0.6); }
      .focus-ring:focus { outline: none; box-shadow: 0 0 0 4px rgba(99,102,241,0.12); border-radius: 10px; }
      .btn-ghost:focus, .btn-primary:focus { box-shadow: 0 6px 24px rgba(99,102,241,0.08); }
      .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    `}</style>
  );

  const cardStagger = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36 },
  };

  // New feature: export assignments CSV
  const exportAssignmentsCSV = useCallback(() => {
    const header = [
      "AssignmentID",
      "OpportunityID",
      "OpportunityTitle",
      "VolunteerID",
      "VolunteerName",
      "Date",
      "Notes",
    ];
    const rows = assignments.map((a) => {
      const opp = opps.find((o) => o.id === a.oppId);
      const cells = [
        a.id,
        a.oppId,
        opp?.title ?? "",
        a.volunteerId,
        volunteer.name,
        a.date,
        a.notes ?? "",
      ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
      return cells.join(",");
    });
    const csv = [header.join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice("Assignments exported");
    setTimeout(() => setNotice(null), 1600);
  }, [assignments, opps, volunteer.name]);

  // New feature: quick reset sample data (keeps volunteer)
  const resetOpportunities = useCallback(() => {
    setOpps(initialOpportunities);
    setAssignments([]);
    setMessages([]);
    setNotice("Reset to sample data");
    setTimeout(() => setNotice(null), 1500);
  }, []);

  async function submitNomination(nominee: string, reason: string) {
    if (!nominee.trim() || !reason.trim()) {
      setNotice("Please provide a name and a reason");
      setTimeout(() => setNotice(null), 1600);
      return;
    }

    setNominateOpen(false);
    setNotice("Submitting nomination...");

    const payload = {
      id: uid("nom_"),
      nominee: nominee.trim(),
      reason: reason.trim(),
      nominator: volunteer.name,
      ts: Date.now(),
    };

    try {
      // Prefer server API if available, otherwise persist locally in messages as a fallback
      if (
        "submitNomination" in api &&
        typeof (api as any).submitNomination === "function"
      ) {
        await (api as any).submitNomination(payload);
      } else {
        setMessages((s) =>
          [
            {
              id: uid("m_"),
              from: volunteer.name,
              text: `Nominated ${payload.nominee}: ${payload.reason}`,
              ts: Date.now(),
            },
            ...s,
          ].slice(0, 50)
        );
      }
      setNotice("Nomination submitted");
    } catch {
      setNotice("Nomination failed");
    } finally {
      setTimeout(() => setNotice(null), 1600);
    }
  }

  // small change: use sortedOpps instead of filteredOpps

  return (
    <div className="min-h-screen bg-gradient-to-b from-white/80 to-blue-50 antialiased text-slate-900 pb-12">
      {styleTag}
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
                  recognized.
                </p>

                <div className="mt-5 flex flex-wrap gap-3 items-center">
                  <button
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-900 font-semibold shadow-2xl transform transition hover:scale-105 focus-ring"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-blue-700 font-medium shadow hover:scale-[1.02] transition focus-ring"
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
                </div>

                <div className="mt-4 h-1 w-48 rounded-full bg-gradient-to-r from-amber-300 to-blue-300 opacity-90" />
              </div>

              <aside className="w-full md:w-96">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-lg glass-panel p-4 shadow-lg border border-slate-100"
                >
                  <ProfileCard
                    volunteer={volunteer}
                    assignments={assignments}
                    onCancel={cancelAssignment}
                  />
                </motion.div>
              </aside>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
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
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-transparent bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200"
                  placeholder="Search opportunities, skills, ministry..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                value={filterMinistry}
                onChange={(e) => setFilterMinistry(e.target.value)}
                className="px-3 py-2 rounded-md border border-slate-100 bg-white focus:ring-2 focus:ring-indigo-50"
                aria-label="Filter by ministry"
              >
                {ministries.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                className="px-3 py-2 rounded-md bg-amber-400 text-slate-900 flex items-center gap-2 hover:shadow focus-ring"
                onClick={() => setShowForm(true)}
                aria-haspopup="dialog"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>

            {/* Toolbar: view toggle, sort, export, refresh */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 bg-white/80 rounded-md p-1 border border-slate-100 shadow-sm">
                  <button
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid" ? "bg-indigo-50" : "bg-transparent"
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4 text-slate-700" />
                  </button>
                  <button
                    aria-pressed={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list" ? "bg-indigo-50" : "bg-transparent"
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4 text-slate-700" />
                  </button>
                </div>

                <div className="ml-2">
                  <label className="text-xs text-slate-500 mr-2">Sort</label>
                  <select
                    value={sortBy}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1 rounded-md border border-slate-100 bg-white"
                  >
                    <option value="date">Date</option>
                    <option value="spots">Most spots</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportAssignmentsCSV}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow-sm hover:shadow"
                  title="Export assignments"
                >
                  <DownloadCloud className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={resetOpportunities}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow-sm hover:shadow"
                  title="Reset sample data"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {/* Opportunities grid or list */}
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedOpps.map((o) => (
                  <motion.div
                    key={o.id}
                    initial="initial"
                    animate="animate"
                    variants={cardStagger}
                  >
                    <TiltCard className="relative">
                      <div
                        className="relative border rounded-lg p-4 bg-white shadow hover:shadow-md transition transform tilt-card focus-ring"
                        role="article"
                        aria-label={o.title}
                        tabIndex={0}
                        draggable={false}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("type", "opp");
                          e.dataTransfer.setData("oppId", o.id);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        style={{ overflow: "visible" }}
                      >
                        <div className="card-gloss" />
                        <div className="gradient-sweep" />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`opportunity-flag bg-gradient-to-br ${
                                o.color ?? "from-sky-300 to-sky-500"
                              }`}
                              aria-hidden
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
                                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm btn-primary focus-ring"
                                onClick={() => joinOpportunity(o.id)}
                                aria-label={`Join ${o.title}`}
                              >
                                Join
                              </button>
                              <button
                                className="px-2 py-1 rounded-md bg-white border text-sm btn-ghost focus-ring"
                                onClick={() => setSelectedOpp(o)}
                                aria-haspopup="dialog"
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
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOpps.map((o) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-md opportunity-flag ${
                            o.color ?? "from-sky-300 to-sky-500"
                          }`}
                        >
                          <Flag className="w-4 h-4 text-white m-auto" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{o.title}</div>
                          <div className="text-xs text-slate-500 truncate">
                            {o.ministry} • {o.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-500">
                          {o.spots} spots
                        </div>
                        <button
                          className="px-3 py-1 rounded-md bg-blue-600 text-white"
                          onClick={() => joinOpportunity(o.id)}
                        >
                          Join
                        </button>
                        <button
                          className="px-2 py-1 rounded-md bg-white border"
                          onClick={() => setSelectedOpp(o)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

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
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36 }}
              className={shellCard}
            >
              <RecognitionCard
                volunteer={volunteer}
                badges={badges}
                onViewBadges={() => setBadgesOpen(true)}
                onNominate={() => setNominateOpen(true)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42 }}
              className={shellCard}
            >
              <AIRecommendations
                volunteer={volunteer}
                opportunities={opps}
                onSuggest={autoSuggestAndJoin}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48 }}
              className={shellCard}
            >
              <CommHub messages={messages} onSend={sendMessage} />
            </motion.div>
          </aside>
        </section>
      </main>

      {/* Modal details */}
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

      {/* Opportunity Form */}
      {showForm && (
        <OpportunityForm
          onClose={() => setShowForm(false)}
          onSave={async (opp) => {
            const exists = opps.some((x) => x.id === opp.id);
            if (exists) {
              setOpps((p) =>
                p.map((x) => (x.id === opp.id ? { ...x, ...opp } : x))
              );
              setShowForm(false);
              setNotice("Saving changes...");
              try {
                const saved = await api.updateOpportunity(opp.id, opp);
                setOpps((p) => p.map((x) => (x.id === opp.id ? saved : x)));
                setNotice("Opportunity updated");
              } catch {
                setNotice("Update failed");
              } finally {
                setTimeout(() => setNotice(null), 1600);
              }
              return;
            }

            const tempId = opp.id || uid("temp_");
            const temp = { ...opp, id: tempId };
            setOpps((p) => [temp, ...p]);
            setShowForm(false);
            setNotice("Creating opportunity...");
            try {
              const created = await api.createOpportunity(opp);
              setOpps((p) => p.map((x) => (x.id === tempId ? created : x)));
              setNotice("Opportunity created");
            } catch {
              setOpps((p) => p.filter((x) => x.id !== tempId));
              setNotice("Create failed");
            } finally {
              setTimeout(() => setNotice(null), 1600);
            }
          }}
        />
      )}

      {/* Toast */}
      {notice && (
        <div className="fixed right-6 bottom-6 z-50 rounded-md px-4 py-2 bg-blue-600 text-white shadow">
          {notice}
        </div>
      )}

      {/* Badges & Nomination Modal */}
      {badgesOpen && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setBadgesOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-md bg-white p-5 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Badges</h3>
              <button
                className="text-slate-500"
                onClick={() => setBadgesOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-md text-center ${
                    b.earned
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-white/70 border border-white/30"
                  }`}
                >
                  <div className="text-xs font-semibold">{b.label}</div>
                  <div className="text-xs mt-1">
                    {b.earned ? "Earned" : "Locked"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                onClick={() => exportBadgesSVG()}
                title="Export badges as SVG"
              >
                Export Badges
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-md bg-white border"
                onClick={() => setNominateOpen(true)}
              >
                Nominate a Volunteer
              </button>
            </div>

            <div className="mt-4">
              <button
                className="w-full px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                onClick={() => setNominateOpen(true)}
              >
                Nominate a Volunteer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nomination Form Modal */}
      {nominateOpen && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setNominateOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-md bg-white p-5 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nominate a Volunteer</h3>
              <button
                className="text-slate-500"
                onClick={() => setNominateOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const nominee = formData.get("nominee")?.toString() ?? "";
                const reason = formData.get("reason")?.toString() ?? "";
                submitNomination(nominee, reason);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="nominee"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nominee Name
                </label>
                <input
                  type="text"
                  name="nominee"
                  id="nominee"
                  required
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200"
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-slate-700"
                >
                  Reason for Nomination
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={3}
                  required
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                >
                  Submit Nomination
                </button>
                <button
                  type="button"
                  onClick={() => setNominateOpen(false)}
                  className="flex-1 px-3 py-2 rounded-md bg-white border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   TiltCard component (uses useTilt3D hook)
   ------------------------- */
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { setElement, onPointerMove, onPointerLeave } = useTilt3D();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setElement(el);
    const handlePointer = (e: PointerEvent) => onPointerMove(e);
    el.addEventListener("pointermove", handlePointer);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointercancel", onPointerLeave);
    el.addEventListener("pointerdown", (ev) =>
      (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId)
    );
    return () => {
      el.removeEventListener("pointermove", handlePointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className ?? ""}
      style={{ perspective: 1200 }}
    >
      {children}
      <svg
        className="sparkle"
        width="140"
        height="140"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="sg" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#sg)" />
      </svg>
    </div>
  );
}

/* -------------------------
   Subcomponents (memoized to avoid re-renders)
   ------------------------- */
const ProfileCard = React.memo(function ProfileCard({
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
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-sm hover:scale-[1.02] transition focus-ring"
          onClick={() => window.alert("Viewing profile...")}
        >
          <User className="w-4 h-4 text-white" /> View Profile
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-medium shadow-sm hover:scale-[1.02] transition focus-ring"
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
                  className="px-2 py-1 rounded-md bg-white text-sm border focus-ring"
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
});

const CalendarView = React.memo(function CalendarView({
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
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + i);
      return dt.toISOString().slice(0, 10);
    });
  }, []);

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    assignments.forEach((a) => {
      map[a.date] = map[a.date] || [];
      map[a.date].push(a);
    });
    return map;
  }, [assignments]);

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
                      className="p-1 rounded bg-white/20 focus-ring"
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
});

const RecognitionCard = React.memo(function RecognitionCard({
  volunteer,
  badges,
  onViewBadges,
  onNominate,
}: {
  volunteer: Volunteer;
  badges: { id: string; label: string; earned: boolean }[];
  onViewBadges?: () => void;
  onNominate?: () => void;
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
        <button
          className="flex-1 px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white focus-ring"
          onClick={() => onViewBadges?.()}
          aria-haspopup="dialog"
          aria-label="View badges"
        >
          View Badges
        </button>
        <button
          className="px-3 py-2 rounded-md bg-white/70 focus-ring"
          onClick={() => onNominate?.()}
          aria-haspopup="dialog"
          aria-label="Nominate a volunteer"
        >
          Nominate
        </button>
      </div>
    </div>
  );
});

const AIRecommendations = React.memo(function AIRecommendations({
  volunteer,
  opportunities,
  onSuggest,
}: {
  volunteer: Volunteer;
  opportunities: Opportunity[];
  onSuggest: (o: Opportunity) => void;
}) {
  const scored = useMemo(() => {
    return opportunities
      .map((o) => {
        const score =
          o.skillsRequired.filter((s) =>
            volunteer.skills
              .map((x) => x.toLowerCase())
              .includes(s.toLowerCase())
          ).length *
            10 +
          Math.max(0, 5 - o.spots);
        return { o, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.o)
      .slice(0, 5);
  }, [opportunities, volunteer.skills]);

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
});

const CommHub = React.memo(function CommHub({
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
            className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/60 focus:ring-2 focus:ring-indigo-50"
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
});
