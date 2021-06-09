import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, BackHandler, FlatList, Alert, useWindowDimensions } from 'react-native';
import axios from 'axios';

import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons'; 
import LoadingScreen from '../screens/LoadingScreen';


import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { URL } from '../constants';

import { CalendarList, Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';


const BranchModal = ({ modalVisible, setModalVisible, handleBranch }) => {
    console.log("Opened BranchModal. Modal Visiblity: ");
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
   
    const db = SQLite.openDatabase("db.db");

    // db.transaction((tx) => {
    //     tx.executeSql('DROP TABLE IF EXISTS Branches;');
    // })

    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Branches (_id INTEGER PRIMARY KEY, location TEXT, branchCode TEXT, branchName TEXT);')
    })

    const getBranch = () => {
        console.log("retrieving...");
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

    const saveBranch = (location, branchCode, branchName) => {
        console.log("inserting...");
        db.transaction(
            (tx) => {
                tx.executeSql("INSERT INTO Branches (location, branchCode, branchName) VALUES(?,?,?);", [location, branchCode, branchName],
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
                        console.log(results);
                    },
                    (txt, error) => {
                        console.log(error);
                    }
                )
            },
        )
    }

    // console.log("RECENTS: ")
    // console.log(recents);


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
                    handleBranch(selectedItem, item.adminCode, item.adminPlaceName, recents);
                }}
            />
        );
    }

    if(initial){
        getBranch();
        getLocationList(selectedItem);
        // return (
        //     <View>
        //         <LoadingScreen/>
        //     </View>
        // );
    }

    const onDayPress = day => {
        console.log(day);
        setModalVisible(!modalVisible);
        let currDate = new Date(day.dateString);
        navigation.replace('Table', { 
            dateString: day.dateString, 
            year: day.year, 
            month: `${day.month < 10 ? 0 : ""}${day.month}`,
            day: `${day.day < 10 ? 0 : ""}${day.day}`,
            weekDay: currDate.getDay()
        });
    };

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

                    <View style={styles.recentBox}>
                        <Text>최근 이용 지점</Text>
                        <View style={styles.recentList}>
                            <TouchableOpacity
                                onPress={() => {
                                    if(recents.length > 2){
                                        handleBranch(recents[2].location, recents[2].branchCode, recents[2].branchName, recents);
                                    }
                                }}
                                style={styles.recent}
                            >
                                <Text style={styles.recentText}>{recents.length > 2 ? recents[2].branchName : "--"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if(recents.length > 1){
                                        handleBranch(recents[1].location, recents[1].branchCode, recents[1].branchName, recents);
                                    }
                                }}
                                style={[styles.recent, { marginHorizontal: 5 }]}
                            >
                                <Text style={styles.recentText}>{recents.length > 1 ? recents[1].branchName : "--"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if(recents.length > 0){
                                        handleBranch(recents[0].location, recents[0].branchCode, recents[0].branchName, recents);
                                    }
                                }}
                                style={styles.recent}
                            >
                                <Text style={styles.recentText}>{recents.length > 0 ? recents[0].branchName : "--"}</Text>
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
            


            {/* <View style={{ flex: 1 }}>
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
            </View>   */}

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
    recentBox: {
        marginVertical: 10,
        marginHorizontal: 40
    },
    recentList: {
        flexDirection: 'row',
        marginVertical: 10,
        justifyContent: 'space-between'
    },
    recent: {
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    recentText: {
        fontWeight: 'bold',
        textAlign: 'center'
    },
    branchBox: {
        // flex: 1,
        flexDirection: 'row',
        marginHorizontal: 30,
        marginVertical: 10
    },
    locationBox: {
        backgroundColor: '#F2F2F2',
        // borderWidth: 1,
        // borderColor: 'blue',
    },
    locationView: {
        backgroundColor: '#F2F2F2',
        paddingVertical: 12,
        paddingLeft: 20,
        paddingRight: 60
    },




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
    branches: {
        // borderWidth: 1,
        // borderColor: 'gray',
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center'
    }
});

export default BranchModal;