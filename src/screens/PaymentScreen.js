import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Platform, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as SQLite from 'expo-sqlite';
import CheckBox from '@react-native-community/checkbox';
import IosCheckBox from '../components/IosCheckBox';
import { useFocusEffect } from '@react-navigation/native';
import { TERMS,URL, APP_VERSION } from '../constants';
import * as Notifications from 'expo-notifications';

const PaymentScreen = ({ navigation, route }) => {
    const { PaymentModule } = NativeModules;

    const [errorMessageA, setErrorMessageA] = useState("");
    const [errorMessageB, setErrorMessageB] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    // const [checked, setChecked] = useState(false);

    const [usercode, setUsercode] = useState("");
	const [secretCode, setSecretCode] = useState("");

    const [paymentDone, setPaymentDone] = useState(false);

    const db = SQLite.openDatabase('db.db');

    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS PUSH_ID (_id INTEGER PRIMARY KEY, identifier TEXT, flag TEXT, day TEXT);');
    })

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    var sTime = route.params.startTime.substring(0,2);
    if(sTime[0] == '0'){
        sTime = sTime[1];
    }
    var eTime = route.params.endTime.substring(0,2);
    if(eTime[0] == '0'){
        eTime = eTime[1];
    }

    console.log("Entered PaymentScreen. Params: ");
    console.log(route.params);

    const removeSyncTime = async () => {
        try{
            console.log("Removing sync time from going back...");
            const response = await axios.post( URL + '/removeSyncTime', {
                'roomCode' : route.params.roomCode,
                "resrvStime" : `${route.params.year}${route.params.month}${route.params.day}${route.params.startTime}`,
                "resrvEtime" : `${route.params.year}${route.params.month}${route.params.day}${route.params.endTime}`,
            });
            console.log("Got the response!");
            console.log(response.data);
            if(response.data.returnCode === 'E0000'){
                console.log("Sync succesfully removed.");
            }
            else if(response.data.returnCode === "E1001"){
                console.log("Sync did not exist.");
            }
            else {
                console.log("Parameter error while removing sync.");
            }
        } catch (err) {
            console.log("Error in API call for remove sync.");
            return 'Error'
        }
    }

    useFocusEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            removeSyncTime();
        });
        
        return unsubscribe;
    },);

    const getUserId = () => {
        console.log("in getuserID");
        return new Promise((resolve, reject) => {
            db.transaction(async (tx)=>{
                tx.executeSql(
                    `select * from UserId order by _id desc;`,
                    [],
                    (tx, results) =>{ 
                        setUsercode(results.rows.item(0).usercode)
                        setSecretCode(results.rows.item(0).secretCode)
                        resolve();
                    },
                    (tx, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    // 1. 룸 예약
    const makeReservation = async (payCode) => {
        try{
            console.log("Attempting to make reservation...");
            const ㅇㄸ = await axios.post( URL + '/reservation', {
                'roomCode' : route.params.roomCode,
                'usercode' : usercode,
                'secretCode' : secretCode,
                'payCode' : payCode,
                "resrvStime" : `${route.params.year}${route.params.month}${route.params.day}${route.params.startTime}`,
                "resrvEtime" : `${route.params.year}${route.params.month}${route.params.day}${route.params.endTime}`,
                "resrvNote": route.params.memo,
                "useCoupon": route.params.couponIdx === undefined ? 'N' : 'Y',
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

    const startPayment = async () => {
        try{
            const params = {
                userCode: usercode,
                // secretCode: secretCode,
                resrvStime: `${route.params.year}${route.params.month}${route.params.day}${route.params.startTime}`,
                // resrvEtime: `${route.params.year}${route.params.month}${route.params.day}${route.params.endTime}`,
                payAmount: route.params.discount === undefined ? route.params.totalCost.toString() : (route.params.totalCost - route.params.discount).toString(),
                adminCode: route.params.adminCode,
                roomCode: route.params.roomCode,
                roomName: route.params.roomName,
                userName: "test",
                totalTime: route.params.totalTime.toString(),
                couponCode: route.params.couponCode === undefined ? null : route.params.couponCode,
                couponIdx: route.params.couponIdx === undefined ? null : route.params.couponIdx,
                // resrvNote: route.params.memo,
                useCoupon: route.params.couponIdx === undefined ? 'N' : 'Y',
                // appVersion: APP_VERSION,
                // os: Platform.OS,
                // resrvCode: resResult.resrvCode,
            }
            console.log("[PaymentScreen]: Params for payment native module: ");
            console.log(params);

            const response = await PaymentModule.startPayment(params);
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            console.log(response);
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

            if(response.result === "success"){
                setPaymentDone(true);
                const res = await makeReservation(response.payCode);
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
                }
                else{
                    // have to set notification right here
                    // const year = route.params.year;
                    // const month = route.params.month;
                    // const day = route.params.day;
                    // const rest = "162000"; // route.params.endTime
                    // const hour = rest.substring(0,2);
                    // const min = rest.substring(2,4);
                    
                    const permission = await getPush();
                    console.log("after getting permission");
                    if(permission){
                        await schedulePushNotification(route.params.year, route.params.month, route.params.day, route.params.startTime.substring(0,2), route.params.startTime.substring(2,4));
                    }

                    console.log("[PaymentScreen]:: ABOUT TO GO TO THE RESERVED PAGE");
                    navigation.reset({
                        index: 1,
                        routes: [
                            {name: "Table"},
                            {name: 'Reserved', params: {
                                dateString: route.params.dateString,
                                startTime: `${sTime}:${route.params.startTime.charAt(2)}0 ${sTime > 11 ? "PM" : "AM"}`,
                                endTime: `${eTime}:${route.params.endTime.charAt(2)}0 ${eTime > 11 ? "PM" : "AM"}`,
                                resrvCode: res,
                                weekDay: route.params.weekDay,
                                roomName: route.params.roomName,
                                location: route.params.location,
                                address: route.params.address,
                            }}
                        ],
                    });

                    // navigation.navigate('Reserved', {
                    //     dateString: route.params.dateString,
                    //     startTime: `${sTime}:${route.params.startTime.charAt(2)}0 ${sTime > 11 ? "PM" : "AM"}`,
                    //     endTime: `${eTime}:${route.params.endTime.charAt(2)}0 ${eTime > 11 ? "PM" : "AM"}`,
                    //     resrvCode: res,
                    //     weekDay: route.params.weekDay,
                    //     roomName: route.params.roomName
                    // });
                }
            }
        } catch (e){
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(e);
            console.log(e.message === "E1:payCancel");
            if(e.message === "E1:payCancel"){
                Alert.alert(
                    "결제 진행을 취소하셨습니다.",
                    "[결제하기] 버튼으로 결제 진행을 다시 시작해주세요.",
                    [
                        { text: "확인" },
                        {
                            text: "처음으로 돌아가기",
                            onPress: () => { 
                                navigation.reset({
                                    index: 0, 
                                    routes: [
                                        {name: 'Table'}
                                    ] 
                            }); }
                        }
                    ]
                )
            }
            else if(e.message === "E2:userFail"){
                Alert.alert(
                    "결제가 실패했습니다",
                    "잠시후 다시 예약해주세요.",
                    [
                        {
                            text: "처음으로 돌아가기",
                            onPress: () => { 
                                navigation.reset({
                                    index: 0, 
                                    routes: [
                                        {name: 'Table'}
                                    ] 
                                }); 
                }}]);
            }
            else{
                Alert.alert(
                    "결제오류",
                    "결제도중 알수없는 오류가 일어났습니다. 잠시후 다시 예약해주세요. 같은 오류 반복시 전화문의해주세요.",
                    [
                        {
                            text: "처음으로 돌아가기",
                            onPress: () => { 
                                navigation.reset({
                                    index: 0, 
                                    routes: [
                                        {name: 'Table'}
                                    ] 
                                }); 
                }}]);
            }
        }
    }


    const checkHandler = (newValue) => {
        setErrorMessageB("");
        // setChecked(newValue);
        setToggleCheckBox(newValue);
    }

    useEffect(() => {
        getUserId();
    }, [route.params.roomCode]);
    // },[usercode,secretCode])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f8" }} edges={['right', 'left', 'top']} pointerEvents={paymentDone ? 'none' : 'auto'}>
            <ScrollView>
                <View style={styles.viewStyle}>
                    <View style={styles.guideStyle}>
                        <Text style={styles.titleStyle}>결제안내</Text>
                        <View style={styles.line}/>
                        <View style={styles.rowStyle}>
                            <Text style={styles.subTitleStyle}>이용 일자</Text>
                            <View style={styles.valueView}>
                                <Text style={styles.valueStyle}>{route.params.dateString.replace(/-/g,'.')}({weekDays[route.params.weekDay]})</Text>
                            </View>
                        </View>
                        <View style={styles.rowStyle}>
                            <Text style={styles.subTitleStyle}>이용 시간</Text>
                            <View style={styles.valueView}>
                                <Text style={styles.valueStyle}>{sTime}시{route.params.startTime.charAt(2)}0분~{eTime}시{route.params.endTime.charAt(2)}0분</Text>
                            </View>
                        </View>
                        {/* <View style={styles.rowStyle}>
                            <Text style={styles.subTitleStyle}>회의실</Text>
                            <View style={styles.valueView}>
                                <Text style={styles.valueStyle}>{'4인실'}</Text>
                            </View>
                        </View> */}
                    </View>

                    <View style={styles.infoStyle}>
                        <Text style={styles.titleStyle}>결제정보</Text>
                        <View style={styles.line}/>
                        <View style={styles.infoRowStyle}>
                            <Text style={styles.subTitleStyle}>이용 금액</Text>
                            <View style={{marginRight: 4}}>
                                <Text style={styles.valueStyle}>{route.params.totalCost.toLocaleString()}원</Text>
                            </View>
                        </View>
                        <View style={styles.infoRowStyle}>
                            <Text style={styles.subTitleStyle}>쿠폰</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    // Object {
                                    //     "dateString": "2021-06-09",
                                    //     "day": "09",
                                    //     "endTime": "162000",
                                    //     "memo": "",
                                    //     "month": "06",
                                    //     "roomCode": "1F16051D73AA4A3",
                                    //     "roomName": "회의실",
                                    //     "startTime": "161000",
                                    //     "totalCost": "500",
                                    //     "weekDay": 3,
                                    //     "year": 2021,
                                    // }
                                    // setModalVisible(!modalVisible);
                                    navigation.navigate("Coupon", {
                                        dateString: route.params.dateString,
                                        day: route.params.day,
                                        endTime: route.params.endTime,
                                        memo: route.params.memo,
                                        month: route.params.month,
                                        roomCode: route.params.roomCode,
                                        roomName: route.params.roomName,
                                        startTime: route.params.startTime,
                                        totalCost: route.params.totalCost,
                                        weekDay: route.params.weekDay,
                                        year: route.params.year,
                                        userCode: usercode,
                                        secretCode: secretCode,
                                        couponIdx: route.params.couponIdx,
                                        discount: route.params.discount,
                                        couponCode: route.params.couponCode,
                                        adminCode: route.params.adminCode,
                                        address: route.params.address,
                                        location: route.params.location
                                    })
                                }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.valueStyle}>{route.params.discount === undefined ? '사용 가능한 쿠폰들' : '-' + route.params.discount + '원'} </Text>
                                    <View style={{ justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name="greater-than" size={18} color="#6C6C6C" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.line}/>
                    
                    <View style={styles.infoRowStyle}>
                            <Text style={styles.subTitleStyle}>결제 금액 (vat포함)</Text>
                            <View style={{marginRight: 4}}>
                                <Text style={styles.valueStyle}>{(route.params.totalCost - (route.params.discount === undefined ? 0 : route.params.discount)).toLocaleString()}원</Text>
                            </View>
                    </View>
                    
                    <View style={styles.termsStyle}>
                        <Text style={styles.titleStyle}>결제약관</Text>
                        <View style={styles.termBox}>
                            <ScrollView
                                // style={{borderWidth: 1, borderColor: 'black'}}
                                persistentScrollbar={true}
                                nestedScrollEnabled={true}
                            >
                                <Text style={{ padding: 10 }}>{TERMS.FINANCIAL.term}</Text>
                                {/* <View style={{ paddingHorizontal: 10 }}>
                                    <Image
                                        style={styles.imageStyle}
                                        source={require('../../assets/testTerms.jpeg')}
                                    />
                                </View> */}
                            </ScrollView>
                               
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            {Platform.OS === 'android' ? 
                                <CheckBox
                                    disabled={false}
                                    value={toggleCheckBox}
                                    onValueChange={(newValue) => {
                                        setErrorMessageB("");
                                        // setChecked(newValue);
                                        setToggleCheckBox(newValue);
                                    }}
                                />
                            :
                                <IosCheckBox 
                                    value={toggleCheckBox}
                                    onChange={checkHandler}
                                /> 
                            }
                            <TouchableOpacity
                                style={{ justifyContent: 'center' }}
                                onPress={() => {
                                    setErrorMessageB("");
                                    setToggleCheckBox(!toggleCheckBox);
                                }}
                            >
                                <Text style={styles.termsCaption}>이용약관 및 개인정보 처리방침에 동의합니다.</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.errorBox}>
                            {errorMessageB ? <Text style={styles.errorMessage}>{errorMessageB}</Text> : <Text style={styles.errorMessage}></Text>}
                        </View>
                    </View>
                    <View>
                        <Text style={styles.titleStyle}>결제수단 선택</Text>
                        <TouchableOpacity
                            style={[styles.openButton, toggleCheckBox ? styles.valid : styles.invalid]}
                            onPress={ async () => {
                                if(toggleCheckBox){
                                    // await getUserId();
                                    await removeSyncTime();
                                    // const res = await makeReservation(sTime, eTime);
                                    // console.log(res);
                                    // if(res === 'error'){
                                    //     navigation.reset({
                                    //         index: 0, 
                                    //         routes: [{name: 'CalendarList'}] 
                                    //     });
                                    // }
                                    // else{
                                    //     startPayment(res);
                                    // }
                                    // const qr = await getQrCode(res.qrCode);
                                    // console.log(qr);
                                    
                                    // const permission = await getPush();
                                    // console.log("after getting permission");
                                    // if(permission){
                                    //     await Notifications.scheduleNotificationAsync({
                                    //         identifier: `tester`,
                                    //         content: {
                                    //             title: "예약시간",
                                    //             body: '오피스쉐어 예약 1시간 전 입니다. / 내용 : 000룸 00:00 ~ 00:00 조심히 와주세요.',
                                    //             data: { type: "reservation" },
                                    //         },
                                    //         trigger: { seconds: 2 },
                                    //     });
                                    // }

                                    // navigation.reset({
                                    //     index: 1,
                                    //     routes: [
                                    //         {name: "Table"},
                                    //         {name: 'Reserved', params: {
                                    //             dateString: route.params.dateString,
                                    //             startTime: `${sTime}:${route.params.startTime.charAt(2)}0 ${sTime > 11 ? "PM" : "AM"}`,
                                    //             endTime: `${eTime}:${route.params.endTime.charAt(2)}0 ${eTime > 11 ? "PM" : "AM"}`,
                                    //             resrvCode: "Testing",
                                    //             weekDay: route.params.weekDay,
                                    //             roomName: route.params.roomName,
                                    //             location: route.params.location,
                                    //             address: route.params.address,
                                    //         }}
                                    //     ],
                                    // });

                                    startPayment();
                                    
                                }
                                else{
                                    setErrorMessageB("계속 진행하려면 이용 약관을 읽고 동의해야 합니다.");
                                }
                            }}
                        >
                            <View>
                                <Text style={styles.textStyle}>결제하기</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                
            </ScrollView>
            {paymentDone ?
                    <View style={styles.loading} pointerEvents={'none'}>
                        <ActivityIndicator size='large' color="gray" />
                        <Text>예약완료중</Text>
                    </View>
                    :
                    null
            }
        </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    viewStyle:{
        paddingVertical: 20,
        paddingHorizontal: 18,
        backgroundColor: '#f3f4f8',
        flexGrow: 1
    },
    guideStyle: {
        paddingBottom: 17
    },
    titleStyle: {
        fontSize: 14,
        color: '#39393A',
        marginLeft: 1
    },
    subTitleStyle: {
        fontSize: 13,
        color: '#39393A'
    },
    line: {
        borderBottomColor: '#C2C3C5', 
        borderBottomWidth: 1, 
        marginVertical: 8
    },
    valueStyle: {
        color: '#6C6C6C',
        fontSize: 13
    },
    valueView: {
        // borderWidth: 2,
        // borderColor: 'red',
        width: 130
    },
    rowStyle: {
        flexDirection: 'row',
        paddingLeft: 3,
        paddingBottom: 4,
        justifyContent: 'space-between',
        width: 200
    }, 
    infoStyle: {
        marginBottom: 5
    },
    infoRowStyle: {
        flexDirection: 'row',
        paddingLeft: 3,
        justifyContent: 'space-between',
        marginBottom: 5
    },
    termsStyle: {
        marginTop: 25,
        marginBottom: 10
    },
    termBox : {
        backgroundColor: 'white',
        borderRadius: 5,
        height: 130,
        marginTop: 6
    },
    imageStyle: {
        width: '100%',
        height: 160,
        // aspectRatio: 1,
        resizeMode: 'contain'
    },
    termsCaption: {
        fontSize: 11,
        // paddingTop: 9,
        color: '#39393A'
    },
    modal: {
        alignSelf: 'center'
    },
    modalBox:{
        borderRadius: 15,
        backgroundColor: '#EDEDED',
        height: 270,
        width: 300,
    },
    modalBar: {
        backgroundColor: '#4682D8',
        height: 45,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    barText: {
        fontSize: 14,
        color: 'white'
    },
    barSides: {
        width: 30,
        paddingTop: 9,
        borderWidth: 0,
        paddingLeft: 1,
        borderColor: 'white'
    },
    couponView: {
        // borderWidth: 2, 
        // borderColor: 'black', 
        flex: 1, 
        justifyContent: 'center'
    },
    couponBox: {
        // marginVertical: 18,
        marginHorizontal: 30,
        // justifyContent: 'space-between',
        // borderWidth: 2,
        // borderColor: 'black'
    },
    coupon:{
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 11,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: 'white'
    },
    couponText: {
        textAlign: 'center',
        fontSize: 11,
    },
    applyButton: {
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        // marginBottom: 5,
        backgroundColor: 'black'
    },
    applyText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 12
    },
    couponUnavail: {

    },
    couponSelect: {
        color: 'blue'
    },
    couponUnselect: {

    },

    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    openButton: {
        // alignSelf: 'center',
        // backgroundColor: "gray",
        borderRadius: 15,
        marginTop: 10,
        paddingVertical: 20,
        // paddingHorizontal: 130,
        elevation: 2
    },
    errorBox: {
        alignItems: 'flex-end',
        marginBottom: 3,
        marginRight: 10
    },
    errorMessage : {
        color: 'red',
        fontSize: 11
    },
    valid: {
        backgroundColor: 'gray',
    },
    invalid: {
        backgroundColor: '#D2D1CB',
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#F5FCFF88",
        // borderWidth: 5,
        // borderColor: 'red',
    }
});


export default PaymentScreen;