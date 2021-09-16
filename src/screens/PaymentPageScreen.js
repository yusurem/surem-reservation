import React, { useState, useEffect } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { Platform,Alert } from 'react-native';
import { TERMS,URL, APP_VERSION } from '../constants';

export default function PaymentPageScreen({ navigation, route }) {

  const jsCode = "setTimeout(function() {window.postMessage(document.getElementById('newStuff'));}, 2000)";
  const [paymentDone, setPaymentDone] = useState(false);
  const [errorMessageA, setErrorMessageA] = useState("");
  const [errorMessageB, setErrorMessageB] = useState("");
  const db = SQLite.openDatabase('db.db');

  var sTime = route.params.startTime.substring(0,2);
    if(sTime[0] == '0'){
        sTime = sTime[1];
    }
    var eTime = route.params.endTime.substring(0,2);
    if(eTime[0] == '0'){
        eTime = eTime[1];
    }

  // 1. 룸 예약

  const makeReservation = async (payCode) => {
    try{
        console.log("Attempting to make reservation...");
        console.log(`${route.params.resrvStime}`)
        console.log(`${route.params.resrvEtime}`)
        console.log(`${route.params.couponIdx}`)
        console.log('payCode :: ',payCode)
        console.log((route.params.couponIdx == undefined || route.params.couponIdx == null) ? 'N' : 'Y')
        console.log('hi')
        console.log(payCode)
        console.log('RESRSTIME:: ',route.params.resrvStime)
        console.log('RESRETIME:: ',route.params.resrvEtime)
        console.log('usrcode:: ',route.params.userCode.current)
        console.log('secretCode:: ',route.params.secretCode.current)

        console.log('hhieeee22')
        console.log('roomCode:: ',route.params.roomCode)

        console.log('APPVERSION::',APP_VERSION);
        console.log(Platform.OS);
        const response = await axios.post( URL + '/reservation', {
            'roomCode' : route.params.roomCode,
            'usercode' : route.params.userCode.current,
            'secretCode' : route.params.secretCode.current,
            'payCode' : payCode,
            "resrvStime" : route.params.resrvStime,
            "resrvEtime" : route.params.resrvEtime,
            "resrvNote": route.params.memo,
            "useCoupon": (route.params.couponIdx == undefined || route.params.couponIdx == null) ? 'N' : 'Y',
            "couponIdx": route.params.couponIdx,
            "appVersion": APP_VERSION,
            "os": Platform.OS,
        });


        


        console.log(`Got the response!`);
        console.log(response.data);

        if(response.data.returnCode.substring(0,5) !== "E0000"){
            console.log("Error: " + response.data.returnCode);
            return 'error';
        }

        let rCode = response.data.returnCode.substring(6);

        return rCode;

        // return {
        //     dateString: route.params.dateString,
        //     startTime: `${sTime}:${route.params.startTime.charAt(2)}0 ${sTime > 11 ? "PM" : "AM"}`,
        //     endTime: `${eTime}:${route.params.endTime.charAt(2)}0 ${eTime > 11 ? "PM" : "AM"}`,
        //     resrvCode: rCode
        // };
    } catch (err) {
        setErrorMessageA("API 문제발생");
        console.log(err);
    }
}

const schedulePushNotification = async (year, month, day, hour, min) => {
    console.log("[PaymentScreen]:: Attempting to schedule a notification...");
    var identifier;

    if(parseInt(hour) >= 9){
        const triggerB = new Date(year, parseInt(month) - 1, day, 8, 0);
        console.log("[PaymentScreen]:: Trigger-- " + triggerB);
        console.log(`DAY :: ${year}${month}${day}`);
        identifier = await Notifications.scheduleNotificationAsync({
            identifier: `${year}${month}${day}`,
            content: {
                title: "예약알림",
                body: `오늘 이용예정인 예약이 있습니다.`,
                data: { type: 'reservation' },
            },
            trigger: triggerB,
        });
        console.log('ID :: ',identifier)
        await registerPushId(identifier, "B");
    }

    if(parseInt(hour) === 9 && parseInt(min) === 0){
        return;
    }
    else{
        const triggerA = new Date(year, parseInt(month) - 1, day, parseInt(hour) - 1, min);
        console.log("[PaymentScreen]:: Trigger-- " + triggerA);
        console.log(`[Trigger-- A] :: ${year}${month}${day}${hour}${min}:${route.params.roomName}`);
        identifier = await Notifications.scheduleNotificationAsync({
            identifier: `${year}${month}${day}${hour}${min}:${route.params.roomName}`,
            content: {
                title: "예약알림 ",
                body: `오피스쉐어 예약 1시간 전 입니다. / 내용 : ${route.params.roomName}룸 ${sTime}:${route.params.startTime.charAt(2)}0 ~ ${eTime}:${route.params.endTime.charAt(2)}0.`,
                data: { type: 'reservation' },
            },
            trigger: triggerA,
        });
        await registerPushId(identifier, "A");
    }   
}

const getPush = () => {
    console.log("[PaymentScreen]:: Retreiving push permission..");
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
            tx.executeSql('select * from PUSH_PERMISSION;',
                [],
                (tx, results) => {
                    if(results.rows.length > 0){
                      console.log("[PaymentScreen]:: Push permission not allowed.");
                      resolve(false);
                    }
                    else{
                      console.log("[PaymentScreen]:: Push permission allowed.");
                      resolve(true);
                    }
                },
                (tx, error) => {
                    // console.log(error);
                    reject(error);
                }
            );
        }
      )
    });
}

  const registerPushId = async (identifier, flag) => {
    console.log("[PaymentScreen]:: Registering push notification Id...");
    return new Promise((resolve, reject) => {
        db.transaction(
        (tx) => {
            tx.executeSql("INSERT INTO PUSH_ID (identifier, flag) VALUES(?,?);", [identifier, flag],
                (tx, results) => {
                    // console.log(results);
                    console.log("[PaymentScreen]:: Push notification Id registered.");
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

  const onMessage = async (event) => {
    const jsonObj = JSON.parse(event.nativeEvent.data);
    console.log(jsonObj)
    const params = {
      userCode: route.params.userCode,
      resrvStime: `${route.params.year}${route.params.month}${route.params.day}${route.params.startTime}`,
      payAmount: route.params.discount === undefined ? route.params.totalCost.toString() : (route.params.totalCost - route.params.discount).toString(),
      adminCode: route.params.adminCode,
      roomCode: route.params.roomCode,
      roomName: route.params.roomName,
      userName: "test",
      totalTime: route.params.totalTime.toString(),
      couponCode: route.params.couponCode === undefined ? null : route.params.couponCode,
      couponIdx: route.params.couponIdx === undefined ? null : route.params.couponIdx,
      useCoupon: route.params.couponIdx === undefined ? 'N' : 'Y'
  }
  
    if(jsonObj.sReplyCd == "0000" || jsonObj.sReplyCd == "0001" || jsonObj.sReplyCd == "9999"){
      console.log('Payment Complete')
      setPaymentDone(true);
      const res = await makeReservation(jsonObj.sOrderNo);
      
      if(res === 'error'){
          setPaymentDone(false);
          Alert.alert(
              "예약오류",
              "예약도중 서버 오류가 일어났습니다. 결제 취소됬습니다. 잠시후 다시 예약해주세요.",
              [{
                  text: "처음으로 돌아가기",
                  onPress: () => {
                      navigation.reset({
                          index: 0,
                          routes: [
                              {name: 'Table'}
                          ]
          })}}]);
        
    } else {
      //const permission = await getPush();
      console.log("after getting permission");
      
    //   if(permission){
    //       await schedulePushNotification(route.params.year, route.params.month, route.params.day, route.params.startTime.substring(0,2), route.params.startTime.substring(2,4));
    //   }

      console.log("[PaymentScreen]:: ABOUT TO GO TO THE RESERVED PAGE");
      console.log('Stime :: ', route.params.startTime)
      console.log('EndTime :: ',route.params.endTime)

      console.log('STARTTIME :: ',`${route.params.startTime.charAt(2)}`)
      navigation.reset({
          index: 1,
          routes: [
              {name: "Table"},
              {name: 'Reserved', params: {
                  dateString: route.params.dateString,
                  startTime: `${route.params.startTime}`,
                  endTime: `${route.params.endTime}`,
                  resrvCode: res,
                  weekDay: route.params.weekDay,
                  roomName: route.params.roomName,
                  location: route.params.location,
                  address: route.params.address,
              }}
          ],
      });
    }

  }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <WebView
            source={{uri: 'https://office-admin.surem.com/AllatPay/AllatPayApprovalView.do', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `userCode=${route.params.userCode.current}&resrvStime=${route.params.resrvStime}&payAmount=${route.params.payAmount}&adminCode=${route.params.adminCode}&roomCode=${route.params.roomCode}&roomName=${route.params.roomName}&userName=test&totalTime=${route.params.totalTime}`,
            method:'POST'}}
            injectedJavaScript={`window.postMessage(JSON.stringify({ listening: 'Sup' }), '*')`}
            onLoad={this.handleOnLoad}
            onLoadEnd={this.handleOnLoadEnd}
            onLoadStart={this.handleOnLoadStart}
            onMessage={this.handleMessage}
            onMessage={onMessage}
          />
        
    </SafeAreaView>
  );  
}
