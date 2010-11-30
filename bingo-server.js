var db = require('dirty')('bingo.db'),
    jqtpl = require('jqtpl'),
    express = require('express'),
    app = express.createServer(),
    fs = require('fs'),
    io = require('socket.io');

app.use(express.bodyDecoder());
app.use(express.staticProvider(__dirname + '/public'));
app.set( "view engine", "jqtpl" );
app.register( ".jqtpl", require( "jqtpl" ) );

app.get('/list', function(req, res) {
    var active = []
    db.forEach(function(key,val) {
      if (val.open) {
        active.push({title: key, creator:val.creator});
      }
    })
    res.send(active);
});
app.post('/new', function(req, res) {
    var szavak = req.body.textarea.split("\n");
    db.set(req.body.title, {"creator": req.body.creator, 
                           "words": szavak})
    res.send({"a": 1});
 });
app.get('/play/:game', function(req, res) {
    var game = db.get(req.params.game);
    shuffle = function(o){ //v1.0
      for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
        };
    var words = shuffle(game.words);

    var rows = [words.slice(0,4), words.slice(4,8), words.slice(8,12), words.slice(12,16)];
    fs.readFile(__dirname + '/views/partials/bingo.jqtpl', "binary", function(error, file) {
      var parshal = jqtpl.tmpl(file, {
           "a": "hello", "rows": rows,
        }, { 
           rowletter: function(j) {
              return String.fromCharCode(97+j);
              }
        });
      res.send(parshal)
    });
});


// NYUGODT URLEK
// /list
//  -> get: [{name: "", creator: "", active: true,num_currently_playing},...]
// /new
//  -> post: creator & name & words = [, , ,]
// /play/:name
//  -> get: words=[] // 16, randomised from list

app.listen(8124);

var socket = io.listen(app);
socket.on('connection', function(client) {
    client.broadcast({announcement: client.sessionId + ' connected, weee'});
    client.on('message', function(data) {
      console.log(data);
      if (data.nyertem) {
        client.broadcast({ "event": "win", "game": data.game, "nick": data.nick});
      }
    });
});

