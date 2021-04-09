import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image, Alert, TouchableOpacity, ScrollView, NestedScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';

const PaymentScreen = ({ navigation, route }) => {
    const [errorMessageA, setErrorMessageA] = useState("");
    const [errorMessageB, setErrorMessageB] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [checked, setChecked] = useState(false);

    const [usercode, setUsercode] = useState("");
	const [secretCode, setSecretCode] = useState("");

    console.log("Entered PaymentScreen. Params: ");
    console.log(route.params);

    const db = SQLite.openDatabase('db.db');

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    var sTime = route.params.startTime.substring(0,2);
    if(sTime[0] == '0'){
        sTime = sTime[1];
    }
    var eTime = route.params.endTime.substring(0,2);
    if(eTime[0] == '0'){
        eTime = eTime[1];
    }

    const getUserId = async () => {
        console.log("in getuserID");
        try{
            await db.transaction(async (tx)=>{
            tx.executeSql(
                `select * from UserId order by _id desc;`,
                [],
                (tx, results) =>{
                console.log("doing getUserId");
                console.log('SELECT DDDDD :: ', results)
                            setUsercode(results.rows.item(0).usercode)
                            setSecretCode(results.rows.item(0).secretCode)
                }
            )
            })
        } catch (err){
            console.log(err);
        }
    }

    // 1. 룸 예약
    // url : http://공용개발:8989/reservation
    // method : post
    // parameter type : json
    // {
    //     "roomCode" : "techno100010001", // 룸 코드
    //     "usercode" : "tester", // 사용자 ID
    //     "resrvStime" : "20210202120000", // 예약 시작 시간. yyyyMMddHHmmss
    //     "resrvEtime" : "20210202140000" // 예약 종료 시간. yyyyMMddHHmmss
    // }
    const makeReservation = async (start, end) => {
        try{
            console.log("Attempting to make reservation...");
            // console.log(`${route.params.year}${route.params.month}${route.params.day}${route.params.startTime}`);
            console.log("usercode: " + usercode);
            console.log("secretcode: " + secretCode);
            const response = await axios.post('http://112.221.94.101:8980/reservation', {
                'roomCode' : route.params.roomCode,
                // 'usercode' : "testId1",
                // "secretCode" : "EI1MLYNV5v0pQLLlYn1hrfL2jITz5M5cArB6pnP84k0uFQLudygVvSlA9ssPlh6SKVsiAg==",
                'usercode' : usercode,
                'secretCode' : secretCode,
                "resrvStime" : `${route.params.year}${route.params.month}${route.params.day}${route.params.startTime}`,
                "resrvEtime" : `${route.params.year}${route.params.month}${route.params.day}${route.params.endTime}`
            });
            console.log(`Got the response!`);
            console.log(response.data);
            // let sTime = route.params.startTime.substring(0,2);
            // if(sTime[0] == '0'){
            //     sTime = sTime[1];
            // }
            // let eTime = route.params.endTime.substring(0,2);
            // if(eTime[0] == '0'){
            //     eTime = eTime[1];
            // }
            let rCode = response.data.returnCode.substring(6);
            // TODO: Add Memo from the route.params
            // navigation.navigate('Reserved', {
            //     dateString: route.params.dateString,
            //     startTime: `${sTime}:00 ${sTime > 11 ? "PM" : "AM"}`,
            //     endTime: `${eTime}:00 ${eTime > 11 ? "PM" : "AM"}`,
            //     qrCode: code
            // });
            return {
                dateString: route.params.dateString,
                startTime: `${sTime}:${route.params.startTime.charAt(2)}0 ${sTime > 11 ? "PM" : "AM"}`,
                endTime: `${eTime}:${route.params.endTime.charAt(2)}0 ${eTime > 11 ? "PM" : "AM"}`,
                resrvCode: rCode
            };
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }

    const getQrCode = async (qr) => {
        try{
            console.log("Attempting to get QrCode link...");
            // console.log(route.params.qrCode);
            const response = await axios.post('http://112.221.94.101:8980/getQrcode', {
                // resrvCode: qr,
                // resrvCode: "21D7E4B9B8C840F-6dda0e6d111e4f"
                resrvCode: "techno100010001-V43sA98ETO2F07",
                usercode: "1234",
                secretCode: "anything"
            });
            console.log(`Got the response!`);
            // console.log(response.data);
            // console.log(typeof(response.data));
            return response.data;
           
        } catch (err) {
            console.log(err);
            return 'Error';
        }
    }

    useEffect(() => {
        getUserId()
    },[usercode,secretCode])

    return (
        <SafeAreaView style={{ flex: 1 }}>
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
                                <Text style={styles.valueStyle}>{route.params.totalCost}원</Text>
                            </View>
                        </View>
                        <View style={styles.infoRowStyle}>
                            <Text style={styles.subTitleStyle}>쿠폰</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(!modalVisible);
                                }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.valueStyle}>사용 가능 쿠폰 {'2'}장 </Text>
                                    <MaterialCommunityIcons name="greater-than" size={18} color="#6C6C6C" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.line}/>
                    
                    <View style={styles.infoRowStyle}>
                            <Text style={styles.subTitleStyle}>결제 금액 (vat포함)</Text>
                            <View style={{marginRight: 4}}>
                                <Text style={styles.valueStyle}>{route.params.totalCost}원</Text>
                            </View>
                    </View>
                    
                    <View style={styles.termsStyle}>
                        <Text style={styles.titleStyle}>결제약관</Text>
                        <View style={styles.termBox}>
                            {/* <ScrollView
                                // persistentScrollbar={true}
                            >    */}
                            <ScrollView
                                // style={{borderWidth: 1, borderColor: 'black'}}
                                persistentScrollbar={true}
                                nestedScrollEnabled={true}
                            >
                                <View style={{ paddingHorizontal: 10 }}>
                                    <Image
                                        style={styles.imageStyle}
                                        source={require('../../assets/testTerms.jpeg')}
                                    />
                                </View>
                            </ScrollView>
                               
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <CheckBox
                                disabled={false}
                                value={toggleCheckBox}
                                onValueChange={(newValue) => {
                                    setErrorMessageB("");
                                    setChecked(newValue);
                                    setToggleCheckBox(newValue);
                                }}
                            />
                            <Text style={styles.termsCaption}>이용약관 및 개인정보 처리방침에 동의합니다.</Text>
                        </View>

                        <View style={styles.errorBox}>
                            {errorMessageB ? <Text style={styles.errorMessage}>{errorMessageB}</Text> : <Text style={styles.errorMessage}></Text>}
                        </View>
                    </View>

                    <View>
                        <Text style={styles.titleStyle}>결제수단 선택</Text>
                        <TouchableOpacity
                            style={[styles.openButton, checked ? styles.valid : styles.invalid]}
                            onPress={ async () => {
                                if(checked){
                                    // await getUserId();
                                    const res = await makeReservation(sTime, eTime);
                                    console.log(res);
                                    // const qr = await getQrCode(res.qrCode);
                                    // console.log(qr);
                                    navigation.navigate('Reserved', {
                                        dateString: res.dateString,
                                        startTime: res.startTime,
                                        endTime: res.endTime,
                                        resrvCode: res.resrvCode,
                                        weekDay: route.params.weekDay,
                                        roomName: route.params.roomName
                                    });
                                }
                                else{
                                    setErrorMessageB("계속 진행하려면 이용 약관을 읽고 동의해야 합니다.");
                                }

                                
                            }}
                        >
                            <Text style={styles.textStyle}>예약하기</Text>
                        </TouchableOpacity>
                    </View>
                
                    <Modal 
                        isVisible={modalVisible}
                        backdropTransitionOutTiming={0}
                        style={styles.modal}
                    >
                        <View style={styles.modalBox}>
                            <View style={styles.modalBar}>
                                <View style={styles.barSides}></View>
                                <View style={{justifyContent: 'center'}}>
                                    <Text style={styles.barText}>보유쿠폰</Text>
                                </View>
                                <View style={styles.barSides}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                        }}
                                    >
                                        <View style={{borderWidth: 0, borderColor: 'white'}}>
                                            <Feather name="x" size={23} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.couponView}>
                                <View style={styles.couponBox}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            
                                        }}
                                    >
                                        <View style={styles.coupon}>
                                            <Text style={styles.couponText}>Welcome 쿠폰 20%할인 (최대5천원)</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {

                                        }}
                                    >
                                        <View style={styles.coupon}>
                                            <Text style={styles.couponText}>단골 쿠폰 2,000원 할인</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {

                                        }}
                                    >
                                        <View style={styles.coupon}>
                                            <Text style={styles.couponText}>Time 쿠폰 오전 2,000원 할인</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                        }}
                                    >
                                        <View style={styles.applyButton}>
                                            <Text style={styles.applyText}>적용하기</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>

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
        width: 120
    },
    rowStyle: {
        flexDirection: 'row',
        paddingLeft: 3,
        paddingBottom: 4,
        justifyContent: 'space-between',
        width: 200
    }, 
    infoStyle: {
        paddingBottom: 5
    },
    infoRowStyle: {
        flexDirection: 'row',
        paddingLeft: 3,
        justifyContent: 'space-between',
        paddingBottom: 4
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
        paddingTop: 9,
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
        alignSelf: 'center',
        // backgroundColor: "gray",
        borderRadius: 15,
        marginTop: 10,
        paddingVertical: 30,
        paddingHorizontal: 130,
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
});


export default PaymentScreen;