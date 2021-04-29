import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, BackHandler, FlatList, Alert, ScrollView } from 'react-native';
import axios from 'axios';

import { SafeAreaView } from 'react-native-safe-area-context';

const InquiryScreen = ({ navigation, route }) => {
    console.log("Entered InquiryScreen. Params: ");
    console.log(route.params);
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8'}} edges={['right', 'left', 'top']}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>1:1 문의 내역</Text>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Inquire");
                    }}
                    style={styles.askButton}
                >
                    <Text style={styles.askText}>문의작성</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mainBox}>
                    <Text style={{ marginBottom: 40}}>문의내역이 없습니다.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        flexDirection: 'row',
        marginTop: 50,
        marginHorizontal: 30,
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 18
    },
    askButton: {
        backgroundColor: '#40465A',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    askText: {
        color: 'white'
    },
    mainBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: "red",
    }
});

export default InquiryScreen;