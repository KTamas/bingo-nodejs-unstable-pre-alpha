function bingo(ez) {
  if ($(".piros").length > 3) {
    var megvanazoszlop = false;
   // oszlop
     $.each(['a', 'b', 'c', 'd'], function(i,e) {
       if ($(".ui-block-"+e+" .piros").length === 4) {
         $(".ui-block-"+e+ " a").addClass('zold').removeClass('piros');
         megvanazoszlop = true;
       }
    });
     if (megvanazoszlop) return true;
    // sor
    if ($(ez).parent().siblings().children().filter(".piros").length === 3) {
      $(ez).parent().siblings().andSelf().find("a").addClass("zold").removeClass('piros');
      return true;
    }
  } 
  return false;
}

function szosal(){
  if ($(".kocka a").length > 0) {
    game = window.location.hash.split("/")[1];
    nick = localStorage.getItem("nick");
    $(".kocka a").click(function() {
      $(this).toggleClass("piros");
      if (bingo($(this)) === true) {
        socket.send({"nick": nick, "nyertem": true})
      }  // BIZNISZ LOGIC!!! DEC RÁJT
    });
    var socket = new io.Socket();
    socket.on('connect', function() {
        socket.send(JSON.stringify({"nick": nick, "game": game }))
    });
    socket.on('message', function(data) {
      console.log(data);
        if (data.event === "win"&& data.game === game) {
          alert("bingó! " + data.nick + " nyert!");
          //$("<div>", {
            //"class": "notice",
            //"html": "BINGÓ! " + data.nick + " nyert!"
            //}).appendTo($.mobile.activePage);
        }
    });
    socket.connect();
  }
}
