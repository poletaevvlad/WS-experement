import os, sys
if "OPENSHIFT_DATA_DIR" in os.environ:
	path = os.environ["OPENSHIFT_DATA_DIR"]+"virtualenv/lib/python2.6/site-packages"
	sys.path.append(path)

ip = ""
if "OPENSHIFT_DIY_IP" in os.environ:
	ip=os.environ["OPENSHIFT_DIY_IP"]

from geventwebsocket import WebSocketServer, WebSocketApplication, Resource
import random

from connection import Connection


class EchoApplication(WebSocketApplication):
	def on_open(self):
		pass

	def on_message(self, message):
		if not message: return

		# print(message)
		if message == "request_code":
			letters = [chr(b) for b in [random.randrange(ord('A'), ord('Z')) for a in range(5)]]
			code = ""
			for letter in letters:
				code += letter
			self.ws.send("code %s" % code)

		elif message[:6] == "hello ":
			command, session, role = message.split();
			session = session.upper()

			con = Connection.get_connection(session)

			if role == "controller":
				if con.connected("display"):
					con.connect(role, self.ws)
					con.display.send("controller_connected")
					con.controller.send("connect_succesful")
				else:
					self.ws.send("connect_failed")
			elif role == "display":
				con.connect(role, self.ws)
			else:
				print("Error: unknown role: %s" % role)
			
		else:
			con = Connection.get_connection_ws(self.ws)
			destination_ws = con.another_ws(self.ws)

			if destination_ws != None:
				destination_ws.send(message)

	def on_close(self, reason):
		con = Connection.get_connection_ws(self.ws)
		
		if con.controller == self.ws and con.connected("display"):
			con.display.send("controller_disconnected")
		elif con.display == self.ws and con.connected("controller"):
			con.controller.send("display_disconnected")

		con.disconnect_ws(self.ws)

WebSocketServer((ip, 8080), Resource({'/': EchoApplication})).serve_forever()
