import { Loader } from "lucide-react";

export default function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 opacity-70">
      <Loader className="size-4 animate-spin" />
      {label}
    </div>
  );
}
