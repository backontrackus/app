import { Cache } from "react-native-cache";
import AsyncStorage from "@react-native-async-storage/async-storage";

import pb from "./pocketbase";

import type { RecordModel } from "pocketbase";

export const cache = new Cache({
  namespace: "announcements",
  policy: {
    maxEntries: 50000,
    stdTTL: 60 * 60 * 24 * 7, // 1 week
  },
  backend: AsyncStorage,
});

export async function getCachedPage(pageNum: number) {
  try {
    const page = await cache.get(`page-${pageNum}`);

    if (page) {
      return JSON.parse(page) as {
        items: string[];
        page: number;
        total: number;
      };
    }

    return null;
  } catch (err) {
    console.error("Error fetching announcements from cache:");
    console.error(err);
    return null;
  }
}

export async function getCachedItem(id: string) {
  try {
    const json = await cache.get(id);
    if (json) return JSON.parse(json) as RecordModel;
    return null;
  } catch (err) {
    console.error("Error fetching announcement from cache:");
    console.error(err);
    return null;
  }
}

export async function getLatestPage(pageNum: number, pre: boolean = false) {
  let pbRes;
  try {
    pbRes = await pb.collection("announcements").getList(pageNum, 5, {
      expand: "user",
      sort: "-created",
      requestKey: `page-${pageNum}-${pre}`,
    });

    cache.set(
      `page-${pageNum}`,
      JSON.stringify({
        items: pbRes.items.map((item) => item.id),
        page: pageNum,
        total: pbRes.totalPages,
      }),
    );
  } catch (err: any) {
    console.error("Error fetching announcements:");
    console.error(Object.entries(err));
    return null;
  }

  return pbRes;
}

export async function getLatestItem(id: string, pre: boolean = false) {
  let pbRes;
  try {
    pbRes = await pb.collection("announcements").getOne(id, {
      expand: "user",
      requestKey: `a-${id}-${pre}`,
    });

    cache.set(id, JSON.stringify(pbRes));
  } catch (err: any) {
    console.error("Error fetching announcement:");
    console.error(Object.entries(err));
    return {};
  }

  return pbRes.item;
}
