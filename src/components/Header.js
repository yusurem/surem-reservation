import React, { Component,useState } from "react";
import { Text, StyleSheet, View, Image } from "react-native";

export default class Header extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={[styles.headerContainer, {backgroundColor: this.props.color}]}>
        <Image style={styles.logo} source={require("../../assets/logo_02.png")} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    flex:1,
    width: '100%',
    alignItems: 'center',
    alignSelf:'center',
  },
  label: {    
    margin: 8,
  },
  logo: {
    flex:1,
    resizeMode:'center',
    marginTop:'5%'
  },
  menu: {
    resizeMode:'center',
  }
});
