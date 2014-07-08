import serial
import struct
import binascii
import os,sys
import redis
import sys
import json
from json import loads,dumps
import subprocess

d={}
count=0
l2=[]
l1=[]

def redis_pub(ms):
	r = redis.Redis("localhost")
	r.publish("ch",ms)

def initserial():
	bt = serial.Serial()
	output=subprocess.Popen(["dmesg"],stdout=subprocess.PIPE).communicate()[0]
	output=output.split("\n")[::-1]
	for i in range(len(output)):
		if output[i].find("TI CC2540 USB CDC")!=-1:
			st=output[i-4]
			break
	bt.port = "/dev/ttyACM1"
	bt.baudrate = 57600
	bt.open()
	return bt

def initdevice(bt):
	str = '\x01' 			#command
	str = str+'\x00\xFE' 	#GAP_DeviceInit
	str = str+struct.pack('B',struct.calcsize('BB16s16sL'))+struct.pack('BB16s16sL',8,25,'\x00','\x00',1) 
	#ProfileRole,MaxScanRsp,IRK,CSRK,Signcounter
	bt.write(str)
	#print "Sent device init command!"


def setscan(bt):
	st = '\x01\x30\xFE\x03\x02'
	st = st+struct.pack('I',1300)
	bt.write(st)

def setrxgain(bt):
	st = '\x01\x00\xFC\x01\x01'
	bt.write(st)

def doDiscovery(bt):
	ser = serial.Serial()
	print "Doing Discovery"
	st='\x01' 			#command
	st=st+'\x04\xFE' 	# 0xFE GAP_DeviceDiscoveryRequest
	st=st+'\x03' 		# Datalength, well static ^^
	st=st+'\x03' 		#Mode (all)
	st=st+'\x01' 		#Enable Name Mode
	st=st+'\x00' 		#Disable Whitelist
	bt.write(st)		#bt.nextWriteCommand=st
	
def nomatch():
	print "no match found"

def do_process_gap_deviceinformation_event(bt):
	P=struct.unpack('<BBB6sBB',bt.read(size=11))		#Status EventType AddrType Addr Rssi DataLength Data
	PP= bt.read(size=P[5])
	rssi=((P[4]*100)/255)
	#print "\nrssi:",rssi,"%"
	mac=P[3]
	mac=(binascii.b2a_hex(mac[::-1]))
	#print mac
	d[mac]=rssi
		
	
def do_process_gap_discovery_done(bt):
	global count
	global l1,l2
	Params= struct.unpack('<BB',bt.read(size=2)) 		#status, NumDevices
	if Params[0]==0:
		if Params[1]==0:
			print "Devices Discovery Done, found 0 Devices"
		else:
			print "Device Discovery Done, found "+str(Params[1])+" Devices"
			dic={}
			for ii in range(Params[1]):
				P=struct.unpack('<BB6s',bt.read(size=8))
				mac=P[2]
				mac=(binascii.b2a_hex(mac[::-1]))
				l1.append({"mac":mac,"rssi":d[mac]})                                                 
				
				print "mac:",mac,"rssi",d[mac]
				#dic[ii] = {'EvType':P[0],'AddrType':P[1],'Addr':binascii.b2a_hex(P[2]),'BinAddr':P[2],'Rssi':str(rssi)}
			
			d.clear()	
			if count==0:
				l2=l1
				print l2
			else: 
				for cc in l1:
					flag =0
					for dd in l2:
						if cc["mac"]==dd["mac"]:
							dd["rssi"]+=cc["rssi"]
							dd["rssi"]/=2
							flag=1
							break
					if flag==0:
						l2.append(cc)
			count+=1
			l1[:]=[]
			if count==5:
				js=json.dumps(l2)
				redis_pub(js)
				l2[:]=[]
				count*=0
			
	else:
		print "Error during device Discovery"
	doDiscovery(bt)

def do_process_gap_deviceinit_done(bt):
	'''print "Got Device init done"
	Params = struct.unpack('<B6sHB16s16s',bt.read(size=42))						#Status,devAddr,dataPktLen,numDataPkts,IRK,CSRK
	if Params[0]==0: 															#success
		#print "Device initialized and ready"
	else:
		print "Init failed"
		exit() '''

def do_process_gap_hci_ext_command_status(bt):
	Params = struct.unpack('<BH',bt.read(size=3))
	print Params[1]
	print Params[0]
	if Params[0]==0:
		if Params[1]== 65024: 										
			#print "Dongle recieved GAP_deviveInit command"						#0xFE00 GAP_deviceINIT 
			bt.read() 															# get last byte from device (Datalength unused..)
		elif Params[1] == 65028: 												#0xFE04 GAP Device Discovery Request
			#print "Dongle recieved command and is now searching"
			bt.read()
		elif Params[1] == 65033: 												
			#print "Dongle recieved estalblish link request"						#0xFE09 Gap Establish link request
			bt.read()
		elif Params[1] == 65034: 												
			#print "Dongle recieved link term request"							#FE0A Gap terminate linkrequest
			bt.read()
		elif Params[1] == 64904: 												#0xFD88 (GATT_DiscCharsByUUID)
			#print "Keyfob is searching"											#work in progress concerning our search :)
			bt.read() 															#bt.read()
																	
		elif Params[1] == 64786: 									
			#print "Keyfob got WriteRequest"										#0xFD12 (ATT_WriteReq)
			bt.read()
		elif Params[1] == 65072:
			#print ""
			bt.read()
		else:
			print "Unknown OpCode"+str(Params[1])
	else:
		print "Somethings's wrong"
		bt.read()

	
r = redis.Redis("localhost")
bt = initserial()
print("Connected to Dongle")
initdevice(bt)
setscan(bt)
setrxgain(bt)
#print ""
#print("Starting Read loop")
doDiscovery(bt)

while(bt.isOpen()): 			
	HCI_Packet_Type = bt.read()		 											#New data packet is read
	#print("======================")
	if HCI_Packet_Type == '\x04':												#ramifications ... event here
		#print "Found Event Packet"
		EVENT_CODE=bt.read()
		#if EVENT_CODE=='\xFF':
		#	print "Vendor Specific Event Code"
		#else:
		#	print "WHAT!?! SHOULDNT HAPPEN!!!!"
		X=bt.read(size=3)														#also contains opcode
		DATA_LENGTH = struct.unpack('<BH',X)
		data_code=DATA_LENGTH[1]
		if data_code==1536:
			do_process_gap_deviceinit_done(bt)
		elif data_code==1537:
			do_process_gap_discovery_done(bt)
		elif data_code==1549:
			do_process_gap_deviceinformation_event(bt)
		elif data_code==1663:
			do_process_gap_hci_ext_command_status(bt)
		#print "Data Code :"+str(DATA_LENGTH[1])
	else:
		print struct.unpack('<B',HCI_Packet_Type)
		#print "broken!"
		doDiscovery(bt)

