import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useState, useEffect } from "react";
import IcalParser from "ical-js-parser";
import RNCal from "react-native-calendar-events";
// @ts-ignore
import { MarkdownView } from "react-native-markdown-view";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import pb from "../util/pocketbase";
import { icalToDate, getIntervalString } from "../util/dateUtils";

import type { RecordModel } from "pocketbase";
import type { ICalJSON } from "ical-js-parser";

type AnnouncementData = {
  model: RecordModel;
};

export default function Announcement(props: AnnouncementData) {
  const [calendar, setCalendar] = useState<ICalJSON | null>(null);

  useEffect(() => {
    const url = pb.files.getUrl(props.model, props.model.calendar);

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const json = IcalParser.toJSON(text);
        setCalendar(json);
      });
  }, []);

  return (
    <View className="flex flex-col justify-start items-start w-full mb-3">
      <View className="flex flex-row justify-start items-center pl-1">
        <Text className="mr-2">{props.model.expand?.user?.name} </Text>
        <Text className="text-slate-900">
          {new Date(props.model.created).toLocaleString()}
        </Text>
      </View>
      <View className="rounded-lg bg-bot-blue-1 flex flex-col justify-start items-start w-full p-2">
        <Text className="text-white text-2xl font-semibold">
          {props.model.title}
        </Text>
        <View className="flex flex-row justify-evenly items-center flex-wrap mt-1">
          <View className="flex flex-row justify-start items-center">
            <MaterialIcons name="calendar-today" size={24} color="white" />
            <Text className="text-white mx-1 text-sm">
              {calendar?.events[0].dtstart.value
                ? icalToDate(
                    calendar?.events[0].dtstart.value,
                    calendar?.events[0].dtstart.timezone
                  ).toLocaleDateString()
                : "No Date"}
            </Text>
          </View>
          <View className="flex flex-row justify-start items-center">
            <MaterialCommunityIcons name="clock" size={24} color="white" />
            <Text className="text-white mx-1 text-sm">
              {calendar?.events[0].dtstart.value ||
              calendar?.events[0].dtend.value
                ? getIntervalString(
                    icalToDate(
                      calendar?.events[0].dtstart.value,
                      calendar?.events[0].dtstart.timezone
                    ),
                    icalToDate(
                      calendar?.events[0].dtend.value,
                      calendar?.events[0].dtend.timezone
                    )
                  )
                : "No Time"}
            </Text>
          </View>
          <View className="flex flex-row justify-start items-center">
            <MaterialCommunityIcons name="map-marker" size={24} color="white" />
            <Text className="text-white mx-1 text-sm">
              {calendar?.events[0].location ?? "No Location"}
            </Text>
          </View>
        </View>
        <MarkdownView
          styles={{
            paragraph: {
              color: "white",
              fontSize: 16,
            },
          }}
        >
          {props.model.content}
        </MarkdownView>
        <View className="flex flex-row justify-evenly items-center w-full">
          {props.model.rsvpUrl && (
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(props.model.rsvpUrl);
              }}
              className="flex flex-col justify-center items-center rounded-full bg-bot-orange py-1 w-[30%]"
            >
              <Text className="text-black text-lg font-semibold">RSVP</Text>
            </TouchableOpacity>
          )}
          {calendar && (
            <TouchableOpacity
              onPress={async () => {
                const perms = await RNCal.checkPermissions();
                if (perms != "authorized") {
                  const res = await RNCal.requestPermissions();
                  if (res != "authorized") {
                    return;
                  }
                }

                const calendars = await RNCal.findCalendars();
                const cal = calendars.find(
                  (cal) => cal.allowsModifications && cal.isPrimary
                );
                if (!cal) {
                  return;
                }
                const event = await RNCal.saveEvent(
                  props.model.title,
                  {
                    calendarId: cal.id,
                    startDate: icalToDate(
                      calendar?.events[0].dtstart.value,
                      calendar?.events[0].dtstart.timezone
                    ).toISOString(),
                    endDate: icalToDate(
                      calendar?.events[0].dtend.value,
                      calendar?.events[0].dtend.timezone
                    ).toISOString(),
                    location: calendar?.events[0].location,
                    notes: `${props.model.content}\n(added by Back On Track)`,
                  },
                  // @ts-ignore
                  { sync: true }
                );

                console.log(event);
              }}
              className="flex flex-col justify-center items-center rounded-full bg-bot-orange py-1 w-[30%]"
            >
              <Text className="text-black text-lg font-semibold">Calendar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              // TODO: reply
            }}
            className="flex flex-col justify-center items-center rounded-full bg-bot-orange py-1 w-[30%]"
          >
            <Text className="text-black text-lg font-semibold">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
