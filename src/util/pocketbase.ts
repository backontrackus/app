import AsyncStorage from "@react-native-async-storage/async-storage";
import Pocketbase, { AsyncAuthStore } from "pocketbase";
import eventsource from "react-native-sse";

import type { RecordService } from "pocketbase";

// @ts-ignore
global.EventSource = eventsource;

const store = new AsyncAuthStore({
  save: async (serialized) => await AsyncStorage.setItem("pb_auth", serialized),
});

AsyncStorage.getItem("pb_auth").then((value) => {
  // if exist `value` should be a serialized json
  try {
    const parsed = JSON.parse(value ?? "") || {};

    store.save(parsed.token || "", parsed.record || null);
  } catch (_) {}
});

export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  expand?: {
    [key: string]: any;
  };
}

export interface User extends BaseRecord {
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
  location: string;
  devices: string[];
}

export interface Announcement extends BaseRecord {
  location: string;
  user: string;
  attachments: string[];
  rsvpUrl: string;
  title: string;
  calendar: string;
  content: string;
}

export interface Channel extends BaseRecord {
  users: string[];
  isDefault: boolean;
  location: string;
  announcement: string;
  title: string;
}

export interface Device extends BaseRecord {
  token: string;
}

export interface Location extends BaseRecord {
  inactive: boolean;
  name: string;
  remind: string;
  groupme: string;
  whatsapp: string;
  latitude: string;
  longitude: string;
  leaders: string[];
  poc: string;
}

export interface Message extends BaseRecord {
  channel: string;
  user: string;
  content: string;
}

export interface TeamMember extends BaseRecord {
  hidden: boolean;
  retired: boolean;
  priority: number;
  name: string;
  title: string;
  location: string;
  bio: string;
  instagram: string;
  linkedin: string;
  image: string;
}

export interface LatestMessage {
  id: string;
  users: string[];
  user: string;
  content: string;
  created: string;
}

export interface UserName {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
}

export interface TypedAuthStore extends AsyncAuthStore {
  record: User;
}

export interface TypedPocketbase extends Pocketbase {
  collection(idOrName: string): RecordService; // default fallback for any other collection
  collection(idOrName: "users"): RecordService<User>;
  collection(idOrName: "announcements"): RecordService<Announcement>;
  collection(idOrName: "channels"): RecordService<Channel>;
  collection(idOrName: "devices"): RecordService<Device>;
  collection(idOrName: "locations"): RecordService<Location>;
  collection(idOrName: "messages"): RecordService<Message>;
  collection(idOrName: "team"): RecordService<TeamMember>;
  collection(idOrName: "latest_messages"): RecordService<LatestMessage>;
  collection(idOrName: "user_names"): RecordService<UserName>;
  authStore: TypedAuthStore;
}

const pb = new Pocketbase(
  process.env.EXPO_PUBLIC_POCKETBASE_URL,
  store,
) as TypedPocketbase;

pb.autoCancellation(false);

export default pb;
