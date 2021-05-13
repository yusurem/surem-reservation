import React, { Component,useState } from "react";
import { Text, StyleSheet, View, Image } from "react-native";

export default class Header extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={[styles.headerContainer, {backgroundColor: this.props.color}]}>
        <Image style={styles.logo} source={require("../../assets/logo.png")} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    width: '100%',
    alignItems: 'center',
  },
  label: {    
    margin: 8,
  },
  logo: {
    resizeMode:'center'
  },
  menu: {
  }
});
