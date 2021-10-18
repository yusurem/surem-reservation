import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { View, Text, Button } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import * as Font from 'expo-font'
import * as Notifications from 'expo-notifications';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Entypo, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

import registerForPushNotificationsAsync from './src/api/RegisterForPush';

import HomeScreen from './src/screens/home/HomeScreen';
import HomeMenuScreen from './src/screens/HomeMenuScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReservationScreen from './src/screens/ReservationScreen';
import DatePicker from './src/screens/DatePicker';
import ReservedScreen from './src/screens/ReservedScreen';
import AgendaScreen from './src/screens/AgendaScreen';
import CalListScreen from './src/screens/CalListScreen';
import OldAgenda from './src/screens/OldAgenda';
import TableScreen from './src/screens/TableScreen';
import DemoScreen from './src/screens/DemoScreen';
import TestScreen from './src/screens/TestScreen';
import SignupScreen from './src/screens/member/SignUpScreen'
import FindPassword from './src/screens/member/FindPasswordScreen'
import LoginMenuScreen from './src/screens/LoginMenuScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ReservationListScreen from './src/screens/reservation/ReservationListScreen';
import NoticeScreen from './src/screens/NoticeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import MyScreen from './src/screens/MyScreen';
import BranchScreen from './src/screens/BranchScreen';
import InquiryScreen from './src/screens/InquiryScreen';
import InquireScreen from './src/screens/InquireScreen';
import NewTableScreen from './src/screens/NewTableScreen';
import InitialScreen from './src/screens/InitialScreen';
import OldTableScreen from './src/screens/OldTableScreen';
import CouponScreen from './src/screens/CouponScreen';
import MyCouponScreen from './src/screens/MyCouponScreen';
import PaymentPageScreen from './src/screens/PaymentPageScreen';
import PreSignUpScreen from './src/screens/PreSignUpScreen';
import SignUpConfirmScreen from './src/screens/SignUpConfirmScreen';
import LoginScreen from './src/screens/LoginScreen';

Font.loadAsync({'NanumSquareRegular':require('./assets/fonts/NanumSquareRegular.ttf')})
Font.loadAsync({'NanumSquareBold':require('./assets/fonts/NanumSquareBold.ttf')})
Font.loadAsync({'BMHANNAPro':require('./assets/fonts/BMHANNAPro.ttf')})

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
        {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
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
        <Stack.Screen name="Coupon" component={CouponScreen} />
        <Stack.Screen name="PaymentPage" component={PaymentPageScreen}/>
        
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
        <Stack.Screen name="MyCoupon" component={MyCouponScreen} />
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
          marginBottom: (Platform.OS === 'android') ? 8 : 10
        },
        activeTintColor: '#3779DA',
        inactiveTintColor: '#474747'
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainStack} 
        options={{
          unmountOnBlur: true,
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => {
            return (
             <Entypo name="home" color={color} size={24} 
              style={{
               alignSelf: 'center', 
               marginLeft: 0.5, 
               marginTop: (Platform.OS === 'android') ? 12 : 5 
              }} />
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
          tabBarIcon: ({ color, size }) => 
          <MaterialCommunityIcons name="calendar-clock" color={color} size={24} 
          style={{ 
            marginTop: (Platform.OS === 'android') ? 12 : 5
          }}/>,
        }}
      />
      <Tab.Screen 
        name="Reserved" 
        component={ThirdStack} 
        options={{
          unmountOnBlur: true,
          tabBarLabel: '예약확인',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="checkbox-marked-outline" color={color} size={24} 
          style={{ 
            marginTop: (Platform.OS === 'android') ? 12 : 5
          }}/>,
        }}
      />
      <Tab.Screen 
        name="MY" 
        component={FourthStack} 
        options={{
          tabBarLabel: 'MY',
          // unmountOnBlur: true,
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user-alt" color={color} size={24} 
          style={{ 
            marginTop: (Platform.OS === 'android') ? 12 : 5
          }}/>,
        }}
      />
    </Tab.Navigator>
  )
}

// sqlite for locally storing push notification token value
const db = SQLite.openDatabase("db.db");

// db.transaction((tx) => {
  // tx.executeSql('DROP TABLE IF EXISTS Branches;');
// })

db.transaction((tx) => {
  tx.executeSql('CREATE TABLE IF NOT EXISTS TOKEN (_id INTEGER PRIMARY KEY, pushToken TEXT);');
})

db.transaction((tx) => {
  tx.executeSql('CREATE TABLE IF NOT EXISTS PUSH_PERMISSION (_id INTEGER PRIMARY KEY, allowed BOOLEAN);');
})

// const getPushPermission = () => {
//   console.log("[App.js]:: Retreiving push permission..");
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//           tx.executeSql('select * from PUSH_PERMISSION;',
//               [],
//               (tx, results) => {
//                   if(results.rows.length > 0){
//                     console.log("[App.js]:: Push permission not allowed. Skipping notification listeners.");
//                     resolve(false);
//                   }
//                   else{
//                     console.log("[App.js]:: Push permission allowed. Initializing notification listeners.");
//                     resolve(true);
//                   }
//               },
//               (tx, error) => {
//                   // console.log(error);
//                   reject(error);
//               }
//           );
//       }
//     )
//   });
// }

const saveToken = async (pushToken) => {
  console.log("[App.js]:: (Push Token)--- Inserting...");
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("INSERT INTO TOKEN (pushToken) VALUES(?);", [pushToken],
          (tx, results) => {
            // console.log(results);
            console.log("[App.js]:: (Push Token)--- Insertion completed.");
            resolve(results);
          },
          (txt, error) => {
            // console.log(error);
            reject(error);
          }
        )
      },
    );
  });
}

const deleteToken = async () => {
  console.log("[App.js]:: (Push Token)--- Deleting...");
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql('DELETE FROM TOKEN', [],
          (tx, results) => {
            // console.log(results);
            console.log("[App.js]:: (Push Token)--- Deletion completed.");
            resolve(results);
          },
          (txt, error) => {
            // console.log(error);
            reject(error);
          }
        )
      },
    );
  }); 
}

// For setting how the notification will be handled when a notification comes while the application is in foreground
// When a notification is received, handleNotification is called with the incoming notification as an argument.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function App() {
  // To address the small white screen flash when initially loading the application
  useEffect(() => {
    setTimeout(() => SplashScreen.hide() , 50);
  }, [Stack])
  
  

  // ------------- from this point, push notification setup
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigationRef = useRef(null);
  const isReadyRef = useRef(false);
  const [notifType, setNotifType] = useState(null);
  // var notifType = null;
  const [receiveNotification, setReceiveNotification] = useState(false); // send this set function as a call back to Myscreen.js that will call it to make this true or false.
                                                                         // after that, make it so that notifications are only sent depending on this value
  if(Platform.OS === 'android'){
    useEffect(() => {
      console.log("[App.js]:: (PUSH USEEFFECT)--- Starting.");
  
      registerForPushNotificationsAsync().then( async (token) => {
        console.log("[App.js]:: (PUSH USEEFFECT)--- Got token. Token is " + token);
        try{
          // const permission = await getPushPermission();
          // console.log("[App.js]:: (PUSH USEEFFECT)--- Permission: " + permission);
          // if(!permission){
          //   return;
          // }
          await deleteToken(); // to have only one token in the table at all time
          await saveToken(token); // locally store the token for notification setups in other screens
          console.log("[App.js]:: (PUSH USEEFFECT)--- Delete and insertion completed sucessfully.")
        }
        catch (err) {
          console.log("[App.js]:: (PUSH USEEFECT ERROR)---");
          console.log(err);
          console.log("ERROR!");
        }
        // setExpoPushToken(token);
      });
  
      // A listener for whenever a notification is received while the app is running.
      // argument: a callback function that takes a "Notification" object as an argument
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log("[PUSH_NOTIFICATION]:: Received notification while on foreground");
        console.log(notification);
        // setNotification(notification);
      });
      console.log("[App.js]:: (PUSH USEEFFECT)--- Finished setting up first listner");
  
      // A listener for whenever a user interacts with a notification (eg. taps on it).
      // argument: a callback function that takes a "NotificationResponse" object as an argument
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("[PUSH_NOTIFICATION]:: Responded to notification!");
        console.log(response);
  
        if(isReadyRef.current && navigationRef.current){
          if(response.notification.request.content.data.type === "reservation"){
            navigationRef.current?.navigate("Reserved");
          }
          else{
            console.log("공지사항/쿠폰");
          }
        }
        else{
          // default action when navigation container has not been mounted yet
          // console.log(response.notification.request.identifier);
          setNotifType(response.notification.request.content.data.type);
          // notifType = response.notification.request.identifier;
        }
        console.log("Done with responding to notification");
      });
      console.log("[App.js]:: (PUSH USEEFFECT)--- Finished setting up second listner");
  
      return () => {
        // unsusbscribing on unmount
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }, []);
    // ------------- finished push notification setup
    
    console.log("NOTIFTYPE:: " + notifType);
    
  }
  
  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          isReadyRef.current = true;
        }}
      >
        <Stack.Navigator 
          initialRouteName='Initial'
          screenOptions={{
            headerShown: false
          }}
        >
            <Stack.Screen name="Initial" component={InitialScreen} initialParams={{ notification: notifType }}/>
            <Stack.Screen name="PreSignUp" component={PreSignUpScreen} />
            <Stack.Screen name="SignUp" component={SignupScreen}/>
            <Stack.Screen name="SignUpConfirm" component={SignUpConfirmScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Tab" component={TabNav} />
        </Stack.Navigator>
      </NavigationContainer>
      {/* <Button
        onPress={() => navigationRef.current.navigate('Reserve')}
        title="Go home"
      /> */}
    </SafeAreaProvider>
  );
}


// function HomeScr() {
//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text>Home Screen</Text>
//     </View>
//   );
// }

// function Emp() {
//   return (
//     <View>

//     </View>
//   );
// }

// function App() {
//   const navigationRef = useRef(null);

//   return (
//     <View style={{ flex: 1 }}>
//       <NavigationContainer
//         ref={navigationRef}
//         onReady={() => {
//           isReadyRef.current = true;
//         }}
//       >
//         <Stack.Navigator 
//           initialRouteName='Initial'
//           screenOptions={{
//             headerShown: false
//           }}
//         >
//             <Stack.Screen name="Initial" component={InitialScreen}/>
//             <Stack.Screen name="SignUp" component={SignupScreen}/>
//             <Stack.Screen name="Tab" component={TabNav} />
//             <Stack.Screen name="Homed" component={HomeScr} />
//         </Stack.Navigator>
//       </NavigationContainer>
//       <Button
//         onPress={() => navigationRef.current.navigate('Reserve')}
//         title="Go home"
//       />
//     </View>
//   );
// }

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
