import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, BackHandler } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import MyReservationRow from './MyReservationRow';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { URL } from '../constants';

const db = SQLite.openDatabase('db.db');

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS AuthNumbers (_id INTEGER PRIMARY KEY, authNumber TEXT);')
})
db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT);')
})

export default function MyReservationList() {

	const [myReservList, setMyRservationList] = useState([]);
	const [usercode, setUsercode] = useState();
	const [secretCode, setSecretCode] = useState();
  const navigation = useNavigation();

  const getUserId = async () => {
    try{
      await db.transaction((tx)=>{
        tx.executeSql(
          `select * from UserId order by _id desc;`,
          [],
          (tx, results) =>{
            console.log('GETUSERID')
            setUsercode(results.rows.item(0).usercode)
            setSecretCode(results.rows.item(0).secretCode)
          }
        )
      })
    } catch (err){
      console.log(err);
    }
  }
	
  const getMyReserveList = async () => {

    var data = JSON.stringify(
				{
					"usercode":usercode,
					"secretCode":secretCode
				}
			);

    console.log('DATA::',data)
    var config = {
      method: 'post',
      url: URL + '/getReservation',
      // url: 'http://112.221.94.101:8980/getReservation',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    await axios(config)
      .then(async function (response) {
        if(response.data.returnCode == 'E0000'){
          setMyRservationList(response.data.reservations)
        }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

	useEffect(()=>{
    getUserId();
    if(usercode != null && secretCode != null){
      getMyReserveList();
    }
  },[usercode,secretCode]);

  return (
    <TouchableOpacity style={styles.MyReservationList} onPress={()=>{
        navigation.navigate('Reserved')
      }}>
      <Text style={styles.MyReservationTitle}>MY 예약내역</Text>
      {
        myReservList.map((item,index)=>{
          if(index < 3)
            return(<MyReservationRow resrvStime={item.resrvStime} resrvEtime={item.resrvEtime} roomName={item.roomName} resrvCode={item.resrvCode} key={index}/>)
        })
      }
      <View style={{alignSelf:'flex-end',flex:0, marginRight:10}} >
        <Text style={styles.more}>더보기</Text>
      </View>
    </TouchableOpacity>
  );  
}

const styles = StyleSheet.create({
    MyReservationList: {
      width:'90%',
      flex:0,
      backgroundColor:'#4284E4',
      borderRadius:10,
      alignSelf:'center',
      marginBottom:10
    },
		MyReservationTitle: {
      flex:0,
      height:'auto',
			color:'white',
      marginTop:'4%',
      marginBottom:10,
      marginLeft:'4%',
      fontSize:15,
      fontFamily:'NanumSquareRegular'
		},
    more: {
      color:'white',
      marginTop:'3%',
      marginBottom:'5%',
      fontFamily:'NanumSquareRegular'
    }
  });
  