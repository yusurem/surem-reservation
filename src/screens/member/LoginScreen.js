import React, { useState } from 'react';
import { View, Text, Button, TextInput, StatusBar } from 'react-native'
import axios from 'axios';
import LoginButton from '../../button/LoginButton'
import GoogleLoginButton from '../../button/GoogleLoginButton'
import KakaoLoginButton from '../../button/KakaoLoginButton'
import NaverLoginButton from '../../button/NaverLoginButton'

import KeepSignedChkBox from '../../components/Checkbox/KeepSignedChkbox'
import LoginSelector from '../../components/LoginSelector'
import Header from '../../components/Header'

const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");

  return (
    <View
        style={{
            backgroundColor: '#CFDAF6',
            flex:1,
            marginTop: StatusBar.currentHeight
        }}
    >
      <Header color="#CFDAF6"></Header>
      <Text></Text>
      <Text style={{ textAlign: 'center', fontSize:20}}>로그인</Text>
      <Text></Text>
      <TextInput 
          style={{ textAlign: 'left', borderWidth: 0, height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
          placeholder="휴대폰 번호"
          autoCapitalize="none"
          autoCorrect={false}
          value={name}
          onChangeText={(newValue) => setName(newValue)}
      />
      <Text></Text>
      <TextInput 
          style={{ textAlign: 'left', borderWidth: 0 , height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
          placeholder="비밀번호"
          autoCapitalize="none"
          autoCorrect={false}
          value={phoneNum}
          onChangeText={(newValue) => setPhoneNum(newValue)}
      />
      <KeepSignedChkBox/>
      <LoginButton/>
      <LoginSelector/>
      <View
        style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            width: 40,
            marginBottom: 20,
            alignSelf: 'center'
        }}
      />
            <KakaoLoginButton color="#F4F4F4"/>
            <NaverLoginButton color="#F4F4F4"/>
            <GoogleLoginButton color="#F4F4F4"/>
      <Text></Text>
    </View>
  );  
}