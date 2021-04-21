import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StatusBar, StyleSheet, TouchableOpacity, Platform} from 'react-native'

import axios from 'axios';
import SignUpButton from '../../button/SignUpButton'
import AcceptTermsChkbox from '../../components/Checkbox/AcceptTermsChkbox'
import AuthNumberInput from '../../components/AuthNumberInput'
import CountDownTimer from '../../components/CountDownTimer'
import LoadingScreen from '../LoadingScreen'

import { SafeAreaView } from 'react-native-safe-area-context';

import * as SQLite from 'expo-sqlite';

const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";

const db = SQLite.openDatabase('db.db');

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS AuthNumbers (_id INTEGER PRIMARY KEY, authNumber TEXT);')
})

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT);')
})

export default function SignUpScreen({ navigation }) {
  const navigationOptions = { header: null}
  const [phoneNum, setPhoneNum] = useState("");
  const [isSentAuth, setIsSentAuth] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isCheckAcceptedTerm, setIsCheckAcceptedTerm] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const makeId = () => {
    var text = "";
    var possible = "0123456789"
    for (let i=0; i<4; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text
  }

  const sendMessage = (callphone,authNumberText) => {
    console.log('CALLPHONE :: ', callphone)
    var data = JSON.stringify(
      {
        "usercode":"suremqr",
        "deptcode":"35--SX-DQ",
        "messages":
        [
          {"message_id":"1","to":callphone},
        ],
        "text":"[공용 오피스] 회원 가입 인증 번호는 "+authNumberText+" 입니다","from":"15884640","reserved_time":"000000000000"});

    var config = {
      method: 'post',
      url: 'https://dynapi.surem.com/sms/v1/json?secuCd=f71742597bd420117f7736f9b052a665fed39d1cdf53707f955da2d6921dcd32',
      headers: {
        'Content-Type': 'application/json'
      },
        data : data
    };

    axios(config)
      .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const saveAuthNumber = (authNumberText) => {
    db.transaction((tx)=>{
      tx.executeSql("INSERT INTO AuthNumbers(authNumber) Values(?)",[authNumberText],(tx, results)=>{

      },(tx, error)=>{
        console.log("ERROR :: ",error)
        console.log("ERROR")
      })
    })
  }

  const selectAuthNumbers = () => {
    db.transaction((tx)=>{
      tx.executeSql(
        `select * from AuthNumbers;`,
        [],
        (tx, results) =>{
          console.log('SELECT AUTHNUMBERS :: ',results)
        }
      )
    })
  }


  const hasUserId = async () => {
    await db.transaction((tx)=>{
      tx.executeSql(
        `select * from UserId;`,
        [],
        (tx, results) =>{
          if(results.rows.length > 0){
            navigation.reset({index: 0, routes: [{name: 'Tab'}] })
          } else if(results.rows.length == 0){
            setLoading(false)
          }
        }
      )
    })}

  const deleteAuthNumbers = () => {
    db.transaction((tx)=>{
      tx.executeSql(
        `delete from AuthNumbers;`,
        [],
        (tx, results) =>{
          console.log('DROP TABLE AUTHNUMBERS :: ',results)
        }
      )
    })
  }

  useEffect(()=>{
    hasUserId();
  },[]);

  if(loading){
    return (
      <LoadingScreen/>
    );
  }

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <View
        style={{
            backgroundColor: '#F3F4F8',
            flex:1
        }}
        >
        <Text></Text>
        <Text style={{ textAlign: 'center', fontSize:20, marginTop:50}}>회원가입</Text>
        <Text style={{ textAlign: 'center', fontSize:14, marginTop:6}}>회원가입을 위한 정보를 입력해주세요.</Text>
        <Text></Text>
        <TextInput 
            style={{ textAlign: 'left', borderWidth: 1 , height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
            placeholder="휴대폰번호"
            autoCapitalize="none"
            autoCorrect={false}
            value={phoneNum}
            onChangeText={(newValue) => {
              const regex = /^[0-9\b]{0,11}$/;
              if (regex.test(newValue)) {
                setPhoneNum(newValue);
              }
            }}
            keyboardType="number-pad"
        />
        <View height='1%'></View>
        { isSentAuth === true ? 
          <AuthNumberInput setIsAuth={setIsAuth}/> : 
          <TouchableOpacity style={styles.button} onPress={ () => {
            var authNumberText = makeId()
            if(phoneNum === ""){
              alert('핸드폰 번호를 입력해주세요.')
              return
            }
            deleteAuthNumbers()
            saveAuthNumber(authNumberText)
            selectAuthNumbers()
            setMinutes(3)
            setIsSentAuth(true)
            sendMessage(phoneNum,authNumberText)
          }}
        >
        <Text style={styles.title}>
          인증번호 발송하기
        </Text> 
        </TouchableOpacity>}
        {
          isSentAuth && !isAuth === true ?
          <TouchableOpacity style={styles.reAuthBtn} onPress={()=>{
            setIsSentAuth(false)
            setMinutes(3)
            setSeconds(0)
          }
          }>
            <Text style={styles.title}>재인증하기</Text>
          </TouchableOpacity> : null
        }
        
        { isSentAuth && !isAuth === true ? 
          <CountDownTimer minutes={minutes} seconds={seconds} setMinutes={setMinutes} setSeconds={setSeconds} setIsSentAuth={setIsSentAuth} />:null
        }
        <View height='5%'></View>
        <View
          style={{
              borderBottomColor: 'black',
              borderBottomWidth: 1,
              width: '85%',
              alignSelf: 'center'
          }}
        />
        {Platform.OS === 'android' ? <AcceptTermsChkbox setIsCheckAcceptedTerm={setIsCheckAcceptedTerm}/> : null}
        <View
          style={{
              borderBottomColor: 'black',
              borderBottomWidth: 1,
              width: '85%',
              marginBottom: '8%',
              alignSelf: 'center'
          }}
        />
        <SignUpButton isAuth={isAuth} isCheckAcceptedTerm={isCheckAcceptedTerm} phoneNum={phoneNum}/>
        {Platform.OS === 'ios' ? <SignUpButton isAuth={true} isCheckAcceptedTerm={true} phoneNum={"01041354418"}/> : null}
      </View>  
    </SafeAreaView>
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
  reAuthBtn: {
    marginTop:'1%',
    height: 50,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#404757',
    borderRadius:10,
    alignSelf:'center'
  }
});