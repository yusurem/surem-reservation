import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, BackHandler, FlatList, Alert, TextInput } from 'react-native';
import axios from 'axios';

import { SafeAreaView } from 'react-native-safe-area-context';

const InquireScreen = ({ navigation, route }) => {
    const [title, setTitle] = useState("");

    console.log("Entered InquiryScreen. Params: ");
    console.log(route.params);
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8'}} edges={['right', 'left', 'top']}>
            <Text style={styles.headerText}>문의 글 작성</Text>
            <View style={styles.mainBox}>
                <View style={styles.titleBox}>
                    <Text style={styles.titleHead}>제목</Text>
                    <View style={styles.titleView}>
                        <TextInput 
                            style={styles.titleInput} 
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={title}
                            onChangeText={(newValue) => setTitle(newValue)}
                        />
                    </View>
                </View>
            </View>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerText: {
        fontSize: 18,
        marginTop: 50,
        marginLeft: 20
    },
    mainBox: {
        marginHorizontal: 25,
        marginTop: 10
    },
    titleBox: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        
    },
    titleHead: {
        marginRight: 15,
        marginLeft: 5
    },
    titleView: {
        backgroundColor: 'white',
        borderRadius: 8,
        flex: 1,
        // paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'gray'
    },
    titleInput: {
        flex: 1,
        marginVertical: 5,
        marginHorizontal: 10,
        height: 100,
    }
});

export default InquireScreen;