import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, FlatList, Alert, TextInput, Platform, useWindowDimensions } from 'react-native';
import axios from 'axios';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons'; 

import { SafeAreaView } from 'react-native-safe-area-context';
import { URL } from '../constants';

const InquireScreen = ({ navigation, route }) => {
    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [branch, setBranch] = useState("+ 지점 선택");
    const [modalVisible, setModalVisible] = useState(false);
    const [adminCode, setAdminCode] = useState("");
    const [location, setLocation] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const locations = ['서울', '경기', '인천', '강원', '대전', '충정', '대구', '부산', '울산', '경상', '광주', '전라', '제주'];

    const [selectedItem, setSelectedItem] = useState(locations[0]);
    const [locData, setLocData] = useState([]);
    const [initial, setInitial] = useState(true);

    console.log("Entered InquireScreen. Params: ");
    console.log(route.params);

    const writeVoc = async () => {
        try{
            console.log("Attempting to submit inquiry...");
            // console.log("usercode: " + usercode);
            // console.log("secretCode: " + secretCode);
            const response = await axios.post(URL+'/writeVoc', {
            // const response = await axios.post('http://112.221.94.101:8980/writeVoc', {
                usercode: route.params.usercode,
                secretCode: route.params.secretCode,
                vocSubject: title,
                vocNote: content,
                adminCode: adminCode
            });
            console.log(`Got the response!`);
            console.log(response.data);
            if(response.data.returnCode !== "E0000"){
                console.log("Error: " + response.data.returnCode);
                Alert.alert("문의작성하는데 문제가 발생했습니다. 잠시후 다시 시도해주세요.");
                return;
            }
            return response.data.returnCode;
           
        } catch (err) {
            console.log(err);
            Alert.alert("문의작성하는데 문제가 발생했습니다. 잠시후 다시 시도해주세요.");
            return 'Error';
        }
    }

    const getLocationList = async (loc) => {
        try{
            console.log("Attempting to retrieve location list...");
            const response = await axios.post(URL + '/getLocationList', {
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
        const backgroundColor = item === selectedItem ? "#F3F3F3" : "white";
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
                    setLocation(selectedItem);
                    setBranch(item.adminPlaceName);
                    setAdminCode(item.adminCode);
                    setModalVisible(!modalVisible);
                }}
            />
        );
    }

    const isInvalidText = (text) => {
        return !/[^\s]/.test(text);
     }

    if(initial){
        getLocationList(selectedItem);
    }
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F8'}} edges={['right', 'left', 'top']}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>문의 글 작성</Text>
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(!modalVisible);
                        setErrorMessage("");
                    }}
                    style={styles.branchButton}
                >
                    <Text style={styles.branchButtonText}>{location} {branch}{branch === "+ 지점 선택" ? null : "점"}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mainBox}>
                <View style={styles.titleBox}>
                    <Text style={styles.titleHead}>제목</Text>
                    <TextInput 
                        style={styles.titleInput} 
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={title}
                        onChangeText={(newValue) => {
                            setTitle(newValue);
                            setErrorMessage("");
                        }}
                        placeholder={"제목"}
                    />          
                </View>
                <TextInput
                    style={styles.contentInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={content}
                    onChangeText={(newValue) => {
                        setContent(newValue);
                        setErrorMessage("");
                    }}
                    placeholder={"내용 입력"}
                    multiline={true}
                />
            </View>
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : <Text style={styles.errorMessage}></Text>}

            <TouchableOpacity
                onPress={ async () => {
                    if(adminCode === ""){
                        setErrorMessage("지점을 선택해주세요.");
                    }
                    else if(isInvalidText(title)){
                        setErrorMessage("제목을 입력해주세요.");
                    }
                    else if(isInvalidText(content)){
                        setErrorMessage("문의 내용을 입력해주세요.");
                    }
                    else{
                        setErrorMessage("");
                        const res = await writeVoc();
                        if(res === 'E0000'){
                            navigation.navigate("Inquiry");
                        }
                    }
                }}
                style={styles.inquireButton}
            >
                <Text style={styles.buttonText}>문의작성</Text>
            </TouchableOpacity>

            <Modal 
                isVisible={modalVisible}
                backdropTransitionOutTiming={0}
                style={styles.modal}
                // swipeDirection={['down']}
                // onSwipeComplete={() => setModalVisible(!modalVisible)}
                onBackButtonPress={() => setModalVisible(!modalVisible)}
                onBackdropPress={() => setModalVisible(!modalVisible)}
            >
                <View style={[styles.modalBox, { height: windowHeight * 0.65, }]}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(!modalVisible)}
                        style={styles.closeSign}
                    >
                        <Feather name="x" size={30} color="#EDEDED" />
                    </TouchableOpacity>
                    <View style={styles.modalHeaderBox}>
                        <Text style={styles.modalHeaderText}>지점 선택</Text>
                    </View>
                    <View />
                    <View style={styles.modalMainBox}>
                        <View style={{ flexDirection: 'row' }}>
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
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
        marginHorizontal : 25
    },
    headerText: {
        fontSize: 18,
    },
    branchButton: {
        backgroundColor: '#40465A',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    branchButtonText: {
        color: 'white'
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
        marginLeft: 5,
        fontSize: 15
    },
    titleInput: {
        flex: 1,
        // marginVertical: 5,
        // marginHorizontal: 10,
        height: 40,
        fontSize: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 15
    },
    contentInput: {
        marginTop: 10,
        backgroundColor: 'white',
        height: 250,
        textAlignVertical: "top",
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        paddingTop: 10,
        fontSize: 15
    },
    inquireButton: {
        backgroundColor: '#40465A',
        alignSelf: 'center',
        marginTop: 10,
        paddingHorizontal: 30,
        paddingVertical: Platform.OS == 'android'? 7 : 10,
        borderRadius: 14,
    },
    buttonText: {
        fontSize: 16,
        color: 'white'
    },
    modal: {
        justifyContent: 'flex-end',
        // height: 200
        marginHorizontal: 0,
        marginBottom: 0,
    },
    modalBox: {
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    closeSign: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginRight: 15,
        marginTop: 15
    },
    modalHeaderBox: {
        paddingBottom: 15,
    },
    modalHeaderText: {
        // color: 'white',
        fontSize: 18,
        // fontWeight: 'bold',
        marginLeft: 25,
    },
    modalMainBox: {
        borderWidth: 1,
        borderColor: '#D7D7D7',
        // margin: 5,
        // flex: 1,
        marginHorizontal: 25,
    },
    locationBox: {
        backgroundColor: 'white',
        // borderWidth: 1,
        // borderColor: 'blue'
    },
    locationView: {
        backgroundColor: '#F2F2F2',
        // borderWidth: 1,
        // borderColor: 'blue',
        paddingVertical: 25,
        paddingLeft: 30,
        paddingRight: 70
    },
    branchView: {
        paddingVertical: 25,
        paddingLeft: 40,
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
        backgroundColor: '#F3F3F3',
        // alignItems: 'center'
    },
    errorMessage: {
        color: 'red',
        marginHorizontal: 35,
        marginTop: 10,
        alignSelf: "flex-start",
    }
});

export default InquireScreen;