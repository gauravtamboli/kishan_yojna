package com.kisan_vriksh_mitra_yojna;

import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

import java.security.MessageDigest;
import java.util.Arrays;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    //registerPlugin(AppSignatureHelper.class);
    String appHash = getAppHash();
    Log.d("AppHash", "Your app hash is: " + appHash);
  }

  private String getAppHash() {
    try {
      String packageName = getPackageName();
      String signature = null;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        signature = getPackageManager()
            .getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES).signingInfo
            .getApkContentsSigners()[0]
            .toCharsString();
      }

      String appInfo = packageName + " " + signature;
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(appInfo.getBytes());
      byte[] digest = md.digest();
      byte[] hash = Arrays.copyOf(digest, 9);
      return Base64.encodeToString(hash, Base64.NO_PADDING | Base64.NO_WRAP);
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

}
