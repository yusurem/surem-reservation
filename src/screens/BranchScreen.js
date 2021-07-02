import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, BackHandler, FlatList, Alert } from 'react-native';
import axios from 'axios';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { URL } from '../constants';

const BranchScreen = ({ navigation, route }) => {
    console.log("Entered BranchScreen. Params: ");
    console.log(route.params);
    
    if(route.params === undefined){
        var currDate = new Date();
        var currInfo = {
            day: currDate.getDate(),
            month: currDate.getMonth() + 1,
            weekDay: currDate.getDay(),
            year: currDate.getFullYear()
        }
        route.params = {
            dateString: `${currInfo.year}-${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}-${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`,
            day: `${currInfo.day > 9 ? currInfo.day : "0" + currInfo.day}`,
            month: `${currInfo.month > 9 ? currInfo.month : "0" + currInfo.month}`,
            weekDay: currInfo.weekDay,
            year: currInfo.year
        }
        console.log("INITIAL");
        console.log(route.params);
    }

    const locations = ['서울', '경기', '인천', '강원', '대전', '충정', '대구', '부산', '울산', '경상', '광주', '전라', '제주'];

    const [selectedItem, setSelectedItem] = useState(locations[0]);
    const [locData, setLocData] = useState([]);
    const [initial, setInitial] = useState(true);

    const [recents, setRecents] = useState([]);

    const [curr, setCurr] = useState(null);
    const [recA, setRecA] = useState(null);
    const [recB, setRecB] = useState(null);

    const db = SQLite.openDatabase("db.db");

    // db.transaction((tx) => {
    //     tx.executeSql('DROP TABLE IF EXISTS Branches;');
    // })

    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Branches (_id INTEGER PRIMARY KEY, location TEXT, branchCode TEXT, branchName TEXT);')
    })

    const getBranch = () => {
        console.log("Xretrieving...");
        db.transaction(
            (tx) => {
                tx.executeSql('select * from Branches order by _id asc;',
                    [],
                    (tx, results) => {
                        // do set current, recentA, recentB 
                        // ex. set(results.row.item(0).current)
                        // console.log(results);
                        setRecents(results.rows._array);
                    },
                    (tx, error) => {
                        console.log(error);
                    }
                );
            }
        )
    }

    const saveBranch = async (location, branchCode, branchName) => {
        console.log("inserting...");
        db.transaction(
            async (tx) => {
                await tx.executeSql("INSERT INTO Branches (location, branchCode, branchName) VALUES(?,?,?);", [location, branchCode, branchName],
                    (tx, results) => {
                        console.log(results);
                    },
                    (txt, error) => {
                        console.log(error);
                    }
                )
            },
        )
    }

    const deleteBranch = (_id) => {
        console.log("deleting...");
        db.transaction(
            (tx) => {
                tx.executeSql(`DELETE FROM Branches WHERE _id = ?;`, [_id],
                    (tx, results) => {
                        // console.log(results);
                    },
                    (txt, error) => {
                        console.log(error);
                    }
                )
            },
        )
    }

    useEffect(() => {
        getBranch();
    }, [curr])

    // saveBranch('hi1', 'hey1', 'hello1');
    // saveBranch('hi2', 'hey2', 'hello2');
    // saveBranch('hi3', 'hey3', 'hello3');
    // getBranch();
    console.log(recents);

    const getLocationList = async (loc) => {
        try{
            console.log("Attempting to retrieve location list...");
            const response = await axios.post(URL + '/getLocationList', {
            //const response = await axios.post('http://112.221.94.101:8980/getLocationList', {
                location: loc
            });
            console.log("LocationList API call successful!");
            console.log(response.data);
            if(response.data.returnCode === 'E1001'){
                console.log("Room does not exist");
                setLocData([]);
                return "None";
            }
            if(response.data.returnCode !== 'E0000'){
                console.log("Error: " + response.data.returnCode);
                Alert.alert("서버 에러가 일어났습니다. 잠시후 다시 시도해주세요.");
                return "Error";
            }
            setLocData(response.data.place);
            setInitial(false);
        } catch (err) {
            Alert.alert("서버 에러가 일어났습니다. 잠시후 다시 시도해주세요.");
            console.log(err);
        }
    }

    const LocItem = ({ item, bgColor, onPress }) => {
        // console.log(item);
        return (
            <TouchableOpacity
                style={[styles.locationView, {backgroundColor: bgColor}]}
                onPress={onPress}
            >
                <Text style={styles.locationText}>{item}</Text>
            </TouchableOpacity>
        );
    }

    const renderLocation = ({ item }) => {
        const backgroundColor = item === selectedItem ? "white" : "#F2F2F2";
        return (
            <LocItem
                item={item}
                bgColor={backgroundColor}
                onPress={ async () => {
                    setSelectedItem(item);
                    await getLocationList(item);
                }}
            />
        );
    }

    const BranchItem = ({ item, onPress }) => {
        // console.log(item);
        return (
            <TouchableOpacity
                style={[styles.branchView]}
                onPress={onPress}
            >
                <Text style={styles.branchText}>{item}</Text>
            </TouchableOpacity>
        );
    }

    const renderBranch = ({ item }) => {
        return (
            <BranchItem
                item={item.adminPlaceName}
                onPress={() => {
                    route.params["location"] = selectedItem;
                    route.params["branchCode"] = item.adminCode;
                    route.params["branchName"] = item.adminPlaceName;
                    
                    var deleted = false;
                    for(var i = 0; i < recents.length; i++){
                        if(recents[i].branchCode === item.adminCode){
                            deleteBranch(recents[i]._id);
                            deleted = true;
                        }
                    }
                    if(recents.length > 2){
                        if(!deleted){
                            deleteBranch(recents[0]._id);
                        }
                    }

                    saveBranch(selectedItem, item.adminCode, item.adminPlaceName);

                    
                    console.log("Showing the table for: " + route.params.branchName);
                    navigation.replace("Table", route.params)
                }}
            />
        );
    }

    if(initial){
        getLocationList(selectedItem);
    }
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}} edges={['right', 'left', 'top']}>
            <View style={{ flex: 1 }}>
                <View style={styles.headerBox}>
                    <Text style={styles.headerText}>지점 선택</Text>
                </View>
                <View />
                <View style={styles.mainBox}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={styles.locationBox}>
                            <FlatList
                                data={locations}
                                renderItem={renderLocation}
                                keyExtractor={item => item}
                                extraData={selectedItem}
                            />
                        </View>
                        <View style={styles.branchBox}>
                            {locData.length != 0 ?
                                <FlatList
                                    data={locData}
                                    renderItem={renderBranch}
                                    keyExtractor={item => item.adminCode}
                                    extraData={locData}
                                />
                                :
                                <Text style={{ textAlign: 'center' }}>지점이 없습니다.</Text>
                            }
                            
                        </View>

                    </View>
                    
                </View>
            </View>  
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        // borderWidth: 1,
        // borderColor: 'red',
        alignItems: 'center',
        backgroundColor: '#17375E',
        paddingBottom: 15,
        paddingTop: 30,
    },
    headerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    mainBox: {
        // borderWidth: 1,
        // borderColor: 'red',
        // margin: 5,
        flex: 1
    },
    locationBox: {
        backgroundColor: '#F2F2F2',
        // borderWidth: 1,
        // borderColor: 'blue'
    },
    locationView: {
        backgroundColor: '#F2F2F2',
        paddingVertical: 12,
        paddingLeft: 20,
        paddingRight: 60
    },
    branchView: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#D9D9D9'
    },
    locationText: {
        fontSize: 16,
        textAlign: 'center'
    },
    branchText: {
        fontSize: 16,
        marginLeft: 15
    },
    branchBox: {
        // borderWidth: 1,
        // borderColor: 'gray',
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center'
    }
});

export default BranchScreen;