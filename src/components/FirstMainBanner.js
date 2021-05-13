import React, { useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'

const db = SQLite.openDatabase('db.db');

export default function FirstMainBanner() {
  return (
	<View style={styles.banner}>
		<View>
			<Text style={styles.noticeTitle}>이제 회의실 예약도</Text>
			<Text style={styles.noticeTitle}>간편한 오피스쉐어 APP으로!</Text>
		</View>
		<Image source={require("../../assets/number4.png")} />
	</View>
  );  
}

const styles = StyleSheet.create({
	banner: {
		width:'90%',
		backgroundColor:'#ECEFF4',
		borderRadius:10,
		alignSelf:'center',
		marginBottom:'5%',
		flex:0
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
  