import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, BackHandler, Alert, Image, FlatList } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';
import LoadingScreen from './LoadingScreen';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment-timezone';


const TITLE_H = 60;
const TITLE_W = 170;
const MIN_H = 30;
const HOUR_W = 130;

const TestScreen = ({ navigation, route }) => {
    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;
    
    const [errorMessageA, setErrorMessageA] = useState("");
    const [resrvLists, setResrvLists] = useState([]);
    const [roomLists, setRoomLists] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [roomWidth, setRoomWidth] = useState(windowWidth - 30 - 115 - 5);

    const [tableData, setTableData] = useState([]);
    const [called, setCalled] = useState(false);

    const [startPerf, setStartPerf] = useState(performance.now());
    const [endPerf, setEndPerf] = useState(0);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    console.log("Entered TestScreen. Params: ");
    // console.log(route.params);
    // Object {
    //     "dateString": "2021-04-15",
    //     "day": "15",
    //     "month": "04",
    //     "weekDay": 4,
    //     "year": 2021,
    // }
    
    useFocusEffect(() => {
        const backAction = () => {
            navigation.navigate("Home");
            return true;
        };
        
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        
        return (() => backHandler.remove());
    },);

    useEffect(() => {
        const unsubscribe = navigation.dangerouslyGetParent().addListener('tabPress', (e) => {
            // Prevent default behavior
            // e.preventDefault(); 

            const navState = navigation.dangerouslyGetState();
            // console.log(navState);

            // Do something manually
            if(navState.routes[navState.index].name === 'Table'){
                navigation.reset({
                    index: 0, 
                    routes: [
                        {name: 'Table'}
                    ] 
                });
            }  
        });
        return unsubscribe;
    });

    if(route.params === undefined){
        var currDate = new Date();
        var currInfo = {
            day: currDate.getDate(),
            month: currDate.getMonth() + 1,
            weekDay: currDate.getDay(),
            year: currDate.getFullYear()
        }
        route.params = {
            dateString: `${currInfo.year}-${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}-${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`,
            day: `${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`,
            month: `${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}`,
            weekDay: currInfo.weekDay,
            year: currInfo.year
        }
        console.log("INITIAL");
        console.log(route.params);
    }

    if(!("location" in route.params)){
        route.params["location"] = '서울';
    }
    if(!("branchCode" in route.params)){
        route.params["branchCode"] = 'surem3';
    }
    if(!("branchName" in route.params)){
        route.params["branchName"] = '슈어엠';
    }

    const getReservationList = async (resDate, adCode) => {
        try{
            console.log("Attempting to retreive list of available reservation times...");
            console.log("resrvCTime: " + resDate);
            console.log("adminCode: " + adCode);
            // const response = await axios.post('http://office-api.surem.com/getReservationList', {
            const response = await axios.post('http://112.221.94.101:8980/getReservationList', {
                // roomBranch: rmBranch,
                resrvCtime: resDate,
                adminCode: adCode
            });
            // console.log(response.data);
           
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                navigation.navigate("Home");
            }

            console.log("API call successful!");
            setResrvLists(response.data.roomList);

            // if(response.data.roomList.length > 1){
            //     setRoomWidth(170 * response.data.roomList.length);
            // }
            // setCalled(true);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    if(resrvLists.length == 0){
        console.log("-----TABLE :: [Initializing Reservation List...]");
        getReservationList(route.params.dateString.replace(/-/g,""), route.params.branchCode);

        // var tt1 = performance.now()
        // console.log("API call took " + (tt1 - tt0) + " milliseconds.")

        return (
            <LoadingScreen/>
        )
    }

    // if(modalVisible){
    //     return (
    //         <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >
    //             <View style={styles.branchBox}>
    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         navigation.navigate("Branch", route.params);
    //                     }}
    //                     style={styles.branchButton}
    //                 >
    //                     <Text style={styles.branchText}>{route.params.location} {route.params.branchName}점</Text> 
    //                 </TouchableOpacity>
    //             </View>
    
    //             <View style={styles.dateBox}>
    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         var today = new Date();
    //                         today.setHours(0,0,0,0);
    //                         var newDate = new Date(route.params.dateString);
    //                         newDate.setDate(newDate.getDate() - 1);
    //                         var month = newDate.getMonth() + 1;
    //                         var date = newDate.getDate();
    //                         if(newDate < today){
    //                             Alert.alert("예약할수 없는 날짜입니다.");
    //                         }
    //                         else{
    //                             setResrvLists([]);
    //                             navigation.navigate('Test', { 
    //                                 dateString: `${newDate.getFullYear()}-${month < 10 ? 0 : ""}${newDate.getMonth() + 1}-${date < 10 ? 0 : ""}${newDate.getDate()}`,
    //                                 year: newDate.getFullYear(),
    //                                 month: `${month < 10 ? 0 : ""}${newDate.getMonth() + 1}`,
    //                                 day: `${date < 10 ? 0 : ""}${newDate.getDate()}`,
    //                                 weekDay: newDate.getDay()
    //                             })
    //                         }
    //                     }}
    //                 >
    //                     <MaterialCommunityIcons name="less-than" color="#BFBFBF" size={30} />
    //                 </TouchableOpacity>
                        
    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         setModalVisible(!modalVisible);
    //                     }}
    //                 >
    //                     <View style={styles.dateTitle}>
    //                         <View style={{ justifyContent: 'center' }}>
    //                             <Text style={styles.dateStyle}>{route.params.dateString.replace(/-/g,'.')}({weekDays[route.params.weekDay]}) </Text>
    //                         </View>
    //                         <View style={{ justifyContent: 'center' }}>
    //                             <AntDesign style={styles.calendarIcon} name="calendar" size={20} color="#838383" />
    //                         </View>
    //                     </View>
    //                 </TouchableOpacity>
                    
    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         var newDate = new Date(route.params.dateString);
    //                         newDate.setDate(newDate.getDate() + 1);
    //                         var month = newDate.getMonth() + 1;
    //                         var date = newDate.getDate();
    //                         setResrvLists([]);
    //                         navigation.navigate('Test', { 
    //                             dateString: `${newDate.getFullYear()}-${month < 10 ? 0 : ""}${newDate.getMonth() + 1}-${date < 10 ? 0 : ""}${newDate.getDate()}`,
    //                             year: newDate.getFullYear(),
    //                             month: `${month < 10 ? 0 : ""}${newDate.getMonth() + 1}`,
    //                             day: `${date < 10 ? 0 : ""}${newDate.getDate()}`,
    //                             weekDay: newDate.getDay()
    //                         })
    //                     }}
    //                 >
    //                     <MaterialCommunityIcons name="greater-than" color="#BFBFBF" size={30} />
    //                 </TouchableOpacity>
    //             </View>
                               
    //             {/* { This is where the table begins } */}
    
    //             <View style={styles.tableBox}>
    //                 <ScrollView
    //                     nestedScrollEnabled={true}
    //                     style={{ borderWidth: 0, borderColor: 'black' }}
    //                 >
    //                 </ScrollView>
    //             </View>
    
    //             <Modal 
    //                 isVisible={modalVisible}
    //                 backdropTransitionOutTiming={0}
    //                 style={styles.modal}
    //                 onBackButtonPress={() => setModalVisible(!modalVisible)}
    //                 onBackdropPress={() => setModalVisible(!modalVisible)}
    //                 hideModalContentWhileAnimating={true}
    //                 backdropTransitionInTiming={0}
    //                 onModalWillHide={() => {

    //                 }}
    //             >
    //                 <View style={styles.modalBox}>
    //                     <View style={styles.calendarBox}>
    //                         <Calendar
    //                             style={styles.calendars}
    //                             onDayPress={onDayPress}
    //                             current={Date()}
    //                             minDate={Date()}
    //                             // onDayLongPress={onDayLongPress}
    //                             hideArrows={false}
    //                             renderArrow={(direction) => {
    //                                 if(direction === 'left'){
    //                                     return <FontAwesome5 name="less-than" size={24} color="#BFBEBE" />;
    //                                 }
    //                                 else{
    //                                     return <FontAwesome5 name="greater-than" size={24} color="#BFBEBE" />;
    //                                 }
    //                             }}
    //                             renderHeader={(date) => {
    //                                 return (
    //                                     <View style={styles.headerBox}>
    //                                         <Text style={styles.header}>{date.getFullYear()}년 {date.getMonth() + 1}월</Text>
    //                                     </View>
    //                                 );
    //                             }}
    //                             theme={{
    //                                 'stylesheet.calendar.header': {
    //                                     week: {
    //                                         // marginTop: 5,
    //                                         flexDirection: 'row',
    //                                         justifyContent: 'space-around',
    //                                         borderTopWidth: 1,
    //                                         borderRightWidth: 1,
    //                                         borderLeftWidth: 1,
    //                                         borderTopLeftRadius: 10,
    //                                         borderTopRightRadius: 10,
    //                                         borderColor: '#BCBCBC',
    //                                         backgroundColor: '#F7F7F7',
    //                                         height: 40,
    //                                         alignItems: 'center',
    //                                         marginTop: 8,
    //                                     },
    //                                     dayHeader: {
    //                                         // marginTop: 2,
    //                                         // marginBottom: 2,
    //                                         flex: 1,
    //                                         // flexGrow: 1,
    //                                         height: 30,
    //                                         textAlign: 'center',
    //                                         // borderRightWidth: 0.5,
    //                                         // borderLeftWidth: 0.5,
    //                                         // borderWidth: 0.5,
    //                                         borderColor: 'black',
    //                                         // paddingBottom: 0,
    //                                         paddingTop: 5
    //                                     },
    //                                 },
    //                                 'stylesheet.calendar.main': {
    //                                     // container: {
    //                                     //     borderWidth: 20,
    //                                     //     borderColor: 'red',
    //                                     // },
    //                                     // week: {
    //                                     //     // borderWidth: 5,
    //                                     //     // borderColor: 'green',
    //                                     //     flexDirection: 'row',
    //                                     //     justifyContent: 'space-around'
    //                                     // },
    //                                     monthView: {
    //                                         // backgroundColor: 'orange'
    //                                         borderBottomWidth: 1,
    //                                         borderLeftWidth: 1,
    //                                         borderRightWidth: 1,
    //                                         borderBottomLeftRadius: 10,
    //                                         borderBottomRightRadius: 10,
    //                                         borderColor: '#BCBCBC'
    //                                     },
    //                                     dayContainer: {
    //                                         flex: 1,
    //                                         alignItems: 'center',
    //                                         // borderLeftWidth: 0.5,
    //                                         // borderRightWidth: 0.5,
    //                                         // borderBottomWidth: 0.5,
    //                                         // borderColor: 'black',
    //                                         height: 50,
    //                                     },
    //                                 }
    //                             }}
    //                         />
    //                     </View>
                        
    //                     <View style={{ alignItems: 'center'}}>
    //                         <TouchableOpacity
    //                             style={styles.closeButton}
    //                             onPress={() => {
    //                                 setModalVisible(!modalVisible);
    //                             }}
    //                         >
    //                             <Text style={styles.buttonText}>닫기</Text>
    //                         </TouchableOpacity>
    //                     </View>   
    //                 </View>
    //             </Modal>
        
        
    //         </SafeAreaView>
    //     );
    // }

    console.log("-----TABLE :: [...Finished Intializing Reservation List]");

    LocaleConfig.locales['kr'] = {
        monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
        dayNamesShort: ['일','월','화','수','목','금','토'],
        today: '오늘'
      };
    LocaleConfig.defaultLocale = 'kr';

    const startHour = "0800";
    const hours = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', '14:00 PM', 
                    '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', '21:00 PM', 
                    '22:00 PM', '23:00 PM'];

    const mins = ['00분', '10분', '20분', '30분', '40분', '50분'];

    // var t0 = performance.now();
    // var tt1 = performance.now();
    // console.log("API call took " + (tt1 - startPerf) + " milliseconds.");

    const roomCodes = [];
    const roomNames = [];
    const roomData = [];
    var valid = false;
    for(var i = 0; i < resrvLists.length; i++){
        valid = false;
        var keys = Object.keys(resrvLists[i]);
        const room = [];
        for(var j = 0; j < keys.length; j++){
            if(keys[j] !== 'roomCode' && keys[j] !== 'roomName'){
                // console.log(keys[j].substring(8));
                if(keys[j].substring(8) === startHour){
                    valid = true;
                }
                if(valid){
                    if(moment(keys[j], 'YYYYMMDDHHmm').isBefore()){
                        room.push("pastTime");
                    }
                    else {
                        room.push(resrvLists[i][keys[j]]);
                    }
                }
            }
        }
        roomData.push(room);
        roomCodes.push(resrvLists[i].roomCode);
        roomNames.push(resrvLists[i].roomName);
    }
    // console.log(roomData);
    // console.log(roomCodes);
    // console.log(roomNames);

    const optionsList = [];
    const optionValList = [];
    for(let i = 0; i < roomNames.length; i++){
        const options = [];
        const optionVals = [];
        for(let j = 2; j < (6 * 24) + 2; j++){
            if(Object.values(resrvLists[i])[j] === 'true'){
                let hour = Math.floor((j - 2) / 6);
                let min = (j - 2) % 6;
                options.push(`${hour}:${min}0 ${hour > 11 ? "PM" : "AM"}`);
                optionVals.push(`${hour > 9 ? hour : "0" + hour}${min}000`);
            }
        }
        optionsList.push(options);
        optionValList.push(optionVals);
    }

    const TableCol = ({ item, ind, start }) => {
        return (
            <View>
                <FlatList
                    scrollEnabled={false}
                    keyExtractor={(item, index) => item + index}
                    data={item}
                    renderItem={({ item, index }) => {
                        if(item === "pastTime"){
                            return (
                                <NotAvail item={item} ind={index} key={index} />
                            );
                        }
                        else if(item === "true"){
                            return (
                                <Avail item={item} ind={index} key={index} rmCode={roomCodes[ind]} ops={optionsList[ind]} opVals={optionValList[ind]}/>
                            )
                        }
                        else{
                            // continue until last false (count++)
                            // and then do a mapping of range(count)
                            // if odd, in middle one, if even, in between middle two
                            // equation for middle : len / 2 & len / 2 -n1
                            return (
                                <Booked item={item} ind={index} key={index} />
                            )
                        }     
                    }}
                />
                {/* {item.map((item, index) => {
                    if(item === "pastTime"){
                        return (
                            <NotAvail item={item} ind={index} key={index} />
                        );
                    }
                    else if(item === "true"){
                        return (
                            <Avail item={item} ind={index} key={index} rmCode={roomCodes[ind]} ops={optionsList[ind]} opVals={optionValList[ind]}/>
                        )
                    }
                    else{
                        // continue until last false (count++)
                        // and then do a mapping of range(count)
                        // if odd, in middle one, if even, in between middle two
                        // equation for middle : len / 2 & len / 2 -n1
                        return (
                            <Booked item={item} ind={index} key={index} />
                        )
                    }      
                })} */}
            </View>
        );
    }

    const NotAvail = ({ item, index }) => {
        return (
            <View style={{ height: MIN_H, justifyContent: 'center', backgroundColor:'#838383', borderBottomWidth: 1, borderColor: 'black', borderRightWidth: 1,}}>
                <Text style={{ textAlign: 'center', color: 'white'}}>예약불가</Text>
            </View>
        );
    }

    const Avail = ({ item, index, rmCode, ops, opVals}) => {
        return (
            <TouchableOpacity  
                onPress={() => navigation.navigate("Reservation", { 
                    dateString: route.params.dateString,
                    // startTime: sTime,
                    year: route.params.year,
                    month: route.params.month,
                    day: route.params.day,
                    weekDay: route.params.weekDay,
                    roomCode: rmCode,
                    options: ops,
                    optionVals: opVals,
                })}
            >
                <View style={{ height: MIN_H, backgroundColor: '#F6F6F6', justifyContent: 'center', borderBottomWidth: 1, borderColor: 'black', borderRightWidth: 1 }}>
                    <Text style={{ textAlign: 'center', color: '#757575' }}>예약가능</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const Booked = ({ item, index }) => {
        return (
            <View style={{ height: MIN_H, justifyContent: 'center', backgroundColor:'#838383', borderBottomWidth: 1, borderColor: 'black', borderRightWidth: 1 }}>
                <Text style={{ textAlign: 'center', color: 'white'}}>예약완료</Text>
            </View>
        );
    }

    const Min = ({ item, ind }) => {
        return (
            <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, ind == 5 ? {borderBottomWidth: 1} : {borderBottomWidth: 1}]}>
                <Text style={{}}>{item}</Text>
            </View>
        );
    }

    const Hour = ({ item, index }) => {
        return (
            <View>
                <Text style={{height: 180}}>{item}</Text>
            </View>
        )
    }

    const RenderItem = ({ item, ind }) => {
        return (
            <View>
                {ind === 0 ? 
                    <View style={styles.aboveTime}>
                        <Text></Text>
                    </View>
                :
                    null
                }
                <View style={styles.itemBox}>
                    <View style={{ borderBottomWidth: 1, borderColor: 'black', height: MIN_H * 6, flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
                        <Text style={styles.hourText}>{item}</Text>
                    </View>
                    <View style={{ }}>
                        {/* <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, {borderBottomWidth: 1}]}>
                            <Text style={{}}>{1}</Text>
                        </View>
                        <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, {borderBottomWidth: 1}]}>
                            <Text style={{}}>{1}</Text>
                        </View>
                        <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, {borderBottomWidth: 1}]}>
                            <Text style={{}}>{1}</Text>
                        </View>
                        <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, {borderBottomWidth: 1}]}>
                            <Text style={{}}>{1}</Text>
                        </View>
                        <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, {borderBottomWidth: 1}]}>
                            <Text style={{}}>{1}</Text>
                        </View>
                        <View style={[{ borderColor: 'black', borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5 }, {borderBottomWidth: 1}]}>
                            <Text style={{}}>{1}</Text>
                        </View> */}
                        {/* <FlatList
                            scrollEnabled={false}
                            keyExtractor={(item) => item}
                            data={mins}
                            renderItem={({ item, index }) => {
                                return (<Min item={item} key={index} ind={index} />)
                            }}
                        /> */}
                        {mins.map((item, index) => {
                            // console.log(index);
                            return (<Min item={item} key={index} ind={index} />)
                        })}
                    </View>
                </View>
            </View>
        )
    }

    const onDayPress = day => {
        console.log(day);
        setModalVisible(!modalVisible);
        let currDate = new Date(day.dateString);
        navigation.replace('Test', { 
            dateString: day.dateString, 
            year: day.year, 
            month: `${day.month < 10 ? 0 : ""}${day.month}`,
            day: `${day.day < 10 ? 0 : ""}${day.day}`,
            weekDay: currDate.getDay()
        });
    };

    // const ab = []; 
    // for(var k = 0; k < 2; k++){
    //     const abc = [];
    //     for(var i = 0; i < hours.length; i++){
    //         for(var j = 0; j < mins.length; j++){
    //             abc.push("true");
    //         }
    //     }
    //     ab.push(abc);
    // }
    
    // const roomNames = ["1호점", "2호점"];
    // const roomData = ab;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >
            
            <View style={styles.branchBox}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Branch", route.params);
                    }}
                    style={styles.branchButton}
                >
                    <Text style={styles.branchText}>{route.params.location} {route.params.branchName}점</Text> 
                </TouchableOpacity>
            </View>

            <View style={styles.dateBox}>
                <TouchableOpacity
                    onPress={() => {
                        var today = new Date();
                        today.setHours(0,0,0,0);
                        var newDate = new Date(route.params.dateString);
                        newDate.setDate(newDate.getDate() - 1);
                        var month = newDate.getMonth() + 1;
                        var date = newDate.getDate();
                        if(newDate < today){
                            Alert.alert("예약할수 없는 날짜입니다.");
                        }
                        else{
                            setResrvLists([]);
                            navigation.navigate('Test', { 
                                dateString: `${newDate.getFullYear()}-${month < 10 ? 0 : ""}${newDate.getMonth() + 1}-${date < 10 ? 0 : ""}${newDate.getDate()}`,
                                year: newDate.getFullYear(),
                                month: `${month < 10 ? 0 : ""}${newDate.getMonth() + 1}`,
                                day: `${date < 10 ? 0 : ""}${newDate.getDate()}`,
                                weekDay: newDate.getDay()
                            })
                        }
                    }}
                >
                    <MaterialCommunityIcons name="less-than" color="#BFBFBF" size={30} />
                </TouchableOpacity>
                    
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.dateTitle}>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={styles.dateStyle}>{route.params.dateString.replace(/-/g,'.')}({weekDays[route.params.weekDay]}) </Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <AntDesign style={styles.calendarIcon} name="calendar" size={20} color="#838383" />
                        </View>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={() => {
                        var newDate = new Date(route.params.dateString);
                        newDate.setDate(newDate.getDate() + 1);
                        var month = newDate.getMonth() + 1;
                        var date = newDate.getDate();
                        setResrvLists([]);
                        navigation.navigate('Test', { 
                            dateString: `${newDate.getFullYear()}-${month < 10 ? 0 : ""}${newDate.getMonth() + 1}-${date < 10 ? 0 : ""}${newDate.getDate()}`,
                            year: newDate.getFullYear(),
                            month: `${month < 10 ? 0 : ""}${newDate.getMonth() + 1}`,
                            day: `${date < 10 ? 0 : ""}${newDate.getDate()}`,
                            weekDay: newDate.getDay()
                        })
                    }}
                >
                    <MaterialCommunityIcons name="greater-than" color="#BFBFBF" size={30} />
                </TouchableOpacity>
            </View>
                           
            {/* { This is where the table begins } */}

            <View style={styles.tableBox}>
                {/* <FlatList
                    scrollEnabled={false}
                    removeClippedSubviews={true} 
                    keyExtractor={(item, index) => item + index}
                    data={hours}
                    renderItem={({ item, index }) => {
                        return (<RenderItem item={item} key={index} ind={index}/>)
                    }}
                /> */}
                
                <ScrollView
                    nestedScrollEnabled={true}
                    style={{ borderWidth: 0, borderColor: 'black' }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View>
                            {/* <FlatList
                                // initialNumToRender={1}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => item + index}
                                data={hours}
                                renderItem={({ item, index }) => {
                                    return (<RenderItem item={item} key={index} ind={index}/>)
                                }}
                            /> */}
                            {hours.map((item, index) => {
                                return (<RenderItem item={item} key={index} ind={index}/>)
                            })}
                        </View>
                        <ScrollView
                            nestedScrollEnabled={true}
                            horizontal={true}
                        >   
                            {/* {roomData.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <View style={[
                                            styles.titles, 
                                            index == (roomData.length - 1) ? null : { borderRightWidth: 1 },
                                            roomData.length == 1 ? { width: windowWidth - 20 - HOUR_W } : { width: TITLE_W }
                                        ]}>
                                            <Text style={styles.titleText}>{roomNames[index]}</Text>
                                        </View>
                                        <FlatList
                                            // initialNumToRender={1}
                                            scrollEnabled={false}
                                            keyExtractor={(item, index) => item + index}
                                            data={item}
                                            renderItem={({ item, index }) => {
                                                if(item === "pastTime"){
                                                    return (
                                                        <NotAvail item={item} ind={index} key={index} />
                                                    );
                                                }
                                                else if(item === "true"){
                                                    return (
                                                        <Avail item={item} ind={index} key={index} rmCode={roomCodes[index]} ops={optionsList[index]} opVals={optionValList[index]}/>
                                                    )
                                                }
                                                else{
                                                    // continue until last false (count++)
                                                    // and then do a mapping of range(count)
                                                    // if odd, in middle one, if even, in between middle two
                                                    // equation for middle : len / 2 & len / 2 -n1
                                                    return (
                                                        <Booked item={item} ind={index} key={index} />
                                                    )
                                                }  
                                            }}
                                        />
                                    </View>
                                   
                                )
                            })} */}
                            
                            {roomData.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <View style={[
                                                        styles.titles, 
                                                        index == (roomData.length - 1) ? null : { borderRightWidth: 1 },
                                                        roomData.length == 1 ? { width: windowWidth - 20 - HOUR_W } : { width: TITLE_W }
                                                    ]}>
                                            <Text style={styles.titleText}>{roomNames[index]}</Text>
                                        </View>
                                        <TableCol item={item} ind={index} key={index}/>
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>    

            <Modal 
                isVisible={modalVisible}
                backdropTransitionOutTiming={0}
                style={styles.modal}
                onBackButtonPress={() => setModalVisible(!modalVisible)}
                onBackdropPress={() => setModalVisible(!modalVisible)}
                hideModalContentWhileAnimating={true}
                // animationOut={'fadeOut'}
                backdropTransitionInTiming={0}
                useNativeDriver={true}
            >
                <View style={styles.modalBox}>
                    <View style={styles.calendarBox}>
                        <Calendar
                            style={styles.calendars}
                            onDayPress={onDayPress}
                            current={Date()}
                            minDate={Date()}
                            // onDayLongPress={onDayLongPress}
                            hideArrows={false}
                            renderArrow={(direction) => {
                                if(direction === 'left'){
                                    return <FontAwesome5 name="less-than" size={24} color="#BFBEBE" />;
                                }
                                else{
                                    return <FontAwesome5 name="greater-than" size={24} color="#BFBEBE" />;
                                }
                            }}
                            renderHeader={(date) => {
                                return (
                                    <View style={styles.headerBox}>
                                        <Text style={styles.header}>{date.getFullYear()}년 {date.getMonth() + 1}월</Text>
                                    </View>
                                );
                            }}
                            theme={{
                                'stylesheet.calendar.header': {
                                    week: {
                                        // marginTop: 5,
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        borderTopWidth: 1,
                                        borderRightWidth: 1,
                                        borderLeftWidth: 1,
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        borderColor: '#BCBCBC',
                                        backgroundColor: '#F7F7F7',
                                        height: 40,
                                        alignItems: 'center',
                                        marginTop: 8,
                                    },
                                    dayHeader: {
                                        // marginTop: 2,
                                        // marginBottom: 2,
                                        flex: 1,
                                        // flexGrow: 1,
                                        height: 30,
                                        textAlign: 'center',
                                        // borderRightWidth: 0.5,
                                        // borderLeftWidth: 0.5,
                                        // borderWidth: 0.5,
                                        borderColor: 'black',
                                        // paddingBottom: 0,
                                        paddingTop: 5
                                    },
                                },
                                'stylesheet.calendar.main': {
                                    // container: {
                                    //     borderWidth: 20,
                                    //     borderColor: 'red',
                                    // },
                                    // week: {
                                    //     // borderWidth: 5,
                                    //     // borderColor: 'green',
                                    //     flexDirection: 'row',
                                    //     justifyContent: 'space-around'
                                    // },
                                    monthView: {
                                        // backgroundColor: 'orange'
                                        borderBottomWidth: 1,
                                        borderLeftWidth: 1,
                                        borderRightWidth: 1,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10,
                                        borderColor: '#BCBCBC'
                                    },
                                    dayContainer: {
                                        flex: 1,
                                        alignItems: 'center',
                                        // borderLeftWidth: 0.5,
                                        // borderRightWidth: 0.5,
                                        // borderBottomWidth: 0.5,
                                        // borderColor: 'black',
                                        height: 50,
                                    },
                                }
                            }}
                        />
                    </View>
                    
                    <View style={{ alignItems: 'center'}}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text style={styles.buttonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>   
                </View>
            </Modal>
    
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    branchBox: {
        // borderWidth: 2,
        // borderColor: 'red',
        // justifyContent: 'center',
        alignItems: 'center'
    },
    branchButton: {
        backgroundColor: '#17375E',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 30
    },
    branchText: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 16,
    },
    dateBox: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 22,
        // borderWidth: 1,
        // borderColor: 'red',
        alignItems: 'center'
    },
    dateStyle: {
        fontSize: 20,
        color: '#838383',
        fontWeight: 'bold',
        // marginTop: 2.5
    },
    dateTitle: {
        flexDirection: 'row',
    },
    tableBox: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'black',
        flex: 1,
        // borderWidth: 1,
        // borderColor: "purple",
        borderRadius: 10,
        overflow: 'hidden'
    },
    flatList: {
        // borderWidth: 1,
        borderColor: 'black',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        // marginLeft: 10,
        // flex: 1,
        // marginBottom: 10,
        borderBottomWidth: 1,
    },
    itemBox: {
        // padding: 10,
        // borderWidth: 1,
        // borderColor: 'red',
        width: HOUR_W,
        // paddingVertical: 10,
        // borderLeftWidth: 1,
        // borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
    },
    titles: {
        // flexDirection: 'row',
        // width: TITLE_W,
        height: TITLE_H,
        borderBottomWidth: 1,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleText: {
        fontSize: 18
    },
    aboveTime: {
        // padding: 10,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: 'black',
        width: HOUR_W,
        height: TITLE_H,
        // borderTopLeftRadius: 10,
    },
    hourText: {
        // marginLeft: 10,
        textAlign: 'center',
        // flex: 1,
        // borderBottomWidth: 1,
        // borderColor: "black",
        // borderWidth: 1,
        // borderColor: 'orange',
    },
    calendarBox: {
        // borderWidth: 1,
        // borderColor: 'black',
        paddingHorizontal: 20,
        paddingBottom: 15
    },
    calendar: {
        borderWidth: 1, 
        borderColor: 'black',
        // margin: 10,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalBox: {
        borderRadius: 15,
        backgroundColor: 'white',
        // height: 270,
        // width: 300,
    },
    closeButton: {
        backgroundColor: "#262829",
        borderRadius: 7,
        marginBottom: 15,
        paddingVertical: 8,
        paddingHorizontal: 40,
        elevation: 2
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 14,
    },
});

export default TestScreen;