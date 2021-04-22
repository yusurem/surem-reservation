import { useNavigation } from '@react-navigation/native';
import React, { Component, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import LoadingScreen from '../screens/LoadingScreen'
import * as SQLite from 'expo-sqlite';
import Spinner from 'react-native-loading-spinner-overlay'

const db = SQLite.openDatabase('db.db');

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT);')
})

const saveUserId = (secretcode,phoneNum) => {
  db.transaction((tx)=>{
    tx.executeSql("INSERT INTO UserId(secretCode,usercode) Values(?,?)",[secretcode,phoneNum],(tx, results)=>{
      console.log(results)
    },(tx, error)=>{
      console.log(error)
    })
  })
}

export default function SignUpButton(props){
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const signUp = () => {
    var data = JSON.stringify(
      {
        "usercode":props.phoneNum,
        "userpass":props.phoneNum,
        "username":'test',
        "userCallphone":props.phoneNum
      }
    );

    var config = {
      method: 'post',
      // url: 'http://office-api.surem.com/joinMember',
      url: 'http://112.221.94.101:8980/joinMember',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    axios(config)
      .then(function (response) {
      console.log(JSON.stringify(response.data));
      if(response.data.returnCode === "E0000"){
        saveUserId(response.data.secretCode, props.phoneNum)
        navigation.reset({index: 0, routes: [{name: 'Home'}] })
      }
      else if(response.data.returnCode === "E3001"){
        var data = JSON.stringify(
          {
            "usercode":props.phoneNum
          }
        );
    
        var config = {
          method: 'post',
          // url: 'http://office-api.surem.com/getEncryptCode',
          url: 'http://112.221.94.101:8980/getEncryptCode',
          headers: {
            'Content-Type': 'application/json'
          },
            data : data
        };
        axios(config).then(function (response){
          console.log(JSON.stringify(response.data));
          if(response.data.returnCode === "E2007"){
            alert("사용자가 없습니다.")
          }else{
            console.log('login Success')
            saveUserId(response.data.returnCode, props.phoneNum)
            setLoading(false);
            navigation.reset({index: 0, routes: [{name: 'Tab'}] })
          }
        })

      }else{
        alert(JSON.stringify(response.data))
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const startLoading = () => {
    setLoading(true);
    setTimeout(async ()=>{
      await setLoading(false);
    },10000)
  }

  if(loading){
    return(
      <Spinner
        visible={true}
        textContext={"Loading..."}
      />
    )
  }

  return (
    <TouchableOpacity style={styles.button} onPress={()=>{
        console.log(props)
        if(!props.isCheckAcceptedTerm){
          Alert.alert('이용약관을 체크해주세요')
        }else if(!props.isAuth){
          Alert.alert('인증을 진행해주세요');
        }
        if(props.isAuth && props.isCheckAcceptedTerm){
          startLoading()
          signUp()
        }
      }
    }>
      <Text style={styles.title}>회원가입</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#404757',
    borderRadius:10,
    alignSelf:'center'
  },
  title: {
    fontSize: 15,
    color: '#FFFFFF'
  },
});