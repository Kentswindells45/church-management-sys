/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Clock,
  ChevronLeft,
  Edit3,
  Trash2,
  Share2,
  Search,
  Filter,
  X,
} from "lucide-react";
import {
  type Event as MockEvent,
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "../services/mockEvents";
import AddEventModal from "../components/AddEventModal";
import EditEventModal from "../components/EditEventModal";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import EventSkeleton from "../components/EventSkeleton";

// Update EventType to extend MockEvent
type EventType = MockEvent & {
  currentAttendees: number;
};

// Replace existing EventCard component
const EventCard = ({
  event,
  onEdit,
  onDelete,
}: {
  event: EventType;
  onEdit: (event: EventType) => void;
  onDelete: (id: string | number) => void;
}) => {
  const status = getEventStatus(event.date);
  const attendeeColor = getAttendeeColor(event.attendees);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl 
        transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <Link to={`/events/${event.id}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3
              className="text-xl font-bold text-gray-900 group-hover:text-primary 
              transition-colors duration-300"
            >
              {event.name}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-gray-900">
                {format(parseISO(event.date), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span className="text-gray-900">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className={attendeeColor} />
              <span className={`font-medium ${attendeeColor}`}>
                {event.attendees} attendees
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span className="text-gray-900">
                {format(parseISO(event.date), "h:mm a")}
              </span>
            </div>
          </div>

          <p className="mt-4 text-gray-900 line-clamp-2">{event.description}</p>
        </div>
      </Link>

      {/* Action Buttons */}
      <div
        className="flex items-center justify-between px-6 py-3 bg-gray-50 
        border-t border-gray-100"
      >
        <span className="text-sm text-gray-600">By {event.organizer}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(event);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium 
              text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (
                window.confirm("Are you sure you want to delete this event?")
              ) {
                onDelete(event.id);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium 
              text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const getEventStatus = (date: string) => {
  const eventDate = new Date(date);
  const now = new Date();
  if (eventDate < now)
    return { label: "Past", className: "bg-gray-100 text-gray-700" };
  if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return { label: "Today", className: "bg-orange-100 text-orange-700" };
  }
  return { label: "Upcoming", className: "bg-green-100 text-green-700" };
};

const getAttendeeColor = (attendees: number) => {
  if (attendees >= 100) return "text-green-600";
  if (attendees >= 50) return "text-blue-600";
  return "text-gray-600";
};

export default function Events() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventType | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState<EventType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate("/events");
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadEventData = async () => {
      setLoading(true);
      try {
        if (!id) {
          // Fetch all events
          const data = await getEvents();
          if (isMounted) {
            setEvents(
              data.map((event) => ({
                ...event,
                currentAttendees: event.attendees || 0,
              }))
            );
          }
        } else {
          // Fetch single event
          const data = await getEvents();
          const foundEvent = data.find((e) => e.id.toString() === id);
          if (isMounted) {
            if (foundEvent) {
              setEvent({
                ...foundEvent,
                currentAttendees: foundEvent.attendees || 0,
              });
            } else {
              setEvent(null);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load event data");
          setEvent(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEventData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      const mappedEvents: EventType[] = data.map((event) => ({
        ...event,
        currentAttendees: event.attendees || 0,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (eventData: Omit<EventType, "id">) => {
    try {
      const newEvent = await addEvent(eventData);
      setEvents((prev) => [
        ...prev,
        { ...newEvent, currentAttendees: newEvent.attendees },
      ]);
      toast.success("Event created successfully");
      setShowAddModal(false);
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  const handleUpdateEvent = async (
    id: string | number,
    eventData: Partial<EventType>
  ) => {
    try {
      const updatedEvent = await updateEvent(id, eventData);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id
            ? { ...updatedEvent, currentAttendees: updatedEvent.attendees || 0 }
            : event
        )
      );
      toast.success("Event updated successfully");
      setEditEvent(null);
    } catch (error) {
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (id: string | number) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events
    .filter((event) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.organizer.toLowerCase().includes(searchLower)
      );
    })
    .filter((event) => {
      if (statusFilter === "all") return true;
      const status = getEventStatus(event.date).label.toLowerCase();
      return status === statusFilter.toLowerCase();
    })
    .filter((event) => {
      if (locationFilter === "all") return true;
      return event.location
        .toLowerCase()
        .includes(locationFilter.toLowerCase());
    })
    .filter((event) => {
      if (categoryFilter === "all") return true;
      return event.category.toLowerCase() === categoryFilter.toLowerCase();
    });

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
    setCategoryFilter("all");
  };

  // Replace the loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <EventSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!id) {
    // List view
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="Church Events"
          subtitle="Manage and organize all church activities"
          icon={Calendar}
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary 
                text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus size={20} />
              Create Event
            </button>
          }
        />

        {/* Search and Advanced Filters */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events by name or description..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300
                  focus:ring-2 focus:ring-primary/20 focus:border-primary 
                  outline-none transition-all text-gray-900"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filter by:
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 
            focus:ring-2 focus:ring-primary/20 focus:border-primary 
            outline-none transition-all text-gray-900"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Events</option>
              <option value="today">Today's Events</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 
            focus:ring-2 focus:ring-primary/20 focus:border-primary 
            outline-none transition-all text-gray-900"
            >
              <option value="all">All Locations</option>
              <option value="main">Main Hall</option>
              <option value="chapel">Chapel</option>
              <option value="garden">Garden</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 
            focus:ring-2 focus:ring-primary/20 focus:border-primary 
            outline-none transition-all text-gray-900"
            >
              <option value="all">All Categories</option>
              <option value="worship">Worship Service</option>
              <option value="youth">Youth Program</option>
              <option value="children">Children's Program</option>
              <option value="community">Community Outreach</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-primary hover:bg-primary/10 
            rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" ||
            locationFilter !== "all" ||
            categoryFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-2 w-full">
              {statusFilter !== "all" && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
            bg-primary/10 text-primary text-sm"
                >
                  {statusFilter}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  />
                </span>
              )}
              {locationFilter !== "all" && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
            bg-primary/10 text-primary text-sm"
                >
                  {locationFilter}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => setLocationFilter("all")}
                  />
                </span>
              )}
              {categoryFilter !== "all" && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
            bg-primary/10 text-primary text-sm"
                >
                  {categoryFilter}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => setCategoryFilter("all")}
                  />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Events Grid with Empty State */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-sm"
          >
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-900 mb-4">
              Start by creating your first event
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 
                text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Plus size={18} />
              Create Event
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            as="div"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={setEditEvent}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {showAddModal && (
          <AddEventModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddEvent}
          />
        )}
        {editEvent && (
          <EditEventModal
            event={editEvent}
            onClose={() => setEditEvent(null)}
            onEdit={(eventData) => handleUpdateEvent(editEvent.id, eventData)}
          />
        )}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Calendar size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          Event not found
        </h2>
        <p className="text-gray-600 mb-4">
          The event you're looking for doesn't exist
        </p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Events
        </button>
      </div>
    );
  }

  // Detail view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        Back to Events
      </button>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {event.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={20} className="text-primary" />
                <span>{format(parseISO(event.date), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={20} className="text-primary" />
                <span>{event.location}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Users size={20} className="text-primary" />
                <span>{event.attendees} attendees</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={20} className="text-primary" />
                <span>{format(parseISO(event.date), "h:mm a")}</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Organized by {event.organizer}
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <Share2 size={18} />
            Share Event
          </button>
        </div>
      </div>
    </motion.div>
  );
}
