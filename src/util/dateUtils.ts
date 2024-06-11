export function icalToDate(ical: string, tz: string = "America/New_York") {
  const newStr =
    ical.slice(0, 4) +
    "-" +
    ical.slice(4, 6) +
    "-" +
    ical.slice(6, 8) +
    "T" +
    ical.slice(9, 11) +
    ":" +
    ical.slice(11, 13) +
    ":" +
    ical.slice(13, 15) +
    "Z";
  const date = new Date(newStr);
  return date;
}

export function dateToIcal(date: Date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());
  return `${year}${month}${day}T${hour}${min}${sec}Z`;
}

export function getDateIntervalString(start: Date, end: Date) {
  const startStr = start.toLocaleDateString();
  const endStr = end.toLocaleDateString();

  if (startStr == endStr) return startStr;
  else return `${startStr} - ${endStr}`;
}

export function getTimeIntervalString(start: Date, end: Date) {
  const startStr = getTimeString(start);
  const endStr = getTimeString(end);

  if (startStr == endStr) return startStr;
  else return `${startStr} - ${endStr}`;
}

export function getTimeString(date: Date) {
  const hour = date.getHours();
  const min = date.getMinutes();
  const str =
    hour == 12
      ? `12:${pad(min)} pm`
      : hour > 12
      ? `${hour - 12}:${pad(min)} pm`
      : hour == 0
      ? `12:${pad(min)} am`
      : `${hour}:${pad(min)} am`;
  return str;
}

export function pad(num: number) {
  return num.toString().padStart(2, "0");
}
