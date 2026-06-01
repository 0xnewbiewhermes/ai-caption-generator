export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-[var(--accent)] animate-pulse" />
        <div
          className="w-2 h-2 bg-[var(--accent)] animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-[var(--accent)] animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
