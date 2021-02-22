import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import axios from 'axios';

import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';



const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";


const TestScreen = () => {
    
    // const [timer, setTimer] = useState("5:00");
    const [verifyNum, setVerifyNum] = useState("");
    const [minutes, setMinutes] = useState(3);
    const [seconds, setSeconds] = useState(0);
    const [errorMessageA, setErrorMessageA] = useState("");
    /*
    const sendSMS = async () => {
        try{
          const response = await axios.post('https://rest.surem.com/sms/v1/json', {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              'usercode' : USER_CODE,
              'deptcode' : DEPT_CODE,
              'messages' : [
                // {
                //   message_id :"1000000",
                //   to : "01012345678"
                // },
                {
                  'to' : '01041354418',
                }
              ],
              'text' : `나상원님, 안녕하세요. 슈어엠주식회사입니다.\n고객님의 인증번호는 [0000] 입니다.`,
              'from' : "15884640",
              // reserved_time : "209912310000"
          });
          console.log(`Response from sending SMS: ${response}`);
    
        } catch (err) {
          setErrorMessageA("인증번호 전송중 문제 발생");
          console.log(err);
        }
    }


    const startTimer = () => {
        let timeId = setInterval(() => {
            console.log("setting Interval");
            console.log(minutes);
            console.log(seconds);
            if(seconds > 0){
                setSeconds(seconds - 1);
            }

            if(seconds === 0){
                if(minutes === 0){
                    clearInterval(timeId);
                }   
                else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }
        }, 1000);

    }
    */
    const testAPI = async () => {
        try{
            console.log("Attempting to send API");
            const response = await axios.post('http://112.221.94.101:8980/getEncryptCode', {
                'usercode' : 'admin1'
            });
            console.log(`Got the response!`);
            console.log(response)
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }

    const testAPI2 = async () => {
        try{
            console.log("Attempting to send API");
            const response = await axios.post('http://112.221.94.101:8980/getReservation', {
                "requestType" : "user",  // user (사용자 별 조회), branch (지점 별 조회)
                "requestData" : "admin1",
                "secretCode" : "4HDsKfzSR3eEegv3FiZIA30x+Z6uOccMVlw56N034vNO0FGw7aUqCA0USHdoEK9oL2vlWg=="
            });
            console.log(`Got the response!`);
            console.log(response);
        } catch (err) {
            setErrorMessageA("API 문제발생");
            console.log(err);
        }
    }
    

    return (
        <View>
            <Button
                title="시간 시작" 
                onPress = {() => {
                    setErrorMessageA("");
                    // startTimer();
                    // sendSMS();
                    // testAPI();
                    testAPI2();
                }}
            />

            <Text></Text>
            {errorMessageA ? <Text style={{ color: 'red' }}>{errorMessageA}</Text> : null}
            <Text></Text>

            <Text></Text>
            <Text>Time Left: {minutes}: {seconds < 10 ? `0${seconds}` : seconds}</Text>
            <Text></Text>
            <TextInput 
                style={{ textAlign: 'center', borderWidth: 1, height: 40, width: 200, alignSelf: 'center' }} 
                placeholder="인증번호 4자리 입력"
                autoCapitalize="none"
                autoCorrect={false}
                value={verifyNum}
                onChangeText={(newValue) => setVerifyNum(newValue)}
            />

        </View>

    );
}

const styles = StyleSheet.create({
    container: { 
        flexDirection: 'row',
        padding: 0, 
        paddingTop: 0,
        paddingLeft: 20, 
        backgroundColor: '#fff' 
    },
    colHead: {
        width: 90,
    },
    head: {  
        height: 60,  
        backgroundColor: '#f1f8ff'  
    },
    wrapper: { 
        flexDirection: 'row' 
    },
    title: { 
        backgroundColor: '#f6f8fa' 
    },
    row: {  
        height: 60,
        width: 400
    },
    text: { 
        textAlign: 'center' 
    },
    dateStyle: {
        textAlign: 'center',
        backgroundColor: '#fff'
    }
});

export default TestScreen;