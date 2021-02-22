import React, { useState } from 'react';
import { Content, Form, Item, Label, Input, Button, Text } from 'native-base';
// import Picker from '../Picker';

import { CARRIERS } from '../verification_constants';
import { formStyles } from '../verification_styles';

export default function VerifictionScreen({ navigation }) {
  const { wrapper, form, item, label, input, btn, btnText } = formStyles;
  const [merchantUid, setMerchantUid] = useState(`mid_${new Date().getTime()}`);
  const [company, setCompany] = useState('아임포트');
  const [carrier, setCarrier] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [minAge, setMinAge] = useState();

  onPress = () => {
    const params = {
      merchant_uid: merchantUid,
    };
    if (company) {
      params.company = company;
    }
    if (carrier) {
      params.carrier = carrier;
    }
    if (name) {
      params.name = name;
    }
    if (phone) {
      params.phone = phone;
    }
    if (minAge) {
      params.minAge = minAge;
    }
    
    navigation.navigate('Verification', { params: params });
  };

  return (
    <Content style={wrapper}>
      <Form style={form}>
        <Item inlineLabel style={item}>
          <Label style={label}>이름</Label>
          <Input
            style={input}
            value={name}
            onChangeText={value => setName(value)}
          />
        </Item>
        <Item inlineLabel style={item}>
          <Label style={label}>전화번호</Label>
          <Input
            style={input}
            keyboardType="number-pad"
            value={phone}
            onChangeText={value => setPhone(value)}
          />
        </Item>

        <Button
          primary
          style={btn}
          // onPress={this.onPress}
        >
          <Text style={btnText}>인증번호 발송</Text>
        </Button>
        <Button
          primary
          style={btn}
          // onPress={this.onPress}
        >
          <Text style={btnText}>본인인증 완료</Text>
        </Button>
      </Form>
    </Content>
  );  
}