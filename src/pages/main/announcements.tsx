import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import Announcement from "@/components/announcement";
import Confirmation from "@/components/confirmation";
import pb from "@/util/pocketbase";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../../util/pages";
import type { RecordModel } from "pocketbase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Announcements">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AnnouncementsPage({ navigation }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [announcements, setAnnouncements] = useState<RecordModel[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [modalId, setModalId] = useState<string | null>(null);
  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const location = user.location;

  useEffect(() => {
    if (location) {
      pb.collection("locations")
        .getOne(location)
        .then((locationData) => {
          if (locationData.leaders.includes(user.id)) {
            setIsLeader(true);
          } else {
            setIsLeader(false);
          }
        });
    }
  }, [user]);

  const refresh = useCallback(() => {
    if (!location) {
      return;
    }

    pb.collection("announcements")
      .getList(1, 20, {
        expand: "user",
      })
      .then((newAnnouncements) => {
        setAnnouncements(
          newAnnouncements.items.sort(
            (a, b) =>
              new Date(a.created).valueOf() - new Date(b.created).valueOf(),
          ),
        );
      });
  }, [location]);

  useFocusEffect(refresh);

  return (
    <View className="relative h-full w-full">
      <Confirmation
        modalVisible={modalId !== null}
        setModalVisible={() => {
          setModalId(null);
        }}
        question="Are you sure you want to delete this announcement?"
        yesCallback={() => {
          pb.collection("announcements").delete(modalId!);
          setModalId(null);
          refresh();
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        className="flex w-full flex-1 flex-col px-7"
        contentContainerStyle={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        <View className="h-5 w-full"></View>
        {announcements.map((announcement) => {
          return (
            <Announcement
              key={announcement.id}
              model={announcement}
              isLeader={isLeader}
              navigation={navigation}
              refresh={refresh}
              modal={(id) => {
                setModalId(id);
              }}
            />
          );
        })}
      </ScrollView>
      {isLeader && (
        <TouchableOpacity
          style={{
            elevation: 2,
          }}
          className="absolute bottom-5 right-5 flex aspect-square h-14 w-14 flex-col items-center justify-center rounded-full bg-gray-500 p-3 shadow-black "
          onPress={() => {
            navigation.navigate("NewAnnouncement", {});
          }}
        >
          <Text className="text-center text-2xl text-white">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
