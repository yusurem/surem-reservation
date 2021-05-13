import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Image, BackHandler, Alert } from 'react-native'
import Header from '../../components/Header'
import MyReservationList from '../../components/MyReservationList'
import MainNotices from '../../components/MainNotices'
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import FirstMainBanner from '../../components/FirstMainBanner';
import SecondMainBanner from '../../components/SecondMainBanner';
import { useFocusEffect } from '@react-navigation/native';
import MainInformationUse from '../../components/MainInformationUse';

const db = SQLite.openDatabase('db.db');

export default function HomeScreen({navigation}) {
  useFocusEffect(
    React.useCallback(()=>{
      const backHandler = BackHandler.addEventListener("hardwareBackPress", ()=>{
        Alert.alert(
          "잠시만요!",
          "어플을 종료 하시겠습니까?", 
          [
            {
              text: "아니요",
              onPress: () => null,
              style: "cancel"
            },
            { text: "예", onPress: () => BackHandler.exitApp()}
        ]);
        return true;
      });
      return () => backHandler.remove();
    },[])
  );
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView style={{flex: 1}}>
      <Header color="#FFFFFF"></Header>
      <TouchableOpacity style={styles.reserveRoomBtn}
        onPress={()=>{
          navigation.navigate('Reserve');
        }}>
        <View style={styles.reserveRoomBtnView}>
          <Image style={styles.leftSideImg} source={require("../../../assets/resrvBtn.png")} />
          <View style={styles.rightSide}>
            <Text style={{color:'white',fontSize:23,marginLeft:'10%',marginTop:'10%'}}>회의실 예약하기 ▶︎</Text>
            <Text style={{color:'white',fontSize:10,marginLeft:'10%',marginTop:'5%'}}>할인된 가격에 내 마음에 쏙 드는 회의실까지!</Text>
            <Text style={{color:'white',fontSize:10,marginLeft:'10%'}}>오피스쉐어 앱으로 회의실을 예약해보세요.</Text>
          </View>
        </View>
      </TouchableOpacity>
      <Text/>
      <MyReservationList/>
      <Text/>
      <MainNotices/>
      <FirstMainBanner/>
      <SecondMainBanner/>
      <MainInformationUse/>

    </ScrollView>
    </SafeAreaView>
  );  
}


const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    width: '100%',
    alignItems: 'center'
  },
  label: {    
    margin: 8,
  },
  logo: {
    marginRight: '45%'
  },
  reserveRoomBtn: {
    width:'90%',
    backgroundColor:'#A2AFDC',
    borderRadius:10,
    alignSelf:'center',
    height:120
  },
  reserveRoomBtnView: {
    flex:0,
    flexDirection:'row',
    height:'100%'
  },
  leftSide: {
    width:'30%',
    height:'30%',
  },
  rightSide: {
    width:'70%',
  },
  leftSideImg: {
    width:'30%',
    height:'100%',
    resizeMode:'contain'
  }  
});
