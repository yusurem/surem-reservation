package com.surem.reservation; // replace com.your-app-name with your app’s name
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

import android.webkit.WebView;

import android.util.Log;

public class PaymentModule extends ReactContextBaseJavaModule {
    // AllatPayMobileTestWebviewActivity module;
    WebView webview;
    PaymentModule(ReactApplicationContext context) {
        super(context);
        // module = new AllatPayMobileTestWebviewActivity();
    }

    @Override
    public String getName() {
        return "PaymentModule";
    }

    @ReactMethod
    public void pingModule(String phrase){
        Log.d("PaymentModule", "Initial Class: Pinging--- " + phrase);    
    }

    @ReactMethod
    public void loadWeb(String url){
	    webView.loadUrl("www.google.com");
    }
}