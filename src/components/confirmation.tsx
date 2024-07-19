import { Alert, Modal, TouchableOpacity, View, Text } from "react-native";

import type { Dispatch, SetStateAction } from "react";

type ConfirmationData = {
  question: string;
  yesCallback: () => void;
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
};

export default function Confirmation(props: ConfirmationData) {
  return (
    <View
      className="absolute left-0 top-0 z-30 h-screen w-full bg-gray-800 opacity-80"
      style={{
        display: props.modalVisible ? undefined : "none",
      }}
    >
      <View className="z-10 flex h-full items-center justify-center">
        <Modal
          animationType="slide"
          transparent={true}
          visible={props.modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            props.setModalVisible(!props.modalVisible);
          }}
        >
          <View className="flex h-full items-center justify-center">
            <View className="p-35 m-20 items-center rounded-lg bg-white p-4 shadow-md">
              <Text className="mb-2 text-center text-xl font-semibold">
                {props.question}
              </Text>
              <View className="flex w-full flex-row items-center justify-start">
                <TouchableOpacity
                  className="rounded-lg bg-red-600 px-5 py-3 shadow-md"
                  onPress={() => props.yesCallback()}
                >
                  <Text className="text-center text-lg font-bold text-white">
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-3 rounded-lg bg-gray-500 px-5 py-3 shadow-md"
                  onPress={() => props.setModalVisible(false)}
                >
                  <Text className="text-center text-lg font-bold text-white">
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
