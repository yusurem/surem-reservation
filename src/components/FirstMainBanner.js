import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native'

export default function FirstMainBanner() {
  return (
	<View style={styles.banner}>
		<View stlye={{flex:1}}>
			<View style={{flex:1,marginLeft:'5%',justifyContent:'center',marginTop:'5%'}}>	
				<Text style={styles.noticeTitle}>이제 회의실 예약도</Text>
				<Text style={styles.noticeTitle}>간편한 오피스쉐어 APP으로!</Text>
			</View>
		</View>
		<View style={{flex:1,height:'80%',alignSelf:'center'}}>
			<Image style={{
				flex: 1,
				resizeMode:'contain',
				width:null,
				height:null
			}} source={require("../../assets/firstBanner.png")} />

		</View>
	</View>
  );  
}

const styles = StyleSheet.create({
	banner: {
		width:'90%',
		backgroundColor:'#ECEFF4',
		borderRadius:10,
		alignSelf:'center',
		marginBottom:10,
		flex:3,
		height:110,
		flexDirection:'row'
	},
	noticeTitle: {
		color:'black',
		fontSize:15,
		textAlignVertical:'center',
		marginLeft:'5%',
		marginBottom:5,
		fontFamily:'NanumSquareRegular',
		textAlignVertical:'center'
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
  