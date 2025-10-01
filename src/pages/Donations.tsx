import React, { useEffect, useMemo, useState } from "react"; // import core React APIs
import {
  Search,
  Sun,
  Moon,
  Wallet,
  CreditCard,
  User,
  Plus,
  Download,
  Calendar,
  Filter,
} from "lucide-react"; // import icons from lucide-react
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"; // import chart components from recharts

// define Donation type used across the component
type Donation = {
  id: string; // unique id for donation
  donor: string; // donor full name
  amount: number; // donation amount (GHS)
  method: "Card" | "Cash" | "Mobile Money"; // payment method
  date: string; // ISO date string (YYYY-MM-DD)
  note?: string; // optional note
  avatar?: string; // optional avatar url
};

// sample data used as initial fallback
const sampleDonations: Donation[] = [
  {
    id: "d1",
    donor: "Grace Mensah",
    amount: 120,
    method: "Card",
    date: "2025-08-18",
    note: "For missions",
  },
  {
    id: "d2",
    donor: "John K. Boateng",
    amount: 75,
    method: "Mobile Money",
    date: "2025-08-15",
  },
  {
    id: "d3",
    donor: "Akua Osei",
    amount: 200,
    method: "Cash",
    date: "2025-07-28",
  },
  {
    id: "d4",
    donor: "Samuel Tetteh",
    amount: 50,
    method: "Card",
    date: "2025-07-20",
  },
  {
    id: "d5",
    donor: "Mercy Adom",
    amount: 400,
    method: "Mobile Money",
    date: "2025-06-11",
  },
  {
    id: "d6",
    donor: "Kofi Asante",
    amount: 60,
    method: "Cash",
    date: "2025-08-10",
  },
];

// helper to format currency values
function formatCurrency(n: number) {
  return `₵${n.toLocaleString()}`; // return an NGH currency formatted string
}

export default function Donations() {
  const [dark, setDark] = useState<boolean>(() => {
    return false; // dark mode flag, default false
  });

  // load donations from localStorage if present, otherwise use sampleDonations
  const [donations, setDonations] = useState<Donation[]>(() => {
    try {
      const raw = localStorage.getItem("donations"); // read saved donations
      return raw ? (JSON.parse(raw) as Donation[]) : sampleDonations; // parse or fallback
    } catch {
      return sampleDonations; // on parse error fallback
    }
  });

  const [query, setQuery] = useState(""); // search query for donors/notes
  const [range, setRange] = useState<"30" | "90" | "365">("30"); // time range for chart
  const [filterMethod, setFilterMethod] = useState<"all" | Donation["method"]>(
    "all"
  ); // filter by method

  // New donation form state
  const [newDonor, setNewDonor] = useState(""); // input: donor name
  const [, setNewEmail] = useState(""); // input: donor email (unused for now)
  const [newAmount, setNewAmount] = useState<number | "">(""); // input: donation amount
  const [newMethod, setNewMethod] = useState<Donation["method"]>("Card"); // input: method
  const [newNote, setNewNote] = useState(""); // input: note

  // persist donations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("donations", JSON.stringify(donations)); // save donations
    } catch {
      // ignore storage errors silently
    }
  }, [donations]); // run on donations change

  // apply dark class to document element when dark toggled
  useEffect(() => {
    const html = document.documentElement; // root element
    if (dark) html.classList.add("dark"); // enable dark styles
    else html.classList.remove("dark"); // disable dark styles
  }, [dark]); // run on dark change

  // derived stats for the cards (total, month sum, avg, top donor)
  const stats = useMemo(() => {
    const total = donations.reduce((s, d) => s + d.amount, 0); // compute total amount
    const monthStart = new Date(); // compute start of current month
    monthStart.setDate(1);
    const monthSum = donations
      .filter((d) => new Date(d.date) >= monthStart) // donations since month start
      .reduce((s, d) => s + d.amount, 0);
    const avg = donations.length ? Math.round(total / donations.length) : 0; // average
    const top = donations.reduce<Record<string, number>>((acc, d) => {
      acc[d.donor] = (acc[d.donor] || 0) + d.amount; // aggregate by donor
      return acc;
    }, {});
    const topDonor = Object.entries(top).sort((a, b) => b[1] - a[1])[0]; // highest donor
    return {
      total,
      monthSum,
      avg,
      topDonor: topDonor ? { name: topDonor[0], amount: topDonor[1] } : null,
    };
  }, [donations]); // recompute when donations change

  // chart data aggregated per day for selected range
  const chartData = useMemo(() => {
    const days = parseInt(range, 10); // number of days for range
    const data: Record<string, number> = {}; // map date -> amount
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(); // create date instance
      dt.setDate(dt.getDate() - i); // set to each day in range
      const key = dt.toISOString().slice(0, 10); // key: YYYY-MM-DD
      data[key] = 0; // initialize to 0
    }
    donations.forEach((d) => {
      const key = d.date.slice(0, 10); // donation date key
      if (key in data) data[key] += d.amount; // add to daily total
    });
    return Object.entries(data).map(([date, amount]) => ({
      date: date.slice(5),
      amount,
    })); // return month-day and amount
  }, [donations, range]); // recompute when donations or range changes

  // filtered list shown in the table based on method and query
  const filtered = donations
    .filter((d) => (filterMethod === "all" ? true : d.method === filterMethod)) // method filter
    .filter(
      (d) =>
        d.donor.toLowerCase().includes(query.toLowerCase()) || // search donor
        d.note?.toLowerCase().includes(query.toLowerCase()) // search note
    );

  // top donors for the sidebar widget
  const topDonors = useMemo(() => {
    const aggregate = donations.reduce<Record<string, number>>((acc, d) => {
      acc[d.donor] = (acc[d.donor] || 0) + d.amount; // aggregate totals
      return acc;
    }, {});
    return Object.entries(aggregate)
      .map(([name, amount]) => ({ name, amount })) // map to objects
      .sort((a, b) => b.amount - a.amount) // sort desc
      .slice(0, 5); // take top 5
  }, [donations]); // recompute when donations change

  // add donation handler for the form (client-side)
  function handleAddDonation(e?: React.FormEvent) {
    if (e) e.preventDefault(); // prevent default form submit
    if (!newDonor.trim()) return; // require donor name
    const amt = typeof newAmount === "number" ? newAmount : Number(newAmount); // coerce amount
    if (!amt || Number.isNaN(amt) || amt <= 0) return; // require valid positive amount
    const entry: Donation = {
      id: `d_${Date.now()}`, // create unique id
      donor: newDonor.trim(), // trim donor
      amount: Number(amt), // ensure number
      method: newMethod, // selected method
      date: new Date().toISOString().slice(0, 10), // use today's date in YYYY-MM-DD
      note: newNote.trim() || undefined, // optional note
    };
    setDonations((prev) => [entry, ...prev]); // prepend new donation
    setNewDonor(""); // reset form fields
    setNewEmail("");
    setNewAmount("");
    setNewNote("");
  }

  // export donations as CSV and trigger download
  function handleExportCSV() {
    // build CSV header
    const headers = ["id", "donor", "amount", "method", "date", "note"];
    // convert each donation to a CSV row escaping quotes
    const rows = donations.map((d) =>
      [
        `"${String(d.id).replace(/"/g, '""')}"`,
        `"${String(d.donor).replace(/"/g, '""')}"`,
        d.amount.toString(),
        d.method,
        d.date,
        d.note ? `"${String(d.note).replace(/"/g, '""')}"` : "",
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n"); // join header + rows
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); // create blob
    const url = URL.createObjectURL(blob); // object URL
    const a = document.createElement("a"); // anchor
    a.href = url; // set href
    a.download = `donations_${new Date().toISOString().slice(0, 10)}.csv`; // default filename
    document.body.appendChild(a); // append to body
    a.click(); // trigger download
    a.remove(); // cleanup
    URL.revokeObjectURL(url); // revoke URL
  }

  // quick "Add offline donation" action that prompts for amount & donor and saves to list
  function handleAddOfflineDonation() {
    const amountRaw = window.prompt("Enter offline donation amount (GHS):"); // prompt amount
    if (!amountRaw) return; // cancel if no input
    const amount = Number(amountRaw); // coerce to number
    if (Number.isNaN(amount) || amount <= 0) {
      window.alert("Please enter a valid positive amount."); // validation
      return;
    }
    const donor =
      window.prompt("Enter donor name:", "Offline Donor") || "Offline Donor"; // prompt donor
    const entry: Donation = {
      id: `offline_${Date.now()}`, // id for offline donation
      donor: donor.trim(), // donor name
      amount,
      method: "Cash", // default to cash for offline
      date: new Date().toISOString().slice(0, 10), // today
    };
    setDonations((prev) => [entry, ...prev]); // add to state
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      {" "}
      {/* entire page background set to white */}
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* center content with max width */}
        <header className="flex items-center justify-between gap-4 mb-6">
          {" "}
          {/* header row */}
          <div>
            {" "}
            {/* title container */}
            <h1 className="text-2xl font-semibold text-slate-900">
              Donor dashboard
            </h1>{" "}
            {/* title text */}
            <p className="mt-1 text-sm text-slate-500">
              Overview of donations, recent gifts and top supporters
            </p>{" "}
            {/* subtitle */}
          </div>
          <div className="flex items-center gap-3">
            {" "}
            {/* right-side controls */}
            <div className="relative">
              {" "}
              {/* search wrapper */}
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />{" "}
              {/* search icon */}
              <input
                aria-label="Search donations"
                value={query}
                onChange={(e) => setQuery(e.target.value)} // update query state
                className="pl-10 pr-3 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search donor or note..."
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1">
              {" "}
              {/* range selector */}
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={range}
                onChange={(e) =>
                  setRange(e.target.value as "30" | "90" | "365")
                } // change range
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last 365 days</option>
              </select>
            </div>
            <button
              aria-label="Toggle dark"
              onClick={() => setDark((d) => !d)} // toggle dark mode
              className="p-2 rounded-full bg-white border border-slate-200 shadow-sm"
            >
              {dark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {" "}
          {/* main grid */}
          {/* Left: main content */}
          <section className="lg:col-span-3 space-y-6">
            {" "}
            {/* primary area */}
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {" "}
              {/* stat cards grid */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {" "}
                {/* total donations */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">Total Donations</div>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 text-xl font-semibold text-slate-900">
                  {formatCurrency(stats.total)}
                </div>
                <div className="mt-1 text-sm text-slate-500">All time</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {" "}
                {/* this month */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">This month</div>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 text-xl font-semibold text-slate-900">
                  {formatCurrency(stats.monthSum)}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Since start of month
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {" "}
                {/* avg donation */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">Avg donation</div>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 text-xl font-semibold text-slate-900">
                  {formatCurrency(stats.avg)}
                </div>
                <div className="mt-1 text-sm text-slate-500">Per gift</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {" "}
                {/* top donor */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">Top donor</div>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100">
                    <User className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
                <div className="mt-4 text-lg font-semibold text-slate-900">
                  {stats.topDonor ? stats.topDonor.name : "—"}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {stats.topDonor ? formatCurrency(stats.topDonor.amount) : "—"}
                </div>
              </div>
            </div>
            {/* Chart + actions */}
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              {" "}
              {/* chart card */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    Donation trends
                  </h3>
                  <p className="text-sm text-slate-500">
                    Activity for the selected period
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {" "}
                  {/* chart actions */}
                  <button
                    onClick={handleExportCSV} // export CSV for displayed donations
                    aria-label="Export CSV"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  >
                    <Download className="w-4 h-4 text-white" /> Export
                  </button>
                </div>
              </div>
              <div style={{ height: 260 }}>
                {/* improved chart container: AreaChart with gradient fill + smooth stroke */}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 6, right: 6, left: -8, bottom: 6 }}
                  >
                    {/* gradients for fill and stroke */}
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
                        <stop offset="60%" stopColor="#2563EB" stopOpacity={0.06} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(2,6,23,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      padding={{ left: 6, right: 6 }}
                    />
                    <YAxis
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 6px 18px rgba(2,6,23,0.08)",
                      }}
                    />

                    {/* smooth area with gradient fill and gradient stroke */}
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="url(#strokeGradient)"
                      strokeWidth={2.5}
                      fill="url(#colorAmount)"
                      fillOpacity={1}
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Recent donations table + form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {" "}
              {/* two-column layout: table + form */}
              <div className="lg:col-span-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {" "}
                {/* recent donations */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-slate-900">
                    Recent donations
                  </h4>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={filterMethod}
                      onChange={(e) => setFilterMethod(e.target.value as never)} // change filter method
                      className="text-sm bg-transparent focus:outline-none"
                    >
                      <option value="all">All methods</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {" "}
                  {/* table wrapper */}
                  <table className="min-w-full text-left">
                    <thead className="text-xs text-slate-500 uppercase">
                      <tr>
                        <th className="py-2 px-3">Donor</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(
                        (
                          d // render each filtered donation
                        ) => (
                          <tr key={d.id} className="border-t border-slate-100">
                            <td className="py-3 px-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-700">
                                {d.donor
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {d.donor}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {/* email placeholder if available */}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-sm font-medium text-slate-900">
                              {formatCurrency(d.amount)}
                            </td>
                            <td className="py-3 px-3 text-sm text-slate-500 flex items-center gap-2">
                              {d.method === "Card" && (
                                <CreditCard className="w-4 h-4 text-slate-500" />
                              )}
                              {d.method === "Mobile Money" && (
                                <Wallet className="w-4 h-4 text-slate-500" />
                              )}
                              {d.method === "Cash" && (
                                <User className="w-4 h-4 text-slate-500" />
                              )}
                              <span>{d.method}</span>
                            </td>
                            <td className="py-3 px-3 text-sm text-slate-500">
                              {d.date}
                            </td>
                            <td className="py-3 px-3 text-sm text-slate-500">
                              {d.note ?? "—"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Form */}
              <aside className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {" "}
                {/* add donation form */}
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  Add new donation
                </h4>
                <form onSubmit={handleAddDonation} className="space-y-3">
                  {" "}
                  {/* form submit */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Donor
                    </label>
                    <input
                      value={newDonor}
                      onChange={(e) => setNewDonor(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      value={newAmount as never}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                      placeholder="Amount"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Method
                    </label>
                    <select
                      value={newMethod}
                      onChange={(e) => setNewMethod(e.target.value as never)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                    >
                      <option>Card</option>
                      <option>Cash</option>
                      <option>Mobile Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Note
                    </label>
                    <input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                      placeholder="Optional note"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add donation
                  </button>
                </form>
              </aside>
            </div>
          </section>
          {/* Right: sidebar */}
          <aside className="space-y-6">
            {" "}
            {/* sidebar area */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              {" "}
              {/* top donors */}
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-slate-900">
                  Top donors
                </h5>
                <button className="text-sm text-slate-500">View all</button>
              </div>
              <div className="mt-3 space-y-3">
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                {topDonors.map((t, ) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-700">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {t.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Top supporter
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              {" "}
              {/* quick actions */}
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-slate-500">
                  Quick actions
                </h5>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                  <button
                    onClick={handleExportCSV}
                    aria-label="Export CSV"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  >
                    <Download className="w-4 h-4 text-white" />
                    Export CSV
                  </button>

                  <button
                    onClick={handleAddOfflineDonation}
                    aria-label="Add offline donation"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  >
                    <Wallet className="w-4 h-4 text-white" />
                    Add offline donation
                  </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
