import { exportCsvUrl } from "@/api/client";
import type { Filters } from "@/types";

export function ExportButton({ filters }: { filters: Filters }) {
  return (
    <a
      href={exportCsvUrl(filters)}
      className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
      download
    >
      ⬇ Export CSV
    </a>
  );
}
