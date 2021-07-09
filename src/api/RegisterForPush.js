import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
// import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export default async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        experienceId: '@brandonra97/reservation',
      })).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
}

export const getToken = (db) => {
    console.log("[App.js]:: (Push Token)---retrieving...");
    db.transaction(
        (tx) => {
            tx.executeSql('select * from PushToken;',
                [],
                (tx, results) => {
                    if(results.rows.length > 0){
                        console.log("AH THE PUSH TOKEN EXISTS BRO");
                    }
                },
                (tx, error) => {
                    console.log(error);
                }
            );
        }
    )
}

export const saveToken = (pushToken, db) => {
    console.log("[App.js]:: (Push Token)---inserting...");
    db.transaction(
        (tx) => {
            tx.executeSql("INSERT INTO TOKEN (pushToken) VALUES(?);", [pushToken],
                (tx, results) => {
                    console.log(results);
                },
                (txt, error) => {
                    console.log(error);
                }
            )
        },
    )
}

export const deleteToken = (db) => {
    console.log("[App.js]:: (Push Token)---deleting...");
    db.transaction(
        (tx) => {
            tx.executeSql('DELETE FROM TOKEN',
                (tx, results) => {
                    console.log(results);
                },
                (txt, error) => {
                    console.log(error);
                }
            )
        },
    )
}
