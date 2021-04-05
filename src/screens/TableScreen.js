import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';


const TableScreen = ({ navigation, route }) => {
    const [errorMessageA, setErrorMessageA] = useState("");
    const [resrvLists, setResrvLists] = useState([]);

    const getAvailableList = async (resDate, rmCode) => {
        try{
            console.log("Attempting to retreive list of available reservation times...");
            // console.log("roomBranch: " + rmBranch);
            console.log("resrvCTime: " + resDate);
            console.log("roomCode: " + rmCode);
            const response = await axios.post('http://112.221.94.101:8980/getReservationList', {
                // roomBranch: rmBranch,
                resrvCtime: resDate,
                roomCode: rmCode
            });
            // console.log(response);
            console.log("API call successful!");
            return response.data;
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    console.log("Entered TableScreen. Params: ");
    console.log(route.params);

    const roomCodes = [ "21D7E4B9B8C840F", "7105507F78B7422", "7F2AB0EE33674A7" ];

    const getResrvLists = async () => {
        try{
            const tempLists = []
            for(let i = 0; i < roomCodes.length; i++){
                const resrvList = await getAvailableList(route.params.dateString.replace(/-/g,""), roomCodes[i]);
                tempLists.push(resrvList);
            }
            // console.log(tempLists);
            setResrvLists(tempLists);
        } catch (err) {
            console.log(err);
        }
    }

    if(resrvLists.length == 0){
        console.log("Initializing Reservation List");
        getResrvLists();
        return (
            <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
                <View style={{ flex: 1, justifyContent: 'center'}}>
                    <Text style={{ textAlign: 'center' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const state = {
        tableHead: ['1호실-4인실', '2호실-4인실', '3호실-4인실'],
        tableTitle: ['', '0:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', 
                        '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', 
                        '14:00 PM', '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', 
                        '21:00 PM', '22:00 PM', '23:00 PM'],
        tableData: []
    };

    const timeValue = [ '000000', '010000', '020000', '030000', '040000', '050000', '060000', '070000',
                        '080000', '090000', '100000', '110000', '120000', '130000', '140000', '150000',
                        '160000', '170000', '180000', '190000', '200000', '210000', '220000', '230000' ];

    

    const optionsList = [];
    const optionValList = [];
    for(let i = 0; i < state.tableHead.length; i++){
        const options = [];
        const optionVals = [];
        for(let j = 0; j < state.tableTitle.length - 1; j++){
            if(Object.values(resrvLists[i].timeList[j])[0] === 'true'){
                options.push(state.tableTitle[j + 1]);
                optionVals.push(timeValue[j]);
            }
        }
        optionsList.push(options);
        optionValList.push(optionVals);
    }

    console.log(optionsList);
    console.log(optionValList);

    const tableData = [];
    for(let i = 0; i < state.tableTitle.length - 1; i++){
        const rowData = [];
        for(let j = 0; j < state.tableHead.length; j++){
            // console.log(Object.values(resrvLists[j].timeList[i])[0]);
            if(Object.values(resrvLists[j].timeList[i])[0] === "true"){
                rowData.push(
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Reservation", { 
                            dateString: route.params.dateString,
                            startTime: timeValue[i],
                            year: route.params.year,
                            month: route.params.month,
                            day: route.params.day,
                            weekDay: route.params.weekDay,
                            roomCode: roomCodes[j],
                            options: optionsList[j],
                            optionVals: optionValList[j]
                        })}
                    >
                        <View style={{ height: 50, backgroundColor: '#F6F6F6', justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'center', color: '#757575' }}>예약가능</Text>
                        </View>
                    </TouchableOpacity>);
            }
            else {
                rowData.push(
                    <View style={{ height: 50, justifyContent: 'center', backgroundColor:'#838383'}}>
                        <Text style={{ textAlign: 'center', color: 'white'}}>예약완료</Text>
                    </View>
                );
            }
        }
        tableData.push(rowData);
    }

    state.tableData = tableData;

    const weekDays = new Array('일', '월', '화', '수', '목', '금', '토');


    const reservedElements = (value) => {
        return (
            <View>
                <Text style={{ padding: 19 , backgroundColor:'#f29116', textAlign: 'center'}}>예약완료</Text>
            </View>
        )
    };

    const myReservedElements = (value) => {
        return (
            <View>
                <Text style={{ padding: 19 , backgroundColor:'#51bbe8', textAlign: 'center'}}>내 예약</Text>
            </View>
        )
    };

    // state.tableData[0][0] = reservedElements();
    // state.tableData[1][0] = reservedElements();
    // state.tableData[2][0] = reservedElements();
    // state.tableData[5][2] = reservedElements();
    // state.tableData[9][1] = reservedElements();
    // state.tableData[7][2] = reservedElements();
    // state.tableData[6][2] = reservedElements();
    // state.tableData[6][0] = myReservedElements();
    // state.tableData[7][0] = myReservedElements();

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
                                <Table  borderStyle={{ borderWidth: 1, borderColor: '#838383' }}>
                                    <Col data={state.tableTitle} style={styles.colHead} textStyle={styles.text} />
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
        height: 50,
        width: 400
    },
    text: { 
        textAlign: 'center',
        color: '#545454',
    },
    
});

export default TableScreen;