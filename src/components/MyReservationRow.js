import React, { useState } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native'
import moment from 'moment';
import Dialog from 'react-native-dialog';
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal'

export default function MyReservationRow(props) {
  const [date, setDate] = useState()
	const [startTime, setTime] = useState()
	const [endTime, setDuration] = useState()
	const [roomId, setroomId] = useState()
	const [qrVisible, setQrVisible] = useState(false)

	const onPress = () => {
		setQrVisible(true)
	}

	const handleQrCancel = () => {
		setQrVisible(false)
	}
	
  return (
	<View style={styles.row}>
		<Text style={styles.rowContent}>{moment(props.resrvStime,'YYYYMMDDHHmmss').format('YYYY/MM/DD')} {moment(props.resrvStime,'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(props.resrvEtime,'YYYYMMDDHHmmss').format('HH:mm')} {props.roomName}</Text>
		<TouchableOpacity
			style={styles.qrBtn}
			onPress={onPress}
		>
			<Text style={[styles.qrBtnText,{lineHeight:25,alignSelf:'center'}]}>QR 코드</Text>
		</TouchableOpacity>
		<View>
	  <Modal 
		isVisible={qrVisible} 
		onBackdropPress={()=> handleQrCancel()}
		onRequestClose={()=> handleQrCancel()}
	  >
        <View style={styles.qrStyle}>
		<View style= {{borderRadius:8, backgroundColor:'#F3F4F8' ,marginBottom:2, borderWidth:5, borderColor: '#F3F4F8'}}>
		  	<Text style={{ textAlign: 'center', fontSize:16 }}>{props.roomName}</Text>
		  </View>
		  <View style= {{borderRadius:8, backgroundColor:'#F3F4F8' ,marginBottom:2, borderWidth:5, borderColor: '#F3F4F8'}}>
			<Text style={{ textAlign: 'center', fontSize:16 }}>날짜 : {moment(props.resrvStime, 'YYYYMMDDHHmmss').format('YYYY / MM / DD')}</Text>
		  </View>
		  <View style= {{borderRadius:8, backgroundColor:'#F3F4F8' ,marginBottom:20, borderWidth:5, borderColor: '#F3F4F8'}}>
			  <Text style={{ textAlign: 'center', fontSize:16 }}>시간 : {moment(props.resrvStime, 'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(props.resrvEtime, 'YYYYMMDDHHmmss').format('HH:mm')}</Text>
		  </View>
          <QRCode
            size={280}
            value={props.resrvCode}
          />
        </View>
	  </Modal>
    </View>
	</View>
  );  
}

const styles = StyleSheet.create({
	row: {
		width:'100%',
		flex:0,
		flexDirection:'row',
		marginTop:'1%',
		marginBottom:'1%',
		justifyContent: 'space-between'
	},
	rowContent: {
		color:'white',
		marginLeft:'4%',
		width:'73%',
		fontFamily:'NanumSquareRegular',
		lineHeight:25
	},
	qrBtn:{
		borderRadius:7,
		borderColor:'white',
		borderWidth: 1,
		width:'20%',
		height:25,
		marginRight:10,
		alignItems:'center'
	}, 
	qrBtnText:{
		flex:1,
		color:'white',
		width:'100%',
		textAlign:'center',
		fontFamily:'NanumSquareRegular',
		alignSelf:'center',
		textAlignVertical:'center',
	},
	qrStyle:{
		alignSelf:'center',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		marginVertical:'15%',
		width:300,
		height: 420,
		backgroundColor:'#FFFFFF',
		borderRadius:10
	}
});
  