import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SliderComponent, Button, TextInput, Touchable, Image } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import moment from 'moment';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal'
import Spinner from 'react-native-loading-spinner-overlay'
import 'moment/locale/ko';
import { Platform } from 'react-native';


const Item = ({ item }) => {
  const [isFolder, setIsFolder] = useState(false);
  return(
    <View style={
        [styles.item, isFolder ? styles.showingContent : styles.notShowingContent]
    }>
        <View style={styles.leftSide}>
            <Text style={styles.noticeTime}>{moment(item.noticeTime, 'YYYYMMDDHHmmss').format('YYYY.MM.DD')}</Text>
            <Text style={styles.noticeContent}>{item.noticeNote}</Text>
        </View>
        <View style={styles.rightSide}>
            <TouchableOpacity style={
                {marginTop:'25%'}
            } onPress={()=>{
                setIsFolder(!isFolder)
            }}>
                {
                    isFolder === true ?  <Text style={{fontSize:30}}>▲</Text> : <Text style={{fontSize:30}}>▼</Text>
                }
            </TouchableOpacity>

        </View>
    </View>
  )
};

const db = SQLite.openDatabase('db.db');

export default function NoticeScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [usercode, setUsercode] = useState(null);
  const [secretCode, setSecretCode] = useState(null);
  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(false);


  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = async () => {
    setModalVisible(!isModalVisible);
  }


  const renderItem = ({ item }) => {
    console.log(item)
    return (
      <Item
        item={item}
      />
    )
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

  const getNotices = async () => {
    var data = JSON.stringify(
        {
            "usercode":usercode,
            "secretCode":secretCode
        }
    );

    var config = {
        method: 'post',
        url: 'http://112.221.94.101:8980/notice/0/3',
        //url: 'http://112.221.94.101:8980/getReservation',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    await axios(config)
        .then(async function (response) {
            console.log(response.data)
            if(response.data.returnCode == 'E0000'){
                setNotices(response.data.notice)
                console.log(notices)
            }
    })
    .catch(function (error) {
        console.log(error);
    });

}

  useEffect(() => {
    startLoading();
    getUserId();
    getNotices();
    //getMyReserveList();
  }, [usercode, secretCode]);

  const startLoading = () => {
    setLoading(true);
    setTimeout(async ()=>{
      await setLoading(false);
    },10000)
  }

  if(loading){
    return(
      <Spinner
        visible={true}
        textContext={"Loading..."}
      />
    )
  }

  if (notices.length == 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <Text style={{ textAlign: 'center', textAlignVertical: 'center', height: '80%' }}>
          예약이 없습니다.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Text style={{marginLeft:'5%',marginTop:'8%',marginBottom:'5%', fontSize:18}}>공지사항</Text>
      <FlatList
        data={notices}
        renderItem={renderItem}
        style={{ width: '100%' }}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderRadius: 10,
    width: '85%',
    alignSelf: 'center',
    marginBottom: 10,
    borderLeftColor: '#EDEDED',
    borderTopColor: '#EDEDED',
    borderRightColor: '#EDEDED',
    borderBottomColor: '#EDEDED',
    flex: 1,
    flexDirection: 'row'
  },
  leftSide: {
    height: '100%',
    flex: 3,
  },
  rightSide: {
    height: '100%',
    flex: 1,
    marginRight: '10%',
    alignItems: 'flex-end'
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  itemText: {
    marginLeft: '5%'
  },
  noticeContent: {
    marginLeft: '5%',
    marginTop: '2%',
    marginBottom: '2%'
  },
  noticeTime: {
    marginLeft: '5%',
    marginTop: '2%',
    marginBottom: '2%',
    color:'#A0A0A0'
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
  },
  showingContent: {
    height:300
  },
  notShowingContent:{
    height:100
  }
});
