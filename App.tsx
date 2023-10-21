import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootSiblingParent } from "react-native-root-siblings";

import HomeScreen from "./src/pages/home";
import SetupScreen from "./src/pages/setup";
import MainScreen from "./src/pages/main";
import NewAnnouncement from "./src/pages/newAnnouncement";

import type { RootStackParamList } from "./src/util/pages";

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <RootSiblingParent>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Setup"
            component={SetupScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="NewAnnouncement"
            component={NewAnnouncement}
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RootSiblingParent>
  );
}

export default App;
