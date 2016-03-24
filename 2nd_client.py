import websocket
import time
import sys

HOSTNAME = "ws://127.0.0.1:8080/websocket"

def on_message(ws, message):
    print(message)


def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### closed ###")


def on_open(ws):
    
    for i in range(5):
        # send the message, then wait
        # so thread doesn't exit and socket
        # isn't closed
        ws.send("Hello %d" % i)
        time.sleep(1)

    time.sleep(1)
    #ws.close()
    print("Thread terminating...")

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(HOSTNAME,
                                on_message = on_message,
                                on_error = on_error,
                                on_close = on_close)

    ws.on_open = on_open
    ws.run_forever()