import React, { Component,useState } from "react";
import { Text, StyleSheet, View, TextInput,TouchableOpacity,Image } from "react-native";

export default class AuthNumberInput extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={[styles.inputContainer, {backgroundColor: this.props.color}]}>
        <TextInput 
          style={{ textAlign: 'left', justifyContent: 'center', borderWidth: 1 , height: 50, width: '70%', alignSelf: 'center', borderRadius:10, backgroundColor:'#FFFFFF'}} 
          placeholder="인증번호 4자리"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.button}>
          <View style={[styles.buttonBox,{backgroundColor:"#FFFFFF"}]}>
            <Text style={styles.title}>인증하기</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
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
    height: 55,
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
