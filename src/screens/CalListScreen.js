import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, BackHandler } from 'react-native';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';

import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons'; 

import { useFocusEffect } from '@react-navigation/native';

const CalListScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [select, setSelect] = useState(false);

    useFocusEffect(() => {
        const backAction = () => {
            navigation.navigate("Home");
            return true;
        };
        
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        
        return (() => backHandler.remove());
    },);
    
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
        let currDate = new Date(day.dateString);
        navigation.navigate('Table', { 
            dateString: day.dateString, 
            year: day.year, 
            month: `${day.month < 10 ? 0 : ""}${day.month}`,
            day: `${day.day < 10 ? 0 : ""}${day.day}`,
            weekDay: currDate.getDay()
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}} edges={['right', 'left', 'top']}>
            <View>
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
            </View>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        // marginBottom:20
    },
    header: {
        fontSize: 16.5,

    },
    calendarBox: {
        // borderWidth: 1,
        // borderColor: 'black'
        padding: 20
    },
    calendar: {
        borderWidth: 1,
        borderColor: 'black',
        // margin: 10,
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 20,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    }
});

export default CalListScreen;