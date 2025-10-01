import { addDays, addHours, format } from 'date-fns';

export interface Event {
  id: string | number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  organizer: string;
  category: string;
  imageUrl?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  maxAttendees: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export const mockEvents: Event[] = [
  {
    id: 1,
    name: "Sunday Worship Service",
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    time: "09:00",
    location: "Main Sanctuary",
    description: "Weekly Sunday worship service with praise, worship, and the Word.",
    attendees: 200,
    organizer: "Pastor Johnson",
    category: "worship",
    isRecurring: true,
    recurringFrequency: "weekly",
    maxAttendees: 300,
    registrationRequired: false,
    status: 'upcoming'
  },
  {
    id: 2,
    name: "Youth Night",
    date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    time: "18:00",
    location: "Youth Center",
    description: "An evening of fellowship, games, and biblical teaching for young people.",
    attendees: 45,
    organizer: "Youth Ministry Team",
    category: "youth",
    isRecurring: false,
    maxAttendees: 100,
    registrationRequired: true,
    registrationDeadline: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    imageUrl: "/images/youth-night.jpg",
    status: 'upcoming'
  },
  {
    id: 3,
    name: "Prayer Meeting",
    date: format(addHours(new Date(), 2), 'yyyy-MM-dd'),
    time: "19:00",
    location: "Prayer Room",
    description: "Join us for our weekly prayer meeting as we intercede for our church and community.",
    attendees: 25,
    organizer: "Prayer Ministry",
    category: "prayer",
    isRecurring: true,
    recurringFrequency: "weekly",
    maxAttendees: 50,
    registrationRequired: false,
    status: 'ongoing'
  },
  {
    id: 4,
    name: "Children's Bible Study",
    date: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
    time: "10:00",
    location: "Children's Ministry Room",
    description: "Weekly Bible study session for children aged 5-12.",
    attendees: 30,
    organizer: "Children's Ministry Team",
    category: "children",
    isRecurring: true,
    recurringFrequency: "weekly",
    maxAttendees: 40,
    registrationRequired: true,
    registrationDeadline: format(addDays(new Date(), -2), 'yyyy-MM-dd'),
    status: 'completed'
  },
  {
    id: 5,
    name: "Community Outreach",
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    time: "08:00",
    location: "Community Center",
    description: "Monthly community service event reaching out to those in need.",
    attendees: 0,
    organizer: "Outreach Team",
    category: "community",
    isRecurring: true,
    recurringFrequency: "monthly",
    maxAttendees: 75,
    registrationRequired: true,
    registrationDeadline: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    imageUrl: "/images/outreach.jpg",
    status: 'upcoming'
  }
];

export const getEvents = () => {
  return Promise.resolve(mockEvents);
};

export const getEventById = (id: string | number) => {
  const event = mockEvents.find(e => e.id.toString() === id.toString());
  return Promise.resolve(event);
};

export const addEvent = (event: Omit<Event, 'id'>) => {
  const newEvent = {
    ...event,
    id: Date.now(),
  };
  mockEvents.push(newEvent);
  return Promise.resolve(newEvent);
};

export const updateEvent = (id: string | number, event: Partial<Event>) => {
  const index = mockEvents.findIndex(e => e.id.toString() === id.toString());
  if (index !== -1) {
    mockEvents[index] = { ...mockEvents[index], ...event };
    return Promise.resolve(mockEvents[index]);
  }
  return Promise.reject(new Error('Event not found'));
};

export const deleteEvent = (id: string | number) => {
  const index = mockEvents.findIndex(e => e.id.toString() === id.toString());
  if (index !== -1) {
    mockEvents.splice(index, 1);
    return Promise.resolve(true);
  }
  return Promise.reject(new Error('Event not found'));
};