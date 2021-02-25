import React, {useState} from 'react';
import { View, Text, StyleSheet, Button, TouchableHighlight, TextInput, Platform, Image } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { SliderBox } from 'react-native-image-slider-box';

// import DateTimePicker from '@react-native-community/datetimepicker';

const ReservationScreen = ({ navigation, route }) => {
    const [startTime, setStartTime] = useState("12");
    const [endTime, setEndTime] = useState("0");
    const [memo, setMemo] = useState("");

    // Ask how to choose what pickers show
    const pickerItem = (pLabel, pValue) => {
        return <Picker.Item label={pLabel} value={pValue} />
    }

    const images = [
        require("../../assets/office1.png"),
        require("../../assets/office2.png"),
        require("../../assets/office3.png"),
        require("../../assets/office4.png")
    ];

    const makeReservation = async () => {
        try{
            console.log("Attempting to make reservation...");
            const response = await axios.post('http://112.221.94.101:8980/getEncryptCode', {
                'usercode' : 'admin1'
            });
            console.log(`Got the response!`);
            console.log(response)
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }

    return (
        <View>
            <Text style={{ alignSelf: 'center', fontSize: 18, paddingVertical: 4 }}>1호실</Text>
            <View >
                {/* <Image style={styles.imageStyle} source={require("../../assets/office1.png")} /> */}
                <SliderBox sliderBoxHeight={190} images={images} disableOnPress={true}/>
            </View>
            <Text></Text>
            <View style={{ alignSelf: 'center' }}>
                <Text>3인실</Text>
                <Text>모니터 사용 가능, 화이트보드 사용 가능, 스피커 지원</Text>
            </View>
            <Text></Text>
            <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, marginHorizontal: 15, marginBottom: 10}}/>

            <Text style={{ marginLeft: 13, fontSize: 13 }}>이용 시간</Text>
            <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={styles.pickerViewStyle}>
                    <Picker
                        selectedValue={startTime}
                        style={{height: 30, width: 140 }}
                        onValueChange={(itemValue, itemIndex) =>
                            setStartTime(itemValue)
                        }>
                        {(false) ? <Picker.Item label="8:00 AM" value="8" /> : null} 
                        <Picker.Item label="9:00 AM" value="9" />
                        <Picker.Item label="10:00 AM" value="10" />
                        <Picker.Item label="11:00 AM" value="11" />
                        <Picker.Item label="12:00 PM" value="12" />
                        <Picker.Item label="13:00 PM" value="13" />
                        <Picker.Item label="14:00 PM" value="14" />
                        <Picker.Item label="15:00 PM" value="15" />
                        <Picker.Item label="16:00 PM" value="16" />
                        <Picker.Item label="17:00 PM" value="17" />
                        <Picker.Item label="18:00 PM" value="18" />
                        <Picker.Item label="19:00 PM" value="19" />
                        <Picker.Item label="20:00 PM" value="20" />
                        <Picker.Item label="21:00 PM" value="21" />
                        <Picker.Item label="22:00 PM" value="22" />
                        <Picker.Item label="23:00 PM" value="23" />
                        <Picker.Item label="24:00 AM" value="24" />
                    </Picker>
                </View>
                <Text>~</Text>
                <View style={styles.pickerViewStyle}>
                    <Picker
                        selectedValue={endTime}
                        style={{height: 30, width: 140 }}
                        onValueChange={(itemValue, itemIndex) =>
                            setEndTime(itemValue)
                        }>
                        <Picker.Item label="종료 시간" value="0" />
                        <Picker.Item label="9:00 AM" value="9" />
                        <Picker.Item label="10:00 AM" value="10" />
                        <Picker.Item label="11:00 AM" value="11" />
                        <Picker.Item label="12:00 PM" value="12" />
                        <Picker.Item label="13:00 PM" value="13" />
                        <Picker.Item label="14:00 PM" value="14" />
                        <Picker.Item label="15:00 PM" value="15" />
                        <Picker.Item label="16:00 PM" value="16" />
                        <Picker.Item label="17:00 PM" value="17" />
                        <Picker.Item label="18:00 PM" value="18" />
                        <Picker.Item label="19:00 PM" value="19" />
                        <Picker.Item label="20:00 PM" value="20" />
                        <Picker.Item label="21:00 PM" value="21" />
                        <Picker.Item label="22:00 PM" value="22" />
                        <Picker.Item label="23:00 PM" value="23" />
                        <Picker.Item label="24:00 AM" value="24" />
                    </Picker>
                </View>
            </View>

            <Text style={styles.memoStyle}>메모</Text>
            <TextInput 
                style={{ borderWidth: 1 , height: 40, width: 330, alignSelf: 'center'}} 
                autoCapitalize="none"
                autoCorrect={false}
                value={memo}
                onChangeText={(newValue) => setMemo(newValue)}
            />

            <Text style={styles.costStyle}>총          시간                            원</Text>

            <TouchableHighlight
                style={styles.openButton}
                onPress={() => {
                    navigation.navigate('Reserved');
                }}
            >
                <Text style={styles.textStyle}>예약하기</Text>
            </TouchableHighlight>

        </View>
  );
};

const styles = StyleSheet.create({ 
    memoStyle: {
        marginTop: 6,
        marginLeft: 16,
        marginBottom: 4
    },
    costStyle: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 19,
        fontWeight: "bold"
    },
    imageStyle: {
        width: 330,
        height: 180,
        alignSelf: 'center'
    },
    pickerViewStyle: {
        borderWidth: 1,
        borderColor: 'black'
    },
    openButton: {
        alignSelf: 'center',
        backgroundColor: "#24b4d1",
        borderRadius: 15,
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 88,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
});


export default ReservationScreen;