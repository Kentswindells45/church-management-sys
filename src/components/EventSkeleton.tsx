const EventSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-20 bg-gray-200 rounded animate-pulse" />
    </div>
  );
};

export default EventSkeleton;