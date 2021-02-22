import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';

export default function HomeMenuScreen({ navigation, route }) {
    return (
        <View>
            <Image style={styles.imageStyle} source={require("../../assets/surem.png")} />
            <Text style={{ alignSelf: 'center' }}>오피스 쉐어 서비스</Text>
            <Button
                title="홈" 
                onPress = {() => {
                    navigation.navigate("Home")}}
            />
            <Text></Text>
            <Button
                title="비밀번호" 
                onPress = {() => {
                    navigation.navigate("CalendarList")}}
            />
            <Text></Text>
            <Button
                title="로그인" 
                onPress = {() => {
                    navigation.navigate("Login")}}
            />
            <Text></Text>
        </View>
    )
};

const styles = StyleSheet.create({
    listStyle:{
        borderWidth: 2,
        borderColor: 'black',
        alignSelf: 'center',
        width: 300,
        height: 200
    },
    imageStyle: {
        height: 120,
        width: 200,
        alignSelf: 'center'
    }
});