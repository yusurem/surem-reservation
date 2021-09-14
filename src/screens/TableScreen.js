import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, BackHandler, Alert, Image, FlatList, ImageBackground } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather, Entypo } from '@expo/vector-icons';
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

const TITLE_H = 35;
var TITLE_W = 170;
const MIN_H = 30;
const HOUR_W = 130;
const TABLE_BORDER_COLOR = '#C3C3C3';

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

    const [modalVisible, setModalVisible] = useState(false); // visibility of calendar modal
    const [branchModal, setBranchModal] = useState(false); // visiblity of branch modal

    const [called, setCalled] = useState(false); // checking if the requried APIs were called
    // const [currBranch, setCurrBranch] = useState(null); // the current branch the table is representing

    const currBranch = useRef(null);
    const secondBranch = useRef(null);
    const thirdBranch = useRef(null);
    const recents = useRef([]);
    const usercode = useRef("");
    const secretCode = useRef("");
    const myResrvList = useRef([]);
    const isToday = useRef(false);
    const closed = useRef(false);

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    console.log("[TableScreen]:: Screen has open. --Params: ");
    // console.log(route.params);

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
                            // console.log("[TableScreen]:: Successfully retrieved.");
                            // console.log(results);
                            if(results.rows._array.length === 0){
                                resolve("noBranch");
                            }
                            // else if(results.rows._array.length === 2){
                            //     secondBranch.current = results.rows._array[0];
                            // }
                            // else if(results.rows._array.length === 3){
                            //     thirdBranch.current = results.rows._array[0];
                            //     secondBranch.current = results.rows._array[1]
                            // }

                            currBranch.current = results.rows._array[results.rows._array.length - 1];
                            recents.current = results.rows._array.reverse();
                            resolve("success");
                        },
                        (tx, error) => {
                            console.log(error);
                            reject('error');
                        }
                    );
                }
            )
        })
    }


    // API call for the list of availability for reservation
    const getReservationList = async (resDate, adCode) => {
        try{
            // console.log("[TableScreen]:: Attempting to retreive list of available reservation times...");
            // console.log("resrvCTime: " + resDate);
            // console.log("adminCode: " + adCode);
            const response = await axios.post(URL + '/getReservationList', {
                resrvCtime: resDate,
                adminCode: adCode,
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

            // console.log("[TableScreen]:: Reservation List API call successful!");

            if(response.data.roomList[0].workStartTime === 'close'){
                closed.current = true;
                return;
            }

            setResrvLists(response.data.roomList);

        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    const getUserId = () => {
        // console.log("in getuserID");
        return new Promise((resolve, reject) => {
            db.transaction(async (tx)=>{
                tx.executeSql(
                    `select * from UserId order by _id desc;`,
                    [],
                    (tx, results) =>{ 
                        // console.log("got user id");
                        usercode.current = results.rows.item(0).usercode;
                        secretCode.current = results.rows.item(0).secretCode;
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
                    "내 예약 가져오는데 알수없는 문제가 발생했습니다. 잠시후 다시 시도해주세요."
                );
                return 'Error';
            }
            
            // console.log("[TableScreen]:: Successfully retrieved USERS list of reservation.");
            myResrvList.current = response.data.reservations;
        } catch (err) {
            Alert.alert(
                "내 예약 가져오는데 알수없는 문제가 발생했습니다. 잠시후 다시 시도해주세요."
            );
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
    
    const initialLoading = async () => {
        if(currBranch.current === null){
            // if(!('location' in route.params)){
                const bRes = await getBranch();
                if(bRes !== "success"){
                    navigation.reset({
                        index: 0, 
                        routes: [
                            {name: 'Branch'}
                        ] 
                    });
                };
            // }
        }
        if(!('location' in route.params)){
            route.params['location'] = currBranch.current.location;
            route.params['branchCode'] = currBranch.current.branchCode;
            route.params['branchName'] = currBranch.current.branchName;
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

    if(!called){
        // console.log("[TableScreen]:: INITIALIZING Reservation List...");

        initialLoading();

        return (
            <LoadingScreen/>
        )
    }

    // console.log("[TableScreen]:: FINISHED Intializing Reservation List");

    // separate rendering page for a closed day. For some reason, react won't make me reuse it from the bottom, so have to duplicate
    if(closed.current){
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >

                <View style={styles.branchBox}>
                    <ImageBackground 
                        source={require('../../assets/tableBackground.png')} 
                        resizeMode='cover' 
                        style={styles.bgImage}
                    >
                        <View>
                            <ScrollView 
                                nestedScrollEnabled={true}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            >
                                <View style={styles.recentsBox}>
                                    {recents.current.map((item, index) => {
                                        return <RenderBranch item={item} key={index} ind={index} />
                                    })}
                                </View>
                                
                            </ScrollView>
                        </View>
                        

                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 18}}>
                            <TouchableOpacity
                                    style={styles.branchSelector}
                                    onPress={() => {
                                        setBranchModal(!branchModal);
                                    }}
                                >
                                    <Text style={styles.branchSelectorText}>+지점선택</Text>
                            </TouchableOpacity>
                        </View> 
                        
                    </ImageBackground>
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
                        {/* <MaterialCommunityIcons name="less-than" color="#BFBFBF" size={30} /> */}
                        <Entypo name="chevron-thin-left" size={30} color="#BFBFBF" />
                    </TouchableOpacity>
                        
                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View style={styles.dateTitle}>
                            <View style={{ justifyContent: 'center' }}>
                            <Text style={styles.dateStyle}>{route.params.year}년 {route.params.month}월 {route.params.day}일 ({weekDays[route.params.weekDay]}) </Text>
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                                <AntDesign style={styles.calendarIcon} name="calendar" size={20} color="black" />
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
                        {/* <MaterialCommunityIcons name="greater-than" color="#BFBFBF" size={30} /> */}
                        <Entypo name="chevron-thin-right" size={30} color="#BFBFBF" />
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

    // adjusting the cell width accordingly if the screen is much larger
    let cellWidth = windowWidth - HOUR_W - 20;
    if((TITLE_W * resrvLists.length) < cellWidth){
        TITLE_W = cellWidth / resrvLists.length;
    }
    if(TITLE_W !== 170){
        if((170 * resrvLists.length) >= cellWidth){
            TITLE_W = 170;
        }
    }

    var startTime;
    const mins = [':00', ':10', ':20', ':30', ':40', ':50'];
    var startMinZero = true; // a flag for whether the startTime's minute value is 00 or not
    var endMinZero = true; // a flag for whether the endTime's minute value is 00 or not
    
    if(isToday.current){ // checking if it's today. If it is, determining which time to show
        var todayHr = new Date().getHours(); // number 0~23
        var todayMin = new Date().getMinutes(); // number 0~59
        let tempHr = parseInt(resrvLists[0].workStartTime.substring(0,2));
        let tempMin = parseInt(resrvLists[0].workStartTime.substring(2,4))

        if((todayHr > tempHr) || (todayHr === tempHr && todayMin >= tempMin)){ // checking if current time is past the workStartTime
            todayMin = Math.floor(todayMin / 10);
            if(todayMin === 5){
                todayHr++;
                todayMin = '00';
            }
            else{
                todayMin++;
                todayMin *= 10;
                startMinZero = false;

            }
            startTime = (todayHr > 9 ? todayHr : `0${todayHr}`) + (todayMin + ""); // assigning the startTime of the table as 10 minutes after current time
        }
        else{
            startTime = (tempHr > 9 ? tempHr : `0${tempHr}`) + ((tempMin === 0 ? '00' : tempMin)  + ""); // assigning the startTime as workStartTime because current time is before it
            if(tempMin !== 0){
                startMinZero = false;
            }
        }
    }
    else{
        startTime = `${resrvLists[0].workStartTime.substring(0,4)}`; // assigning the workStartTime because it's not today
        if(resrvLists[0].workStartTime.charAt(2) !== '0'){
            startMinZero = false;
        }
    }

    const endTime = `${resrvLists[0].workEndTime.substring(0,4)}`; // assigning the endTime of the table (minutes is not necessariliy 00)
    if(endTime.substring(2) !== '00'){
        endMinZero = false;
    }

    // making a separate firstHour object for the starting hour of the table. This is because the starting minutes is variable, and depending on whether
    // it is 00 or not, we add the appropriate mins to the 'min' property of the firstHour object
    var firstHour;
    var tempStart = parseInt(startTime.substring(0,2)); // 00 00
    if(startMinZero){
        firstHour = {
            hour: `${tempStart}:00 ${tempStart < 12 ? 'AM' : 'PM'}`,
            mins: [':00', ':10', ':20', ':30', ':40', ':50'],
        }
    }
    else{
        var firstMins = [];
        while(todayMin < 60){
            firstMins.push(`:${todayMin}`);
            todayMin += 10;
        }
        firstHour = {
            hour: `${tempStart}:00 ${tempStart < 12 ? 'AM' : 'PM'}`,
            mins: firstMins,
        }
    }
    tempStart++; // to start from the next hour

    // making a separate lastHour object for the ending hour fo the table. This is because the ending minutes is variable, and depending on whether
    // it is 00 or not, we add the appropriate mins to the 'min' property fo the lastHour object
    // it's slightly different for the end Hour because if it's 00 then you don't show it at all, but if it's not, then you have to show it
    // for instance, if it's 8:00, then you don't show the 8:00 section at all. But if it's 8:20, then you have to show till the 20 minute mark.
    var lastHour;
    var endHour = parseInt(endTime.substring(0,2));
    var endMin = parseInt(endTime.substring(2));
    if(!endMinZero){
        var lastMins = [':00'];
        let temp = 10;
        while(temp <= endMin){
            lastMins.push(`:${temp}`);
            temp += 10;
        }
        lastHour = {
            hour: `${endHour}:00 ${endHour < 12 ? 'AM' : 'PM'}`,
            mins: lastMins,
        }
    }

    const hours = [];
    while(tempStart !== endHour){ // tendHour 24
        hours.push(`${tempStart}:00 ${tempStart < 12 ? 'AM' : 'PM'}`);
        tempStart++;
    }

    // extracting roomCodes and roomNames & setting up for the user's reservations
    const roomCodes = [];
    const roomNames = [];
    const myResrv = [];
    var rmCodeMap = {}
    for(var i = 0; i < resrvLists.length; i++){
        roomCodes.push(resrvLists[i].roomCode);
        roomNames.push(resrvLists[i].roomName);
        myResrv.push([]);
        rmCodeMap[resrvLists[i].roomCode] = i;
    }

    // extracting my reservations based on current branch
    for(var i = 0; i < myResrvList.current.length; i++){
        if(roomCodes.includes(myResrvList.current[i].roomCode)){
            myResrv[rmCodeMap[myResrvList.current[i].roomCode]].push({
                resrvStime: myResrvList.current[i].resrvStime,
                resrvEtime: myResrvList.current[i].resrvEtime,
            })
        }
    }

    const isMyResrv = (time, index) => {
        for(var i = 0; i < myResrv[index].length; i++){
            if(myResrv[index][i].resrvStime === time){
                return i;
            }
        }
        return -1;
    }


    const roomTimes = [];
    const roomData = [];
    const optionsList = [];
    const optionValList = [];
    var valid = false;
    var myResrvEnd = null;
    var count; // used to keep track of how many consecutive cells are displaying the same info 
    var unavail = false;
    for(var i = 0; i < resrvLists.length; i++){
        valid = false;
        unavail = false;
        myResrvEnd = null;
        var keys = Object.keys(resrvLists[i]);
        const room = [];
        const options = [];
        const optionVals = [];
        for(var j = 0; j < keys.length; j++){
            if(keys[j] !== 'roomCode' && keys[j] !== 'roomName'){
                let temp = keys[j].substring(8);
                if(temp === startTime){
                    valid = true;
                }
                else if(temp === endTime){
                    valid = false;
                }
                if(valid && i == 0){
                    roomTimes.push(temp + '00');
                }

                if(valid && unavail){
                    if(resrvLists[i][keys[j]] === 'false'){
                        let index = isMyResrv(keys[j] + "00", i);
                        if(index === -1){
                            count++;
                            continue;
                        }
                    }
                    unavail = false;
                    room.push({
                        status: 'false',
                        size: count,
                    })
                    count = 0;
                }

                if(valid && myResrvEnd !== null){
                    if(myResrvEnd === keys[j] + "00"){
                        myResrvEnd = null;
                        room.push({
                            status: 'mine',
                            size: count,
                        });
                        count = 0;
                    }
                    else {
                        count++;
                        continue;
                    }
                }

                if(valid){
                    if(resrvLists[i][keys[j]] === "false"){
                        // console.log(keys[j]);
                        let index = isMyResrv(keys[j] + "00", i);
                        if(index === -1){
                            if(temp === '2350'){
                                room.push({
                                    status: 'false',
                                    size: 1
                                });
                                continue;
                            }
                            unavail = true;
                            count = 1;
                        }
                        else {
                            if(temp === '2350'){
                                room.push({
                                    status: 'mine',
                                    size: 1
                                });
                                continue;
                            }
                            myResrvEnd = myResrv[i][index].resrvEtime;
                            count = 1;
                        }
                    }
                    else {
                        let hour = parseInt(temp.substring(0,2));
                        let min = temp.substring(2);
                        options.push(`${hour}:${min} ${hour > 11 ? "PM" : "AM"}`);
                        optionVals.push(`${hour > 9 ? hour : '0' + hour}${min}00`);
                        // room.push("true");
                        room.push({
                            status: 'true',
                            size: 1
                        })
                    }
                }
            }
        }
        roomData.push(room);
        optionsList.push(options);
        optionValList.push(optionVals);
    }


    const TableCol = ({ item, ind, start }) => {
        var startIndex = -1;
        let startLen = firstHour.mins.length;
        var bgColor = '#F6F6F6';
        var afterStart = false;
        let count = 0;
        return (
            <View>
                {/* <FlatList
                    scrollEnabled={false}
                    keyExtractor={(item, index) => item + index}
                    data={item}
                    RenderHour={({ item, index }) => {
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
                    // if(count > startLen - 1){
                    //     afterStart = true;  
                    // }
                    // if(afterStart){
                    //     if(index - startLen === 0){
                    //         bgColor = 'white';
                    //     }
                    //     else{
                    //         // console.log((index - startLen) % 6);

                    //         if((index - startLen) % 6 === 0){
                    //             console.log(index);
                    //             if(bgColor === 'white'){
                    //                 bgColor = '#F6F6F6';
                    //             }
                    //             else{
                    //                 bgColor = 'white';
                    //             }
                    //         }
                    //     }
                    // }
                    if(item.status === "true"){
                        startIndex++;
                        return (
                            <Avail key={index} background={bgColor} rmCode={roomCodes[ind]} ops={optionsList[ind]} opVals={optionValList[ind]} start={roomTimes[startIndex]}/>
                        )
                    }
                    else if(item.status === 'mine'){
                        startIndex += item.size;
                        return (
                            <MyBooked key={index} size={item.size} />
                        )
                    }
                    else{
                        startIndex += item.size;  
                        return (
                            <Booked key={index} size={item.size} />
                        )
                    }      
                })}
            </View>
        );
    }

    const Avail = ({ background, rmCode, ops, opVals, start}) => {
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
                <View style={{ height: MIN_H, backgroundColor: background, justifyContent: 'center', borderBottomWidth: 1, borderColor: TABLE_BORDER_COLOR, borderRightWidth: 1 }}>
                    <Text style={{ textAlign: 'center', color: '#757575' }}>예약가능</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const Booked = ({ size }) => {
        return (
            <View style={{ height: MIN_H * size, justifyContent: 'center', backgroundColor:'#838383', borderBottomWidth: 1, borderColor: TABLE_BORDER_COLOR, borderRightWidth: 1, alignItems: 'center'}}>
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: 'bold'}}>예약완료</Text>
            </View>
        );
    }

    const MyBooked = ({ size }) => {
        return (
            <View style={{ height: MIN_H * size, justifyContent: 'center', backgroundColor:'#4184E4', borderBottomWidth: 1, borderColor: TABLE_BORDER_COLOR, borderRightWidth: 1, alignItems: 'center'}}>
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: 'bold'}}>내 예약</Text>
            </View>
        );
    }

    const Min = ({ item, ind, hour}) => {
        return (
            <View style={[{ borderColor: TABLE_BORDER_COLOR, borderLeftWidth: 1, height: MIN_H, justifyContent: 'center', paddingHorizontal: 5, alignItems: 'center', width: 50}, ind == 5 ? {borderBottomWidth: 1} : {borderBottomWidth: 1}]}>
                <Text style={{color: 'black'}}>{hour + item}</Text>
            </View>
        );
    }

    const RenderHour = ({ item, ind }) => {
        var hr = item.charAt(1) === ':' ? item.charAt(0) : item.substring(0,2)
        return (
            <View>
                <View style={styles.itemBox}>
                    <View style={{ borderBottomWidth: 1, borderColor: TABLE_BORDER_COLOR, height: MIN_H * 6, flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
                        <Text style={styles.hourText}>{item}</Text>
                    </View>
                    <View style={{ }}>
                        {mins.map((item, index) => {
                            return (<Min item={item} key={index} ind={index} hour={hr} />)
                        })}
                    </View>
                </View>
            </View>
        )
    }

    // The item:
    // firstHour = {
    //     hour: `${tempStart}:00 ${tempStart < 12 ? 'AM' : 'PM'}`,
    //     mins: firstMins,
    // }
    const RenderStartHour = ({ item }) => {
        var hr = item.hour.charAt(1) === ':' ? item.hour.charAt(0) : item.hour.substring(0,2)
        return (
            <View>
                <View style={styles.aboveTime}>
                    <Text style={styles.titleText}>시간</Text>
                </View>
                <View style={styles.itemBox}>
                    <View style={{ borderBottomWidth: 1, borderColor: TABLE_BORDER_COLOR, height: MIN_H * item.mins.length, flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
                        <Text style={styles.hourText}>{item.hour}</Text>
                    </View>
                    <View style={{ }}>
                        {item.mins.map((item, index) => {
                            return (<Min item={item} key={index} ind={index} hour={hr} />)
                        })}
                    </View>
                </View>
            </View>
        )
    }

    // The item: (remember to only call this if endHour's min is nonzero)
    // lastHour = {
    //     hour: `${endHour}:00 ${endHour < 12 ? 'AM' : 'PM'}`,
    //     mins: lastMins,
    // }
    const RenderEndHour = ({ item }) => {
        var hr = item.hour.charAt(1) === ':' ? item.hour.charAt(0) : item.hour.substring(0,2)
        return (
            <View>
                <View style={styles.itemBox}>
                    <View style={{ borderBottomWidth: 1, borderColor: TABLE_BORDER_COLOR, height: MIN_H * item.mins.length, flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
                        <Text style={styles.hourText}>{item.hour}</Text>
                    </View>
                    <View style={{ }}>
                        {item.mins.map((item, index) => {
                            return (<Min item={item} key={index} ind={index} hour={hr} />)
                        })}
                    </View>
                </View>
            </View>
        )
    }

    const onDayPress = day => {
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

    const saveBranch = async (location, branchCode, branchName) => {
        // console.log("[TableScreen]:: Inserting into SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql("INSERT INTO Branches (location, branchCode, branchName) VALUES(?,?,?);", [location, branchCode, branchName],
                        (tx, results) => {
                            // console.log("[TableScreen]:: Successfully inserted.");
                            // console.log(results);
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

    const deleteBranch = (_id) => {
        // console.log("[TableScreen]:: Deleting from SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(`DELETE FROM Branches WHERE _id = ?;`, [_id],
                        (tx, results) => {
                            // console.log("[TableScreen]:: Successfully deleted.");
                            // console.log(results);
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

    const handleBranch = async (location, branchCode, branchName, recents) => {
        route.params["location"] = location;
        route.params["branchCode"] = branchCode;
        route.params["branchName"] = branchName;
        
        var deleted = false;
        for(var i = 0; i < recents.length; i++){
            if(recents[i].branchCode === branchCode){
                await deleteBranch(recents[i]._id);
                deleted = true;
            }
        }
        if(recents.length > 5){
            if(!deleted){
                await deleteBranch(recents[0]._id);
            }
        }
        await saveBranch(location, branchCode, branchName); // this doesnt get waited to be executed

        setBranchModal(false);
        navigation.replace("Table", route.params)
    }

    const handelBranchBtn = async (location, branchCode, branchName, recents) => {
        route.params["location"] = location;
        route.params["branchCode"] = branchCode;
        route.params["branchName"] = branchName;
        
        var deleted = false;
        for(var i = 0; i < recents.length; i++){
            if(recents[i].branchCode === branchCode){
                await deleteBranch(recents[i]._id);
                deleted = true;
            }
        }
        if(recents.length > 5){
            if(!deleted){
                // await deleteBranch(recents[0]._id);
                await deleteBranch(recents[recents.length - 1]._id);
            }
        }
        await saveBranch(location, branchCode, branchName); // this doesnt get waited to be executed
        navigation.replace("Table", route.params);
    }

    const RenderBranch = ({ item, ind }) => {
        if(ind === 0){
            return (
                <View style={styles.currentBranch}>
                    <Text style={styles.currentBranchText}>{item.branchName}점</Text>
                </View>
            );
        }
        else{
            return (
                <TouchableOpacity
                    style={styles.recentBranchBtn}
                    onPress={async () => {
                        await handelBranchBtn(item.location, item.branchCode, item.branchName, recents.current);
                    }}
                >
                    <Text style={styles.recentBranchBtnText}>{item.branchName}점</Text>
                </TouchableOpacity>
            );
        }
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', }} edges={['right', 'left',]} >

            {/* <View style={{borderWidth: 5, borderColor: 'black'}}>
                <Image source={require('../../assets/tableBackground.png')} style={{resizeMode: 'contain'}}/>
            </View> */}
            <View style={styles.branchBox}>
                <ImageBackground 
                    source={require('../../assets/tableBackground.png')} 
                    resizeMode='cover' 
                    style={styles.bgImage}
                >
                    <View>
                        <ScrollView 
                            nestedScrollEnabled={true}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            <View style={styles.recentsBox}>
                                {recents.current.map((item, index) => {
                                    return <RenderBranch item={item} key={index} ind={index} />
                                })}
                            </View>
                            
                        </ScrollView>
                    </View>
                    

                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 18}}>
                        <TouchableOpacity
                                style={styles.branchSelector}
                                onPress={() => {
                                    setBranchModal(!branchModal);
                                }}
                            >
                                <Text style={styles.branchSelectorText}>+지점선택</Text>
                        </TouchableOpacity>
                    </View> 
                    
                </ImageBackground>
            </View>

            {/* <View style={styles.branchBox}>
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
            </View> */}

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
                    {/* <MaterialCommunityIcons name="less-than" color="#BFBFBF" size={30} /> */}
                    <Entypo name="chevron-thin-left" size={25} color="#BFBFBF" />
                </TouchableOpacity>
                    
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.dateTitle}>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={styles.dateStyle}>{route.params.year}년 {route.params.month}월 {route.params.day}일 ({weekDays[route.params.weekDay]}) </Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <AntDesign style={styles.calendarIcon} name="calendar" size={20} color="black" />
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
                    {/* <MaterialCommunityIcons name="greater-than" color="#BFBFBF" size={30} /> */}
                    <Entypo name="chevron-thin-right" size={25} color="#BFBFBF" />
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
                            {/* This is where we render the beginning hour point */}
                            <RenderStartHour item={firstHour} />

                            {/* This is where we render the middle hour points */}
                            {hours.map((item, index) => {
                                return (<RenderHour item={item} key={index} ind={index}/>)
                            })}

                            {/* This is where we render the ending hour point */}
                            {endMinZero ? 
                                null 
                                :
                                <RenderEndHour item={lastHour} />
                            }
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
        // flexDirection: 'row',
        // justifyContent: "space-between",
        // alignItems: 'center',
        // marginTop: 10,
        flex: 0.3,
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    recentsBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 10,
        marginTop: 33,
    },
    recentBranchBtn: {
        borderRadius: 35,
        borderWidth: 1,
        borderColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 15,
        // maxWidth: '25%',
        justifyContent: 'center',
        marginRight: 10
    },
    recentBranchBtnText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14
    },
    currentBranch: {
        backgroundColor: 'white',
        borderRadius: 35,
        paddingVertical: 4,
        paddingHorizontal: 15,
        justifyContent: 'center',
        marginRight: 10,
    },
    currentBranchText: {
        color: '#4485E5',
        textAlign: 'center',
        fontSize: 14,
    },
    branchButton: {

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
        borderRadius: 35,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginLeft: 15,
    },
    branchSelector: {
        backgroundColor: '#2B60AD',
        borderRadius: 35,
        paddingVertical: 5,
        paddingHorizontal: 10,
        // maxWidth: '30%'
    },
    branchHolderText: {
        color: 'white'
    },
    branchSelectorText: {
        color: 'white',
    },
    dateBox: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 22,
        alignItems: 'center'
    },
    dateStyle: {
        fontSize: 16,
        color: 'black',
        // fontWeight: 'bold',
    },
    dateTitle: {
        flexDirection: 'row',
    },
    tableBox: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#B3B3B3',
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden'
    },
    flatList: {
        borderColor: 'black',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        borderBottomWidth: 1,
    },
    itemBox: {
        width: HOUR_W,
        borderRightWidth: 1,
        borderColor: TABLE_BORDER_COLOR,
        flexDirection: 'row',
        alignItems: 'center',
    },
    titles: {
        height: TITLE_H,
        borderBottomWidth: 1,
        borderColor: TABLE_BORDER_COLOR,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleText: {
        fontSize: 14,
        color: 'black'
    },
    aboveTime: {
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: TABLE_BORDER_COLOR,
        width: HOUR_W,
        height: TITLE_H,
        justifyContent: 'center',
        alignItems: 'center'
    },
    hourText: {
        textAlign: 'center',
        color: 'black',
    },
    calendarBox: {
        paddingHorizontal: 20,
        paddingBottom: 15
    },
    calendar: {
        borderWidth: 1, 
        borderColor: 'black',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    
    modalBox: {
        borderRadius: 15,
        backgroundColor: 'white',
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