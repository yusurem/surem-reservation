import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, BackHandler, FlatList, Alert, useWindowDimensions } from 'react-native';
import axios from 'axios';

import Modal from 'react-native-modal';
import { MaterialIcons, Feather } from '@expo/vector-icons'; 
import LoadingScreen from '../screens/LoadingScreen';


import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { URL } from '../constants';

import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';


const BranchModal = ({ modalVisible, setModalVisible, handleBranch, db }) => {
    // console.log("########\n[BranchModal]\n########\nModal Visiblity: " + modalVisible);
    // console.log(modalVisible);
    // console.log(setModalVisible);

    // const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;

    const locations = ['서울', '경기', '인천', '강원', '대전', '충정', '대구', '부산', '울산', '경상', '광주', '전라', '제주'];

    const [selectedItem, setSelectedItem] = useState(locations[0]);
    const [locData, setLocData] = useState([]);
    const [initial, setInitial] = useState(true);

    const [recents, setRecents] = useState([]);

    const [curr, setCurr] = useState(null);
   
    // const db = SQLite.openDatabase("db.db");

    // db.transaction((tx) => {
    //     tx.executeSql('DROP TABLE IF EXISTS Branches;');
    // })

    // db.transaction((tx) => {
    //     tx.executeSql('CREATE TABLE IF NOT EXISTS Branches (_id INTEGER PRIMARY KEY, location TEXT, branchCode TEXT, branchName TEXT);')
    // })

    const getBranch = () => {
        // console.log("[BranchModal]:: Retrieving from SQlite...");
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql('select * from Branches order by _id asc;',
                        [],
                        (tx, results) => {
                            // do set current, recentA, recentB 
                            // ex. set(results.row.item(0).current)
                            // console.log("[BranchModal]:: Successfully retrieved.");
                            // console.log(results);
                            if(results.rows._array.length === 1){
                                setRecents(results.rows._array);
                            }
                            else if(results.rows._array.length === 2){
                                setRecents([results.rows._array[1], results.rows._array[0]]);
                            }
                            else {
                                let len = results.rows._array.length;
                                setRecents([results.rows._array[len - 1], results.rows._array[len - 2], results.rows._array[len - 3]]);
                            }
                            // else if(results.rows._array.length === 3){
                            //     setRecents([results.rows._array[2], results.rows._array[1], results.rows._array[0]]);
                            // }
                            
                            resolve("success");
                        },
                        (tx, error) => {
                            console.log(error);
                            reject(error);
                        }
                    );
                }
            )
        })
    }


    // console.log("RECENTS: ")
    // console.log(recents);


    const getLocationList = async (loc) => {
        try{
            // console.log("[BranchModal]:: Attempting to retrieve location list...");
            const response = await axios.post(URL + '/getLocationList', {
            //const response = await axios.post('http://112.221.94.101:8980/getLocationList', {
                location: loc
            });
            // console.log(response.data);
            if(response.data.returnCode === 'E1001'){
                console.log("Room does not exist");
                setLocData([]);
                return "None";
            }
            if(response.data.returnCode !== 'E0000'){
                console.log("[BranchModal]:: Error: " + response.data.returnCode);
                Alert.alert("서버 에러가 일어났습니다. 잠시후 다시 시도해주세요.");
                return "Error";
            }
            // console.log("[BranchModal]:: LocationList API call successful!");
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
                <Feather name="check" size={24} color={bgColor === 'white' ? 'white' : "red"} style={{ marginBottom: -12 }}/>
            </TouchableOpacity>
        );
    }

    const renderLocation = ({ item }) => {
        const backgroundColor = item === selectedItem ? "#F2F2F2" : "white";
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
                    handleBranch(selectedItem, item.adminCode, item.adminPlaceName, recents.reverse());
                }}
            />
        );
    }

    const initialWrapper = async () => {
        const res = await getBranch();
        if(res === "success"){
            await getLocationList(selectedItem);
        }
    }

    if(initial){
        initialWrapper();
    }

    return (
        <Modal
            isVisible={modalVisible}
            backdropTransitionOutTiming={0}
            style={styles.modal}
            onBackButtonPress={() => setModalVisible(!modalVisible)}
            onBackdropPress={() => setModalVisible(!modalVisible)}
            hideModalContentWhileAnimating={true}
            backdropTransitionInTiming={0}
            useNativeDriver={true}
        >
            {initial ?
                <View>
                    <LoadingScreen/>
                </View>
                :
                <View style={[styles.modalView, { height: windowHeight * 0.75 }]}>

                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}
                        style={styles.cancelButton}
                    >
                        <MaterialIcons name="cancel" size={24} color="black" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerView}>
                        <Text style={styles.headerText}>최근 이용 지점</Text>
                    </View>

                    <View style={styles.recentBox}>
                        <View style={styles.recentList}>
                            <TouchableOpacity
                                onPress={() => {
                                    if(recents.length > 0){
                                        handleBranch(recents[0].location, recents[0].branchCode, recents[0].branchName, recents.reverse());
                                    }
                                }}
                                style={styles.recent}
                            >
                                {/* <Text style={styles.recentText}>{recents[2] === null ? "--" : recents[2].branchName}</Text> */}
                                <Text style={styles.recentText}>{recents.length > 0 ? recents[0].branchName + "점" : "--"}</Text>
                                {/* <Text style={styles.recentText}>{recents.length > 0 ? "서울강변점" : "--"}</Text> */}


                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if(recents.length > 1){
                                        handleBranch(recents[1].location, recents[1].branchCode, recents[1].branchName, recents.reverse());
                                    }
                                }}
                                style={[styles.recent, { marginHorizontal: 10 }]}
                            >
                                {/* <Text style={styles.recentText}>{recents[1] === null ? "--" : recents[1].branchName}</Text> */}
                                <Text style={styles.recentText}>{recents.length > 1 ? recents[1].branchName + "점" : "--"}</Text>

                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if(recents.length > 2){
                                        handleBranch(recents[2].location, recents[2].branchCode, recents[2].branchName, recents.reverse());
                                    }
                                }}
                                style={styles.recent}
                            >
                                {/* <Text style={styles.recentText}>{recents[0] === null ? "--" : recents[1].branchName}</Text> */}
                                <Text style={styles.recentText}>{recents.length > 2 ? recents[2].branchName + "점" : "--"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={styles.branchBox}>
                        <View style={styles.locationBox}>
                            <FlatList
                                data={locations}
                                renderItem={renderLocation}
                                keyExtractor={item => item}
                                extraData={selectedItem}
                            />
                        </View>
                        <View style={styles.branches}>
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
            }
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end'
    },
    modalView: {
        backgroundColor: 'white',
        paddingBottom: 50,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },
    cancelButton: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 15,
        marginTop: 15,
    },
    headerView: {
        // marginLeft: 20,
        marginHorizontal: 20,
    },
    headerText: {
        color: 'black'
    },
    recentBox: {
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 20,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    recentList: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    recent: {
        // paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BEBEBE',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    recentText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 12,
        // lineHeight: 10
    },
    branchBox: {
        // flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#C3C3C3',
    },
    locationBox: {
        // backgroundColor: '#F2F2F2',
        // borderWidth: 1,
        // borderColor: 'red',
    },
    locationView: {
        paddingVertical: 24,
        paddingLeft: 20,
        paddingRight: 15,
        flexDirection: 'row'
    },
    branchView: {
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderColor: '#C3C3C3',
    },
    locationText: {
        fontSize: 14,
        textAlign: 'center',
        paddingRight: 30,
    },
    branchText: {
        fontSize: 14,
        marginLeft: 15
    },
    branches: {
        // borderWidth: 1,
        // borderColor: 'green',
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center'
        backgroundColor: '#F2F2F2',
    }
});

export default BranchModal;