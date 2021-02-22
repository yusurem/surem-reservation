import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export default class LoginButton extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <TouchableOpacity style={styles.button}>
        <Text style={styles.title}>로그인</Text>
      </TouchableOpacity>
    )
  }
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
});