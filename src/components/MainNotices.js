import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'

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
	 		url: 'http://office-api.surem.com/notice/0/3',
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
		getMainNotices()
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
					<Text style={{color:'black',marginLeft:'1%',width:'69%',height:28,textAlignVertical:'center',marginLeft:'5%'}}>{item.noticeSubject}</Text>
					<View
						style={styles.qrBtn}
					>
						<Text style={[styles.qrBtnText, {lineHeight: Platform.OS === 'ios' ? 30 : 30}]}>{moment(item.noticeTime,'YYYYMMDDHHmmss').format('YYYY.MM.DD')}</Text>
					</View>
				</View>
			)
          })
        }
				<TouchableOpacity style={{alignSelf:'flex-end', marginRight:'3%', marginTop:'-3%', marginBottom:'1%'}} 
				hitSlop={{top:-1, bottom:20, left:-300, right:10}} 
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
  