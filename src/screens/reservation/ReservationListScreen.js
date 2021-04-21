import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SliderComponent, Button, TextInput, Touchable, Image } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReserveHeader from '../../components/ReserveHeader';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import moment from 'moment';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal'

const Item = ({ item, onClickQrBtn, onClickChangeReserv }) => (
  <View style={styles.item}>
    <View style={styles.leftSide}>
      <Text style={styles.room}>{item.roomName}</Text>
      <Text style={styles.itemText}>날짜 : {moment(item.resrvStime, 'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
      <Text style={styles.itemText}>시간 : {moment(item.resrvStime, 'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(item.resrvEtime, 'YYYYMMDDHHmmss').format('HH:mm')}</Text>
      <Text style={styles.itemText}>메모 : {item.resrvNote.replace('null', '')}</Text>
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
  const [reservations, setReservations] = useState([]);
  const [usercode, setUsercode] = useState(null);
  const [secretCode, setSecretCode] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrReservCode, setQrReservCode] = useState('test');
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();

  const [pickerVals, setPickerVals] = useState([]);
  const [startPickerVals, setStartPickerVals] = useState([]);
  const [endPickerVals, setEndPickerVals] = useState([]);
  const [validPickerVals, setValidPickerVals] = useState([]);

  const [selectedResrvCode, setReservCode] = useState();
  const [selectedRoomCode, setSelectedRoomCode] = useState();
  const [selectedRoomName, setSelectedRoomName] = useState();
  const [selectedReservStime, setSelectedReservStime] = useState();
  const [selectedReservEtime, setSelectedReservEtime] = useState();
  const [selectedMemo, onChangeSelectedMemo] = useState();

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = async () => {
    setModalVisible(!isModalVisible);
  }

  const buildPickerData = async () => {
    const pickerVals = [];
    console.log('STIME ::',selectedReservStime)
    var date = await moment(selectedReservStime, 'YYYYMMDDHHmmss').format('YYYYMMDD')

    for(var i = 0; i < 24; i++){
        for(var j=0; j < 59; j=j+10){
          if(i < 10){
            if(j < 10){
              pickerVals.push(date + '0'+i.toString() + '0' + j.toString())
            }else{
              pickerVals.push(date + '0'+i.toString() + j.toString())
            }
          }else{
            if(j < 10){
              pickerVals.push(date + i.toString() + '0' + j.toString())
            }else{
              pickerVals.push(date + i.toString() + j.toString())
            }
          }
        }
    }

    setPickerVals(pickerVals);
  }

  const buildStartPickerData = (endTime) => {
    const pickerData = []
    const findEndIndex = (element) => element === endTime
    var endIndex = pickerVals.findIndex(findEndIndex)
    for (var i = endIndex - 1; i >= 0; i--) {
      if(validPickerVals.includes(pickerVals[i])){
        pickerData.push(pickerVals[i])
      }else{
        break;
      }
    }
    pickerData.reverse()
    setStartPickerVals(pickerData)
  }

  const buildEndPickerData = async (startTime) => {
    const pickerData = []
    const findStartIndex = (element) => element === startTime
    var startIndex = pickerVals.findIndex(findStartIndex)
    console.log('START INDEX ::',startIndex)
    console.log('PICKER VALS :: ',pickerVals)
    for (var i = startIndex + 1; i <= pickerVals.length - 1; i++) {
      if(validPickerVals.includes(pickerVals[i])){
        pickerData.push(pickerVals[i])
      }else{
        break;
      }
    }
    console.log('VALID DATA :: ',validPickerVals)
    console.log('PICKER DATA :: ',pickerData)
    
    setEndPickerVals(pickerData)
  }

  const getUserId = async () => {
    try {
      await db.transaction(async (tx) => {
        tx.executeSql(
          `select * from UserId order by _id desc;`,
          [],
          (tx, results) => {
            setUsercode(results.rows.item(0).usercode)
            setSecretCode(results.rows.item(0).secretCode)
          }
        )
      })
    } catch (err) {
      console.log(err);
    }
  };

  const getMyReserveList = async () => {
    var data = JSON.stringify(
      {
        "usercode": usercode,
        "secretCode": secretCode
      }
    );

    var config = {
      method: 'post',
      url: 'http://office-api.surem.com/getReservation',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios(config)
      .then(async function (response) {
        if (response.data.returnCode == 'E0000') {
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
        "roomCode": roomCode
      }
    );

    var config = {
      method: 'post',
      url: 'http://office-api.surem.com/getRoomInfo',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    await axios(config)
      .then(async function (response) {
        if (response.data.returnCode == 'E0000') {
          console.log(response.data)
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const renderItem = ({ item }) => {

    return (
      <Item
        item={item}
        onClickQrBtn={() => {
          clickQrCode(item.resrvCode)
        }}
        onClickChangeReserv={async () => {
          setReservCode(item.resrvCode)
          setSelectedRoomCode(item.roomCode)
          setSelectedRoomName(item.roomName)
          setSelectedReservStime(item.resrvStime)
          setSelectedReservEtime(item.resrvEtime)
          onChangeSelectedMemo(item.resrvNote.replace('null', ''))
          getRoomInfo(item.roomCode)
          await getValidReserveTime(item.roomCode, item.roomName, item.resrvStime)
          await buildPickerData();
          toggleModal()
        }}
        roomName={item.roomName}
      />
    )
  }

  const clickQrCode = (resrvCode) => {
    setQrReservCode(resrvCode)
    setQrVisible(true)
  }

  const handleQrCancel = () => {
    setQrVisible(false)
  }

  const handleChangeReservCancel = async () => {
    var data = JSON.stringify(
      {
        "resrvCode": selectedResrvCode,
        "usercode": usercode,
        "secretCode": secretCode
      }
    );

    var config = {
      method: 'post',
      url: 'http://office-api.surem.com/cancelReservation',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    }
    await axios(config)
      .then(async function (response) {

        if (response.data.returnCode == 'E0000') {
          Alert.alert("예약을 취소가 완료됬습니다.")
        } else if (response.data.returnCode == 'E2005') {
          Alert.alert('취소 불가능한 시간 입니다.')
        } else if (response.data.returnCode == 'E2006') {
          Alert.alert("사용자 아이디와 예약자 아이디가 다릅니다.")
        } else if (response.data.returnCode == 'E2007') {
          Alert.alert("사용자가 없음.")
        } else if (response.data.returnCode == 'E2008') {
          Alert.alert("예약코드에 해당하는 예약 없음.")
        } else if (response.data.returnCode == 'E2009') {
          Alert.alert("올바르지 않은 사용자 암호화 코드")
        } else {
          Alert.alert("내부 오류 입니다.")
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    getMyReserveList();
    toggleModal();
  }

  const changeReserv = async () => {
    var data = JSON.stringify(
      {
        "resrvCode": selectedResrvCode,
        "usercode": usercode,
        "secretCode": secretCode,
        "roomCode": selectedRoomCode,
        "resrvStime": moment(startTime, 'YYYYMMDDHHmm').format('YYYYMMDDHHmmss'),
        "resrvEtime": moment(endTime, 'YYYYMMDDHHmm').format('YYYYMMDDHHmmss'),
        "resrvNote": selectedMemo
      }
    );


    var config = {
      method: 'post',
      url: 'http://office-api.surem.com/modifyReservation',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    console.log(config)

    await axios(config)
      .then(async function (response) {
        if (response.data.returnCode.length > 5)
          response.data.returnCode = response.data.returnCode.split(':')[0]

        if (response.data.returnCode == 'E0000') {
          Alert.alert("예약 변경을 완료했습니다.")
        } else if (response.data.returnCode == 'E2003') {
          Alert.alert('올바르지 않은 예약 시간')
        } else if (response.data.returnCode == 'E2004') {
          Alert.alert("이미 예약되어 있는 룸")
        } else if (response.data.returnCode == 'E2005') {
          Alert.alert("변경할 수 없는 예약 시간")
        } else if (response.data.returnCode == 'E2006') {
          Alert.alert("사용자의 아이디와 예약자 아이디가 다름.")
        } else if (response.data.returnCode == 'E2007') {
          Alert.alert("아이디가 없음.")
        } else if (response.data.returnCode == 'E2008') {
          Alert.alert("예약코드에 해당하는 예약 없음")
        } else if (response.data.returnCode == 'E2009') {
          Alert.alert("올바르지 않은 사용자 암호화 코드")
        } else if (response.data.returnCode == 'E2010') {
          Alert.alert("메모 글자 수 초과")
        } else {
          Alert.alert("내부 오류 입니다.")
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    getMyReserveList();
    buildPickerData();
    toggleModal();
    setStartTime(startTime);
    setEndTime(endTime);
  }

  const getValidReserveTime = async (roomCode, roomName, reserveStime) => {
    console.log('reserveStime :: ',reserveStime)
    var data = JSON.stringify(
      {
        "roomCode": roomCode,
        "roomName": roomName,
        "resrvCtime": moment(reserveStime, 'YYYYMMDDHHmmss').format('YYYYMMDD')
      }
    );

    var config = {
      method: 'post',
      url: 'http://office-api.surem.com/getReservationListForRoom',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    console.log(config)

    await axios(config)
      .then(async function (response) {
        const pickerVals = [];
        var index = 0;
        console.log(response.data)
        for(const [key, value] of Object.entries(response.data)){
          if(index > 2){
            if(value == "true"){
              pickerVals.push(key)
            }
          }
          index++;
        }
        setStartPickerVals(pickerVals)
        setEndPickerVals(pickerVals)
        setValidPickerVals(pickerVals)
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    console.log('ddddd')
    getUserId();
    getMyReserveList();
  }, [usercode, secretCode]);

  if (reservations.length == 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ReserveHeader />
        <Text style={{ textAlign: 'center', textAlignVertical: 'center', height: '80%' }}>
          예약이 없습니다.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ReserveHeader />
      <FlatList
        data={reservations}
        renderItem={renderItem}
        style={{ width: '100%' }}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
      />
      <View>
        <Modal
          isVisible={qrVisible}
          onBackdropPress={() => handleQrCancel()}
        >
          <View style={styles.qrStyle}>
            <QRCode
              size={140}
              value={qrReservCode}
            />
          </View>
        </Modal>
      </View>
      <View style={{ flex: 1 }}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.changeReservModal}>
            <View style={styles.changeReservTitle}>
              <View style={{ alignSelf: 'center', flex: 10 }}>
                <Text style={{ marginLeft: '12%', fontSize: 20, color: '#FFFFFF', textAlignVertical: 'center', textAlign: 'center', height: '100%', textAlignVertical: 'center' }}>
                  예약 변경하기
              </Text>
              </View>
              <TouchableOpacity style={{ flex: 1 }} onPress={toggleModal}>
                <Image style={{ width: 20 }} source={require("../../../assets/closeIcon.png")} />
              </TouchableOpacity>
            </View>
            <Text style={{ marginTop: 30, textAlign: 'center' }}>{selectedRoomName}</Text>
            <Text style={{ textAlign: 'center' }}>{moment(selectedReservStime, 'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
            <Text style={{ marginTop: 30, marginLeft: 20 }}>이용 시간</Text>
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'center' }}>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={startTime}
                  onValueChange={async (itemValue, itemIndex) => {
                    setStartTime(itemValue)
                    console.log('START TIME :: ',itemValue)
                    await buildEndPickerData(itemValue)
                  }}
                  itemStyle={styles.pickerItem}
                > 
                  {startPickerVals.map((item, index) => {
                    return <Picker.Item color='#A0A0A0' label={moment(item, 'YYYYMMDDHHmmss').format('HH:mm')} value={item} key={index} />
                  })}
                </Picker>
              </View>
              <View style={styles.middlePickerView}>
                <Text style={{ height: '100%', textAlignVertical: 'center' }}>~</Text>
              </View>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={endTime}
                  onValueChange={async (itemValue, itemIndex) => {
                    console.log(itemValue)
                    setEndTime(itemValue)
                    await buildStartPickerData(itemValue);
                  }}
                  itemStyle={styles.pickerItem}
                >
                  {endPickerVals.map((item, index) => { 
                    return <Picker.Item color='#A0A0A0' label={moment(item, 'YYYYMMDDHHmmss').format('HH:mm')} value={item} key={index} />
                  })}
                </Picker>
              </View>
            </View>
            <View style={{ marginLeft: 20, marginBottom: 20 }}>
              <Text>메모</Text>
              <TextInput onChangeText={onChangeSelectedMemo} value={selectedMemo}></TextInput>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'center' }}>
              <View style={{ flex: 2, marginLeft: 10, marginRight: 10 }}>
                <Button title="예약 변경" onPress={changeReserv} />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Button color='#8F8F8F' title="예약 취소" onPress={handleChangeReservCancel} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    borderLeftColor: '#4084E4',
    borderLeftWidth: 8,
    width: '85%',
    alignSelf: 'center',
    marginBottom: 10,
    borderTopColor: '#EDEDED',
    borderRightColor: '#EDEDED',
    borderBottomColor: '#EDEDED',
    flex: 1,
    flexDirection: 'row'
  },
  leftSide: {
    height: '100%',
    flex: 1,
  },
  rightSide: {
    height: '100%',
    flex: 1,
    marginRight: '10%',
    alignItems: 'flex-end',
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  itemText: {
    marginLeft: '5%'
  },
  room: {
    marginLeft: '5%',
    marginTop: '2%',
    marginBottom: '2%'
  },
  qrBtn: {
    borderRadius: 10,
    borderColor: '#F1F1F1',
    backgroundColor: '#F1F1F1',
    borderWidth: 1,
    width: 70,
    height: 30,
    marginTop: '10%'
  },
  qrBtnText: {
    color: 'black',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: '100%'
  },
  qrStyle: {
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginVertical: '15%',
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 10
  },
  changeReservModal: {
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    height: 400
  },
  changeReservTitle: {
    backgroundColor: '#4084E4',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: '15%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  pickerView: {
    width: 110
  },
  middlePickerView: {
    width: '15%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickerItem: {
    color: '#B2B2B2',
    textAlign: 'center',
    fontSize: 10,
  }
});
