import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChannelsPage from "./messages/channels";
import ChannelPage from "./messages/channel";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  RootStackParamList,
  TabParamList,
  MessagesStackParamList,
} from "../../util/pages";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Messages">,
  NativeStackScreenProps<RootStackParamList>
>;

const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesPage({ navigation }: Props) {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen
        name="Channels"
        component={ChannelsPage}
        options={{
          headerShown: false,
        }}
      />
      <MessagesStack.Screen name="Channel" component={ChannelPage} />
    </MessagesStack.Navigator>
  );
}
