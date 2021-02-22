import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import axios from 'axios';

const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";

export default function VerifictionScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [verifyNum, setVerifyNum] = useState("");
  const [errorMessageA, setErrorMessageA] = useState("");
  const [codeNum, setCodeNum] = useState("");
  const [errorMessageB, setErrorMessageB] = useState("");

  const sendSMS = async () => {
    try{
      // const response = await axios.post('https://rest.surem.com/sms/v1/json', {
      const response = await axios({
        method: 'POST',
        url: 'https://rest.surem.com/sms/v1/json',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          'usercode' : USER_CODE,
          'deptcode' : DEPT_CODE,
          'messages' : [
            // {
            //   message_id :"1000000",
            //   to : "01012345678"
            // },
            {
              'to' : phoneNum
            }
          ],
          'text' : `${name}님, 안녕하세요. 슈어엠주식회사입니다.\n고객님의 인증번호는 [${codeNum}] 입니다.`,
          'from' : "15884640"
        }
      })
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     usercode : USER_CODE,
      //     deptcode : DEPT_CODE,
      //     messages : [
      //       // {
      //       //   message_id :"1000000",
      //       //   to : "01012345678"
      //       // },
      //       {
      //         to : phoneNum,
      //       }
      //     ],
      //     text : `${name}님, 안녕하세요. 슈어엠주식회사입니다.\n고객님의 인증번호는 [${codeNum}] 입니다.`,
      //     from : "15884640",
      //     // reserved_time : "209912310000"
      // });
      console.log(`Response from sending SMS: ${response}`);

    } catch (err) {
      setErrorMessageA("인증번호 전송중 문제 발생");
      console.log(err);
    }
  }

  const verifySMS = () => {
    if(verifyNum === codeNum){
      //login API call
      navigation.navigate("Home");

    }
    else{
      setErrorMessageB("입력하신 인증번호가 틀렸습니다");
    }
  }

  return (
    <View>
      <Text></Text>
      <Text style={{ textAlign: 'center' }}>회원가입</Text>
      <Text></Text>
      <TextInput 
          style={{ textAlign: 'center', borderWidth: 1 , height: 40, width: 200, alignSelf: 'center'}} 
          placeholder="이름"
          autoCapitalize="none"
          autoCorrect={false}
          value={name}
          onChangeText={(newValue) => setName(newValue)}
      />
      <Text></Text>
      <TextInput 
          style={{ textAlign: 'center', borderWidth: 1, height: 40, width: 200, alignSelf: 'center' }} 
          placeholder="휴대폰 번호"
          autoCapitalize="none"
          autoCorrect={false}
          value={phoneNum}
          onChangeText={(newValue) => setPhoneNum(newValue)}
      />
      <Text></Text>
      <Button
        title="인증번호 발송" 
        onPress = {() => {
          setCodeNum((Math.floor(Math.random() * 10001) + 1).toString()); // fix wont work because 0001 stuff like this 
          // sendSMS();
          Alert.alert("고객님의 인증번호는 [2162] 입니다.");
        }}
      />
      <Text></Text>
      {errorMessageA ? <Text style={{ color: 'red' }}>{errorMessageA}</Text> : null}
      <Text></Text>
      <TextInput 
        style={{ textAlign: 'center', borderWidth: 1, height: 40, width: 200, alignSelf: 'center' }} 
        placeholder="인증번호 4자리 입력"
        autoCapitalize="none"
        autoCorrect={false}
        value={verifyNum}
        onChangeText={(newValue) => setVerifyNum(newValue)}
      />
      <Text></Text>
      {/* {name.length > 0 ? null : <Text style={{ textAlign: 'center' }}>인증번호 유효시간: </Text>} */}
      <Text></Text>
      <Button
        title="인증" 
        onPress = {() => {
            console.log("Verifying SMS");
            // verifySMS();
            navigation.navigate('Home');
        }}
      />
      <Text></Text>
      {errorMessageB ? <Text style={{ color: 'red' }}>{errorMessageB}</Text> : null}
      <Text></Text>

    </View>
  );  
}