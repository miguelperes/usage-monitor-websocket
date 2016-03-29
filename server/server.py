import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop

import json
import os


class Manager():
	
	clientsMap = {}							# Maps client ID 		-> client websocket interface
	idsMap	   = {}							# Maps client websocket -> client ID	
	usageData  = { 'client-list' : [] }		# Maps all data sent by the clients, by ID

	hwClients  = []		# Hardware Clients: clients running the CLI monitor app
	webClients = []		# Web Clients: 		clients running the web interface

	nextClientID = 0


	def getNextClientID():
		currentID = Manager.nextClientID
		Manager.nextClientID += 1
		return currentID

	def signupClient(client):

		clientID = Manager.getNextClientID()

		# Register and identify client
		Manager.clientsMap[clientID] = client
		Manager.idsMap[client] = clientID
		Manager.hwClients.append(client)

		#Send ID and IP of new client
		msg = { 'type' : 'new-hwclient', 'content' : clientID, 'ip' : str(client.request.remote_ip) }
		Manager.broadcastToWebClients(msg)

	def logoffClient(client):
		if client in Manager.hwClients:
			Manager.hwClients.remove(client)

			idToRemove = None
			for cID, cObject in Manager.clientsMap.items():
				if cObject == client:
					idToRemove = cID
			Manager.clientsMap.pop(idToRemove);

			if client in Manager.idsMap.keys():
				Manager.idsMap.pop(client)

			clientRemovalMsg = { 'type': 'remove-hw-clients', 'content' : idToRemove }
			Manager.broadcastToWebClients(clientRemovalMsg)

			Manager.removeFromStorage(idToRemove)


		elif client in Manager.webClients:
			Manager.webClients.remove(client)

		debugClientStatus()

	def composeMessage(msg, clientSocket):
		clientID = Manager.idsMap[clientSocket]
		clientIP = clientSocket.request.remote_ip

		Manager.updateDataStorage(clientID, clientIP, msg)

		message = { 'type': 'usage-update', 'id': clientID, 'content': msg }

		return json.dumps(message)

	def processCachedData(msg, clientSocket):
		clientID = Manager.idsMap[clientSocket]
		clientIP = clientSocket.request.remote_ip

		dataList = msg['data']
		
		# Store all data
		for i in range(len(dataList)):
			encodedData = json.loads(dataList[i])
			Manager.updateDataStorage(clientID, clientIP, encodedData)
			Manager.broadcastToWebClients(encodedData) # overhead?


	def broadcastToWebClients(message):
		for wClient in Manager.webClients:
			wClient.write_message(message)


	def updateDataStorage(clientID, clientIP, msg):
		if not Manager.checkForClientInStorage(clientID):
			obj = { 'id' : clientID, 'ip': str(clientIP), 'history' : [] }
			obj['history'].append(msg)
			Manager.usageData['client-list'].append(obj)
		
		else:
			clientObj = Manager.getClientObjFromList(clientID)
			if clientObj != -1:
				clientObj['history'].append(msg)
			else:
				print('@ERROR: CLIENT NOT FOUND')


	def checkForClientInStorage(clientID):
		cList = Manager.usageData['client-list']
		for i in range(len(cList)):
			if cList[i]['id'] == clientID:
				return True
		return False


	def getClientObjFromList(clientID):
		cList = Manager.usageData['client-list']
		for i in range(len(cList)):
			if cList[i]['id'] == clientID:
				return cList[i]
		return -1


	def removeFromStorage(clientID):
		cList = Manager.usageData['client-list']
		objToRemove = None

		for i in range(len(cList)):
			if cList[i]['id'] == clientID:
				objToRemove = cList[i]
		
		if objToRemove != None:
			cList.remove(objToRemove)
		else:
			print("Client not stored.")


	def getStoredCache(clientID):
		client = Manager.getClientObjFromList(clientID)

		if client != -1:
			return client['history']
		else:
			return []

			
 
class WebSocketHandler(tornado.websocket.WebSocketHandler):

	def check_origin(self, origin):
		return True


	def open(self):
		print("\nON_OPEN: " + str(self.request.remote_ip))
		#pass

 
	def on_message(self, message):
		print("\nON_MESSAGE: ")
		print(message)
		self.process_request(message)


	def on_close(self):
		print("ON_CLOSE: " + str(self))
		print("Codes: " + str(self.close_code) + " | " + str(self.close_reason))
		Manager.logoffClient(self)


	def process_request(self, message):
		msg = json.loads(message)
		request = msg['type']
		
		# NEW CONNECTION
		if request == 'new-connection':
			clientType = msg['client-type']
			
			if clientType == 'hardware-client':
				print('\tAdding a hardware client: ' + str(self))
				Manager.signupClient(self)

			elif clientType == 'web-client':
				print('\tAdding a web client: ' + str(self))
				Manager.webClients.append(self)
				
				reply = { 'type' : 'boot-usage-data', 'content' : json.dumps(Manager.usageData) }
				self.write_message( reply )

			debugClientStatus()

		# DATA RECEIVED
		elif request == 'usage-data':
			reply = Manager.composeMessage(msg, self)
			Manager.broadcastToWebClients(reply)

		# CACHED DATA RECEIVED
		elif request == 'cached-data':
			Manager.processCachedData(msg, self)

		# INVALID MESSAGE
		else:
			print('request: ' + str(request) + ' is not a valid request')
			reply = { 'type' : 'connected-clients', 'content' : 'INVALID' }
			self.write_message( reply )


 
class IndexPageHandler(tornado.web.RequestHandler):
	def get(self):
		self.render("index.html")
 

class Application(tornado.web.Application):
	def __init__(self):
		handlers = [
			(r'/', IndexPageHandler),
			(r'/websocket', WebSocketHandler)
		]
 
		settings = {
			'template_path': 'templates',
			'static_path': 'static'
		}
		tornado.web.Application.__init__(self, handlers, **settings)


def debugClientStatus():
			
	# os.system("clear")
	# print("\n\n")
	print("\tTOTAL H-Clients: " + str(len(Manager.hwClients)))
	# print(Manager.hwClients)
	print("\tTOTAL W-Clients: " + str(len(Manager.webClients)))
	# print(Manager.webClients)
	# print("\n\tClient Map:")
	# for cid, client in Manager.clientsMap.items():
	# 		print(cid, client)
	# print("\n\tIDs Map:")
	# for cid, client in Manager.idsMap.items():
	# 		print(cid, client)


def printJSON(json):
	print(json.dumps(json, indent=4, sort_keys=True))

 
if __name__ == '__main__':
	ws_app = Application()
	ws_app.compiled_template_cache = False

	server = tornado.httpserver.HTTPServer(ws_app)
	server.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

