
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Platform} from 'react-native'
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db.db');

export default function MainInformationUse() {

  return (
	<View style={styles.container}>
        <View style={styles.leftSide}>
            <View style={styles.element}>
                <View style={styles.numberBox}>
                    <View style={{height:24,width:43}}>
                    <Image  
                    style={{
                        width:'100%',
                        height:'100%',
                        resizeMode: (Platform.OS == 'ios') ? 'contain' : 'center'
                    }}
                    source={require("../../assets/number1.png")} />
                    </View>

                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    앱설치
                </Text>
                <Text style={styles.contents}>
                    홈페이지 접속 혹은 앱스토어에서 
                    오피스쉐어를 검색해 앱을 설치해주세요.
                </Text>
            </View>
            <View style={styles.element}> 
                <View style={styles.numberBox}>
                    <View style={{height:24,width:43}}>
                    <Image  
                    style={{
                        width:'100%',
                        height:'100%',
                        resizeMode: (Platform.OS == 'ios') ? 'contain' : 'center'
                    }}
                    source={require("../../assets/number3.png")} />
                    </View>

                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회의실 예약
                </Text>
                <Text style={styles.contents}>
                    원하는 회의실을 선택 후,  
                </Text>
                <Text style={styles.contents}>
                    시간을 설정해 간편하게 예약합니다.
                </Text>
            </View>
            <View style={styles.element}>
                <View style={styles.numberBox}>
                    <View style={{height:24,width:43}}>
                    <Image  
                    style={{
                        width:'100%',
                        height:'100%',
                        resizeMode: (Platform.OS == 'ios') ? 'contain' : 'center'
                    }}
                    source={require("../../assets/number5.png")} />
                    </View>

                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회원실 이용
                </Text>
                <Text style={styles.contents}>
                    예약한 회의실을 편리하게 이용합니다.
                </Text>
            </View>
        </View>
        <View style={styles.rightSide}>
            <View style={styles.element}> 
                
                <View style={styles.numberBox}>
                    <View style={{height:24,width:43}}>
                    <Image  
                    style={{
                        width:'100%',
                        height:'100%',
                        resizeMode: (Platform.OS == 'ios') ? 'contain' : 'center'
                    }}
                    source={require("../../assets/number2.png")} />
                    </View>

                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회원가입
                </Text>
                <Text style={styles.contents}>
                    간편가입을 이용하여 회원가입을 완료합니다.
                </Text>
            </View>
            <View style={styles.element}> 
                <View style={styles.numberBox}>
                <View style={{height:24,width:43}}>
                    <Image  
                    style={{
                        width:'100%',
                        height:'100%',
                        resizeMode: (Platform.OS == 'ios') ? 'contain' : 'center'
                    }}
                    source={require("../../assets/number4.png")} />
                    </View>

                    <View 
                        style={styles.bar}
                    />
                </View>
                <Text style={styles.titleFont}>
                    회의실 결제
                </Text>
                <Text style={styles.contents}>
                    예약확인이 완료 되면,
                </Text>
                <Text style={styles.contents}>
                    회의실 이용요금을 결제합니다.
                </Text>
            </View>
        </View>
	</View>
  );  
}

const styles = StyleSheet.create({
	container : {
        flex: 1,
        width:'90%',
        flexDirection: 'row',
        alignSelf:'center'
    },
    leftSide : {
        flex: 1,
        marginRight:5
    },
    rightSide : {
        flex: 1,
        justifyContent:'flex-start'
    },
    numberFont : {
        fontSize: 20,
        textDecorationColor: 'blue',
        textDecorationLine: 'underline',
        textShadowColor:'blue',
    },
    bar:{
        flex:1,
        height:1,
        backgroundColor:'#BBC8E8',
        marginTop:20,
        marginLeft:10,
        marginRight:10
    },
    titleFont:{
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily:'NanumSquareRegular',
        marginBottom:5,
        color:'#333333'
    },
    element:{
        height:150
    },
    numberBox:{
        flex: 0, 
        flexDirection: 'row', 
        marginBottom: 10
    },
    contents:{
        fontFamily:'NanumSquareRegular',
        lineHeight:18,
        color:'#333333',
        fontSize: Platform.OS == 'ios' ? null : 14.7

    }
});
  