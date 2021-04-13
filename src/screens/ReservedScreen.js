import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Image, Button, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons'; 
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

// import { WebView } from 'react-native-webview';

const ReservedScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    console.log("Entered ReservedScreen. Params: ");
    console.log(route.params);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    // TODO: Room information API connect
    return (    
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.viewStyle}>
                <Feather style={styles.iconStyle} name="check-circle" size={40} color="black" />
                <Text style={styles.titleStyle}>예약이 완료 되었습니다!</Text>
                <Text style={styles.textStyle}>{route.params.roomName}</Text>
                <Text style={styles.textStyle}>날짜 : {route.params.dateString.replace(/-/g," / ")} ({weekDays[route.params.weekDay]}) </Text>
                <Text style={styles.textStyle}>시간 : {route.params.startTime} ~ {route.params.endTime}</Text>

                <View style={styles.qrStyle}>
                    <QRCode
                        size={140}
                        value={route.params.resrvCode}
                    />
                </View>

                <TouchableHighlight
                    style={styles.reserveButton}
                    onPress={() => {
                        navigation.navigate("CalendarList");
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

                <Modal 
                    isVisible={modalVisible}
                    backdropTransitionOutTiming={0}
                    style={styles.modal}
                    swipeDirection={['down']}
                    onSwipeComplete={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.bottomBar}>
                        <View style={{ backgroundColor: '#5d5e61', width: 23, height: 3, alignSelf: 'center', borderRadius: 500, marginBottom: 11 }} />
                        <View style={styles.modalStyle}>
                            <View style={styles.innerModal}>
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert("카카오톡");
                                    }}
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
                                    onPress={() => {
                                        Alert.alert("문자메시지");
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
                                        Alert.alert("URL복사");
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
        backgroundColor: 'white',
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
        marginTop: 40,
    },
    reserveButton: {
        backgroundColor: "#262829",
        borderRadius: 7,
        marginTop: 40,
        paddingVertical: 12,
        paddingHorizontal: 63,
        elevation: 2
    },
    buttonText: {
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
        marginTop: 25,
        paddingVertical: 12,
        paddingHorizontal: 80,
        elevation: 2
    },
});

export default ReservedScreen;