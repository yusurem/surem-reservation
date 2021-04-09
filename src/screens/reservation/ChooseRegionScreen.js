import React, { useState } from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReserveHeader from '../../components/ReserveHeader';

const Item = ({ title }) => (
  <TouchableOpacity style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </TouchableOpacity>
);

const DATA = [
  {
    id:"1",
    title:"서울",
  },
  {
    id:"2",
    title:"경기",
  },
  {
    id:"3",
    title:"인천",
  },
  {
    id:"4",
    title:"강원",
  },
  {
    id:"5",
    title:"충청",
  },
  {
    id:"6",
    title:"전라",
  },
  {
    id:"7",
    title:"경상",
  },
  {
    id:"8",
    title:"제주",
  }
]

export default function ChooseRegionScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({item}) => {
    const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
    const color = item.id === selectedId ? 'white' : 'black'

    return (
      <Item
      item={item} 
        title={item.title}
      />
    )
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <FlatList
        data={DATA}
        renderItem = {renderItem}
        keyExtractor = {item => item.id}
      />
    </SafeAreaView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title:{
    fontSize: 32,
  }
});