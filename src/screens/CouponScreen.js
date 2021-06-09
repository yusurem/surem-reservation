import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image, Alert, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons'; 
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';
import { URL } from '../constants';

const CouponScreen = ({ navigation, route }) => {
    const [errorMessageA, setErrorMessageA] = useState("");
    const [couponList, setCouponList] = useState([]);

    console.log("Entered CouponScreen. Params: ");
    console.log(route.params);

    const getCouponList = async () => {
        try{
            console.log("Attempting to retreive list of coupons...");
            console.log("usercode: " + route.params.userCode);
            console.log("securityKey: " + route.params.secretCode);
            const response = await axios.post( URL + '/getCouponList', {
                usercode: route.params.userCode,
                securityKey: route.params.secretCode
            });
            console.log(response.data);
           
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                // add an alert for error in retrieving coupons
                return 'Error';
            }
            console.log("Coupon list API call successful!");
            setCouponList(response.data.coupons);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    const tempData = [
        {
            "couponName": "웰컴쿠폰",
            "couponCode": "3",
            "status": "E",
            "startDay": "20210419",
            "endDay": "20210503"
        },
        {
            "couponName": "웰컴쿠폰",
            "couponCode": "3",
            "status": "Y",
            "startDay": "20210608",
            "endDay": "20210622"
        }
    ];

    useEffect(() => {
        getCouponList();
    },[route.params.userCode]);

    const CouponItem = ({ item, onPress }) => {
        return (
            <TouchableOpacity
                style={styles.coupon}
                onPress={onPress}
            >
                <Text style={styles.couponText}>{item.couponName}</Text>
            </TouchableOpacity>
        );
    }

    const renderCoupons = ({ item, index }) => {
        return (
            <CouponItem 
                item={item} 
                onPress={() => {

                }}
            />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['right', 'left', 'top']} >
            <View>
                <View style={styles.barBox}>
                    <View style={[styles.barIcon, { marginLeft: 10 }]}>
                    </View>
                    <Text style={styles.barText}>보유쿠폰</Text>
                    <TouchableOpacity
                        style={[styles.barIcon, { marginRight: 10 }]}
                        onPress={() => {
                            navigation.navigate("Payment");
                        }}
                    >
                        <MaterialIcons name="cancel" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.priceBox}>
                <Text style={styles.costText}>가격: {route.params.totalCost}원</Text>
                <Text style={styles.discountText}>할인: {-100}원</Text>
                <Text style={styles.totalCost}>총 결제 금액: {parseInt(route.params.totalCost) - 100}원</Text>
            </View>

            <View style={styles.couponBox}>
                <FlatList
                    data={tempData}
                    keyExtractor={(item, index) => item.couponCode + index}
                    renderItem={renderCoupons}
                />
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {

                    }}
                >
                    <Text style={styles.applyButtonText}>적용하기</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    barBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#4682D8',
        paddingVertical: 10,
    },
    barText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    barIcon: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: 30, 
        // borderWidth: 1, 
        // borderColor: 'red'
    },
    priceBox: {
        alignItems: 'center',
        // justifyContent: 'center',
        marginHorizontal: 100,
        marginTop: 30,
    },
    costText: {
        marginBottom: 5,
    },
    discountText: {
        marginBottom: 5,
        color: '#E64343',
        fontWeight: 'bold',
    },
    totalCost: {
        fontWeight: 'bold'
    },
    couponBox: {
        justifyContent: 'center',
        // alignItems: 'center',
        marginVertical: 30,
        marginHorizontal: 20
    },
    coupon: {
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        paddingVertical: 20,
        marginBottom: 10
    },
    couponText: {
        textAlign: 'center'
    },
    applyButton: {
        borderRadius: 20,
        backgroundColor: '#333333',
        paddingVertical: 20,
    },
    applyButtonText: {
        color: 'white',
        textAlign: 'center'
    }

});


export default CouponScreen;