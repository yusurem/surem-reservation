import { useNavigation } from '@react-navigation/native';
import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';


export default function SignUpButton(props){
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.button} onPress={()=>{
        console.log(props)
        if(props.isAuth && props.isCheckAcceptedTerm){
          navigation.navigate('Home')
        }
      }
    }>
      <Text style={styles.title}>회원가입</Text>
    </TouchableOpacity>
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
});