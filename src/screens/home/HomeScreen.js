import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Image, BackHandler, Alert, Platform } from 'react-native'
import Header from '../../components/Header'
import MyReservationList from '../../components/MyReservationList'
import MainNotices from '../../components/MainNotices'
import { SafeAreaView } from 'react-native-safe-area-context';
import FirstMainBanner from '../../components/FirstMainBanner';
import SecondMainBanner from '../../components/SecondMainBanner';
import { useFocusEffect } from '@react-navigation/native';
import MainInformationUse from '../../components/MainInformationUse';
import MapView, {Marker} from 'react-native-maps';
import { EvilIcons } from '@expo/vector-icons'; 

export default function HomeScreen({navigation}) {

  const [selectedMode, setSelectedMode] = useState(true);
  
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
    <View style={{flex: 1, backgroundColor: 'white', marginTop:Platform.OS == 'ios' ? 30: 0}}>
      <ScrollView style={{flex: 1}}>
      <Header color="#FFFFFF"></Header>
      <TouchableOpacity style={styles.reserveRoomBtn}
        onPress={()=>{
          navigation.navigate('Reserve')
        }}>
        <View style={styles.reserveRoomBtnView}>
          <Image style={styles.leftSideImg} source={require("../../../assets/resrvBtn.png")} />
          <View style={styles.rightSide}>
            <View style={{flex:0,flexDirection:'row',alignItems:'center',marginBottom:5}}>
              <Text style={{color:'white',fontSize:20,marginLeft:'10%',fontFamily:'NanumSquareRegular'}}>회의실 예약하기</Text>
              <Image style={{flex:0,width:null,height:null,width:30,height:30,marginLeft:10}} source={require("../../../assets/arrow.png")} />
            </View>
            <View>  
              <Text style={{color:'white',fontSize:10,marginLeft:'10%',marginTop:'5%',marginBottom:5,fontFamily:'NanumSquareRegular'}}>할인된 가격에 내 마음에 쏙 드는 회의실까지!</Text>
              <Text style={{color:'white',fontSize:10,marginLeft:'10%',fontFamily:'NanumSquareRegular'}}>오피스쉐어 앱으로 회의실을 예약해보세요.</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <MyReservationList/>
      <MainNotices/>
      <FirstMainBanner/>
      <SecondMainBanner/>
      <View style={{flexDirection:'row',width:'90%',alignSelf:'center',alignItems:'flex-end',marginBottom:50}}>
        <View 
          style={styles.bar}
        />
        <TouchableOpacity
         style={selectedMode ? styles.textSelectedUnderline : styles.textUnderline}
          onPress={()=>{
            setSelectedMode(true)
          }}
        >
          <Text style={[{fontSize:16,flex:3,fontFamily:'NanumSquareRegular',textAlign:'center'},
          selectedMode ? styles.textSelectedUnderline : styles.textUnderline]}>이용안내</Text>
        </TouchableOpacity>
        <View 
          style={[styles.bar,{flex:2}]}
        />
        <TouchableOpacity
          style={selectedMode ? styles.textUnderline : styles.textSelectedUnderline}
          onPress={()=>{
            setSelectedMode(false)
          }}>
          <Text style={[{fontSize:16,flex:3,fontFamily:'NanumSquareRegular',textAlign:'center'},
          selectedMode ? styles.textUnderline : styles.textSelectedUnderline]}>찾아오는 길</Text>
        </TouchableOpacity>
        <View 
          style={styles.bar}
        />
      </View>
      {
        selectedMode ? 
        <MainInformationUse/> : 
        <View>
          <View style={{flex:1,flexDirection:'row',marginBottom:20}}>
            <EvilIcons name="location" size={25} color="#939393" style={{flex:0,marginLeft:'5%',alignSelf:'center'}} />
            <Text fontFamily="NanumSquareRegular" style={{lineHeight:20,alignSelf:'center'}}>서울 광진구 광나루로56길 85 테크노-마트21</Text>
          </View>
          <View style={{flex:1, width:'90%', height:300, alignItems: 'center',alignContent:'center', alignSelf:'center', marginBottom:50}}>
            <MapView         
            initialRegion={{
              latitude: 37.53501664977686,
              longitude: 127.0947798497017,
              latitudeDelta: 0.0025,
              longitudeDelta: 0.0025,
            }}
          style={{flex:1,width:'100%', alignSelf:'center'}}>
            <Marker
              coordinate={
                {
                  latitude: 37.53576432444482,
                  longitude: 127.09561035726969
                }
              }
              title="테크노마트"
            />
            </MapView>
          </View>
        </View>
      }
    </ScrollView>
    </View>
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
    height:120,
    marginBottom:10
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
    flex:1,
    alignSelf:'center'
  },
  leftSideImg: {
    width:'30%',
    height:'100%',
    marginLeft:15,
    resizeMode:'contain'
  },
  bar:{
    flex:1,
    height:1,
    backgroundColor:'#A3A3A3',
  },
  textSelectedUnderline:{
    color: 'black',
    borderColor: '#4284E4',
    borderBottomWidth: Platform.OS == 'ios' ? 2 : 1
  },
  textUnderline:{
    color:'#A3A3A3',
    borderBottomColor: '#A3A3A3',
    borderBottomWidth: Platform.OS == 'ios' ? 2 : 1
  },
  map: {
    width: 100,
    height: 100
  }
});
