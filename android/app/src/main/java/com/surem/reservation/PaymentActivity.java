// import android.app.Activity;
// import android.webkit.WebView;
// import android.util.Log;
package com.surem.reservation; // replace com.your-app-name with your app’s name

import android.app.*;
import android.content.*;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.*;
import android.net.http.*;
import android.os.*;
import android.util.*;
import android.view.View;
import android.webkit.*;
import android.webkit.CookieManager;
import com.surem.reservation.R;
import android.view.KeyEvent;

import java.net.URISyntaxException;
import java.net.URLEncoder;

public class PaymentActivity extends Activity {

    protected WebView webView;
    protected String result = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // calling the super class (Activity) to complete its onCreate function as well to finish initialization of Acitvity such as the View Hierarchy
        // the Bundle savedInstanceState is for when you come back to a previous state of the same Activity
        super.onCreate(savedInstanceState);

        // Setting the layout that will be shown to the client when using this Activity
        // the "R" here is a java file thats created when building and it maps various files and components to integer ids
        // the R.layout.paymentLayout evaluates to an integer value that was assigned as a mapping to the paymentLayout.xml file stored in src/main/res
        setContentView(R.layout.payment_layout);

        // Main WebView 생성
		webView = (WebView) findViewById(R.id.webView);
        // setContentView(webView);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new MyViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");

        if(webView == null){
            Log.d("PaymentActivity", "WEBVIEW IS NULL");
            // webView.loadUrl("www.google.com");
        }

        if(webView != null){
            Log.d("PaymentActivity", "WEBVIEW IS NOT NULL");
            try{
                String postData = makePostData(getIntent().getExtras());
//                Log.d("PaymentActivity", postData);
                if(postData.equals("Error")){
                    Log.d("PaymentActivity", "Error while making post data");
                    return;
                }
//                webView.postUrl("http://192.168.0.232:1234/AllatPay/AllatPayApprovalView.do", postData.getBytes());
                webView.postUrl(" https://office-admin.surem.com/AllatPay/AllatPayApprovalView.do", postData.getBytes());

//                webView.loadUrl("http://192.168.0.232:1234/AllatPay/page");
//                webView.loadUrl("http://192.168.0.232:1234/AllatPay/AllatPayApprovalView.do");

            } catch (Exception e){
                Log.d("PaymentActivity", "Webview loading failed");
            }

            Log.d("PaymentActivity", "Webview properly loaded");
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Check if the key event was the Back button and if there's history
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        // If it wasn't the Back key or there's no web page history, bubble up to the default
        // system behavior (probably exit the activity)
        return super.onKeyDown(keyCode, event);
    }

    public String makePostData(Bundle data){
        try{
            String temp = URLEncoder.encode(data.getString("userCode"), "UTF-8");
            String postData = "userCode=" + temp;

//            temp = URLEncoder.encode(data.getString("secretCode"), "UTF-8");
//            postData += "&secretCode=" + temp;

            temp = URLEncoder.encode(data.getString("resrvStime"), "UTF-8");
            postData += "&resrvStime=" + temp;

//            temp = URLEncoder.encode(data.getString("resrvEtime"), "UTF-8");
//            postData += "&resrvEtime=" + temp;

            temp = URLEncoder.encode(data.getString("payAmount"), "UTF-8");
            postData += "&payAmount=" + temp;

            temp = URLEncoder.encode(data.getString("adminCode"), "UTF-8");
            postData += "&adminCode=" + temp;

            temp = URLEncoder.encode(data.getString("roomCode"), "UTF-8");
            postData += "&roomCode=" + temp;

            temp = URLEncoder.encode(data.getString("roomName"), "UTF-8");
            postData += "&roomName=" + temp;

            temp = URLEncoder.encode(data.getString("userName"), "UTF-8");
            postData += "&userName=" + temp;

            temp = URLEncoder.encode(data.getString("totalTime"), "UTF-8");
            postData += "&totalTime=" + temp;

//            temp = URLEncoder.encode(data.getString("appVersion"), "UTF-8");
//            postData += "&appVersion=" + temp;
//
//            temp = URLEncoder.encode(data.getString("resrvNote"), "UTF-8");
//            postData += "&resrvNote=" + temp;
//
//            temp = URLEncoder.encode(data.getString("os"), "UTF-8");
//            postData += "&os=" + temp;

//            temp = data.getString("useCoupon");
//            if(temp.equals("Y")){
//                temp = URLEncoder.encode(temp, "UTF-8");
//                postData += "&useCoupon=" + temp;
            if(data.getString("useCoupon").equals("Y")){
                temp = URLEncoder.encode(data.getString("couponCode"), "UTF-8");
                postData += "&couponCode=" + temp;

                temp = URLEncoder.encode(data.getString("couponIdx"), "UTF-8");
                postData += "&couponIdx=" + temp;
            }

            return postData;

        } catch (Exception e){
            Log.d("PaymentActivity", e.toString());
            return "Error";
        }
    }

    public void setResult(String result, String payCode){
        Log.d("PaymentActivity", result);
        this.result = result;

        Intent intent = new Intent();
        intent.putExtra("result", result);

        if(result.equals("success") && !payCode.equals("empty")){
            Log.d("PaymentActivity", "Payment was succesful.");
            intent.putExtra("payCode", payCode);
            setResult(Activity.RESULT_OK, intent);
        }
        else if(result.equals("userFail")){
            Log.d("PaymentActivity", "Payment failed due to user.");
            setResult(Activity.RESULT_CANCELED, intent);
        }
        else {
            Log.d("PaymentActivity", "Payment failed due to system error");
            setResult(Activity.RESULT_CANCELED, intent);
        }
    }

    public void closeWebView(View view){
        endActivity();
    }

    public void endActivity(){
        if(this.result == null){
            Log.d("PaymentActivity", "Payment is being cancelled before processed.");
            Intent intent = new Intent();
            intent.putExtra("result", "cancelled");
            setResult(Activity.RESULT_CANCELED, intent);
        }
        finish();
    }

    public class WebAppInterface {
        Context mContext;

        /** Instantiate the interface and set the context */
        WebAppInterface(Context c) {
            mContext = c;
        }

        /** Sets results from the web page */
        @JavascriptInterface
        public void sendResult(String result, String resrvCode) {
            setResult(result, resrvCode);
        }

        @JavascriptInterface
        public void close() {
            endActivity();
        }
    }

	/**
	 * 사용자정의 WebViewClient
	 */
	private class MyViewClient extends WebViewClient {

		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("javascript:")) {
                Intent intent;
                try{
                    intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                } catch (URISyntaxException ex) {
                    return false;
                }

                Uri uri = Uri.parse(intent.getDataString());
                intent = new Intent(Intent.ACTION_VIEW, uri);

                try {
                    startActivity(intent);
                } catch (ActivityNotFoundException ex) {
                    if (url.startsWith("ispmobile://")){
                        try{
                            getPackageManager().getPackageInfo("kvp.jjy.MispAndroid320", 0);
                        } catch(NameNotFoundException ne) {
                            intent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://mobile.vpay.co.kr/jsp/MISP/andown.jsp") );
                            startActivity(intent);
                            return true;
                        }
                        return true;
                    } else if (url.contains("kb-acp")){
                        try {
                            Intent excepIntent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                            excepIntent = new Intent(Intent.ACTION_VIEW);
                            excepIntent.setData(Uri.parse("market://details?id=com.kbcard.kbkookmincard"));

                            startActivity(excepIntent);
                        } catch (URISyntaxException e1) {
                        }
                    } else if(url.startsWith("intent://")) {
                        try {
                            Intent excepIntent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                            String packageNm = excepIntent.getPackage();
                            excepIntent = new Intent(Intent.ACTION_VIEW);
                            excepIntent.setData(Uri.parse("market://search?q=" + packageNm));

                            startActivity(excepIntent);
                        } catch (URISyntaxException e1) {
                        }
                    }
                }
            } else {
                view.loadUrl(url);
                return false;
            }
            return true;
		}
	}
}

