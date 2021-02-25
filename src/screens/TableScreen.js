import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native-gesture-handler';

const TableScreen = ({ navigation, route }) => {
    // const setupData = (data) => {
    // }

    const state = {
        tableHead: ['1호실', '2호실', '3호실'],
        tableTitle: ['', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '13:00 PM', '14:00 PM', '15:00 PM', 
                        '16:00 PM', '17:00 PM', '18:00 PM', '19:00 PM', '20:00 PM', '21:00 PM', '22:00 PM', 
                        '23:00 PM', '24:00 AM',],
        tableData: []
    };


    const tableData = [];
    for(let i = 0; i < state.tableTitle.length - 1; i++){
        const rowData = [];
        for(let j = 0; j < state.tableHead.length; j++){
            rowData.push(
                <TouchableOpacity
                    onPress={() => navigation.navigate("Reservation")}
                >
                    <View style={{ flexGrow: 1, backgroundColor: '#faefe1', padding: 19}}>
                        <Text style={{ textAlign: 'center' }}>예약가능</Text>
                    </View>
                </TouchableOpacity>
            );
        }
        tableData.push(rowData);
    }

    state.tableData = tableData;

    const reservedElements = (value) => {
        return (
            <View>
                <Text style={{ padding: 19 , backgroundColor:'#f29116', textAlign: 'center'}}>예약완료</Text>
            </View>
        )
    };

    const myReservedElements = (value) => {
        return (
            <View>
                <Text style={{ padding: 19 , backgroundColor:'#51bbe8', textAlign: 'center'}}>내 예약</Text>
            </View>
        )
    };

    state.tableData[0][0] = reservedElements();
    state.tableData[1][0] = reservedElements();
    state.tableData[2][0] = reservedElements();
    state.tableData[5][2] = reservedElements();
    state.tableData[9][1] = reservedElements();
    state.tableData[7][2] = reservedElements();
    state.tableData[6][2] = reservedElements();

    state.tableData[6][0] = myReservedElements();
    state.tableData[7][0] = myReservedElements();

    return (
        <View>
            <Text style={styles.dateStyle}></Text>
            <View style={{ flexDirection: 'row' , justifyContent: 'center', backgroundColor: '#fff' }}>
                <TouchableOpacity
                    onPress={() => {
                        var newDate = new Date(route.params.date);
                        newDate.setDate(newDate.getDate() - 1);
                        var month = newDate.getMonth() + 1;
                        var date = newDate.getDate();
                        navigation.navigate('Table', { date: `${newDate.getFullYear()}-${month < 10 ? 0 : ""}${newDate.getMonth() + 1}-${date < 10 ? 0 : ""}${newDate.getDate()}` })
                    }}
                >
                    <MaterialCommunityIcons name="less-than" color="black" size={30} />
                </TouchableOpacity>
                <Text>     </Text>
                <Text style={styles.dateStyle}>{route.params.date}</Text>
                <Text>     </Text>
                <TouchableOpacity
                    onPress={() => {
                        var newDate = new Date(route.params.date);
                        newDate.setDate(newDate.getDate() + 1);
                        var month = newDate.getMonth() + 1;
                        var date = newDate.getDate();
                        navigation.navigate('Table', { date: `${newDate.getFullYear()}-${month < 10 ? 0 : ""}${newDate.getMonth() + 1}-${date < 10 ? 0 : ""}${newDate.getDate()}` })
                    }}
                >
                    <MaterialCommunityIcons name="greater-than" color="black" size={30} />
                </TouchableOpacity>
            </View>
            <Text style={styles.dateStyle}></Text>
            <ScrollView style={{marginRight: 0}}>
                <View style={styles.container}>
                    <Table borderStyle={{ borderWidth: 1 }}>
                        <Col data={state.tableTitle} style={styles.colHead} textStyle={styles.text} />
                    </Table>
                    <ScrollView horizontal={true}>
                        <Table borderStyle={{ borderWidth: 1 }}>
                            <Row data={state.tableHead} style={styles.head} textStyle={styles.text} />
                            <Rows data={state.tableData} style={styles.row} textStyle={styles.text} />
                        </Table>
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flexDirection: 'row',
        padding: 0, 
        paddingTop: 0, 
        paddingLeft: 20,
        backgroundColor: '#fff',
        paddingBottom: 100
    },
    colHead: {
        width: 90,
    },
    head: {  
        height: 60,  
        backgroundColor: '#f1f8ff'  
    },
    wrapper: { 
        flexDirection: 'row' 
    },
    title: { 
        backgroundColor: '#f6f8fa' 
    },
    row: {  
        height: 60,
        width: 400
    },
    text: { 
        textAlign: 'center' 
    },
    dateStyle: {
        textAlign: 'center',
        backgroundColor: '#fff',
        fontSize: 18
    }
});

export default TableScreen;