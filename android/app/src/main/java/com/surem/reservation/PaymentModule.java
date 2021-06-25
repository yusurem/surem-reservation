package com.surem.reservation; // replace com.your-app-name with your app’s name
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeMap;

import android.app.Activity;
import android.webkit.WebView;
import android.content.Intent;
import android.util.Log;

public class PaymentModule extends ReactContextBaseJavaModule {
    private final int PAYMENT_REQUEST_CODE = 1;
//    private final int ACTIVITY_DOES_NOT_EXIST = -100;
    private Promise mPromise;
    private ReactApplicationContext mContext;

    private ActivityEventListener mActivityEventListener = new BaseActivityEventListener(){
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent){
            Log.d("PaymentModule", "returned after activity to here");
            Log.d("PaymentModule", "requestCode: " + requestCode);
            Log.d("PaymentModule", "resultCode: " + resultCode);
            if(requestCode == PAYMENT_REQUEST_CODE && mPromise != null){
                Log.d("PaymentModule", "requestCode matches and Promise is not null");
                if(resultCode == Activity.RESULT_OK && intent.hasExtra("result") != false){
                    WritableNativeMap map = new WritableNativeMap();
                    map.putString("result", intent.getStringExtra("result"));
                    map.putString("payCode", intent.getStringExtra("payCode"));
                    mPromise.resolve(map);
                }
                else if(resultCode == Activity.RESULT_CANCELED && intent.hasExtra("result") != false){
                    String error = intent.getStringExtra("result");
                    if(error.equals("cancelled")){
                        mPromise.reject("E1", "E1:payCancel");
                    }
                    else if(error.equals("userFail")){
                        mPromise.reject("E2", "E2:userFail");
                    }
                    else{
                        mPromise.reject("E3", "E3:errorFail");
                    }
                }
                else {
                    mPromise.reject("E3", "E3:errorFail");
                }
                mPromise = null;
            }
        }
    };

    PaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        mContext.addActivityEventListener(mActivityEventListener);
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
    public void startPayment(ReadableMap params, final Promise promise){
        this.mPromise = promise;
        Activity activity = getCurrentActivity();

        if(activity == null){
            mPromise.reject("ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }

        try{
            Intent intent = new Intent(activity, PaymentActivity.class);
//            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Log.d("PaymentModule", params.toString());

            intent.putExtra("userCode", params.getString("userCode"));
//            intent.putExtra("secretCode", params.getString("secretCode"));
            intent.putExtra("resrvStime", params.getString("resrvStime"));
//            intent.putExtra("resrvEtime", params.getString("resrvEtime"));
            intent.putExtra("payAmount", params.getString("payAmount"));
            intent.putExtra("adminCode", params.getString("adminCode"));
            intent.putExtra("roomCode", params.getString("roomCode"));
            intent.putExtra("roomName", params.getString("roomName"));
            intent.putExtra("userName", params.getString("userName"));
            intent.putExtra("totalTime", params.getString("totalTime"));
            intent.putExtra("useCoupon", params.getString("useCoupon"));
            intent.putExtra("couponCode", params.getString("couponCode"));
            intent.putExtra("couponIdx", params.getString("couponIdx"));
//            intent.putExtra("resrvNote", params.getString("resrvNote"));
//            intent.putExtra("appVersion", params.getString("appVersion"));
//            intent.putExtra("os", params.getString("os"));
//            intent.putExtra("resrvCode", params.getString("resrvCode"));

            activity.startActivityForResult(intent, PAYMENT_REQUEST_CODE);
//            Log.d("PaymentModule", "this is after start activity");
        } catch (Exception e){
            mPromise.reject("START_ACTIVITY_ERROR", "" +
                    "START_ACTIVITY_ERROR");
            mPromise=null;
            Log.d("PaymentModule", "Exception: " + e);
        }
    }

    @ReactMethod
    public void loadWeb(){
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, PaymentActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
}