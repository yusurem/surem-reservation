import React, { useState } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import moment from 'moment';
import Dialog from 'react-native-dialog';
import QRCode from 'react-native-qrcode-svg';

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
	useEffect(()=>{
  });
  return (
	<View style={styles.row}>
		<Text style={styles.rowContent}>{moment(props.resrvStime,'YYYYMMDDHHmmss').format('YYYY/MM/DD')} {moment(props.resrvStime,'YYYYMMDDHHmmss').format('HH:mm')} ~ {moment(props.resrvEtime,'YYYYMMDDHHmmss').format('HH:mm')} {props.roomName}</Text>
		<TouchableOpacity
			style={styles.qrBtn}
			onPress={onPress}
		>
			<Text style={styles.qrBtnText}>QR 코드</Text>
		</TouchableOpacity>
		<View>
      <Dialog.Container visible={qrVisible}>
        <Dialog.Button label="Cancel" onPress={handleQrCancel}/>
        <View style={styles.qrStyle}>
          <QRCode
            size={140}
            value={props.resrvCode}
          />
        </View>
      </Dialog.Container>
    </View>
	</View>
  );  
}

const styles = StyleSheet.create({
	row: {
		width:'100%',
		flex:1,
		flexDirection:'row',
		marginTop:'0.5%',
		marginBottom:'0.5%',
		justifyContent: 'space-between'
	},
	rowContent: {
		color:'white',
		marginLeft:'4%',
		width:'73%'
	},
	qrBtn:{
		borderRadius:7,
		borderColor:'white',
		borderWidth: 1,
		width:'20%',
		height:20,
	}, 
	qrBtnText:{
		flex:1,
		color:'white',
		width:'100%',
		textAlign:'center',
	},
	qrStyle:{
		alignSelf:'center',
		marginVertical:'15%'
	}
});
  