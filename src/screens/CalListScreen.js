import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { CalendarList } from 'react-native-calendars';

const CalListScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [select, setSelect] = useState(false);
    
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
        // console.log(day);
        navigation.navigate('Table', { date: day.dateString });
    };

    const onDayLongPress = (day) => {
        navigation.navigate("Agenda", {date: day.dateString});
    }
    
    const selectedDates = {
        '2021-02-16': {selected: true, selectedColor: 'blue'},
        '2021-02-29': {selected: true, selectedColor: 'blue'},
        '2021-02-12': {selected: true, selectedColor: 'blue'},
        '2021-02-06': {selected: true, selectedColor: 'blue'},
        '2021-02-30': {selected: true, selectedColor: 'blue'},
        '2021-02-24': {selected: true, selectedColor: 'blue'},
        '2021-02-17': {marked: true},
        '2021-02-18': {marked: true, dotColor: 'red', activeOpacity: 0},
        '2021-02-19': {disabled: true, disableTouchEvent: true}
    }

    return (
        <View>
            <CalendarList
                onDayPress={onDayPress}
                onDayLongPress={onDayLongPress}

                markedDates={{ ...selectedDates, 
                    [selectedDate]: {
                    selected: select,
                    disableTouchEvent: false,
                    selectedColor: 'rgb(173, 216, 230)', // light blue
                    selectedTextColor: 'black'
                    }
                }}
                // Enable horizontal scrolling, default = false
                horizontal={true}
                // Enable paging on horizontal, default = false
                pagingEnabled={true}
                // Set custom calendarWidth.
            />
            <Text></Text>
            <TouchableHighlight
                    style={styles.openButton}
                    onPress={() => {
                        navigation.navigate('Reservation', {dates: selectedDates});
                    }}
                >
                    <Text style={styles.textStyle}>예약하기</Text>
            </TouchableHighlight>
        </View>
    );
}

const styles = StyleSheet.create({
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