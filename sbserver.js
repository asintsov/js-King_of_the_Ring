import express from 'express'
import http from 'http'
import path from 'path'
import socketIO from 'socket.io'
let app = express();
let server = http.Server(app);
let io = socketIO(server);

app.set('port', 4000);
let __dirname = path.resolve();
app.use('/static', express.static(__dirname + '/static'));

// Маршруты
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'sb.html'));
});

// Запуск сервера
server.listen(4000, function() {
    console.log('Запускаю сервер на порте 4000');
});

let corners = {blue: false, red: false};
let states = {
    blue: 
    {   action: null,
        life: null,
        block: null,
        x: null,
        face: null,
        fist: null,
        back: null
    },
    red:
    {   action: null,
        life: null,
        block: null,
        x: null,
        face: null,
        fist: null,
        back: null
    }
};

function restart(){
    corners = {blue: false, red: false};
    states = {
        blue: 
        {   action: null,
            life: null,
            block: null,
            x: null,
            face: null,
            fist: null,
            back: null
        },
        red:
        {   action: null,
            life: null,
            block: null,
            x: null,
            face: null,
            fist: null,
            back: null
        }
    }
}

io.on('connection', function(socket) {
    socket.on('new player', function(corner) {
        switch(corner){
            case 'BLUE':
                if (!corners.blue){
                    console.log("blue")
                    corners.blue = true;
                    socket.emit('corner', 'BLUE');
                    socket.on('state', (state) => {
                        states.blue = state;
                    })
                    socket.on('hit', (hit) => {
                        states.red.life -= hit * states.red.block
                        if (!states.red.life){
                            io.sockets.emit('win', 'BLUE');
                            restart();
                        }
                    })
                }
                break
            case 'RED':
                if(!corners.red){
                    console.log("red")
                    corners.red = true;
                    socket.emit('corner', 'RED');
                    socket.on('state', (state) => {
                        states.red = state;
                    })
                    socket.on('hit', (hit) => {
                        states.blue.life -= hit * states.blue.block
                        if (states.blue.life == 0){
                            io.sockets.emit('win', 'RED');
                            restart();
                        }
                    })
                }
                break
        }
    });
});

setInterval(function() {
  io.sockets.emit('states', states);
}, 1000 / 20);
