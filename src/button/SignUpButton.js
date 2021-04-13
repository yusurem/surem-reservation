import { useNavigation } from '@react-navigation/native';
import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db.db');

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT);')
})

const saveUserId = (secretcode,phoneNum) => {
  db.transaction((tx)=>{
    tx.executeSql("INSERT INTO UserId(secretCode,usercode) Values(?,?)",[secretcode,phoneNum],(tx, results)=>{

    },(tx, error)=>{

    })
  })
}

export default function SignUpButton(props){
  const navigation = useNavigation();
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
            saveUserId(response.data.returnCode, props.phoneNum)
            navigation.reset({index: 0, routes: [{name: 'Reserve'}] })
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
  return (
    <TouchableOpacity style={styles.button} onPress={()=>{
        console.log(props)
        if(props.isAuth && props.isCheckAcceptedTerm){
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