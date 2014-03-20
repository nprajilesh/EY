package com.maangalabs.assetrecieverpro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class Myreceiver extends BroadcastReceiver {

	@Override
	 public void onReceive(Context context, Intent intent) {
		  if ("android.intent.action.BOOT_COMPLETED".equals(intent.getAction())) {
		   Intent pushIntent = new Intent(context, MyService.class);
		   context.startService(pushIntent);
		  }
		 }

}
