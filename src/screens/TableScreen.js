import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, BackHandler, Alert, Image } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';
import LoadingScreen from './LoadingScreen';
import Modal from 'react-native-modal';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';

const TableScreen = ({ navigation, route }) => {
    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;
    
    const [errorMessageA, setErrorMessageA] = useState("");
    const [resrvLists, setResrvLists] = useState([]);
    const [roomLists, setRoomLists] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [roomWidth, setRoomWidth] = useState(windowWidth - 30 - 115 - 5);

    const [tableData, setTableData] = useState([]);
    const [called, setCalled] = useState(false);


    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');

    console.log("Entered TableScreen. Params: ");
    console.log(route.params);

    useFocusEffect(() => {
        const backAction = () => {
            Alert.alert(
                "잠시만요!",
                "앱을 종료 하시겠습니까?", 
                [
                    {
                        text: "아니요",
                        onPress: () => null,
                        style: "cancel"
                    },
                    { text: "예", onPress: () => {
                        setExited(true);
                        BackHandler.exitApp(); 
                    }}
            ]);
            return true;
        };
        
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        
        return (() => backHandler.remove());
    },);

    const fc = () => {
        
    }

    useEffect(() => {
        // setResrvLists([]);
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

    
    // Object {
    //     "dateString": "2021-04-15",
    //     "day": "15",
    //     "month": "04",
    //     "weekDay": 4,
    //     "year": 2021,
    // }
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
    

    const getRoomList = async () => {
        try{
            console.log("Attempting to retreive room list...");
            // const response = await axios.post('http://office-api.surem.com/getRoomList', {
            const response = await axios.post('http://112.221.94.101:8980/getRoomList', {

                adminPlaceName: '슈어엠',
                adminCode: "surem3"
            });
            console.log("API call successful!");
            // console.log(response.data);
            setRoomLists(response.data.room);
            // return;
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }

    // 42CDS8E9F0CDF53

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

            if(response.data.roomList.length > 1){
                setRoomWidth(170 * response.data.roomList.length);
            }
            setCalled(true);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }


    if(resrvLists.length == 0){
        console.log("Initializing Reservation List");
        var tt0 = performance.now();
        console.log("Initial roomWidth: " + roomWidth);

        // getRoomList();
        getReservationList(route.params.dateString.replace(/-/g,""), route.params.branchCode);

        var tt1 = performance.now()
        console.log("API call took " + (tt1 - tt0) + " milliseconds.")

        // if(resrvLists.length > 1){
        //     setRoomWidth(170 * resrvLists.length);
        // }

        return (
            <LoadingScreen/>
        )
    }
    console.log("Finished Intializing Reservation List");
    console.log(roomWidth);
    var t0 = performance.now();

    const roomCodes = [];
    const roomNames = [];
    for(var i = 0; i < resrvLists.length; i++){
        roomCodes.push(resrvLists[i].roomCode);
        roomNames.push(resrvLists[i].roomName);
    }

    const state = {
        tableHead: ['1호실', '2호실', '3호실', '4호실', '5호실'],
        tableTitle: ['0:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', 
                        '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', 
                        '14:00 PM', '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', 
                        '21:00 PM', '22:00 PM', '23:00 PM'],
        tableData: [],
        minTitle: ['00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
                    '00분', '10분', '20분', '30분', '40분', '50분',
            ]
    };

    state.tableHead = roomNames;

    // console.log(Object.values(resrvLists[1])[0]);
    const optionsList = [];
    const optionValList = [];
    for(let i = 0; i < state.tableHead.length; i++){
        const options = [];
        const optionVals = [];
        for(let j = 2; j < state.minTitle.length + 2; j++){
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

    // console.log(Object.values(resrvLists[0]).length);
    const tableInfo = [];
    for(let i = 2; i < state.minTitle.length + 2; i++){
        const rowData = [];
        for(let j = 0; j < state.tableHead.length; j++){
            if(Object.values(resrvLists[j])[i] === "true"){
                let hour = Math.floor((i - 2) / 6);
                let min = (i - 2) % 6;
                let sTime = `${hour > 9 ? hour : "0" + hour}${min}000`;
                rowData.push(
                    <TouchableOpacity  
                        onPress={() => navigation.navigate("Reservation", { 
                            dateString: route.params.dateString,
                            startTime: sTime,
                            year: route.params.year,
                            month: route.params.month,
                            day: route.params.day,
                            weekDay: route.params.weekDay,
                            roomCode: roomCodes[j],
                            options: optionsList[j],
                            optionVals: optionValList[j],
                        })}
                    >
                        <View style={{ height: 30, backgroundColor: '#F6F6F6', justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'center', color: '#757575' }}>예약가능</Text>
                        </View>
                    </TouchableOpacity>);
            }
            else {
                rowData.push(
                    <View style={{ height: 30, justifyContent: 'center', backgroundColor:'#838383'}}>
                        <Text style={{ textAlign: 'center', color: 'white'}}>예약완료</Text>
                    </View>
                );
            }
        }
        tableInfo.push(rowData);
    }

    state.tableData = tableInfo;

    const minArr = [];
    for(var i = 0; i < 6 * 24; i++){
        minArr.push(30);
    }

    const hourArr = [];
    for(var i = 0; i < 24; i++){
        hourArr.push(180);
    }

    var t1 = performance.now()
    console.log("Assembling screen took " + (t1 - t0) + " milliseconds.")

    LocaleConfig.locales['kr'] = {
        monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
        dayNamesShort: ['일','월','화','수','목','금','토'],
        today: '오늘'
      };
    LocaleConfig.defaultLocale = 'kr';

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



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >
            <ScrollView>
                <View style={styles.mainBox}>
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
                                // var todayInfo = {
                                //     day: today.getDate(),
                                //     month: today.getMonth() + 1,
                                //     weekDay: today.getDay(),
                                //     year: today.getFullYear()
                                // }
                                var newDate = new Date(route.params.dateString);
                                newDate.setDate(newDate.getDate() - 1);
                                var month = newDate.getMonth() + 1;
                                var date = newDate.getDate();
                                // console.log("comparing date");
                                // console.log(today);
                                // console.log(newDate);
                                // console.log(newDate < today);

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
                                    <AntDesign style={styles.calendarIcon} name="calendar" size={22} color="#838383" />
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
                    
                    <View style={styles.tableBox}>
                        <ScrollView>
                            <View style={styles.container}>
                                <Table  borderStyle={{ borderWidth: 1, borderColor: '#616161'}}>
                                    <TableWrapper style={{}}>
                                        <Cell data="" style={{height: 50}}/>
                                        <TableWrapper style={{flexDirection: 'row'}}>
                                            <TableWrapper style={{width: 80}}>
                                                <Col data={state.tableTitle} style={styles.colHour} heightArr={hourArr} textStyle={styles.text} />
                                            </TableWrapper>
                                            <TableWrapper style={{width:35}}>
                                                <Col data={state.minTitle} style={styles.colMinute} heightArr={minArr} textStyle={styles.minText} />
                                            </TableWrapper>
                                        </TableWrapper>
                                    </TableWrapper>
                                </Table>
                                <ScrollView horizontal={true}>
                                    <Table borderStyle={{ borderWidth: 1, borderColor: '#616161' }}>
                                        <TableWrapper style={{width: roomWidth}}>
                                            <Row data={state.tableHead} style={styles.head} textStyle={styles.text} />
                                        </TableWrapper>
                                        <TableWrapper style={{width: roomWidth}}>
                                            <Rows data={state.tableData} style={styles.row} textStyle={styles.text} />
                                        </TableWrapper>
                                    </Table>
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
                    
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainBox: {
        padding: 15,
        backgroundColor: 'white',
        // borderWidth: 1,
        // borderColor: 'red'
    },
    dateBox: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: '#fff',
        marginHorizontal: 6,
        marginTop: 12,
        marginBottom: 22,
        // borderWidth: 1,
        // borderColor: 'black',
        alignItems: 'center'
    },
    dateStyle: {
        fontSize: 18,
        color: '#838383',
        fontWeight: 'bold',
        // marginTop: 2.5
    },
    tableBox: {
        borderWidth: 1,
        borderRightWidth: 2,
        borderColor: '#838383',
        // borderRadius: 5
    },
    container: { 
        flexDirection: 'row',
        backgroundColor: '#F6F6F6',
    },
    colHour: {
        // height: 200,
        // width: 100,
    },
    colMinute: {
        // height: 10,
        // width: 50
    },
    colHead: {
        width: 90,
    },
    head: {  
        height: 50,  
        backgroundColor: '#F6F6F6',
        // width: 700 
    },
    wrapper: { 
        flexDirection: 'row' 
    },
    title: { 
        backgroundColor: '#f6f8fa' 
    },
    row: {  
        height: 30,
        // width: 700
    },
    text: { 
        textAlign: 'center',
        color: '#545454',
    },
    minText: { 
        textAlign: 'center',
        color: '#545454',
        fontSize: 11
    },
    dateTitle: {
        flexDirection: 'row',
        // alignItems: 'center',
        // borderWidth: 1,
        // borderColor: 'red'
    },
    calendarIcon: {
        // marginTop: 4.5
    },
    headerBox: {
        // marginBottom:20
    },
    header: {
        fontSize: 16.5,
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
    }
});

export default TableScreen;