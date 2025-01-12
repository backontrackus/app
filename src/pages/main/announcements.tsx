import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const nextPageRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstPageReceived, setIsFirstPageReceived] = useState(false);
  const [announcements, setAnnouncements] = useState<RecordModel[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [modalId, setModalId] = useState<string | null>(null);
  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const location = user.location;

  const fetchData = (erase: boolean, noIndicator?: boolean) => {
    if (noIndicator !== true) {
      setIsLoading(true);
    }

    Sentry.addBreadcrumb({
      type: "pb-fetch",
      category: "announcements",
      level: "info",
    });

    pb.collection("announcements")
      .getList(erase ? 1 : nextPageRef.current, 5, {
        sort: "-created",
      })
      .then((newAnnouncements) => {
        setAnnouncements(
          erase
            ? newAnnouncements.items
            : [...announcements, ...newAnnouncements.items],
        );
        nextPageRef.current =
          newAnnouncements.page == newAnnouncements.totalPages
            ? undefined
            : newAnnouncements.page + 1;
        setIsLoading(false);
        !isFirstPageReceived && setIsFirstPageReceived(true);
      })
      .catch(Sentry.captureException);
  };

  useEffect(() => {
    if (location) {
      Sentry.addBreadcrumb({
        type: "pb-fetch",
        category: "locations",
        level: "info",
      });

      pb.collection("locations")
        .getOne(location)
        .then((locationData) => {
          if (locationData.leaders.includes(user.id)) {
            setIsLeader(true);
          } else {
            setIsLeader(false);
          }
        })
        .catch(Sentry.captureException);
    }
  }, [user]);

  const refresh = useCallback(
    (noIndicator?: boolean) => {
      if (!location) {
        return;
      }

      fetchData(true, noIndicator);
    },
    [location],
  );

  useFocusEffect(() => refresh(true));

  const ListEndLoader = () => {
    if (!isFirstPageReceived && isLoading) {
      return <ActivityIndicator size={"large"} />;
    }
  };

  if (!isFirstPageReceived && isLoading) {
    return <ActivityIndicator size={"small"} />;
  }

  return (
    <View className="relative h-full w-full">
      <Confirmation
        modalVisible={modalId !== null}
        setModalVisible={() => {
          setModalId(null);
        }}
        question="Are you sure you want to delete this announcement?"
        yesCallback={() => {
          pb.collection("announcements")
            .delete(modalId!)
            .then(() => {
              refresh();
            });
          setModalId(null);
        }}
      />
      <FlatList
        data={announcements}
        renderItem={({ item }) => (
          <Announcement
            key={item.id}
            model={item}
            isLeader={isLeader}
            navigation={navigation}
            refresh={refresh}
            modal={(id) => {
              setModalId(id);
            }}
          />
        )}
        onEndReached={() => {
          if (nextPageRef.current === undefined) {
            return;
          }
          fetchData(false);
        }}
        inverted
        onEndReachedThreshold={0.8}
        ListFooterComponent={ListEndLoader}
        className="flex w-full flex-col px-2"
        contentContainerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
        }}
        onRefresh={refresh}
        refreshing={isLoading}
      />
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
