import websocket # Incluir para o cliente (na pasta)
import json

usageStatus = json.dumps( ['foo', {'bar': ('baz', None, 1.0, 2)}] )
print(usageStatus)
 
if __name__ == "__main__":
    websocket.enableTrace(False)
    ws = websocket.create_connection("ws://127.0.0.1:8080/websocket")
    
    print("Sending 'Hello, World'...")
    ws.send("Hello, World")
    print("Sent")

    print("Receiving...")
    result = ws.recv()
    print("Received {}".format(result))

    ws.run_forever()
    #ws.close()