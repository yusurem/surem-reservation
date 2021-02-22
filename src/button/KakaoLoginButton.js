import { View } from 'native-base';
import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image
} from 'react-native';

export default class KakaoLoginButton extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <TouchableOpacity style={styles.button}>
        <View style={[styles.buttonBox,{backgroundColor:this.props.color}]}>
          <Image style={styles.tinyLogo} source={require("../../assets/kakaoLogo.png")} />
          <Text style={styles.title}>카카오계정 로그인</Text>
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