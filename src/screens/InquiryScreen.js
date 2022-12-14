import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, BackHandler, FlatList, Alert, ScrollView, useWindowDimensions} from 'react-native';
import axios from 'axios';
import { Entypo, Feather } from '@expo/vector-icons'; 

import { SafeAreaView } from 'react-native-safe-area-context';
import { Collapse, CollapseHeader, CollapseBody } from 'accordion-collapse-react-native';
import Collapsible from 'react-native-collapsible';
import { URL } from '../constants';

import { useFocusEffect } from '@react-navigation/native';
import { set } from 'react-native-reanimated';

const InquiryScreen = ({ navigation, route }) => {
    const [inquiryList, setInquiryList] = useState([]);
    const [initial, setInitial] = useState(true);
    const [empty, setEmpty] = useState(false);
    const [isOpen, setIsOpen] = useState([]);

    console.log("Entered InquiryScreen. Params: ");
    console.log(route.params);

    // const getVocList = async () => {
    //     try{
    //         console.log("Attempting to get user inquiries...");
    //         // console.log("usercode: " + usercode);
    //         // console.log("secretCode: " + secretCode);
    //         const response = await axios.post(URL+'/getVocList', {
    //         // const response = await axios.post('http://112.221.94.101:8980/getVocList', {
    //             usercode: route.params.usercode,
    //             securityKey: route.params.secretCode
    //         });
    //         console.log(`Got the response!`);
    //         console.log(response.data);
    //         if(response.data.returnCode !== "E0000"){
    //             console.log("Error: " + response.data.returnCode);
    //             Alert.alert("문의내역을 가져오는데 오류가 일어났습니다. 잠시후 다시 시도해주세요.");
    //             return 'Error';
    //         }
    //         setInquiryList(response.data.list)
    //         setInitial(false);
    //         return response.data.returnCode;
    //     } catch (err) {
    //         console.log(err);
    //         return 'Error';
    //     }
    // }

    // const renderItem = ({ item }) => {
    //     return (
    //         <Item
    //             item={item}
    //             onPress={ () => {
    //             }}
    //         />
    //     );
    // }

    useFocusEffect(
        useCallback(() => {
            const getVocList = async () => {
                try{
                    console.log("Attempting to get user inquiries in focus effect...");
                    // console.log("usercode: " + usercode);
                    // console.log("secretCode: " + secretCode);
                    const response = await axios.post(URL+'/getVocList', {
                    // const response = await axios.post('http://112.221.94.101:8980/getVocList', {
                        usercode: route.params.usercode,
                        securityKey: route.params.secretCode
                    });
                    console.log(`Got the response!`);
                    console.log(response.data);
                    if(response.data.returnCode === "E1001"){
                        console.log("[getVocList]: no inquries by user.");
                        setEmpty(true);
                        setInitial(false);
                        return "Empty";
                    }
                    else if(response.data.returnCode !== "E0000"){
                        console.log("Error: " + response.data.returnCode);
                        Alert.alert( `` + "문의내역을 가져오는데 오류가 일어났습니다. 잠시후 다시 시도해주세요. ");
                        setEmpty(true);
                        setInitial(false);
                        return 'Error';
                    }
                    setInquiryList(response.data.list)
                    setInitial(false);
                    return response.data.returnCode;
                } catch (err) {
                    console.log(err);
                    return 'Error';
                }
            }

            getVocList();

            return () => {
                setInitial(true);
                setEmpty(false);
            }

        }, [route.params.usercode])
    );

    // if(initial){
    //     getVocList();
    // }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8'}} edges={['right', 'left', 'top']}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>1:1 문의 내역</Text>
                <TouchableOpacity
                    onPress={() => {
                        // setInitial(true);
                        navigation.navigate("Inquire", {
                            usercode: route.params.usercode,
                            secretCode: route.params.secretCode,
                        });
                    }}
                    style={styles.askButton}
                >
                    <Text style={styles.askText}>문의작성</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.mainBox, { justifyContent: (initial == true || inquiryList.length == 0) ? 'center' : 'flex-start' }]}>
                {initial ? 
                    <View style={{ }}>
                        <ActivityIndicator size="large" color="gray"/>
                    </View>
                    :
                    <ScrollView>
                        {empty ? 
                            <Text style={{ marginBottom: 40, alignSelf: 'center'}}>문의내역이 없습니다.</Text>
                            :
                            // <FlatList
                            //     data={inquiryList}
                            //     renderItem={renderItem}
                            //     keyExtractor={item => item.idx}
                            //     extraData={isOpen}
                            // />
                            inquiryList.map((item, index) => {
                                return (
                                    <View key={index} style={styles.itemOuter}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if(!isOpen.includes(item.idx)){
                                                    setIsOpen([...isOpen, item.idx]);
                                                    return;
                                                }
                                                else{
                                                    let temp = [...isOpen];
                                                    for(var i = 0; i < temp.length; i++){
                                                        if(temp[i] === item.idx){
                                                            temp.splice(i, 1);
                                                        }
                                                    }
                                                    setIsOpen(temp);
                                                    return;
                                                }
                                            }}
                                        >
                                            <View style={[styles.itemBox]}>
                                                <Text style={styles.itemDate}>{item.time.substring(0,4)}.{item.time.substring(4,6)}.{item.time.substring(6,8)}</Text>
                                                <View style={styles.itemData}>
                                                    <Text style={styles.itemSubject}>{item.subject}</Text>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text style={[styles.itemStatus, item.adminChk === 'O' ? styles.answered : styles.unAnswered]}>{item.adminChk === 'O' ? "답변 완료" : "답변 대기"} </Text>
                                                            {isOpen.includes(item.idx) ?
                                                                // <Ionicons style={styles.caretIcon} name="ios-caret-up-circle-outline" size={24} color={item.adminChk === 'O' ? '#4982CF' : 'black'} />
                                                                // <Entypo name="chevron-up" size={24} color={item.adminChk === 'O' ? '#4485E5' : "#888888"} />
                                                                <View style={{ justifyContent: 'center' }}>
                                                                    <Feather name="chevron-up" size={24} color={item.adminChk === 'O' ? '#4485E5' : "#999999"} />
                                                                </View>
                                                                :
                                                                // <Ionicons style={styles.caretIcon} name="ios-caret-down-circle-outline" size={24} color={item.adminChk === 'O' ? '#4982CF' : 'black'} />
                                                                // <Entypo name="chevron-down" size={24} color={item.adminChk === 'O' ? '#4485E5' : "#888888"} />
                                                                <View style={{ justifyContent: 'center' }}>
                                                                    <Feather name="chevron-down" size={24} color={item.adminChk === 'O' ? '#4485E5' : "#999999"} />
                                                                </View>
                                                            }
                                                    </View>
                                                </View>
                                            </View>

                                            <Collapsible
                                                collapsed={!isOpen.includes(item.idx)}
                                            > 
                                                <View style={styles.itemBody}>
                                                    <Text style={styles.itemBodyText}>{item.note}</Text>
                                                    {item.adminChk === 'O' ?
                                                        (<View style={{}}>
                                                            <Text style={styles.answerLabel}>답변: </Text>
                                                            <Text style={styles.answerText}>{item.answer}</Text>
                                                            {/* <Text style={styles.answerText}>이용에 불편을 드려 정말 죄송합니다. 간혹 휴대폰 화면의 밝기가 너무 어두울 경우 QR 코드 인식이 잘 안될 때가 있습니다. 계속해서 인식에 어려움이 있으시다면 전화 문의 부탁드리겠습니다. 감사합니다.</Text> */}
                                                        </View>)
                                                        :
                                                        null
                                                    }
                                                </View>
                                            </Collapsible>

                                            <View style={styles.itemEnd}>
                                                <Text></Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                }    
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        flexDirection: 'row',
        marginTop: 30,
        marginHorizontal: 20,
        justifyContent: 'space-between',
        marginBottom: 0,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        color: 'black'
    },
    askButton: {
        backgroundColor: '#40465A',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    askText: {
        color: 'white'
    },
    mainBox: {
        flex: 1,
        // padding: 30,
        paddingHorizontal: 20,
        padding: 10
        // alignItems: 'center',
        // borderWidth: 1,
        // borderColor: "red",
    },
    itemOuter: {
        marginBottom: 15
    },
    itemBox: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 15,
        // borderColor: '#CDCFCF',
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        // marginBottom: 15
    },
    itemDate: {
        color: '#686868',
        marginBottom: 15,

    },
    itemData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // borderWidth: 1,
        // borderColor: 'red',
        alignItems: 'center'
    },
    itemSubject: {
        // marginLeft: 5,
        color: 'black',

    },
    itemStatus: {
        // fontSize: 13
    },
    caretIcon: {
        margin: 0
    },
    itemBody: {
        backgroundColor: 'white',
        // borderColor: '#CDCFCF',
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        paddingHorizontal: 20,
        // paddingLeft: 20,
        paddingTop: 10
    },
    itemBodyText: {

    },
    answered: {
        color: '#4485E5'
    },
    unanswered: {
        color: '#888888'
    },
    answerLabel: {
        marginTop: 10,
        color: '#4485E5',
        fontWeight: 'bold',
        marginBottom: 4
    },
    answerText: {
    },
    itemEnd: {
        backgroundColor: 'white',
        // borderColor: '#CDCFCF',
        // borderBottomWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingBottom: 5
    }
});

export default InquiryScreen;



// const ItemOld = ({ item }) => {
//     // console.log(item);
//     return (
//         <View style={styles.itemOuter}>
//             <Collapse
//                 onToggle={(isExpanded) => {
//                     setIsOpen(isExpanded);
//                 }}
//                 isExpanded={isOpen}
//             >
//                 <CollapseHeader>
//                     <View style={[styles.itemBox, isOpen ? styles.opened : styles.closed ]}>
//                         <Text style={styles.itemDate}>{item.time}</Text>
//                         <View style={styles.itemData}>
//                             <Text style={styles.itemSubject}>{item.subject}</Text>
//                             <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//                                 <Text style={[styles.itemStatus, item.adminChk === 'O' ? styles.answered : styles.unAnswered]}>{item.adminChk === 'O' ? "답변 완료" : "답변 대기"}  </Text>
//                                     {isOpen ?
//                                         <Ionicons style={styles.caretIcon} name="ios-caret-up-circle-outline" size={24} color={item.adminChk === 'O' ? '#4982CF' : 'black'} />
//                                         :
//                                         <Ionicons style={styles.caretIcon} name="ios-caret-down-circle-outline" size={24} color={item.adminChk === 'O' ? '#4982CF' : 'black'} />
//                                     }
//                             </View>
//                         </View>
//                     </View>
//                 </CollapseHeader>

//                 <CollapseBody>
//                     <View style={styles.itemBody}>
//                         <Text>Hi</Text>
//                     </View>         
            
//                 </CollapseBody>
//             </Collapse>
//         </View>
        
//     );
// }