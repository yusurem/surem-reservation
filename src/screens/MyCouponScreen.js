import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, FlatList, Alert, TextInput, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons'; 

import { SafeAreaView } from 'react-native-safe-area-context';
import { URL } from '../constants';

const MyCouponScreen = ({ navigation, route }) => {
    const [couponList, setCouponList] = useState([]);
    const [errorMessageA, setErrorMessageA] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);

    console.log("Entered MyCouponScreen. Params: ");
    console.log(route.params);

    const getCouponList = async () => {
        try{
            console.log("Attempting to retreive list of coupons...");
            console.log("usercode: " + route.params.userCode);
            console.log("securityKey: " + route.params.secretCode);
            const response = await axios.post( URL + '/getCouponList', {
                usercode: route.params.usercode,
                securityKey: route.params.secretCode
            });
            console.log(response.data);
           
            if(response.data.returnCode === "E1001"){
                setIsEmpty(true);
                console.log("[getCouponList]: no coupons for user");
                return "Empty";
            }
            else if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                // add an alert for error in retrieving coupons
                return 'Error';
            }
            console.log("Coupon list API call successful!");
            // setCouponList(response.data.coupons);
            setCouponList(response.data.coupons);
            setApiCalled(true);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    useEffect(() => {
        getCouponList();
    },[route.params.userCode]);

    const CouponItem = ({ item, onPress, bdColor }) => {
        return (
            <View
                style={[styles.coupon]}
            >
                <Text style={[styles.couponText]}>[{item.adminCompanyName}점] {item.couponName}</Text>
                {item.couponType === "P" ? <Text style={styles.couponText}>{item.minPrice === 'null' ? "" : `${item.minPrice}원 이상 결제시 `}{item.couponDCPrice}원 할인</Text> : null} 
                {item.couponType === "R" ? <Text style={styles.couponText}>{item.couponDCRate}%할인</Text> : null}
                {item.couponType === "F" ? <Text style={styles.couponText}>무료 쿠폰</Text> : null}
                <Text style={styles.couponDate}>{item.endDay === 'null' ? "기한 없음" : `${item.endDay.substring(0,4)}.${item.endDay.substring(4,6)}.${item.endDay.substring(6)} 까지`}</Text>
            </View>
        );
    }

    const renderCoupons = ({ item, index }) => {
        return (
            <CouponItem 
                item={item} 
            />
        );
    }
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8'}} edges={['right', 'left', 'top']}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>내 쿠폰 확인</Text>
            </View>

            <View style={styles.couponBox}>
                {!apiCalled ?
                    <ActivityIndicator size="large" color="gray"/>
                    :
                    isEmpty ?
                        <Text>쿠폰이 없습니다.</Text>
                        :
                        <FlatList
                            data={couponList}
                            keyExtractor={(item, index) => item.idx}
                            renderItem={renderCoupons}
                        />
                }
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        marginTop: 50,
        marginHorizontal: 25,
    },
    headerText: {
        fontSize: 18,
    },
    couponBox: {
        marginVertical: 10,
        marginHorizontal: 25,
        flex: 1,
    },
    coupon: {
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: "#C9C9C9",
        paddingVertical: 15,
        marginBottom: 10
    },
    couponText: {
        // textAlign: 'center'
        marginLeft: 20,
        color: '#5F5F5F',
        marginBottom: 5,
    },
    couponDate: {
        marginLeft: 20,
        color: '#A3A3A3',
    },
});

export default MyCouponScreen;