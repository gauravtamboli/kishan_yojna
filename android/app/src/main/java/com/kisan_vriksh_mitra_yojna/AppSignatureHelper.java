package com.kisan_vriksh_mitra_yojna;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Base64;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "AppSignatureHelper")
public class AppSignatureHelper extends Plugin {

    @PluginMethod
    public void getAppSignatures(PluginCall call) {
        try {
            Context context = getContext();
            String packageName = context.getPackageName();
            PackageManager pm = context.getPackageManager();
            PackageInfo info = pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES);
          byte[] cert = null;
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            cert = info.signingInfo.getApkContentsSigners()[0].toByteArray();
          }

          MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(packageName.getBytes());
            md.update(cert);

            byte[] hash = md.digest();
            byte[] truncatedHash = new byte[9];
            System.arraycopy(hash, 0, truncatedHash, 0, 9);
            String appHash = Base64.encodeToString(truncatedHash, Base64.NO_PADDING | Base64.NO_WRAP);
            String shortHash = appHash.substring(0, 11);

            JSObject ret = new JSObject();
            List<String> hashes = new ArrayList<>();
            hashes.add(shortHash);
            ret.put("hashes", new JSONArray(hashes));

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage(), e);
        }
    }
}
