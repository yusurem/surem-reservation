import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const db = SQLite.openDatabase("db.db");

db.transaction((tx) => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS Branches (_id INTEGER PRIMARY KEY, location TEXT, branchCode TEXT, branchName TEXT);')
})

const TableScreen = ({ navigation, route }) => {
    // constants
    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;
    
    // states
    const [errorMessageA, setErrorMessageA] = useState(""); // errorMessage
    const [resrvLists, setResrvLists] = useState([]); // the full list of availability from API
    // const [usercode, setUsercode] = useState("");
	// const [secretCode, setSecretCode] = useState("");
    // const [myResrvList, setMyResrvList] = useState([]); // users list of reservation
    // const [roomLists, setRoomLists] = useState(""); 
    const [modalVisible, setModalVisible] = useState(false); // visibility of calendar modal
    const [branchModal, setBranchModal] = useState(false); // visiblity of branch modal
    // const [roomWidth, setRoomWidth] = useState(windowWidth - 30 - 115 - 5);

    // const [tableData, setTableData] = useState([]);
    const [called, setCalled] = useState(false); // checking if the requried APIs were called
    const [currBranch, setCurrBranch] = useState(null); // the current branch the table is representing

    const usercode = useRef("");
    const secretCode = useRef("");
    const myResrvList = useRef([]);
    const isToday = useRef(false);
    const closed = useRef(false);

    // const [startPerf, setStartPerf] = useState(performance.now());
    // const [endPerf, setEndPerf] = useState(0);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    console.log("[TableScreen]:: Screen has open. --Params: ");
    // console.log(route.params);
    // console.log(route.params.dateString);
    console.log(called);

    // Focus effect that handles what happens when the back button is pressed on Android
    useFocusEffect(() => {
        const backAction = () => {
            navigation.navigate("Home");
            return true;
        };
        
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        
        return (() => backHandler.remove());
    },);

    // UseEffect that refreshes the Table when the Tab Navigator is pressed by the user
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

    // Getting the most recent branch and setting it for the table
    const getBranch = async () => {
        // console.log("[TableScreen]:: Retrieving from SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql('select * from Branches order by _id asc;',
                        [],
                        (tx, results) => {
                            // do set current, recentA, recentB 
                            // ex. set(results.row.item(0).current)
                            console.log("[TableScreen]:: Successfully retrieved.");
                            // console.log(results);
                            setCurrBranch(results.rows._array[results.rows._array.length - 1]);
                            resolve("success");
                        },
                        (tx, error) => {
                            console.log(error);
                            reject(error);
                        }
                    );
                }
            )
        })
    }

    // API call for the list of availability for reservation
    const getReservationList = async (resDate, adCode) => {
        try{
            console.log("[TableScreen]:: Attempting to retreive list of available reservation times...");
            // console.log("resrvCTime: " + resDate);
            // console.log("adminCode: " + adCode);
            const response = await axios.post(URL + '/getReservationList', {
                resrvCtime: resDate,
                adminCode: adCode,
                // adminCode: 'surem3'

            });
            // console.log(response.data);
           
            if(response.data.returnCode !== "E0000"){
                console.log("[TableScreen]:: Error: " + response.data.returnCode);
                Alert.alert(
                    "API 문제발생",
                    "잠시후 다시 시도해주세요",
                    [
                        {
                            text: "홈으로",
                            onPress: () => { 
                                navigation.navigate("Home");
                            }
                        }
                    ]
                )
            }

            console.log("[TableScreen]:: Reservation List API call successful!");

            if(response.data.roomList[0].workStartTime === 'close'){
                closed.current = true;
                return;
            }

            setResrvLists(response.data.roomList);
            // setCalled(true);
            // setRefreshing(false);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    const getUserId = () => {
        console.log("in getuserID");
        return new Promise((resolve, reject) => {
            db.transaction(async (tx)=>{
                tx.executeSql(
                    `select * from UserId order by _id desc;`,
                    [],
                    (tx, results) =>{ 
                        console.log("got user id");
                        usercode.current = results.rows.item(0).usercode;
                        secretCode.current = results.rows.item(0).secretCode;
                        // setUsercode(results.rows.item(0).usercode)
                        // setSecretCode(results.rows.item(0).secretCode)
                        resolve();
                    },
                    (tx, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    const getReservation = async () => {
        try{
            console.log("[TableScreen]:: Attemting to get list of USERS reservations...");
            console.log("usercode: " + usercode);
            console.log("secretCode: " + secretCode);
            const response = await axios.post(URL + '/getReservation', {
                usercode: usercode.current,
                secretCode: secretCode.current
            });

            // console.log(response.data);

            if(response.data.returnCode !== "E0000"){
                console.log("[TableScreen]:: getReservation Error: " + response.data.returnCode);
                // Alert.alert(
                //     "API 문제발생",
                //     "잠시후 다시 시도해주세요",
                //     [
                //         {
                //             text: "홈으로",
                //             onPress: () => { 
                //                 navigation.navigate("Home");
                //             }
                //         }
                //     ]
                // )
            }
            
            console.log("[TableScreen]:: Successfully retrieved USERS list of reservation.");
            myResrvList.current = response.data.reservations;
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    // Initialization of required parameters of the TableScreen that is called if this is the first screen in the navigator stack at the launch of the application
    // It defines the date as today
    var currDate = new Date();
    var currInfo = {
        day: currDate.getDate(),
        month: currDate.getMonth() + 1,
        weekDay: currDate.getDay(),
        year: currDate.getFullYear()
    }
    if(route.params === undefined){
        route.params = {
            dateString: `${currInfo.year}-${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}-${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`,
            day: `${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`,
            month: `${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}`,
            weekDay: currInfo.weekDay,
            year: currInfo.year
        }

        isToday.current = true;
    }
    else{
        if(route.params.dateString === `${currInfo.year}-${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}-${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`){
            isToday.current = true;
        }
    }
   
    // If there is no branch oh wait make this into a await and use it down there.
    // if(currBranch === null){
    //     if(!('location' in route.params)){
    //         getBranch();
    //         return (
    //             <LoadingScreen/>
    //         )
    //     }
    // }
    
    const initialLoading = async () => {
        if(currBranch === null){
            if(!('location' in route.params)){
                await getBranch();
            }
        }
        if(!('location' in route.params)){
            route.params['location'] = currBranch.location;
            route.params['branchCode'] = currBranch.branchCode;
            route.params['branchName'] = currBranch.branchName;
        }

        await getReservationList(route.params.dateString.replace(/-/g,""), route.params.branchCode);

        if(closed.current){
            setCalled(true);
            return;
        }

        if(resrvLists.length !== 0){
            let end = resrvLists[0].workEndTime.substring(0,4);
            let today = new Date();
    
            if(today.getHours() > parseInt(end.substring(0,2)) && today.getMinutes() > parseInt(end.subsring(2))){
                today.setDate(today.getDate() + 1);
                var todayInfo = {
                    day: today.getDate(),
                    month: today.getMonth() + 1,
                    weekDay: today.getDay(),
                    year: today.getFullYear()
                }
                route.params = {
                    dateString: `${todayInfo.year}-${todayInfo.month > 9 ? todayInfo.month : "0" + todayInfo.month}-${todayInfo.day > 9 ? todayInfo.day : "0" + todayInfo.day}`,
                    day: `${todayInfo.day > 9 ? todayInfo.day : "0" + todayInfo.day}`,
                    month: `${todayInfo.month > 9 ? todayInfo.month : "0" + todayInfo.month}`,
                    weekDay: todayInfo.weekDay,
                    year: currInfo.year
                }
                navigation.replace("Table", route.params);
            }
        }

        await getUserId();

        await getReservation();

        setCalled(true);
    }

    // if(resrvLists.length == 0){
    if(!called){
        console.log("[TableScreen]:: INITIALIZING Reservation List...");

        initialLoading();
        // (async () => await initialLoading())();

        // var tt1 = performance.now()
        // console.log("API call took " + (tt1 - tt0) + " milliseconds.")

        return (
            <LoadingScreen/>
        )
    }

    console.log("[TableScreen]:: FINISHED Intializing Reservation List");

    if(closed.current){
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >
                <View style={styles.branchBox}>
                    <View style={styles.branchHolder}>
                        <Text style={styles.branchHolderText}>+ 지점 선택</Text>
                    </View>
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
                                // setResrvLists([]);
                                setCalled(false);
                                isToday.current = false;
                                navigation.replace('Table', { 
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
                            // console.log("HERAETABEWTAWEBTAETAE!");
                            var newDate = new Date(route.params.dateString);
                            newDate.setDate(newDate.getDate() + 1);
                            var month = newDate.getMonth() + 1;
                            var date = newDate.getDate();
                            // setResrvLists([]);
                            setCalled(false);
                            isToday.current = false;
                            navigation.replace('Table', { 
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

                <View style={{ justifyContent:'center', alignItems:'center', flex: 1 }}>
                        <Text style={styles.loadingText}>영업일이 아닙니다.</Text>
                </View>
            </SafeAreaView>
        );
    }

    LocaleConfig.locales['kr'] = {
        monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
        dayNamesShort: ['일','월','화','수','목','금','토'],
        today: '오늘'
    };
    LocaleConfig.defaultLocale = 'kr';

    // const startHour = "0800";
    // const hours = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', '14:00 PM', 
    //                 '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', '21:00 PM', 
    //                 '22:00 PM', '23:00 PM'];

    var startHour;
    const mins = ['00분', '10분', '20분', '30분', '40분', '50분'];
    
    // console.log("isToday: " + isToday);
    if(isToday.current){
        var todayHour = new Date().getHours(); // number 0~23
        let temp = parseInt(resrvLists[0].workStartTime.substring(0,2));

        if(todayHour < temp){
            startHour = `${resrvLists[0].workStartTime.substring(0,2)}00`;
        }
        else{
            startHour = `${todayHour > 9 ? todayHour : '0' + todayHour }00`;
        }
    }
    else{
        // console.log("OMG HERE YES IT GOT TO THE RIGHT PLACE")
        startHour = `${resrvLists[0].workStartTime.substring(0,2)}00`;
    }

    const endHour = `${resrvLists[0].workEndTime.substring(0,4)}`;

    var tempStart = parseInt(startHour.substring(0,2)); // 00 00
    var endTime = parseInt(resrvLists[0].workEndTime.substring(0,2)); // 23 59 
    if(resrvLists[0].workEndTime.charAt(2) !== '0'){
        endTime++;
    }

    const hours = [];
    while(tempStart !== endTime){ // tendHour 24
        // console.log("here");
        hours.push(`${tempStart}:00 ${tempStart < 12 ? 'AM' : 'PM'}`);
        tempStart++;
    }
    // console.log("[TableScreen]:: this is thours: ");
    // console.log(hours);
    
    
    // var t0 = performance.now();
    // var tt1 = performance.now();
    // console.log("API call took " + (tt1 - startPerf) + " milliseconds.");

    const openTime = parseInt(resrvLists[0].workStartTime.substring(0,4));
    const closeTime = parseInt(resrvLists[0].workEndTime.substring(0,4));
    const roomCodes = [];
    const roomNames = [];
    const myResrv = [];
    var rmCodeMap = {}
    for(var i = 0; i < resrvLists.length; i++){
        // openTimes.push(parseInt(resrvLists[i].workStartTime.substring(0,4)));
        // closeTimes.push(parseInt(resrvLists[i].workEndTime.substring(0,4)));
        roomCodes.push(resrvLists[i].roomCode);
        roomNames.push(resrvLists[i].roomName);
        myResrv.push([]);
        rmCodeMap[resrvLists[i].roomCode] = i;
    }


    for(var i = 0; i < myResrvList.current.length; i++){
        if(roomCodes.includes(myResrvList.current[i].roomCode)){
            myResrv[rmCodeMap[myResrvList.current[i].roomCode]].push({
                resrvStime: myResrvList.current[i].resrvStime,
                resrvEtime: myResrvList.current[i].resrvEtime,
            })
        }
    }

    console.log(myResrv);

    const isMyResrv = (time, index) => {
        for(var i = 0; i < myResrv[index].length; i++){
            if(myResrv[index][i].resrvStime === time){
                return i;
            }
        }
        return -1;
    }

    console.log("OKAY HERE! " + resrvLists[0]["202107222100"]);

    const roomTimes = [];
    const roomData = [];
    const optionsList = [];
    const optionValList = [];
    var valid = false;
    var myResrvEnd = null;
    for(var i = 0; i < resrvLists.length; i++){
        valid = false;
        var keys = Object.keys(resrvLists[i]);
        const room = [];
        const options = [];
        const optionVals = [];
        for(var j = 0; j < keys.length; j++){
            if(keys[j] !== 'roomCode' && keys[j] !== 'roomName'){
                if(myResrvEnd !== null){
                    // check if it's end
                    // console.log(keys[j]);
                    if(myResrvEnd === keys[j] + "00"){
                        myResrvEnd = null;
                    }
                    else {
                        if(i == 0){
                            roomTimes.push(temp + "00");
                        }
                        room.push("mine");
                        continue;
                    }
                }
                let temp = keys[j].substring(8);
                if(temp === startHour){
                    valid = true;
                }
                else if(temp === endHour){
                    valid = false;
                }
                if(valid){
                    if(parseInt(temp) < openTime || parseInt(temp) >= closeTime){
                        room.push("closed");
                    }
                    else if(resrvLists[i][keys[j]] === "false"){
                        let index = isMyResrv(keys[j] + "00", i);
                        if(index === -1){
                            room.push("false");
                        }
                        else {
                            // console.log(myResrv[i]);
                            // console.log(myResrv[i][index]);
                            myResrvEnd = myResrv[i][index].resrvEtime;
                            room.push("mine");
                        }
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
                        roomTimes.push(temp + "00"); // for the startTime in the reservationScreen because it needs it to see where it starts, so geting only for one of the column
                    }
                }
            }
        }
        roomData.push(room);
        optionsList.push(options);
        optionValList.push(optionVals);
    }

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
                    else if(item === 'mine'){
                        return (
                            <MyBooked item={item} ind={index} key={index} />
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
                        adminCode: route.params.branchCode,
                        location: route.params.location,
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

    const MyBooked = ({ item, index }) => {
        return (
            <View style={{ height: MIN_H, justifyContent: 'center', backgroundColor:'#4184E4', borderBottomWidth: 1, borderColor: 'black', borderRightWidth: 1 }}>
                <Text style={{ textAlign: 'center', color: 'white'}}>내 예약</Text>
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
        // console.log(day);
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
        console.log("[TableScreen]:: Inserting into SQlite...");
        db.transaction(
            (tx) => {
                tx.executeSql("INSERT INTO Branches (location, branchCode, branchName) VALUES(?,?,?);", [location, branchCode, branchName],
                    (tx, results) => {
                        console.log("[TableScreen]:: Successfully inserted.");
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
        console.log("[TableScreen]:: Deleting from SQlite...");
        db.transaction(
            (tx) => {
                tx.executeSql(`DELETE FROM Branches WHERE _id = ?;`, [_id],
                    (tx, results) => {
                        console.log("[TableScreen]:: Successfully deleted.");
                        console.log(results);
                    },
                    (txt, error) => {
                        console.log(error);
                    }
                )
            },
        )
    }

    const handleBranch = async (location, branchCode, branchName, recents) => {
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
        saveBranch(location, branchCode, branchName); // this doesnt get waited to be executed

        setBranchModal(false);
        navigation.replace("Table", route.params)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >
            <View style={styles.branchBox}>
                <View style={styles.branchHolder}>
                    <Text style={styles.branchHolderText}>+ 지점 선택</Text>
                </View>
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
                            // setResrvLists([]);
                            setCalled(false);
                            isToday.current = false;
                            navigation.replace('Table', { 
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
                        // console.log("HERAETABEWTAWEBTAETAE!");
                        var newDate = new Date(route.params.dateString);
                        newDate.setDate(newDate.getDate() + 1);
                        var month = newDate.getMonth() + 1;
                        var date = newDate.getDate();
                        // setResrvLists([]);
                        setCalled(false);
                        isToday.current = false;
                        navigation.replace('Table', { 
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

            <BranchModal modalVisible={branchModal} setModalVisible={setBranchModal} handleBranch={handleBranch} db={db}/>

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