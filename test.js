const PORT = 41234;
const HOST = '0.0.0.0'; // my external ip

import dgram from 'node:dgram';
const server = dgram.createSocket('udp4');

server.on('listening', function () {
    const address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + 
address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + 
message);

});

server.bind(PORT, HOST);