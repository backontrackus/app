import {
  View,
  Text,
  TextInput,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import FormData from "form-data";
import ical from "ical-js-parser";
import uuid from "react-native-uuid";
import * as FileSystem from "expo-file-system";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import pb from "../util/pocketbase";
import type { RootStackParamList } from "../util/pages";
import { getTimeString, dateToIcal } from "../util/dateUtils";
import Attachment from "../components/attachment";

type Props = NativeStackScreenProps<RootStackParamList, "NewAnnouncement">;

export default function NewAnnouncement({ navigation }: Props) {
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
  const [attachments, setAttachments] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);

  return (
    <ScrollView
      className="flex flex-col py-3 px-10"
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <Text className="text-3xl font-bold">New Announcement</Text>
      <ScrollView className="self-start w-full mb-4">
        <Text className="text-lg">Name*</Text>
        <TextInput
          className="w-full bg-white border-2 rounded-md border-black text-lg p-2"
          value={name}
          onChangeText={setName}
          placeholder="Habitat for Humanity"
        />
      </ScrollView>
      <View className="self-start w-full mb-4">
        <Text className="text-lg">Description*</Text>
        <View className="flex flex-row justify-start items-center">
          <Text className="italic">You can use</Text>
          <Text
            className="text-blue-500 italic ml-1"
            onPress={() => {
              Linking.openURL("https://www.markdownguide.org/basic-syntax/");
            }}
          >
            Markdown
          </Text>
          <Text className="italic">!</Text>
        </View>
        <TextInput
          className="w-full bg-white border-2 rounded-md border-black text-lg p-2"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder={`**Habitat for Humanity is a non-profit organization that builds homes for those in need.**
Come volunteer with us on Saturday, August 10th and help paint and clean up a new house!`}
          textAlignVertical="top"
        />
      </View>
      <ScrollView className="self-start w-full mb-4">
        <Text className="text-lg">RSVP Link</Text>
        <TextInput
          className="w-full bg-white border-2 rounded-md border-black text-lg p-2 overflow-scroll"
          value={rsvp}
          onChangeText={setRsvp}
          placeholder="https://www.example.com/sign-up"
        />
      </ScrollView>
      <View className="self-start w-full">
        <Text className="text-lg">Start Date</Text>
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold">
            {startDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity
            className="px-2 py-1 bg-bot-orange rounded-md"
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
          />
        )}
      </View>
      <View className="self-start w-full mb-4">
        <Text className="text-lg">Start Time</Text>
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold">{getTimeString(startTime)}</Text>
          <TouchableOpacity
            className="px-2 py-1 bg-bot-orange rounded-md"
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
          />
        )}
      </View>
      <View className="self-start w-full">
        <Text className="text-lg">End Date</Text>
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold">
            {endDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity
            className="px-2 py-1 bg-bot-orange rounded-md"
            onPress={() => {
              setIsEndDateOpen((o) => !o);
            }}
          >
            <Text className="text-lg">Change</Text>
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
          />
        )}
      </View>
      <View className="self-start w-full mb-4">
        <Text className="text-lg">End Time</Text>
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold">{getTimeString(endTime)}</Text>
          <TouchableOpacity
            className="px-2 py-1 bg-bot-orange rounded-md"
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
          />
        )}
      </View>
      <ScrollView className="self-start w-full mb-4">
        <Text className="text-lg">Location</Text>
        <TextInput
          className="w-full bg-white border-2 rounded-md border-black text-lg p-2"
          value={location}
          onChangeText={setLocation}
          placeholder="12345 Example St, Example, FL 12345"
        />
      </ScrollView>
      <Text className="text-lg self-start">Attachments</Text>
      <View className="w-full flex flex-col justify-start items-center gap-y-2 mb-2">
        {attachments.map((attachment) => (
          <Attachment
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
        className="rounded-md bg-bot-orange p-2 w-full mb-4"
        onPress={async () => {
          const res = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            multiple: true,
          });

          if (res.assets) {
            setAttachments((a) => [
              ...a,
              ...res.assets.filter(
                (a) => !attachments.find((att) => att.uri === a.uri)
              ),
            ]);
          }
        }}
      >
        <Text className="text-xl text-center">Add Attachment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="rounded-md bg-bot-orange p-2 mb-6 w-full"
        onPress={async () => {
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
          data.append("location", pb.authStore.model?.location!);
          data.append("user", pb.authStore.model?.id!);
          data.append("rsvpUrl", rsvp);
          for (const attachment of attachments) {
            data.append("attachments", {
              uri: attachment.uri,
              name: attachment.name,
              type: attachment.mimeType,
            });
          }

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
            await pb.collection("announcements").create(data);
            navigation.goBack();
          } catch (e) {
            console.error(e);
            Toast.show(
              "An error occurred while creating the announcement. Please try again",
              {
                delay: 100,
              }
            );
            return;
          }
        }}
      >
        <Text className="text-xl text-center">Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
