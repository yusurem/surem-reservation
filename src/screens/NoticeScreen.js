import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SliderComponent, Button, TextInput, Touchable, Image } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ko';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview' 
import LoadingScreen from './LoadingScreen'
import { Feather } from '@expo/vector-icons'; 
import { URL } from '../constants';

const Item = ({ item }) => {
  const [isFolder, setIsFolder] = useState(false);
  return(
    <View style={
        [styles.item, isFolder ? styles.showingContent : styles.notShowingContent]
    }>
        <View style={styles.leftSide}>
            <Text style={styles.noticeTime}>{moment(item.noticeTime, 'YYYYMMDDHHmmss').format('YYYY.MM.DD')}</Text>
            <Text style={styles.noticeContent}>{item.noticeSubject}</Text>
            {
              isFolder === true ? 
              <WebView 
                style={{ width: '95%',alignSelf:'center' }}
                injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                scalesPageToFit={false}            
                source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=0.75"></head><body>'+item.noticeNote+'</body></html>' }}
                /> : null
            }
        </View>
        <View style={styles.rightSide,{marginTop: 10, flex:1, height:30}}>
            <TouchableOpacity style={
                {alignSelf:'center'}
            } onPress={()=>{
                setIsFolder(!isFolder)
            }}>
                {
                    isFolder === true ?   
                    <Feather name="chevron-up" size={24} color="#999999" />
                    : <Feather name="chevron-down" size={24} color="#999999" />
                }
            </TouchableOpacity>
        </View>
    </View>
  )
};

const db = SQLite.openDatabase('db.db');

export default function NoticeScreen({ navigation }) {
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
        // url: 'http://112.221.94.101:8980/notice/0/100',
        url: URL + '/notice/0/200',
        headers: {
        }
    };

    await axios(config)
        .then(async function (response) {
            console.log(response.data)
            if(response.data.returnCode == 'E0000'){
                setNotices(response.data.notice)
                setLoading(false)
            }
    })
    .catch(function (error) {
        console.log(error);
    });

    console.log(notices)

}

  useEffect(() => {
    startLoading();
    getUserId();
    getNotices();
    //getMyReserveList();
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

  if (notices.length == 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <Text style={{ textAlign: 'center', textAlignVertical: 'center', height: '80%', lineHeight: 400 }}>
          공지사항이 없습니다.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8' }}>
      <View style={{flex:1, backgroundColor:'#F3F4F8'}}>
      <Text style={{marginLeft:'5%',marginTop:'8%',marginBottom:'5%', fontSize:18}}>공지사항</Text>
      <FlatList
        data={notices}
        renderItem={renderItem}
        style={{ width: '100%', flexGrow:0}}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    borderLeftColor: '#F3F4F8',
    borderTopColor: '#F3F4F8',
    borderRightColor: '#F3F4F8',
    borderBottomColor: '#F3F4F8',
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  leftSide: {
    height: '100%',
    flex: 7,
  },
  rightSide: {
    flex: 1
  },
  contentContainerStyle: {
    justifyContent: 'center'
  },
  itemText: {
    marginLeft: '2%'
  },
  noticeContent: {
    marginLeft: '5%',
    marginTop: '2%',
    marginBottom: '2%',
    width:'100%'
  },
  noticeTime: {
    marginLeft: '5%',
    marginTop: 10,
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
    flex:2,
    height:250
  },
  notShowingContent:{
    flex:1,
    height:80
  }
});
