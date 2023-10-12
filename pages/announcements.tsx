import { View } from "react-native";
import { useState, useEffect } from "react";

import Announcement from "../components/announcement";
import pb from "../util/pocketbase";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../util/pages";
import type { RecordModel } from "pocketbase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Announcements">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AnnouncementsPage({ navigation }: Props) {
  const [announcements, setAnnouncements] = useState<RecordModel[]>([]);
  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const location = user.location;

  useEffect(() => {
    pb.collection("announcements")
      .getList(1, 10, {
        filter: `location = "${location}"`,
        query: {
          location,
        },
        expand: "user",
      })
      .then((newAnnouncements) => {
        setAnnouncements(newAnnouncements.items);
      });
  }, []);
  return (
    <View className="flex flex-1 justify-start items-start flex-col w-full px-7 pt-5">
      {announcements.map((announcement) => (
        <Announcement key={announcement.id} model={announcement} />
      ))}
    </View>
  );
}
