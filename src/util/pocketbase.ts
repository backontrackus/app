import AsyncStorage from "@react-native-async-storage/async-storage";
import Pocketbase, { AsyncAuthStore } from "pocketbase";
import eventsource from "react-native-sse";

// @ts-ignore
global.EventSource = eventsource;

const store = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
});
const pb = new Pocketbase(process.env.EXPO_PUBLIC_POCKETBASE_URL, store);

export default pb;
