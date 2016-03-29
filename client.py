import datetime
import time
import json

import websocket
import psutil

HOSTNAME = "ws://45.55.193.149:8080/websocket"
# HOSTNAME = "ws://192.168.0.100:8080/websocket"      # Insert server address here

GATHER_INTERVAL       = 5
CACHE_GATHER_INTERVAL = 1
CONN                  = False           # Current connection status

DATE_FORMAT = '{0:%Y-%m-%d %H:%M:%S}'
cached_data = [];

def on_message(ws, message):
    pass

def on_error(ws, error):
    print(error)
    print('\nRetrying in ' + str(CACHE_GATHER_INTERVAL) + ' seconds...')
    print('[ Storing data to send when connection is stablished ]')
    storage_data(CACHE_GATHER_INTERVAL, cached_data)


def on_close(ws):
    CONN = False
    print("### client closed ###")

def on_open(ws):
    CONN = True
    print("[ Connected to " + str(HOSTNAME) + " ]")
    print("[ Retrieving information every " + str(GATHER_INTERVAL) + " seconds ]" )
    print("[ When offline, caching data every " + str(CACHE_GATHER_INTERVAL) + " seconds ]\n" )

    login(ws)

    if len(cached_data) > 0:
        send_cached_data(ws, cached_data)

    while True:
        usage_status = gather_data(GATHER_INTERVAL)
        print("Sendind collected CPU and memory usage...")
        ws.send( usage_status )

    #ws.close()

def login(ws):
    msg = {'type' : 'new-connection', 'client-type' : 'hardware-client'}
    ws.send( json.dumps(msg) );

def send_cached_data(ws, cached_data):
    msg = { 'type' : 'cached-data', 'data' : cached_data }
    print("Sending cached data...")
    ws.send( json.dumps(msg) );
    del cached_data[:]

def gather_data(interval):
    cpu_usage = psutil.cpu_percent( interval )
    mem_usage = psutil.virtual_memory().percent
    collect_time = str(DATE_FORMAT.format(datetime.datetime.now()))  

    data = { 'type'         : 'usage-data',
             'cpu-usage'    : cpu_usage,
             'memory-usage' : mem_usage,
             'timestamp'    : collect_time }

    return json.dumps(data)

def storage_data(interval, data_list):
    data = gather_data(interval)
    data_list.append(data);


if __name__ == "__main__":
    websocket.enableTrace(False)

    while not CONN:
        ws = websocket.WebSocketApp(HOSTNAME,
                            on_message = on_message,
                            on_error = on_error,
                            on_close = on_close)

        ws.on_open = on_open
        ws.run_forever()

    

    
    









