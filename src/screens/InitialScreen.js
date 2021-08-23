import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen'

import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";

const db = SQLite.openDatabase('db.db');

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT);')
})

export default function InitialScreen({ navigation, route }) {
  console.log("[InitialScreen]:: Entered Screen. Params are: ");
  console.log(route.params);

  const [loading, setLoading] = useState(true);

  const hasUserId = async () => {
    // Alert.alert("HI");
    await db.transaction((tx)=>{
      tx.executeSql(
        `select * from UserId;`,
        [],
        (tx, results) =>{
          console.log(results)
          if(results.rows.length > 0){
            // 이거 navigation.reset 하면 sqlite database 망가짐
            // loading screen 두번 나오는거 다르게 고쳐주세요
            if(route.params.notification === "reservation"){
              navigation.navigate("Tab", { screen: "Reserved" });
            }
            else{
              navigation.navigate("Tab");
            }
          } else if(results.rows.length === 0){
            setLoading(false)
          }
        }
    )
  })}


  useEffect(()=>{
    hasUserId();
    return(()=>{})
  },[]);

  if(loading){
    return (
      <LoadingScreen/>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View>
          <ImageBackground
            style={{
              width:'100%', 
              height:'100%',
              alignItems:'center',
              justifyContent:'center'
            }}
            source={require('../../assets/InitScreen.jpg')}
            resizeMode="cover"
          >
            <View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.initFirstText}>"미팅 룸이 필요할 떄는 언제나"</Text>
              </View>
              <View style={{ alignItems:'center', marginBottom:'20%'}}>
                <Text style={styles.initSecondText}>오피스쉐어에</Text>
                <Text style={styles.initSecondText}>오신것을 환영합니다.</Text>
              </View>
            </View>
            <View>
              <TouchableOpacity
                style={[ styles.resrvButton ]}
                onPress={ async () => {
                  navigation.reset({index: 0, routes: [{name: 'SignUp'}] })
                }}
              >
                <Text style={ styles.buttonText }>예약하기</Text>
              </TouchableOpacity>
            </View>

          </ImageBackground>
      </View>
    </SafeAreaView>
  );  
}


const styles = StyleSheet.create({
  initFirstText : {
    color:'#FFFFFF',
    fontSize:18,
    marginBottom:'15%',
  },
  initSecondText : {
    color:'#FFFFFF',
    fontSize:18,
  },
  resrvButton: {
    alignSelf: 'stretch',
    borderRadius: 15,
    paddingVertical: 12,
    width:300,
    backgroundColor: '#4184E4',
  },
  buttonText: {
      color: "white",
      textAlign: "center",
      fontSize: 13
  }
});