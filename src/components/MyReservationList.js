import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, BackHandler } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import MyReservationRow from './MyReservationRow';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'
import ReservationListScreen from '../screens/reservation/ReservationListScreen'
import { useFocusEffect } from '@react-navigation/native';

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
      url: 'http://112.221.94.101:8980/getReservation',
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
    console.log('hdi')
    getUserId();
    getMyReserveList();
  },[usercode,secretCode]);

  return (
    <View style={styles.MyReservationList}>
        <Text style={styles.MyReservationTitle}>MY 예약내역</Text>
        {
          myReservList.map((item,index)=>{
            if(index < 3)
              return(<MyReservationRow resrvStime={item.resrvStime} resrvEtime={item.resrvEtime} roomName={item.roomName} resrvCode={item.resrvCode} key={index}/>)
          })
        }
        <TouchableOpacity onPress={()=>{
          navigation.navigate('ConfirmReserved')
        }}>
          <Text style={styles.more}>더보기</Text>
        </TouchableOpacity>
      </View>
  );  
}

const styles = StyleSheet.create({
    MyReservationList: {
      width:'90%',height:'30%',backgroundColor:'#4284E4',borderRadius:10,alignSelf:'center'
    },
		MyReservationTitle: {
			color:'white',
			marginLeft:'3%',
			fontSize:20, 
			marginTop: '5%',
		},
    more: {
      width:'100%',
      marginTop:'1%',
      marginLeft:'85%',
      marginBottom:'2%',
      color:'white'
    }
  });
  