import { useOffline } from "@/projects/kasicart/store/OfflineContext";
import { useDataSaver } from "@/projects/kasicart/store/DataSaverContext";

export function SystemBanners() {
  const { online } = useOffline();
  const { enabled, toggle, effective } = useDataSaver();

  return (
    <div className="space-y-0">
      {!online && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-xs sm:text-sm text-center py-2 px-4">
          Offline browsing — you can view previously loaded products. Checkout is disabled while offline.
        </div>
      )}
      {effective && (
        <div className="bg-[#1E3A2E] text-[#FFFBF5] text-xs text-center py-1.5 px-4 flex items-center justify-center gap-2">
          <span>Data Saver on — lower-res imagery, fewer animations, deferred loads.</span>
          <button onClick={toggle} className="underline underline-offset-4">Turn off</button>
        </div>
      )}
    </div>
  );
}
