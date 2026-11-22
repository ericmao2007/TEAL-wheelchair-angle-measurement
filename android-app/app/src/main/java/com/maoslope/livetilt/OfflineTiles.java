package com.maoslope.livetilt;

import java.io.*;
import java.net.*;
import java.util.*;
import org.json.JSONObject;

/** Persistent vector tiles, with bounded user-initiated region downloads. */
final class OfflineTiles {
    interface Progress { void update(String text); }
    private final File root;
    private volatile String template;
    private volatile boolean cancelled, downloading;
    OfflineTiles(File files){root=new File(files,"vector-tiles");root.mkdirs();}
    private byte[] request(String url,int limit)throws IOException{
        HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();
        c.setRequestProperty("User-Agent","TEAL-Tilt-Android/1.11.0 (offline-area-maps)");c.setConnectTimeout(10000);c.setReadTimeout(15000);
        try(InputStream in=c.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream()){
            byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1){if(out.size()+n>limit)throw new IOException("Download size limit");out.write(b,0,n);}return out.toByteArray();
        }finally{c.disconnect();}
    }
    private synchronized String source()throws Exception{
        if(template==null){JSONObject json=new JSONObject(new String(request("https://tiles.openfreemap.org/planet",1024*1024),java.nio.charset.StandardCharsets.UTF_8));
            String t=json.getJSONArray("tiles").getString(0);
            if(!t.startsWith("https://tiles.openfreemap.org/planet/")||!t.endsWith(".pbf"))throw new IOException("Invalid source");template=t;}
        return template;
    }
    synchronized byte[] tile(int z,int x,int y,boolean online)throws Exception{
        if(z<0||z>14||x<0||x>=(1<<z)||y<0||y>=(1<<z))throw new IOException("Invalid tile");
        File f=new File(root,z+"-"+x+"-"+y+".pbf");
        if(f.exists())return java.nio.file.Files.readAllBytes(f.toPath());
        if(!online)throw new IOException("Not downloaded");
        byte[] b=request(source().replace("{z}",""+z).replace("{x}",""+x).replace("{y}",""+y),2*1024*1024);
        File temp=new File(root,f.getName()+".tmp");try(FileOutputStream out=new FileOutputStream(temp)){out.write(b);}if(!temp.renameTo(f))throw new IOException("Cannot save map");return b;
    }
    private static int x(double lon,int z){return (int)Math.floor((lon+180)/360*(1<<z));}
    private static int y(double lat,int z){double r=Math.toRadians(Math.max(-85.0511,Math.min(85.0511,lat)));return (int)Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*(1<<z));}
    synchronized boolean begin(){if(downloading)return false;downloading=true;cancelled=false;return true;}
    void cancel(){cancelled=true;}
    void download(double lat,double lon,Progress progress){
        try{
            if(!Double.isFinite(lat)||!Double.isFinite(lon)||Math.abs(lat)>84||Math.abs(lon)>180)throw new IOException("Invalid location");
            double dy=5/111.32,dx=dy/Math.cos(Math.toRadians(lat));List<int[]> jobs=new ArrayList<>();
            for(int z=0;z<=14;z++){
                int n=1<<z;int lo=x(lon-dx,z),hi=x(lon+dx,z);
                for(int tx=lo;tx<=hi;tx++)for(int ty=Math.max(0,y(lat+dy,z));ty<=Math.min(n-1,y(lat-dy,z));ty++)jobs.add(new int[]{z,Math.floorMod(tx,n),ty});
            }
            if(jobs.size()>3000)throw new IOException("Area too large");long bytes=0;int done=0;
            for(int[] j:jobs){if(cancelled){progress.update("Download cancelled · Downloaded maps retained");return;}
                byte[] b=tile(j[0],j[1],j[2],true);bytes+=b.length;if(bytes>48L*1024*1024)throw new IOException("50 MB limit reached; saved tiles retained");
                progress.update("Downloading map "+(++done)+"/"+jobs.size()+" · "+String.format(java.util.Locale.ROOT,"%.1f",bytes/1048576.0)+" MB");
            }progress.update("Download complete · Maps within 5 km are available offline (zoom levels 0–14, with further magnification)");
        }catch(Exception e){progress.update("Download incomplete · Saved tiles retained. Connect and retry: "+e.getMessage());}
        finally{downloading=false;}
    }
}
