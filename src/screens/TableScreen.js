import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, BackHandler, Alert, Image, FlatList } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';
import LoadingScreen from './LoadingScreen';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment-timezone';
import { URL } from '../constants';
import BranchModal from '../components/BranchModal';
import * as SQLite from 'expo-sqlite';

const TITLE_H = 60;
const TITLE_W = 170;
const MIN_H = 30;
const HOUR_W = 130;

const TableScreen = ({ navigation, route }) => {
    const db = SQLite.openDatabase("db.db");
    // var exists = false;
    // db.transaction(
    //     (tx) => {
    //         tx.executeSql('SELECT count(*) FROM sqlite_master WHERE type = ? AND name = ?;',
    //             [],
    //             (tx, results) => {
    //                 console.log(results);
    //                 exists = true;
    //             },
    //             (tx, error) => {
    //                 console.log(error);
    //             }
    //         );
    //     }
    // )
    // if(!exists){
    //     navigation.navigate("Branch");
    // }

    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;
    
    const [errorMessageA, setErrorMessageA] = useState("");
    const [resrvLists, setResrvLists] = useState([]);
    const [roomLists, setRoomLists] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [branchModal, setBranchModal] = useState(false);
    const [roomWidth, setRoomWidth] = useState(windowWidth - 30 - 115 - 5);

    const [tableData, setTableData] = useState([]);
    const [called, setCalled] = useState(false);
    const [currBranch, setCurrBranch] = useState(null);

    const [startPerf, setStartPerf] = useState(performance.now());
    const [endPerf, setEndPerf] = useState(0);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');


    console.log("Entered TableScreen. Params: ");
    console.log(route.params);
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
                if(called !== false){
                    navigation.reset({
                        index: 0, 
                        routes: [
                            {name: 'Table'}
                        ] 
                    });
                }
            }  
        });
        return unsubscribe;
    });

    // useEffect(() => {
    //     getBranch();
    // }, [weekDays])

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
        // console.log("INITIAL");
        // console.log(route.params);
    }

    const getBranch = () => {
        console.log("retrieving...");
        db.transaction(
            (tx) => {
                tx.executeSql('select * from Branches order by _id asc;',
                    [],
                    (tx, results) => {
                        // do set current, recentA, recentB 
                        // ex. set(results.row.item(0).current)
                        // console.log(results);
                        setCurrBranch(results.rows._array[results.rows._array.length - 1]);
                    },
                    (tx, error) => {
                        console.log(error);
                    }
                );
            }
        )
    }

    // if(currBranch !== null){
    //     route.params["location"] = currBranch.location;
    //     route.params["branchCode"] = currBranch.branchCode;
    //     route.params["branchName"] = currBranch.branchName;
    // }

    const getReservationList = async (resDate, adCode) => {
        try{
            console.log("Attempting to retreive list of available reservation times...");
            console.log("resrvCTime: " + resDate);
            console.log("adminCode: " + adCode);
            const response = await axios.post(URL + '/getReservationList', {
                resrvCtime: resDate,
                adminCode: adCode,
                // adminCode: 'surem3'

            });
            // console.log(response.data);
           
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                navigation.navigate("Home");
            }

            console.log(" reservation List API call successful!");
            setResrvLists(response.data.roomList);
            setCalled(true);
            // setRefreshing(false);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }
   
    if(currBranch === null){
        if(!('location' in route.params)){
            getBranch();
            return (
                <LoadingScreen/>
            )
        }
    }
    // console.log(currBranch);

    if(resrvLists.length == 0){
        console.log("-----TABLE :: [Initializing Reservation List...]");
        if(!('location' in route.params)){
            route.params["location"] = currBranch.location;
            route.params["branchCode"] = currBranch.branchCode;
            route.params["branchName"] = currBranch.branchName;
        }
        getReservationList(route.params.dateString.replace(/-/g,""), route.params.branchCode);

        // var tt1 = performance.now()
        // console.log("API call took " + (tt1 - tt0) + " milliseconds.")

        return (
            <LoadingScreen/>
        )
    }

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

    const openTimes = [];
    const closeTimes = [];
    const roomCodes = [];
    const roomNames = [];
    for(var i = 0; i < resrvLists.length; i++){
        openTimes.push(parseInt(resrvLists[i].workStartTime.substring(0,4)));
        closeTimes.push(parseInt(resrvLists[i].workEndTime.substring(0,4)));
        roomCodes.push(resrvLists[i].roomCode);
        roomNames.push(resrvLists[i].roomName);
    }

    // console.log("!!!!!!!!!!!!!!!!!!!")
    // console.log(openTimes);
    // console.log(closeTimes);

    const roomTimes = [];
    const roomData = [];
    const optionsList = [];
    const optionValList = [];
    var valid = false;
    for(var i = 0; i < resrvLists.length; i++){
        valid = false;
        var keys = Object.keys(resrvLists[i]);
        const room = [];
        const options = [];
        const optionVals = [];
        for(var j = 0; j < keys.length; j++){
            if(keys[j] !== 'roomCode' && keys[j] !== 'roomName'){
                let temp = keys[j].substring(8);
                if(temp === startHour){
                    valid = true;
                }
                if(valid){
                    if(parseInt(temp) < openTimes[i] || parseInt(temp) >= closeTimes[i]){
                        room.push("closed");
                    }
                    else if(resrvLists[i][keys[j]] === "false"){
                        room.push("false");
                    }
                    else if(moment(keys[j], 'YYYYMMDDHHmm').isBefore()){
                        room.push("pastTime");
                    }
                    else {
                        let hour = parseInt(temp.substring(0,2));
                        let min = temp.substring(2);
                        options.push(`${hour}:${min} ${hour > 11 ? "PM" : "AM"}`);
                        optionVals.push(`${hour > 9 ? hour : '0' + hour}${min}00`);
                        room.push("true");
                    }
                    if(i == 0){
                        roomTimes.push(temp + "00");
                    }
                }
            }
        }
        roomData.push(room);
        optionsList.push(options);
        optionValList.push(optionVals);
    }

    // console.log("------------------------")
    // console.log(optionsList);
    // console.log(optionValList);

    // const optionsList = [];
    // const optionValList = [];
    // for(let i = 0; i < roomNames.length; i++){
    //     const options = [];
    //     const optionVals = [];
    //     for(let j = 2; j < (6 * 24) + 2; j++){
    //         // console.log("j: " + j);
    //         if(Object.values(resrvLists[i])[j] === 'true'){
    //             // console.log("j: " + j);
    //             let hour = Math.floor((j - 2) / 6);
    //             let min = (j - 2) % 6;
    //             console.log("hour: " + hour + " min: " + min);
    //             options.push(`${hour}:${min}0 ${hour > 11 ? "PM" : "AM"}`);
    //             optionVals.push(`${hour > 9 ? hour : "0" + hour}${min}000`);
    //         }
    //     }
    //     optionsList.push(options);
    //     optionValList.push(optionVals);
    // }

    const TableCol = ({ item, ind, start }) => {
        return (
            <View>
                {/* <FlatList
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
                                <Avail item={item} ind={index} key={index} rmCode={roomCodes[ind]} ops={optionsList[ind]} opVals={optionValList[ind]} start={roomTimes[index]}/>
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
                /> */}
                {item.map((item, index) => {
                    if(item === "pastTime"){
                        return (
                            <NotAvail item={item} ind={index} key={index} />
                        );
                    }
                    else if(item === "true"){
                        return (
                            <Avail item={item} ind={index} key={index} rmCode={roomCodes[ind]} ops={optionsList[ind]} opVals={optionValList[ind]} start={roomTimes[index]}/>
                        )
                    }
                    else if(item === 'closed'){
                        return (
                            <Closed item={item} ind={index} key={index} />
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
                })}
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

    const Avail = ({ item, index, rmCode, ops, opVals, start}) => {
        return (
            <TouchableOpacity  
                onPress={() => {
                    // console.log({
                    //     dateString: route.params.dateString,
                    //     startTime: start,
                    //     year: route.params.year,
                    //     month: route.params.month,
                    //     day: route.params.day,
                    //     weekDay: route.params.weekDay,
                    //     roomCode: rmCode,
                    //     options: ops,
                    //     optionVals: opVals,
                    // });

                    navigation.navigate("Reservation", { 
                        dateString: route.params.dateString,
                        startTime: start,
                        year: route.params.year,
                        month: route.params.month,
                        day: route.params.day,
                        weekDay: route.params.weekDay,
                        roomCode: rmCode,
                        options: ops,
                        optionVals: opVals,
                    })
                }}
            >
                <View style={{ height: MIN_H, backgroundColor: '#F6F6F6', justifyContent: 'center', borderBottomWidth: 1, borderColor: 'black', borderRightWidth: 1 }}>
                    <Text style={{ textAlign: 'center', color: '#757575' }}>예약가능</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const Closed = ({ item, index }) => {
        return (
            <View style={{ height: MIN_H, justifyContent: 'center', backgroundColor:'#838383', borderBottomWidth: 1, borderColor: 'black', borderRightWidth: 1,}}>
                <Text style={{ textAlign: 'center', color: 'white'}}>영업외시간</Text>
            </View>
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
                        {mins.map((item, index) => {
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
        navigation.replace('Table', { 
            dateString: day.dateString, 
            year: day.year, 
            month: `${day.month < 10 ? 0 : ""}${day.month}`,
            day: `${day.day < 10 ? 0 : ""}${day.day}`,
            weekDay: currDate.getDay()
        });
    };

    const saveBranch = (location, branchCode, branchName) => {
        console.log("inserting...");
        db.transaction(
            (tx) => {
                tx.executeSql("INSERT INTO Branches (location, branchCode, branchName) VALUES(?,?,?);", [location, branchCode, branchName],
                    (tx, results) => {
                        console.log(results);
                    },
                    (txt, error) => {
                        console.log(error);
                    }
                )
            },
        )
    }

    const deleteBranch = (_id) => {
        console.log("deleting...");
        db.transaction(
            (tx) => {
                tx.executeSql(`DELETE FROM Branches WHERE _id = ?;`, [_id],
                    (tx, results) => {
                        console.log(results);
                    },
                    (txt, error) => {
                        console.log(error);
                    }
                )
            },
        )
    }

    const handleBranch = (location, branchCode, branchName, recents) => {
        route.params["location"] = location;
        route.params["branchCode"] = branchCode;
        route.params["branchName"] = branchName;
        
        var deleted = false;
        for(var i = 0; i < recents.length; i++){
            if(recents[i].branchCode === branchCode){
                deleteBranch(recents[i]._id);
                deleted = true;
            }
        }
        if(recents.length > 2){
            if(!deleted){
                deleteBranch(recents[0]._id);
            }
        }
        saveBranch(location, branchCode, branchName);

        setBranchModal(false);
        navigation.replace("Table", route.params)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >
            <View style={styles.branchBox}>
                <View style={styles.branchHolder}>
                    <Text style={styles.branchHolderText}>+ 지점 선택</Text>
                </View>

                {/* <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Branch", route.params);
                    }}
                    style={styles.branchButton}
                >
                    <Text style={styles.branchText}>{route.params.location} {route.params.branchName}점</Text> 
                </TouchableOpacity> */}
                <View style={[styles.branchButton, { }]}>
                    <Text style={styles.branchText}>{route.params.location} {route.params.branchName}점</Text> 
                </View>

                <TouchableOpacity
                    style={[styles.branchSelector]}
                    onPress={() => {
                        setBranchModal(!branchModal);
                    }}
                >
                    <Text style={styles.branchSelectorText}>+ 지점 선택</Text>
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
                            navigation.navigate('Table', { 
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
                        navigation.navigate('Table', { 
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
                <ScrollView
                    nestedScrollEnabled={true}
                    style={{ borderWidth: 0, borderColor: 'black' }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View>
                            {hours.map((item, index) => {
                                return (<RenderItem item={item} key={index} ind={index}/>)
                            })}
                        </View>
                        <ScrollView
                            nestedScrollEnabled={true}
                            horizontal={true}
                        >   
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

            {/* Branch Modal */}

            <BranchModal modalVisible={branchModal} setModalVisible={setBranchModal} handleBranch={handleBranch}/>

            {/* Calendar Modal */}

            <Modal 
                isVisible={modalVisible}
                backdropTransitionOutTiming={0}
                onBackButtonPress={() => setModalVisible(!modalVisible)}
                onBackdropPress={() => setModalVisible(!modalVisible)}
                hideModalContentWhileAnimating={true}
                // animationOut={'fadeOut'}
                // style={{margin: 0, justifyContent: 'flex-end'}}
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
                                        flex: 1,
                                        height: 30,
                                        textAlign: 'center',
                                        borderColor: 'black',
                                        paddingTop: 5
                                    },
                                },
                                'stylesheet.calendar.main': {
                                    monthView: {
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
        // alignItems: 'center'
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        marginTop: 10
    },
    branchButton: {
        backgroundColor: '#17375E',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 20,
        maxWidth: '30%'
    },
    branchText: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    branchHolder: {
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginLeft: 15,
        // maxWidth: '30%'
    },
    branchSelector: {
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#17375E',
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginRight: 15,
        // maxWidth: '25%'
    },
    branchHolderText: {
        color: 'white'
    },
    branchSelectorText: {
        fontSize: 14
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

export default TableScreen;