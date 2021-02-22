import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, TouchableHighlight } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = ({ navigation, route }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [select, setSelect] = useState(false);
    const [reserveVisible, setReserveVisible] = useState(false);

    const [modalVisibl, setModalVisibl] = useState(false);
    
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
        navigation.navigate('Table');
    };

    const onDayLongPress = day => {
        setModalVisibl(true);
    }

    var selectedDates;

    if(route.params == undefined){
        selectedDates = {
            '2021-01-16': {selected: true, selectedColor: 'blue'},
            '2021-01-29': {selected: true, selectedColor: 'blue'},
            '2021-01-12': {selected: true, selectedColor: 'blue'},
            '2021-01-06': {selected: true, selectedColor: 'blue'},
            '2021-01-30': {selected: true, selectedColor: 'blue'},
            '2021-01-24': {selected: true, selectedColor: 'blue'},
            '2021-01-17': {marked: true},
            '2021-01-18': {marked: true, dotColor: 'red', activeOpacity: 0},
            '2021-01-19': {disabled: true, disableTouchEvent: true}
        }
    }
    else {
        selectedDates = route.params.dates;
        console.log(route.params.dates);
    }


    return (
        <View>
            <Text>Calendar Screen</Text>
            <Calendar
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

            />

            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisibl}
                    onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>To be Reservation Screen</Text>
                            <TouchableHighlight
                                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                                onPress={() => {
                                    setModalVisibl(!modalVisibl);
                                }}
                                >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>

                <TouchableHighlight
                    style={styles.openButton}
                    onPress={() => {
                        navigation.navigate('Reservation', {dates: selectedDates});
                    }}
                >
                    <Text style={styles.textStyle}>Reserve</Text>
                </TouchableHighlight>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({ 
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
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
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});

export default CalendarScreen;