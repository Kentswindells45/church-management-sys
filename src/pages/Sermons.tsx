import React from "react";
import { BookOpen, PlayCircle, Calendar } from "lucide-react";

const sampleSermons = [
  {
    id: 1,
    title: "Walking in Faith",
    preacher: "Pastor John Doe",
    date: "2025-08-03",
    description: "Discover how to strengthen your faith in challenging times.",
    videoUrl: "#",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 2,
    title: "The Power of Forgiveness",
    preacher: "Sister Mary Smith",
    date: "2025-07-27",
    description: "Learn the biblical importance and freedom of forgiveness.",
    videoUrl: "#",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 3,
    title: "Hope for Tomorrow",
    preacher: "Brother Paul Lee",
    date: "2025-07-20",
    description: "A message of hope and encouragement for the future.",
    videoUrl: "#",
    color: "from-green-400 to-teal-500",
  },
];

export default function Sermons() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen size={36} className="text-primary drop-shadow" />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent drop-shadow">
          Sermons
        </h1>
      </div>
      <p className="text-lg text-gray-600 mb-10">
        Explore our inspiring sermon archive. Watch, listen, and be uplifted!
      </p>
      <div className="grid gap-8 sm:grid-cols-2">
        {sampleSermons.map((sermon) => (
          <div
            key={sermon.id}
            className={`rounded-2xl shadow-lg bg-gradient-to-br ${sermon.color} p-1 hover:scale-[1.03] transition-transform`}
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <PlayCircle className="text-primary" size={28} />
                <span className="font-semibold text-lg text-gray-800">
                  {sermon.title}
                </span>
              </div>
              <p className="text-gray-600 mb-4 flex-1">{sermon.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(sermon.date).toLocaleDateString()}
                </span>
                <span className="font-medium">{sermon.preacher}</span>
              </div>
              <a
                href={sermon.videoUrl}
                className="mt-4 inline-block text-white bg-primary hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold shadow transition"
              >
                Watch Sermon
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
