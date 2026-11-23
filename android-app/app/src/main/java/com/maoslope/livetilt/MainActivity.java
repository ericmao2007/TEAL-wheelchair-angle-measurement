package com.maoslope.livetilt;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.IOException;

public final class MainActivity extends Activity implements BleClient.Listener {
    private WebView web;
    private OfflineTiles vectorTiles;
    private volatile java.io.File offlineMap;
    private static final int MAP_REQUEST = 45;
    private BleClient ble;
    private boolean pageReady;
    private boolean foreground;
    private final android.os.Handler lifecycleHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private final Runnable pauseBle = () -> { if (!foreground && ble != null) ble.pause(); };
    private boolean pendingConnect;
    private static final String ORIGIN = "https://appassets.androidplatform.net/assets/";
    private static final int PERMISSION_REQUEST = 41;
    private static final int BLUETOOTH_REQUEST = 42;
    private static final int LOCATION_REQUEST = 43;
    private static final int EXPORT_REQUEST = 44;
    private String pendingExport;
    private LocationManager locations;
    private boolean locationWanted;
    private boolean locationPermissionPending;
    private final LocationListener locationListener = new LocationListener() {
        @Override public void onLocationChanged(Location l) {
            if (!foreground || !locationWanted || !l.hasAccuracy()) return;
            try {
                double age = Math.max(0, (SystemClock.elapsedRealtimeNanos() - l.getElapsedRealtimeNanos()) / 1e6);
                JSONObject d = new JSONObject().put("latitude", l.getLatitude()).put("longitude", l.getLongitude())
                        .put("accuracy", l.getAccuracy()).put("ageMs", age).put("timestamp", l.getTime());
                evaluate("window.onNativeLocation(" + d + ");");
            } catch (org.json.JSONException ignored) { }
        }
        @Override public void onProviderEnabled(String provider) { if (locationWanted) startLocation(); }
        @Override public void onProviderDisabled(String provider) {
            locationStatus("Location provider disabled. Enable phone Location and retry.");
        }
        @Override public void onStatusChanged(String provider, int status, Bundle extras) { }
    };
    private String state = "idle", message = "", metadata = "";

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(11,18,32));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(android.view.WindowInsets.Type.systemBars()
                        | android.view.WindowInsets.Type.displayCutout());
                v.setPadding(i.left, i.top, i.right, i.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        vectorTiles = new OfflineTiles(getFilesDir());
        offlineMap = new java.io.File(getFilesDir(), "offline.mbtiles");
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(11,18,32));
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setUserAgentString(web.getSettings().getUserAgentString() + " LiveTilt/1.1");
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        web.getSettings().setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new Bridge(), "LiveTiltAndroid");
        web.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override public boolean onJsConfirm(WebView view, String url, String message, android.webkit.JsResult result) {
                new android.app.AlertDialog.Builder(MainActivity.this).setMessage(message)
                        .setPositiveButton("Delete", (dialog, which) -> result.confirm())
                        .setNegativeButton("Cancel", (dialog, which) -> result.cancel())
                        .setOnCancelListener(dialog -> result.cancel()).show();
                return true;
            }
        });
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                if (r.isForMainFrame() && r.hasGesture()
                        && r.getUrl().toString().equals("https://www.openstreetmap.org/copyright")) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); }
                    catch (android.content.ActivityNotFoundException ignored) { }
                }
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                String url = r.getUrl().toString();
                if(url.startsWith("https://appassets.androidplatform.net/vector/")){
                    try{String[] bits=r.getUrl().getPath().split("/");byte[] bytes=vectorTiles.tile(Integer.parseInt(bits[2]),Integer.parseInt(bits[3]),Integer.parseInt(bits[4].replace(".pbf","")),getSharedPreferences("gradient-map",MODE_PRIVATE).getBoolean("online-vector-map",true));return new WebResourceResponse("application/octet-stream",null,new ByteArrayInputStream(bytes));}
                    catch(Exception e){return new WebResourceResponse("text/plain","UTF-8",404,"Unavailable",null,new ByteArrayInputStream(new byte[0]));}
                }
                if(url.startsWith("https://appassets.androidplatform.net/tiles/")) return mapTile(r.getUrl().getLastPathSegment(), r.getUrl().getPath());
                String path = url.startsWith(ORIGIN) ? url.substring(ORIGIN.length()) : "";
                if (path.equals("index.html") || path.equals("protocol.js") || path.equals("tracking.js") || path.equals("reversal.js") || path.equals("mount.js") || path.equals("vector.js") || path.equals("map.js") || path.equals("sessions.js")) {
                    try { return new WebResourceResponse(path.endsWith(".js") ? "application/javascript" : "text/html",
                            "UTF-8", getAssets().open(path)); }
                    catch (IOException ignored) { }
                }
                // Only map images may leave the packaged UI; remote scripts/pages stay blocked.
                if (url.matches("https://tile\\.openstreetmap\\.org/[0-9]+/[0-9]+/[0-9]+\\.png")) return null;
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null,
                        new ByteArrayInputStream(new byte[0]));
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        ble = new BleClient(this, this);
        locations = (LocationManager) getSystemService(LOCATION_SERVICE);
        web.loadUrl(ORIGIN + "index.html");
    }

    private WebResourceResponse mapTile(String name, String path) {
        String[] parts = path.split("/");
        try {
            int z=Integer.parseInt(parts[2]), x=Integer.parseInt(parts[3]), y=Integer.parseInt(name.replace(".png", ""));
            if(z<0||z>19||x<0||x>=(1<<z)||y<0||y>=(1<<z))throw new IOException();
            if(offlineMap.exists()) {
                try(android.database.sqlite.SQLiteDatabase db=android.database.sqlite.SQLiteDatabase.openDatabase(offlineMap.getPath(),null,android.database.sqlite.SQLiteDatabase.OPEN_READONLY);
                    android.database.Cursor c=db.rawQuery("SELECT tile_data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?",new String[]{""+z,""+x,""+((1<<z)-1-y)})) {
                    if(c.moveToFirst()) {byte[] bytes=c.getBlob(0);return new WebResourceResponse(bytes[0]==(byte)0x89?"image/png":"image/jpeg",null,new ByteArrayInputStream(bytes));}
                }
            }
            if(!getSharedPreferences("gradient-map",MODE_PRIVATE).getBoolean("online-vector-map",true))throw new IOException("Offline mode");
            java.net.HttpURLConnection connection=(java.net.HttpURLConnection)new java.net.URL("https://tile.openstreetmap.org/"+z+"/"+x+"/"+y+".png").openConnection();
            connection.setRequestProperty("User-Agent","MAO-Slope-Android/1.0");connection.setConnectTimeout(4000);connection.setReadTimeout(4000);
            try(java.io.InputStream in=connection.getInputStream();java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream()) {byte[] buffer=new byte[8192];int n;while((n=in.read(buffer))!=-1)out.write(buffer,0,n);return new WebResourceResponse("image/png",null,new ByteArrayInputStream(out.toByteArray()));}finally{connection.disconnect();}
        }catch(Exception e){return new WebResourceResponse("text/plain","UTF-8",404,"Unavailable",null,new ByteArrayInputStream(new byte[0]));}
    }

    private void connectWithPermission() {
        if (!foreground) return;
        if (ble.isWanted()) { ble.disconnect(); return; }
        String[] needed = Build.VERSION.SDK_INT >= 31
                ? new String[]{Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT}
                : new String[]{Manifest.permission.ACCESS_FINE_LOCATION};
        for (String p : needed) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(needed, PERMISSION_REQUEST); return;
            }
        }
        if (!ble.supported()) { onStatus("error", "Bluetooth LE is not available on this phone.", ""); return; }
        if (!ble.enabled()) {
            startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), BLUETOOTH_REQUEST); return;
        }
        ble.connect();
    }

    @Override public void onRequestPermissionsResult(int request, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(request, permissions, results);
        if (request == LOCATION_REQUEST) {
            locationPermissionPending = false;
            if (hasLocationPermission()) {
                if (foreground && locationWanted) startLocation();
            } else {
                locationWanted = false;
                locationStatus("Precise location is required to record map points. Enable it in app settings, then retry GPS.");
            }
            return;
        }
        if (request != PERMISSION_REQUEST) return;
        boolean granted = results.length > 0;
        for (int result : results) granted &= result == PackageManager.PERMISSION_GRANTED;
        if (granted) { pendingConnect = true; if (foreground) { pendingConnect = false; connectWithPermission(); } }
        else onStatus("error", "Bluetooth permission is required. Allow Nearby devices in app settings and retry.", "");
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if(request==MAP_REQUEST){
            if(result!=RESULT_OK||data==null||data.getData()==null)return;
            final android.net.Uri uri=data.getData();
            new Thread(()->{
                String message;
                java.io.File temp=new java.io.File(getFilesDir(),"import-map.tmp");
                try(java.io.InputStream in=getContentResolver().openInputStream(uri);java.io.FileOutputStream out=new java.io.FileOutputStream(temp)){
                    if(in==null)throw new IOException();byte[] buffer=new byte[65536];int n;while((n=in.read(buffer))!=-1)out.write(buffer,0,n);out.flush();
                    try(android.database.sqlite.SQLiteDatabase db=android.database.sqlite.SQLiteDatabase.openDatabase(temp.getPath(),null,android.database.sqlite.SQLiteDatabase.OPEN_READONLY);
                        android.database.Cursor c=db.rawQuery("SELECT tile_data FROM tiles LIMIT 1",null)){
                        if(!c.moveToFirst())throw new IOException();byte[] b=c.getBlob(0);if(b.length<3||!(b[0]==(byte)0x89&&b[1]==0x50||b[0]==(byte)0xff&&b[1]==(byte)0xd8))throw new IOException();
                    }
                    if(!temp.renameTo(offlineMap))throw new IOException();message="Offline map imported · No connection needed within its coverage";
                }catch(Exception e){temp.delete();message="Import failed: choose PNG/JPG raster MBTiles. Your existing map is retained";}
                final String msg=message;runOnUiThread(()->web.evaluateJavascript("window.onOfflineMapStatus&&window.onOfflineMapStatus("+JSONObject.quote(msg)+")",null));
            }).start();return;
        }
        if (request == EXPORT_REQUEST) {
            String content = pendingExport; pendingExport = null;
            if (result != RESULT_OK || data == null || data.getData() == null || content == null) {
                exportStatus("Export cancelled."); return;
            }
            android.net.Uri destination = data.getData();
            new Thread(() -> {
                String status;
                try (java.io.OutputStream out = getContentResolver().openOutputStream(destination, "wt")) {
                    if (out == null) throw new IOException("No output stream");
                    out.write(content.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    status = "Export saved.";
                } catch (IOException | SecurityException e) { status = "Could not save export. Please retry."; }
                final String message = status; runOnUiThread(() -> exportStatus(message));
            }).start();
            return;
        }
        if (request == BLUETOOTH_REQUEST) {
            if (result == RESULT_OK) { pendingConnect = true; if (foreground) { pendingConnect = false; connectWithPermission(); } }
            else onStatus("idle", "Turn on Bluetooth to connect.", "");
        }
    }
    @Override protected void onResume() {
        super.onResume(); foreground = true; lifecycleHandler.removeCallbacks(pauseBle);
        if (web != null) web.onResume();
        if (ble != null) ble.resume();
        if (locationWanted) startLocation();
        if (pendingConnect) { pendingConnect = false; connectWithPermission(); }
    }
    @Override protected void onStop() {
        foreground = false;
        if (locations != null) locations.removeUpdates(locationListener);
        locationStatus("Paused in background");
        if (ble != null) lifecycleHandler.postDelayed(pauseBle, 30000);
        if (web != null) web.onPause();
        super.onStop();
    }
    @Override protected void onDestroy() {
        pageReady = false; lifecycleHandler.removeCallbacks(pauseBle);
        if (ble != null) ble.disconnect();
        if (web != null) { web.removeJavascriptInterface("LiveTiltAndroid"); web.destroy(); web = null; }
        super.onDestroy();
    }
    @Override public void onStatus(String nextState, String nextMessage, String nextMetadata) {
        state = nextState; message = nextMessage; metadata = nextMetadata;
        publishState();
        getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (state.equals("ready")) getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
    private void publishState() {
        try {
            JSONObject data = new JSONObject().put("state", state).put("message", message).put("metadata", metadata);
            evaluate("window.onNativeState(" + data + ");");
        } catch (org.json.JSONException ignored) { }
    }
    @Override public void onFrame(byte[] payload) {
        String base64 = android.util.Base64.encodeToString(payload, android.util.Base64.NO_WRAP);
        evaluate("window.onNativeFrame(" + JSONObject.quote(base64) + ");");
    }
    @Override public void onNotice(String text) { evaluate("window.onNativeNotice(" + JSONObject.quote(text) + ");"); }
    private void evaluate(String script) { if (pageReady && web != null) web.evaluateJavascript(script, null); }

    private void locationStatus(String text) {
        evaluate("window.onNativeLocationState(" + JSONObject.quote(text) + ");");
    }
    private boolean hasLocationPermission() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    private void startLocation() {
        if (!foreground || !locationWanted) return;
        if (!hasLocationPermission()) {
            locationStatus("Allow precise location while using the app.");
            if (locationPermissionPending) return;
            locationPermissionPending = true;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQUEST);
            return;
        }
        locations.removeUpdates(locationListener);
        boolean started = false;
        try {
            for (String provider : new String[]{LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
                if (LocationManager.GPS_PROVIDER.equals(provider)
                        && checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) continue;
                if (locations.isProviderEnabled(provider)) {
                    locations.requestLocationUpdates(provider, 1000, 0, locationListener);
                    started = true;
                }
            }
            locationStatus(started ? "Waiting for a fresh GPS fix…" : "Enable phone Location, then retry GPS.");
        } catch (SecurityException | IllegalArgumentException e) {
            locationStatus("Location unavailable. Check precise location permission and retry GPS.");
        }
    }

    private void exportStatus(String text) {
        evaluate("window.onNativeExportStatus(" + JSONObject.quote(text) + ");");
    }
    private final class Bridge {
        @JavascriptInterface public void downloadMap(double latitude,double longitude){
            if(!vectorTiles.begin())return;
            new Thread(()->vectorTiles.download(latitude,longitude,text->runOnUiThread(()->{if(web!=null)web.evaluateJavascript("window.onMapDownloadStatus&&window.onMapDownloadStatus("+JSONObject.quote(text)+")",null);}))).start();
        }
        @JavascriptInterface public void cancelMapDownload(){vectorTiles.cancel();}
        @JavascriptInterface public boolean onlineMap(){return getSharedPreferences("gradient-map",MODE_PRIVATE).getBoolean("online-vector-map",true);}
        @JavascriptInterface public void setOnlineMap(boolean enabled){getSharedPreferences("gradient-map",MODE_PRIVATE).edit().putBoolean("online-vector-map",enabled).apply();}
        @JavascriptInterface public void importMap(){runOnUiThread(()->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("*/*");i.addCategory(Intent.CATEGORY_OPENABLE);try{startActivityForResult(i,MAP_REQUEST);}catch(android.content.ActivityNotFoundException e){onStatus("error","No file picker available","");}});}

        @JavascriptInterface public String loadZero() { return getSharedPreferences("gradient-map", MODE_PRIVATE).getString("reversal-zero", "null"); }
        @JavascriptInterface public boolean saveZero(String json) {
            if (json == null || json.length() > 10000) return false;
            return getSharedPreferences("gradient-map", MODE_PRIVATE).edit().putString("reversal-zero", json).commit();
        }
        @JavascriptInterface public boolean deleteSessions(String sessionsJson, String recordsJson) {
            try {
                if (sessionsJson.length() > 32000000 || recordsJson.length() > 8000000) return false;
                new org.json.JSONArray(sessionsJson); new org.json.JSONArray(recordsJson);
                return getSharedPreferences("gradient-map", MODE_PRIVATE).edit()
                        .putString("sessions", sessionsJson).putString("records", recordsJson).commit();
            } catch (org.json.JSONException e) { return false; }
        }
        @JavascriptInterface public String loadSessions() {
            return getSharedPreferences("gradient-map", MODE_PRIVATE).getString("sessions", "");
        }
        @JavascriptInterface public boolean saveSessions(String json) {
            try {
                if (json.length() > 32000000) return false;
                org.json.JSONArray sessions = new org.json.JSONArray(json);
                return getSharedPreferences("gradient-map", MODE_PRIVATE).edit().putString("sessions", sessions.toString()).commit();
            } catch (org.json.JSONException e) { return false; }
        }
        @JavascriptInterface public void exportFile(String name, String mime, String content) {
            if ((!"text/csv".equals(mime) && !"text/html".equals(mime)) || content == null || content.length() > 32000000) return;
            runOnUiThread(() -> {
                if (pendingExport != null) { exportStatus("Finish the current export first."); return; }
                pendingExport = content;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType(mime).putExtra(Intent.EXTRA_TITLE, name.replaceAll("[^a-zA-Z0-9._-]", "_"));
                try { startActivityForResult(intent, EXPORT_REQUEST); }
                catch (android.content.ActivityNotFoundException e) { pendingExport = null; exportStatus("No file picker available."); }
            });
        }

        @JavascriptInterface public void ready() { runOnUiThread(() -> { pageReady = true; publishState(); }); }
        @JavascriptInterface public void connect() { runOnUiThread(MainActivity.this::connectWithPermission); }
        @JavascriptInterface public void send(String command) { runOnUiThread(() -> ble.send(command)); }
        @JavascriptInterface public void location(boolean enabled) {
            runOnUiThread(() -> {
                locationWanted = enabled;
                if (enabled) startLocation();
                else { locations.removeUpdates(locationListener); locationStatus("GPS recording off"); }
            });
        }
        @JavascriptInterface public String loadRecords() {
            return getSharedPreferences("gradient-map", MODE_PRIVATE).getString("records", "[]");
        }
        @JavascriptInterface public boolean saveRecords(String json) {
            try {
                org.json.JSONArray records = new org.json.JSONArray(json);
                if (records.length() > 10000 || json.length() > 8000000) return false;
                return getSharedPreferences("gradient-map", MODE_PRIVATE).edit().putString("records", json).commit();
            } catch (org.json.JSONException e) { return false; }
        }
    }
}
