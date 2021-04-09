import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Entypo, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import HomeScreen from './src/screens/home/HomeScreen';
import HomeMenuScreen from './src/screens/HomeMenuScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReservationScreen from './src/screens/ReservationScreen';
import DatePicker from './src/screens/DatePicker';
import ReservedScreen from './src/screens/ReservedScreen';
// import VerificationScreen from './src/screens/VerificationScreen';
import VerificationResult from './src/screens/VerificationResult';
// import Verification from './src/screens/Verification';
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
import PaymentScreen from './src/screens/PaymentScreen';
import ReservationListScreen from './src/screens/reservation/ReservationListScreen'
import ChooseRegionScreen from './src/screens/reservation/ChooseRegionScreen'


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
        initialRouteName='SignUp'
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OldAgenda" component={OldAgenda} />
        <Stack.Screen name="Demo" component={DemoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="SignUp" component={SignupScreen}/>
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
      screenOptions={{
        headerShown: false
      }}
    >
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} options={{ title: '회의실 예약' }} />
        <Stack.Screen name="Reserved" component={ReservedScreen} />
        <Stack.Screen name="Date" component={DatePicker} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="CalendarList" component={CalListScreen} />
        <Stack.Screen name="Table" component={TableScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

const ThirdStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName='ReservationListScreen'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="ReservationListScreen" component={ReservationListScreen} />
        {/* <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ title: '본인인증' }}/> */}
        <Stack.Screen name="VerificationResult" component={VerificationResult} options={{ title: '본인인증' }}/>
        {/* <Stack.Screen name="Verification" component={Verification} options={{ title: '본인인증' }}/> */}
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
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          tabBarOptions={{
            style: {
              height: 70,
              // paddingTop: 10,
              // marginTop: 20
            },
            labelStyle:{
              marginBottom: 15
            },
            activeTintColor: '#474747',
            inactiveTintColor: '#474747',
            activeBackgroundColor: '#D9D8D8'
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={MainStack} 
            options={{
              tabBarLabel: '홈',
              tabBarIcon: () => <Entypo name="home" color="#474747" size={24} style={{alignSelf: 'center', marginLeft: 0.5, marginTop: 15}} />,
            }}
          />
          <Tab.Screen 
            name="Reserve" 
            component={SecondStack} 
            options={{
              tabBarLabel: '예약하기',
              tabBarIcon: () => <MaterialCommunityIcons name="calendar-clock" color="#474747" size={24} style={{ marginTop: 15 }}/>,
            }}
          />
          <Tab.Screen 
            name="ConfirmReserved" 
            component={ThirdStack} 
            options={{
              tabBarLabel: '예약확인',
              tabBarIcon: () => <MaterialCommunityIcons name="checkbox-marked-outline" color="#474747" size={24} style={{ marginTop: 15 }}/>,
            }}
          />
          <Tab.Screen 
            name="MY" 
            component={FourthStack} 
            options={{
              tabBarLabel: 'MY',
              tabBarIcon: () => <FontAwesome5 name="user-alt" color="#474747" size={24} style={{ marginTop: 15 }}/>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  iconStyle: {
    width: 30,
    height: 30
  }
})

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
