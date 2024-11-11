import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './src/LoginPage';
import HomePage from "./src/HomePage";
import ChatScreen from "./src/screens/ChatScreen";
import FilmScreen from "./src/FilmScreen";
import WebsiteScreen from "./src/WebsiteScreen";
import { auth } from "./firebase";
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#121212', 
              },
              headerTintColor: '#fff', 
              headerTitleStyle: {
                fontWeight: 'bold', 
              },
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomePage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                unmountOnBlur: true,
                passParamsOnOpen: true,
                params: route.params,
                title: 'Message Chat',
                headerStyle :{
                  backgroundColor: '#FFFF',
                },
                headerTintColor: '#000',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              })}
            />
            <Stack.Screen
              name="Film"
              component={FilmScreen}
              options={{
                title: 'Film Screen', 
              }}
            />
            <Stack.Screen
              name="Website"
              component={WebsiteScreen}
              options={{
                headerTitle: () => (
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }} >Website Screen</Text>
                ),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </ThemeProvider>
  );
}