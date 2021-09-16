import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SliderComponent, Button, TextInput, Touchable, Image, BackHandler } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReserveHeader from '../../components/ReserveHeader';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import moment from 'moment';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal'
import LoadingScreen from '../LoadingScreen';
import 'moment/locale/ko';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { URL } from '../../constants';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const Item = ({ item, onClickQrBtn, onClickChangeReserv }) => (
  <View style={styles.item}>
    <View style={styles.leftSide}>
      <Text style={styles.room}>{item.roomName}</Text>
      <Text style={styles.itemText}>날짜 : {moment(item.resrvStime, 'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
      <Text style={styles.itemText}>시간 : {moment(item.resrvStime, 'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(item.resrvEtime, 'YYYYMMDDHHmmss').format('HH:mm')}</Text>
      <Text style={[styles.itemText,{marginBottom:'3%'}]}>메모 : {item.resrvNote.replace('null', '')}</Text>
    </View>
    <View style={styles.rightSide}>
      <TouchableOpacity
        style={[styles.qrBtn,{backgroundColor: '#F1F1F1',borderColor:'#F1F1F1'}]}
        onPress={onClickQrBtn}
      >
        <Text style={[styles.qrBtnText, {lineHeight: Platform.OS === 'ios' ? 30 : 28,color:'black'}]}>QR코드</Text>
      </TouchableOpacity>
      <View style={{height:10}}></View>
      <TouchableOpacity
        style={[styles.qrBtn,{backgroundColor: '#4084E4',borderColor:'#4084E4'}]}
        onPress={onClickChangeReserv}
      >
        <Text style={[styles.qrBtnText, {lineHeight: Platform.OS === 'ios' ? 30 : 28,color:'white'} ]}>일정 변경</Text>
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

  const [startPickerVals, setStartPickerVals] = useState([]);
  const [endPickerVals, setEndPickerVals] = useState([]);

  const [selectedResrvCode, setReservCode] = useState();
  const [selectedRoomCode, setSelectedRoomCode] = useState();
  const [selectedRoomName, setSelectedRoomName] = useState();
  const [selectedReservStime, setSelectedReservStime] = useState();
  const [selectedReservEtime, setSelectedReservEtime] = useState();
  const [selectedMemo, onChangeSelectedMemo] = useState();

  const [loading, setLoading] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = async () => {
    setModalVisible(!isModalVisible);
  }

  useFocusEffect(() => {
    const backAction = () => {
        navigation.navigate("Home");
        return true;
    };
    
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    
    return (() => backHandler.remove());
  },);

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
      url: URL + '/getReservation',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    console.log(config)
    axios(config)
      .then(async function (response) {
        console.log('RESERVATIONS :: ',response.data)
        if (response.data.returnCode == 'E0000') {
          setReservations(response.data.reservations)
          setLoading(false)
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
      url: URL + '/getRoomInfo',
      // url: 'http://112.221.94.101:8980/getRoomInfo',
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
          setSelectedRoomName(item.roomName)
          setSelectedReservStime(item.resrvStime)
          setSelectedReservEtime(item.resrvEtime)
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
          await getValidReserveTime(
            item.roomCode, 
            item.roomName,
            moment(item.resrvStime, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmm'),
            moment(item.resrvEtime, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmm')
          )
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

  const deletePushId = async (identifier) => {
    console.log('DELETE PUSH ID :: ',identifier)
    return new Promise((resolve, reject)=> {
      db.transaction(
        async (tx) => {
          tx.executeSql("DELETE FROM PUSH_ID WHERE identifier=(?)",[identifier],
            (tx, results) => {
              console.log('RESULTS :: ', results);
              resolve(results);
            },
            (txt, error)=> {
              reject(error);
            }
          )
        }
      )
    })
  }

  const selectPushIdddd = async (identifier) => {
    console.log('SELECT PUSH ID :: ',identifier)
    return new Promise((resolve, reject)=> {
      db.transaction(async (tx) => {
          tx.executeSql(
            "SELECT COUNT(*) AS c FROM PUSH_ID WHERE identifier like '" + identifier +"%'",
            [],
            (tx, results) => {
              console.log("SELECT PUSH COUNT :: ",results.rows._array[0].c)
              resolve(results.rows._array[0].c);
            },
            (txt, error)=> {
              console.log('ERROR :: ', error)
              reject(error);
            }
          )
        }
      )
    })
  }

  const selectPushId = async (identifier) => {
    console.log('SELECT PUSH ID :: ',identifier)
    return new Promise((resolve, reject)=> {
      db.transaction(async (tx) => {
          tx.executeSql(
            "SELECT * FROM PUSH_ID WHERE identifier like '" + identifier +"%'",
            [],
            (tx, results) => {
              console.log("SELECT PUSH COUNT :: ",results.rows._array[0],results.rows._array[0])
              resolve(results.rows._array[0].c);
            },
            (txt, error)=> {
              console.log('ERROR :: ', error)
              reject(error);
            }
          )
        }
      )
    })
  }

  const cancelPush = async (year, month, day, hour, min, roomCode) => {
    console.log("Cancel Push Notification");
    console.log('YEAR :: ', year);
    console.log('MONTH :: ', month);
    console.log('DAY :: ', day);
    console.log('HOUR :: ', hour);
    console.log('MIN :: ', min);
    
    Notifications.cancelScheduledNotificationAsync(`${year}${month}${day}${hour}${min}:${selectedRoomName}`)
    await deletePushId(`${year}${month}${day}${hour}${min}:${selectedRoomName}`)
    var count = 0;
    count = await selectPushId(`${year}${month}${day}`)
    console.log('COUNT :: ',count)
    if(count == 1){
      Notifications.cancelScheduledNotificationAsync(`${year}${month}${day}`)
      deletePushId(`${year}${month}${day}`)
    }
  }

  const handleChangeReservCancel = async () => {
    Alert.alert(
      "예약 변경",
      "예약을 정말 취소하겠습니까?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: async () => {

          var data = JSON.stringify(
            {
              "resrvCode": selectedResrvCode,
              "usercode": usercode,
              "secretCode": secretCode
            }
          );
      
          var config = {
            method: 'post',
            url: URL + '/cancelReservation',
            headers: {
              'Content-Type': 'application/json'
            },
            data: data
          }
          await axios(config)
            .then(async function (response) {
      
              if (response.data.returnCode == 'E0000') {
                setTimeout(async ()=>Alert.alert("예약이 취소되었습니다."), 10);
              } else if (response.data.returnCode == 'E2005') {
                setTimeout(async ()=>{Alert.alert('취소 불가능한 시간 입니다.')},500)
              } else if (response.data.returnCode == 'E2006') {
                setTimeout(async ()=>{Alert.alert("사용자 아이디와 예약자 아이디가 다릅니다.")},500)
              } else if (response.data.returnCode == 'E2007') {
                setTimeout(async ()=>{Alert.alert("사용자가 없음.")},500)
              } else if (response.data.returnCode == 'E2008') {
                setTimeout(async ()=>{Alert.alert("예약코드에 해당하는 예약 없음.")},500)
              } else if (response.data.returnCode == 'E2009') {
                setTimeout(async ()=>{Alert.alert("올바르지 않은 사용자 암호화 코드")},500)
              } else {
                setTimeout(async ()=>{Alert.alert("내부 오류 입니다.")},500)
              }
            })
            .catch(function (error) {
              console.log(error);
            });
            count = await selectPushIdddd(`2`)
            if(Platform.OS == 'android'){  
              cancelPush(
                moment(selectedReservStime, 'YYYYMMDDHHmm').format('YYYY'),
                moment(selectedReservStime, 'YYYYMMDDHHmm').format('MM'),
                moment(selectedReservStime, 'YYYYMMDDHHmm').format('DD'),
                moment(selectedReservStime, 'YYYYMMDDHHmm').format('HH'),
                moment(selectedReservStime, 'YYYYMMDDHHmm').format('mm'),
              );
            }
          getMyReserveList();
          toggleModal();
        } 
      }]
    );
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
      // url: 'http://112.221.94.101:8980/modifyReservation',
      url: URL + '/modifyReservation',
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
          setTimeout(async ()=>{Alert.alert("예약 변경을 완료했습니다.")},500)
        } else if (response.data.returnCode == 'E2003') {
          setTimeout(async ()=>{Alert.alert('올바르지 않은 예약 시간 입니다.')},500)
        } else if (response.data.returnCode == 'E2004') {
          setTimeout(async ()=>{Alert.alert("이미 예약되어 있는 룸 입니다.")},500)
        } else if (response.data.returnCode == 'E2005') {
          setTimeout(async ()=>{Alert.alert("변경할 수 없는 예약 시간 입니다.")},500)
        } else if (response.data.returnCode == 'E2006') {
          setTimeout(async ()=>{Alert.alert("사용자의 아이디와 예약자 아이디가 다릅니다.")},500)
        } else if (response.data.returnCode == 'E2007') {
          setTimeout(async ()=>{Alert.alert("아이디가 없습니다.")},500)
        } else if (response.data.returnCode == 'E2008') {
          setTimeout(async ()=>{Alert.alert("예약코드에 해당하는 예약이 없습니다.")},500)
        } else if (response.data.returnCode == 'E2009') {
          setTimeout(async ()=>{Alert.alert("올바르지 않은 사용자 암호화 코드 입니다.")},500)
        } else if (response.data.returnCode == 'E2010') {
          setTimeout(async ()=>{Alert.alert("메모 글자 수가 초과 했습니다.")},500)
        } else {
          setTimeout(async ()=>{Alert.alert("내부 오류 입니다.")},500)
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    getMyReserveList();
    toggleModal();
    setStartTime(startTime);
    setEndTime(endTime);
  }

  const getValidReserveTime = async (roomCode, roomName, reserveStime, reserveEtime) => {
    console.log('reserveStime :: ',reserveStime)
    var data = JSON.stringify(
      {
        "roomCode": roomCode,
        "roomName": roomName,
        "resrvCtime": moment(reserveStime, 'YYYYMMDDHHmm').format('YYYYMMDD')
      }
    );

    var config = {
      method: 'post',
      url: URL + '/getReservationListForRoom',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    await axios(config)
      .then(async function (response) {
        const format = 'YYYYMMDDHHmm';
        const pickerVals = [];
        var index = 0;
        if(response.data.returnCode == 'E0000'){
          for(const [key, value] of Object.entries(response.data)){
            if(index > 2){
              var time = moment(key, format);
              if(moment().isBefore(time)){
                if(value == "true"){
                  pickerVals.push(key)
                } else {
                  var beforeTime = moment(reserveStime, format),
                  afterTime = moment(reserveEtime, format)
                  setStartTime(reserveStime)
                  setEndTime(reserveEtime)
                  if(time.isBetween(beforeTime, afterTime, undefined, '[]')){
                    pickerVals.push(key)
                  }
                }
              }
            }
            index++;
          }
        }
        setStartPickerVals(pickerVals)
        setEndPickerVals(pickerVals)
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    startLoading();
    getUserId();
    if(usercode != null && secretCode != null){
      getMyReserveList();
    }
    return () => {}
  }, [usercode, secretCode]);


  const startLoading = async () => {
    setLoading(true);
    setTimeout(async ()=>{
      await setLoading(false);
    },10000)
  }

  if(loading){
    return(
      <LoadingScreen/>
    )
  }

  if (reservations.length == 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ReserveHeader />
        <Text style={{ textAlign: 'center', textAlignVertical: 'center', height: '80%', lineHeight: 400 }}>
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
          onBackdropPress={()=> handleQrCancel()}
          onRequestClose={()=> handleQrCancel()}
        >
            <View style={styles.qrStyle}>
        <View style= {{borderRadius:8, backgroundColor:'#F3F4F8' ,marginBottom:2, borderWidth:5, borderColor: '#F3F4F8'}}>
            <Text style={{ textAlign: 'center', fontSize:16 }}>{selectedRoomName}</Text>
          </View>
          <View style= {{borderRadius:8, backgroundColor:'#F3F4F8' ,marginBottom:2, borderWidth:5, borderColor: '#F3F4F8'}}>
          <Text style={{ textAlign: 'center', fontSize:16 }}>날짜 : {moment(selectedReservStime, 'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
          </View>
          <View style= {{borderRadius:8, backgroundColor:'#F3F4F8' ,marginBottom:20, borderWidth:5, borderColor: '#F3F4F8'}}>
            <Text style={{ textAlign: 'center', fontSize:16 }}>시간 : {moment(selectedReservStime, 'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(selectedReservEtime, 'YYYYMMDDHHmmss').format('HH:mm')}</Text>
          </View>
              <QRCode
                size={280}
                value={qrReservCode}
              />
            </View>
        </Modal>
      </View>
      <View style={{ flex: 1 }}>
        <Modal 
          isVisible={isModalVisible}
          onBackdropPress={() => toggleModal()}
          onRequestClose={()=> toggleModal()}
        >
          <View style={styles.changeReservModal}>
            <View style={styles.changeReservTitle}>

              <TouchableOpacity style={{ flex: 1,justifyContent: 'space-between'}} onPress={()=>{}}>
                <MaterialIcons name="cancel" size={26} color="#4084E4" />
              </TouchableOpacity>
              <View style={{ alignSelf: 'center', flex: 4,justifyContent: 'space-between'}}>
                <Text style={[{ width:'100%', fontSize: 20, color: '#FFFFFF',lineHeight:28,
                textAlignVertical: 'center', textAlign: 'center', height: '100%', textAlignVertical: 'center' },{lineHeight: Platform.OS === 'ios' ? 80 : 30}]}>
                  예약 변경하기
                </Text>
              </View>
              <TouchableOpacity style={{ flex: 1, alignSelf:'center',justifyContent:'center'}} onPress={toggleModal}>
                <MaterialIcons name="cancel" size={26} color="white"/>
              </TouchableOpacity>
            </View>
            <Text style={{ marginTop: 20, textAlign: 'center', color:'black' }}>{selectedRoomName}</Text>
            <Text style={{ textAlign: 'center' }}>{moment(selectedReservStime, 'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
            <Text style={{ marginLeft: 20, color:'black',marginTop:20}}>이용 시간</Text>
            <View style={{alignSelf:'center',height:40,flexDirection:'row',marginTop:10}}>
              <View style={{backgroundColor:'white', width:135, height:30,color:'white',flex:0,borderRadius:10}}>
                <Text style={{height:30,lineHeight:30,textAlign:'center'}}>{moment(selectedReservStime, 'YYYYMMDDHHmmss').format('HH:mm')}</Text>
              </View>
              <Text style={{flex:0,width:10,alignSelf:'center',height:30,marginLeft:10,marginRight:10}}>~</Text>
              <View style={{backgroundColor:'white', width:135, height:30,color:'white',flex:0,borderRadius:10}}>
                <Text style={{height:30,lineHeight:30,textAlign:'center'}}>{moment(selectedReservEtime, 'YYYYMMDDHHmmss').format('HH:mm')}</Text>
              </View>
            </View>
            <View style={{ flex:1, height:30,marginTop:20}}>
              <Text style={{color:'black',marginLeft:20}}>메모</Text>
              <View style={{backgroundColor:'white',width:300, height:50,color:'white',flex:2,borderRadius:10,marginTop:10,alignSelf:'center'}}>
                <Text style={{height:30,marginLeft:5}}>{selectedMemo}</Text>
              </View>
            </View>
            {
              /*
            <Text style={{ marginTop: 30, marginLeft: 20 }}>이용 시간</Text>
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent:'space-between', marginBottom: Platform.OS === 'ios'? 30:null}}>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={startTime}
                  onValueChange={async (itemValue, itemIndex) => {
                    setStartTime(itemValue)
                  }}
                  itemStyle={styles.pickerItem}
                  
                > 
                  {startPickerVals.map((item, index) => {
                    return <Picker.Item color='#A0A0A0' label={moment(item, 'YYYYMMDDHHmmss').format('HH:mm')} value={item} key={index} />
                  })}
                </Picker>
              </View>
              <View style={styles.middlePickerView}>
                <Text style={[{ height: '100%', textAlignVertical: 'center' },{lineHeight: Platform.OS === 'ios' ? 100 : null}]}>~</Text>
              </View>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={endTime}
                  onValueChange={async (itemValue, itemIndex) => {
                    setEndTime(itemValue)
                  }}
                  itemStyle={styles.pickerItem}
                  style={{height:50}}
                >
                  {endPickerVals.map((item, index) => { 
                    return <Picker.Item color='#A0A0A0' label={moment(item, 'YYYYMMDDHHmmss').format('HH:mm')} value={item} key={index} />
                  })}
                </Picker>
              </View>
            </View>
            */
            }
            <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'center' }}>
              {/*
              <View style={{ flex: Platform.OS === 'ios'? 1:2, marginLeft: 10, marginRight: 10 }}>
                <Button title="예약 변경" onPress={changeReserv} />
              </View>
              */}
              
              <View style={{ flex: 1, alignSelf:'center'}}>
                <TouchableOpacity
                style={[styles.cancelBtn]}
                onPress={handleChangeReservCancel}
                > 
                  <Text style={[styles.cancelBtnText,{lineHeight:40,alignSelf:'center',color:'white'}]}>예약 취소</Text>
                </TouchableOpacity>
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
    height: Platform.OS == 'ios' ? 110 : 120,
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
    flex: 2,
    justifyContent:'center'
  },
  rightSide: {
    height: '100%',
    flex: 1,
    marginRight: '5%',
    alignItems: 'flex-end',
    justifyContent:'center'
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  itemText: {
    marginLeft: '10%',
    color:'#333333'
  },
  room: {
    marginLeft: '10%',
    marginTop: '3%',
    marginBottom: '5%',
    color: '#333333'
  },
  qrBtn: {
    borderRadius: 10,
    borderWidth: 1,
    width: 70,
    height: 30,
    justifyContent: 'center'
  },
  cancelBtn: {
    borderRadius: 10,
    borderWidth: 1,
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignSelf:'center',
    backgroundColor:'#2E2E2E'
  },
  cancelBtnText: {
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent:'center',
    height: '100%'
  },
  qrBtnText: {
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent:'center',
    height: '100%'
  },
  qrStyle:{
		alignSelf:'center',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		marginVertical:'15%',
		width:300,
		height: 420,
		backgroundColor:'#FFFFFF',
		borderRadius:10
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
    height: Platform.OS === 'ios' ? 100 : 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickerItem: {
    color: '#B2B2B2',
    textAlign: 'center',
    fontSize: 10,
    lineHeight:30,
    height: Platform.OS === 'ios' ? 100 : null
  }
});
