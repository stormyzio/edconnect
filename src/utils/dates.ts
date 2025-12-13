import type { SDate } from "../types.js";

export function dateToSDate(date: Date): SDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const formatted = `${year}-${month}-${day}` as SDate;
  return formatted;
}

export function SDateDaysOffset(date: SDate, offset: number): SDate {
  const d = new Date(date);
  d.setHours(d.getHours() + (offset * 24))

  return dateToSDate(d);
}

export function getIntermediaryDates(from: SDate, to: SDate): SDate[] {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (fromDate.getTime() > toDate.getTime()) {
    return []
  } else {
    let dates: SDate[] = [];
    let D = fromDate;
    while (D.getTime() < toDate.getTime()) {
      dates.push(dateToSDate(D))
      D.setHours(D.getHours() + 24)
    }
    dates.push(dateToSDate(D))
    return dates;
  }
}