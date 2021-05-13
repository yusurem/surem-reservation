import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Image, Button, Alert, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen = ({ navigation, route }) => {

    return (    
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8' }}>
            <View style={{justifyContent:'center', height:'100%', width:'100%', alignItems:'center'}}>
                {/* <Image style={styles.logo} source={require("../../assets/LoadingIcon.png")} /> */}
                <ActivityIndicator size="large" color="gray"/>
                <Text style={styles.loadingText}>로딩중</Text>
            </View>
        </SafeAreaView> 
    );
}

const styles = StyleSheet.create({ 
    logo:{
        width:'40%',
        resizeMode:'contain'
    },
    loadingText: {
        color: "gray",
        marginTop: 5
    },
});

export default LoadingScreen;