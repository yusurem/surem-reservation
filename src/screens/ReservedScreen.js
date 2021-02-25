import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput } from 'react-native';

const ReservedScreen = ({ navigation, route }) => {
    const [name, setName] = useState("");
    const date = route.params.reservationDate;

    return (
        <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 25 }} >예약완료!</Text>
            <Text>예약날짜:</Text>
            <Text>Date: {`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`}</Text>
            {/* <Text>Time: {`${date.getHours()}:${date.getMinutes()}`}</Text> */}
            <Text>Time: 16:30 pm ~ 18:30 pm</Text>

            {/* <View>
                <Text>이름: </Text>
                <TextInput 
                    style={styles.input} 
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={name}
                    onChangeText={(newValue) => setName(newValue)}
                />
                {name.length > 0 ? null : <Text>Example: Brandon</Text>}
            </View> */}
            <Text></Text>

            <TouchableHighlight
                style={styles.openButtonOne}
                onPress={() => {
                    navigation.navigate('CalendarList');
                }}
            >
                <Text style={styles.textStyle}>더 예약하기</Text>
            </TouchableHighlight>
            <Text></Text>
            <TouchableHighlight
                style={styles.openButtonTwo}
                onPress={() => {
                    navigation.navigate('Home');
                }}
            >
                <Text style={styles.textStyle}>홈</Text>
            </TouchableHighlight>
        </View>
    );
}

const styles = StyleSheet.create({ 
    openButtonOne: {
        backgroundColor: "orange",
        borderRadius: 20,
        padding: 20,
        elevation: 2
    },
    openButtonTwo: {
        backgroundColor: "blue",
        borderRadius: 20,
        padding: 20,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    input: {
        margin: 15,
        borderColor: 'black',
        borderWidth: 1
    }
});

export default ReservedScreen;