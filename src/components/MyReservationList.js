import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import MyReservationRow from './MyReservationRow';

const db = SQLite.openDatabase('db.db');
db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS AuthNumbers (_id INTEGER PRIMARY KEY, authNumber TEXT);')
})
db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT);')
})

export default function MyReservationList() {

	const [myReservList, setMyRservationList] = useState();
	const [usercode, setUsercode] = useState();
	const [secretCode, setSecretCode] = useState();

  const getUserId = async () => {
    try{
      await db.transaction(async (tx)=>{
        tx.executeSql(
          `select * from UserId order by _id desc;`,
          [],
          (tx, results) =>{
            console.log('SELECT DDDDD :: ', results)
						setUsercode(results.rows.item(0).usercode)
						setSecretCode(results.rows.item(0).secretCode)
          }
        )
      })
    } catch (err){
      console.log(err);
    }
  }
	
	const getMyReserveList = () => {
    var data = JSON.stringify(
				{
					"usercode":usercode,
					"secretCode":secretCode
				}
			);

		console.log("USERCODE :: ",usercode)
		console.log("secretCode :: ",secretCode)

    var config = {
      method: 'post',
      url: 'http://112.221.94.101:8980/getReservation',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    axios(config)
      .then(function (response) {
        console.log("RETURN CODE :: ",data)
        if(response.data.returnCode == 'E0000'){
          console.log(response.data.reservations)
        }
        console.log(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
  }

	useEffect(()=>{
    getUserId();
		getMyReserveList();
  });

  return (
    <View style={styles.MyReservationList}>
        <Text style={styles.MyReservationTitle}>MY 예약내역</Text>
        <MyReservationRow/>
        <MyReservationRow/>
        <MyReservationRow/>
        <MyReservationRow/>
        <MyReservationRow/>
        <Text style={styles.more}>더보기</Text>
      </View>
  );  
}

const styles = StyleSheet.create({
    MyReservationList: {
      width:'90%',height:220,backgroundColor:'#4284E4',borderRadius:10,alignSelf:'center'
    },
		MyReservationTitle: {
			color:'white',
			marginLeft:'3%',
			fontSize:15, 
			marginTop: '5%',
      marginBottom: '3%'
		},
    more: {
      width:'100%',
      marginTop:'2%',
      marginLeft:'85%',
      color:'white'
    }
		
  });
  