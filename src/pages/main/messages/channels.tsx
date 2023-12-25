import { View, ActivityIndicator, FlatList } from "react-native";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

import pb from "@/util/pocketbase";
import Channel from "@/components/channel";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  RootStackParamList,
  TabParamList,
  MessagesStackParamList,
} from "@/util/pages";
import type { RecordModel } from "pocketbase";

type Props = CompositeScreenProps<
  NativeStackScreenProps<MessagesStackParamList, "Channels">,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export default function ChannelsPage({ navigation }: Props) {
  const nextPageRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstPageReceived, setIsFirstPageReceived] = useState(false);
  const [channels, setChannels] = useState<RecordModel[]>([]);

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const fetchData = (erase: boolean) => {
    setIsLoading(true);
    pb.collection("channels")
      .getList(erase ? 1 : nextPageRef.current, 5, {
        expand: "users",
        requestKey: "channels",
      })
      .then((res) => {
        setChannels(erase ? res.items : [...channels, ...res.items]);
        nextPageRef.current =
          res.page == res.totalPages ? undefined : res.page + 1;
        setIsLoading(false);
        !isFirstPageReceived && setIsFirstPageReceived(true);
      })
      .catch((err) => {
        console.error("Error fetching channels:");
        console.error(Object.entries(err));
      });
  };
  const refresh = useCallback(() => {
    fetchData(true);
  }, []);

  useFocusEffect(refresh);

  const ListEndLoader = () => {
    if (!isFirstPageReceived && isLoading) {
      return <ActivityIndicator size={"large"} />;
    }
  };

  if (!isFirstPageReceived && isLoading) {
    return <ActivityIndicator size={"small"} />;
  }

  return (
    <FlatList
      data={channels}
      renderItem={({ item: channel }) => (
        <Channel key={channel.id} model={channel} navigation={navigation} />
      )}
      onEndReached={() => {
        if (nextPageRef.current === undefined) {
          return;
        }
        fetchData(false);
      }}
      onEndReachedThreshold={0.8}
      ListFooterComponent={ListEndLoader}
      className="flex w-full flex-col px-2 py-3"
      contentContainerStyle={{
        justifyContent: "flex-start",
        alignItems: "center",
      }}
      onRefresh={refresh}
      refreshing={isLoading}
    />
    // <View className="flex h-full flex-col items-center justify-start py-3">
    //   {channels.map((channel) => (
    //     <Channel key={channel.id} model={channel} navigation={navigation} />
    //   ))}
    // </View>
  );
}
