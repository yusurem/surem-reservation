import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import { useEffect } from 'react';
import axios from 'axios';

export default function ChangeReservDialog(props) {

  return (
    <View style={styles.MyReservationList}>
        <Text style={styles.MyReservationTitle}>MY 예약내역</Text>
        <MyReservationRow/>
        <MyReservationRow/>
        <MyReservationRow/>
        <MyReservationRow/>
        <MyReservationRow/>
        <Text style={styles.more}>더보기</Text>
      </View>
  );  
}

const styles = StyleSheet.create({
    MyReservationList: {
      width:'90%',height:220,backgroundColor:'#4284E4',borderRadius:10,alignSelf:'center'
    },
		MyReservationTitle: {
			color:'white',
			marginLeft:'3%',
			fontSize:15, 
			marginTop: '5%',
      marginBottom: '3%'
		},
    more: {
      width:'100%',
      marginTop:'2%',
      marginLeft:'85%',
      color:'white'
    }
		
  });
  