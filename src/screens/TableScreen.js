import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';


const TableScreen = ({ navigation, route }) => {
    const [errorMessageA, setErrorMessageA] = useState("");
    const [resrvLists, setResrvLists] = useState([]);
    const [locInfo, setLocInfo] = useState("");
    const [roomLists, setRoomLists] = useState("");

    const getLocationList = async () => {
        try{
            console.log("Attempting to retrieve location list...");
            const response = await axios.post('http://112.221.94.101:8980/getLocationList', {
                location: '경기'
            });
            console.log("API call successful!");
            console.log(typeof(response.data));
            // setLocInfo(response.data);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }

    // {"returnCode":"E0000","place":[{"adminCode":"surem2","adminPlaceName":"지점명"}]
    const getRoomList = async () => {
        try{
            console.log("Attempting to retreive room list...");
            const response = await axios.post('http://112.221.94.101:8980/getRoomList', {
                adminPlaceName: '지점명',
                adminCode: "surem2"
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

    const getReservationList = async (resDate, adCode) => {
        try{
            console.log("Attempting to retreive list of available reservation times...");
            // console.log("roomBranch: " + rmBranch);
            console.log("resrvCTime: " + resDate);
            console.log("adminCode: " + adCode);
            const response = await axios.post('http://112.221.94.101:8980/getReservationList', {
                // roomBranch: rmBranch,
                resrvCtime: resDate,
                adminCode: adCode
            });
            // console.log(response.data);
            console.log("API call successful!");
            // setResrvLists(response.data);
            setResrvLists(response.data.roomList);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    console.log("Entered TableScreen. Params: ");
    console.log(route.params);

    // const roomCodes = [ "21D7E4B9B8C840F", "7105507F78B7422", "7F2AB0EE33674A7" ];
    // const roomCodes = [ "21D7E4B9B8C840F", "98A148A0C7134C1", "98A148A0C7134C1" ];

    // const getResrvLists = async () => {
    //     try{
    //         const tempLists = []
    //         for(let i = 0; i < roomCodes.length; i++){
    //             const resrvList = await getAvailableList(route.params.dateString.replace(/-/g,""), roomCodes[i]);
    //             tempLists.push(resrvList);
    //         }
    //         console.log(tempLists);
    //         setResrvLists(tempLists);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    // console.log(locInfo);

    // if(roomList === ""){
    //     getRoomList();
    //     getAvailableList(route.params.dateString.replace(/-/g,""), "surem2");
    // }

    if(resrvLists.length == 0){
        // console.log("Initializing Reservation List");
        var tt0 = performance.now();

        getLocationList();
        // getRoomList();
        getReservationList(route.params.dateString.replace(/-/g,""), "surem2");

        var tt1 = performance.now()
         console.log("API call took " + (tt1 - tt0) + " milliseconds.")

        return (
            <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
                <View style={{ flex: 1, justifyContent: 'center'}}>
                    <Text style={{ textAlign: 'center' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        )
    }
    var t0 = performance.now();


    // console.log(locInfo);
    // console.log(resrvLists);

    const roomCodes = [];
    const roomNames = [];
    for(var i = 0; i < resrvLists.length; i++){
        roomCodes.push(resrvLists[i].roomCode);
        roomNames.push(resrvLists[i].roomName);
    }

    // console.log(roomNames);

    // const roomInfos = [];
    // for(var i = 0; i < roomLists.length; i++){
    //     roomInfos.push({
    //         roomName: roomLists[i].roomName,

    //     });
    // }

    const state = {
        tableHead: ['1호실', '2호실', '3호실', '4호실', '5호실'],
        tableTitle: ['0:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', 
                        '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', 
                        '14:00 PM', '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', 
                        '21:00 PM', '22:00 PM', '23:00 PM'],
        tableData: [],
        minTitle: ['10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',
                '10분', '20분', '30분', '40분', '50분', '60분',                
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

                // console.log(`${hour}:${min}0 ${hour > 11 ? "PM" : "AM"}`);
                options.push(`${hour}:${min}0 ${hour > 11 ? "PM" : "AM"}`);

                // console.log(`${hour > 9 ? hour : "0" + hour}${min}000`);
                optionVals.push(`${hour > 9 ? hour : "0" + hour}${min}000`);

                // options.push(state.tableTitle[j + 1]);
                // optionVals.push(timeValue[j]);
            }
        }
        optionsList.push(options);
        optionValList.push(optionVals);
    }

    // console.log(optionsList);
    // console.log(optionValList);

    // console.log(Object.values(resrvLists[0]).length);

    const tableData = [];
    for(let i = 2; i < state.minTitle.length + 2; i++){
        const rowData = [];
        for(let j = 0; j < state.tableHead.length; j++){
            // console.log(Object.values(resrvLists[j])[i]);
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
        tableData.push(rowData);
    }

    state.tableData = tableData;

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');


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

    return (
        <SafeAreaView style={{ flex: 1}}>
            <ScrollView>
                <View style={styles.mainBox}>
                    <View style={styles.dateBox}>
                        <TouchableOpacity
                            onPress={() => {
                                var newDate = new Date(route.params.dateString);
                                newDate.setDate(newDate.getDate() - 1);
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
                            <MaterialCommunityIcons name="less-than" color="#BFBFBF" size={30} />
                        </TouchableOpacity>

                        <Text style={styles.dateStyle}>{route.params.dateString.replace(/-/g,'.')}({weekDays[route.params.weekDay]})</Text>

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
                                <Table  borderStyle={{ borderWidth: 1, borderColor: '#838383'}}>
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
                                    <Table borderStyle={{ borderWidth: 1, borderColor: '#838383' }}>
                                        <Row data={state.tableHead} style={styles.head} textStyle={styles.text} />
                                        <Rows data={state.tableData} style={styles.row} textStyle={styles.text} />
                                    </Table>
                                </ScrollView>
                            </View>
                        </ScrollView>
                    </View>
                    
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainBox: {
        padding: 15,
        backgroundColor: 'white',
    },
    dateBox: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: '#fff',
        marginHorizontal: 6,
        marginTop: 12,
        marginBottom: 22,
        // borderWidth: 1,
        // borderColor: 'black'
    },
    dateStyle: {
        fontSize: 18,
        color: '#838383',
        fontWeight: 'bold',
        marginTop: 2.5
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
        backgroundColor: '#F6F6F6'  
    },
    wrapper: { 
        flexDirection: 'row' 
    },
    title: { 
        backgroundColor: '#f6f8fa' 
    },
    row: {  
        height: 30,
        width: 700
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
    
});

export default TableScreen;