import AsyncStorage from "@react-native-async-storage/async-storage";
import Pocketbase, { AsyncAuthStore } from "pocketbase";
import eventsource from "react-native-sse";

// @ts-ignore
global.EventSource = eventsource;

const store = new AsyncAuthStore({
  save: async (serialized) => await AsyncStorage.setItem("pb_auth", serialized),
});

AsyncStorage.getItem("pb_auth").then((value) => {
  // if exist `value` should be a serialized json
  try {
    const parsed = JSON.parse(value ?? "") || {};

    store.save(parsed.token || "", parsed.model || null);
  } catch (_) {}
});

const pb = new Pocketbase(process.env.EXPO_PUBLIC_POCKETBASE_URL, store);

export default pb;
