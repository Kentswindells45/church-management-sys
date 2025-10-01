import { addMonths, format } from 'date-fns';

export const generateMockData = () => {
  // Generate last 6 months of data
  const months = Array.from({ length: 6 }).map((_, i) => {
    const date = addMonths(new Date(), -5 + i);
    return format(date, 'MMM');
  });

  const departmentData = [
    { name: "Choir", value: Math.floor(Math.random() * 50) + 30 },
    { name: "Youth", value: Math.floor(Math.random() * 40) + 25 },
    { name: "Children", value: Math.floor(Math.random() * 30) + 20 },
    { name: "Women", value: Math.floor(Math.random() * 35) + 25 },
    { name: "Men", value: Math.floor(Math.random() * 30) + 20 }
  ];

  return {
    stats: {
      totalMembers: departmentData.reduce((acc, curr) => acc + curr.value, 0),
      totalDonations: Math.floor(Math.random() * 50000) + 100000,
      upcomingEvents: Math.floor(Math.random() * 5) + 5,
      volunteers: Math.floor(Math.random() * 30) + 50
    },
    donations: months.map(month => ({
      month,
      amount: Math.floor(Math.random() * 10000) + 15000
    })),
    departments: departmentData.map(dept => ({
      ...dept,
      color: {
        "Choir": "#8b5cf6",
        "Youth": "#3b82f6",
        "Children": "#10b981",
        "Women": "#f59e0b",
        "Men": "#ef4444"
      }[dept.name] || "#6b7280"
    })),
    attendance: months.map(month => ({
      date: month,
      adults: Math.floor(Math.random() * 50) + 130,
      youth: Math.floor(Math.random() * 30) + 60,
      children: Math.floor(Math.random() * 20) + 40
    })),
    ministries: [
      "Worship", "Outreach", "Education", 
      "Youth", "Missions", "Community"
    ].map(ministry => ({
      ministry,
      participation: Math.floor(Math.random() * 30) + 60,
      fullMark: 100
    })),
    finances: months.map(month => {
      const income = Math.floor(Math.random() * 8000) + 18000;
      const expenses = Math.floor(Math.random() * 5000) + 13000;
      const offerings = Math.floor(Math.random() * 4000) + 10000;
      return { month, income, expenses, offerings };
    }),
    recentEvents: [
      {
        id: 1,
        name: "Sunday Service",
        date: format(new Date(), 'yyyy-MM-dd'),
        attendees: Math.floor(Math.random() * 100) + 300
      },
      {
        id: 2,
        name: "Youth Meeting",
        date: format(addMonths(new Date(), -1), 'yyyy-MM-dd'),
        attendees: Math.floor(Math.random() * 30) + 60
      },
      {
        id: 3,
        name: "Prayer Meeting",
        date: format(addMonths(new Date(), -1), 'yyyy-MM-dd'),
        attendees: Math.floor(Math.random() * 50) + 100
      }
    ]
  };
};