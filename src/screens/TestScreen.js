import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, BackHandler, Alert, Image, FlatList, NativeModules } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';
import LoadingScreen from './LoadingScreen';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment-timezone';
import { URL } from '../constants';
import BranchModal from '../components/BranchModal';
import * as SQLite from 'expo-sqlite';
import { WebView } from 'react-native-webview';

// notifications
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';


const TITLE_H = 60;
const TITLE_W = 170;
const MIN_H = 30;
const HOUR_W = 130;

const TestScreen = ({ navigation, route }) => {
    // const { PaymentModule } = NativeModules;

    // registerForPushNotificationsAsync = async () => {
    //     if (Device.isDevice) {
    //         const { status: existingStatus } = await Notifications.getPermissionsAsync();
    //         let finalStatus = existingStatus;

    //         if (existingStatus !== 'granted') {
    //             const { status } = await Notifications.requestPermissionsAsync();
    //             finalStatus = status;
    //         }
    //         if (finalStatus !== 'granted') {
    //             alert('Failed to get push token for push notification!');
    //             return;
    //         }

    //         const token = (await Notifications.getExpoPushTokenAsync()).data;
    //         // const token = (await Notifications.getExpoPushTokenAsync("@surem/reservation")).data;
    //         console.log(token);

    //         this.setState({ expoPushToken: token });

    //     } else {
    //         alert('Must use physical device for Push Notifications');
    //     }
        
    //     if (Platform.OS === 'android') {
    //         Notifications.setNotificationChannelAsync('default', {
    //             name: 'default',
    //             importance: Notifications.AndroidImportance.MAX,
    //             vibrationPattern: [0, 250, 250, 250],
    //             lightColor: '#FF231F7C',    
    //         });
    //     }
    //     };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >    
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    
});

export default TestScreen;