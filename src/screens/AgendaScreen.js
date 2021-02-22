import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Agenda } from 'react-native-calendars';

const AgendaScreen = () => {
    const [items, setItems] = useState({});

    const oldloadItems = (day) => {
        setTimeout(() => {
            for (let i = -15; i < 85; i++) {
            const time = day.timestamp + i * 24 * 60 * 60 * 1000;
            const strTime = this.timeToString(time);
            if (!this.state.items[strTime]) {
                this.state.items[strTime] = [];
                const numItems = Math.floor(Math.random() * 3 + 1);
                for (let j = 0; j < numItems; j++) {
                this.state.items[strTime].push({
                    name: 'Item for ' + strTime + ' #' + j,
                    height: Math.max(50, Math.floor(Math.random() * 150))
                });
                }
            }
            }
            const newItems = {};
            Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});

            this.setState( { items: newItems });

        }, 1000);
    }

    // what "day" object looks like
    // Object {
    //     "dateString": "2021-01-24",
    //     "day": 24,
    //     "month": 1,
    //     "timestamp": 1611446400000,
    //     "year": 2021,
    // }      
    const loadItems = (day) => {


    }

    const renderItem = (item) => {
        return (
            <TouchableOpacity
            // testID={testIDs.agenda.ITEM}
            style={[styles.item, {height: item.height}]}
            onPress={() => Alert.alert(item.name)}
            >
            <Text>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    const renderEmptyDate = () => {
        return (
            <View style={styles.item}>
                <Text>이 날짜에는 예약 예정이 없습니다.</Text>
            </View>
        );
    }

    const rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    }

    const timeToString = (time) => {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }

    return (
        <View>
            <Text>Agenda Screen</Text>
            <View style={{ height: 600 }}>
                <Agenda
                    // The list of items that have to be displayed in agenda. If you want to render item as empty date
                    // the value of date key has to be an empty array []. If there exists no value for date key it is
                    // considered that the date in question is not yet loaded
                    items={{
                        '2021-01-22': [{name: '[10:00 am - 11:30 am] Reservation by 나**'}],
                        '2021-01-31': [{name: "[6:00 pm - 8:00 pm] Reservation by 이**", other: 2, height: 80}],
                        '2021-01-24': [],
                        '2021-01-25': [{name: '[9:00 am - 11:20 am] Reservation by 태**'}, {name: '[2:00 pm - 4:30 pm] Reservation by 유**'}]
                    }}
                    // Callback that gets called when items for a certain month should be loaded (month became visible)
                    loadItemsForMonth={(day) => {console.log(day)}}
                    // Callback that fires when the calendar is opened or closed
                    // onCalendarToggled={(calendarOpened) => {console.log(calendarOpened)}}
                    // Callback that gets called on day press
                    // onDayPress={(day)=>{Alert.alert(day.toString())}}
                    // Callback that gets called when day changes while scrolling agenda list
                    // onDayChange={(day)=>{console.log('day changed')}}
                    // Initially selected day
                    selected={'2021-01-31'}
                    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                    // minDate={'2012-05-10'}
                    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
                    // maxDate={'2012-05-30'}
                    // Max amount of months allowed to scroll to the past. Default = 50
                    // pastScrollRange={50}
                    // Max amount of months allowed to scroll to the future. Default = 50
                    // futureScrollRange={50}
                    // Specify how each item should be rendered in agenda
                    renderItem={renderItem}
                    // renderItem={(item, firstItemInDay) => {return (<View />);}}
                    // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
                    // renderDay={(day, item) => {return (<View />);}}
                    // Specify how empty date content with no items should be rendered
                    renderEmptyDate={renderEmptyDate}
                    // renderEmptyDate={() => {return (<View />);}}
                    // Specify how agenda knob should look like
                    // renderKnob={() => {return (<View />);}}
                    // Specify what should be rendered instead of ActivityIndicator
                    // renderEmptyData = {renderEmptyDate}
                    // Specify your item comparison function for increased performance
                    // rowHasChanged={(r1, r2) => {return r1.text !== r2.text}}
                    // Hide knob button. Default = false
                    // hideKnob={true}
                    // By default, agenda dates are marked if they have at least one item, but you can override this if needed
                    markedDates={{
                        '2021-01-16': {selected: true, marked: true},
                        '2021-01-17': {marked: true},
                        '2021-01-18': {disabled: true}
                    }}
                    // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
                    // disabledByDefault={true}
                    // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
                    // onRefresh={() => console.log('refreshing...')}
                    // Set this true while waiting for new data from a refresh
                    // refreshing={false}
                    // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
                    // refreshControl={null}
                    // Agenda theme
                    // theme={{
                    //     // ...calendarTheme,
                    //     agendaDayTextColor: 'yellow',
                    //     agendaDayNumColor: 'green',
                    //     agendaTodayColor: 'red',
                    //     agendaKnobColor: 'blue'
                    // }}
                    // Agenda container style
                    // style={{}}
                />      
            </View>  
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 15
      },
      emptyDate: {
        backgroundColor: 'white',
        height: 15,
        flex: 1,
        paddingTop: 30
      }
});

export default AgendaScreen;