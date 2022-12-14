import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StatusBar, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView} from 'react-native'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; 

import axios from 'axios';
import SignUpButton from '../../button/SignUpButton'
import AcceptTermsChkbox from '../../components/Checkbox/AcceptTermsChkbox'
import AuthNumberInput from '../../components/AuthNumberInput'
import CountDownTimer from '../../components/CountDownTimer'
import LoadingScreen from '../LoadingScreen'
import { SafeAreaView } from 'react-native-safe-area-context';
import SuremSimData from 'surem-sim-data';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import Modal from 'react-native-modal';
// import { CheckBox } from 'react-native-elements';

import CheckBox from '@react-native-community/checkbox';
import IosCheckBox from '../../components/IosCheckBox';

import * as SQLite from 'expo-sqlite';
import { TERMS } from '../../constants';

const USER_CODE = "suremqr";
const DEPT_CODE = "35--SX-DQ";

const db = SQLite.openDatabase('db.db');

db.transaction(tx=>{
  tx.executeSql('CREATE TABLE IF NOT EXISTS AuthNumbers (_id INTEGER PRIMARY KEY, authNumber TEXT);')
})

// db.transaction(tx=>{
//   tx.executeSql('CREATE TABLE IF NOT EXISTS UserId (_id INTEGER PRIMARY KEY, secretCode TEXT, usercode TEXT, username TEXT);')
// })

export default function SignUpScreen({ navigation }) {
  const navigationOptions = { header: null}
  const [name, setName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [isSentAuth, setIsSentAuth] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isCheckAcceptedTerm, setIsCheckAcceptedTerm] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const exitModal = () => {
    setModalVisible(!modalVisible);
    setIsCheckAcceptedTerm(!isCheckAcceptedTerm)
  }
  const [permissionState, setPermissionState] = useState(false);
  const askPermission = async () => {
    try{
      const result = await request(PERMISSIONS.ANDROID.READ_PHONE_STATE)
      if(result === RESULTS.GRANTED){
        setPermissionState(true);
      }else if(result === RESULTS.DENIED){
        setPermissionState(true)
      }
    }catch (error) {
      console.log('askPermission', error);
    }
  }

  const makeId = () => {
    var text = "";
    var possible = "0123456789"
    for (let i=0; i<4; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text
  }

  const sendMessage = (callphone, authNumberText) => {
    console.log('CALLPHONE :: ', callphone)
    var data = JSON.stringify(
      {
        "usercode":"suremqr",
        "deptcode":"35--SX-DQ",
        "messages":
        [
          {"message_id":"1","to":callphone},
        ],
        "text":"[?????? ?????????] ?????? ?????? ?????? ????????? "+authNumberText+" ?????????","from":"15884640","reserved_time":"000000000000"});

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

  const getPhoneNumber = async () => {
    setPhoneNum(await SuremSimData.getPhoneNumber())
    console.log('Hello',phoneNum)
    setLoading(false);
  }

  const checkHandler = (newValue) => {
    setModalVisible(!isCheckAcceptedTerm);
    // console.log(isCheckAcceptedTerm)
    if(isCheckAcceptedTerm){
      setIsCheckAcceptedTerm(!isCheckAcceptedTerm);
    }
  }

  useEffect(()=>{
    if(Platform.OS === 'android'){
      askPermission();
      if(permissionState){
        if(phoneNum == ""){
          getPhoneNumber();
        }
      }
    }
    else{
      setLoading(false);
    }
    
    // hasUserId();
    return(()=>{})
  },[permissionState]);

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
        <Text style={{ textAlign: 'center', fontSize:20, marginTop:50}}>????????????</Text>
        <Text style={{ textAlign: 'center', fontSize:14, marginTop:6}}>??????????????? ?????? ????????? ??????????????????.</Text>
        <Text></Text>
        <TextInput 
            style={{ 
              textAlign: 'left', 
              borderWidth: 1 , 
              height: 50, 
              width: '70%', 
              alignSelf: 'center', 
              borderRadius:10, 
              backgroundColor:'#FFFFFF',
              paddingLeft:10,
              marginBottom:'1%'
            }} 
            placeholder="??????"
            value={name}
            autoCapitalize="none"
            onChangeText={(newValue) => {
              setName(newValue)
            }}/>
        <TextInput 
            style={{ 
              textAlign: 'left', 
              borderWidth: 1 , 
              height: 50, 
              width: '70%', 
              alignSelf: 'center', 
              borderRadius:10, 
              backgroundColor:'#FFFFFF',
              paddingLeft:10 
            }} 
            placeholder="???????????????"
            autoCapitalize="none"
            autoCorrect={false}
            value={phoneNum}
            editable={!isSentAuth}
            selectTextOnFocus={!isSentAuth}
            onChangeText={(newValue) => {
              const regex = /^[0-9\b]{0,11}$/;
              if(newValue.length > 10){
                if (regex.test(newValue)) {
                  setPhoneNum(newValue);
                }
              }else{
                setPhoneNum(newValue)
              }
              
            }}
            keyboardType="number-pad"
        />
        <View height='1%'></View>
        { isSentAuth === true ? 
          <AuthNumberInput setIsAuth={setIsAuth}/> : 
          <TouchableOpacity style={styles.button} onPress={ () => {
            var authNumberText = makeId()
            const regName = /^[???-???|a-z|A-Z]+$/;

            if(name === ""){
              alert('????????? ??????????????????.')
              return;
            }
            console.log(name)

            if(!regName.test(name)){
              alert('????????? ????????? ??????????????????.')
              return;
            }

            if(phoneNum === ""){
              alert('????????? ????????? ??????????????????.')
              return;
            }

            const regExp = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;
            if(phoneNum === '01000000000'){
              setIsSentAuth(true)
              saveAuthNumber('0000')
              setMinutes(3)
              return;
            }
            if(regExp.test(phoneNum)){
              deleteAuthNumbers()
              saveAuthNumber(authNumberText)
              selectAuthNumbers()
              setMinutes(3)
              setIsSentAuth(true)
              sendMessage(phoneNum,authNumberText)
            }else{
              Alert.alert('????????? ????????? ????????? ??????????????????.')
            }
          }}
        >
        <Text style={styles.title}>
          ???????????? ????????????
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
            <Text style={styles.title}>???????????????</Text>
          </TouchableOpacity> : null
        }
        
        { isSentAuth && !isAuth === true ? 
          <View style={{marginLeft: '15%'}}>
            <CountDownTimer minutes={minutes} seconds={seconds} setMinutes={setMinutes} setSeconds={setSeconds} setIsSentAuth={setIsSentAuth} />
          </View>
          : null
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
        <View style={styles.checkboxContainer}>
          {/* <CheckBox 
            style={styles.checkbox}
            disabled={false}
            value={isCheckAcceptedTerm}
            onPress={(value) => {
                setModalVisible(!isCheckAcceptedTerm);
                console.log(isCheckAcceptedTerm)
                if(isCheckAcceptedTerm){
                  setIsCheckAcceptedTerm(!isCheckAcceptedTerm)
                }
              }
            }  
            checked={isCheckAcceptedTerm}
          /> */}
          {Platform.OS === 'android' ? 
            <CheckBox
                style={{
                  alignSelf:'center'
                }}
                disabled={false}
                value={isCheckAcceptedTerm}
                onValueChange={(newValue) => {
                  setModalVisible(!isCheckAcceptedTerm);
                  console.log(isCheckAcceptedTerm)
                  setIsCheckAcceptedTerm(newValue)
                }
              }  
            />
          :
              <IosCheckBox 
                  value={isCheckAcceptedTerm}
                  onChange={checkHandler}
              /> 
          }
          <Text style={styles.label}>???????????? ??? ???????????? ???????????? ??????(??????)</Text>
        </View>
        <View
          style={{
              borderBottomColor: 'black',
              borderBottomWidth: 1,
              width: '85%',
              marginBottom: '8%',
              alignSelf: 'center'
          }}
        />
        <SignUpButton isAuth={isAuth} isCheckAcceptedTerm={isCheckAcceptedTerm} phoneNum={phoneNum} name={name}/>
        <Modal 
          isVisible={modalVisible}
          backdropTransitionOutTiming={0}
          style={styles.modal}
          onBackButtonPress={exitModal}
          onBackdropPress={exitModal}
        >
            <View style={styles.modalBox}>
                <View style={styles.modalHeader}>
                    <View style={styles.cancelIcon}>
                        <Feather name="x" size={35} color="#EDEDED" />
                    </View>
                    <Text style={styles.modalHeaderText}>?????? ?????? ??? ??????</Text>
                    <TouchableOpacity
                        onPress={(exitModal)}
                    >
                        <View style={styles.cancelIcon}>
                            <Feather name="x" size={35} color="gray" />
                        </View>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.modalTerms}>
                    <Text style={styles.modalSubHeader}>
                        ?????? ?????? ??? ?????? ??????
                    </Text>
                    <ScrollView
                        // style={{borderWidth: 1, borderColor: 'black'}}
                        persistentScrollbar={true}
                        nestedScrollEnabled={true}
                        style={styles.modalTermView}
                    >
                        <Text style={styles.modalTermsText}>
                            { TERMS.SERVICE.term }
                            { TERMS.INFO.term }
                            { TERMS.FINANCIAL.term}
                        </Text>
                        
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => {
                            setModalVisible(!modalVisible);
                            setIsCheckAcceptedTerm(true);
                          }}
                        >
                        <Text style={styles.buttonText}>????????????</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
  },
  modalBox: {
    backgroundColor: '#EDEDED',
    // height: 500,
    // width: Platform.OS == 'ios' ? 350 : 280,
    borderRadius: 15,
    flex: 1,
    marginVertical: 75,
    marginHorizontal: 15,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 0,
  },
  modalHeaderText: {
      fontSize: 17,
      textAlign: 'center',
      color: 'black',
      marginTop: 18,
  },
  modalTerms: {
      padding: 22,
      // borderWidth: 1,
      // borderColor: 'red',
      flex: 1
  },
  modalSubHeader: {
      color: 'black',
      fontSize: 14,
      marginBottom: 10,
      fontWeight: 'bold',
      marginLeft: 3,
  },
  modalTermView: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: '#DDDDDD',
      // height: "100%"
  },
  modalTermsText: {
      color: 'black',
      fontSize: 14,
      padding: 5,
  },
  modal: {
      alignSelf: 'center'
  },
  acceptBtn: {
    marginTop:'10%',
    height: 30,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#404757',
    borderRadius:10,
    alignSelf:'center'
  },
  buttonText: {
      color: 'white',
      textAlign: 'center',
      width:100,
      lineHeight: Platform.OS === 'ios' ? 30 : 30
    },
  checkboxContainer: {
    flexDirection: "row",
    alignSelf:'center'
  },
  checkbox: {
  },
  label: {
    margin: 8,
    lineHeight: Platform.OS === 'ios' ? 40 : 40
  },
});