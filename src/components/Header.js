import React, { Component,useState } from "react";
import { Text, StyleSheet, View, Image } from "react-native";

export default class  extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={[styles.headerContainer, {backgroundColor: this.props.color}]}>
        <Image style={styles.logo} source={require("../../assets/logo.png")} />
        <Image style={styles.menu} source={require("../../assets/userIcon.png")} />
        <Image style={styles.menu} source={require("../../assets/searchIcon.png")} />
        <Image style={styles.menu} source={require("../../assets/menuIcon.png")} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {    
    margin: 8,
  },
  logo: {
    marginRight: '45%'
  }
});
