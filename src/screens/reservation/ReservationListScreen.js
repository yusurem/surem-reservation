import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SliderComponent } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ReserveHeader from '../../components/ReserveHeader';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import moment from 'moment';
import Dialog from 'react-native-dialog';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';

const Item = ({ item, onClickQrBtn, onClickChangeReserv }) => (
  <View style={styles.item}>
    <View style={styles.leftSide}>
      <Text style={styles.room}>{item.roomName}</Text>
      <Text style={styles.itemText}>날짜 : {moment(item.resrvStime,'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
      <Text style={styles.itemText}>시간 : {moment(item.resrvStime,'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(item.resrvEtime,'YYYYMMDDHHmmss').format('HH:mm')}</Text>
      <Text style={styles.itemText}>메모 : {item.resrvNote.replace('null','')}</Text>
    </View>
    <View style={styles.rightSide}>
      <TouchableOpacity
        style={styles.qrBtn}
        onPress={onClickQrBtn}
      >
        <Text style={styles.qrBtnText}>QR코드</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.qrBtn}
        onPress={onClickChangeReserv}
      >
        <Text style={styles.qrBtnText}>일정변경</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const db = SQLite.openDatabase('db.db');

export default function ReservationListScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [usercode, setUsercode] = useState(null);
  const [secretCode, setSecretCode] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [changeReservVisible, setChangeReservVisible] = useState(false);
  const [qrReservCode, setQrReservCode] = useState('test');
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  
  const [pickerVals, setPickerVals] = useState([]);
  const [endPickerVals, setEndPickerVals] = useState([]);
  const [roomPrice, setRoomPrice] = useState();

  const [selectedResrvCode, setReservCode] = useState();
  const [selectedRoomCode, setSelectedRoomCode] = useState();
  const [selectedRoomName, setSelectedRoomName] = useState();
  const [selectedReservStime, setSelectedReservStime] = useState();
  const [selectedReservEtime, setSelectedReservEtime] = useState();
  const [selectedMemo, onChangeSelectedMemo] = useState();

  const buildPickerData = () => {
    const pickerVals = [];
    for(var i = 0; i < 24; i++){
        for(var j=0; j < 60; j=j+10){
          if(i < 10){
            if(j < 10){
              pickerVals.push( + '0'+i.toString() + '0' + j.toString())
            }else{
              pickerVals.push('0'+i.toString() + j.toString())
            }
          }else{
            if(j < 10){
              pickerVals.push(i.toString() + '0' + j.toString())
            }else{
              pickerVals.push(i.toString() + j.toString())
            }
          }
        }
    }
    pickerVals.push('24:00')

    setPickerVals(pickerVals);
    setEndPickerVals(pickerVals);
  }

  const buildEndPickerData = (startTime) => {
    const pickerData = []
    console.log('hi')
    const findStartIndex = (element) => element === startTime
    var startIndex = pickerVals.findIndex(findStartIndex)
    for(var i=startIndex+1; i <= pickerVals.length-1; i++){
      pickerData.push(pickerVals[i])
    }
    console.log('END TIME :: ',pickerVals[startIndex+1])
    setEndTime(pickerVals[startIndex+1])
    setEndPickerVals(pickerData)
  }

  const getUserId = async () => {
    try{
      console.log('get User Id')
      await db.transaction(async (tx)=>{
        tx.executeSql(
          `select * from UserId order by _id desc;`,
          [],
          (tx, results) =>{
            console.log('get User Id')
            console.log('SELECT DDDDD :: ', results)
            console.log(results)
						setUsercode(results.rows.item(0).usercode)
						setSecretCode(results.rows.item(0).secretCode)
          }
        )
      })
    } catch (err){
      console.log(err);
    }
  };

  const getMyReserveList = async () => {
    var data = JSON.stringify(
				{
					"usercode":usercode,
					"secretCode":secretCode
				}
			);

		// console.log("USERCODE :: ",usercode)
		// console.log("secretCode :: ",secretCode)

    var config = {
      method: 'post',
      url: 'http://112.221.94.101:8980/getReservation',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    axios(config)
      .then(async function (response) {
        if(response.data.returnCode == 'E0000'){
          setReservations(response.data.reservations)
        }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const getRoomInfo = async (roomCode) => {
    var data = JSON.stringify(
				{
					"roomCode":roomCode
				}
			);

    var config = {
      method: 'post',
      url: 'http://112.221.94.101:8980/getRoomInfo',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    await axios(config)
      .then(async function (response) {
        if(response.data.returnCode == 'E0000'){
          setRoomPrice(response.data.room.weekPrice)
        }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const renderItem = ({item}) => { 

    return (
      <Item
        item={item}
        onClickQrBtn={() => {
          clickQrCode(item.resrvCode)
        }}
        onClickChangeReserv={async () => {
          clickChangeReserv()
          setReservCode(item.resrvCode)
          console.log(item.roomCode)
          setSelectedRoomCode(item.roomCode)
          setSelectedRoomName(item.roomName)
          setSelectedReservStime(item.resrvStime)
          setSelectedReservEtime(item.resrvEtime)
          console.log(item.resrvNote)
          onChangeSelectedMemo(item.resrvNote.replace('null',''))
          getRoomInfo(item.roomCode)
          console.log(item.resrvStime)
        }}
        roomName={item.roomName}
      />
    )
  }

  const clickQrCode = (resrvCode) => {
    setQrReservCode(resrvCode)
    setQrVisible(true)
  }

  const clickChangeReserv = () => {
    setChangeReservVisible(true)
  }

  const handleQrCancel = () => {
    setQrVisible(false)
  }

  const handleChangeReservCancel = () => {
    setChangeReservVisible(false)
  }

  const changeReserv = async () => {
    var data = JSON.stringify(
      {
        "resrvCode":selectedResrvCode,
        "usercode":usercode,
        "secretCode":secretCode,
        "roomCode":selectedRoomCode,
        "resrvStime":moment(selectedReservStime,'YYYYMMDDHHmmss').format('YYYYMMDD') + moment(startTime,'HHmm').format('HHmmss'),
        "resrvEtime":moment(selectedReservEtime,'YYYYMMDDHHmmss').format('YYYYMMDD') + moment(endTime,'HHmm').format('HHmmss'),
        "resrvNote":selectedMemo
      }
    );

    console.log(data)

    var config = {
      method: 'post',
      url: 'http://112.221.94.101:8980/modifyReservation',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    await axios(config)
      .then(async function (response) {
        console.log(response.data)
        if(response.data.returnCode == 'E0000'){
          console.log('Success')
        } else if(response.data.returnCode == 'E2005'){
          Alert.alert("예약 시간이 잘못되었습니다.")
        }
    })
    .catch(function (error) {
      console.log(error);
    });
    getMyReserveList();
    buildPickerData();
    setChangeReservVisible(false);
    setStartTime("0000");
    setEndTime("0000");
  }

  useEffect(()=>{
    getUserId();
    buildPickerData();
    getMyReserveList();
    const timer = setInterval(() => {
      getMyReserveList()
    },3000);
    return () => {
      clearInterval(timer);
    };
  },[usercode,secretCode]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
    <ReserveHeader/>
    <FlatList
      data = {reservations}
      renderItem = {renderItem}
      style = {{width:'100%'}}
      keyExtractor = {(item,index) => {
        return index.toString();
      }}
    />
    <View>
      <Dialog.Container visible={qrVisible}>
        <Dialog.Button label="Cancel" onPress={handleQrCancel}/>
        <View style={styles.qrStyle}>
          <QRCode
            size={140}
            value={qrReservCode}
          />
        </View>
      </Dialog.Container>
    </View>
    <View>
      <Dialog.Container visible={changeReservVisible}>
        <Dialog.Title>예약 변경하기</Dialog.Title>
        <Dialog.Button label="Cancel" onPress={handleChangeReservCancel}/>
        <Dialog.Button label="Accept" onPress={changeReserv}/>
        <View>
          <Text>{selectedRoomName}</Text>
          <Text>{moment(selectedReservStime,'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
          <Text>이용시간</Text>
          <Picker
           selectedValue={startTime}
           onValueChange={(itemValue, itemIndex) => {
             setStartTime(itemValue)
             buildEndPickerData(itemValue)
           }}
          >
            {pickerVals.map((item,index)=><Picker.Item label={moment(item,'HHmm').format('HH:mm')} value={item} key={index}/>)}
          </Picker>

          <Picker
           selectedValue={endTime}
           onValueChange={(itemValue, itemIndex) => {
            setEndTime(itemValue)
           }}
          >
            {endPickerVals.map((item,index)=>{return <Picker.Item label={moment(item,'HHmm').format('HH:mm')} value={item} key={index}/>})}  
          </Picker>
          <Text>메모</Text>
          <Dialog.Input value={selectedMemo}
          onChangeText={text => onChangeSelectedMemo(text)}></Dialog.Input>
        </View>
      </Dialog.Container>
    </View>
    </SafeAreaView>
  );  
}

const styles = StyleSheet.create({
    item: {
      height:100,
      borderWidth: 1,
      borderRadius: 10,
      borderLeftColor: '#4084E4',
      borderLeftWidth:8,
      width:'85%',
      alignSelf:'center',
      marginBottom:10,
      borderTopColor: '#EDEDED',
      borderRightColor: '#EDEDED',
      borderBottomColor: '#EDEDED',
      flex:1,
      flexDirection: 'row'
    },
    leftSide: {
      height:'100%',
      flex: 1,
    },
    rightSide: {
      height:'100%',
      flex: 1,
      marginRight:'10%',
      alignItems:'flex-end', 
    },
    contentContainerStyle: {
      flexGrow: 1, 
      justifyContent: 'center'
    },
    itemText : {
      marginLeft: '5%'
    }, 
    room:{
      marginLeft: '5%',
      marginTop:'2%',
      marginBottom:'2%'
    },
    qrBtn:{
      borderRadius:10,
      borderColor:'#F1F1F1',
      backgroundColor:'#F1F1F1',
      borderWidth: 1,
      width:70,
      height:30,
      marginTop:'10%'
    },
    qrBtnText: {
      color:'black',
      width:'100%',
      textAlign:'center',
      textAlignVertical:'center',
      height:'100%'
    },
    qrStyle:{
      alignSelf:'center',
      marginVertical:'15%'
    }
});
  