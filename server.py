import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop

import json

clients = []			# Clients running the CLI monitor app
webClients = []			# Clients running the web interface
 
class WebSocketHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print("Incomming Connection: " + str(self))
		#pass
 
	def on_message(self, message):
		#self.write_message(u"Your message was: " + message)
		print(message)
		self.process_request(message)

	def on_close(self):
		print("Closing connection with: " + str(self))
		print("Codes: " + str(self.close_code) + " | " + str(self.close_reason))
		# clients.remove(self)
		# print(clients)

		if self in clients:
			clients.remove(self)
		elif self in webClients:
			webClients.remove(self)

		debugClientStatus()


		#pass

	def process_request(self, message):
		msg = json.loads(message)
		request = msg['request']	#TODO: VALIDATE MSG
		
		print('# REQUEST: ' + request)	
		# print(request)
		if request == 'new-connection':
			clientType = msg['client-type']
			print('# CLIENT-TYPE: ' + clientType)
			
			if clientType == 'hardware-client':
				print('\tAdding a hardware client: ' + str(self))
				clients.append(self)

				msg = { 'message' : 'update-hw-clients', 'content' : len(clients) }
				broadcastToWebClients(msg)

			elif clientType == 'web-client':
				print('\tAdding a web client: ' + str(self))
				webClients.append(self)

			debugClientStatus()

		elif request == 'retrieve-clients-data':
			reply = { 'reply' : 'connected-clients', 'content' : len(clients) }
			self.write_message( reply )

		else:
			print('request: ' + str(request) + ' is not a valid request')
			reply = { 'reply' : 'connected-clients', 'content' : 'INVALID' }
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

def broadcastToWebClients(message):
	for wClient in webClients:
		wClient.write_message(message)


def debugClientStatus():
	print("\tTOTAL H-Clients: " + str(len(clients)))
	print("\tTOTAL W-Clients: " + str(len(webClients)))

 
 
if __name__ == '__main__':
	ws_app = Application()
	ws_app.compiled_template_cache = False

	server = tornado.httpserver.HTTPServer(ws_app)
	server.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

