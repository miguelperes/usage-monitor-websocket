import websocket
import time
import sys

import json

HOSTNAME = "ws://127.0.0.1:8080/websocket"

def on_message(ws, message):
    print("From server: " + str(message))


def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### client closed ###")


def on_open(ws):
    
    msg = {'request' : 'new-connection', 'client-type' : 'hardware-client'}
    ws.send( json.dumps(msg) );    

    #ws.close()

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(HOSTNAME,
                                on_message = on_message,
                                on_error = on_error,
                                on_close = on_close)

    ws.on_open = on_open
    ws.run_forever()