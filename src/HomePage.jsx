import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
import React from 'react';
import { Entypo, AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import PostScreen from "./screens/PostScreen";
import SettingScreen from "./screens/SettingScreen";
import DreamsScreens from "./screens/DreamsScreens";
import SearchScreen from './screens/SearchScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.tabBarWrapper}>
      <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={[styles.tabItem, isFocused ? styles.tabItemFocused : null]}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {options.tabBarIcon({ 
                  color: isFocused ? colors.primary : colors.secondary, 
                  size: 24 
                })}
              </View>
              {isFocused && (
                <Text style={[styles.tabLabel, { color: colors.primary }]}>
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const HomePage = () => {
  const { colors } = useTheme();

  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PostScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="magnifying-glass" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Dreams" 
        component={DreamsScreens}  
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="list" size={size} color={color} />,
        }}
      />
     
      <Tab.Screen 
        name="Profile" 
        component={SettingScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemFocused: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
});

export default HomePage;