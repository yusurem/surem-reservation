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
import { URL } from '../constants';

const db = SQLite.openDatabase('db.db');

// db.transaction(tx=>{
//   tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT, username TEXT);')
// })

const saveUserId = (secretcode,phoneNum,userName) => {
  db.transaction((tx)=>{
    tx.executeSql("INSERT INTO UserId(secretCode,usercode,username) Values(?,?,?)",[secretcode,phoneNum,userName],(tx, results)=>{
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
        "username":props.name,
        "userCallphone":props.phoneNum
      }
    );

    console.log('SignUp :: ',data)

    var config = {
      method: 'post',
      url: URL + '/joinMember',
      // url: 'http://112.221.94.101:8980/joinMember',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    axios(config)
      .then(function (response) {
      console.log(JSON.stringify(response.data));
      if(response.data.returnCode === "E0000"){
        saveUserId(response.data.secretCode, props.phoneNum, props.name)
        // navigation.reset({index: 0, routes: [{name: 'Tab'}] })
        navigation.reset({
          index: 0,
          actions: [
            navigation.navigate('Tab', {
              screen: 'Reserve', params: {
                  screen: 'Branch'
              }
            })
          ]
        })
      }
      else if(response.data.returnCode === "E3001"){
        var data = JSON.stringify(
          {
            "usercode":props.phoneNum
          }
        );
    
    var config = {
      method: 'post',
      url: URL + '/getEncryptCode',
      // url: 'http://112.221.94.101:8980/getEncryptCode',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };
    axios(config).then(function (response){
      console.log(JSON.stringify(response.data));
      if(response.data.returnCode === "E2007"){
        alert("???????????? ????????????.")
      }else{
        console.log('login Success')
        saveUserId(response.data.returnCode, props.phoneNum, props.name)
        setLoading(false);
        //navigation.reset({index: 0, routes: [{name: 'Tab'}] })
        navigation.reset({
          index: 0,
          actions: [
            navigation.navigate('Tab', {
              screen: 'Reserve', params: {
                  screen: 'Branch'
              }
            })
          ]
        })
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

  const startLoading = async () => {
    setLoading(true);
    setTimeout(async ()=>{
      await setLoading(false);
    },10000)
  }

  return (
    <TouchableOpacity style={styles.button} onPress={()=>{
        console.log(props)
        if(!props.isCheckAcceptedTerm){
          Alert.alert('??????????????? ??????????????????')
        }else if(!props.isAuth){
          Alert.alert('????????? ??????????????????');
        }
        if(props.isAuth && props.isCheckAcceptedTerm){
          startLoading()
          signUp()
        }
      }
    }>
      <Text style={styles.title}>????????????</Text>
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