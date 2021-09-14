import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Image, Button, Alert, TouchableOpacity, BackHandler, Platform, Linking, ToastAndroid, Share } from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons'; 
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard';
import Toast, {DURATION} from 'react-native-easy-toast';
import KakaoShareLink from 'react-native-kakao-share-link';

// import { WebView } from 'react-native-webview';

const ReservedScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const toastRef = useRef(null);

    console.log("Entered ReservedScreen. Params: ");
    console.log(route.params);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    const qrLink = "https://office-api.surem.com/getQrcode/" + route.params.resrvCode;


    // 예약자명 : 홍길동\n룸 이름: ${route.params.roomName}\n지점명 : ${route.params.location}점\n

    // 이렇게 맨 왼쪽으로 indent 붙여놓지 않으면 형식이 이상해짐. 왜지?
    const message = 
`[오피스쉐어 예약]\n
예약일 : ${route.params.dateString} (${weekDays[route.params.weekDay]})\n예약 시간 : ${route.params.startTime} ~ ${route.params.endTime}\n
예약자명: ${route.params.username}\n룸 이름: ${route.params.roomName}\n지점명 : ${route.params.location}점\n
주소: ${route.params.address}\n
QR코드 URL\n${qrLink}`;

    useFocusEffect(() => {
        const backAction = () => {
            navigation.reset({
                index: 0, 
                routes: [
                    {name: 'Table'},
                ] 
            })
            return true;
        };
        
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        
        return (() => backHandler.remove());
    },);

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: message,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const kakaoShare = async () => {
        try {
            const response = await KakaoShareLink.sendFeed({
              content: {
                title: '오피스쉐어 예약 안내',
                imageUrl:
                  'http://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
                link: {
                    webUrl: qrLink,
                    mobileWebUrl: qrLink
                },
                description: '오피스쉐어 예약 정보를 확인해주세요.',
              },
              buttons: [
                {
                  title: '예약(QR) 확인하기',
                  link: {
                    webUrl: qrLink,
                    mobileWebUrl: qrLink
                  },
                },
              ],
            });
            // console.log(response);
          } catch (e) {
            console.error(e);
            console.error(e.message);
          }
    }

    const kakaoLocation = async () => {
        try {
            const response = await KakaoShareLink.sendLocation({
                address: route.params.address,
                addressTitle: `${route.params.location}점`,
                content: {
                    title: '오피스쉐어 예약 안내',
                    imageUrl:
                        'http://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg',
                    link: {
                        webUrl: qrLink,
                        mobileWebUrl: qrLink
                    },
                    description: '오피스쉐어 예약 정보를 확인해주세요.',
                },
            });
            // console.log(response);
          } catch (e) {
            console.error(e);
            console.error(e.message);
          }
    }

    // useEffect(() => {
    //     const unsubscribe = navigation.dangerouslyGetParent().addListener('tabPress', (e) => {
    //         // Prevent default behavior
    //         // e.preventDefault();
    
    //         // Do something manually
    //         navigation.reset({
    //             index: 0, 
    //             routes: [
    //                 {name: 'Table'}
    //             ] 
    //         })  
    //     });
    
    //     return unsubscribe;
    // }, [navigation]);

    // useFocusEffect(() => {
    //     const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    //         removeSyncTime();
    //     });
        
    //     return unsubscribe;
    // },);

    // TODO: Room information API connect
    return (    
        <SafeAreaView style={{ flex: 1 }} edges={['right', 'left', 'top']}>
            <View style={styles.viewStyle}>
                <Feather style={styles.iconStyle} name="check-circle" size={40} color="black" />
                <Text style={styles.titleStyle}>예약이 완료 되었습니다!</Text>
                <Text style={styles.textStyle}>{route.params.roomName}</Text>
                <Text style={styles.textStyle}>날짜 : {route.params.dateString.replace(/-/g, " / ")} ({weekDays[route.params.weekDay]}) </Text>
                <Text style={styles.textStyle}>시간 : {route.params.startTime} ~ {route.params.endTime}</Text>

                <View style={styles.qrStyle}>
                    <QRCode
                        size={140}
                        value={route.params.resrvCode}
                    />
                </View>

                <View style={styles.buttonView}>
                    <TouchableHighlight
                        style={styles.reserveButton}
                        onPress={() => {
                            // navigation.navigate("CalendarList");
                            navigation.reset({
                                index: 0, 
                                routes: [
                                    {name: 'Table'},
                                    // {name: 'CalendarList'}
                                ] 
                            })
                        }}
                    >
                        <Text style={styles.buttonText}>추가 예약하기</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={styles.shareButton}
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <Text style={styles.buttonText}>공유하기</Text>
                    </TouchableHighlight>
                </View>
                

                <Modal 
                    isVisible={modalVisible}
                    backdropTransitionOutTiming={0}
                    style={styles.modal}
                    swipeDirection={['down']}
                    onSwipeComplete={() => {
                        setModalVisible(!modalVisible);
                    }}
                    onBackButtonPress={() => setModalVisible(!modalVisible)}
                    onBackdropPress={() => setModalVisible(!modalVisible)}
                >
                    <View style={styles.bottomBar}>
                        <View style={{ backgroundColor: '#5d5e61', width: 23, height: 3, alignSelf: 'center', borderRadius: 500, marginBottom: 11 }} />
                        <View style={styles.modalStyle}>
                            <View style={styles.innerModal}>
                                <TouchableOpacity
                                    // onPress={kakaoShare}
                                    onPress={kakaoLocation}
                                >
                                    <View>
                                        <Image
                                            style={styles.logoStyle}
                                            source={require('../../assets/cuts/kakao.png')}
                                        />
                                        <Text style={styles.logoCaption}>카카오톡</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onShare}
                                >
                                    <View>
                                        <Image
                                            style={styles.logoStyle}
                                            source={require('../../assets/cuts/share.png')}
                                            // source={require('../../assets/cuts/kakao.png')}
                                        />
                                        <Text style={styles.logoCaption}>공유하기</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={ async () => {
                                        var url;
                                        if (Platform.OS === 'android') {
                                            url = `sms:?body=${message}`;
                                        }
                                        else  {
                                            url = `sms:&body=${message}`;
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
                                    <View>
                                        <Image
                                            style={styles.logoStyle}
                                            source={require('../../assets/cuts/message.png')}
                                        />
                                        <Text style={styles.logoCaption}>문자메시지</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        Clipboard.setString(message);
                                        if(Platform.OS === 'android'){
                                            ToastAndroid.show("URL을 복사했습니다.", ToastAndroid.SHORT);
                                        }
                                        else {
                                            // this.toast.show('URL을 복사했습니다.', 2000);
                                            toastRef.current.show('URL을 복사했습니다.', 2000);
                                        }
                                    }}
                                >
                                    <View>
                                        <Image
                                            style={styles.logoStyle}
                                            source={require('../../assets/cuts/urlcopy.png')}
                                        />
                                        <Text style={styles.logoCaption}>URL복사</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Toast 
                        ref={toast => toastRef.current = toast}    
                        // position='top'      
                        positionValue={250}
                    />
                </Modal>
            </View>
        </SafeAreaView> 
    );
}

const styles = StyleSheet.create({ 
    viewStyle: {
        alignItems: 'center',
        backgroundColor: '#f3f4f8',
        flexGrow: 1,
    },
    textStyle: {
        textAlign: 'center',
        // backgroundColor: 'white',
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 2,
        padding: 2,
        paddingHorizontal: 10
    },
    titleStyle: {
        fontSize: 16,
        marginBottom: 18
    },
    iconStyle: {
        marginTop: 50,
        color: '#07a7e6',
        marginBottom: 10
    },
    qrStyle: {
        marginTop: 35,
    },
    reserveButton: {
        backgroundColor: "#262829",
        borderRadius: 7,
        marginTop: 35,
        paddingVertical: 12,
        paddingHorizontal: 63,
        elevation: 2,
        width: 213
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 14
    },
    modalStyle: {
        backgroundColor: 'white',
        // flexDirection: 'row',
        padding: 10,
        paddingVertical: 30,
        borderTopWidth: 1,
        borderTopColor: '#5f6061'
    },
    innerModal:{
        marginHorizontal: 48,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    logoStyle: {
        width: 50,
        height: 50,
        // resizeMode: 'contain',
        // borderColor: 'black',
        // borderWidth: 1
    },
    logoCaption: {
        marginTop: 2,
        textAlign: 'center',
        fontSize: 10,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    bottomBar: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 11
    },
    shareButton: {
        backgroundColor: "#262829",
        borderRadius: 7,
        marginTop: 18,
        paddingVertical: 12,
        // paddingHorizontal: 80,
        elevation: 2,
    },
    buttonView: {
        // borderWidth: 1,
        // borderColor: 'red',    
    }
});

export default ReservedScreen;