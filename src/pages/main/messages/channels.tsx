import { ActivityIndicator, FlatList } from "react-native";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function ChannelsPage({ navigation, route }: Props) {
  const nextPageRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstPageReceived, setIsFirstPageReceived] = useState(false);
  const [channels, setChannels] = useState<(RecordModel & { ts: number })[]>(
    [],
  );

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  // Hacky thing to get the back button to exist on reply
  if (route.params?.next) {
    navigation.setParams({ next: undefined });
    navigation.navigate("Channel", { channelId: route.params.next });
  }

  const fetchData = (erase: boolean, noIndicator?: boolean) => {
    if (noIndicator !== true) {
      setIsLoading(true);
    }

    Sentry.addBreadcrumb({
      type: "pb-fetch",
      category: "users",
      level: "info",
    });

    pb.collection("channels")
      .getList(erase ? 1 : nextPageRef.current, 500, {
        expand: "users",
        requestKey: "channels",
      })
      .then((res) => {
        let newChannels = erase ? res.items : [...channels, ...res.items];
        let modifiedChannels = newChannels.map((c) => {
          const newModel = {
            ...c,
            ts: 0,
          };
          return newModel;
        });

        nextPageRef.current =
          res.page == res.totalPages ? undefined : res.page + 1;
        setIsLoading(false);
        !isFirstPageReceived && setIsFirstPageReceived(true);

        const latestPromises = [];

        for (let i = 0; i < modifiedChannels.length; i++) {
          const channel = modifiedChannels[i];
          const p = pb
            .collection("latest_messages")
            .getFirstListItem(`id = "${channel.id}"`, {
              fields: "created,updated",
            })
            .then((res) => {
              const dateStr = (res.updated ?? res.created).replace(" ", "T");
              modifiedChannels[i].ts = Date.parse(dateStr).valueOf();
            })
            .catch(() => {
              modifiedChannels[i].ts = new Date().valueOf();
            });

          latestPromises.push(p);
        }

        Promise.all(latestPromises).then(() => {
          modifiedChannels.sort((a, b) => b.ts - a.ts);
          console.log("setting");
          setChannels(modifiedChannels);
        });
      })
      .catch(Sentry.captureException);
  };
  const refresh = useCallback((noIndicator?: boolean) => {
    fetchData(true, noIndicator);
  }, []);

  useFocusEffect(useCallback(() => refresh(true), []));

  if (!isFirstPageReceived && isLoading) {
    return <ActivityIndicator size={"small"} />;
  }

  return (
    <SafeAreaView>
      <FlatList
        data={channels}
        renderItem={({ item: channel }) => (
          <Channel key={channel.id} model={channel} navigation={navigation} />
        )}
        className="flex w-full flex-col px-2 py-3"
        contentContainerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
        }}
        onRefresh={refresh}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}
