import { View, Text, TouchableOpacity, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type AttachmentData = {
  name: string;
  uri: string;
  deleteable?: boolean;
  delete?: (uri: string) => void;
};

export default function Attachment(props: AttachmentData) {
  return (
    <View
      key={props.uri}
      className="mb-2 flex w-full flex-row items-center justify-between rounded-md border-2 border-slate-400 bg-[#F2F2F2] p-2"
    >
      <Text className="w-10/12 text-lg">{props.name}</Text>
      {props.deleteable && (
        <TouchableOpacity
          className="flex w-2/12 flex-row items-center justify-center rounded-md p-1"
          onPress={() => props.delete?.(props.uri)}
        >
          <MaterialCommunityIcons
            name="trash-can"
            size={24}
            color="red"
            className="h-5 w-5"
          />
        </TouchableOpacity>
      )}
      {!props.deleteable && (
        <TouchableOpacity
          className="rounded-md p-1"
          onPress={async () => {
            await Linking.openURL(props.uri);
          }}
        >
          <MaterialCommunityIcons
            name="download"
            size={24}
            color="black"
            className="h-5 w-5"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
