import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, BackHandler, Alert, Image, FlatList, NativeModules, Button } from 'react-native';
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
import {
    KakaoOAuthToken,
    KakaoProfile,
    getProfile as getKakaoProfile,
    login,
    logout,
    unlink,
} from '@react-native-seoul/kakao-login';

import { NaverLogin, getProfile } from "@react-native-seoul/naver-login";

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

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
    const [result, setResult] = useState("N/A");

    // const [naverToken, setNaverToken] = useState(null);
    const naverToken = useRef(null);

    const isError = useRef(null);

    const iosKeys = {
        kConsumerKey: "0AaE_O2VX2PfbaHgrxIn",
        kConsumerSecret: "RvCZ7LpTeb",
        kServiceAppName: "오피스쉐어",
        kServiceAppUrlScheme: "com.surem.reservation" // only for iOS
    };
    
    const androidKeys = {
        kConsumerKey: "0AaE_O2VX2PfbaHgrxIn",
        kConsumerSecret: "RvCZ7LpTeb",
        kServiceAppName: "오피스쉐어"
    };

    const initials = Platform.OS === "ios" ? iosKeys : androidKeys;


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

    const signInWithKakao = async () => {
        const token = await login();
        console.log("THIS IS TOKEN::::");
        console.log(token);
        return token;
    }
    
    const signOutWithKakao = async () => {
        const message = await logout();
        console.log("OMG SIGNOUT?!?!:::");
        console.log(message);
        return message;
    }

    const getProfileKakao = async () => {
        const profile = await getKakaoProfile();
        console.log("OMG GET PROFILE????");
        console.log(profile);
        return profile;
    }
    
    const unlinkKakao = async () => {
        const message = await unlink();
        console.log("OMG UNLINK!?!?! ZELDA??");
        console.log(message);
        return message;
    }

    const naverLogin = async (props) => {
        console.log("in naver login");
        return new Promise((resolve, reject) => {
          NaverLogin.login(props, (err, token) => {
            console.log(`\n\n  Token is fetched  :: ${token} \n\n`);
            console.log(token);
            // setNaverToken(token);
            naverToken.current = token;
            if (err) {
                console.log(err);
                isError.current = err.errCode;
                // return 'error';
                reject(err);
            }
            resolve("success");
          });
        });
      };
    
    const naverLogout = () => {
        NaverLogin.logout();
        naverToken.current = null;
    };

    const getProfileNaver = async () => {
        console.log("gettingProfile");
        const profileResult = await getProfile(naverToken.current.accessToken);
        if (profileResult.resultcode === "024") {
            Alert.alert("로그인 실패", profileResult.message);
            return;
        }
        console.log("profileResult", profileResult);
    };

    useEffect(() => {
        // getToken();
    }, [db])

    // console.log(naverToken);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
            }}>
            <Text>Testing 카카오 로그인::: 현재 result: </Text>
            {/* <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View> */}
            <Button
                title="카카오 로그인!"
                onPress={ async () => {
                    const res = await signInWithKakao();
                    setResult(res.accessToken);
                }}
            />

            <Button
                title="카카오 로그아웃!"
                onPress={ async () => {
                    const res = await signOutWithKakao();
                    setResult(res);
                }}
            />
            <Button
                title="카카오 정보!"
                onPress={ async () => {
                    const res = await getProfileKakao();
                    setResult(res);
                }}
            />
            <Button
                title="카카오 연결헤제!"
                onPress={ async () => {
                    const res = await unlinkKakao();
                    setResult(res);
                }}
            />

            {/* <Button
                title="네이버 로그인!"
                onPress={ async () => {
                    const res = await naverLogin(initials);
                    console.log(res);
                    // if(isError.current !== null){
                    //     console.log("YES CAUGHT IT")
                    // }
                    // console.log("THIS IS RESULTTT!!! OF NAVER LOGIN!!");
                    // console.log(res);
                    const res2 = await getProfileNaver();
                    console.log(res2);
                }}
            />

            <Button
                title="네이버 로그아웃!"
                onPress={ async () => {
                    const res = await naverLogout();
                }}
            />
            <Button
                title="네이버 정보!"
                onPress={ async () => {
                    const res = await getProfileNaver();
                }}
            /> */}

            <Button
                title="구글 로그인"
                onPress={ async () => {
                    try {
                        GoogleSignin.configure(); // added to do inital configuration
                        await GoogleSignin.hasPlayServices();
                        const userInfo = await GoogleSignin.signIn();
                        console.log(userInfo);
                    } catch (error) {
                        console.log(error);
                        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                        // user cancelled the login flow
                        } else if (error.code === statusCodes.IN_PROGRESS) {
                        // operation (e.g. sign in) is in progress already
                        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                        // play services not available or outdated
                        } else {
                        // some other error happened
                        }
                    }
                }}
            />

            <Button
                title="구글 로그아웃"
                onPress={ async () => {
                    try {
                        await GoogleSignin.signOut();
                    } catch (error) {
                        console.error(error);
                    }
                }}
            />

            <Button
                title="구글 연결해제"
                onPress={ async () => {
                    try {
                        await GoogleSignin.revokeAccess();
                        // Google Account disconnected from your app.
                        // Perform clean-up actions, such as deleting data associated with the disconnected account.
                    } catch (error) {
                        console.error(error);
                    }
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