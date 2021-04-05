import React, { useState } from 'react';
import { View, Text, Button, TextInput, StatusBar } from 'react-native'
import axios from 'axios';
import SignUpButton from '../../button/SignUpButton'
import GoogleLoginButton from '../../button/GoogleLoginButton'
import KakaoLoginButton from '../../button/KakaoLoginButton'
import NaverLoginButton from '../../button/NaverLoginButton'

import KeepSignedChkBox from '../../components/Checkbox/KeepSignedChkbox'
import LoginSelector from '../../components/LoginSelector'
import AcceptTermsChkbox from '../../components/Checkbox/AcceptTermsChkbox'
import AcceptAlarmChkbox from '../../components/Checkbox/AcceptAlarmChkbox'
import AuthNumberInput from '../../components/AuthNumberInput'

import Header from '../../components/Header'

const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");

  return (
    <View
    style={{
        backgroundColor: '#F3F4F8',
        flex:1,
        marginTop: StatusBar.currentHeight
    }}
>
      <Header color="#F3F4F8"></Header>
      <Text></Text>
      <Text style={{ textAlign: 'center', fontSize:20}}>회원가입</Text>
      <Text style={{ textAlign: 'center', fontSize:14, marginTop:6}}>회원가입을 위한 정보를 입력해주세요.</Text>
      <Text></Text>
      <TextInput 
          style={{ textAlign: 'left', borderWidth: 1 , height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
          placeholder="이름"
          autoCapitalize="none"
          autoCorrect={false}
          value={name}
          onChangeText={(newValue) => setName(newValue)}
      />
      <View height='1%'></View>
      <TextInput 
          style={{ textAlign: 'left', borderWidth: 1 , height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
          placeholder="휴대폰번호"
          autoCapitalize="none"
          autoCorrect={false}
          value={phoneNum}
          onChangeText={(newValue) => setPhoneNum(newValue)}
      />
      <View height='1%'></View>
      <AuthNumberInput/>
      <View height='5%'></View>
      <View
        style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            width: '85%',
            alignSelf: 'center'
        }}
      />
      <AcceptTermsChkbox/>
      <AcceptAlarmChkbox/>
      <View
        style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            width: '85%',
            marginBottom: '8%',
            alignSelf: 'center'
        }}
      />
      <SignUpButton/>
      <View height='5%'></View>
      <KakaoLoginButton color='#FFFFFF'/>
      <NaverLoginButton color='#FFFFFF'/>
      <GoogleLoginButton color='#FFFFFF'/>
      <Text></Text>
    </View>
  );  
}