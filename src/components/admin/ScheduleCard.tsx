"use client";

import { DeleteButton } from "./DeleteButton";

interface ScheduleCardProps {
  dateStr: string;
  isToday: boolean;
  isWeekend: boolean;
  dayName: string;
  operators: { id: string; operatorName: string; operatorEmail: string }[];
}

export function ScheduleCard({
  dateStr,
  isToday,
  isWeekend,
  dayName,
  operators,
}: ScheduleCardProps) {
  const date = new Date(dateStr + "T00:00:00");

  return (
    <div
      className={`rounded-xl p-5 shadow-card transition-all ${
        isToday
          ? "bg-gradient-to-br from-[#d4744a]/10 to-[#b85d38]/10 border-2 border-[#d4744a]/30"
          : isWeekend
            ? "bg-slate-100/80 opacity-50"
            : "glass card-interactive"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-[#d4744a]" : "text-[#64748b]"}`}
          >
            {dayName}
          </p>
          <p className="text-display text-2xl font-bold text-[#0a1628]">{date.getDate()}</p>
          <p className="text-xs text-[#64748b]">
            {date.toLocaleDateString("id-ID", { month: "short" })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isToday && (
            <span className="px-2 py-0.5 bg-[#d4744a] text-white text-xs font-semibold rounded">
              Hari ini
            </span>
          )}
          {isWeekend && (
            <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-xs font-semibold rounded">
              Libur
            </span>
          )}
        </div>
      </div>

      {!isWeekend && (
        <div className="pt-3 border-t border-slate-200">
          {operators.length > 0 ? (
            <div className="space-y-2">
              {operators.map((op) => (
                <div key={op.id} className="flex items-center gap-2 p-2 bg-white rounded-lg group">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white text-xs font-semibold">
                    {op.operatorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0a1628] truncate">{op.operatorName}</p>
                  </div>
                  <DeleteButton
                    id={op.id}
                    endpoint="/api/schedules"
                    itemName="jadwal"
                    variant="icon"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-xs text-[#64748b] italic">Belum ada jadwal</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
