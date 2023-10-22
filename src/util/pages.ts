import type { ExpoPushToken } from "expo-notifications";

export type RootStackParamList = {
  Home: undefined;
  Setup: { logout: boolean };
  Main: {
    expoPushToken?: ExpoPushToken;
  };
  Announcements: undefined;
  NewAnnouncement: {
    announcementId?: string;
  };
};

export type TabParamList = {
  Announcements: undefined;
  Messages: undefined;
  Account: undefined;
};

export type MessagesStackParamList = {
  Channels: undefined;
  Channel: {
    channelId: string;
  };
};
