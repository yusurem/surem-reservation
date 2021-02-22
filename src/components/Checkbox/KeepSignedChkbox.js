import React, { Component,useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import CheckBox from "@react-native-community/checkbox"

export default class KeepSignedChkbox extends Component{
  constructor(props){
    super(props);
    this.state = {
      value0: false
    }
  }

  render(){

    return (
      <View style={styles.checkboxContainer}>
        <CheckBox 
          style={styles.checkbox}
          disabled={false}
          value={this.state.value0}
          onValueChange={(value) => 
            this.setState({
              value0: value,
            })
          }  
        />
        <Text style={styles.label}>로그인 상태 유지</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginLeft: '15%'
  },
  checkbox: {
  },
  label: {
    margin: 8,
  },
});
