import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop

clients = []
 
class WebSocketHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print("Incomming Connection: " + str(self))
		clients.append(self)
		print(clients)
		#pass
 
	def on_message(self, message):
		self.write_message(u"Your message was: " + message)
		
		# for i in range(len(clients)):
		# 	print(i)


	def on_close(self):
		print("Closing connection with: " + str(self))
		print("Codes: " + str(self.close_code) + " | " + str(self.close_reason))
		clients.remove(self)
		#print(clients)
		#pass
 
 
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
			'template_path': 'templates'
		}
		tornado.web.Application.__init__(self, handlers, **settings)
 
 
if __name__ == '__main__':
	ws_app = Application()
	server = tornado.httpserver.HTTPServer(ws_app)
	server.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

