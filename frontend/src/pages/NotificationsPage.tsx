import { useState } from "react";

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

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

export function NotificationsPage() {
  const [email, setEmail] = useState("pharmacovigilance@company.com");
  const [saeAlert, setSaeAlert] = useState(true);
  const [smsEscalation, setSmsEscalation] = useState(false);
  const [spikeDetection, setSpikeDetection] = useState(true);
  const [spikeThreshold, setSpikeThreshold] = useState(200);
  const [spikeWindow, setSpikeWindow] = useState("24 часа");
  const [dailyDigest, setDailyDigest] = useState(true);
  const [dailyTime, setDailyTime] = useState("09:00");
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [weeklyDay, setWeeklyDay] = useState("Пятница");
  const [weeklyTime, setWeeklyTime] = useState("17:00");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-lg font-semibold">Уведомления</h1>

      {/* Delivery channels */}
      <Section color="blue" icon="📬" title="Каналы доставки">
        <div>
          <label className="mb-1 block text-xs font-medium muted">Email для отчётов</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          />
          <p className="muted mt-1 text-xs">Используется для ежедневных дайджестов и еженедельных сводок.</p>
        </div>
        <SettingRow
          title="Telegram интеграция"
          description="Подключите бота для получения мгновенных уведомлений о критических СНЯ (Красный уровень) прямо в рабочий мессенджер."
        >
          <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">
            Настроить бота
          </button>
        </SettingRow>
      </Section>

      {/* Critical alerts */}
      <Section color="red" icon="⚠" title="Критические алерты (Мгновенно)">
        <SettingRow
          title="Уведомлять о подозрении на СНЯ (SAE)"
          description="Триггеры: госпитализация, смерть, угроза жизни, врождённые аномалии."
        >
          <Toggle on={saeAlert} onChange={setSaeAlert} />
        </SettingRow>
        <div className="border-t border-red-200 dark:border-red-800/40" />
        <SettingRow
          title="Эскалация (СМС-уведомление)"
          description="Отправлять СМС на номер дежурного, если алерт СНЯ не взят в работу более 1 часа."
        >
          <Toggle on={smsEscalation} onChange={setSmsEscalation} />
        </SettingRow>
      </Section>

      {/* Anomaly monitoring */}
      <Section color="amber" icon="📈" title="Мониторинг аномалий (Сигналы безопасности)">
        <SettingRow
          title="Автоматическое выявление всплесков"
          description="Анализировать отклонения от исторических средних значений."
        >
          <Toggle on={spikeDetection} onChange={setSpikeDetection} />
        </SettingRow>
        {spikeDetection && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="muted text-xs">Считать аномалией, если количество упоминаний реакции возрастает на</span>
            <input
              type="number"
              value={spikeThreshold}
              onChange={(e) => setSpikeThreshold(Number(e.target.value))}
              className="w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-center text-sm"
            />
            <span className="muted text-xs">% за последние</span>
            <select
              value={spikeWindow}
              onChange={(e) => setSpikeWindow(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
            >
              {["1 час", "6 часов", "24 часа", "7 дней"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
      </Section>

      {/* Digests */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-blue-600">
          📅 Регулярные рассылки (Дайджесты)
        </h2>
        <div className="space-y-5">
          <SettingRow
            title="Ежедневная сводка по портфелю (Line Listing)"
            description="Отчёт со всеми несерьёзными НЯ, выявленными за прошедшие сутки (Excel формат)."
          >
            <Toggle on={dailyDigest} onChange={setDailyDigest} />
          </SettingRow>
          {dailyDigest && (
            <div className="flex items-center gap-2 pl-1">
              <span className="muted text-xs">Время отправки:</span>
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
            title="Еженедельный аналитический отчёт (Сентимент и Тренды)"
            description="Сводная PDF-презентация по общему настроению пациентов и динамике сигналов."
          >
            <Toggle on={weeklyReport} onChange={setWeeklyReport} />
          </SettingRow>
          {weeklyReport && (
            <div className="flex flex-wrap items-center gap-2 pl-1">
              <span className="muted text-xs">День и время:</span>
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
          Отмена
        </button>
        <button
          onClick={handleSave}
          className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors ${
            saved ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {saved ? "✓ Сохранено" : "Сохранить настройки"}
        </button>
      </div>
    </div>
  );
}
