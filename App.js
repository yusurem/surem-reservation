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
import ReservationListScreen from './src/screens/reservation/ReservationListScreen';
import ChooseRegionScreen from './src/screens/reservation/ChooseRegionScreen';
import NoticeScreen from './src/screens/NoticeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import MyScreen from './src/screens/MyScreen';
import BranchScreen from './src/screens/BranchScreen';
import InquiryScreen from './src/screens/InquiryScreen';
import InquireScreen from './src/screens/InquireScreen';
import NewTableScreen from './src/screens/NewTableScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OldAgenda" component={OldAgenda} />
        <Stack.Screen name="Demo" component={DemoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* <Stack.Screen name="Test" component={TestScreen} /> */}
        <Stack.Screen name="SignUp" component={SignupScreen}/>
        <Stack.Screen name="Loading" component={LoadingScreen}/>
        <Stack.Screen name="FindPassword" component={FindPassword}/>
        <Stack.Screen name="HomeMenu" component={HomeMenuScreen}/>
        <Stack.Screen name="LoginMenu" component={LoginMenuScreen} />
        <Stack.Screen name="Notices" component={NoticeScreen}/>
      </Stack.Navigator>
  );
}

const SecondStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName='Table'
      screenOptions={{
        headerShown: false
      }}
    >
        <Stack.Screen name="Branch" component={BranchScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="Reserved" component={ReservedScreen} options={{ gestureEnabled: false }}/>
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
      <Stack.Screen name="ReservationListScreen" component={ReservationListScreen}/>
        {/* <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ title: '본인인증' }}/> */}
        {/* <Stack.Screen name="VerificationResult" component={VerificationResult} options={{ title: '본인인증' }}/> */}
        {/* <Stack.Screen name="Verification" component={Verification} options={{ title: '본인인증' }}/> */}
    </Stack.Navigator>
  );
}

const FourthStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName='My'
      screenOptions={{
        headerShown: false
      }}
    >
        <Stack.Screen name="My" component={MyScreen} />
        <Stack.Screen name="Inquiry" component={InquiryScreen} />
        <Stack.Screen name="Inquire" component={InquireScreen} />
        <Stack.Screen name="NewTable" component={NewTableScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
}

const TabNav = () => {
  return (
    <Tab.Navigator
      initialRouteName="Reserve"
      lazy="true"
      tabBarOptions={{
        style: {
          height: (Platform.OS === 'android') ? 70 : 100
        },
        labelStyle:{
          marginBottom: 15
        },
        activeTintColor: '#474747',
        inactiveTintColor: '#474747',
        activeBackgroundColor: '#D9D8D8',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainStack} 
        options={{
          unmountOnBlur: true,
          tabBarLabel: '홈',
          tabBarIcon: () => {
            return (
             <Entypo name="home" color="#474747" size={24} style={{alignSelf: 'center', marginLeft: 0.5, marginTop: 15}} />
            );
          },
        }}
      />
      <Tab.Screen 
        name="Reserve"
        component={SecondStack} 
        options={{
          // unmountOnBlur: true,
          tabBarLabel: '예약하기',
          tabBarIcon: () => <MaterialCommunityIcons name="calendar-clock" color="#474747" size={24} style={{ marginTop: 15 }}/>,
        }}
      />
      <Tab.Screen 
        name="Reserved" 
        component={ThirdStack} 
        options={{
          unmountOnBlur: true,
          tabBarLabel: '예약확인',
          tabBarIcon: () => <MaterialCommunityIcons name="checkbox-marked-outline" color="#474747" size={24} style={{ marginTop: 15 }}/>,
        }}
      />
      <Tab.Screen 
        name="MY" 
        component={FourthStack} 
        options={{
          tabBarLabel: 'MY',
          // unmountOnBlur: true,
          tabBarIcon: () => <FontAwesome5 name="user-alt" color="#474747" size={24} style={{ marginTop: 15 }}/>,
        }}
      />
    </Tab.Navigator>
  )
}

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName='SignUp'
          screenOptions={{
            headerShown: false
          }}
        >
            <Stack.Screen name="SignUp" component={SignupScreen}/>
            <Stack.Screen name="Tab" component={TabNav} />
        </Stack.Navigator>
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
