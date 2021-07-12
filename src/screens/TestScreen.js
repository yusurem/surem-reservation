import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, BackHandler, Alert, Image, FlatList, NativeModules, Button } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';
import LoadingScreen from './LoadingScreen';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment-timezone';
import { URL } from '../constants';
import BranchModal from '../components/BranchModal';
import * as SQLite from 'expo-sqlite';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';

// notifications
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';


const TITLE_H = 60;
const TITLE_W = 170;
const MIN_H = 30;
const HOUR_W = 130;

const db = SQLite.openDatabase("db.db");

const TestScreen = ({ navigation, route }) => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);

    const getToken = () => {
        console.log("[App.js]:: (Push Token)---retrieving...");
        db.transaction(
            (tx) => {
                tx.executeSql('select * from Token order by _id asc;',
                    [],
                    (tx, results) => {
                        if(results.rows.length > 0){
                            console.log("AH THE PUSH TOKEN EXISTS BRO");
                            // setExpoPushToken(results.rows.item(0).pushToken);
                            setExpoPushToken(results.rows._array[results.rows._array.length - 1].pushToken)
                        }
                    },
                    (tx, error) => {
                        console.log(error);
                    }
                );
            }
        )
    }
    
    useEffect(() => {
        getToken();
    }, [db])

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
            }}>
            <Text>Your expo push token: {expoPushToken}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button
                title="Press to schedule a notification"
                onPress={async () => {
                    await schedulePushNotification();
                }}
            />
        </View>
    );
}
    
// new Date(year, monthIndex, day, hours, minutes)
// params have: year, month, day, hhmmss

const year = "2021";
const month = "07";
const day = "09";
const rest = "145600";

async function schedulePushNotification() {
    // const trigger = new Date(year, parseInt(month) - 1, day, rest.substring(0,2), rest.substring(2,4));
    console.log("[TestScreen]:: Scheduling a notification.")
    // console.log(trigger);
    await Notifications.scheduleNotificationAsync({
        identifier: `${year}${month}${day}`,
        content: {
            title: "예약시간",
            body: '오피스쉐어 예약 1시간 전 입니다. / 내용 : 000룸 00:00 ~ 00:00 조심히 와주세요.',
            data: { type: "reservation" },
        },
        trigger: { seconds: 2 },
        // trigger,
    });
}

const styles = StyleSheet.create({
    
});

export default TestScreen;