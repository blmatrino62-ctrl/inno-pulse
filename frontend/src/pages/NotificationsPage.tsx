import { useState } from "react";

import { useAnomalies } from "@/api/hooks";
import { EMPTY_FILTERS } from "@/types";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
        on ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0.5"
        } mt-0.5`}
      />
    </button>
  );
}

function Section({
  color,
  icon,
  title,
  children,
}: {
  color: "blue" | "red" | "amber";
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const border = { blue: "border-blue-200", red: "border-red-300", amber: "border-amber-300" }[color];
  const bg = { blue: "bg-blue-50 dark:bg-blue-950/20", red: "bg-red-50 dark:bg-red-950/20", amber: "bg-amber-50 dark:bg-amber-950/20" }[color];
  const text = { blue: "text-blue-600", red: "text-red-600", amber: "text-amber-600" }[color];
  return (
    <div className={`rounded-xl border-2 ${border} ${bg} p-5`}>
      <h2 className={`mb-4 flex items-center gap-2 font-semibold ${text}`}>
        <span>{icon}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="muted mt-0.5 text-xs leading-snug">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function NotificationsPage() {
  const [email, setEmail] = useState("pharmacovigilance@company.com");
  const [saeAlert, setSaeAlert] = useState(true);
  const [smsEscalation, setSmsEscalation] = useState(false);
  const [spikeDetection, setSpikeDetection] = useState(true);
  const [spikeThreshold, setSpikeThreshold] = useState(50);
  const [spikeWindowDays, setSpikeWindowDays] = useState(30);
  const { data: anomalies, isLoading: anomaliesLoading } = useAnomalies(
    EMPTY_FILTERS,
    spikeWindowDays,
    spikeThreshold,
  );
  const [dailyDigest, setDailyDigest] = useState(true);
  const [dailyTime, setDailyTime] = useState("09:00");
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [weeklyDay, setWeeklyDay] = useState("Friday");
  const [weeklyTime, setWeeklyTime] = useState("17:00");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-lg font-semibold">Notifications</h1>

      {/* Delivery channels */}
      <Section color="blue" icon="📬" title="Delivery channels">
        <div>
          <label className="mb-1 block text-xs font-medium muted">Report email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          />
          <p className="muted mt-1 text-xs">Used for daily digests and weekly summary reports.</p>
        </div>
        <SettingRow
          title="Telegram integration"
          description="Connect a bot to receive instant alerts for critical SAEs (Red level) directly in your messenger."
        >
          <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">
            Set up bot
          </button>
        </SettingRow>
      </Section>

      {/* Critical alerts */}
      <Section color="red" icon="⚠" title="Critical alerts (Instant)">
        <SettingRow
          title="Notify on suspected SAE (Serious Adverse Event)"
          description="Triggers: hospitalization, death, life-threatening condition, congenital anomalies."
        >
          <Toggle on={saeAlert} onChange={setSaeAlert} />
        </SettingRow>
        <div className="border-t border-red-200 dark:border-red-800/40" />
        <SettingRow
          title="Escalation (SMS notification)"
          description="Send an SMS to the on-call officer if an SAE alert is not acknowledged within 1 hour."
        >
          <Toggle on={smsEscalation} onChange={setSmsEscalation} />
        </SettingRow>
      </Section>

      {/* Anomaly monitoring */}
      <Section color="amber" icon="📈" title="Anomaly monitoring (Safety signals)">
        <SettingRow
          title="Automatic spike detection"
          description="Compares the most recent window of mentions against the full historical dataset, which serves as the baseline reference. As new mentions arrive, they replace the 'recent' side of this comparison automatically."
        >
          <Toggle on={spikeDetection} onChange={setSpikeDetection} />
        </SettingRow>
        {spikeDetection && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="muted text-xs">Flag as anomaly when mentions/day rise by</span>
              <input
                type="number"
                value={spikeThreshold}
                onChange={(e) => setSpikeThreshold(Number(e.target.value))}
                className="w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-center text-sm"
              />
              <span className="muted text-xs">% over the last</span>
              <select
                value={spikeWindowDays}
                onChange={(e) => setSpikeWindowDays(Number(e.target.value))}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
              >
                {[7, 14, 30, 60, 90].map((d) => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
              <span className="muted text-xs">vs the baseline</span>
            </div>

            <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-white/50 dark:bg-black/10 p-3">
              {anomaliesLoading ? (
                <p className="muted text-xs">Computing baseline…</p>
              ) : !anomalies || anomalies.baseline.mentions === 0 ? (
                <p className="muted text-xs">No data available.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                    <span className="muted">
                      Baseline ({anomalies.baseline.days}d): <b className="text-[var(--text)]">{anomalies.baseline.mentions}</b> mentions · {anomalies.baseline.rate_per_day}/day
                    </span>
                    <span className="muted">
                      Recent ({anomalies.recent.days}d): <b className="text-[var(--text)]">{anomalies.recent.mentions}</b> mentions · {anomalies.recent.rate_per_day}/day
                    </span>
                    <span
                      className={`font-semibold ${
                        anomalies.overall_is_spike
                          ? "text-red-600"
                          : (anomalies.overall_pct_change ?? 0) < 0
                          ? "text-emerald-600"
                          : "muted"
                      }`}
                    >
                      {anomalies.overall_pct_change === null
                        ? "n/a"
                        : `${anomalies.overall_pct_change > 0 ? "+" : ""}${anomalies.overall_pct_change}%`}{" "}
                      overall
                    </span>
                  </div>

                  {anomalies.top_spikes.length > 0 ? (
                    <div className="mt-2 space-y-1 border-t border-amber-200 dark:border-amber-800/40 pt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide muted">
                        Reactions exceeding threshold
                      </p>
                      {anomalies.top_spikes.map((s) => (
                        <div key={s.pt} className="flex items-center justify-between text-xs">
                          <span className="font-medium">⚠ {s.pt}</span>
                          <span className="muted">
                            {s.baseline_count} → {s.recent_count} mentions{" "}
                            <b className="text-red-500">+{s.pct_change}%</b>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-emerald-600">
                      No reactions currently exceed the {spikeThreshold}% threshold.
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </Section>

      {/* Digests */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-blue-600">
          📅 Scheduled reports (Digests)
        </h2>
        <div className="space-y-5">
          <SettingRow
            title="Daily portfolio summary (Line Listing)"
            description="Report covering all non-serious AEs detected in the past 24 hours (Excel format)."
          >
            <Toggle on={dailyDigest} onChange={setDailyDigest} />
          </SettingRow>
          {dailyDigest && (
            <div className="flex items-center gap-2 pl-1">
              <span className="muted text-xs">Send time:</span>
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
              />
            </div>
          )}
          <div className="border-t border-[var(--border)]" />
          <SettingRow
            title="Weekly analytical report (Sentiment & Trends)"
            description="Summary PDF presentation covering patient sentiment and signal dynamics."
          >
            <Toggle on={weeklyReport} onChange={setWeeklyReport} />
          </SettingRow>
          {weeklyReport && (
            <div className="flex flex-wrap items-center gap-2 pl-1">
              <span className="muted text-xs">Day and time:</span>
              <select
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
              >
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input
                type="time"
                value={weeklyTime}
                onChange={(e) => setWeeklyTime(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-6">
        <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors ${
            saved ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {saved ? "✓ Saved" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
