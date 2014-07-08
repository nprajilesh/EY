import serial
import struct
import binascii
import os,sys
import redis
import sys
import json
from json import loads,dumps
import subprocess
import time

d={}
st=""
f1=0

def redis_pub(ms):
	r = redis.Redis("192.168.0.207")
	r.publish("ch",ms)

def initserial():
	bt = serial.Serial()
	if os.name == 'posix':
		output=subprocess.Popen(["dmesg"],stdout=subprocess.PIPE).communicate()[0]
		output=output.split("\n")[::-1]
		for i in range(len(output)):
			if output[i].find("TI CC2540 USB CDC")!=-1:
				st=output[i-4]
				break
		#print st[st.find("tty"):st.find("tty")+7]
		bt.port = "/dev/ttyACM0"#+st[st.find("tty"):st.find("tty")+7]
	else:
		bt.port = "COM3"
	bt.baudrate = 57600
	bt.open()
	return bt

def initdevice(bt):
	str = '\x01' 			#command
	str = str+'\x00\xFE' 	#GAP_DeviceInit
	str = str+struct.pack('B',struct.calcsize('BB16s16sL'))+struct.pack('BB16s16sL',8,3,'\x00','\x00',1) 
	#ProfileRole,MaxScanRsp,IRK,CSRK,Signself.counter
	
	bt.write(str)
	print "Sent device init command!"

def setscan(bt):
	st = '\x01\x30\xFE\x03\x02'
	st = st+struct.pack('I',1300)
	bt.write(st)

def setrxgain(bt):
	st = '\x01\x00\xFC\x01\x01'
	bt.write(st)

class BTDevice(object):
    _shared = {}
    def __init__(self):
	self.__dict__ = self._shared
    deviceReady=0
    dongleAddress="\x00\x00\x00\x00\x00\x00\x00\x00"
    IRK="\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
    CSRK="\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
    ser = serial.Serial()
    foundDevices = {}
    connHandle=""
    nextWriteCommand=""
    writeStack=[]
    def doDiscovery(self):
	print "Doing Discovery"
	st='\x01' 				# Command
	st=st+'\x04\xFE' 		# 0xFE GAP_DeviceDiscoveryRequest
	st=st+'\x03' 			# Datalength, well static ^^
	st=st+'\x03' 			# Mode (all)
	st=st+'\x01' 			# Enable Name Mode
	st=st+'\x00' 			# Disable Whitelist
							# self.nextWriteCommand=st
	self.ser.write(st)


class HCIEvents:
	def __init__(self):
		self.count=0
		self.l2=[]
		self.l1=[]
		

	def nomatch(self,i,bt):
		print "no match found"

	def do_process_gap_deviceinformation_event(self,i,bt):
		P=struct.unpack('<BBB6sBB',bt.read(size=11))		#Status EventType AddrType Addr Rssi DataLength Data
		PP= bt.read(size=P[5])
		rssi=((P[4]*100)/255)
		print "\nrssi:",rssi,"%"
		mac=P[3]
		mac=(binascii.b2a_hex(mac[::-1]))
		print mac
		d[mac]=rssi
		global f1
		f1=1
		
	
	def do_process_gap_discovery_done(self,i,bt):
		Params= struct.unpack('<BB',bt.read(size=2)) 		#status, NumDevices
		if Params[0]==0:
			num_devices=Params[1]
			if Params[1]==0:
				print "Devices Discovery Done, found 0 Devices"
				BTDevice().doDiscovery()
			else:
				print "Device Discovery Done, found "+str(Params[1])+" Devices"
				dic={}
				for ii in range(Params[1]):
					P=struct.unpack('<BB6s',bt.read(size=8))
					mac=P[2]
					mac=(binascii.b2a_hex(mac[::-1]))
					self.l1.append({"mac":mac,"rssi":d[mac]})                                                 
					print "mac:",mac,"rssi",d[mac]
					#dic[ii] = {'EvType':P[0],'AddrType':P[1],'Addr':binascii.b2a_hex(P[2]),'BinAddr':P[2],'Rssi':str(rssi)}
				
				d.clear()	
				if self.count==0:
					self.l2=self.l1
					print self.l2
				else: 
					for cc in self.l1:
						flag =0
						for dd in self.l2:
							if cc["mac"]==dd["mac"]:
								dd["rssi"]+=cc["rssi"]
								dd["rssi"]/=2
								flag=1
								break
						if flag==0:
							self.l2.append(cc)
				self.count+=1
				self.l1=[]
				
				if self.count==5:
					js=json.dumps(self.l2)
					ts=time.time()
					data={"lat":8.499,"long":76.94,"time":ts,"count":num_devices,"members":self.l2}
					data_json=json.dumps(data)
					redis_pub(data_json)
					self.l2[:]=[]
					self.count=0
				BTDevice.foundDevices=dic					
				BTDevice().doDiscovery()
		else:
			print "Error during device Discovery"

	def do_process_gap_deviceinit_done(self,i,bt):
		print "Got Device init done"
		Params = struct.unpack('<B6sHB16s16s',bt.read(size=42))			#Status,devAddr,dataPktLen,numDataPkts,IRK,CSRK
		
		if Params[0]==0: 												#Success
			print "Device initialized and ready"
			BTDevice.dongleAddress 	= Params[1]
			print binascii.b2a_hex(BTDevice.dongleAddress)
			BTDevice.IRK		= Params[4]
			BTDevice.CSRK		= Params[5]
			BTDevice.deviceReady	= 1
		else:
			print "Init failed"
			exit()

	def do_process_gap_hci_ext_command_status(self,i,bt):
		Params = struct.unpack('<BH',bt.read(size=3))
		print Params[1]
		print Params[0]
		if Params[0]==0:
			if Params[1]== 65024: 										#0xFE00 GAP_deviceINIT 
				print "Dongle recieved GAP_deviveInit command"
				bt.read() 												# get last byte from device (Datalength unused..)
			elif Params[1] == 65028: 									#0xFE04 GAP Device Discovery Request
				print "Dongle recieved command and is now searching"
				bt.read()
			elif Params[1] == 65033: 									#0xFE09 Gap Establish link request
				print "Dongle recieved estalblish link request"
				bt.read()
			elif Params[1] == 65034: 									#FE0A Gap terminate linkrequest
				print "Dongle recieved link term request"
				bt.read()
			elif Params[1] == 64904: 									#0xFD88 (GATT_DiscCharsByUUID)
				print "Keyfob is searching"
				bt.read() 												#work in progress concerning our search :)
																		#bt.read()
			elif Params[1] == 64786: 									#0xFD12 (ATT_WriteReq)
				print "Keyfob got WriteRequest"
				bt.read()
			else:
				print "Unknown OpCode"+str(Params[1])
		else:
			print "Somethings's wrong"
			bt.read()
	def lookup(self,d):
		if d == 1536:
			bla= "do_process_gap_deviceinit_done" 						#0600 GAP_DeviceInitDone
		elif d == 1289: 									
			bla = "do_process_att_readbytypeResponse_event"				#0x0509 (ATT_ReadByTypeRsp)
		elif d == 1299: 									
			bla = "do_process_att_writeResponse_event"					#0x0513 (ATT_WriteRsp)
		elif d == 1663: 									
			bla = "do_process_gap_hci_ext_command_status" 				#067F GAP HCI Extension Command Status
		elif d == 1537 and f1==1: 									
			bla = "do_process_gap_discovery_done"						# 0610 GAP_DeviceDiscoveryDone
		elif d == 1549:										
			bla = "do_process_gap_deviceinformation_event"				# 006D GAP DeviceInformation Event
		elif d == 1541: 									
			bla = "do_process_gap_establish_link_event"					#0605 Gap Establish Link
		elif d == 1542: 									
			bla = "do_process_gap_terminate_link_event"					#0606 Gap TerminateLink
		elif d == 1307: 									
			bla = "do_process_gap_handlevalue_notification_event"		#051b #ATT HandleValueNotification
		else:
			bla = "nomatch"
		return getattr(self, bla, None)

r = redis.Redis("localhost")
dev = BTDevice()
bt = initserial()
dev.ser = bt
print("Connected to Dongle")
initdevice(bt)
#setrxgain(bt)
setscan(bt)

print ""
print("Starting Read loop")
b=BTDevice()
b.doDiscovery()
a=HCIEvents()
while(bt.isOpen()): 			 #New data packet is read
	HCI_Packet_Type = bt.read()
	
	print("======================")
	if HCI_Packet_Type == '\x04':	#ramifications ... event here
		print "Found Event Packet"
		
		EVENT_CODE=bt.read()
		if EVENT_CODE=='\xFF':
			print "Vendor Specific Event Code"
		else:
			print "WHAT!?! SHOULDNT HAPPEN!!!!"
		X=bt.read(size=3)	#also contains opcode
		DATA_LENGTH = struct.unpack('<BH',X)
		print "Data length :"+str(DATA_LENGTH[0])
		print "Data Code :"+str(DATA_LENGTH[1])
		a.lookup(DATA_LENGTH[1])(DATA_LENGTH[0],bt)
	else:
		print struct.unpack('<B',HCI_Packet_Type)
		print "broken!"
		b.doDiscovery()

