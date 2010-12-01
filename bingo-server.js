function randomUUID() {
  // http://ajaxian.com/archives/uuid-generator-in-javascript
  var s = [], itoh = '0123456789ABCDEF';

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);

  // Conform to RFC-4122, section 4.4
  s[14] = 4;  // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (var i = 0; i <36; i++) s[i] = itoh[s[i]];

  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-';

  return s.join('');
}



var jqtpl = require('jqtpl'),
    express = require('express'),
    app = express.createServer(),
    fs = require('fs'),
    io = require('socket.io'),
    db = require('dirty'),
    games = db('games.db');
    wordlists = db('wordlists.db');
 
app.use(express.bodyDecoder());
app.use(express.staticProvider(__dirname + '/public'));
app.set( "view engine", "jqtpl" );
app.register( ".jqtpl", require( "jqtpl" ) );

// (1)
app.get('/games', function(req,res){
  var list = [];
  games.forEach(function(k,v){
    w = wordlists.get(v.wordlist);
  list.push({
  'key': k, 
  'title': w.title, 
  'creator': v.creator, 
  'num_curr_playing': 0})
  })
  res.send(list);
});

// (2)
app.get('/wordlists', function(req,res){
 var list = [];
 wordlists.forEach(function(k, v) {
   list.push({'key': k, 'title': v.title, 'creator': v.creator, 'words': v.words})
 });
 res.send(list);
});

// (3)
app.post('/new_wordlist', function(req,res){
  var title = req.body.title,
      creator = req.body.creator,
      words = req.body.textarea.split("\n"),
      uuid = randomUUID();
  wordlists.set(uuid, {'title': title, 'creator': creator, 'words': words});
  res.send(uuid + '\n');

});

// (4)
app.get('/play/:gameuid', function(req,res){
  var game = req.params.gameuid,
      words = wordlists.get(games.get(game)["wordlist"]).words;

  shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
      };
    var words = shuffle(words);
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
})

// (5)
app.post('/new_game', function(req,res){
  var wordlist = req.body.wordlist,
      creator = req.body.creator,
      uuid = randomUUID();
  games.set(uuid, {'wordlist': wordlist, 'creator':creator});
  res.send(uuid + '\n');
})

//app.get('/list', function(req, res) {
    //var active = [];
    //db.forEach(function(key,val) {
      //if (key == "game") {
        //active.push({title: val.title, creator:val.creator});
      //}
    //})
    //res.send(active);
//});

//app.get('/listwords', function(req,res) {
    //var wordlist = [];
    //db.forEach(function(key, val){
      //if (key == "wordlist") {
      //wordlist.push({val.title})
      //}
    //}
//});

//app.post('/newgame', function(req,res) {
  //var wordlist = req.body.wordlist,
      //creator  = req.body.creator;
  //db.set("game", {
                  //wordlist:"wordlist",
                  //creator: "creator"
                //});
  //res.send({"a": 1});
//});

//app.post('/newwordlist', function(req, res) {
    //var szavak = req.body.textarea.split("\n");
    //db.set("wordlist", {
      //"title": req.body.title, 
      //"creator": req.body.creator, 
      //"words": szavak
      //})
    //res.send({"a": 1});
 //});
//app.get('/play/:game', function(req, res) {
    //var game = db.get(req.params.game);

    //});
//});
// új urlek
//

// régi
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

