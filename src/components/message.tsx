import { View, Text } from "react-native";
// @ts-ignore
import { MarkdownView } from "react-native-markdown-view";

import { getTimeString } from "@/util/dateUtils";

import type { RecordModel, AuthModel } from "pocketbase";

type MessageProps = {
  message: RecordModel;
  user: AuthModel;
};

export default function Message({ message, user }: MessageProps) {
  if (!user) {
    return null;
  }

  return (
    <View
      key={message.id}
      className="mb-2 flex w-full flex-col items-start justify-start"
    >
      <View
        className={`flex w-full flex-row items-center gap-x-1 ${
          message.user === user.id ? "justify-end pr-2" : "justify-start pl-2"
        }`}
      >
        {message.user !== user.id && <Text>{message.expand?.user.name}</Text>}
        <Text className="text-gray-800">
          {getTimeString(new Date(message.created))}
        </Text>
      </View>
      <View
        className={`rounded-md px-2 ${
          message.user === user.id
            ? "self-end rounded-br-none bg-blue-200"
            : "self-start rounded-bl-none bg-gray-200"
        }`}
        style={{ maxWidth: "75%" }}
      >
        <MarkdownView
          styles={{
            paragraph: {
              color: "black",
              fontSize: 18,
              lineHeight: 22,
            },
          }}
        >
          {message.content}
        </MarkdownView>
      </View>
    </View>
  );
}
