// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
// http://192.168.0.137:8989/getReservation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReservationScreen from './src/screens/ReservationScreen';
import DatePicker from './src/screens/DatePicker';
import ReservedScreen from './src/screens/ReservedScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import VerificationResult from './src/screens/VerificationResult';
import Verification from './src/screens/Verification';
import AgendaScreen from './src/screens/AgendaScreen';
import CalListScreen from './src/screens/CalListScreen';
import OldAgenda from './src/screens/OldAgenda';
import TableScreen from './src/screens/TableScreen';
import DemoScreen from './src/screens/DemoScreen';
import LoginScreen from './src/screens/LoginScreen';
import TestScreen from './src/screens/TestScreen';


const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Demo'
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="Reserved" component={ReservedScreen} />
        <Stack.Screen name="Date" component={DatePicker} />
        <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ title: '본인인증' }}/>
        <Stack.Screen name="VerificationResult" component={VerificationResult} options={{ title: '본인인증' }}/>
        <Stack.Screen name="Verification" component={Verification} options={{ title: '본인인증' }}/>
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="CalendarList" component={CalListScreen} />
        <Stack.Screen name="OldAgenda" component={OldAgenda} />
        <Stack.Screen name="Table" component={TableScreen} />
        <Stack.Screen name="Demo" component={DemoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


// const navigator = createStackNavigator(
//   {
//     Home: HomeScreen,
//     Calendar: CalendarScreen,
//     Reservation: ReservationScreen,
//     Reserved: ReservedScreen,
//     Date: DatePicker
//   },
//   {
//     initialRouteName: 'Home',
//     defaultNavigationOptions: {
//       title: 'SureM',
//     },
//   }
// );

// export default createAppContainer(navigator)
