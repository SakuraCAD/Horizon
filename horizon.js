/*
______  __            _____                    
___  / / /_______________(_)__________________ 
__  /_/ /_  __ \_  ___/_  /___  /_  __ \_  __ \
_  __  / / /_/ /  /   _  / __  /_/ /_/ /  / / /
/_/ /_/  \____//_/    /_/  _____/\____//_/ /_/ 
                                               
    Horizon Websockets for FiveM
    Developed by LewisTehMinerz#1337
    https://sakuracad.app
    Made using Visual Studio Code - Insiders
*/

const WebSocket = require('ws');

const { v4: uuid } = require('uuid');

const wsUrl = 'wss://api.sakuracad.app/';
const socket = new WebSocket(wsUrl);

const cbMap = new Map();

on('sakuram:horizon:send', (operation, data, callback) => {
    let r = null;

    if (callback) {
        r = uuid();
        cbMap.set(r, callback);
    }

    socket.send(JSON.stringify({ r, o: operation, d: data }));
});

socket.on('message', data => {
    const dataReceived = JSON.parse(data);

    if (!dataReceived.r) return;

    if (cbMap.has(dataReceived.r)) {
        cbMap.get(dataReceived.r)(dataReceived.d);
        cbMap.delete(dataReceived.r);
    } else {
        emit('sakuram:horizon:receive', dataReceived.o, dataReceived.d, (operation, data) => {
            socket.send({ r: dataReceived.r, o: operation, d: data });
        });
    }
});

socket.on('open', () => emit('sakuram:horizon:ready'));
