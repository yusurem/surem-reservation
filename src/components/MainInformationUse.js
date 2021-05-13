
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image} from 'react-native'
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db.db');

export default function MainInformationUse() {

  return (
	<View style={styles.container}>
        <View style={styles.leftSide}>
            <View style={styles.element}>
                <View style={styles.numberBox}>
                    <Image source={require("../../assets/number1.png")} />
                    <View 
                        style={styles.bar}
                    />

                </View>
                <Text style={styles.titleFont}>
                    앱설치
                </Text>
            </View>
            <View style={styles.element}> 
                <View style={styles.numberBox}>
                    <Image source={require("../../assets/number3.png")} />
                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회원가입
                </Text>
            </View>
            <View style={styles.element}> 
                <View style={styles.numberBox}>
                    <Image source={require("../../assets/number3.png")} />
                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회의실 예약
                </Text>
            </View>
        </View>
        <View style={styles.rightSide}>
        <View style={styles.element}> 
            <View style={styles.numberBox}>
                    <Image source={require("../../assets/number4.png")} />
                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회의실 결제
                </Text>
            </View>
            <View style={styles.element}> 
                <View style={styles.numberBox}>

                    <Image source={require("../../assets/number5.png")} />
                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회원실 이용
                </Text>

            </View>
        </View>
	</View>
  );  
}

const styles = StyleSheet.create({
	container : {
        flex: 1,
        flexDirection: 'row'
    },
    leftSide : {
        flex: 1
    },
    rightSide : {
        flex: 1
    },
    numberFont : {
        fontSize: 20,
        textDecorationColor: 'blue',
        textDecorationLine: 'underline',
        textShadowColor:'blue'
    },
    bar:{
        flex:1,
        height:1,
        backgroundColor:'#BBC8E8',
        margin:10  
    },
    titleFont:{
        fontSize: 15,
        fontWeight: 'bold' 
    },
    element:{
        marginLeft:10
    },
    numberBox:{
        flex: 1, flexDirection: 'row', alignItems: 'flex-end',
        marginBottom:10
    }
});
  