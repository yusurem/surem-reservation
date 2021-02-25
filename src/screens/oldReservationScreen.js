import React, {useState} from 'react';
import {View, Text, StyleSheet, Button, TouchableHighlight, TextInput, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReservationScreen = ({ navigation, route }) => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    console.log(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };


  return (
    <View>
        <Text style={{ alignSelf: 'center', fontSize: 18 }}>예약하기</Text>
        <View>
            <Button onPress={showDatepicker} title="날짜선택" />
        </View>
        <View>
            <Button onPress={showTimepicker} title="시작시간 선택" />
        </View>
        <View>
            <Button onPress={showTimepicker} title="끝나는 시간 선택" />
        </View>
        {show && (
            <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={onChange}
            />
        )}
        {/* <Text style={{ alignSelf: 'center', fontSize: 15 }}> 
            [현재 고르신 날짜와 시간]
        </Text>
        <Text style={{ alignSelf: 'center', fontSize: 15 }}>{`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`}</Text>
        <Text style={{ alignSelf: 'center', fontSize: 15 }}>{`${date.getHours()}:${date.getMinutes()}`}</Text> */}
        <Text></Text>

        <TouchableHighlight
            style={styles.openButton}
            onPress={() => {
                navigation.navigate('Reserved', 
                {   
                    reservationDate: date, 
                    dates: {...calDates, 
                        [`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`]: 
                            {selected: true, selectedColor: 'blue'}
                    }
                });
            }}
        >
            <Text style={styles.textStyle}>Submit</Text>
        </TouchableHighlight>


    </View>
  );
};

const styles = StyleSheet.create({ 
    openButton: {
        alignSelf: 'center',
        backgroundColor: "rgb(123, 166, 230)",
        borderRadius: 20,
        padding: 20,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
});


export default ReservationScreen;