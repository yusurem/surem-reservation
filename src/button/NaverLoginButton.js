import React, { Component } from 'react';
// import { View } from 'native-base';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image
} from 'react-native';

export default class NaverLoginButton extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <TouchableOpacity style={styles.button}>
      <View style={[styles.buttonBox,{backgroundColor:this.props.color}]}>
        <Image style={styles.tinyLogo} source={require("../../assets/naverLogo.png")} />
        <Text style={styles.title}>네이버 로그인</Text>
      </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '70%',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius:10,
    alignSelf:'center',
    marginBottom:10
  },
  title: {
    fontSize: 15,
    color: '#000000',
    height: 50,
    width: 130,
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
    flexDirection: 'row',
    borderRadius:10

  }
  
});