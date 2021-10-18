import { View, StyleSheet, Text, TouchableOpacity, } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const FootHeader = (props) => {
    return (
        <View style={{ marginLeft: 20, marginBottom: 10, }}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.title}>상호명: </Text>
                <Text style={styles.info}>슈어엠주식회사</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.title}>사업자등록번호: </Text>
                <Text style={styles.info}>211-86-93893</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.title}>통신판매업신고번호</Text>
                <Text style={styles.info}>2018-서울광진-0648호</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.title}>전화번호: </Text>
                <Text style={styles.info}>1588-4640</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.title}>이메일: </Text>
                <Text style={styles.info}>suremaster@surem.com</Text>
            </View>
            
        </View>
    )
};

const styles = StyleSheet.create({
    title: {
        fontSize: 13,
    },
    info: {
        fontSize: 13,
        color: 'black'
    }
});

export default FootHeader;