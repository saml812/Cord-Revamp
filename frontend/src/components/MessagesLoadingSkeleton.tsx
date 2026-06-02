function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`chat ${index % 2 === 0 ? "chat-start" : "chat-end"}`}
        >
          <div className="chat-bubble w-32 h-10 skeleton" />
        </div>
      ))}
    </div>
  );
}
export default MessagesLoadingSkeleton;