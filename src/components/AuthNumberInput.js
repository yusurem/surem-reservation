import React, { Component,useState } from "react";
import { Text, StyleSheet, View, TextInput,TouchableOpacity,Image, RefreshControl, Alert } from "react-native";
import * as SQLite from 'expo-sqlite';


export default class AuthNumberInput extends Component{
  constructor(props){
    super();
    this.db = SQLite.openDatabase('db.db');
    this.state = { 
      authNumber: null,
      isAuth: false
    }
  }

  selectAuthNumbers() {
    this.db.transaction((tx)=>{
      tx.executeSql(
        `SELECT * FROM AuthNumbers ORDER BY _id DESC LIMIT 1;`,
        [],
        (tx, results) =>{
          console.log(results)
          console.log(results.rows.item(0))
          console.log(results.rows.item(0).authNumber)
          if(results.rows.item(0).authNumber === this.state.authNumber){
            console.log('correct')
            this.props.setIsAuth(true)
            this.setState({isAuth: true})
          }else{
            this.state.authNumber = ''
            Alert.alert('인증번호가 틀렸습니다')
          }
          console.log('SELECT NUMBER :: ')
        }
      )
    })
  }

  render(){
    if(!this.state.isAuth){
      return (
        <View style={[styles.inputContainer, {backgroundColor: this.props.color}]}>
          <TextInput 
            style={{ 
              textAlign: 'left', 
              justifyContent: 'center', 
              borderWidth: 1 , 
              height: 50, 
              width: '70%', 
              alignSelf: 'center', 
              borderRadius:10, 
              backgroundColor:'#FFFFFF',
              paddingLeft:10 
            }} 
            placeholder="  인증번호 4자리"
            autoCapitalize="none"
            autoCorrect={false}
            value={this.state.authNumber}
            keyboardType="number-pad"
            onChangeText={(newValue) => {
                const regex = /^[0-9\b]{0,4}$/;
                if (regex.test(newValue)) {
                  console.log(newValue)
                  this.setState({authNumber : newValue});
                }
              }
            }
          />
          <TouchableOpacity style={styles.button}
            onPress={ () => {
                this.selectAuthNumbers()
                console.log('This STATE {}',this.state)
              }
            }
          >
            <View style={[styles.buttonBox,{backgroundColor:"#FFFFFF"}]}>
              <Text style={styles.title}>인증하기</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }else{
      return(
        <Text style={[styles.inputContainer]}>인증이 완료되었습니다.</Text>
      )
    }
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 50,
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center'
  },

  label: {    
    margin: 8,
  },
  logo: {
    marginRight: '45%'
  },
  button: {
    height: 52,
    width: '25%',
    marginLeft: '5%',
    borderRadius:10,
    alignSelf:'center',
    borderWidth:1,
  },
  title: {
    fontSize: 15,
    color: '#000000',
    height: 50,
    lineHeight: Platform.OS === 'ios' ? 52 : null,
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center'
  },
  tinyLogo: {
    width: 50,
    height: 50,
    marginRight: 10
  },
  buttonBox: {
    width: '100%',
    justifyContent: 'center',
    borderRadius:10
  }
});
