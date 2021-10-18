import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, BackHandler, Alert, Image, FlatList, NativeModules, Button } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen';
import { useFocusEffect } from '@react-navigation/native';
import { URL } from '../constants';
import * as SQLite from 'expo-sqlite';
import FootHeader from '../components/FootHeader';

import {
    KakaoOAuthToken,
    KakaoProfile,
    getProfile as getKakaoProfile,
    login,
    logout,
    unlink,
} from '@react-native-seoul/kakao-login';
import { NaverLogin, getProfile } from "@react-native-seoul/naver-login";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';


const db = SQLite.openDatabase("db.db");

const PreSignUpScreen = ({ navigation, route }) => {

    const userToken = useRef(null);
    const userProfile = useRef(null);

    // Naver login parameters
    const iosKeys = {
        kConsumerKey: "0AaE_O2VX2PfbaHgrxIn",
        kConsumerSecret: "RvCZ7LpTeb",
        kServiceAppName: "오피스쉐어",
        kServiceAppUrlScheme: "com.surem.reservation" // only for iOS
    };
    const androidKeys = {
        kConsumerKey: "0AaE_O2VX2PfbaHgrxIn",
        kConsumerSecret: "RvCZ7LpTeb",
        kServiceAppName: "오피스쉐어"
    };
    const initials = Platform.OS === "ios" ? iosKeys : androidKeys;

    const saveUserId = async (secretCode, usercode, username, loginType) => {
        // console.log("[TableScreen]:: Inserting into SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                            "INSERT INTO UserId (secretCode, usercode, username, loginType) VALUES(?,?,?,?)", 
                            [secretCode, usercode, username, loginType],
                        (tx, results) => {
                            resolve("success");
                        },
                        (txt, error) => {
                            console.log(error);
                            reject("error");
                        }
                    )
                },
            )
        })
    }

    const handleSignUp = async (userNum, username, loginType) => {
        try{
            // delete once api is modified
            // if(loginType === 'google'){
            //     navigation.navigate("SignUpConfirm", {
            //         usercode: userNum,
            //         username: username,
            //         loginType: loginType,
            //     });
            //     return;
            // }

            console.log("Attempting to verify if user exists...");
            const response = await axios.post( URL + '/getEncryptCode', {
                usercode: userNum,
            });

            console.log(response.data);

            if(response.data.returnCode === 'E2007'){
                navigation.navigate("SignUpConfirm", {
                    usercode: userNum,
                    username: username,
                    loginType: loginType,
                });
            }
            else if(response.data.returnCode.length > 5){
                // console.log("error here!");
                const res = await saveUserId(response.data.returnCode, userNum, username, loginType);
                if(res === 'success'){
                    navigation.navigate("Tab");
                }
                else{
                    Alert.alert('로그인에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
                }
            }
            else {
                console.log("Error: " + response.data.returnCode);
                Alert.alert("서버에 문제가 생겼습니다. 잠시후 다시 시도해주세요.");
                return response.data.returnCode;
            }
            
            return 'success';

        } catch (err) {
            console.log(err);
            Alert.alert("회원가입에 문제가 생겼습니다. 잠시후 다시 시도해주세요.");
            return 'Error';
        }
    }

    const signInWithKakao = async () => {
        const token = await login();
        console.log("THIS IS KAKAO TOKEN::::");
        console.log(token);
        return token;
    }
    
    const signOutWithKakao = async () => {
        const message = await logout();
        console.log("OMG SIGNOUT?!?!:::");
        console.log(message);
        return message;
    }

    const getProfileKakao = async () => {
        const profile = await getKakaoProfile();
        console.log("OMG GET PROFILE????");
        console.log(profile);
        return profile;
    }
    
    const unlinkKakao = async () => {
        const message = await unlink();
        console.log("OMG UNLINK!?!?! ZELDA??");
        console.log(message);
        return message;
    }

    const naverLogin = async (props) => {
        console.log("in naver login");
        return new Promise((resolve, reject) => {
          NaverLogin.login(props, (err, token) => {
            console.log(`\n\n  Token is fetched  ::  \n\n`);
            console.log(token);
            userToken.current = token;
            if (err) {
              reject(err);
              return;
            }
            resolve('success');
          });
        });
      };
    
    const naverLogout = () => {
        NaverLogin.logout();
        userToken.current = "";
    };

    const getProfileNaver = async () => {
        const profileResult = await getProfile(userToken.current.accessToken);
        if (profileResult.resultcode === "024") {
            Alert.alert("로그인 실패", profileResult.message);
            return;
        }
        console.log("profileResult", profileResult);
        userProfile.current = profileResult;
        return 'success';
    };

    const googleSignIn = async () => {
        try {
            GoogleSignin.configure(); // added to do inital configuration
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo);
            return userInfo;
        } catch (error) {
            console.log(error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('구글 로그인이 진행중입니다.')
            // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('구글 플레이 서비스가 없거나 지원되지않는 버전입니다.')
            // play services not available or outdated
            } else {
                Alert.alert('알수없는 에러가 발생했습니다. 잠시 후 다시 로그인해주세요.')
            // some other error happened
            }
            return 'error';
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f8" }} edges={['top', 'left', 'right']}>
            <View style={styles.mainBox}>
                <View style={styles.signUpBox}>
                    <TouchableOpacity
                        style={styles.defaultSignUp}
                        onPress={() => {
                            navigation.navigate("SignUp");
                        }}
                    >
                        <Text style={styles.defaultSignUpText}>회원가입하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.kakaoSignUp}
                        onPress={async () => {
                            const token = await signInWithKakao();
                            const profile = await getProfileKakao();
                            handleSignUp(('0' + profile.phoneNumber.substring(4)).replace(/-/g, ""), profile.nickname, 'kakao');
                        }}
                    >
                        <Image
                            style={styles.logoStyle}
                            source={require("../../assets/kakaoLogo.png")}
                        />
                        <Text style={styles.kakaoSignUpText}>카카오 아이디로 로그인</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.naverSignUp}
                        onPress={ async () => {
                            const res = await naverLogin(initials);
                            if(res === 'success'){
                                const res2 = await getProfileNaver();
                                if(res2 === 'success'){
                                    console.log("login Success");
                                    // console.log(userProfile.current);
                                    // console.log(userProfile.current.name);
                                    handleSignUp(userProfile.current.response.mobile.replace(/-/g, ""), userProfile.current.response.name, 'naver');
                                }
                            }
                        }}
                    >
                        <Image
                            style={styles.logoStyle}
                            source={require("../../assets/naverLogo.png")}
                        />
                        <Text style={styles.naverSignUpText}>네이버 아이디로 로그인</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.googleSignUp}
                        onPress={ async () => {
                            // navigation.navigate("SignUpConfirm");
                            const res = await googleSignIn();
                            if(res !== 'error'){
                                handleSignUp(res.user.email, res.user.name, 'google');
                            }
                        }}
                    >
                        <Image
                            style={styles.logoStyle}
                            source={require("../../assets/googleLogo.png")}
                        />
                        <Text style={styles.googleSignUpText}>구글 아이디로 로그인</Text>
                    </TouchableOpacity>    
                </View>
                

                <View style={styles.line}/>

                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Login");
                    }}
                >
                    <Text>이미 회원입니다.</Text>
                </TouchableOpacity>

                <View style={styles.bottomDescription}>
                    <Text style={styles.description}>실시간으로 이용 가능한 회의실</Text>
                    <Text style={styles.smallerDescription}>오피스쉐어 엡으로</Text>
                    <Text style={styles.smallerDescription}>간편하게 이용해 보세요.</Text>
                </View>
            </View>
            <FootHeader />
        </SafeAreaView>
    );
}
    

const styles = StyleSheet.create({
    mainBox: {
        justifyContent: 'space-between',
        flex: 1,
        alignItems: 'center'
    },
    signUpBox: {
        marginTop: 100,
    },
    defaultSignUp: {
        backgroundColor: '#4184E4',
        height: 55,
        width: 250,
        borderRadius: 15,
        marginBottom: 10,
        justifyContent: 'center'
    },
    defaultSignUpText: {
        color: 'white',
        textAlign: 'center'
    },
    kakaoSignUp: {
        flexDirection: 'row',
        height: 55,
        width: 250,
        backgroundColor: '#F9E105',
        borderRadius: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    kakaoSignUpText: {
        color: 'black',
        textAlign: 'center'
    },
    logoStyle: {
        resizeMode: 'contain', 
        // borderWidth: 1, 
        // borderColor: 'red',
        marginLeft: 5,
        marginRight: 10,
        width: 50
    },
    naverSignUp: {
        flexDirection: 'row',
        height: 55,
        width: 250,
        backgroundColor: '#04C600',
        borderRadius: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    naverSignUpText: {
        color: 'white',
        textAlign: 'center'
    },
    googleSignUp: {
        flexDirection: 'row',
        height: 55,
        width: 250,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        // marginBottom: 10,
        alignItems: 'center',
    },
    googleSignUpText: {
        color: 'black',
        textAlign: 'center'
    },
    line: {
        borderWidth: 1,
        borderColor: 'gray',
        width: 50,
        borderRadius: 15
    },
    bottomDescription: {
        marginBottom: 60
    },
    description: {
        textAlign: 'center',
        marginBottom: 10
    },
    smallerDescription: {
        textAlign: 'center',
        fontSize: 11
    },
    footerBox: {

    }
});

export default PreSignUpScreen;