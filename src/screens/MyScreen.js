import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Image, Button, Alert, TouchableOpacity, ScrollView, Linking } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; 
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import * as SQLite from 'expo-sqlite';

import { SafeAreaView } from 'react-native-safe-area-context';

const MyScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const [usercode, setUsercode] = useState("");
	const [secretCode, setSecretCode] = useState("");
    const [couponNum, setCouponNum] = useState(0);

    const phoneNumber = '15884640';

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
            console.log("usercode: " + usercode);
            console.log("secretCode: " + secretCode);
            const response = await axios.post('http://112.221.94.101:8980/myInfo', {
                usercode: usercode,
                securityKey: secretCode
            });
            console.log(`Got the response!`);
            // console.log(response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                setCouponNum("N/A");
                return;
            }
            setCouponNum(response.data.couponCnt);
            return response.data;
           
        } catch (err) {
            console.log(err);
            return 'Error';
        }
    } 

    useEffect(() => {
        getUserId();
        // getMyInfo();
    },[usercode, secretCode])

    // useEffect(() => {
    //     getMyInfo();
    // })

    useFocusEffect(() => {
        getMyInfo();
    })

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
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row' }}
                                        onPress={() => {

                                        }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.infoText}></Text>
                                            <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row'}}>
                                    <TouchableOpacity
                                        // style={{ flexDirection: 'row' }}
                                        onPress={ async () => {
                                            const url = `tel:${phoneNumber}`;
                                            const supported = await Linking.canOpenURL(url);

                                            if(supported){
                                                await Linking.openURL(url);
                                            }
                                            else {
                                                Alert.alert(`Don't know how to open this URL: ${url}`);
                                            }
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.infoText}></Text>
                                            <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" />
                                            <Text>       </Text>
                                        </View>
                                    </TouchableOpacity>          
                                </View>
                        </View>
                    </View>

                    <View style={styles.miscBox}>
                        <Text style={styles.version}>버전정보 V 1.0</Text>
                        <Text style={styles.terms}>약관 및 정책</Text>
                        <TouchableOpacity
                            onPress={() => {
                                // setModalVisible(!modalVisible);
                                Alert.alert("서비스 이용약관");
                            }}
                        >
                            <View style={styles.subView}>
                                <Text style={styles.subTerms}>서비스 이용약관</Text>
                                <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // setModalVisible(!modalVisible);
                                Alert.alert("개인정보 취급 방침");
                            }}
                        >
                            <View style={styles.subView}>
                                <Text style={styles.subTerms}>개인정보 취급 방침</Text>
                                <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // setModalVisible(!modalVisible);
                                Alert.alert("전자 금융 거래 약관");
                            }}
                        >
                            <View style={styles.subView}>
                                <Text style={styles.subTerms}>전자 금융 거래 약관</Text>
                                <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* <Modal 
                        isVisible={modalVisible}
                        backdropTransitionOutTiming={0}
                        style={styles.modal}
                    >
                        <View style={styles.modalBox}>
                            <View style={styles.modalHeader}>
                                <View style={{borderWidth: 0, borderColor: 'white'}}>
                                    <Feather name="x" size={23} color="#EDEDED" />
                                </View>
                                <Text style={styles.modalHeaderText}>이용 약관 및 정책</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                    }}
                                >
                                    <View style={{borderWidth: 0, borderColor: 'white'}}>
                                        <Feather name="x" size={23} color="#444444" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.modalTerms}>
                                <Text style={styles.modalSubHeader}></Text>
                                <ScrollView
                                    // style={{borderWidth: 1, borderColor: 'black'}}
                                    persistentScrollbar={true}
                                    nestedScrollEnabled={true}
                                >
                                    <Text style={styles.modalTermsText}>
                                        제1조(목적)
                                        이 약관은 (주)예스콜닷컴 회사(전자상거래 사업자)가 운영하는 (주)예스콜닷컴 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리•의무 및 책임사항을 규정함을 목적으로 합니다.
                                        ※「PC통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다.」
                                        제2조(정의)
                                        ① “몰”이란 (주)예스콜닷컴 회사가 재화 또는 용역(이하 “재화 등”이라 함)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.
                                        ② “이용자”란 “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
                                        ③ ‘회원’이라 함은 “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는 서비스를 이용할 수 있는 자를 말합니다.
                                        ④ ‘비회원’이라 함은 회원에 가입하지 않고 “몰”이 제공하는 서비스를 이용하는 자를 말합니다.
                                        제3조 (약관 등의 명시와 설명 및 개정)
                                    </Text>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal> */}
                    
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
        marginVertical: 6,
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
    },
    modalBox: {
        backgroundColor: '#EDEDED',
        height: 600,
        width: 300,

    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    modalHeaderText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#444444'
    },
    modalTerms: {
        padding: 15,

    },
    modalSubHeader: {
        color: 'black',
        fontSize: 16,
        marginBottom: 10,
    },
    modalTermView: {
        backgroundColor: 'white',

    },
    modalTermsText: {
        color: 'black',
        fontSize: 14
    },
});

export default MyScreen;