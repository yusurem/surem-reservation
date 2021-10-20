import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, BackHandler, Alert, Image, FlatList, NativeModules, Button } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen';
import { useFocusEffect } from '@react-navigation/native';
import { URL, TERMS } from '../constants';
import * as SQLite from 'expo-sqlite';

import { Feather } from '@expo/vector-icons'; 
import Modal from 'react-native-modal';
import CheckBox from '@react-native-community/checkbox';
import IosCheckBox from '../components/IosCheckBox';
import FootHeader from '../components/FootHeader';

const db = SQLite.openDatabase("db.db");

const SignUpConfirmScreen = ({ navigation, route }) => {
    console.log("Entered SignUpConfirmScreen. Params: ");
    console.log(route.params);
    const [isCheckAcceptedTerm, setIsCheckAcceptedTerm] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const secretCode = useRef(null)

    const checkHandler = (newValue) => {
        setModalVisible(!isCheckAcceptedTerm);
        // console.log(isCheckAcceptedTerm)
        if(isCheckAcceptedTerm){
            setIsCheckAcceptedTerm(!isCheckAcceptedTerm);
        }
    }

    const exitModal = () => {
        setModalVisible(!modalVisible);
        setIsCheckAcceptedTerm(!isCheckAcceptedTerm)
    }

    const joinMember = async () => {
        try{
            console.log("Attempting to sign up user...");
            // console.log(route.params.usercode);
            // console.log(route.params.username);
            const response = await axios.post( URL + '/joinMember', {
                usercode: route.params.usercode,
                userpass: route.params.usercode,
                username: route.params.username,
                userCallphone: route.params.loginType === 'google' ? 'n/a' : route.params.usercode,
            });

            console.log(`Got the response to register user!`);
            console.log(response.data);

            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                Alert.alert("회원가입에 문제가 생겼습니다. 잠시후 다시 시도해주세요.");
                return response.data.returnCode;
            }
            
            secretCode.current = response.data.secretCode;
            return response.data.returnCode;

        } catch (err) {
            console.log(err);
            Alert.alert("회원가입에 문제가 생겼습니다. 잠시후 다시 시도해주세요.");
            return 'Error';
        }
    }


    db.transaction(tx=>{
        tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT, username TEXT, loginType TEXT);')
      })

    const saveUserId = async () => {
        // console.log("[TableScreen]:: Inserting into SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                            "INSERT INTO UserId (secretCode, usercode, username, loginType) VALUES(?,?,?,?);", 
                            [secretCode.current, route.params.usercode, route.params.username, route.params.loginType],
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f8" }} edges={['top', 'left', 'right']}>
            <View style={styles.mainBox}>
                <View style={styles.titleBox}>
                    <Text style={styles.titleText}>회원가입</Text>
                    <Text style={styles.subtext}>회원가입을 위한 정보를 다시 한번 확인해주세요.</Text>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <View style={styles.infoTitleBox}>
                            <Text style={styles.asterisk}>*</Text>
                            <Text style={styles.infoTitle}> 이름</Text>
                        </View>
                        <View style={styles.infoInput}>
                            <Text style={styles.infoText}>{route.params.username}</Text>
                        </View>
                    </View>
                    <View style={styles.infoBox}>
                        <View style={styles.infoTitleBox}>
                            <Text style={styles.asterisk}>*</Text>
                            {route.params.loginType === 'google' ?
                                <Text style={styles.infoTitle}> 이메일</Text>
                                :
                                <Text style={styles.infoTitle}> 휴대폰번호</Text>
                            }
                        </View>
                        <View style={styles.infoInput}>
                            <Text style={styles.infoText}>{route.params.usercode}</Text>
                        </View>
                    </View>

                    <View style={styles.line} />
                </View>
                
                <TouchableOpacity 
                    style={styles.termBox}
                    onPress={() => {
                        setModalVisible(!isCheckAcceptedTerm);
                        setIsCheckAcceptedTerm(!isCheckAcceptedTerm);
                    }}
                >
                    {Platform.OS === 'android' ? 
                        <CheckBox
                            style={{
                               
                            }}
                            disabled={false}
                            value={isCheckAcceptedTerm}
                            onValueChange={(newValue) => {
                                setModalVisible(!isCheckAcceptedTerm);
                                setIsCheckAcceptedTerm(newValue)
                            }
                        }  
                        />
                    :
                        <IosCheckBox 
                            value={isCheckAcceptedTerm}
                            onChange={checkHandler}
                        /> 
                    }
                    <Text style={styles.termAgreeText}>이용약관 및 개인정보 처리방침 동의</Text>
                    <Text style={styles.redAgreeText}> (필수)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.signUpButton, { backgroundColor: isCheckAcceptedTerm ? '#404757' : '#BBBEC5'}]}
                    onPress={async () => {
                        if(!isCheckAcceptedTerm){
                            Alert.alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
                        }
                        else{
                            var res = await joinMember();
                            if(res === 'E0000'){
                                res = await saveUserId();
                                if(res === "success"){
                                    // navigation.navigate("Tab");
                                    navigation.navigate('Tab', {
                                        screen: 'Reserve', params: {
                                            screen: 'Branch'
                                        }
                                    });
                                }
                            }
                        }
                    }}
                >
                    <Text style={styles.signUpText}>회원가입</Text>
                </TouchableOpacity>
                

            </View>
            <Modal 
                isVisible={modalVisible}
                backdropTransitionOutTiming={0}
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
                            style={styles.cancelIcon}
                        >
                            <Feather name="x" size={35} color="gray" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalTerms}>
                        <Text style={styles.modalSubHeader}>
                            이용 약관 및 동의 사항
                        </Text>
                        <ScrollView
                            // style={{borderWidth: 1, borderColor: 'black'}}
                            persistentScrollbar={true}
                            nestedScrollEnabled={true}
                            style={styles.modalTermView}
                        >
                            <Text style={styles.modalTermsText}>
                                { TERMS.SERVICE.term }
                                { TERMS.INFO.term }
                                { TERMS.FINANCIAL.term}
                            </Text>
                            
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                                setIsCheckAcceptedTerm(true);
                            }}
                            >
                            <Text style={styles.buttonText}>동의하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <FootHeader />

        </SafeAreaView>
    );
}
    

const styles = StyleSheet.create({
    mainBox: {
        // alignItems: 'center',
        flex: 1
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
        // alignItems: 'stretch',
        marginHorizontal: 30,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    infoTitleBox: {
        flexDirection: 'row',
        // marginRight: 10
        width: 80
    },
    asterisk: {
        color: 'red',
        fontSize: 12
    },
    infoTitle: {
        color: '#454545',
        // borderWidth: 1,
        // borderColor: 'blue',
        fontSize: 12,
        // marginTop: 1.5
    },
    infoInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C7C7C8',
        borderRadius: 10,
        flex: 1,
        paddingVertical: 10,
        justifyContent: "center"
    },
    infoText: {
        fontSize: 12,
        marginLeft: 10
    },
    line: {
        marginTop: 30,
        borderTopWidth: 1,
        borderColor: '#C7C7C8',
    },
    termBox: {
        marginHorizontal: 30,
        // borderWidth: 1,
        // borderColor: 'blue',
        flexDirection: 'row',
        // paddingLeft: 5,
        marginTop: 10,
        alignItems: 'center'
    },
    termAgreeText: {
        color: '#454545',
        fontSize: 11,
    },
    redAgreeText: {
        color: 'red',
        fontSize: 11,
        fontWeight: 'bold'
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
    cancelIcon: {
        justifyContent: 'center',
        marginRight: 3,
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
    acceptBtn: {
        marginTop:'10%',
        height: 35,
        width: '70%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#404757',
        borderRadius: 10,
        alignSelf:'center'
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        width: 100,
    },
    signUpButton: {
        // backgroundColor: '#404757',
        height: 60,
        marginHorizontal: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginTop: 35
    },
    signUpText: {
        fontSize: 16,
        color: 'white'
    },
    footerBox: {

    },
});

export default SignUpConfirmScreen;