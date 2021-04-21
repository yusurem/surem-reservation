import { View, StyleSheet, Text, TouchableOpacity, } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const IosCheckBox = (props) => {
    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    props.onChange(!props.value);
                }}
            >
                <View style={{ margin: 4 }}>
                    {props.value ? 
                        <MaterialCommunityIcons name="checkbox-marked" size={24} color="gray" />
                    :
                        <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="gray" />
                    }
                </View>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({

});

export default IosCheckBox;