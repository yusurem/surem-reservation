import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import HomeScreen from './src/screens/home/HomeScreen';
import HomeMenuScreen from './src/screens/HomeMenuScreen';
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
import LoginScreen from './src/screens/member/LoginScreen';
import TestScreen from './src/screens/TestScreen';
import SignupScreen from './src/screens/member/SignUpScreen'
import FindPassword from './src/screens/member/FindPasswordScreen'
import LoginMenuScreen from './src/screens/LoginMenuScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
        initialRouteName='Demo'
        screenOptions={{
          headerShown:false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OldAgenda" component={OldAgenda} />
        <Stack.Screen name="Demo" component={DemoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="Signup" component={SignupScreen}/>
        <Stack.Screen name="FindPassword" component={FindPassword}/>
        <Stack.Screen name="HomeMenu" component={HomeMenuScreen}/>
        <Stack.Screen name="LoginMenu" component={LoginMenuScreen} />
      </Stack.Navigator>
  );
}

const SecondStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName='CalendarList'
    >
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="Reserved" component={ReservedScreen} />
        <Stack.Screen name="Date" component={DatePicker} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="CalendarList" component={CalListScreen} />
        <Stack.Screen name="Table" component={TableScreen} />
    </Stack.Navigator>
  );
}

const ThirdStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName='VerificationScreen'
    >
        <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ title: '본인인증' }}/>
        <Stack.Screen name="VerificationResult" component={VerificationResult} options={{ title: '본인인증' }}/>
        <Stack.Screen name="Verification" component={Verification} options={{ title: '본인인증' }}/>
    </Stack.Navigator>
  );
}

const FourthStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName='VerificationScreen'
    >
        <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ title: '본인인증' }}/>
        <Stack.Screen name="VerificationResult" component={VerificationResult} options={{ title: '본인인증' }}/>
        <Stack.Screen name="Verification" component={Verification} options={{ title: '본인인증' }}/>
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="홈" 
          component={MainStack} 
          options={{
            tabBarLabel: '홈',
            tabBarIcon: () => <Entypo name="home" color="blue" size={24} />,
          }}
        />
        <Tab.Screen 
          name="예약하기" 
          component={SecondStack} 
          options={{
            tabBarLabel: '예약하기',
            tabBarIcon: () => <MaterialCommunityIcons name="calendar-clock" color="blue" size={24} />,
          }}
        />
        <Tab.Screen 
          name="예약확인" 
          component={ThirdStack} 
          options={{
            tabBarLabel: '예약확인',
            tabBarIcon: () => <MaterialCommunityIcons name="checkbox-marked-outline" color="blue" size={24} />,
          }}
        />
        <Tab.Screen 
          name="MY" 
          component={FourthStack} 
          options={{
            tabBarLabel: 'MY',
            tabBarIcon: () => <FontAwesome5 name="user-alt" color="blue" size={24} />,
          }}
        />
      </Tab.Navigator>
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
