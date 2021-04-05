import React, { useState } from 'react';
import { View, StatusBar, Text, ScrollView} from 'react-native'
import Header from '../../components/Header'

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState("");

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View>
      <Header color="#FFFFFF"></Header>
      <View style={{width:'90%',height:'20%',backgroundColor:'#A2AFDC',borderRadius:10,alignSelf:'center'}}>
        <View style={{height:'30%'}}/>
        <Text style={{color:'white',fontSize:23,marginLeft:'40%'}}>회의실 예약하기 ▶︎</Text>
        <View style={{height:'5%'}}/>
        <Text style={{color:'white',fontSize:10,marginLeft:'35%'}}>할인된 가격에 내 마음에 쏙 드는 회의실까지!</Text>
        <Text style={{color:'white',fontSize:10,marginLeft:'36%'}}>오피스쉐어 앱으로 회의실을 예약해보세요.</Text>
      </View>
      <Text></Text>
      <View style={{width:'90%',height:'28%',backgroundColor:'#4284E4',borderRadius:10,alignSelf:'center'}}>
        <View style={{height:'8%'}}/>
        <Text style={{color:'white',marginLeft:'3%',fontSize:15}}>MY 예약내역</Text>
        <View style={{height:'5%'}}/>
        <View style={{width:'100%',flexDirection:'row'}}>
          <Text style={{color:'white',marginLeft:'5%'}}>2021/02/23 14:00PM 2시간 1호</Text>
          <View
            style={{
              borderRadius:7,
              borderColor:'white',
              borderWidth: 1,
              width:60,
              height:20,
              marginLeft:'15%'
            }}>
              <Text style={{color:'white',width:'100%',textAlign:'center'}}>QR 코드</Text>
          </View>
        </View>
        <Text></Text>
        <View style={{width:'90%',height:200,backgroundColor:'#4284E4',borderRadius:10,alignSelf:'center'}}>
          <View style={{height:'8%'}}/>
          <Text style={{color:'white',marginLeft:'3%',fontSize:15}}>MY 예약내역</Text>
          <View style={{height:'5%'}}/>
          <View style={{width:'100%',flexDirection:'row'}}>
            <Text style={{color:'white',marginLeft:'5%'}}>2021/02/23 14:00PM 2시간 1호</Text>
            <View
              style={{
                borderRadius:7,
                borderColor:'white',
                borderWidth: 1,
                width:60,
                height:20,
                marginLeft:'15%'
              }}>
                <Text style={{color:'white',width:'100%',textAlign:'center'}}>QR 코드</Text>
            </View>
          </View>
          <View style={{height:'5%'}}/>
          <View style={{width:'100%',flexDirection:'row'}}>
            <Text style={{color:'white',marginLeft:'5%'}}>2021/02/24 15:00PM 2시간 1호</Text>
            <View
              style={{
                borderRadius:7,
                borderColor:'white',
                borderWidth: 1,
                width:60,
                height:20,
                marginLeft:'15%'
              }}>
                <Text style={{color:'white',width:'100%',textAlign:'center'}}>QR 코드</Text>
            </View>
          </View>
          <View style={{height:'5%'}}/>
          <View style={{width:'100%',flexDirection:'row'}}>
            <Text style={{color:'white',marginLeft:'5%'}}>2021/02/25 16:00PM 3시간 3호</Text>
            <View
              style={{
                borderRadius:7,
                borderColor:'white',
                borderWidth: 1,
                width:60,
                height:20,
                marginLeft:'15%'
              }}>
                <Text style={{color:'white',width:'100%',textAlign:'center'}}>QR 코드</Text>
            </View>
          </View>
          <View style={{height:'5%'}}/>
          <View style={{width:'100%',flexDirection:'row'}}>
            <Text style={{color:'white',marginLeft:'5%'}}>2021/02/23 14:00PM 2시간 1호</Text>
            <View
              style={{
                borderRadius:7,
                borderColor:'white',
                borderWidth: 1,
                width:60,
                height:20,
                marginLeft:'15%'
              }}>
                <Text style={{color:'white',width:'100%',textAlign:'center'}}>QR 코드</Text>
            </View>
          </View>
          <View style={{height:'5%'}}/>
          <Text style={{width:'100%',marginLeft:'85%',color:'white'}}>더보기</Text>
        </View>
        <Text></Text>
        <View style={{width:'90%',height:150,backgroundColor:'#ECEFF4',borderRadius:10,alignSelf:'center'}}>
          <View style={{height:'8%'}}/>
          <Text style={{color:'black',marginLeft:'3%',fontSize:15}}>공지사항</Text>
          <View style={{height:'5%'}}/>
          <View style={{width:'100%',flexDirection:'row'}}>
            <Text style={{color:'black',marginLeft:'3%'}}>신규 오픈 안내문입니다.</Text>
            <View
              style={{
                borderRadius:7,
                borderColor:'#C4D2DF',
                borderWidth: 1,
                width:80,
                height:20,
                marginLeft:105
              }}>
                <Text style={{color:'#9FA0A2',width:'100%',textAlign:'center'}}>2021.02.15</Text>
            </View>
          </View>
          <View style={{height:'5%'}}/>
          <View style={{width:'100%',flexDirection:'row'}}>
            <Text style={{color:'black',marginLeft:'3%'}}>어플 안내공지 1차 안내문 입니다.</Text>
            <View
              style={{
                borderRadius:7,
                borderColor:'#C4D2DF',
                borderWidth: 1,
                width:80,
                height:20,
                marginLeft:50
              }}>
                <Text style={{color:'#9FA0A2',width:'100%',textAlign:'center'}}>2021.02.14</Text>
            </View>
          </View>
          <View style={{height:'10%'}}/>
          <Text style={{width:'100%',marginLeft:'85%',color:'black'}}>더보기</Text>
          <View style={{height:'10%'}}/>
        </View>
        <Text></Text>
        <View style={{width:'90%',height:100,backgroundColor:'#F2F2F2',borderRadius:10,alignSelf:'center'}}>
          <Text style={{color:'black',marginLeft:20,marginTop:20}}>이제 회의실 예약도 </Text>
          <Text style={{fontWeight:'bold',marginLeft:20}}>간편한 오피스쉐어 APP으로!</Text>
            <View
              style={{
                borderRadius:10,
                borderColor:'#C4D2DF',
                backgroundColor:'#A3A3A3',
                marginTop:10,
                width:80,
                height:20,
                marginLeft:20
              }}>
                <Text style={{color:'#FFFFFF',width:'100%',textAlign:'center'}}>앱 다운로드</Text>
            </View>
        </View>
        <Text></Text>
        <View style={{width:'90%',height:120,backgroundColor:'#BBC8E8',borderRadius:10,alignSelf:'center'}}>
          <Text style={{color:'black',marginLeft:20,marginTop:20,fontSize:20}}>오피스쉐어 앱은</Text>
          <Text></Text>
          <Text style={{marginLeft:20}}>실시간으로 이용 가능한 회의실을 검색하고</Text>
          <Text style={{marginLeft:20}}>바로 예약하는 온라인 예약 서비스를 제공합니다.</Text>
        </View>
        <View>
        <Text/>
        <View style={{flexDirection:'row',alignSelf:'center'}}>
          <Text style={{fontSize:15}}>이용안내</Text>
          <View style={{width:'30%'}}/>
          <Text style={{fontSize:15}}>찾아오시는길</Text>
        </View>
        <View
          style={{
              borderBottomColor: 'black',
              borderBottomWidth: 1,
              width: '95%',
              marginBottom: 20,
              alignSelf: 'center'
          }}
        />
        </View>
        <View style={{height:'10%'}}/>
        <Text style={{width:'100%',marginLeft:'85%',color:'black'}}>더보기</Text>
        <View style={{height:'10%'}}/>
      </View>
      <Text></Text>
      <View style={{width:'90%',height:'20%',backgroundColor:'#F2F2F2',borderRadius:10,alignSelf:'center'}}>
        <Text style={{color:'black'}}>이제 회의실 예약도 간편한 오피스쉐어 APP으로!</Text>
      </View>
    </View>
    </SafeAreaView>
   
  );  
}