import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview' 
import { Alert } from 'react-native';

const html = `
    <script>
      function send(){
        window.postMessage('hello react-native!!');
      }
    </script>
    <button onclick="send()">Send</button>
`;

export default function CancelPayment() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <WebView 
              style={{ width: 1000 }}
              scalesPageToFit={false}      
              source={{
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                  uri:'http://112.221.94.101:8976/AllatPay/AllatPayCancelView.do',
                  method:'POST',
                  body:'resrvCode=2C4D5B9E408845E_ZQPlXpd06BBBB&clientPlatform=app',
                }}
                injectedJavaScript="window.ReactNativeWebView.postMessage(document.resultFm.result.value)"
                onMessage={(event)=> {
                        console.log('EVENT :: ',event)
                    } 
                }
      
            /> 
        </SafeAreaView>
    )
}