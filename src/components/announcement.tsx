import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import RNCal from "react-native-calendar-events";
// @ts-ignore
import { MarkdownView } from "react-native-markdown-view";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import pb from "@/util/pocketbase";
import { getDateIntervalString, getTimeIntervalString } from "@/util/dateUtils";
import { getAnnouncementData } from "@/util/ical";
import Attachment from "./attachment";

import type { RecordModel } from "pocketbase";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "@/util/pages";
import type { AnnouncementData as CalendarData } from "@/util/ical";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Announcements">,
  NativeStackNavigationProp<RootStackParamList>
>;

type AnnouncementData = {
  model: RecordModel;
  isLeader: boolean;
  navigation: NavigationProp;
  refresh: () => void;
  modal: (id: string) => void;
};

export default function Announcement(props: AnnouncementData) {
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [announcementChannel, setAnnouncementChannel] = useState<string | null>(
    null,
  );

  async function fetchAnnouncementChannel() {
    pb.collection("channels")
      .getFirstListItem(`announcement ~ "${props.model.id}"`)
      .then((r) => {
        setAnnouncementChannel(r.id);
      })
      .catch(() => {
        setAnnouncementChannel(null);
      });
  }

  useEffect(() => {
    fetchAnnouncementChannel();
  }, []);

  useEffect(() => {
    pb.collection("user_names")
      .getOne(props.model.user, {
        requestKey: `announcement-${props.model.id}-user-name-${props.model.user}`,
      })
      .then((r) => {
        setUserName(r.name);
      });
  }, [props.model.user]);

  useEffect(() => {
    if (props.model.calendar) {
      getAnnouncementData(props.model).then(setCalendar);
    }
  }, [props.model]);

  useEffect(() => {
    const newAttachments: string[] = [];
    const newImages: string[] = [];
    for (const attachment of props.model.attachments) {
      const url = pb.files.getURL(props.model, attachment);
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
    <View className="mb-3 flex w-11/12 flex-col items-start justify-start">
      <View className="flex flex-row items-center justify-start pl-1">
        <Text className="mr-1">{userName} on</Text>
        <Text className="text-slate-900">
          {new Date(props.model.created).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Text>
      </View>
      <View className="flex w-full flex-col items-start justify-start rounded-xl rounded-bl-none bg-bot-blue-1 p-2">
        <View className="flex w-full flex-row items-start justify-between">
          <Text className="w-4/5 text-2xl font-semibold text-white">
            {props.model.title}
          </Text>
          {props.isLeader && (
            <View className="flex w-1/5 flex-row items-center justify-end gap-x-2">
              {props.model.calendar && (
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
                    className="h-5 w-5"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  props.modal(props.model.id);
                }}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={24}
                  color="red"
                  className="h-5 w-5"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="mt-1 flex flex-row flex-wrap items-center justify-evenly">
          <View className="flex flex-row items-center justify-start py-1">
            <MaterialIcons name="calendar-today" size={24} color="white" />
            <Text className="mx-2 text-sm text-white">
              {calendar?.start || calendar?.end
                ? getDateIntervalString(calendar.start, calendar.end)
                : "No Date"}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start py-1">
            <MaterialCommunityIcons name="clock" size={24} color="white" />
            <Text className="mx-2 text-sm text-white">
              {calendar?.start || calendar?.end
                ? getTimeIntervalString(calendar.start, calendar.end)
                : "No Time"}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start py-1">
            <MaterialCommunityIcons name="map-marker" size={24} color="white" />
            <Text className="mx-2 text-sm text-white">
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
        <View className="my-3 flex w-full flex-col items-center justify-start gap-y-5">
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
                    className="h-56 w-56"
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
        <View className="my-1 flex w-full flex-row items-center justify-evenly">
          {announcementChannel === null ? (
            <TouchableOpacity
              onPress={async () => {
                await fetch(
                  `${process.env.EXPO_PUBLIC_POCKETBASE_URL}rsvp?announcement_id=${props.model.id}`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `${pb.authStore.token}`,
                    },
                  },
                );
                await fetchAnnouncementChannel();
                if (props.model.rsvpUrl) Linking.openURL(props.model.rsvpUrl);
              }}
              className="flex w-[30%] flex-col items-center justify-center rounded-full bg-bot-blue-2 py-1"
            >
              <Text className="text-lg font-semibold text-white">RSVP</Text>
            </TouchableOpacity>
          ) : null}
          {announcementChannel !== null ? (
            <TouchableOpacity
              onPress={async () => {
                const channel = await pb
                  .collection("channels")
                  .getFirstListItem(`announcement ~ "${props.model.id}"`);
                // @ts-expect-error
                props.navigation.navigate("Messages", {
                  screen: "Channels",
                  params: {
                    next: channel.id,
                  },
                });
              }}
              className="flex w-[30%] flex-col items-center justify-center rounded-full bg-bot-blue-2 py-1"
            >
              <Text className="text-lg font-semibold text-white">Reply</Text>
            </TouchableOpacity>
          ) : null}
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
                  (cal) => cal.allowsModifications && cal.isPrimary,
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
                  { sync: true },
                );
              }}
              className="flex w-[30%] flex-col items-center justify-center rounded-full bg-bot-blue-2 py-1"
            >
              <Text className="text-lg font-semibold text-white">Calendar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
