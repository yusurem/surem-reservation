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

const TITLE_H = 60;
const TITLE_W = 170;
const MIN_H = 30;
const HOUR_W = 130;

const TestScreen = ({ navigation, route }) => {
    const { PaymentModule } = NativeModules;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['right', 'left', 'top']} >    
            {/* <WebView source={{ 
                uri: 'http://www.google.com' }} 
            /> */}
            {/* <WebView source={{ 
                uri: 'http://192.168.0.232:9999/AllatPay/AllatPayApprovalView.do', 
                headers: { 'Content-Type': 'application/json' },
                body: 'userCode=01047620690', 
                method: 'POST' }} 
            /> */}

            <TouchableOpacity
                style={{
                    marginTop: 20,
                    backgroundColor: "#404758",
                    borderRadius: 12,
                    marginVertical: 20,
                    paddingVertical: 12,
                    elevation: 2,
                    // flex: 1,
                    marginHorizontal: 25,
                }}
                onPress={() => {
                    PaymentModule.pingModule('NATIVE CODE REACHABLE');
                }}
            >
                <Text style={styles.buttonText}>시험 콜 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{
                    marginTop: 20,
                    backgroundColor: "#404758",
                    borderRadius: 12,
                    marginVertical: 20,
                    paddingVertical: 12,
                    elevation: 2,
                    // flex: 1,
                    marginHorizontal: 25,
                }}
                onPress={ async () => {
                    try{
                        const params = {
                            userCode: "01012345678",
                            orderNo: "0",
                            resrvStime: "20210623173000",
                            payAmount: "1000",
                            adminCode: "surem3",
                            roomCode: "EEEEE",
                            roomName: "두피샵",
                            userName: "test",
                            totalTime: "120",
                            couponCode: "78",
                            couponIdx: "2",
                            resrvCode: "FFFFF"
                        }
                        const response = await PaymentModule.startPayment(params);
                        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                        console.log(response);
                        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                    } catch(e) {
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                        console.log("THIS IS ERROR: " + e);
                    }
                    // PaymentModule.loadWeb();
                }}
            >
                <Text style={styles.buttonText}>시험 콜 2</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    
});

export default TestScreen;