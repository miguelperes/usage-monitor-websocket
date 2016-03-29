# Hardware Monitoring

A simple websocket implementation to gather usage data from a computer and send it to a server. The data can then be tracked in a webpage.

#### Server side 
The server is implemented using [Tornado](http://www.tornadoweb.org/) web framework for Python.

#### Client side 
The client uses [websocket-client](https://github.com/liris/websocket-client) module for the client side and [psutil](https://pypi.python.org/pypi/psutil) for retrieving system utilization info.

##### Installing dependencies to run the client:
* [Install psutil](https://github.com/giampaolo/psutil/blob/master/INSTALL.rst)
* Install websocket-client: ```pip install websocket-client```

![alt text](http://i.imgur.com/m07hcTy.png "Example Image")