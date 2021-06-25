import React, { Component,useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { CheckBox } from 'react-native-elements'

export default class AcceptTermsChkbox extends Component{
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
          onPress={(value) => {

            this.setState({value0: !this.state.value0})
            
            this.props.setModalVisible(!this.state.value0);
            }
          }  
          checked={this.state.value0}
        />
        <Text style={styles.label}>이용약관 및 개인정보 처리방침 동의(필수)</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    alignSelf:'center'
  },
  checkbox: {
  },
  label: {
    margin: 8,
    lineHeight: Platform.OS === 'ios' ? 40 : 40
  },
});
