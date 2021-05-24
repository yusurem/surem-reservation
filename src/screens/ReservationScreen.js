import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, useWindowDimensions, TextInput, Platform, Image, Alert, ScrollView, TouchableOpacity,} from 'react-native';

import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { SliderBox } from 'react-native-image-slider-box';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen';
import Modal from 'react-native-modal';
import { URL } from '../constants';

const ReservationScreen = ({ navigation, route }) => {
    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;

    const [startTime, setStartTime] = useState(route.params.startTime);
    const [endTime, setEndTime] = useState("0");
    const [memo, setMemo] = useState("");
    const [errorMessageA, setErrorMessageA] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [roomInfo, setRoomInfo] = useState("Hi");

    const [duration, setDuration] = useState(0);
    const [hours, setHours] = useState(0);
    const [mins, setMins] = useState(0);

    const [totalCost, setTotalCost] = useState("0")
    const [roomName, setRoomName] = useState("회의실");

    const [info, setInfo] = useState("");
    const [subInfo, setSubInfo] = useState("");

    // const [endDates, setEndDates] = useState([]);
    const [endLabels, setEndLabels] = useState([]);
    const [endVals, setEndVals] = useState([]);

    const [imgCodes, setImgCodes] = useState([]);
    const [imgs, setImgs] = useState([]);
    
    const [apiCalled, setApiCalled] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [imgNum, setImgNum] = useState(0);

    console.log("Entered ReservationScreen. Params: ");
    // console.log(route.params);

    const valsToInt = (vals) => {
        var temp;
        const intVals = [];
        for(let i = 0; i < vals.length; i++){
            // temp = (vals[i].charAt(0) == '0' ? vals[i].substring(1) + "" : vals[i].substring(0,2));
            intVals.push(parseInt(vals[i]));
        }
        return intVals;
    }

    const valsToEndDate = (vals) => {
        const dateVals = [];
        var minute;
        var hr;
        for(let i = 0; i < vals.length; i++){
            minute = parseInt(vals[i].charAt(2));
            hr = parseInt(vals[i].substring(0,2));
            if(minute == 5){
                dateVals.push({
                    hour: hr + 1,
                    min: 0,
                })
            }
            else{
                dateVals.push({
                    hour: hr,
                    min: minute + 1,
                })
            }

            // console.log("hour: " + parseInt(vals[i].substring(0,2)));
            // console.log("min: " + parseInt(vals[i].charAt(2)));
            // dateVals.push({
            //     hour: parseInt(vals[i].substring(0,2)),
            //     min: parseInt(vals[i].charAt(2)),
            // });
        }
        // setEndDates(dateVals);
        return dateVals;
    }

    // const findSIndex = (sValue, timeVals) => {
    //     for(let i = 0; i < timeVals.length; i++){
    //         if(timeVals[i] === sValue){
    //             return i;
    //         }
    //     }
    //     return -1; // not found
    // }

    const configureStart = (sValue, timeVals) => {
        console.log("configureStart");
        for(let i = 0; i < timeVals.length; i++){
            if(timeVals[i] === sValue){
                return {
                    index: i,
                    date: {
                        hour: parseInt(timeVals[i].substring(0,2)),
                        min: parseInt(timeVals[i].charAt(2)),
                    }
                };
            }
        }
        return -1; // not found
    }

    const filterEndTime = (sIndex, startVal, timeVals) => {
        console.log("filterEndTime");
        const endVals = [];
        var flag = true;
        var init = startVal;
        for(var i = sIndex; i < timeVals.length; i++){
            if(timeVals[i].hour == init.hour){
                if(timeVals[i].min - init.min == 1){
                    endVals.push(timeVals[i]);
                    flag = false;
                }
            }
            else if(timeVals[i].hour - init.hour == 1){
                if(timeVals[i].min == 0 && init.min == 5){
                    endVals.push(timeVals[i]);
                    flag = false;
                }
            }
            if(flag){
                break;
            }
            init = timeVals[i];
            flag = true;
        }

        return endVals;
    }

    const buildPickerData = (endVals) => {
        const pickerVals = [];
        const pickerLabels = [];
        var flag = false;
        for(var i = 0; i < endVals.length; i++){
            if(endVals[i].hour > 9){
                if(endVals[i].hour == 23 && endVals[i].min == 5){
                    pickerVals.push("000000");
                    pickerLabels.push('24:00 AM');
                    break;
                }
                flag = true;
            }
            pickerVals.push(`${flag ? endVals[i].hour : "0" + endVals[i].hour}${endVals[i].min}000`);
            pickerLabels.push(`${endVals[i].hour}:${endVals[i].min}0 ${flag ? "PM" : "AM"}`);
        }
        setEndVals(pickerVals);
        setEndLabels(pickerLabels);
    }

    const getRoomInfo = async () => {
        try{
            console.log("Attempting to retreive room information...");
            console.log("roomCode: " + route.params.roomCode);
            
            const response = await axios.post(URL + '/getRoomInfo', {
            // const response = await axios.post('http://112.221.94.101:8980/getRoomInfo', {
                roomCode: route.params.roomCode
                // roomCode: '64D1FEC28CFE4A7'
            });
            // console.log('ROOM INFO : ' + response.data)
            // console.log(response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                navigation.navigate("Table");
            }
            console.log("API call successful!");
            return response.data;
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    const getRoomImg = async (code) => {
        try{
            console.log("Attempting to retreive room image...");
            console.log("imgCode: " + code);
            
            const response = await axios.post(URL + '/getRoomImg', {
            // const response = await axios.post('http://112.221.94.101:8980/getRoomImg', {
                imgCode: code
            });
            console.log('ROOM IMAGE :: ' ,response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
            }
            console.log("API call done!");
            return response.data;
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }

    const apiCalls = async () => {
        setApiCalled(true);
        const roomInfo = await getRoomInfo();
        const codes = [roomInfo.room.imgCode1, roomInfo.room.imgCode2, roomInfo.room.imgCode3, roomInfo.room.imgCode4];
        const roomImgs = [];
        // const codes = ["null", "null", "null", "null"];
        // var empty = true;
        for(var i = 0; i < codes.length; i++){
            if(codes[i] !== "null"){
                empty = false;
                var image = await getRoomImg(codes[i]);
                if(image.returnCode === "E0000"){
                    roomImgs.push(image.url);
                    // roomImgs.push("https://reactnative.dev/img/tiny_logo.png")
                }
            }
        }
        // if(empty){
        //     if(imgs.length == 0){
        //         setImgs([
        //             require("../../assets/noimage.jpeg")
        //         ]);
        //     }        
        // }
        // else{
        //     setImgs(roomImgs);
        // }
        setImgs(roomImgs);
        setRoomInfo(roomInfo);
        setInfo(roomInfo.room.info);
        setSubInfo(roomInfo.room.subInfo);
        setRoomName(roomInfo.room.roomName);
    }

    const syncTime = async () => {
        try{
            console.log("Syncing Time...");
            // console.log("roomCode: " + route.params.roomCode);
            console.log("resrvStime: " + `${route.params.year}${route.params.month}${route.params.day}${startTime}`);
            console.log("resrvEtime: " + `${route.params.year}${route.params.month}${route.params.day}${endTime}`);
            const response = await axios.post('http://112.221.94.101:8980/syncTime', {
                'roomCode' : route.params.roomCode,
                'resrvStime' : `${route.params.year}${route.params.month}${route.params.day}${startTime}`,
                'resrvEtime' : `${route.params.year}${route.params.month}${route.params.day}${endTime}`,
                // "roomCode" : "21D7E4B9B8C840F ",
                // “resrvStime” : “20210407110000”,
                // “resrvEtime” : “20210407113000”
            });
            console.log("Got the response!");
            console.log(response.data);
            if(response.data.returnCode == 'E0000'){
                return "E0000";
            }
            else if(response.data.returnCode === 'E1001'){
                // Alert.alert("이미 예약중인 시간입니다. 다른시간을 선택하시거나 잠시후 다시 시도해주세요.");
                return "E1001";
            }
            else{
                Alert.alert("알수없는 문제가 생겼습니다, 잠시후 다시 시도해주세요.");
            }
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
            return 'Error';
        }
    }
    

    useEffect(() => {
        apiCalls();
    }, [apiCalled])

    if(endVals.length == 0){
        console.log("Initializing Data..");
        var start = configureStart(startTime, route.params.optionVals);
        // console.log(start);
        buildPickerData(filterEndTime(start.index, start.date, valsToEndDate(route.params.optionVals)));
        console.log("Done building");
        return (
            <LoadingScreen/>
        )
    }
    
    console.log("---------------------------");
    console.log(imgs);
    console.log("---------------------------");

    const calculatePrice = () => {
        if(route.params.weekDay < 5){
            return (10000 * duration).toLocaleString();
        }
        else{
            return (10000 * duration).toLocaleString();
        }
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}} edges={['right', 'left', 'top']}>
            <ScrollView>
                <View style={styles.mainBox}>
                    <View style={styles.headerBox}>
                        <View style={styles.blueBar}/>
                        <Text style={styles.headerText}>{roomName}</Text>
                    </View>
                    <View style={{alignItems: 'center', marginBottom: 17, marginTop: 7}}>
                        <TouchableOpacity
                            style={{ width: windowWidth - 40, height: 210, borderWidth: 0, borderColor: 'red' }}
                            onPress={() => {
                                setImgNum(0);
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Image 
                                style={{ resizeMode: 'stretch', flex: 1, width: null, height: null, borderRadius: 10 }}
                                source={imgs.length == 0 ? require("../../assets/noimage.jpeg") : { uri: imgs[0] }}
                            />
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', marginHorizontal: 8, marginTop: 5 }}>
                            <TouchableOpacity
                                style={{ width: (windowWidth - 50) / 3.0, height: 70, borderWidth: 0, borderColor: 'blue', marginRight: 5, }}
                                onPress={() => {
                                    if(imgs.length > 1){
                                        setImgNum(1);
                                        setModalVisible(!modalVisible);
                                    }
                                }}
                            >
                                <Image
                                    style={{ resizeMode: 'stretch', flex: 1, width: null, height: null, borderRadius: 10 }}
                                    source={imgs.length < 2 ? require("../../assets/noimage.jpeg") : { uri: imgs[1] }}
                                />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={{ width: (windowWidth - 50) / 3.0, height: 70, borderWidth: 0, borderColor: 'blue', marginRight: 5  }}
                                onPress={() => {
                                    if(imgs.length > 2){
                                        setImgNum(2);
                                        setModalVisible(!modalVisible);
                                    }
                                }}
                            >
                                <Image
                                    style={{ resizeMode: 'stretch', flex: 1, width: null, height: null, borderRadius: 10 }}
                                    source={imgs.length < 3 ? require("../../assets/noimage.jpeg") : { uri: imgs[2] }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ width: (windowWidth - 50) / 3.0, height: 70, borderWidth: 0, borderColor: 'blue'  }}
                                onPress={() => {
                                    if(imgs.length > 3){
                                        setImgNum(3);
                                        setModalVisible(!modalVisible);
                                    }
                                }}
                            >
                                <Image
                                    style={{ resizeMode: 'stretch', flex: 1, width: null, height: null, borderRadius: 10 }}
                                    source={imgs.length < 4 ? require("../../assets/noimage.jpeg") : { uri: imgs[3] }}
                                />
                            </TouchableOpacity>    
                        </View>

                        {/* <SliderBox parentWidth={330} sliderBoxHeight={190} images={imgs} disableOnPress={true}/> */}

                    </View>

                    <View style={styles.headerBox}>
                        <View style={styles.blueBar}/>
                        <Text style={styles.headerText}>시설안내</Text>
                    </View>
                    <View style={styles.description}>
                        <Text style={styles.descriptionText}>{info}</Text>
                    </View>
                    <View style={styles.headerBox}>
                        <View style={styles.blueBar}/>
                        <Text style={styles.headerText}>부가서비스</Text>
                    </View>
                    <View style={styles.description}>
                        <Text style={styles.descriptionText}>{subInfo}</Text>
                    </View>
                    <View style={styles.headerBox}>
                        <View style={styles.blueBar}/>
                        <Text style={styles.headerText}>이용시간</Text>
                    </View>

                    <View style={Platform.OS === 'android' ? styles.pickerBox : styles.iosPickerBox}>
                        <View style={Platform.OS === 'android' ? styles.pickerView : null}>
                            <Picker
                                style={Platform.OS === 'android' ? styles.picker : styles.iosPicker}
                                // itemStyle={styles.pickerItem}
                                selectedValue={startTime}
                                onValueChange={(itemValue, itemIndex) => {
                                    console.log("itemValue: " + itemValue);
                                    var start = configureStart(itemValue, route.params.optionVals);
                                    console.log("this is start");
                                    console.log(start);
                                    buildPickerData(filterEndTime(start.index, start.date, valsToEndDate(route.params.optionVals)));                                    
                                    setStartTime(itemValue);
                                    setEndTime("0");
                                    setDuration(0);
                                    setTotalCost("0")
                                    setIsValid(false);
                                }}>
                                {route.params.options.map((item, index) => {
                                    return (<Picker.Item label={item} color='#A0A0A0' value={route.params.optionVals[index]} key={index}/>) 
                                })}
                            </Picker>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={Platform.OS === 'android' ? {color: '#A0A0A0', fontSize: 20} : {color: '#A0A0A0', fontSize: 50}}>~</Text>
                        </View>
                        <View style={Platform.OS === 'android' ? styles.pickerView : null}>
                            <Picker
                                selectedValue={endTime}
                                style={Platform.OS === 'android' ? styles.picker : styles.iosPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    setEndTime(itemValue);
                                    if(itemValue != "0"){
                                        setErrorMessageA(false);
                                        setIsValid(true);

                                        var startDate = new Date(0, 0, 0, parseInt(startTime.substring(0,2)), parseInt(startTime.charAt(2)) * 10, 0);
                                        var endDate = new Date(0, 0, 0, parseInt(itemValue.substring(0,2)), parseInt(itemValue.charAt(2)) * 10, 0);
                                        var diff = endDate.getTime() - startDate.getTime();
                                        var hours = Math.floor(diff / 1000 / 60 / 60);
                                        diff -= hours * 1000 * 60 * 60;
                                        var minutes = Math.floor(diff / 1000 / 60);

                                        setHours(hours);
                                        setMins(minutes);

                                        var price = (minutes / 10) * parseInt(roomInfo.room.weekPrice);
                                        price += hours * 6 * parseInt(roomInfo.room.weekPrice);
                                        price = price.toLocaleString();

                                        console.log(price);
                                        setTotalCost(price);
                                    }
                                    else{
                                        setErrorMessageA(false);
                                        setIsValid(false);
                                    }
                                }}>
                                <Picker.Item label="종료 시간" color='#A0A0A0' value="0" />
                                {endLabels.map((item, index) => {
                                    return (<Picker.Item label={item} color='#A0A0A0' value={endVals[index]} key={index}/>) 
                                })}
                            </Picker>
                        </View>
                    </View> 


                    <View style={styles.headerBox}>
                        <View style={styles.blueBar}/>
                        <Text style={styles.headerText}>메모</Text>
                    </View>
                    <View style={styles.memoBox}>
                        <TextInput 
                            style={styles.textInput} 
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={memo}
                            onChangeText={(newValue) => setMemo(newValue)}
                        />
                    </View>

                    <View style={[styles.priceBox]}>
                        <Text style={styles.priceText}>총</Text>
                        <View>
                            <Text style={styles.priceText}>     {hours}     </Text>
                            <View style={{ borderBottomColor: '#5D5D5D', borderBottomWidth: 1 }}/>
                        </View>
                        <Text style={styles.priceText}> 시간   </Text>
                        <View>
                            <Text style={styles.priceText}>     {mins}     </Text>
                            <View style={{ borderBottomColor: '#5D5D5D', borderBottomWidth: 1 }}/>
                        </View>
                        <Text style={styles.priceText}> 분   </Text>
                        <View>
                            <Text style={styles.priceText}>     {totalCost}     </Text>
                            <View style={{ borderBottomColor: '#5D5D5D', borderBottomWidth: 1 }}/>
                        </View>
                        <Text style={styles.priceText}>원</Text>
                    </View>
                   
                    <View style={styles.errorBox}>
                        {errorMessageA ? <Text style={styles.errorMessageA}>{errorMessageA}</Text> : <Text style={styles.errorMessageA}></Text>}
                    </View>

                    <View style={styles.buttonView} >
                        <TouchableOpacity
                            style={[ styles.resrvButton, isValid ? styles.valid : styles.invalid ]}
                            onPress={ async () => {
                                if(isValid){
                                    setErrorMessageA(false);

                                    const res = await syncTime();
                                    // const res = 'E0000';
                                    if(res === 'E0000'){
                                        navigation.navigate("Payment", {
                                            startTime: startTime,
                                            endTime: endTime,
                                            dateString: route.params.dateString,
                                            year: route.params.year,
                                            month: route.params.month,
                                            day: route.params.day,
                                            memo: memo,
                                            weekDay: route.params.weekDay,
                                            roomCode: route.params.roomCode,
                                            roomName: roomName,
                                            totalCost: totalCost
                                        });
                                    }
                                    else{
                                        setErrorMessageA("이미 예약중인 시간입니다. 다른시간을 선택하시거나 잠시후 다시 시도해주세요.");
                                    }

                                    
                                }
                                else{
                                    setErrorMessageA("이용시간을 다시 입력해주세요.");
                                }
                            }}
                        >
                            <Text style={ styles.buttonText }>예약하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Modal
                    isVisible={modalVisible}
                    style={{alignSelf: 'center'}}
                >   
                    <View style={{ backgroundColor: 'white', alignItems: 'center', height: windowHeight - 200, width: windowWidth - 100, borderRadius: 10}}>
                        <Image
                            style={{ resizeMode: 'stretch', flex: 1, height: windowHeight - 250, width : windowWidth - 150 }}
                            source={{uri: imgs[imgNum]}}
                        />
                        
                        <TouchableOpacity
                            style={{ backgroundColor: 'gray', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 10, marginBottom: 20 }}
                            onPress={() => {
                                setModalVisible(false);
                            }}
                        >
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
  );
};

const styles = StyleSheet.create({ 
    headerBox: {
        flexDirection: 'row',
        marginBottom: 5,
        // borderWidth: 1,
        // borderColor: 'black'
    },
    blueBar: {
        backgroundColor: '#A1C1F1',
        height: 14.5,
        width: 5,
        borderRadius: 5,
        marginTop: 3.5,
        marginRight: 3
    },
    headerText: {
        fontSize: 14,
        color: "#39393A",
    },
    mainBox: {
        paddingVertical: 10,
        paddingHorizontal: 12
    },
    description: {
        marginLeft: 9,
        marginBottom: 9
    },
    descriptionText: {
        fontSize: 14,
        color: '#39393A',
    },
    pickerBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 12,
        marginHorizontal: 8.5,
    },
    iosPickerBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 12,
        marginHorizontal: 8.5,
        // borderWidth: 1,
        // borderColor: 'green'
    },
    pickerView: {
        borderWidth: 1,
        borderColor: '#B2B2B2',
        borderRadius: 5,
    },
    picker: {
        color: 'black',
        // backgroundColor: 'red',
        height: 30, 
        width: 140
    },
    iosPicker: {
        color: '#B2B2B2',
        // backgroundColor: 'red',
        height: 200, 
        width: 140,
        borderWidth: 1.5,
        borderColor: '#B2B2B2',
        borderRadius: 15,
        // fontSize: 50
    },
    pickerItem: {
        color: 'red',
        textAlign: 'center',
        fontSize: 10,
    },
    memoBox: {
        marginTop: 7,
        marginHorizontal: 8.5,
        marginBottom: 17
    },
    textInput: {
        borderRadius: 7,
        borderColor: '#A0A0A0',
        borderWidth: 1,
        height: 40,
        color: '#A0A0A0',
        paddingHorizontal: 12,
        fontSize: 11,
    },
    priceBox: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 8.5,
        marginBottom: 4,
    },
    priceText: {
        color: '#5D5D5D'
    },
    buttonView: {
        marginHorizontal: 8.5,
        // borderWidth: 1,
        // borderColor: 'black'
        // marginTop: 13,
    },
    resrvButton: {
        alignSelf: 'stretch',
        borderRadius: 15,
        paddingVertical: 12,
        elevation: 2
    },
    buttonText: {
        color: "white",
        textAlign: "center",
        fontSize: 13
    },
    valid: {
        backgroundColor: '#4184E4',
    },
    invalid: {
        backgroundColor: '#D2D1CB',
    },
    errorBox: {
        alignItems: 'flex-end',
        marginBottom: 3,
        marginRight: 0,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    errorMessageA : {
        textAlign: 'center',
        color: 'red',
        fontSize: 12
    }
});


export default ReservationScreen;