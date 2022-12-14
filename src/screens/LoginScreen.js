import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Alert, Image, FlatList, NativeModules, Button } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen';
import { useFocusEffect } from '@react-navigation/native';
import { URL, TERMS } from '../constants';
import * as SQLite from 'expo-sqlite';
import CountDownTimer from '../components/CountDownTimer';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import SuremSimData from 'surem-sim-data';


import { Feather } from '@expo/vector-icons'; 
import Modal from 'react-native-modal';

const db = SQLite.openDatabase("db.db");

// db.transaction(tx=>{
//     tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT, username TEXT, loginType TEXT);')
// })


const LoginScreen = ({ navigation, route }) => {
    console.log("LOGIN SCREEN RENDERED");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [phoneNum, setPhoneNum] = useState("");
    const [authNumInput, setAuthNumInput] = useState(null);
    const [isSentAuth, setIsSentAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const authNumber = useRef(null);
    const secretCode = useRef(null);
    const username = useRef(null);


    const [permissionState, setPermissionState] = useState(false);
    const askPermission = async () => {
        try{
            const result = await request(PERMISSIONS.ANDROID.READ_PHONE_STATE)
            if(result === RESULTS.GRANTED){
                setPermissionState(true);
            } else if(result === RESULTS.DENIED){
                setPermissionState(true)
            }
        }catch (error) {
            console.log('askPermission', error);
        }
    }

    const makeId = () => {
        var text = "";
        var possible = "0123456789"
        for (let i = 0; i < 4; i++){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text
    }

    const sendMessage = (callphone,authNumberText) => {
        console.log('CALLPHONE :: ', callphone)
        var data = JSON.stringify(
            {
                "usercode":"suremqr",
                "deptcode":"35--SX-DQ",
                "messages":
                    [
                        {
                            "message_id": "1", 
                            "to": callphone
                        },
                    ],
                "text": "[?????? ?????????] ?????? ?????? ?????? ????????? " + authNumberText + " ?????????",
                "from": "15884640",
                "reserved_time": "000000000000"
            }
        );

        var config = {
            method: 'post',
            url: 'https://dynapi.surem.com/sms/v1/json?secuCd=f71742597bd420117f7736f9b052a665fed39d1cdf53707f955da2d6921dcd32',
            headers: {
                'Content-Type': 'application/json'
            },
            data : data
        };
    
        axios(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
            })
        .catch(function (error) {
            console.log(error);
        });
    }

    const checkUser = async () => {
        try {
            console.log("Attempting to check if user exists...");
            const response = await axios.post( URL + '/getEncryptCode', {
                usercode: phoneNum,
            });

            console.log(response.data);

            if(response.data.returnCode === 'E2007'){
                Alert.alert('???????????? ??????????????? ??????????????? ?????? ???????????????.');
                return 'non_user';
            }
            else if(response.data.returnCode.length > 5){
                secretCode.current = response.data.returnCode;
                return 'userExists';
            }
            else{
                console.log("Error: " + response.data.returnCode);
                Alert.alert("????????? ????????? ???????????????. ????????? ?????? ??????????????????.");
                return response.data.returnCode;
            }

        } catch (err) {
            console.log("Error: " + err);
            Alert.alert("????????? ????????? ???????????????. ????????? ?????? ??????????????????.");
            return err;
        }
    }

    const getMyInfo = async () => {
        try{
            console.log("Attempting to get user information...");
            const response = await axios.post( URL + '/myInfo', {
                usercode: phoneNum,
                securityKey: secretCode.current
            });
            // console.log(`Got the response!`);
            console.log(response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                Alert.alert("????????? ????????? ???????????????. ????????? ?????? ??????????????????.");
                return response.data.returnCode;
            }
            else {
                username.current = response.data.username;
            }

            return response.data;
           
        } catch (err) {
            console.log(err);
            Alert.alert("????????? ????????? ???????????????. ????????? ?????? ??????????????????.");
            return 'Error';
        }
    }

    const login = async () => {
        const res = await saveUserId(secretCode.current, phoneNum, username.current, 'default');
        if(res === 'success'){
            navigation.navigate("Tab");
        }
        else{
            Alert.alert('???????????? ????????? ??????????????????. ?????? ??? ?????? ??????????????????.');
        }

    }

    const saveUserId = async (secretCode, userNum, username, loginType) => {
        // console.log("[TableScreen]:: Inserting into SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                            "INSERT INTO UserId (secretCode, usercode, username, loginType) VALUES(?,?,?,?);", 
                            [secretCode, userNum, username, loginType],
                        (tx, results) => {
                            resolve("success");
                        },
                        (txt, error) => {
                            // console.log(error);
                            reject("error");
                        }
                    )
                },
            )
        })
    }

    const getPhoneNumber = async () => {
        setPhoneNum(await SuremSimData.getPhoneNumber())
        // console.log('Hello',phoneNum)
        setLoading(false);
    }

    useEffect(()=>{
        if(Platform.OS === 'android'){
            askPermission();
            if(permissionState){
                if(phoneNum == ""){
                    getPhoneNumber();
                }
            }
        }
        else {
            setLoading(false);
        }
        
        return(()=>{})
    },[permissionState]);

    if(loading){
        return (
            <LoadingScreen/>
        );
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f8" }} edges={['top', 'left', 'right']}>
            <View style={styles.mainBox}>
                <View style={styles.titleBox}>
                    <Text style={styles.titleText}>?????????</Text>
                    <Text style={styles.subtext}>???????????? ?????? ????????? ????????? ?????????.</Text>
                </View>

                <View style={styles.infoSection}>
                    <TextInput
                        style={styles.phoneNumInput}
                        onChangeText={setPhoneNum}
                        value={phoneNum}
                        editable={!isSentAuth}
                        placeholder="????????? ?????? ( - )??????"
                        keyboardType="number-pad"
                    />
                        
                    <View style={styles.authNumBox}>
                        {!isSentAuth ?
                            <TouchableOpacity
                                style={styles.sendAuthNum}
                                onPress={async () => {
                                    if(phoneNum === ""){
                                        Alert.alert("????????? ????????? ??????????????????.")
                                    }
                                    else {
                                        const res = await checkUser();
                                        if(res === 'userExists'){
                                            console.log("sending message");
                                            authNumber.current = makeId();
                                            sendMessage(phoneNum, authNumber.current);
                                            setMinutes(3);
                                            setSeconds(0);
                                            // setSeconds(5);
                                            setIsSentAuth(true);
                                        }
                                    }
                                }}
                            >
                                <Text style={styles.sendAuthNumText}>???????????? ?????????</Text>
                            </TouchableOpacity>
                            :
                            <View>
                                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                    <TextInput
                                        style={styles.authNumInput}
                                        onChangeText={setAuthNumInput}
                                        value={authNumInput}
                                        editable={!isAuthorized}
                                        placeholder="???????????? 4?????? ??????"
                                        keyboardType="number-pad"
                                    />
                                    <TouchableOpacity
                                        style={styles.checkAuthNum}
                                        onPress={() => {
                                            if(authNumInput === authNumber.current){
                                                setIsAuthorized(true);
                                            }
                                            else {
                                                Alert.alert("??????????????? ???????????????.");
                                            }
                                        }}
                                    >
                                        <Text style={styles.checkAuthNumText}>????????????</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <TouchableOpacity
                                    style={[styles.reSendAuthNum, { backgroundColor: isAuthorized ? '#BBBEC5' : '#404757' }]}
                                    onPress={() => {
                                        if(!isAuthorized){
                                            authNumber.current = null;
                                            setAuthNumInput(null);
                                            setIsSentAuth(false);
                                        }
                                    }}
                                >
                                    <Text style={styles.sendAuthNumText}>???????????????</Text>
                                </TouchableOpacity>

                                { isAuthorized === false ? 
                                    <View style={styles.timerBox}>
                                        <CountDownTimer minutes={minutes} seconds={seconds} setMinutes={setMinutes} setSeconds={setSeconds} setIsSentAuth={setIsSentAuth} /> 
                                    </View>
                                    :
                                    <View style={styles.timerBox}>
                                        <Text style={{ color: '#4184E4', fontSize: 12 }}>????????????</Text>
                                    </View>
                                }
                            </View>
                        }
                        
                    </View>
                   
                </View>

                <TouchableOpacity
                    style={[styles.signUpButton, { backgroundColor: isAuthorized && isSentAuth ? '#4184E4' : '#BBBEC5'}]}
                    onPress={ async () => {
                        if(isAuthorized && isSentAuth){
                            await getMyInfo();
                            login();
                        }
                        else{
                            Alert.alert("????????? ????????? ??????????????????.");
                        }
                    }}
                >
                    <Text style={styles.signUpText}>?????????</Text>
                </TouchableOpacity>
                

            </View>

        

        </SafeAreaView>
    );
}
    

const styles = StyleSheet.create({
    mainBox: {
        // alignItems: 'center',
        // flex: 1
    },
    titleBox: {
        alignItems: 'center',
        marginVertical: 40,
        paddingTop: 30
    },
    titleText: {
        fontSize: 20,
        marginBottom: 7,
        color: '#454545'
    },
    subtext: {
        fontSize: 12,
        color: '#454545'
    },
    infoSection: {
        marginHorizontal: 50
    },
    phoneNumInput: {
        backgroundColor: 'white',
        // flex: 2,
        borderRadius: 10,
        paddingLeft: 15,
        paddingVertical: Platform.OS === 'android' ? 0 : 15
    },
    authNumBox: {
        // flexDirection: 'row',
        marginTop: 12,
    },
    sendAuthNum: {
        backgroundColor: '#404757',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        height: 50,
    },
    reSendAuthNum: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        height: 50,
    },
    sendAuthNumText: {
        color: 'white',
    },
    checkAuthNum: {
        backgroundColor: '#404757',
        flex: 1,
        borderRadius: 10,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
        // paddingVertical: Platform.OS === 'android' ? 0 : 15
    },
    checkAuthNumText: {
        color: 'white',
        fontSize: 13,
    },
    authNumInput: {
        backgroundColor: 'white',
        borderRadius: 10,
        paddingLeft: 15,
        flex: 2,
        paddingVertical: Platform.OS === 'android' ? 0 : 15
    },
    timerBox: {
        marginTop: 5,
        // height: 10,
        // marginLeft: 10,
    },
    signUpButton: {
        // backgroundColor: '#404757',
        height: 60,
        marginHorizontal: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginTop: 25
    },
    signUpText: {
        fontSize: 16,
        color: 'white'
    },
    footerBox: {

    },
});

export default LoginScreen;