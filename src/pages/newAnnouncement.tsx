import {
  View,
  Text,
  TextInput,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-root-toast";
import FormData from "form-data";
import ical from "ical-js-parser";
import uuid from "react-native-uuid";
import * as FileSystem from "expo-file-system";
import * as Sentry from "@sentry/react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Attachment from "@/components/attachment";
import { getAnnouncementData } from "@/util/ical";
import { getTimeString, dateToIcal } from "@/util/dateUtils";
import pb from "@/util/pocketbase";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/util/pages";

type Props = NativeStackScreenProps<RootStackParamList, "NewAnnouncement">;

type Attachment = {
  name: string;
  uri: string;
  mimeType?: string;
};

export default function NewAnnouncement({ navigation, route }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(
    route.params.announcementId ? true : false,
  );

  useEffect(() => {
    if (route.params.announcementId) {
      pb.collection("announcements")
        .getOne(route.params.announcementId)
        .then((announcement) => {
          getAnnouncementData(announcement).then(async (data) => {
            const newAttachments = [];
            for (const attachment of announcement.attachments) {
              const url = pb.files.getURL(announcement, attachment);
              const res = await fetch(url);
              const type = res.headers.get("content-type") ?? "text/plain";

              newAttachments.push({
                name: url.split("/").at(-1) ?? "file.txt",
                uri: url,
                mimeType: type,
              });
            }

            setName(announcement.title);
            setDescription(announcement.content);
            setRsvp(announcement.rsvpUrl);
            setAttachments(newAttachments);

            setStartDate(data.start);
            setStartTime(data.end);
            setEndDate(data.start);
            setEndTime(data.end);
            setLocation(data.location);
            setLoading(false);
          });
        });
    }
  }, [route.params.announcementId]);

  return (
    <SafeAreaView>
      <ScrollView
        className="flex flex-col px-10 py-3"
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Text className="text-3xl font-bold dark:text-white">
          New Announcement
        </Text>
        <ScrollView className="mb-4 w-full self-start">
          <Text className="text-lg dark:text-white">Name*</Text>
          <TextInput
            placeholderTextColor={"gray"}
            className={` w-full rounded-md border-2 border-black p-2 text-lg ${
              loading
                ? "bg-slate-300 dark:bg-zinc-900 dark:text-white"
                : "bg-white dark:bg-zinc-800 dark:text-white"
            }`}
            value={name}
            onChangeText={setName}
            placeholder={
              route.params.announcementId && loading
                ? "Loading..."
                : "Habitat for Humanity"
            }
            editable={!loading}
          />
        </ScrollView>
        <View className="mb-4 w-full self-start">
          <Text className="text-lg dark:text-white">Description*</Text>
          <View className="flex flex-row items-center justify-start">
            <Text className="italic dark:text-white">You can use</Text>
            <Text
              className="ml-1 italic text-blue-500 underline dark:text-white"
              onPress={() => {
                Linking.openURL("https://www.markdownguide.org/basic-syntax/");
              }}
            >
              Markdown
            </Text>
            <Text className="italic dark:text-white">!</Text>
          </View>
          <TextInput
            placeholderTextColor={"gray"}
            className={`w-full rounded-md border-2 border-black p-2 text-lg dark:text-white ${
              loading
                ? "bg-slate-300 dark:bg-zinc-900"
                : "bg-white dark:bg-zinc-800"
            }`}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder={
              route.params.announcementId && loading
                ? "Loading..."
                : `**Habitat for Humanity is a non-profit organization that builds homes for those in need.**
Come volunteer with us on Saturday, August 10th and help paint and clean up a new house!`
            }
            textAlignVertical="top"
          />
        </View>
        <ScrollView className="mb-4 w-full self-start">
          <Text className="text-lg dark:text-white">RSVP Link</Text>
          <TextInput
            placeholderTextColor={"gray"}
            className={`w-full rounded-md border-2 border-black p-2 text-lg dark:text-white ${
              loading
                ? "bg-slate-300 dark:bg-zinc-900"
                : "bg-white dark:bg-zinc-800"
            }`}
            value={rsvp}
            onChangeText={setRsvp}
            placeholder={
              route.params.announcementId && loading
                ? "Loading..."
                : "https://www.example.com/sign-up"
            }
          />
        </ScrollView>
        <View className="w-full self-start">
          <Text className="text-lg dark:text-white">Start Date</Text>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-lg font-bold dark:text-white">
              {route.params.announcementId && loading
                ? "Loading..."
                : startDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity
              className="rounded-md bg-bot-orange px-2 py-1"
              onPress={() => {
                setIsStartDateOpen((o) => !o);
              }}
            >
              <Text className="text-lg">Change</Text>
            </TouchableOpacity>
          </View>
          {isStartDateOpen && (
            <DateTimePicker
              mode="date"
              value={startDate}
              onChange={(e, d) => {
                setIsStartDateOpen(false);
                setStartDate(d ?? new Date());
              }}
              disabled={loading}
            />
          )}
        </View>
        <View className="mb-4 w-full self-start">
          <Text className="text-lg dark:text-white">Start Time</Text>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-lg font-bold dark:text-white">
              {route.params.announcementId && loading
                ? "Loading..."
                : getTimeString(startTime)}
            </Text>
            <TouchableOpacity
              className="rounded-md bg-bot-orange px-2 py-1"
              onPress={() => {
                setIsStartTimeOpen((o) => !o);
              }}
            >
              <Text className="text-lg">Change</Text>
            </TouchableOpacity>
          </View>
          {isStartTimeOpen && (
            <DateTimePicker
              mode="time"
              value={startTime}
              onChange={(e, d) => {
                setIsStartTimeOpen(false);
                setStartTime(d ?? new Date());
              }}
              disabled={loading}
            />
          )}
        </View>
        <View className="w-full self-start">
          <Text className="text-lg dark:text-white">End Date</Text>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-lg font-bold dark:text-white">
              {route.params.announcementId && loading
                ? "Loading..."
                : endDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity
              className="rounded-md bg-bot-orange px-2 py-1"
              onPress={() => {
                setIsEndDateOpen((o) => !o);
              }}
            >
              <Text className="text-lg ">Change</Text>
            </TouchableOpacity>
          </View>
          {isEndDateOpen && (
            <DateTimePicker
              mode="date"
              value={endDate}
              onChange={(e, d) => {
                setIsEndDateOpen(false);
                setEndDate(d ?? new Date());
              }}
              disabled={loading}
            />
          )}
        </View>
        <View className="mb-4 w-full self-start">
          <Text className="text-lg dark:text-white">End Time</Text>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-lg font-bold dark:text-white">
              {route.params.announcementId && loading
                ? "Loading..."
                : getTimeString(endTime)}
            </Text>
            <TouchableOpacity
              className="rounded-md bg-bot-orange px-2 py-1"
              onPress={() => {
                setIsEndTimeOpen((o) => !o);
              }}
            >
              <Text className="text-lg">Change</Text>
            </TouchableOpacity>
          </View>
          {isEndTimeOpen && (
            <DateTimePicker
              mode="time"
              value={endTime}
              onChange={(e, d) => {
                setIsEndTimeOpen(false);
                setEndTime(d ?? new Date());
              }}
              disabled={loading}
            />
          )}
        </View>
        <ScrollView className="mb-4 w-full self-start">
          <Text className="text-lg dark:text-white">Location</Text>
          <TextInput
            placeholderTextColor={"gray"}
            className={`w-full rounded-md border-2 border-black p-2 text-lg dark:text-white ${
              loading
                ? "bg-slate-300 dark:bg-zinc-900"
                : "bg-white dark:bg-zinc-800"
            }`}
            value={location}
            onChangeText={setLocation}
            placeholder={
              route.params.announcementId && loading
                ? "Loading..."
                : "12345 Example St, Example, FL 12345"
            }
          />
        </ScrollView>
        <Text className="mb-2 self-start text-lg dark:text-white">
          Attachments
        </Text>
        <View className="mb-2 flex w-full flex-col items-center justify-start gap-y-2">
          {attachments.map((attachment) => (
            <Attachment
              key={attachment.uri}
              deleteable
              name={attachment.name}
              uri={attachment.uri}
              delete={(uri) => {
                setAttachments((a) => a.filter((att) => att.uri !== uri));
              }}
            />
          ))}
        </View>
        <TouchableOpacity
          className="mb-4 w-full rounded-md bg-bot-orange p-2"
          disabled={loading}
          onPress={async () => {
            const res = await DocumentPicker.getDocumentAsync({
              copyToCacheDirectory: true,
              multiple: true,
            });

            if (res.assets) {
              setAttachments((a) => [
                ...a,
                ...res.assets.filter(
                  (a) => !attachments.find((att) => att.uri === a.uri),
                ),
              ]);
            }
          }}
        >
          <Text className="text-center text-xl">Add Attachment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mb-6 w-full rounded-md bg-bot-orange p-2"
          disabled={loading}
          onPress={async () => {
            Sentry.addBreadcrumb({
              type: "interaction",
              category: "create-announcement",
              level: "info",
            });

            if (!name) {
              Toast.show("Please enter a name for the announcement.", {
                delay: 100,
              });
              return;
            }

            if (!description) {
              Toast.show("Please enter a description for the announcement.", {
                delay: 100,
              });
              return;
            }

            const data = new FormData();
            data.append("title", name);
            data.append("content", description);
            data.append("location", pb.authStore.record?.location!);
            data.append("user", pb.authStore.record?.id!);
            data.append("rsvpUrl", rsvp.trim());

            const sDate = new Date(startDate);
            sDate.setHours(startTime.getHours());
            sDate.setMinutes(startTime.getMinutes());
            sDate.setSeconds(startTime.getSeconds());

            const eDate = new Date(endDate);
            eDate.setHours(endTime.getHours());
            eDate.setMinutes(endTime.getMinutes());
            eDate.setSeconds(endTime.getSeconds());

            const icalUid = uuid.v4().toString();

            const icalStr = ical.toString({
              calendar: {
                begin: "VCALENDAR",
                prodid: "bot",
                version: "2.0",
                end: "VCALENDAR",
                method: "REPLY",
              },
              events: [
                {
                  begin: "VEVENT",
                  lastModified: {
                    value: new Date().toISOString(),
                  },
                  dtstamp: {
                    value: dateToIcal(new Date()),
                  },
                  uid: icalUid,
                  summary: name,
                  dtstart: {
                    value: dateToIcal(sDate),
                  },
                  dtend: {
                    value: dateToIcal(eDate),
                  },
                  sequence: "1",
                  location,
                  end: "VEVENT",
                },
              ],
            });

            const icalUri = FileSystem.cacheDirectory + "calendar.ical";

            await FileSystem.writeAsStringAsync(icalUri, icalStr);

            data.append("calendar", {
              uri: icalUri,
              name,
              type: "text/calendar",
            });

            try {
              if (route.params.announcementId) {
                for (const attachment of attachments) {
                  if (attachment.uri.startsWith("file://")) {
                    continue;
                  } else {
                    const newNameArr = attachment.name.split("_");
                    newNameArr.pop();
                    const newName = newNameArr.join("_");
                    const uri = `${
                      FileSystem.cacheDirectory
                    }${newName}_${uuid.v4()}.${attachment.name
                      .split(".")
                      .at(-1)}`;

                    await FileSystem.downloadAsync(attachment.uri, uri);

                    data.append("attachments", {
                      uri,
                      name: newName,
                      type: attachment.mimeType,
                    });
                  }
                }
                await pb
                  .collection("announcements")
                  .update(route.params.announcementId, {
                    attachments: null,
                    location: pb.authStore.record?.location,
                  });
                await pb
                  .collection("announcements")
                  .update(route.params.announcementId, data);
              } else {
                await pb.collection("announcements").create(data);
              }

              navigation.goBack();
            } catch (err) {
              Sentry.captureException(err);
              Toast.show(
                "An error occurred while creating the announcement. Please try again",
                {
                  delay: 100,
                },
              );
              return;
            }
          }}
        >
          <Text className="text-center text-xl ">
            {route.params.announcementId ? "Update" : "Post"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
