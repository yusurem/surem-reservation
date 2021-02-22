import React, { Component,useState } from "react";
import { Text, StyleSheet, View } from "react-native";

export default class LoginDividor extends Component{
  constructor(props){
    super(props);
  }

  render(){

    return (
      <View style={styles.checkboxContainer}>
        <Text style={styles.label}>회원가입 | 비밀번호 찾기</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignSelf: 'center'
  },
  label: {    
    margin: 8,
  },
});
