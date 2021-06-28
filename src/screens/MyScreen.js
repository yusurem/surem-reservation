import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ActivityIndicator, Image, Button, Alert, TouchableOpacity, ScrollView, Linking, BackHandler } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; 
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TERMS, URL, APP_VERSION } from '../constants';
// import * as RNLocalize from 'react-native-localize';
import moment from 'moment-timezone';

import * as SQLite from 'expo-sqlite';

import { SafeAreaView } from 'react-native-safe-area-context';

const MyScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const [usercode, setUsercode] = useState("");
	const [secretCode, setSecretCode] = useState("");
    const [couponNum, setCouponNum] = useState(0);

    const [serviceTerm, setServiceTerm] = useState(false);
    const [infoTerm, setInfoTerm] = useState(false);
    const [financialTerm, setFinancialTerm] = useState(false);

    const [initial, setInitial] = useState(false);

    const phoneNumber = '15884640';

    const db = SQLite.openDatabase('db.db');

    console.log("Entered MyScreen. Params: ");
    // console.log(route.params);

    useFocusEffect(() => {
        const backAction = () => {
            navigation.navigate("Home");
            return true;
        };
        
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        
        return (() => backHandler.remove());
    },);

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
            const response = await axios.post(URL+'/myInfo', {
            // const response = await axios.post('http://112.221.94.101:8980/myInfo', {
                usercode: usercode,
                securityKey: secretCode
            });
            // console.log(`Got the response!`);
            console.log(response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                setCouponNum("N/A");
                return;
            }
            setCouponNum(response.data.couponCnt);
            // setInitial(false);
            return response.data;
           
        } catch (err) {
            console.log(err);
            return 'Error';
        }
    }

    const deleteUserId = async () => {
        try{
            await db.transaction((tx)=>{
                tx.executeSql(
                    `delete from UserId;`,
                    [],
                    (tx, results) =>{
                        console.log('Deleting Users :: ',results)
                    },
                    () => {
                        // Alert.alert("탈퇴하는데 문제가 생겼습니다, 잠시후 다시 시도해주시거나 고객센터로 문의해주세요.");
                    }
                )
            })
        } catch (err) {
            console.log(err)
            Alert.alert("탈퇴하는데 문제가 생겼습니다, 잠시후 다시 시도해주시거나 고객센터로 문의해주세요.");
            return "Error"
        }
        
      }

    const quitMember = async () => {
        try{
            console.log("Attempting to quit user...");
            console.log("usercode: " + usercode);
            console.log("secretCode: " + secretCode);
            const response = await axios.post(URL + '/quitMember', {
                usercode: usercode,
                securityKey: secretCode
            });

            console.log(`Got the response for quit!`);
            console.log(response.data);

            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                return response.data.returnCode;
            }

            return response.data;

        } catch (err) {
            console.log(err);
            Alert.alert("탈퇴하는데 문제가 생겼습니다. 잠시후 다시 시도해주세요.");
            return 'Error';
        }
    }

    const exitModal = () => {
        setModalVisible(!modalVisible);
        setServiceTerm(false);
        setInfoTerm(false);
        setFinancialTerm(false);
    }

    useEffect(() => {
        getUserId();
    },[db])

    // useEffect(() => {
    //     getMyInfo();
    // },[initial])

    useFocusEffect(() => {
        // setInitial(true);
        getMyInfo();
    })

    // console.log(couponNum);

    return (    
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8' }} edges={['right', 'left', 'top']}>
            {initial ? 
                <View style={{ marginBottom: 20 }}>
                    <ActivityIndicator size="large" color="gray"/>
                </View>
                :
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
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert("쿠폰들");
                                    }}
                                >
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.infoText}>{couponNum}개</Text>
                                        <View style={{ justifyContent: 'center' }}> 
                                            <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                
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
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row' , flex: 1}}
                                            onPress={() => {
                                                navigation.navigate("Inquiry", {
                                                    usercode: usercode,
                                                    secretCode: secretCode
                                                });
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.infoText}> </Text>
                                                <MaterialCommunityIcons style={styles.askIcon} name="greater-than" size={18} color="#6C6C6C" />
                                                <View style={{ flex: 1 }}/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row'}}>
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row', flex: 1 }}
                                            onPress={ async () => {
                                                var url;
                                                if (Platform.OS === 'android') {
                                                    url = `tel:${phoneNumber}`;
                                                }
                                                else  {
                                                    url = `telprompt:${phoneNumber}`;
                                                }
                                                const supported = await Linking.canOpenURL(url);

                                                if(supported){
                                                    await Linking.openURL(url);
                                                }
                                                else {
                                                    Alert.alert(`이 URL을 읽지 못합니다: ${url}`);
                                                }
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.infoText}> </Text>
                                                <MaterialCommunityIcons style={styles.askIcon} name="greater-than" size={18} color="#6C6C6C" />
                                                <View style={{ flex: 1 }}/>
                                            </View>
                                        </TouchableOpacity>          
                                    </View>
                            </View>
                        </View>

                        <View style={styles.miscBox}>
                            <Text style={styles.version}>버전정보 V {APP_VERSION}</Text>
                            <Text style={styles.terms}>약관 및 정책</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setServiceTerm(!serviceTerm);
                                    setModalVisible(!modalVisible);
                                    // Alert.alert("서비스 이용약관");
                                }}
                            >
                                <View style={styles.subView}>
                                    <Text style={styles.subTerms}>서비스 이용약관</Text>
                                    <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setInfoTerm(!infoTerm);
                                    setModalVisible(!modalVisible);
                                    // Alert.alert("개인정보 취급 방침");
                                }}
                            >
                                <View style={styles.subView}>
                                    <Text style={styles.subTerms}>개인정보 취급 방침</Text>
                                    <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setFinancialTerm(!financialTerm);
                                    setModalVisible(!modalVisible);
                                    // Alert.alert("전자 금융 거래 약관");
                                }}
                            >
                                <View style={styles.subView}>
                                    <Text style={styles.subTerms}>전자 금융 거래 약관</Text>
                                    <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableHighlight
                            style={styles.deleteButton}
                            onPress={ async () => {
                                Alert.alert(
                                    "잠시만요!",
                                    "정말로 탈퇴하시겠습니까?", 
                                    [
                                    {
                                        text: "아니요",
                                        onPress: () => null,
                                        style: "cancel"
                                    },
                                    { text: "예", 
                                        onPress: async () => {
                                            const res = await quitMember();
                                            // erase data from sqlite database
                                            if(res.returnCode === 'E0000'){
                                                await deleteUserId();
                                                navigation.reset({
                                                    index: 0, 
                                                    routes: [
                                                        {name: 'SignUp'}
                                                    ] 
                                                });
                                            }
                                            else{
                                                Alert.alert("탈퇴하는데 문제가 생겼습니다. 잠시후 다시 시도해주세요.");
                                            }
                                        }
                                    }
                                ]);
                            }}
                        >
                            <Text style={styles.buttonText}>탈퇴하기</Text>
                        </TouchableHighlight>

                        {/* <TouchableHighlight
                            style={styles.deleteButton}
                            onPress={() => {
                                navigation.navigate("Test");
                            }}
                        >
                            <Text style={styles.buttonText}>테스트</Text>
                        </TouchableHighlight> */}
                        
                        <Modal 
                            isVisible={modalVisible}
                            backdropTransitionOutTiming={0}
                            style={styles.modal}
                            onBackButtonPress={exitModal}
                            onBackdropPress={exitModal}
                        >
                            <View style={styles.modalBox}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.cancelIcon}>
                                        <Feather name="x" size={35} color="#EDEDED" />
                                    </View>
                                    <Text style={styles.modalHeaderText}>이용 약관 및 정책</Text>
                                    <TouchableOpacity
                                        onPress={(exitModal)}
                                    >
                                        <View style={styles.cancelIcon}>
                                            <Feather name="x" size={35} color="gray" />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.modalTerms}>
                                    <Text style={styles.modalSubHeader}>
                                        {serviceTerm ? TERMS.SERVICE.title : null}
                                        {infoTerm ? TERMS.INFO.title : null}
                                        {financialTerm ? TERMS.FINANCIAL.title : null}
                                    </Text>
                                    <ScrollView
                                        // style={{borderWidth: 1, borderColor: 'black'}}
                                        persistentScrollbar={true}
                                        nestedScrollEnabled={true}
                                        style={styles.modalTermView}
                                    >
                                        <Text style={styles.modalTermsText}>
                                            {serviceTerm ? TERMS.SERVICE.term : null}
                                            {infoTerm ? TERMS.INFO.term : null}
                                            {financialTerm ? TERMS.FINANCIAL.term : null}
                                        </Text>
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>                    
                    </View>
                </ScrollView>
            }
        </SafeAreaView> 
    );
}

const styles = StyleSheet.create({ 
    viewStyle: {
        
    },
    infoHeader: {
        marginTop: 30,
        marginLeft: 20,
    },
    csHeader:{
        marginTop: 30,
        marginLeft: 20,
    },
    headerText: {
        fontSize: 17,
    },
    infoBox: {
        marginTop: 12,
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
        marginLeft: 10,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    couponIcon: {
        marginVertical: 6,
        marginTop: 7,
        marginLeft: 10,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    askIcon : {
        marginVertical: 6,
        marginTop: 8,
        marginLeft: 10
    },
    infoTextBox: {
        borderBottomWidth: 1,
        borderColor: '#B6B6B6'
    },
    csBox: {
        marginTop: 12,
        marginHorizontal: 25,
        borderRadius: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#B6B6B6'
    },
    miscBox: {
        marginTop: 40,
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
        // height: 500,
        // width: Platform.OS == 'ios' ? 350 : 280,
        borderRadius: 15,
        flex: 1,
        marginVertical: 75,
        marginHorizontal: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 0,
    },
    modalHeaderText: {
        fontSize: 17,
        textAlign: 'center',
        color: 'black',
        marginTop: 18,
    },
    modalTerms: {
        padding: 22,
        // borderWidth: 1,
        // borderColor: 'red',
        flex: 1
    },
    modalSubHeader: {
        color: 'black',
        fontSize: 14,
        marginBottom: 10,
        fontWeight: 'bold',
        marginLeft: 3,
    },
    modalTermView: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#DDDDDD',
        // height: "100%"
    },
    modalTermsText: {
        color: 'black',
        fontSize: 14,
        padding: 5,
    },
    modal: {
        alignSelf: 'center'
    },
    cancelIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginRight: 5
    },
    deleteButton: {
        backgroundColor: "#404758",
        borderRadius: 12,
        marginVertical: 20,
        paddingVertical: 12,
        elevation: 2,
        flex: 1,
        marginHorizontal: 25,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center'
    }
});

export default MyScreen;