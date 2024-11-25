import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, View, StyleSheet } from 'react-native';
import Feed from './hometabs/Feed';
import Notifications from './hometabs/Notifications';
import Profile from './hometabs/Profile';
import Cart from './hometabs/Cart';
import Favorite from './hometabs/Favorite';

const Tab = createBottomTabNavigator();

const HomeScreen = ({navigation}: {navigation: any}) => {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FE724C',
        tabBarStyle: { height: 60 }, // Set height to keep it consistent
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/home.png')}
              style={[styles.icon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/favorite.png')}
              style={[styles.icon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />
      
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/bag.png')}
              style={[styles.icon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />
    
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
});

export default HomeScreen;
