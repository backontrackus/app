import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import IcalParser from "ical-js-parser";
import RNCal from "react-native-calendar-events";
// @ts-ignore
import { MarkdownView } from "react-native-markdown-view";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import pb from "../util/pocketbase";
import {
  icalToDate,
  getDateIntervalString,
  getTimeIntervalString,
} from "../util/dateUtils";
import Attachment from "./attachment";
import { getAnnouncementData } from "../util/ical";

import type { RecordModel } from "pocketbase";
import type { ICalJSON } from "ical-js-parser";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../util/pages";
import type { AnnouncementData as CalendarData } from "../util/ical";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Announcements">,
  NativeStackNavigationProp<RootStackParamList>
>;

type AnnouncementData = {
  model: RecordModel;
  isLeader: boolean;
  navigation: NavigationProp;
  refresh: () => void;
};

export default function Announcement(props: AnnouncementData) {
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    getAnnouncementData(props.model).then(setCalendar);
  }, [props.model]);

  useEffect(() => {
    const newAttachments: string[] = [];
    const newImages: string[] = [];
    for (const attachment of props.model.attachments) {
      const url = pb.files.getUrl(props.model, attachment);
      const filename = url.split("/").at(-1) ?? "file.txt";
      const ext = filename.split(".").at(-1) ?? "txt";

      if (
        ext == "png" ||
        ext == "jpg" ||
        ext == "jpeg" ||
        ext == "gif" ||
        ext == "webp" ||
        ext == "heic" ||
        ext == "svg"
      ) {
        newImages.push(url);
      } else {
        newAttachments.push(url);
      }
    }
    setAttachments(newAttachments);
    setImages(newImages);
  }, [props.model.attachments]);

  return (
    <View className="flex flex-col justify-start items-start w-full mb-3">
      <View className="flex flex-row justify-start items-center pl-1">
        <Text className="mr-2">{props.model.expand?.user?.name} </Text>
        <Text className="text-slate-900">
          {new Date(props.model.created).toLocaleString()}
        </Text>
      </View>
      <View className="rounded-lg bg-bot-blue-1 flex flex-col justify-start items-start w-full p-2">
        <View className="flex flex-row justify-between items-start w-full">
          <Text className="text-white text-2xl font-semibold">
            {props.model.title}
          </Text>
          {props.isLeader && (
            <View className="flex flex-row justify-start items-center gap-x-2">
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("NewAnnouncement", {
                    announcementId: props.model.id,
                  });
                }}
              >
                <MaterialIcons
                  name="mode-edit"
                  size={24}
                  color="white"
                  className="w-5 h-5"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  pb.collection("announcements").delete(props.model.id);
                  props.refresh();
                }}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={24}
                  color="red"
                  className="w-5 h-5"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="flex flex-row justify-evenly items-center flex-wrap mt-1">
          <View className="flex flex-row justify-start items-center">
            <MaterialIcons name="calendar-today" size={24} color="white" />
            <Text className="text-white mx-1 text-sm">
              {calendar?.start || calendar?.end
                ? getDateIntervalString(calendar.start, calendar.end)
                : "No Date"}
            </Text>
          </View>
          <View className="flex flex-row justify-start items-center">
            <MaterialCommunityIcons name="clock" size={24} color="white" />
            <Text className="text-white mx-1 text-sm">
              {calendar?.start || calendar?.end
                ? getTimeIntervalString(calendar.start, calendar.end)
                : "No Time"}
            </Text>
          </View>
          <View className="flex flex-row justify-start items-center">
            <MaterialCommunityIcons name="map-marker" size={24} color="white" />
            <Text className="text-white mx-1 text-sm">
              {calendar?.location ?? "No Location"}
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
        <View className="flex flex-col justify-start items-center gap-y-5 my-2 w-full">
          {images.map((image) => {
            const filename = image.split("/").at(-1) ?? "file.txt";
            const ext = filename.split(".").at(-1) ?? "txt";

            if (
              ext == "png" ||
              ext == "jpg" ||
              ext == "jpeg" ||
              ext == "gif" ||
              ext == "webp" ||
              ext == "heic" ||
              ext == "svg"
            ) {
              return (
                <View key={image}>
                  <Image
                    source={image}
                    contentFit="fill"
                    className="w-56 h-56"
                  />
                  <View className="h-2" />
                </View>
              );
            }
          })}
          {attachments.map((attachment) => {
            const filename = attachment.split("/").at(-1) ?? "file.txt";

            return (
              <View key={attachment} className="w-full">
                <Attachment key={attachment} name={filename} uri={attachment} />
                <View className="h-2" />
              </View>
            );
          })}
        </View>
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
                    startDate: calendar?.start.toISOString(),
                    endDate: calendar?.end.toISOString(),
                    location: calendar?.location,
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
