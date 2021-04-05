import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, FlatList } from 'react-native';

// const HomeScreen = ({ navigation, route }) => {
export function DemoScreen({ navigation, route }) {
    var selectedDates;

    if(route.params == undefined){
        selectedDates = [
            ['2021-01-16', '2:00 pm - 5:00 pm'],
            ['2021-01-29', '1:00 pm - 3:00 pm'],
            ['2021-01-12', '12:00 pm - 5:00 pm'],
            ['2021-01-06', '9:00 am - 11:00 am'],
            ['2021-01-30', '2:00 pm - 5:00 pm'],
            ['2021-01-24', '2:00 pm - 5:00 pm'],
            ['2021-01-17', '2:00 pm - 5:00 pm'],
            ['2021-01-18', '2:00 pm - 5:00 pm'],
            ['2021-01-19', '2:00 pm - 5:00 pm'],
            ['2021-02-19', '2:00 pm - 5:00 pm'],
            ['2021-03-19', '2:00 pm - 5:00 pm'],
            ['2021-04-19', '2:00 pm - 5:00 pm'],
            ['2021-05-19', '2:00 pm - 5:00 pm']
        ]
    }
    else {
        selectedDates = route.params.dates;
    }

    return (
        <View>
            <Image style={styles.imageStyle} source={require("../../assets/surem.png")} />
            <Text style={{ alignSelf: 'center' }}>(Place Holder for Home Screen)</Text>
            <Button
                title="Go to Calendar" 
                onPress = {() => {
                    navigation.navigate("Calendar")}}
            />
            <Text></Text>
            <Button
                title="Go to Calendar List" 
                onPress = {() => {
                    navigation.navigate("CalendarList")}}
            />
            <Text></Text>
            <Button
                title="Go to Test" 
                onPress = {() => {
                    navigation.navigate("Test")}}
            />
            <Text></Text>
            <Button
                title="Go to Table" 
                onPress = {() => {
                    navigation.navigate("Table")}}
            />
            <Text></Text>
            <Button
                title="Go to Login" 
                onPress = {() => {
                    navigation.navigate("LoginMenu")}}
            />
            <Text></Text>

            <Button
                title="Go to Main Menu" 
                onPress = {() => {
                    navigation.navigate("HomeMenu")}}
            />
            <Text style={{ fontSize: 17, alignSelf: 'center' }}>Recent Reservations: </Text>
            <Text></Text>
            <View style={styles.listStyle}>
                <FlatList 
                    horizontal={false}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(date) => date[0]}
                    data={selectedDates} 
                    renderItem={({item}) => { // if (element) instead it holds the values: element === {item: { name: "Friend #1" }, index: 0 }
                        return <Text style={styles.textStyle}> == Reserved on the date: [{item[0]}] during the time frame: [{item[1]}]</Text>;
                    }}
                />
            </View>
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

export default DemoScreen;