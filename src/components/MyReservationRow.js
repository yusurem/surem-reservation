import React, { useState } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

export default function MyReservationRow() {
  const [date, setDate] = useState()
	const [time, setTime] = useState()
	const [duration, setDuration] = useState()
	const [roomId, setRoomId] = useState()

	const onPress = () => {console.log('hi')}

	useEffect(()=>{
    setDate('2021/02/24')
		setTime('10:00PM')
		setDuration('2시간')
		setRoomId('1호')
  });
	
  return (
	<View style={styles.row}>
		<Text style={styles.rowContent}>{date} {time} {duration} {roomId}</Text>
		<TouchableOpacity
			style={styles.qrBtn}
			onPress={onPress}
		>
			<Text style={styles.qrBtnText}>QR 코드</Text>
		</TouchableOpacity>
	</View>
  );  
}

const styles = StyleSheet.create({
	row: {
		width:'100%',
		flexDirection:'row',
		marginTop:'0.5%',
		marginBottom:'0.5%'
	},
	rowContent: {
		color:'white',
		marginLeft:'5%'
	},
	qrBtn:{
		borderRadius:7,
		borderColor:'white',
		borderWidth: 1,
		width:60,
		height:20,
		marginLeft:'10%'
	}, 
	qrBtnText:{
		color:'white',
		width:'100%',
		textAlign:'center'
	}
  });
  