import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ActivityIndicator, Image, Switch, Alert, TouchableOpacity, ScrollView, Linking, BackHandler } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons'; 
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TERMS, URL, APP_VERSION } from '../constants';
// import * as RNLocalize from 'react-native-localize';
import moment from 'moment-timezone';

import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';

import { SafeAreaView } from 'react-native-safe-area-context';

import { NaverLogin } from "@react-native-seoul/naver-login";
import { logout, unlink } from '@react-native-seoul/kakao-login';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import FootHeader from '../components/FootHeader';


const MyScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    // const [usercode, setUsercode] = useState(null);
	// const [secretCode, setSecretCode] = useState(null);
    const [couponNum, setCouponNum] = useState(0);

    const usercode = useRef(null);
    const secretCode = useRef(null);
    const username = useRef(null);
    const loginType = useRef(null);

    const [serviceTerm, setServiceTerm] = useState(false);
    const [infoTerm, setInfoTerm] = useState(false);
    const [financialTerm, setFinancialTerm] = useState(false);

    const [initial, setInitial] = useState(true);

    const [allowPush, setAllowPush] = useState(true);

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
        console.log("in getuserID");
        return new Promise((resolve, reject) => {
            db.transaction(async (tx)=>{
                tx.executeSql(
                    `select * from UserId order by _id desc;`,
                    [],
                    (tx, results) => {
                        // console.log("called!")
                        // setUsercode(results.rows.item(0).usercode);
                        usercode.current = results.rows.item(0).usercode;
                        // setSecretCode(results.rows.item(0).secretCode);
                        secretCode.current = results.rows.item(0).secretCode;
                        username.current = results.rows.item(0).username;
                        loginType.current = results.rows.item(0).loginType;
                        resolve();
                    },
                    (tx, error) => {
                        reject(error);
                    }
                )
            })
        })
            
    }

    const getMyInfo = async () => {
        try{
            console.log("Attempting to get user info...");
            console.log("usercode: " + usercode.current);
            console.log("secretCode: " + secretCode.current);
            if(usercode.current === null || secretCode.current === null){
                return;
            }
            const response = await axios.post(URL + '/myInfo', {
            // const response = await axios.post('http://112.221.94.101:8980/myInfo', {
                usercode: usercode.current,
                securityKey: secretCode.current
            });
            console.log(`Got the response!`);
            console.log(response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error from getMyInfo: " + response.data.returnCode);
                setCouponNum(0);
                return response.data;
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
        return new Promise((resolve, reject) => {
            db.transaction((tx)=>{
                tx.executeSql(
                    `delete from UserId;`,
                    [],
                    (tx, results) =>{
                        console.log('Deleting Users :: ',results)
                        resolve("success");
                    },
                    () => {
                        Alert.alert("??????????????? ????????? ???????????????, ????????? ?????? ????????????????????? ??????????????? ??????????????????.");
                        reject("error");
                    }
                )
            })
        })
    }

    const quitMember = async () => {
        try{
            console.log("Attempting to quit user...");
            console.log("usercode: " + usercode.current);
            console.log("secretCode: " + secretCode.current);
            const response = await axios.post(URL + '/quitMember', {
                usercode: usercode.current,
                securityKey: secretCode.current
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
            Alert.alert("??????????????? ????????? ???????????????. ????????? ?????? ??????????????????.");
            return 'Error';
        }
    }

    const getPush = () => {
        console.log("[MyScreen]:: Retreiving push permission..");
        return new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
                tx.executeSql('select * from PUSH_PERMISSION;',
                    [],
                    (tx, results) => {
                        if(results.rows.length > 0){
                          console.log("[MyScreen]:: Push permission not allowed.");
                        //   setInitial(false);
                          resolve(false);
                        }
                        else{
                          console.log("[MyScreen]:: Push permission allowed.");
                        //   setInitial(false);
                          resolve(true);
                        }
                    },
                    (tx, error) => {
                        // console.log(error);
                        // setInitial(false);
                        reject(error);
                    }
                );
            }
          )
        });
    }

    const disablePush = async () => {
        console.log("[MyScreen]:: Disabling push notifications...");
        return new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              tx.executeSql("INSERT INTO PUSH_PERMISSION (allowed) VALUES(?);", [false],
                (tx, results) => {
                  // console.log(results);
                  console.log("[MyScreen]:: Push Disabled.");
                  resolve(results);
                },
                (txt, error) => {
                  // console.log(error);
                  reject(error);
                }
              )
            },
          );
        });
      }
      
    const enablePush = async () => {
        console.log("[MyScreen]:: Enabling push notifications...");
        return new Promise((resolve, reject) => {
            db.transaction(
            (tx) => {
                tx.executeSql('DELETE FROM PUSH_PERMISSION', [],
                (tx, results) => {
                    // console.log(results);
                    console.log("[MyScreen]:: Push enabled.");
                    resolve(results);
                },
                (txt, error) => {
                    // console.log(error);
                    reject(error);
                }
                )
            },
            );
        }); 
    }

    const getReservation = async () => {
        try{
            // console.log("[TableScreen]:: Attemting to get list of USERS reservations...");
            // console.log("usercode: " + usercode);
            // console.log("secretCode: " + secretCode);
            const response = await axios.post(URL + '/getReservation', {
                usercode: usercode.current,
                secretCode: secretCode.current
            });

            // console.log(response.data);

            if(response.data.returnCode !== "E0000"){
                console.log("[TableScreen]:: getReservation Error: " + response.data.returnCode);
                Alert.alert(
                    "??? ?????? ??????????????? ???????????? ????????? ??????????????????. ????????? ?????? ??????????????????."
                );
                return 'Error';
            }

            // console.log("[TableScreen]:: Successfully retrieved USERS list of reservation.");
            myResrvList.current = response.data.reservations;
            return "success";
        } catch (err) {
            Alert.alert(
                "??? ?????? ??????????????? ???????????? ????????? ??????????????????. ????????? ?????? ??????????????????."
            );
            return 'Error';
        }
    }

    const schedulePushNotification = async (year, month, day, hour, min) => {
        console.log("[PaymentScreen]:: Attempting to schedule a notification...");
        var identifier;

        if(parseInt(hour) >= 9){
            const triggerB = new Date(year, parseInt(month) - 1, day, 8, 0);
            console.log("[PaymentScreen]:: Trigger-- " + triggerB);
            console.log(`DAY :: ${year}${month}${day}`);
            identifier = await Notifications.scheduleNotificationAsync({
                identifier: `${year}${month}${day}`,
                content: {
                    title: "????????????",
                    body: `?????? ??????????????? ????????? ????????????.`,
                    data: { type: 'reservation' },
                },
                trigger: triggerB,
            });
            console.log('ID :: ',identifier)
            await registerPushId(identifier, "B");
        }

        if(parseInt(hour) === 9 && parseInt(min) === 0){
            return;
        }
        else{
            const triggerA = new Date(year, parseInt(month) - 1, day, parseInt(hour) - 1, min);
            console.log("[PaymentScreen]:: Trigger-- " + triggerA);
            console.log(`[Trigger-- A] :: ${year}${month}${day}${hour}${min}:${route.params.roomName}`);
            identifier = await Notifications.scheduleNotificationAsync({
                identifier: `${year}${month}${day}${hour}${min}:${route.params.roomName}`,
                content: {
                    title: "???????????? ",
                    body: `??????????????? ?????? 1?????? ??? ?????????. / ?????? : ${route.params.roomName}??? ${sTime}:${route.params.startTime.charAt(2)}0 ~ ${eTime}:${route.params.endTime.charAt(2)}0.`,
                    data: { type: 'reservation' },
                },
                trigger: triggerA,
            });
            await registerPushId(identifier, "A");
        }   
    }

    const resetAlarms = async () => {
        try{
            await getReservation();
            if(myResrvList.current.length > 0){
                for(var i = 0; i < myResrvList.current.length; i++){
                    await schedulePushNotification(myResrvList.current[i]);
                }
            }
        } catch (err) {
            console.log(err);
            // Alert.alert(
            //     "?????? ?????????????????? ???????????? ????????? ??????????????????. ????????? ?????? ??????????????????."
            // );
            return 'Error';
        }
    }


    const togglePush = async () => {
        if(allowPush){
            await Notifications.cancelAllScheduledNotificationsAsync();
            await disablePush();
            setAllowPush(false);
        }
        else{
            await enablePush();
            // await resetAlarms();
            setAllowPush(true);
        } 
    }

    const exitModal = () => {
        setModalVisible(!modalVisible);
        setServiceTerm(false);
        setInfoTerm(false);
        setFinancialTerm(false);
    }

    useEffect(() => {
        const wrapper = async () => {
            await getUserId();
            // console.log("got user ID");
            await getMyInfo();
            // console.log("got info");
            const permission = await getPush();
            if(!permission){
                setAllowPush(false);
            }
            setInitial(false);
            // console.log("got push");
            // console.log("set initial to false");
        }
        wrapper();

    },[db])

    // useEffect(() => {
    //     getMyInfo();
    // },[initial])

    useFocusEffect(() => {
        // setInitial(true);
        if(!initial){
            console.log("focus effect called!")
            getMyInfo();
        }
        // getMyInfo();
    })

    // console.log(couponNum);

    return (    
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8' }} edges={['right', 'left', 'top']}>
            {initial ? 
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="gray"/>
                    <Text style={styles.loadingText}>?????????</Text>
                </View>
                :
                <ScrollView>
                    <View style={styles.viewStyle}>
                        <View style={styles.infoHeader}>
                            <Text style={styles.headerText}>????????????</Text>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={ async () => {
                                    Alert.alert(
                                        "????????????",
                                        "????????? ????????????????????????????", 
                                        [
                                        {
                                            text: "?????????",
                                            onPress: () => null,
                                            style: "cancel"
                                        },
                                        { text: "???", 
                                            onPress: async () => {
                                                if(loginType.current === 'kakao'){
                                                    console.log('kakao logout');
                                                    await logout();
                                                }
                                                else if (loginType.current === 'naver'){
                                                    console.log('naver logout');
                                                    NaverLogin.logout();
                                                }
                                                else if (loginType.current === 'google'){
                                                    console.log('google logout');
                                                    try {
                                                        await GoogleSignin.signOut();
                                                    } catch (error) {
                                                        Alert.alert('???????????? ???????????? ????????? ??????????????????. ?????? ??? ?????? ??????????????????.')
                                                        console.error(error);
                                                        return;
                                                    }
                                                }
                                                await deleteUserId();
                                                await Notifications.cancelAllScheduledNotificationsAsync();
                                                db.transaction((tx) => {
                                                    tx.executeSql('DROP TABLE IF EXISTS Branches;');
                                                })
                                                navigation.reset({
                                                    index: 0, 
                                                    routes: [
                                                        {name: 'Initial'}
                                                    ] 
                                                });
                                            }
                                        }
                                    ]);
                                }}
                            >
                                <Text style={styles.logoutButtonText}>????????????</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoBox}>
                            <View style={styles.infoTitle}>
                                <View style={styles.infoTextBox}>
                                    <Text style={styles.infoText}>??????</Text>
                                </View>
                                <View style={styles.infoTextBox}>
                                    <Text style={styles.infoText}>????????? ??????</Text>
                                </View>
                                <View style={{ justifyContent: 'center', height: 30 }}>
                                    <Text style={styles.infoText}>??? ?????? ??????</Text>
                                </View>
                            </View>
                            <View style={styles.infoValue}>
                                <View style={styles.infoTextBox}>
                                    <Text style={styles.infoText}>{username.current}</Text>
                                </View>
                                <View style={styles.infoTextBox}>
                                    <Text style={styles.infoText}>{usercode.current.substring(0,3) + "-" + usercode.current.substring(3,7) + "-" + usercode.current.substring(7)}</Text>
                                </View>
                                <TouchableOpacity
                                    style={{ justifyContent: 'center', height: 30 }}
                                    onPress={() => {
                                        // Alert.alert("?????????");
                                        navigation.navigate("MyCoupon", {
                                            usercode: usercode.current,
                                            secretCode: secretCode.current
                                        });
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.infoText}>{couponNum}???   </Text>
                                        <View style={{ justifyContent: 'center' }}> 
                                            {/* <MaterialCommunityIcons style={styles.couponIcon} name="greater-than" size={18} color="#6C6C6C" /> */}
                                            <Entypo name="chevron-thin-right" size={16} color="#999999" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                
                            </View>
                        </View>

                        <View style={styles.csHeader}>
                            <Text style={styles.headerText}>????????????</Text>
                        </View>

                        <View style={styles.csBox}>
                            <View style={styles.infoTitle}>
                                <View style={styles.infoTextBox}>
                                    <Text style={styles.infoText}>1:1 ??????</Text>
                                </View>
                                <View style={{ justifyContent: 'center', height: 30 }}>
                                    <Text style={styles.infoText}>????????????</Text>
                                </View>
                            </View>
                            <View style={styles.infoValue}>
                                <View style={styles.infoTextBox}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row' , flex: 1}}
                                            onPress={() => {
                                                navigation.navigate("Inquiry", {
                                                    usercode: usercode.current,
                                                    secretCode: secretCode.current
                                                });
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.infoText}>   </Text>
                                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    {/* <MaterialCommunityIcons style={{}} name="greater-than" size={18} color="#6C6C6C" /> */}
                                                    <Entypo name="chevron-thin-right" size={16} color="#999999" />

                                                </View>
                                                <View style={{ flex: 1 }}/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ justifyContent: 'center', height: 30}}>
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
                                                Alert.alert(`??? URL??? ?????? ????????????: ${url}`);
                                            }
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.infoText}>   </Text>
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                {/* <MaterialCommunityIcons style={{}} name="greater-than" size={18} color="#6C6C6C" /> */}
                                                <Entypo name="chevron-thin-right" size={16} color="#999999" />
                                            </View>
                                            <View style={{ flex: 1 }}/>
                                        </View>
                                    </TouchableOpacity>          
                                </View>
                            </View>
                        </View>

                        <View style={styles.miscBox}>
                            <Text style={styles.version}>???????????? V {APP_VERSION}</Text>
                            <Text style={styles.terms}>?????? ??? ??????</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setServiceTerm(!serviceTerm);
                                    setModalVisible(!modalVisible);
                                    // Alert.alert("????????? ????????????");
                                }}
                            >
                                <View style={styles.subView}>
                                    <Text style={styles.subTerms}>????????? ????????????</Text>
                                    {/* <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" /> */}
                                    <Entypo name="chevron-thin-right" size={16} color="#999999" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setInfoTerm(!infoTerm);
                                    setModalVisible(!modalVisible);
                                    // Alert.alert("???????????? ?????? ??????");
                                }}
                            >
                                <View style={styles.subView}>
                                    <Text style={styles.subTerms}>???????????? ?????? ??????</Text>
                                    {/* <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" /> */}
                                    <Entypo name="chevron-thin-right" size={16} color="#999999" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setFinancialTerm(!financialTerm);
                                    setModalVisible(!modalVisible);
                                    // Alert.alert("?????? ?????? ?????? ??????");
                                }}
                            >
                                <View style={styles.subView}>
                                    <Text style={styles.subTerms}>?????? ?????? ?????? ??????</Text>
                                    {/* <MaterialCommunityIcons style={styles.termIcon} name="greater-than" size={18} color="#6C6C6C" /> */}
                                    <Entypo name="chevron-thin-right" size={16} color="#999999" />
                                </View>
                            </TouchableOpacity>
                            
                            <View style={styles.pushBox}>
                                <Text style={styles.pushPermission}>?????? ??????</Text>
                                <Switch
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={'#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={togglePush}
                                    value={allowPush}
                                    style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                />
                            </View>

                        </View>

                        <TouchableHighlight
                            style={styles.deleteButton}
                            onPress={ async () => {
                                Alert.alert(
                                    "????????????!",
                                    "????????? ?????????????????????????", 
                                    [
                                    {
                                        text: "?????????",
                                        onPress: () => null,
                                        style: "cancel"
                                    },
                                    { text: "???", 
                                        onPress: async () => {
                                            if(loginType.current === 'kakao'){
                                                console.log('kakao unlink');
                                                await unlink();
                                            }
                                            else if(loginType.current === 'google'){
                                                console.log('google unlink');
                                                try {
                                                    await GoogleSignin.revokeAccess();
                                                    // Google Account disconnected from your app.
                                                    // Perform clean-up actions, such as deleting data associated with the disconnected account.
                                                } catch (error) {
                                                    console.error(error);
                                                    Alert.alert('??????????????? ????????? ??????????????????. ?????? ??? ?????? ??????????????????.')
                                                    return;
                                                }
                                            }
                                            const res = await quitMember();
                                            // erase data from sqlite database
                                            if(res.returnCode === 'E0000'){
                                                await deleteUserId();
                                                await Notifications.cancelAllScheduledNotificationsAsync();
                                                db.transaction((tx) => {
                                                    tx.executeSql('DROP TABLE IF EXISTS Branches;');
                                                })
                                                navigation.reset({
                                                    index: 0, 
                                                    routes: [
                                                        {name: 'Initial'}
                                                    ] 
                                                });
                                            }
                                            else{
                                                Alert.alert("??????????????? ????????? ???????????????. ????????? ?????? ??????????????????.");
                                            }
                                        }
                                    }
                                ]);
                            }}
                        >
                            <Text style={styles.buttonText}>????????????</Text>
                        </TouchableHighlight>

                        {/* <TouchableHighlight
                            style={styles.deleteButton}
                            onPress={() => {
                                navigation.navigate("Test");
                            }}
                        >
                            <Text style={styles.buttonText}>?????????</Text>
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
                                    <Text style={styles.modalHeaderText}>?????? ?????? ??? ??????</Text>
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
                    
                    <FootHeader />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 25
    },
    logoutButton: {
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderColor: '#B6B6B6'
    },
    logoutButtonText: {
        fontSize: 13,
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
        borderBottomLeftRadius: 10,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    infoValue: {
        flex: 2,
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    infoText: {
        // marginVertical: 8,
        marginLeft: 10,
        // borderWidth: 1,
        // borderColor: 'red',
        fontSize: 14,
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
        borderColor: '#B6B6B6',
        justifyContent: 'center',
        height: 30
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
        marginBottom: 15,
        fontSize: 13
    },
    terms: {
        marginBottom: 5,
        fontSize: 13
    },
    termIcon: {
        marginRight: 10,
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
    pushBox: {
        marginTop: 10, 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexDirection: 'row', 
        flex: 1
    },
    pushPermission: {
        fontSize: 13
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
    },
    loadingText: {
        color: "gray",
        marginTop: 5
    },
});

export default MyScreen;
