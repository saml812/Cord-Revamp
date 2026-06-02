function UsersLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-base-200/60 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full skeleton"></div>
            <div className="flex-1">
              <div className="h-4 rounded w-3/4 mb-2 skeleton"></div>
              <div className="h-3 rounded w-1/2 skeleton"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;