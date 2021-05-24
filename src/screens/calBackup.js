import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity } from 'react-native';
import { CalendarList, Calendar } from 'react-native-calendars';

import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons'; 

const CalListScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [currentDate, setCurrentDate] = useState("2021-08-24");
    const [select, setSelect] = useState(false);
    
    // Day Object looks like: 
    // Object {
    //     "dateString": "2021-02-11",
    //     "day": 11,
    //     "month": 2,
    //     "timestamp": 1613001600000,
    //     "year": 2021,
    // }
    const onDayPress = day => {
        // if(selectedDate === day.dateString && select == true){
        //     setSelect(false);
        //     setSelectedDate('');
        // }
        // else{
        //     setSelectedDate(day.dateString);
        //     setSelect(true);
        // }
        // console.log(day.dateString);
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
        navigation.navigate("Agenda", { dateString: day.dateString });
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
                <View style={styles.headerBox}>
                    <TouchableOpacity
                        onPress={() => {
                            var newDate = new Date(currentDate);
                            console.log(newDate.getMonth());
                            if(newDate.getMonth() == 0){
                                newDate.setFullYear(newDate.getFullYear() - 1);
                            }

                            newDate.setMonth((newDate.getMonth() == 0 ? 11 : (newDate.getMonth() - 1)));
                            var month = newDate.getMonth() + 1;
                            setCurrentDate(`${newDate.getFullYear()}-${month > 9 ? month : "0" + month}-${newDate.getDate()}`);
                        }}
                    >
                        <FontAwesome5 name="less-than" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.header}>{currentDate.substring(0,4)}년 {currentDate.charAt(5) == '0' ? currentDate.substring(6,7) : currentDate.substring(5,7)}월</Text>
                    <TouchableOpacity
                        onPress={() => {
                            var newDate = new Date(currentDate);
                            console.log(newDate.getMonth());
                            newDate.setMonth((newDate.getMonth() == 0 ? 11 : (newDate.getMonth() + 1)));
                            var month = newDate.getMonth() + 1;
                            setCurrentDate(`${newDate.getFullYear()}-${month > 9 ? month : "0" + month}-${newDate.getDate()}`);
                        }}
                    >
                        <FontAwesome5 name="greater-than" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.calendarBox}>
                    <Calendar
                        style={styles.calendar}
                        onDayPress={onDayPress}
                        current={currentDate}
                        hideArrows={true}
                        renderHeader={(date) => {
                            return <View><Text>Hi</Text></View>
                        }}
                    />
                </View>
            </View>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 30,
        paddingTop: 30,
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