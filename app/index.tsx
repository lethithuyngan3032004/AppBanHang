import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotScreen';
import CheckoutScreen from './screens/CheckOutScreen';
import CartScreen from './screens/hometabs/Cart';
import MyOrderScreen from './screens/MyOrderScreen';
import MapScreen from './screens/MapScreen';
import Toast from 'react-native-toast-message';
import CheckInfoScreen from './screens/CheckInfoScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';
import AllProductsScreen from './screens/AllProductsScreen';

const Stack = createNativeStackNavigator();

const Index = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          options={{ headerShown: false }}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Details"
          component={DetailsScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="SignIn"
          component={SignInScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="SignUp"
          component={SignUpScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="DetailProduct"
          component={DetailsScreen}
        />
        
        <Stack.Screen
          options={{ headerShown: false }}
          name="Checkout"
          component={CheckoutScreen}
        />
         <Stack.Screen
          options={{ headerShown: false }}
          name="CheckInfo"
          component={CheckInfoScreen}
        />

        <Stack.Screen
          options={{ headerShown: false }}
          name="Myorder"
          component={MyOrderScreen}
        />
         <Stack.Screen
          options={{ headerShown: false }}
          name="OrderDetails"
          component={OrderDetailsScreen}
        />
         <Stack.Screen
          options={{ headerShown: false }}
          name="MapScreen"
          component={MapScreen}
        />
         <Stack.Screen
          options={{ headerShown: false }}
          name="AllProducts"
          component={AllProductsScreen}
        />
        
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default Index;
const styles = StyleSheet.create({});
