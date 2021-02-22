import React, { useState } from 'react';
import { View, Text, TextInput, StatusBar } from 'react-native'
import AuthNumberInput from '../../components/AuthNumberInput'
import SendTempPasswordBtn from '../../button/SendTempPasswordBtn'
import Header from '../../components/Header'

export default function FindPasswordScreen({ navigation }) {
  const [name, setName] = useState("");

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
      <Text style={{ textAlign: 'center', fontSize:20}}>비밀번호 찾기</Text>
      <Text></Text>
      <TextInput 
          style={{ textAlign: 'left', borderWidth: 1, height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
          placeholder="휴대폰 번호"
          autoCapitalize="none"
          autoCorrect={false}
          value={name}
          onChangeText={(newValue) => setName(newValue)}
      />
      <View height='1%'></View>
      <AuthNumberInput/>
      <Text style={{width: '100%',marginLeft:'15%',color:'red'}}>인증번호 유효시간 2:59</Text>
      <View height='5%'/>
      <SendTempPasswordBtn/>
    </View>
  );  
}