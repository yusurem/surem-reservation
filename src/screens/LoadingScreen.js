import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Image, Button, Alert, TouchableOpacity, ScrollView, } from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen = ({ navigation, route }) => {

    return (    
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8' }}>
            <View style={{justifyContent:'center', height:'100%', width:'100%', alignItems:'center'}}>
                <Image style={styles.logo} source={require("../../assets/LoadingIcon.png")} />
            </View>
        </SafeAreaView> 
    );
}

const styles = StyleSheet.create({ 
    logo:{
        width:'40%',
        resizeMode:'contain'
    }
});

export default LoadingScreen;