import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native'
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('db.db');

export default function SecondMainBanner() {

  return (
	<View style={styles.banner}>
		<View style={{flex:1,flexDirection:'row'}}>
			<View style={{flex:0}}>
				<Image style={{marginBottom:'40%',marginLeft:'5%',marginTop:'10%'}} source={require("../../assets/secondBannerLight.png")} />
			</View>
			<View style={{flex:0,height:110,width:110,marginLeft:'38%',marginTop:10}}>
				<Image
					style={{
						resizeMode:'cover',
						flex:1,
						height:null,
						width:null
					}}
					source={require("../../assets/secondBanner.png")} />
			</View>
		</View>
		<View style={{marginLeft:'5%',marginTop:'-8%',marginBottom:'5%'}}>
			<Text style={styles.bannerTitle}>오피스쉐어 앱은</Text>
			<Text style={styles.bannerContent}>실시간으로 이용 가능한 회의실을 검색하고</Text>
			<Text style={styles.bannerContent}>바로 예약하는 온라인 예약 서비스를 제공합니다.</Text>
		</View>
	</View>
  );  
}

const styles = StyleSheet.create({ 
	banner: {
		width:'90%',
		backgroundColor:'#BBC8E8',
		borderRadius:10,
		flex:0,
		alignSelf:'center',
		marginBottom:'5%'
	},
	bannerTitle: {
		color:'black',
		fontSize:18,
		marginBottom:'5%',
		fontFamily:'NanumSquareRegular'

	},
	bannerContent: {
		color:'black',
		fontSize:15,
		marginTop:3,
		fontFamily:'NanumSquareRegular'
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
  