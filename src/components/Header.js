import React, { Component, useState, useEffect } from "react";
import { Text, StyleSheet, View, Image, TouchableOpacity, Platform } from "react-native";
import * as SQLite from 'expo-sqlite';



const Header = ({ navigation, route }) => {
  return (
    <View style={[styles.headerContainer]}>
      <Image style={styles.logo} source={require("../../assets/logo_02.png")}/>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    flex:1,
    width: '30%',
    alignItems: 'center',
    alignSelf:'center',
  },
  label: {    
    margin: 8,
  },
  logo: {
    flex:1,
    width: (Platform.OS == 'ios') ? '100%' : 100,
    resizeMode: (Platform.OS == 'ios') ? 'contain' : 'center',
    marginTop: (Platform.OS == 'ios') ? null: '5%'
  },
  menu: {
    resizeMode:'center',
  },
  branchBox: {
    // borderWidth: 2,
    // borderColor: 'red',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  branchButton: {
      backgroundColor: '#17375E',
      borderRadius: 20,
      paddingVertical: 5,
      paddingHorizontal: 30

  },
  branchText: {
      fontWeight: 'bold',
      color: 'white',
      fontSize: 16,
  }
});

export default Header;
