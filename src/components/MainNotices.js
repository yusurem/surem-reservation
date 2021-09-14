import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native'
import { URL } from '../constants';

const db = SQLite.openDatabase('db.db');

export default function MainNotices() {

const [notices, setNotices] = useState([]);
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
				setUsercode(results.rows.item(0).usercode)
				setSecretCode(results.rows.item(0).secretCode)
			}
			)
		})
		} catch (err){
		console.log(err);
		}
    }

	const getMainNotices = async () => {
		var data = JSON.stringify(
			{
				"usercode":usercode,
				"secretCode":secretCode
			}
		);

		var config = {
			method: 'post',
			url: URL+'/notice/0/3',
			// url: 'http://112.221.94.101:8980/notice/0/3',
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

	useEffect(()=>{
		getUserId()
		if(usercode != null && secretCode != null){
			getMainNotices()
		}
}, [usercode, secretCode])

  return (
	<TouchableOpacity style={styles.notices}
		onPress={()=>{
			navigation.navigate('Notices');
		}}>
			<Text style={styles.noticeTitle}>공지사항</Text>
			<View style={styles.noticeList}>
				{
          notices.map((item,index)=>{
            if(index < 3)
              return(
				<View key={index} style={styles.noticeItem}>
					<Text style={{
						color:'black',
						width:'65%',
						maxWidth:'65%',
						lineHeight:28,
						height:28,
						textAlignVertical:'center',
						marginLeft:'5%',
						fontFamily:'NanumSquareRegular'
					}}>{item.noticeSubject}</Text>
					<View
						style={styles.qrBtn}
					>
						<Text style={[styles.qrBtnText, {lineHeight: Platform.OS === 'ios' ? 28 : 28}]}>{moment(item.noticeTime,'YYYYMMDDHHmmss').format('YYYY.MM.DD')}</Text>
					</View>
				</View>
			)
          })
        }
				<TouchableOpacity style={{alignSelf:'flex-end', marginRight:10, marginBottom:'1%'}} 
				onPress={()=>{
					navigation.navigate('Notices');
				}}>
					<Text style={styles.more}>더보기</Text>
				</TouchableOpacity>
			</View>
	</TouchableOpacity>
  );  
}

const styles = StyleSheet.create({
	more: {
	  width:'100%',
	  marginLeft:'85%',
	  color:'black',
	  marginBottom:'2%',
	  marginTop:'4%',
	  fontFamily:'NanumSquareRegular'
	}, 
	notices: {
		width:'90%',
		backgroundColor:'#ECEFF4',
		borderRadius:10,
		flex:0,
		alignSelf:'center',
		marginBottom:10
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
		flexDirection:'row',
		marginRight:5
	},
	qrBtn: {
		borderRadius: 10,
		borderColor: '#DCDFE4',
		backgroundColor: '#ECF0F3',
		borderWidth: 1,
		width: 100,
		height: 28,
		marginRight:10,
		justifyContent: 'center',
		alignItems:'flex-end',
		fontFamily:'NanumSquareRegular'
	},
	qrBtnText: {
		fontFamily:'NanumSquareRegular',
		color: 'black',
		width: '100%',
		height: '100%',
		textAlign: 'center',
		textAlignVertical: 'center',
		justifyContent:'center'
	},
});
  