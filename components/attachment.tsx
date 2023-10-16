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
      className="p-2 border-slate-400 bg-[#F2F2F2] rounded-md border-2 flex flex-row justify-between items-center w-full mb-2"
    >
      <Text className="text-lg w-10/12">{props.name}</Text>
      {props.deleteable && (
        <TouchableOpacity
          className="rounded-md p-1 w-2/12 flex flex-row justify-center items-center"
          onPress={() => props.delete?.(props.uri)}
        >
          <MaterialCommunityIcons
            name="trash-can"
            size={24}
            color="red"
            className="w-5 h-5"
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
            className="w-5 h-5"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
