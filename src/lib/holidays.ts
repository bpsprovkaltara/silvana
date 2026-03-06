import { parseISO, isWeekend } from "date-fns";

/**
 * List of Indonesian Public Holidays and Cuti Bersama 2026
 * Based on SKB 3 Menteri
 */
export const HOLIDAYS_2026 = [
  // Libur Nasional
  "2026-01-01", // Tahun Baru Masehi
  "2026-01-16", // Isra Mikraj
  "2026-02-17", // Tahun Baru Imlek
  "2026-03-19", // Hari Suci Nyepi
  "2026-03-21", // Idul Fitri 1447 H
  "2026-03-22", // Idul Fitri 1447 H
  "2026-04-03", // Wafat Yesus Kristus
  "2026-05-01", // Hari Buruh Internasional
  "2026-05-14", // Kenaikan Yesus Kristus
  "2026-05-27", // Idul Adha 1447 H
  "2026-05-31", // Hari Raya Waisak
  "2026-06-01", // Hari Lahir Pancasila
  "2026-06-16", // Tahun Baru Islam
  "2026-08-17", // Hari Kemerdekaan RI
  "2026-08-25", // Maulid Nabi Muhammad SAW
  "2026-12-25", // Hari Raya Natal

  // Cuti Bersama
  "2026-02-16", // Cuti Bersama Imlek
  "2026-03-18", // Cuti Bersama Nyepi
  "2026-03-20", // Cuti Bersama Idul Fitri
  "2026-03-23", // Cuti Bersama Idul Fitri
  "2026-03-24", // Cuti Bersama Idul Fitri
  "2026-05-15", // Cuti Bersama Kenaikan
  "2026-05-28", // Cuti Bersama Idul Adha
  "2026-24-24", // Cuti Bersama Natal (Typo in search result? 24 Dec)
  "2026-12-24", // Corrected Cuti Bersama Natal
];

/**
 * Checks if a date is a holiday or weekend
 * @param date Date as string (YYYY-MM-DD) or Date object
 * @returns { isHoliday: boolean, isWeekend: boolean, reason?: string }
 */
export function checkDateStatus(date: string | Date) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const dateString = dateObj.toISOString().split("T")[0];

  const holiday = HOLIDAYS_2026.includes(dateString);
  const weekend = isWeekend(dateObj);

  return {
    isHoliday: holiday,
    isWeekend: weekend,
    isBlocked: holiday || weekend,
    reason: holiday ? "Hari Libur Nasional/Cuti Bersama" : weekend ? "Akhir Pekan" : undefined,
  };
}
