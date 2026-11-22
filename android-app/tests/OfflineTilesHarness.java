package com.maoslope.livetilt;
import java.io.*;
import java.nio.file.*;
import java.util.concurrent.atomic.AtomicInteger;
import com.sun.net.httpserver.HttpServer;
/** Run with a temporary JSONObject stub; template injection avoids metadata access. */
public final class OfflineTilesHarness {
 public static void main(String[] args)throws Exception{
  byte[] fixture=Files.readAllBytes(Path.of(args[0]));AtomicInteger requests=new AtomicInteger();
  HttpServer server=HttpServer.create(new java.net.InetSocketAddress("127.0.0.1",0),0);
  server.createContext("/",exchange->{requests.incrementAndGet();if(!exchange.getRequestHeaders().getFirst("User-Agent").contains("TEAL-Tilt"))throw new AssertionError();exchange.sendResponseHeaders(200,fixture.length);exchange.getResponseBody().write(fixture);exchange.close();});server.start();
  File dir=Files.createTempDirectory("tilt-map-test").toFile();OfflineTiles tiles=new OfflineTiles(dir);
  var source=OfflineTiles.class.getDeclaredField("template");source.setAccessible(true);source.set(tiles,"http://127.0.0.1:"+server.getAddress().getPort()+"/{z}/{x}/{y}.pbf");
  try{if(!tiles.begin()||tiles.begin())throw new AssertionError("Duplicate download");String[] status={""};tiles.download(36,-79,s->status[0]=s);if(!status[0].startsWith("Download complete"))throw new AssertionError(status[0]);
   int count=requests.get();if(count<15||count>3000)throw new AssertionError("Invalid area count "+count);server.stop(0);
   OfflineTiles restarted=new OfflineTiles(dir);for(File f:new File(dir,"vector-tiles").listFiles()){String[] a=f.getName().replace(".pbf","").split("-");if(!java.util.Arrays.equals(fixture,restarted.tile(Integer.parseInt(a[0]),Integer.parseInt(a[1]),Integer.parseInt(a[2]),false)))throw new AssertionError("Offline mismatch");}
   tiles.begin();tiles.cancel();tiles.download(36,-79,s->status[0]=s);if(!status[0].contains("cancelled"))throw new AssertionError("Cancel failed");
   System.out.println("Native region download: "+count+" tiles; identified requests, duplicate protection, persistent offline reads after restart, cancellation passed.");
  }finally{server.stop(0);}
 }
}
