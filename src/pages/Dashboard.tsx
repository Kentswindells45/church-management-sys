/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // add auth hook for logout
import {
  Users,
  Wallet,
  Calendar,
  HeartHandshake,
  LayoutDashboard,
} from "lucide-react";
import StatCard from "../components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
} from "recharts";
import { generateMockData } from "../services/mockData";
import PageHeader from "../components/PageHeader";

// Types
type Stat = {
  label: string;
  value: string | number;
  icon: React.FC<{ size?: number }>;
  color: string;
  path?: string;
};

type Donation = { month: string; amount: number };
type Event = { id: number; name: string; date: string; attendees: number };
type DepartmentStat = { name: string; value: number; color: string };
type AttendanceTrend = {
  date: string;
  adults: number;
  youth: number;
  children: number;
};
type MinistryParticipation = {
  ministry: string;
  participation: number;
  fullMark: number;
};
type FinancialOverview = {
  month: string;
  income: number;
  expenses: number;
  offerings: number;
};

const chartStyles = {
  tooltip: {
    background: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  gridLine: {
    stroke: "#e5e7eb",
    strokeDasharray: "3 3",
    opacity: 0.4,
  },
};

// Add this utility function at the top of your file after the types
const formatGhanaCedi = (amount: number) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth() || {}; // safely get logout from auth context
  const [stats, setStats] = useState<Stat[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>(
    []
  );
  const [ministryStats, setMinistryStats] = useState<MinistryParticipation[]>(
    []
  );
  const [financialOverview, setFinancialOverview] = useState<
    FinancialOverview[]
  >([]);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get mock data
        const data = generateMockData();

        setStats([
          {
            label: "Total Members",
            value: data.stats.totalMembers,
            icon: Users,
            color: "bg-blue-600",
            path: "/members",
          },
          {
            label: "Total Donations",
            value: formatGhanaCedi(data.stats.totalDonations),
            icon: Wallet,
            color: "bg-green-600",
            path: "/donations",
          },
          {
            label: "Upcoming Events",
            value: data.stats.upcomingEvents,
            icon: Calendar,
            color: "bg-purple-600",
            path: "/events",
          },
          {
            label: "Volunteers",
            value: data.stats.volunteers,
            icon: HeartHandshake,
            color: "bg-orange-500",
            path: "/volunteers",
          },
        ]);

        setDepartmentStats(data.departments);
        setAttendanceTrends(data.attendance);
        setMinistryStats(data.ministries);
        setFinancialOverview(data.finances);
        setDonations(data.donations);
        setEvents(data.recentEvents);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // First, create a custom tooltip component for financial data
  const CustomFinancialTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalIncome =
        payload.find((p: any) => p.dataKey === "income")?.value || 0;
      const totalExpenses =
        payload.find((p: any) => p.dataKey === "expenses")?.value || 0;
      const totalOfferings =
        payload.find((p: any) => p.dataKey === "offerings")?.value || 0;

      return (
        <div className="bg-white/95 shadow-lg rounded-lg p-4 border border-gray-100">
          <p className="font-semibold text-gray-900 mb-3 pb-2 border-b">
            {label} Overview
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-indigo-600 font-medium">Total Income:</span>
              <span className="font-semibold">
                {formatGhanaCedi(totalIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-red-600 font-medium">Total Expenses:</span>
              <span className="font-semibold">
                {formatGhanaCedi(totalExpenses)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-green-600 font-medium">
                Total Offerings:
              </span>
              <span className="font-semibold">
                {formatGhanaCedi(totalOfferings)}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between gap-8 text-sm">
                <span className="text-gray-600">Net Balance:</span>
                <span
                  className={`font-bold ${
                    totalIncome - totalExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatGhanaCedi(totalIncome - totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 shadow-lg rounded-lg p-3 border border-gray-100">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">
            Members: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-gray-600 text-sm">
            ({((payload[0].value / 100) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle="Church Management Overview"
        icon={LayoutDashboard}
      />
      <div className="mt-4 sm:mt-6 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 p-4">
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8">
          {/* header row with redesigned logout button (red gradient, white text) */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                Dashboard Overview
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Welcome to your church management dashboard.
              </p>
            </div>

            {/* Logout button: red gradient background with white text, accessible and focused */}
            <div>
              <button
                onClick={() => {
                  // call logout if provided by auth context, otherwise navigate to login
                  if (typeof logout === "function") {
                    logout();
                  } else {
                    navigate("/login");
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium shadow-md hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
                aria-label="Logout"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Responsive Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((s, i) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                Icon={s.icon}
                color={s.color}
                index={i}
                onClick={() => s.path && navigate(s.path)}
              />
            ))}
          </div>

          {/* Responsive Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Donations Chart */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-500" />
                Monthly Donations
              </h2>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donations}>
                    <defs>
                      <linearGradient
                        id="donationGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...chartStyles.gridLine} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => formatGhanaCedi(value)}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 shadow-lg rounded-lg p-3 border border-gray-100">
                              <p className="font-semibold text-gray-900 mb-1">
                                {label}
                              </p>
                              <p className="text-green-600 font-medium">
                                {formatGhanaCedi(payload[0].value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="url(#donationGradient)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Department Distribution
              </h2>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={CustomPieTooltip} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <span style={{ color: entry.color }}>⬤</span>
                          <span>{value}</span>
                          <span className="font-medium">
                            {entry.payload.value}
                          </span>
                        </span>
                      )}
                      wrapperStyle={{
                        paddingLeft: "20px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Trends */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Attendance Trends
              </h2>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrends}>
                    <defs>
                      {["adults", "youth", "children"].map((key, index) => (
                        <linearGradient
                          key={key}
                          id={`color-${key}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="5%"
                            stopColor={["#3b82f6", "#8b5cf6", "#10b981"][index]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={["#3b82f6", "#8b5cf6", "#10b981"][index]}
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid {...chartStyles.gridLine} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 shadow-lg rounded-lg p-3 border border-gray-100">
                              <p className="font-semibold text-gray-900 mb-2">
                                {label}
                              </p>
                              {payload.map((pld: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <span style={{ color: pld.color }}>
                                    {pld.name}:
                                  </span>
                                  <span className="font-medium">
                                    {pld.value} people
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="adults"
                      stroke="url(#color-adults)"
                      strokeWidth={3}
                      dot={{
                        stroke: "#3b82f6",
                        strokeWidth: 2,
                        r: 4,
                        fill: "white",
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "#3b82f6",
                        strokeWidth: 2,
                        fill: "white",
                      }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="youth"
                      stroke="url(#color-youth)"
                      strokeWidth={3}
                      dot={{
                        stroke: "#8b5cf6",
                        strokeWidth: 2,
                        r: 4,
                        fill: "white",
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "#8b5cf6",
                        strokeWidth: 2,
                        fill: "white",
                      }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="children"
                      stroke="url(#color-children)"
                      strokeWidth={3}
                      dot={{
                        stroke: "#10b981",
                        strokeWidth: 2,
                        r: 4,
                        fill: "white",
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "#10b981",
                        strokeWidth: 2,
                        fill: "white",
                      }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ministry Participation */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-500" />
                Ministry Participation
              </h2>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={ministryStats}
                  >
                    <defs>
                      <linearGradient
                        id="radarGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <PolarGrid gridType="circle" stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="ministry"
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "#4b5563" }}
                      axisLine={false}
                    />
                    <Radar
                      name="Participation"
                      dataKey="participation"
                      stroke="#8884d8"
                      fill="url(#radarGradient)"
                      fillOpacity={0.6}
                      animationDuration={1500}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 shadow-lg rounded-lg p-3 border border-gray-100">
                              <p className="font-semibold text-gray-900">
                                {payload[0].payload.ministry}
                              </p>
                              <p className="text-gray-600">
                                Participation:{" "}
                                <span className="font-medium">
                                  {payload[0].value}%
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-500" />
                  Financial Overview
                </h2>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                    <span className="text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-gray-600">Expenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">Offerings</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={financialOverview}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradient-income"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradient-expenses"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradient-offerings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => formatGhanaCedi(value)}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip content={CustomFinancialTooltip} />
                    <Bar
                      dataKey="income"
                      fill="url(#gradient-income)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="url(#gradient-expenses)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="offerings"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#gradient-offerings)"
                      dot={{
                        fill: "#22c55e",
                        strokeWidth: 2,
                        r: 4,
                        stroke: "white",
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "#22c55e",
                        strokeWidth: 2,
                        fill: "white",
                      }}
                      animationDuration={1500}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Responsive Summary Section */}
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {financialOverview.length > 0 && (
                  <>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-sm text-indigo-600">Latest Income</p>
                      <p className="text-lg font-semibold text-indigo-700">
                        {formatGhanaCedi(
                          financialOverview[financialOverview.length - 1].income
                        )}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-600">Latest Expenses</p>
                      <p className="text-lg font-semibold text-red-700">
                        {formatGhanaCedi(
                          financialOverview[financialOverview.length - 1]
                            .expenses
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600">Latest Offerings</p>
                      <p className="text-lg font-semibold text-green-700">
                        {formatGhanaCedi(
                          financialOverview[financialOverview.length - 1]
                            .offerings
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Responsive Recent Events Table */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
              Recent Events
            </h2>
            <div className="min-w-full overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Event Name
                    </th>
                    <th className="border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Attendees
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <td className="border-b border-gray-200 px-4 sm:px-6 py-4 text-gray-700">
                        {event.name}
                      </td>
                      <td className="border-b border-gray-200 px-4 sm:px-6 py-4 text-gray-700">
                        {event.date}
                      </td>
                      <td className="border-b border-gray-200 px-4 sm:px-6 py-4 text-gray-700">
                        {event.attendees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
