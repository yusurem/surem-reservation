import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'

const db = SQLite.openDatabase('db.db');

export default function SecondMainBanner() {

  return (
	<View style={styles.notices}>
			<Text style={styles.noticeTitle}>오피스쉐어 앱은</Text>
			<Text style={styles.noticeTitle}>실시간으로 이용 가능한 회의실을 검색하고</Text>
			<Text style={styles.noticeTitle}>바로 예약하는 온라인 예약 서비스를 제공합니다.</Text>

	</View>
  );  
}

const styles = StyleSheet.create({
	more: {
	  width:'100%',
	  marginLeft:'85%',
	  color:'black',
	  marginBottom:'2%',
	  marginTop:'4%'
	}, 
	notices: {
		width:'90%',
		backgroundColor:'#ECEFF4',
		borderRadius:10,
		flex:0,
		alignSelf:'center',
		marginBottom:'5%'
	},
	noticeTitle: {
		color:'black',
		marginTop:'4%',
		marginBottom:10,
		marginLeft:'4%',
		fontSize:15
	},
	noticeList: {
		width:'100%',
		flexDirection:'column',
		flex:0
	},
	noticeItem: {
		flex:0,
		marginBottom:'1%',
		flexDirection:'row'
	},
	qrBtn: {
		borderRadius: 10,
		borderColor: '#DCDFE4',
		backgroundColor: '#ECF0F3',
		borderWidth: 1,
		width: 80,
		height: 28,
		justifyContent: 'center',
		alignItems:'flex-end'
	},
	qrBtnText: {
		color: 'black',
		width: '100%',
		height: '100%',
		textAlign: 'center',
		textAlignVertical: 'center',
		justifyContent:'center'
	},
});
  