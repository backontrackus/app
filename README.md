# Back on Track America App

This is the mobile application for the nonprofit Back on Track America. It is used to show announcements from each of the branches with details about the events that they will be volunteering at. The mobile app also provides channels for users to message in about specific events and privately message the team members of their location. There is no need to create an account for the app as it is associated with your Google account.

<p align="center">
  <img src="https://cloud-oordro0xh-hack-club-bot.vercel.app/1screenshot_1716685473.png" width="250"/>
  <img src="https://cloud-oordro0xh-hack-club-bot.vercel.app/0screenshot_1716685230.png" width="250"/>
  <img src="https://cloud-oordro0xh-hack-club-bot.vercel.app/2screenshot_1716685478.png" width="250"/>
</p>

## License

The Back on Track America App is released under the [GPL-3.0 license](LICENSE).

## Technical Information

This app is built with Expo and React Native.

A technical annoyance to note about this app is that it uses Expo config plugins, but also has native directories.
This is because there's an issue with the React Native Flipper plugin that Expo uses that causes Pocketbase to not work correctly.
For that reason, whenever you make a config plugin change, you should re-run `npx expo prebuild`, just comment out lines 41-49 in
`android/app/src/debug/java/org/backontrackus/app/ReactNativeFlipper.java`.
