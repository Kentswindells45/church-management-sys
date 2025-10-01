import { getEvents, addEvent, updateEvent, deleteEvent } from "./mockEvents";

export type Opportunity = {
  id: string;
  title: string;
  ministry: string;
  date: string;
  skillsRequired: string[];
  spots: number;
  description?: string;
  color?: string;
};

function mapEventToOpp(ev: any): Opportunity {
  return {
    id: String(ev.id),
    title: ev.name,
    ministry: ev.category ? ev.category.charAt(0).toUpperCase() + ev.category.slice(1) : "General",
    date: ev.date,
    skillsRequired: ev.category ? [ev.category] : [],
    spots: Math.max(0, (ev.maxAttendees ?? 0) - (ev.attendees ?? 0)),
    description: ev.description,
    color: ev.color ?? undefined,
  };
}

function mapOppToEvent(opp: Opportunity) {
  return {
    id: isNaN(Number(opp.id)) ? undefined : Number(opp.id),
    name: opp.title,
    date: opp.date,
    description: opp.description ?? "",
    category: opp.ministry?.toLowerCase() ?? "general",
    attendees: 0,
    maxAttendees: opp.spots ?? 0,
    // other mock fields left out intentionally
  };
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const events = await getEvents();
  return events.map(mapEventToOpp);
}

export async function createOpportunity(opp: Opportunity): Promise<Opportunity> {
  const ev = mapOppToEvent(opp);
  const created = await addEvent(ev);
  return mapEventToOpp(created);
}

export async function updateOpportunity(id: string, changes: Partial<Opportunity>): Promise<Opportunity> {
  const evChanges: any = {};
  if (changes.title !== undefined) evChanges.name = changes.title;
  if (changes.date !== undefined) evChanges.date = changes.date;
  if (changes.description !== undefined) evChanges.description = changes.description;
  if (changes.ministry !== undefined) evChanges.category = changes.ministry.toLowerCase?.() ?? changes.ministry;
  if (changes.spots !== undefined) evChanges.maxAttendees = changes.spots;
  // updateEvent expects numeric id in mockEvents
  const res = await updateEvent(Number(id), evChanges);
  return mapEventToOpp(res ?? { id, name: changes.title ?? "", date: changes.date ?? new Date().toISOString().slice(0,10), category: changes.ministry ?? "general", description: changes.description ?? "", attendees:0, maxAttendees: changes.spots ?? 0 });
}

export async function removeOpportunity(id: string): Promise<void> {
  await deleteEvent(Number(id));
}