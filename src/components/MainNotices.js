import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';

const db = SQLite.openDatabase('db.db');

export default function MainNotices() {

	const [notices, setNotices] = useState();

	useEffect(()=>{
  });

  return (
    <View style={styles.notices}>
			<Text style={styles.noticeTitle}>공지사항</Text>
			<View style={styles.noticeList}>
				<Text style={{color:'black',marginLeft:'4%',width:'60%'}}>공지사항 기능은 준비중입니다.</Text>
			</View>
    </View>
  );  
}

const styles = StyleSheet.create({
    more: {
      width:'100%',
      marginTop:'1%',
      marginLeft:'85%',
      color:'white'
    }, 
	notices: {
		width:'90%',
		height:130,
		backgroundColor:'#ECEFF4',
		borderRadius:10,
		alignSelf:'center'
	},
	noticeTitle: {
		color:'black',
		marginTop:'4%',
		marginBottom:10,
		marginLeft:'3%',
		fontSize:15
	},
	noticeList: {
		width:'100%',
		flexDirection:'row'
	}
		
  });
  