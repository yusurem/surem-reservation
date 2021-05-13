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

    const dateConfigs = {
        monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
        dayNamesShort: ['일','월','화','수','목','금','토'],
        today: '오늘'
    }

    const timeConfigs = {
        hours: ['0:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', 
                '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', 
                '14:00 PM', '15:00 PM', '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', 
                '21:00 PM', '22:00 PM', '23:00 PM'],
        mins: ['00분', '10분', '20분', '30분', '40분', '50분']
    }

    const mins = ['00분', '10분', '20분', '30분', '40분', '50분'];

    const Min = ({ item, index }) => {
        return (
            <View style={{}}>
                <Text style={[{ borderColor: 'black', borderLeftWidth: 1, padding: 5,  }, index == 5 ? null : {borderBottomWidth: 1}]}>{item}</Text>
            </View>
        );
    }

    const Hour = ({ item, index }) => {
        return (
            <View>
                <Text style={{height: 190, borderWidth: 1, borderColor: 'blue'}}>{item}</Text>
            </View>
        )
    }

    const renderItem = ({ item }) => {
        return (
            <View style={styles.itemBox}>
                <Text style={styles.hourText}>{item}</Text>
                <View style={{ }}>
                    {mins.map((item, index) => {
                        return (<Min item={item} key={index} />)
                    })}
                </View>
            </View>
        )
    }

    const titles = ["1호실", "2호실", "3호살"];

    const avail = [];
    for(var i = 0; i < titles.length; i++){
        const a = [];
        a.push(titles[i]);
        for(var j = 0; j < 115; j++){
            a.push(0);
        }
        avail.push(a);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >

            <View style={styles.titles}>
                <View style={styles.aboveTime}>
                    <Text></Text>
                </View>
            </View>
            <View style={styles.tableBox}>
                
                <View style={styles.flatList}>
                    <FlatList
                        data={timeConfigs.hours}
                        keyExtractor={item => item}
                        renderItem={renderItem}
                    />
                </View>

                <ScrollView
                    // style={{flexDirection: 'row'}}
                    // horizontal={true}
                    nestedScrollEnabled={true}
                    style={{marginRight: 10, borderWidth: 1, borderColor: 'black'}}
                >
                    <ScrollView
                        nestedScrollEnabled={true}
                        horizontal={true}
                    >   
                        <View>
                            {timeConfigs.hours.map((item, index) => {
                                return (<Hour item={item} key={index} />)
                            })}  
                        </View>
                        <View>
                            {timeConfigs.hours.map((item, index) => {
                                return (<Hour item={item} key={index} />)
                            })}  
                        </View>
                        <View>
                            {timeConfigs.hours.map((item, index) => {
                                return (<Hour item={item} key={index} />)
                            })}  
                        </View>
                        <View>
                            {timeConfigs.hours.map((item, index) => {
                                return (<Hour item={item} key={index} />)
                            })}  
                        </View>
                        <View>
                            {timeConfigs.hours.map((item, index) => {
                                return (<Hour item={item} key={index} />)
                            })}  
                        </View>
                      
                    </ScrollView>
                </ScrollView>
            </View>
            
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tableBox: {
        flexDirection: 'row',
        marginLeft: 10,
        marginBottom: 10,
        flex: 1
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
        width: 130,
        // paddingVertical: 10,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
    },
    titles: {
        flexDirection: 'row',
        marginLeft: 10,
        // marginTop: 10
    },
    aboveTime: {
        // padding: 10,
        borderWidth: 1,
        borderColor: 'green',
        width: 130,
        height: 60,
        borderTopLeftRadius: 10,
    },
    hourText: {
        // marginLeft: 10,
        textAlign: 'center',
        flex: 1,
        // borderWidth: 1,
        // borderColor: 'orange',
    }
});

export default TestScreen;