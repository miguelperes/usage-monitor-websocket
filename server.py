import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop

import json
import os


class Manager():
	
	clientsMap = {}		# Maps client ID 		-> client websocket interface
	idsMap	   = {}		# Maps client websocket -> client ID	

	hwClients  = []		# Hardware Clients: clients running the CLI monitor app
	webClients = []		# Web Clients: 		clients running the web interface

	nextClientID = 0


	def getNextClientID():
		currentID = Manager.nextClientID
		Manager.nextClientID += 1
		return currentID

	def signupClient(client):

		clientID = Manager.getNextClientID()

		Manager.clientsMap[clientID] = client
		Manager.idsMap[client] = clientID

		Manager.hwClients.append(client)

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

			clientRemovalMsg = { 'type': 'update-hw-clients', 'content' : len(Manager.hwClients) }
			Manager.broadcastToWebClients(clientRemovalMsg)


		elif client in Manager.webClients:
			Manager.webClients.remove(client)

		debugClientStatus()

	def appendIDToMsg(msg, clientSocket):
		clientID = Manager.idsMap[clientSocket]
		
		data = msg
		data['id'] = clientID

		return data

	def broadcastToWebClients(message):
		for wClient in Manager.webClients:
			wClient.write_message(message)
		

 
class WebSocketHandler(tornado.websocket.WebSocketHandler):

	def check_origin(self, origin):
		return True

	def open(self):
		print("Incomming Connection: " + str(self.request.remote_ip))
		#pass
 
	def on_message(self, message):
		#self.write_message(u"Your message was: " + message)
		print(message)
		self.process_request(message)

	def on_close(self):
		print("Closing connection with: " + str(self))
		print("Codes: " + str(self.close_code) + " | " + str(self.close_reason))

		Manager.logoffClient(self)
		#pass

	def process_request(self, message):
		msg = json.loads(message)
		request = msg['type']	#TODO: VALIDATE MSG
		
		# NEW CONNECTION
		if request == 'new-connection':
			clientType = msg['client-type']
			# print('# CLIENT-TYPE: ' + clientType)
			
			if clientType == 'hardware-client':
				print('\tAdding a hardware client: ' + str(self))
				Manager.signupClient(self)
				# clients.append(self)

				msg = { 'type' : 'update-hw-clients', 'content' : len(Manager.hwClients) }
				Manager.broadcastToWebClients(msg)

			elif clientType == 'web-client':
				print('\tAdding a web client: ' + str(self))
				Manager.webClients.append(self)
				
				reply = { 'type' : 'update-hw-clients', 'content' : len(Manager.hwClients) }
				self.write_message( reply )

			debugClientStatus()

		elif request == 'usage-data':
			data = Manager.appendIDToMsg(msg, self)
			Manager.broadcastToWebClients(data)

		else:
			print('request: ' + str(request) + ' is not a valid request')
			reply = { 'type' : 'connected-clients', 'content' : 'INVALID' }
			self.write_message( reply )

	

 
 
class IndexPageHandler(tornado.web.RequestHandler):
	def get(self):
		self.render("index.html")
		#print(self.request)
		#self.write(self.request)
 
 
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
	print("\n\n")
	print("\n\tTOTAL H-Clients: " + str(len(Manager.hwClients)))
	print(Manager.hwClients)
	print("\n\tTOTAL W-Clients: " + str(len(Manager.webClients)))
	print(Manager.webClients)
	print("\n\tClient Map:")
	for cid, client in Manager.clientsMap.items():
			print(cid, client)
	print("\n\tIDs Map:")
	for cid, client in Manager.idsMap.items():
			print(cid, client)

 
if __name__ == '__main__':
	# print(nextClientID)
	ws_app = Application()
	ws_app.compiled_template_cache = False

	server = tornado.httpserver.HTTPServer(ws_app)
	server.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

