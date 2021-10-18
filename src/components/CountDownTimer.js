import React, { useState } from 'react';
import { View,Text } from 'react-native'

import { useEffect } from 'react';

export default function CountDownTimer(props){

  useEffect(()=>{
    const countdown = setInterval(()=>{
      if (parseInt(props.seconds) > 0){
        props.setSeconds(parseInt(props.seconds - 1))
      }
      if (parseInt(props.seconds) === 0){
        if (parseInt(props.minutes) === 0){
          clearInterval(countdown);
        } else {
          props.setMinutes(parseInt(props.minutes-1));
          props.setSeconds(59);
        }
      }

      if(parseInt(props.seconds) === 0 && parseInt(props.minutes) === 0){
          props.setIsSentAuth(false)
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [props.minutes, props.seconds]);

  return (
    <View 
      style={{
        // marginLeft:'15%'
      }}>
        <Text
          style={{ color: 'red', fontSize: 12 }}
        >인증번호 유효시간 {props.minutes}:{props.seconds < 10 ? `0${props.seconds}` : props.seconds}</Text>
    </View>
  );  
}
