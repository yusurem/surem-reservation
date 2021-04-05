import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity } from 'react-native';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';

import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons'; 

const CalListScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState('');
    // const [currentDate, setCurrentDate] = useState("2021-08-24");
    const [select, setSelect] = useState(false);
    
    LocaleConfig.locales['kr'] = {
        monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
        dayNamesShort: ['일','월','화','수','목','금','토'],
        today: '오늘'
      };
    LocaleConfig.defaultLocale = 'kr';

    // Day Object looks like: 
    // Object {
    //     "dateString": "2021-02-11",
    //     "day": 11,
    //     "month": 2,
    //     "timestamp": 1613001600000,
    //     "year": 2021,
    // }
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

    const onDayLongPress = (day) => {
        navigation.navigate('Reservation', { startTime: "040000"});
    }
    
    const selectedDates = {
        '2021-03-16': {selected: true, selectedColor: 'blue'},
        '2021-03-29': {selected: true, selectedColor: 'blue'},
        '2021-03-12': {selected: true, selectedColor: 'blue'},
        '2021-03-06': {selected: true, selectedColor: 'blue'},
        '2021-03-30': {selected: true, selectedColor: 'blue'},
        '2021-03-24': {selected: true, selectedColor: 'blue'},
        '2021-03-17': {marked: true},
        '2021-03-18': {marked: true, dotColor: 'red', activeOpacity: 0},
        '2021-03-19': {disabled: true, disableTouchEvent: true}
    }

    /*
              <CalendarList
                    style={styles.calendar}
                    onDayPress={onDayPress}
                    onDayLongPress={onDayLongPress}
                    // hideArrows={true}

                    // markedDates={{ ...selectedDates, 
                    //     [selectedDate]: {
                    //     selected: select,
                    //     disableTouchEvent: false,
                    //     selectedColor: 'rgb(173, 216, 230)', // light blue
                    //     selectedTextColor: 'black'
                    //     }
                    // }}
                    // Enable horizontal scrolling, default = false
                    horizontal={true}
                    // Enable paging on horizontal, default = false
                    pagingEnabled={true}
                    // Set custom calendarWidth.
                />
    */

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}}>
            <View>
                <View style={styles.calendarBox}>
                    <Calendar
                        style={styles.calendars}
                        onDayPress={onDayPress}
                        // current={"2019-10-10"}
                        minDate={Date()}
                        onDayLongPress={onDayLongPress}
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