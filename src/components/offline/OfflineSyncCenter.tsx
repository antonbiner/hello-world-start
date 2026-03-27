import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, CloudDownload, Clock3, AlertTriangle, X, ChevronDown, ChevronRight } from "lucide-react";
import { useOffline } from "@/contexts/OfflineContext";
import { useTranslation } from "react-i18next";

const OFFLINE_SYNC_CENTER_DISMISSED_KEY = "offline-sync-center-dismissed-v1";

const formatDate = (value?: string): string => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString();
};

export const OfflineSyncCenter: React.FC = () => {
  const { t } = useTranslation("settings");
  const { enabled, online, syncing, hydrating, pendingCount, lastSyncAt, lastError, lastSyncDetail, syncNow, hydrateNow } = useOffline();
  const [expanded, setExpanded] = React.useState(false);
  const [showSyncDetail, setShowSyncDetail] = React.useState(false);
  const [visible, setVisible] = React.useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(OFFLINE_SYNC_CENTER_DISMISSED_KEY) !== "true";
  });

  const close = () => {
    localStorage.setItem(OFFLINE_SYNC_CENTER_DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      <div className="rounded-xl border border-border bg-card shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/90 min-w-[290px]">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
          <button
            className="flex-1 flex items-center justify-between gap-3 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="flex items-center gap-2">
              {online ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-amber-500" />}
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Offline Mode" : "Online Mode"}</Badge>
              {pendingCount > 0 && <Badge variant="outline">{pendingCount} queued</Badge>}
            </div>
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close offline panel"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {expanded && (
          <div className="px-4 pb-4 pt-1 space-y-3">
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CloudDownload className="h-3.5 w-3.5" />
                <span>{online ? "Connected" : "Offline"} - cached data remains available</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Last successful sync: {formatDate(lastSyncAt)}</span>
              </div>
              {lastError ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{lastError}</span>
                  </div>
                  {lastSyncDetail &&
                  ((lastSyncDetail.failedOperations?.length ?? 0) > 0 ||
                    (lastSyncDetail.binaryFailures?.length ?? 0) > 0 ||
                    lastSyncDetail.httpStatus != null ||
                    lastSyncDetail.httpBody ||
                    lastSyncDetail.fatalError) ? (
                    <button
                      type="button"
                      onClick={() => setShowSyncDetail((v) => !v)}
                      className="flex w-full items-center gap-1 text-left text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {showSyncDetail ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      {t("syncDashboard.syncOverlay.reportTitle")}
                    </button>
                  ) : null}
                  {showSyncDetail && lastSyncDetail ? (
                    <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-[11px] space-y-2 max-h-52 overflow-auto">
                      {lastSyncDetail.httpStatus != null ? (
                        <p className="text-amber-700 dark:text-amber-300">
                          {t("syncDashboard.syncOverlay.httpTitle", { status: lastSyncDetail.httpStatus })}
                        </p>
                      ) : null}
                      {lastSyncDetail.httpBody ? (
                        <pre className="whitespace-pre-wrap break-words rounded bg-background/80 p-2 font-mono text-[10px] text-muted-foreground">
                          {lastSyncDetail.httpBody}
                        </pre>
                      ) : null}
                      {lastSyncDetail.fatalError ? (
                        <p className="font-mono text-destructive text-[10px]">{lastSyncDetail.fatalError}</p>
                      ) : null}
                      {(lastSyncDetail.binaryFailures ?? []).map((row) => (
                        <div key={`b-${row.opId}`} className="border-t border-border/40 pt-2">
                          <span className="font-mono text-[10px]">{row.method}</span>{" "}
                          <span className="break-all">{row.endpoint}</span>
                          <p className="text-destructive">{row.error}</p>
                        </div>
                      ))}
                      {(lastSyncDetail.failedOperations ?? []).map((row) => (
                        <div key={row.opId} className="border-t border-border/40 pt-2 space-y-0.5">
                          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono">{row.opId}</span>
                            <Badge variant="outline" className="text-[10px] h-5">
                              {row.status}
                            </Badge>
                          </div>
                          <p className="font-mono text-[10px] break-all">
                            {row.method} {row.endpoint}
                          </p>
                          <p className="text-destructive">{row.error || t("syncDashboard.syncOverlay.noServerMessage")}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => void syncNow()}
                disabled={!online || syncing || enabled}
                className="h-8 px-3"
                size="sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync now"}
              </Button>
              <Button
                onClick={() => void hydrateNow()}
                disabled={!online || hydrating}
                variant="secondary"
                className="h-8 px-3"
                size="sm"
              >
                <CloudDownload className={`h-3.5 w-3.5 mr-1 ${hydrating ? "animate-pulse" : ""}`} />
                {hydrating ? "Caching…" : "Refresh offline cache"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {pendingCount > 0 ? `${pendingCount} operation(s) waiting` : "Queue empty"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
