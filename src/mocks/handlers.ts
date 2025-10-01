import { rest } from "msw";
import { faker } from "@faker-js/faker";

const ministries = ["Choir", "Youth", "Ushering", "Media", "Pastoral"];

export const handlers = [
  rest.get("/api/dashboard", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        stats: {
          totalMembers: 320,
          totalDonations: 12450,
          upcomingEvents: 5,
          volunteers: 48,
        },
        donations: [
          { month: "Jan", amount: 2000 },
          { month: "Feb", amount: 1500 },
          { month: "Mar", amount: 3000 },
          { month: "Apr", amount: 2200 },
          { month: "May", amount: 1800 },
          { month: "Jun", amount: 2750 },
        ],
        recentEvents: [
          { id: 1, name: "Sunday Service", date: "2025-08-10", attendees: 120 },
          { id: 2, name: "Youth Fellowship", date: "2025-08-12", attendees: 45 },
          { id: 3, name: "Charity Drive", date: "2025-08-15", attendees: 80 },
        ],
      })
    );
  }),

  rest.get("/api/members", (req, res, ctx) => {
    const search = req.url.searchParams.get("search")?.toLowerCase() || "";
    const ministry = req.url.searchParams.get("ministry") || "";

    let members = Array.from({ length: 60 }).map(() => {
      const name = faker.person.fullName();
      return {
        id: faker.string.uuid(),
        name,
        ministry: faker.helpers.arrayElement(ministries),
        joined: faker.date.past({ years: 3 }).toLocaleDateString(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        notes: faker.lorem.sentences(2),
      };
    });

    if (search) {
      members = members.filter((m) => m.name.toLowerCase().includes(search));
    }

    if (ministry && ministry !== "All") {
      members = members.filter((m) => m.ministry === ministry);
    }

    return res(ctx.status(200), ctx.json(members));
  }),

  rest.get("/api/events/:id", (req, res, ctx) => {
    const { id } = req.params;
    const event = {
      id,
      name: faker.lorem.words({ min: 2, max: 4 }),
      date: faker.date.soon().toISOString().split("T")[0],
      attendees: faker.number.int({ min: 20, max: 300 }),
      description: faker.lorem.paragraphs(1),
      location: faker.location.streetAddress(),
      organizer: faker.person.fullName(),
    };

    return res(ctx.status(200), ctx.json(event));
  }),

  rest.get("/api/events", (req, res, ctx) => {
    // Return a list of events (use faker or static data)
    const events = [
      {
        id: 1,
        name: "Sunday Service",
        date: "2025-08-10",
        attendees: 120,
        description: "Weekly worship service.",
        location: "Main Hall",
        organizer: "Pastor John",
      },
      {
        id: 2,
        name: "Youth Fellowship",
        date: "2025-08-12",
        attendees: 45,
        description: "Youth group meeting.",
        location: "Youth Room",
        organizer: "Sister Mary",
      },
      {
        id: 3,
        name: "Charity Drive",
        date: "2025-08-15",
        attendees: 80,
        description: "Community outreach event.",
        location: "Community Center",
        organizer: "Brother Paul",
      },
    ];
    return res(ctx.status(200), ctx.json(events));
  }),
];
