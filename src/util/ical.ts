import IcalParser from "ical-js-parser";
import UUID from "react-native-uuid";

import pb from "./pocketbase";
import { icalToDate } from "./dateUtils";

import type { RecordModel } from "pocketbase";

export type AnnouncementData = {
  summary: string;
  uid: string;
  stamp: Date;
  start: Date;
  end: Date;
  location: string;
};

export async function getAnnouncementData(
  model: RecordModel,
): Promise<AnnouncementData> {
  const url = pb.files.getUrl(model, model.calendar);

  const res = await fetch(url);
  const text = await res.text();
  const json = IcalParser.toJSON(text);

  return {
    summary: json.events[0]?.summary ?? "No Summary",
    uid: json.events[0]?.uid ?? UUID.v4().toString(),
    stamp: json.events[0]?.dtstamp?.value
      ? icalToDate(json.events[0].dtstamp?.value)
      : new Date(),
    start: json.events[0]?.dtstart?.value
      ? icalToDate(json.events[0].dtstart?.value)
      : new Date(),
    end: json.events[0]?.dtend?.value
      ? icalToDate(json.events[0].dtend?.value)
      : new Date(),
    location: json.events[0]?.location ?? "No Location",
  };
}
