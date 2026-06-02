import { ChevronLeft } from "lucide-react";
import type { AuditLogsPage } from "./types";
import AdminCard from "./AdminCard";
import AdminPagination from "./AdminPagination";
import AdminLoading from "./AdminLoading";
import { formatUserLabel } from "./utils";

type Props = {
  isLoading: boolean;
  data: AuditLogsPage | null;
  onPrev: () => void;
  onNext: () => void;
  onBack?: () => void;
};

export default function AdminAuditLogs({ isLoading, data, onPrev, onNext, onBack }: Props) {
  return (
    <AdminCard
      title="Admin audit logs"
      className="w-full"
      headerLeft={
        onBack ? (
          <button
            type="button"
            className="md:hidden btn btn-ghost btn-sm btn-circle -ml-1 mr-1"
            onClick={onBack}
            aria-label="Back to user list"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : undefined
      }
      headerRight={
        <AdminPagination
          onPrev={onPrev}
          onNext={onNext}
          prevDisabled={!data || data.page <= 1}
          nextDisabled={!data || data.page >= data.totalPages}
        />
      }
    >
      {isLoading ? (
        <AdminLoading />
      ) : !data ? (
        <div className="opacity-70">No data.</div>
      ) : (
        <>
          <div className="text-sm opacity-70 mb-3">
            Page {data.page} / {data.totalPages} • Total {data.total}
          </div>
          <div className="overflow-x-auto max-w-full">
            <table className="table table-zebra table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-[170px]">Time</th>
                  <th className="w-[160px]">Action</th>
                  <th className="w-[240px]">Actor</th>
                  <th className="w-[240px]">Target</th>
                  <th className="w-auto">Meta</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((row) => (
                  <tr key={row._id}>
                    <td className="whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="font-mono text-xs">{row.action}</td>
                    <td className="text-sm">{formatUserLabel(row.actorId)}</td>
                    <td className="text-sm">{formatUserLabel(row.targetId)}</td>
                    <td
                      className="text-xs opacity-70 max-w-[520px] whitespace-normal break-words overflow-hidden"
                      title={JSON.stringify(row.meta ?? {})}
                    >
                      <div className="line-clamp-3">{JSON.stringify(row.meta ?? {})}</div>
                    </td>
                  </tr>
                ))}
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center opacity-70 py-6">
                      No audit logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminCard>
  );
}
