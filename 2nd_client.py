import datetime
import json

import websocket
import psutil

# HOSTNAME = "ws://127.0.0.1:8080/websocket"
HOSTNAME = "ws://192.168.0.100:8080/websocket"

DATE_FORMAT = '{0:%Y-%m-%d %H:%M:%S}'

def on_message(ws, message):
    print("From server: " + str(message))


def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### client closed ###")


def on_open(ws):
    
    msg = {'type' : 'new-connection', 'client-type' : 'hardware-client'}
    ws.send( json.dumps(msg) );

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    usage_status = gather_data()
    ws.send( usage_status )

    #ws.close()

def gather_data():
    cpu_usage = psutil.cpu_percent(interval=1)
    mem_usage = psutil.virtual_memory().percent
    collect_time = str(DATE_FORMAT.format(datetime.datetime.now()))  

    data = { 'type'         : 'usage-data',
             'cpu-usage'    : cpu_usage,
             'memory-usage' : mem_usage,
             'timestamp'    : collect_time }

    return json.dumps(data)


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(HOSTNAME,
                                on_message = on_message,
                                on_error = on_error,
                                on_close = on_close)

    ws.on_open = on_open
    ws.run_forever()

    

    
    









