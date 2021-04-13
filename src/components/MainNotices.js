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
				<Text style={{color:'black',marginLeft:'4%',width:'60%'}}>신규 오픈 안내문입니다.</Text>
				<View
					style={{
						borderRadius:7,
						borderColor:'#C4D2DF',
						borderWidth: 1,
						width:100,
						height:20,
					}}>
						<Text style={{color:'#9FA0A2',width:'100%',textAlign:'center'}}>2021.02.15</Text>
				</View>
			</View>
			<View style={{height:'5%'}}/>
			<View style={{width:'100%',flexDirection:'row'}}>
				<Text style={{color:'black',marginLeft:'4%',width:'60%'}}>어플 안내공지 1차 안내문 입니다.</Text>
				<View
					style={{
						borderRadius:7,
						borderColor:'#C4D2DF',
						borderWidth: 1,
						width:100,
						height:20,
					}}>
						<Text style={{color:'#9FA0A2',width:'100%',textAlign:'center'}}>2021.02.14</Text>
				</View>
			</View>
			<View style={{height:'10%'}}/>
			<Text style={{width:'100%',marginLeft:'85%',color:'black'}}>더보기</Text>
			<View style={{height:'10%'}}/>
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
  