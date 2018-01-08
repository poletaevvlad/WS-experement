import random
import string
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource
from whitenoise import WhiteNoise

from connection import Connection


class TracksApplication(WebSocketApplication):
    def on_open(self):
        pass

    def on_message(self, message):
        if not message:
            return

        # print(message)
        if message == "request_code":
            letters = [b for b in [random.choice(string.ascii_uppercase)
                                   for a in range(5)]]
            code = ""
            for letter in letters:
                code += letter
            self.ws.send("code %s" % code)
        elif message[:6] == "hello ":
            command, session, role = message.split()
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

            if destination_ws is not None:
                destination_ws.send(message)

    def on_close(self, reason):
        con = Connection.get_connection_ws(self.ws)

        if con.controller == self.ws and con.connected("display"):
            con.display.send("controller_disconnected")
        elif con.display == self.ws and con.connected("controller"):
            con.controller.send("display_disconnected")

        con.disconnect_ws(self.ws)


def application(environ, start_response):
    text = bytes("404. Not found", "utf-8")
    headers = [("Content-Type", "text/plain"),
               ("Content-Length", str(len(text)))]
    start_response("404 Not Found", headers)
    yield text


class IndexWhiteNoise(WhiteNoise):
    INDEX_NAME = 'index.html'

    def update_files_dictionary(self, *args):
        super(IndexWhiteNoise, self).update_files_dictionary(*args)
        index_page_suffix = '/' + self.INDEX_NAME
        index_name_length = len(self.INDEX_NAME)
        directory_indexes = {}
        for url, static_file in self.files.items():
            if url.endswith(index_page_suffix):
                parent_directory_url = url[:-index_name_length]
                directory_indexes[parent_directory_url] = static_file
        self.files.update(directory_indexes)

    def find_file(self, url):
        if url.endswith('/'):
            url += self.INDEX_NAME
        return super(IndexWhiteNoise, self).find_file(url)


resources = [
    ("/server", TracksApplication),
    ("/", IndexWhiteNoise(application, root="static"))
]

if __name__ == "__main__":
    WebSocketServer(("0.0.0.0", 8080), Resource(resources)).serve_forever()
