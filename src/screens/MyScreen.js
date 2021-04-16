import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Image, Button, Alert, TouchableOpacity, ScrollView, } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';
import { useEffect } from 'react';

import * as SQLite from 'expo-sqlite';

import { SafeAreaView } from 'react-native-safe-area-context';

const MyScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const [usercode, setUsercode] = useState("");
	const [secretCode, setSecretCode] = useState("");
    const [couponNum, setCouponNum] = useState(0);

    const db = SQLite.openDatabase('db.db');

    console.log("Entered MyScreen. Params: ");
    console.log(route.params);

    const getUserId = async () => {
        // console.log("in getuserID");
        try{
            await db.transaction(async (tx)=>{
            tx.executeSql(
                `select * from UserId order by _id desc;`,
                [],
                (tx, results) =>{
                // console.log("doing getUserId");
                // console.log('SELECT DDDDD :: ', results)
                            setUsercode(results.rows.item(0).usercode)
                            setSecretCode(results.rows.item(0).secretCode)
                }
            )
            })
        } catch (err){
            console.log(err);
        }
    }

    const getMyInfo = async () => {
        try{
            console.log("Attempting to get user info...");
            const response = await axios.post('http://112.221.94.101:8980/myInfo', {
                usercode: usercode,
                securityKey: secretCode
            });
            console.log(`Got the response!`);
            console.log(response.data);
            setCouponNum(response.data.couponCnt);
            return response.data;
           
        } catch (err) {
            console.log(err);
            return 'Error';
        }
    } 

    useEffect(() => {
        getUserId();
        getMyInfo();
    },[usercode, secretCode, couponNum])

    console.log(couponNum);

    return (    
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8' }}>
            <ScrollView>
                <View style={styles.viewStyle}>
                    <View style={styles.infoHeader}>
                        <Text style={styles.headerText}>회원정보</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <View style={styles.infoTitle}>
                            <View style={styles.infoTextBox}>
                                <Text style={styles.infoText}>핸드폰 번호</Text>
                            </View>
                            <Text style={styles.infoText}>내 쿠폰 확인</Text>
                        </View>
                        <View style={styles.infoValue}>
                            <View style={styles.infoTextBox}>
                                <Text style={styles.infoText}>{usercode.substring(0,3) + "-" + usercode.substring(3,7) + "-" + usercode.substring(7)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.infoText}>{couponNum}개</Text>
                                <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.csHeader}>
                        <Text style={styles.headerText}>고객센터</Text>
                    </View>

                    <View style={styles.csBox}>
                        <View style={styles.infoTitle}>
                            <View style={styles.infoTextBox}>
                                <Text style={styles.infoText}>1:1 문의</Text>
                            </View>
                            <Text style={styles.infoText}>전화문의</Text>
                        </View>
                        <View style={styles.infoValue}>
                            <View style={styles.infoTextBox}>
                                <View style={{ flexDirection: 'row'}}>
                                    <Text style={styles.infoText}></Text>
                                    <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row'}}>
                                    <Text style={styles.infoText}></Text>
                                    <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.miscBox}>
                        <Text style={styles.version}>버전정보 V 1.0</Text>
                        <Text style={styles.terms}>약관 및 정책</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <View style={styles.subView}>
                                <Text style={styles.subTerms}>서비스 이용약관</Text>
                                <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <View style={styles.subView}>
                                <Text style={styles.subTerms}>개인정보 취급 방침</Text>
                                <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <View style={styles.subView}>
                                <Text style={styles.subTerms}>전자 금융 거래 약관</Text>
                                <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Modal 
                        isVisible={modalVisible}
                        backdropTransitionOutTiming={0}
                        style={styles.modal}
                    >
                        
                        
                    </Modal>
                    
                </View>
            </ScrollView>
        </SafeAreaView> 
    );
}

const styles = StyleSheet.create({ 
    viewStyle: {
        
    },
    infoHeader: {
        marginTop: 60,
        marginLeft: 20,
    },
    csHeader:{
        marginTop: 40,
        marginLeft: 20,
    },
    headerText: {
        fontSize: 17,
    },
    infoBox: {
        marginTop: 17,
        marginHorizontal: 25,
        borderRadius: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#B6B6B6'
    },
    infoTitle: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10
    },
    infoValue: {
        flex: 2,
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10
    },
    infoText: {
        marginVertical: 8,
        marginLeft: 10
    },
    couponIcon: {
        marginVertical: 8,
        marginTop: 10,
        marginLeft: 10
    },
    infoTextBox: {
        borderBottomWidth: 1,
        borderColor: '#B6B6B6'
    },
    csBox: {
        marginTop: 17,
        marginHorizontal: 25,
        borderRadius: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#B6B6B6'
    },
    miscBox: {
        marginTop: 50,
        marginHorizontal: 25,
        borderWidth: 1,
        borderColor: '#B6B6B6',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    version: {
        marginBottom: 10,
        fontSize: 13
    },
    terms: {
        marginBottom: 5,
        fontSize: 13
    },
    subView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 3
    },
    subTerms: {
        marginLeft: 20,
        fontSize: 13,
        marginBottom: 5
    }
});

export default MyScreen;