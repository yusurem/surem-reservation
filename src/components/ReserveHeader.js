import React, { Component,useState } from "react";
import { Text, StyleSheet, View, Image,TouchableOpacity } from "react-native";

export default class ReserveHeader extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={[styles.headerContainer, {backgroundColor: this.props.color}]}>

        <Text style={styles.logo}>예약 확인</Text>
          <TouchableOpacity
          style={styles.qrBtn}
          >
            <Text style={styles.qrBtnText}>이용완료</Text>
          </TouchableOpacity>
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
    marginRight: '30%',
    fontSize:18,
    marginLeft:'5%'
  },
  qrBtn:{
		borderRadius:20,
		borderColor:'black',
		borderWidth: 1,
		width:70,
		height:25,
		marginLeft:'3%'
	}, 
	qrBtnText:{
		color:'black',
		width:'100%',
		textAlign:'center',
    textAlignVertical:'center'
	}
});
