import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform, Alert, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import { MaterialIcons, Octicons, FontAwesome5 } from '@expo/vector-icons'; 
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';
import { URL } from '../constants';
import moment from 'moment-timezone';

const CouponScreen = ({ navigation, route }) => {
    const windowWidth = useWindowDimensions().width;
    // const windowHeight = useWindowDimensions().height;

    const [errorMessageA, setErrorMessageA] = useState("");
    const [couponList, setCouponList] = useState([]);
    const [numValid, setNumValid] = useState(0);
    const [isEmpty, setIsEmpty] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    // const [validCoupons, setValidCoupons] = useState([]);
    // const [invalidCoupons, setInvalidCoupons] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(route.params.couponIdx !== undefined ? route.params.couponIdx : null);
    const [discount, setDiscount] = useState(route.params.discount !== undefined ? route.params.discount : 0);
    const [couponCode, setCouponCode] = useState(route.params.couponCode !== undefined ? route.params.couponCode : "");
    const [couponIdx, setCouponIdx] = useState(route.params.couponIdx !== undefined ? route.params.couponIdx : "");

    const [availCoupons, setAvailCoupons] = useState([]);
    const [unavailCoupons, setUnavailCoupons] = useState([]);

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
            sortCoupons(response.data.coupons);
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

    const sortCoupons = (coupons) => {
        // [status] Y- useable, N- halted, D- deleted, U- used
        const avails = [];
        const unavails = [];
        for(var i = 0; i < coupons.length; i++){
            // Check Status if it is Y
            if(coupons[i].status !== 'Y'){
                // console.log("status not Y");
                unavails.push(coupons[i]);
                continue;
            }
            // Check if Time Range Match
            if(coupons[i].startTime !== "null"){
                var start = moment(coupons[i].startTime, 'hhmmss');
                var end = moment(coupons[i].endTime, 'hhmmss');
                var now = moment(); 
                if(!now.isBetween(start, end)){
                    // console.log("time wrong");
                    unavails.push(coupons[i]);
                    continue;
                }
            }

            // Check if 지점 is right
            if(coupons[i].adminCode !== route.params.adminCode){
                unavails.push(coupons[i]);
                continue;
            }

            // Check if weekday is valid
            if(coupons[i].couponDay === "weekend"){
                if(route.params.weekDay !== 0 && route.params.weekDay !== 6){
                    unavails.push(coupons[i]);
                    continue;
                }
            }
            else if(coupons[i].couponDay === "holiday"){
                if(route.params.weekDay === 0 || route.params.weekDay === 6){
                    unavails.push(coupons[i]);
                    continue;
                }
            }

            // MinPrice
            if(coupons[i].minPrice !== "null"){
                // If there is a minPrice, check if cost is at least that much
                if(route.params.totalCost <= parseInt(coupons[i].couponDCPrice)){
                    // console.log("price too low");
                    unavails.push(coupons[i]);
                    continue;
                }
            }
            // else{
            //     // Minprice is null but the coupontype is "P" so have to check if cost is greater than discount
            //     if(coupons[i].couponType === 'P'){
            //         if(route.params.totalCost < parseInt(coupons[i].couponDCPrice)){
            //             // console.log("price too low P");
            //             unavails.push(coupons[i]);
            //             continue;
            //         }
            //     }
            // }


            //check adminCode to see if it matches and if not take it out of avaialble couposn
            avails.push(coupons[i]);
        }
        setCouponList([...avails, ...unavails]);
        setAvailCoupons(avails);
        setUnavailCoupons(unavails);
        setNumValid(avails.length);
        // setValidCoupons(avails);
        // setInvalidCoupons(unavails);
    }

    // have to take into minPrice into consideration
    const CouponItem = ({ item, onPress, bdColor }) => {
        return (
            <TouchableOpacity
                style={[styles.coupon, { borderColor: bdColor }]}
                onPress={onPress}
            >
                <Text style={[styles.couponText]}>[{item.adminCompanyName}점] {item.couponName}</Text>
                {item.couponType === "P" ? <Text style={styles.couponText}>{item.minPrice === 'null' ? `${item.couponDCPrice}원 초과 결제시 ` : `${item.minPrice}원 이상 결제시 `}{item.couponDCPrice}원 할인</Text> : null} 
                {item.couponType === "R" ? <Text style={styles.couponText}>{item.couponDCRate}%할인</Text> : null}
                {item.couponType === "F" ? <Text style={styles.couponText}>무료 쿠폰</Text> : null}
                <Text style={styles.couponDate}>{item.endDay === 'null' ? "기한 없음" : `${item.endDay.substring(0,4)}.${item.endDay.substring(4,6)}.${item.endDay.substring(6)} 까지`}</Text>
            </TouchableOpacity>
        );
    }

    const NACoupon = ({ item }) => {
        return (
            <View style={styles.naCoupon}>
                <Text style={styles.couponText}>[{item.adminCompanyName}점] {item.couponName}</Text>
                {item.couponType === "P" ? <Text style={styles.couponText}>{item.minPrice === 'null' ? `${item.couponDCPrice}원 초과 결제시 ` : `${item.minPrice}원 이상 결제시 `}{item.couponDCPrice}원 할인</Text> : null} 
                {item.couponType === "R" ? <Text style={styles.couponText}>{item.couponDCRate}%할인</Text> : null}
                {item.couponType === "F" ? <Text style={styles.couponText}>무료 쿠폰</Text> : null}
                <Text style={styles.couponDate}>{item.endDay === 'null' ? "기한 없음" : `${item.endDay.substring(0,4)}.${item.endDay.substring(4,6)}.${item.endDay.substring(6)} 까지`}</Text>
            </View>
        );
    }

    const renderAvailCoupons = ({ item, index }) => {
        const borderColor = item.idx === selectedIndex ? "#0070C0" : '#C9C9C9';

        return (
            <CouponItem 
                item={item} 
                bdColor={borderColor}
                onPress={() => {
                    if(item.idx === selectedIndex){
                        setSelectedIndex(null);
                        setDiscount(0);
                        setCouponIdx("");
                        setCouponCode("");
                    }
                    else{
                        setSelectedIndex(item.idx);
                        // [CouponType] F- free, P- price, R- rate
                        if(item.couponType === 'P'){
                            if(parseInt(item.couponDCPrice) > route.params.totalCost){
                                setDiscount(route.params.totalCost);
                            }
                            else{
                                setDiscount(item.couponDCPrice);
                            }
                            // setDiscount(parseInt(item.couponDCPrice));
                            setCouponIdx(item.idx);
                            setCouponCode(item.couponCode);
                        }
                        else if(item.couponType === 'R'){
                            setDiscount(Math.ceil((parseInt(item.couponDCRate) / 100) * route.params.totalCost));
                            setCouponIdx(item.idx);
                            setCouponCode(item.couponCode);
                        }
                        else if(item.couponType === 'F'){
                            setDiscount(route.params.totalCost);
                            setCouponIdx(item.idx);
                            setCouponCode(item.couponCode);
                        }
                    }
                }}
            />
        );
    }

    const renderUnavailCoupons = ({ item, index }) => {
        return (
            <NACoupon item={item} />
        )
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
                <View style={{ width: windowWidth * 0.25 }}>
                    <Text style={[styles.costText, { fontSize: 13 }]}>이용금액</Text>
                    <Text style={[styles.costText, { fontSize: 18 }]}>{route.params.totalCost.toLocaleString()}원</Text>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.costText, { fontSize: 13 }]}></Text>
                    <FontAwesome5 name="minus" size={19} color="black" />
                </View>

                <View style={{ width: windowWidth * 0.25 }}>
                    <Text style={[styles.discountText, { fontSize: 13 }]}>할인금액</Text>
                    <Text style={[styles.discountText, { fontSize: 18 }]}>{discount.toLocaleString()}원</Text>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.costText, { fontSize: 13 }]}></Text>
                    <FontAwesome5 name="equals" size={19} color="black" />
                </View>

                <View style={{ width: windowWidth * 0.25 }}>
                    <Text style={[styles.costText, { fontSize: 13 }]}>결제금액</Text>
                    <Text style={[styles.costText, { fontSize: 18 }]}>{parseInt(route.params.totalCost) - discount > 0 ?  
                                                                Math.floor(parseInt(route.params.totalCost) - discount).toLocaleString()
                                                                :
                                                                0 }원</Text>
                </View>
            </View>

            <View style={styles.couponBox}>
                {!apiCalled ?
                    <View style={{ marginBottom: 20 }}>
                        <ActivityIndicator size="large" color="gray"/>
                    </View>
                    :
                    isEmpty ? 
                        <Text style={{textAlign: 'center', textAlignVertical: 'center'}}>쿠폰이 없습니다.</Text>
                        :
                        <ScrollView style={{ flex: 1 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.couponHeader}>사용 가능한 쿠폰</Text>
                                {availCoupons.length == 0 ?
                                    <Text style={{ textAlign: 'center', marginVertical: 15}}>사용 가능한 쿠폰이 없습니다.</Text>
                                    :
                                    <FlatList
                                        // data={validCoupons}
                                        data={availCoupons}
                                        keyExtractor={(item, index) => item.idx}
                                        renderItem={renderAvailCoupons}
                                        extraData={selectedIndex}
                                        scrollEnabled={false}
                                    />
                                }
                                
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.couponHeader}>사용 불가한 쿠폰</Text>
                                <FlatList
                                    // data={validCoupons}
                                    data={unavailCoupons}
                                    keyExtractor={(item, index) => item.idx}
                                    renderItem={renderUnavailCoupons}
                                    scrollEnabled={false}
                                />
                            </View>
                        </ScrollView>
                        
                }
            </View>
            <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {
                        navigation.navigate("Payment", {
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
                            discount: discount === 0? undefined : discount,
                            couponIdx: selectedIndex,
                            couponCode: couponCode,
                            location: route.params.location,
                            address: route.params.address,
                        });
                    }}
                >
                    <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 30,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    costText: {
        // marginBottom: 5,
        marginHorizontal: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    discountText: {
        // marginBottom: 5,
        marginHorizontal: 5,
        color: '#E64343',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    couponBox: {
        justifyContent: 'center',
        // alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        marginHorizontal: 20,
        flex: 1
    },
    couponHeader: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 15,
        marginLeft: 10,
        marginVertical: 5
    },
    coupon: {
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        // borderColor: 'gray',
        paddingVertical: 20,
        marginBottom: 10
    },
    naCoupon: {
        borderRadius: 12,
        backgroundColor: '#F2F2F2',
        borderWidth: 2,
        borderColor: '#CBCBCB',
        paddingVertical: 20,
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
    applyButton: {
        borderRadius: 12,
        backgroundColor: '#333333',
        paddingVertical: 15,
        marginHorizontal: 55,
        marginBottom: 20,
        // marginVertical: 10,
    },
    applyButtonText: {
        color: 'white',
        textAlign: 'center'
    },
});


export default CouponScreen;