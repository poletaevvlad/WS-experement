class Connection():
    connections = {}

    def __init__(self):
        self.display = None
        self.controller = None
        self.session_code = ""

    def connected(self, role):
        if role in ["display", "controller"]:
            return ((self.display is not None) if role == "display"
                    else (self.controller is not None))
        return False

    def connect(self, role, ws):
        if (role == "display"):
            self.display = ws
        elif (role == "controller"):
            self.controller = ws

        if self.session_code not in Connection.connections:
            Connection.connections[self.session_code] = self

    def disconnect_ws(self, ws):
        if self.display == ws:
            self.display = None
        elif self.controller == ws:
            self.controller = None

        if not self.connected("display") and not self.connected("controller"):
            Connection.remove(self.session_code)

    def another_ws(self, ws):
        if self.controller == ws:
            return self.display
        else:
            return self.controller

    @classmethod
    def get_connection(cls, session):
        if session in cls.connections:
            return cls.connections[session]
        else:
            con = Connection()
            con.session_code = session
            return con

    @classmethod
    def get_connection_ws(cls, ws):
        for session in cls.connections:
            connection = cls.connections[session]
            if connection.display == ws or connection.controller == ws:
                return connection
        return Connection()

    @classmethod
    def remove(cls, session):
        if session in cls.connections:
            cls.connections.pop(session)
