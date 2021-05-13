import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image, Alert, TouchableOpacity, ScrollView, NestedScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';

const CouponScreen = ({ navigation, route }) => {
    const [errorMessageA, setErrorMessageA] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    console.log("Entered PaymentScreen. Params: ");
    console.log(route.params);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    var sTime = route.params.startTime.substring(0,2);
    if(sTime[0] == '0'){
        sTime = sTime[1];
    }
    var eTime = route.params.endTime.substring(0,2);
    if(eTime[0] == '0'){
        eTime = eTime[1];
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
            const response = await axios.post('http://office-api.surem.com/reservation', {
            // const response = await axios.post('http://112.221.94.101:8980/reservation', {
                'roomCode' : route.params.roomCode,
                'usercode' : 'admin1',
                "secretCode" : "4HDsKfzSR3eEegv3FiZIA30x+Z6uOccMVlw56N034vNO0FGw7aUqCA0USHdoEK9oL2vlWg==",
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
                startTime: `${sTime}:00 ${sTime > 11 ? "PM" : "AM"}`,
                endTime: `${eTime}:00 ${eTime > 11 ? "PM" : "AM"}`,
                resrvCode: rCode
            };
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }

    // TODO: get the price from API
    const getPrice = async () => {

    }

    const getQrCode = async (qr) => {
        try{
            console.log("Attempting to get QrCode link...");
            // console.log(route.params.qrCode);
            const response = await axios.post('http://office-api.surem.com/getQrcode', {
            // const response = await axios.post('http://112.221.94.101:8980/reservation', {
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

    const couponStyle = (selected, available) => {

    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
                <View style={styles.modalBox}>
                    <View style={styles.modalBar}>
                        <View style={styles.barSides}></View>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={styles.barText}>보유쿠폰</Text>
                        </View>
                        <View style={styles.barSides}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.goBack();
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
        paddingBottom: 30
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
        width: 95
    },
    rowStyle: {
        flexDirection: 'row',
        paddingLeft: 3,
        paddingBottom: 4,
        justifyContent: 'space-between',
        width: 175
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
        marginVertical: 30
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
        backgroundColor: "gray",
        borderRadius: 15,
        marginTop: 10,
        paddingVertical: 30,
        paddingHorizontal: 130,
        elevation: 2
    },
});


export default PaymentScreen;