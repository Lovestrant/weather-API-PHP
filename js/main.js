var stopped = false;


function load_page(page, div) ////////////=========Load a html page to a div
{
    $(div).load("screens/" + page);
}


function module_about() {
    load_page("about.html", "#screen_");

}


function module_cardstype(displaytype, hasExit, waitsec) {
    if (displaytype === 'INLINE') {

    }

    setTimeout(function () {
        $('#screen_').html('...');
        load_page("choose_cardtypes.html", "#screen_");
    }, waitsec * 1000);
}

function module_home() {
    load_page("home.html", "#screen_");
    header();
}

function module_invite() {
    load_page("invite.html", "#screen_");
    header();
}

function redirect(finalurl) {
    window.location.href = finalurl;
}

function previous_game_load() {
    redirect("gameplay.html");
}

function module_levels() {
    load_page("select_level.html", "#screen_");
    header('HIDE');
}

function module_profile() {
    load_page("set_userprofile.html", "#screen_");

    //////Check if it's an online game play or local game play
    setTimeout(function () {

        let gameplay = localStorage.getItem("NPlayType");
        let localplayer = localStorage.getItem("NLocalPlayer");
        if(gameplay === 'ONLINE'){
            $('.p').css('display','none');
            if(localplayer === '1'){
                $('#p1').css('display','block');  /////////Show player 1 profile form
            }
            else{
                inputEdit('#user_','2');
                classAdd('#p2','p','selected');
                $('#p2').css('display','block'); //////show player 2 profile form
            }
        }
    },2000);

}

function header(action = 'SHOW') {
    if (action === 'SHOW') {
        $('#head').css('display', 'block');
    } else if (action === 'HIDE') {
        $('#head').css('display', 'none');
    }
}

function select_level(did, img) {
    localStorage.setItem("n_level", 1);
    localStorage.setItem("bg_", "default.jpg");
    toast("Downloading deck...",3);
    ////////----------download level
    download_cards(did, function() {
        module_profile();
    });

}

function classAdd(add, remove, className) {
    $('.' + remove).removeClass(className);
    $(add).addClass(className);
}

function inputEdit(input, value) {
    $(input).val(value);
}



function set_profile() {

    let p1Name = $('#p1Name').val();
    let p1gender = $('#p1Gender').val();
    let p1Avatar = $('#p1Avatar').val();
    let p1Avatar2 = $('#p1Avatar2').val();
    let user = $('#user_').val();

    if (p1Name) {
        if (p1Avatar || p1Avatar2) {
            var theAvator;
            //////////==========Good to go
            if(p1Avatar2){
                 theAvator = p1Avatar2;
            }else{
                 theAvator = p1Avatar; 
            }

            let profile1 = {
                "profile": {
                    "Name": "" + p1Name + "",
                    "Gender": "" + p1gender + "",
                    "Avatar": "" + theAvator + ""
                }
            };
            localStorage.setItem("n_profile_" + user, JSON.stringify(profile1));
            toast("Profile for Player " + user + " saved");
            $('#p1Name').val('');
            $('#p1Gender').val('');
            $('#p1Avatar').val('');

            let playtype = localStorage.getItem("NPlayType");
            if(playtype === 'ONLINE'){
                let player = localStorage.getItem("NLocalPlayer");
                if(player){
                    if((parseInt(player)) === 2){
                        start_game_play_online_player_2();
                    }
                    else{
                        module_invite();
                    }

                }else {
                    module_invite()
                }
            }



        } else {
            toast('Click on avator options or select from local storage');
        }
    } else {
        toast('Name is Required');
    }


}

function readProfile(player) {
    let profile1 = localStorage.getItem('n_profile_1');
    let profile2 = localStorage.getItem('n_profile_2');



    if (profile1 && player === 1) {
        let prof1 = JSON.parse(profile1);
       return prof1;
    }
    if (profile2 && player === 2) {
        let prof2 = JSON.parse(profile2);
       return prof2;

    }

}


function finishProfile() {
    if ((localStorage.getItem('n_profile_1')) && (localStorage.getItem('n_profile_2'))) {
        redirect("gameplay.html");
    } else {
        toast('Please set both profiles');
    }
}

function start_game_play_online_player_2(){
    let profile2 = localStorage.getItem("n_profile_2");
    let invite = localStorage.getItem("nInviteCode");
    let params = "prof="+profile2+"&inv="+invite;
    dbaction("/accept_invite.php", params, function (feedback) {
        redirect("gameplay.html");
    });

}


/////Click play online
function playOnline(){
    localStorage.setItem("NPlayType","ONLINE");
    localStorage.setItem("NLocalPlayer","1");
    module_levels();

}

function playOffline() {
    localStorage.setItem("NPlayType","OFFLINE");
    localStorage.removeItem("NLocalPlayer");
    module_levels();
}


/////////////////Function load decks
function load_decks(offset) {

    let wherec = 'uid > 0 and status = 1';
    /////-----------End of prepare pager

    let jso = ({"where_": {"where_": "" + wherec + ""}, "limit_": {"limit_": "0,50"}});

    crudaction(jso, "/decks_read.php", function (result) {
         
        let json_ = JSON.parse(result);
        let status = json_.result_;
        console.log("Result ============" +result);
        if (status === 1) {
            let jbody = json_.details_;
        
            console.log("jbody ============" +jbody);
            ///----Success
            if (jbody.length > 0) {

                
                let bod = "";
                for (var i = 0; i < jbody.length; i++) {
                    var uid = jbody[i].uid;
                    var category = jbody[i].category;
                    var title = jbody[i].title;
                    var description = jbody[i].description;
                    var price = jbody[i].price;
                    var image = jbody[i].image;


                    bod += " <a class=\"lvl\" onclick=\"select_level('" + uid + "','" + image + "')\" style=\"background-image: url('backgrounds/" + image + "')\">\n" +
                        "<span class=\"text fancy\">  " + title + " </span>\n" +
                        "</a>";


                }
                console.log("Body============" +bod);
                $('#decks_dload').html(bod);
               
            } else {
                console.log("No decks============" +bod);
                $('#decks_dload').html("No decks found");

            }

            
        } else {
            let details = "Details";
            ///---Error
            feedback("ERROR", "TOAST", ".feedback_", "Unable to load team list", 10);
        }
    });
}

function download_cards(deck, callback)
{

    /////-----------End of prepare pager

    let jso = {"where_":{"where_":"deck="+deck},"limit_":{"limit_":"0,200"}};

    crudaction(jso, "/cards_read.php", function(result) {
        console.log("Result ============"+result);
        console.log("Deck ============"+deck);
    
        let status = JSON.parse(result);
        let json_ = status.details_;
        
        $('#internet_decks').html("");
        var jstring = "{";
        for (var i = 0; i < json_.length; i++) {
            var content = json_[i].content;
            let num = i + 1;

            //  console.log(uid + "~" + content);
            jstring += '"' + num + '":"' + content + '",';
        }
        jstring = jstring.replace(/,\s*$/, "");
        jstring = jstring + "}";

        localStorage.setItem("n_current_deck", 'O' + deck);
        localStorage.setItem('n_O' + deck, jstring);

        callback();

    });

}


function loadstd(resource,feedbackdiv,params, callback=null)           /////x-fetch page name e.g. allnews.php,  >>> y-parameters e.g. ?id=x&category=c
{

    let server_ = server();
    let fields=params;
    $.ajax({
        method:'GET',
        url:server_+resource,
        data:fields,
        beforeSend:function()
        {
            $("#processing").show();
        },

        complete:function ()
        {
            $("#processing").hide();
        },
        success: function(feedback)
        {
            $(feedbackdiv).html(feedback);
            if(callback) {
                callback();
            }
        }


    });
}

function dbaction(resource,params, callback) {
    let server_ = server();
    let fields=params;
    $.ajax({
        method:'POST',
        url:server_+resource,
        data:fields,
        beforeSend:function()
        {
            $("#processing").show();
        },

        complete:function ()
        {
            $("#processing").hide();
        },
        success: function(feedback)
        {
            callback(feedback);
        },
        error: function (err) {
            callback(err);
        }


    });
}


function getRandom() {
    var rots = [];
    // rots[1] = "900,540,1";
    // rots[2] = "360,180,2";
    // rots[3] = "720,630,3";
    // rots[4] = "180,270,4";
    // rots[5] = "270,90,5";
    // rots[6] = "90,720,6";
    rots[1] = "360,2160,1";
    rots[2] = "1080,2340,2";
    rots[3] = "2520,630,3";
    rots[4] = "890,270,4";
    rots[5] = "630,1620,5";
    rots[6] = "90,90,6";

    // var min = 1;                      //////////////////Old way to get random
    // var max = 6;
    // var rand = Math.floor(Math.random() * max) + min;
    let sides = [1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6];  /////////////////New way to get random
    var rand = sides[Math.floor(Math.random() * sides.length)];
    localStorage.setItem("die_number", rand);
    var newcords = (rots[rand] + "," + rand).split(",");


    return newcords;
}
/////////////------Load die
function die_load() {
    // $('#die_').html('');
}

/////////////Initialize game play
function initialize() {

    ////Profile read
    //restart();
    let profile1 = localStorage.getItem('n_profile_1');
    let profile2 = localStorage.getItem('n_profile_2');

    let ncurrent_q = localStorage.getItem("ncurrent_q");
    if(!ncurrent_q){
        localStorage.setItem("ncurrent_q",0);
    }
    let bg = localStorage.getItem('bg_');
    localStorage.setItem("cango",'1');

    let music = localStorage.getItem("n_music");
    if(music){

    // playGameMusic(music);

    }
    else{
        // localStorage.setItem("n_music","ting.mp3");
        
    }


    if (profile1) {
        let prof1 = JSON.parse(profile1);
        let name = prof1['profile'].Name;
        let avatar = prof1['profile'].Avatar + ".png";
        $('#prof1').html("<a id=\"ply1\" class=\"ico\"><img id='ico1' src=\"graphics/" + avatar + "\"><br/> " + name + "</a>");
        $('.av1').html("<img id='ico1' src=\"graphics/" + avatar + "\">");
    }
    if (profile2) {
        let prof2 = JSON.parse(profile2);
        let name = prof2['profile'].Name;
        let avatar = prof2['profile'].Avatar + ".png";
        $('#prof2').html("<a id=\"ply2\" class=\"ico\"><img id='ico2' src=\"graphics/" + avatar + "\"><br/> " + name + "</a>");
        $('.av2').html("<img id='ico1' src=\"graphics/" + avatar + "\">");

    }
    if (bg) {
        $('body').css('background-image', 'url("backgrounds/' + bg + '")');
        console.log("==========="+bg)
    }
    else{
        $('body').css('background-image', 'url("backgrounds/default.jpg")');
    }
    ////---------Check game type

    //Set different Paths with different levels
   var gameLevel = localStorage.getItem("n_level");
  

   $('#Level_').text("Level "+gameLevel);
   console.log("=======================" +music);
   if(gameLevel === "1") {
     heartpath();
    checkGameType();
   }else if(gameLevel === "2") {
    spath();
    checkGameType();
   }else if(gameLevel === "3") {
    vpath();
    checkGameType();
   }else if(gameLevel === "4") {
    cpath();
     checkGameType();
   }else if(gameLevel === "5") {
    npath();
     checkGameType();
   }else if(gameLevel === "6") {
    zpath();
     checkGameType();
   }else if(gameLevel === "7"){
    upath();
    checkGameType();
   }else if(gameLevel === "8"){
    npath();
    checkGameType();
   }else if(gameLevel === "9"){
    zpath();
    checkGameType();
   }else if(gameLevel === "10"){
    heartpath();
    checkGameType();
   }else if(gameLevel === "11"){
    npath();
    checkGameType();
   }else if(gameLevel === "12"){
    twoPath();
    checkGameType();
   }else if(gameLevel === "13"){
    rhombusPath();
    checkGameType();
   }else if(gameLevel === "14"){
    trianglePath();
    checkGameType();
   }else if(gameLevel === "15"){
   threePath();
    checkGameType();
   }else{
    localStorage.setItem("n_level", "1");
    initialize();
   }


   function checkGameType() {
    let playtype = localStorage.getItem("NPlayType");
    if(playtype === 'ONLINE'){
        let localplayer = localStorage.getItem('NLocalPlayer');
        let turn = localStorage.getItem("n_turn");
        if(localplayer === turn){
            $('#cube').removeClass('cubedisabled');
        }
        else{
       $('#cube').addClass('cubedisabled');
       setTimeout(function () {
           play_status_check(1);
       },2000);

        }
        if(!localStorage.getItem("n_level")){
            localStorage.setItem("n_level", 1);
        }

    }
   }


    setTimeout(function () {
        ///////////////////Set player positions if they are not set
        if(!(localStorage.getItem("Playerpos1"))){
            localStorage.setItem("Playerpos1",0);
        }
        else{
            let pos1 = parseInt(localStorage.getItem("Playerpos1"));
            if(pos1 > 0) {
                player_move(1, pos1);
            }

        }
        if(!(localStorage.getItem("Playerpos2"))){
            localStorage.setItem("Playerpos2",0);
        }
        else{
            let pos2 = parseInt(localStorage.getItem("Playerpos2"));
            if(pos2 > 0) {
                player_move(2, pos2);
            }
        }

    },1000);

   turn_blob();
    ////////Coins
    points();

}

function selectMusicFromLocalStorage() {
  
}


function playGameMusic(TheMusic) {
     
        var audio = new Audio('sounds/'+TheMusic);
        audio.play();
         
}


function  turn_blob() ////////Indicate whose turn is playing
{
    let turn = localStorage.getItem("n_turn");
    if(turn === '1'){
        $('#ico1').addClass('blob');
        $('#ico2').removeClass('blob');
    }
    else if(turn === '2'){
        $('#ico2').addClass('blob');
        $('#ico1').removeClass('blob');
    }
    else{
        $('#ico1').addClass('blob');
        $('#ico2').removeClass('blob');
    }
 
}
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);

    let profile1 = readProfile(1);

    let name = profile1['profile'].Name;

    $temp.val(name+" has invited you to play NtarasiPlay with them. You can play online or download the app https://www.ntarasiplay.co.ke/invites.html?inv="+$(element).text()).select();
    document.execCommand("copy");
    toast("Copied!",2);
    $temp.remove();
}
////---------Comments loader
function prepare_comment_box() {
    localStorage.removeItem("n_max_message");
    $('#popup').fadeIn('slow');
    $('#overlay_dyn').html("<div id=\"allcomments_wrapper\" class=\"allcomments_wrapper\"><div id=\"all_comms\">Loading...</div><div id=\"q_info\"></div><div id=\"card0_\"  class='card_'></div> " +
        "" +
        "" +
        "\n" +
        "\n" +
        "    <div id=\"q_footer\"></div>\n" +
        "\n" +
        "    <div class=\"row\" id=\"reply_box\">\n" +
        "\n" +
        "\n" +
        "    </div></div> ");
    if((localStorage.getItem("NPlayType")) === 'ONLINE'){
        comments(offset=0, trial=1);
        $('#reply_box').html("<div class=\"col-10\"><textarea id=\"rep\" placeholder=\"Send message ...\"></textarea></div>\n" +
            "<div class=\"col-2\" id=\"sendbut\"><a id='sendreply' onclick=\"send_reply()\"><img src=\"graphics/arrow.png\" height=\"45px\"/> </a>\n" +
            "</div>");
    }
}

function points(winner=0){

    let profile1 = localStorage.getItem('n_profile_1');
    let profile2 = localStorage.getItem('n_profile_2');


    let level = localStorage.getItem("n_level");
    let full_profile1 = "";
    let full_profile2 = "";
    let hearts1 = "";
    let hearts2 = "";
    let name1 = name2 = avatar1 = avatar2 = "";

    let points_p1 = localStorage.getItem("n_coins_1");
    let points_p2 = localStorage.getItem("n_coins_2");
      if(!points_p1){
          localStorage.setItem("n_coins_1", 0);
      }
      if(!points_p2){
          localStorage.setItem("n_coins_2", 0);
      }

      
    setTimeout(function () {

    let Playerpos1 = localStorage.getItem("Playerpos1");
    let Playerpos2 = localStorage.getItem("Playerpos2");
    if((parseInt(Playerpos1) > 0) || (parseInt(Playerpos2) > 0)){
       console.log("Play Proceed");
    }
    else {

        if (profile1) {
            let prof1 = JSON.parse(profile1);
            name1 = prof1['profile'].Name;
            avatar1 = prof1['profile'].Avatar + ".png";
            let h1 = localStorage.getItem("n_coins_1");
            if (!h1) {
                h1 = 0;
            }
            full_profile1 = ("<a id=\"ply111\"><img id='233223' style='border-radius: 50%;padding: 5px; background: #ffffffc9; width: 100px;' src=\"graphics/" + avatar1 + "\"><br/> " + name1 + "</a>");
            hearts1 = "<img src=\"graphics/small-heart.png\"> " + h1;

        }
        if (profile2) {
            let prof2 = JSON.parse(profile2);
            name2 = prof2['profile'].Name;
            avatar2 = prof2['profile'].Avatar + ".png";
            let h2 = localStorage.getItem("n_coins_2");
            if (!h2) {
                h2 = 0;
            }
            full_profile2 = ("<a id=\"ply222\"><img id='8585845' style='border-radius: 50%; padding: 5px; background: #ffffffc9;  width: 100px;' src=\"graphics/" + avatar2 + "\"><br/> " + name2 + "</a>");
            hearts2 = "<img src=\"graphics/small-heart.png\"> " + h2;

        }
        $('#popup').fadeIn('slow');
        let pos1 = 0;
        let pos2 = 0;
        console.log("A winner is"+winner)
        let currentwinner = "";
        if ((parseInt(level)) > 1) {
             pos1 = parseInt(localStorage.getItem("Playerpos1"));
             pos2 = parseInt(localStorage.getItem("Playerpos2"));
            if (winner === 1) {
                currentwinner = "<span class='won'>" + name1 + " won the round" + "</span>";
            } else if(winner === 2) {
                currentwinner = "<span class='won'>" + name2 + " won the round" + "</span>";
            }
            else{
                currentwinner = "";
            }
        }
        $('#overlay_dyn').html("<div class='level'>" + currentwinner +
            "<h3>Playing Level <span style='color: #92D921;'>" + level + "</span></h3>" +
            "<table style='width: 100%;\n" +
            "    margin-top: 40px;'>" +
            "<tr><td colspan='2'> <h4>Vs</h4></td></tr>" +
            "<tr><td>" + full_profile1 + "</td> <td>" + full_profile2 + "</td></tr>" +
            "<tr><td>" + hearts1 + "</td><td>" + hearts2 + "</td></tr>" +
            "<tr><td> Current point: " + pos1 + "</td><td> Current point: " + pos2 + "</td></tr>" +
            "" +
            "</table>" +
            "<br/>" +
            "<span><img src='graphics/winner.png' height='40px'/> You win the level by reaching the highest point first</span></div>");

    }
    },1000);
}

function displayAdvert(advertLevel, part){
    let jso = {"where_":{"where_":"gameLevel='"+advertLevel+"' and part='"+part+"'"},"limit_":{"limit_":"0,1"}};
    crudaction(jso, "/advert_check.php",function (result) {
        let json_ = JSON.parse(result).details_;
        let caption =  json_[0].caption;
        let firstImage =  json_[0].firstImage;
        let secondImage =  json_[0].secondImage;
        let gameLevel =  json_[0].gameLevel;
        let advertTitle =  json_[0].advertTitle;
        let views =  json_[0].views;
        let id =  json_[0].id;

        newViews = parseInt(views)+1;
        console.log("I just got called");


        $('#popup').fadeIn('slow');

        $('#overlay_dyn').html("<div class='level'>" + "<h2>This is an Advert</h2>" +
        "<h3><span style='color: #92D921;'>" + advertTitle + "</span></h3>" +
        "<a>" + caption + "</p>" +
        "<br/>" +
        "<div class='col-sm-12' style='display: flex;'>"+
        "<img src='Adverts/Pictures/"+firstImage+"' width='50%'/>" +
        "<img src='Adverts/Pictures/"+secondImage+"' width='50%'/>  </div>");
       
        let params = "caption=" + caption + "&firstImage=" + firstImage + "&secondImage="+secondImage+"&gameLevel="+gameLevel+"&advertTitle="+advertTitle+"&views="+newViews+"&id="+id;
       
        //   console.log("Push object to server"+params);
           dbaction("/advert_Update.php", params, function (result) {

           })
     
    
    });

}

function comments(offset=0, trial=1){

    let profile1 = readProfile(1);
    let profile2 = readProfile(2);

    let avatar1 = profile1['profile'].Avatar + ".png";
    let avatar2 = profile2['profile'].Avatar + ".png";

    let local_player = localStorage.getItem("NLocalPlayer");
    let session_id = localStorage.getItem("nInviteCode");



    let jso = {"where_":{"where_":"sessionid='"+session_id+"' AND status = 1"},"limit_":{"limit_":""+offset+",10"}};
    crudaction(jso, "/chat.php",function (result) {
        //  console.log(result);
        let bod = "";
        let json_ = JSON.parse(result).details_;

        var mess = new Array();
        if(json_.length > 0) {
            for (var i = 0; i < json_.length; i++) {
                var uid = json_[i].uid;
                var feedback = json_[i].feedback;
                var player = parseInt(json_[i].player);
                var feeddate = json_[i].feedbackdate;
                let card = parseInt(json_[i].questionid);
                mess.push(uid);

                if(player === 1){
                    ico = avatar1;
                }
                else{
                    ico = avatar2;
                }
                //    console.log("card"+card);



                if(player === parseInt(local_player)){
                    bod = "<div  class=\"row comment_block\">\n" +
                        "        <div class=\"col-10 comm\"><span class=\"comm2 commalt\">"+feedback+" <br/> <span  class='time'>"+uid+feeddate+"</span></span> </div>\n" +
                        "        <div class=\"col-2\"><span class=\"av av2\"><img id=\"ico1\" src=\"graphics/" + ico + "\"></span></div>      \n" +
                        "        </div>"+bod;
                }
                else {

                    bod = "<div  class=\"row comment_block\">\n" +
                        "        <div class=\"col-2\"><span class=\"av av1\"><img id=\"ico1\" src=\"graphics/" + ico + "\"></span></div>\n" +
                        "        <div class=\"col-10 comm\"><span class=\"comm2\">" + feedback + "<br/><span class='time'>"+feeddate+"</span></span>  </div>\n" +
                        "\n" +
                        "         </div>"+bod;
                }
                if(card > 0){
                    let quiz = json_[i].question;
                    bod = "<div id=\"card"+uid+"_\" class=\"card_\"><h3>Let's talk about this:</h3>"+quiz+"</div>"+bod;
                    $('.card_'+card).css('display','none');
                }

            }

         //   console.log(mess[0]);
            let current_max = localStorage.getItem("n_max_message");
            if(!current_max){
                $('#all_comms').html(bod);
                setTimeout(function () {
                    scrollbottomdiv('allcomments_wrapper');
                },500);
            }
            else{
                if((parseInt(current_max)) >= mess[0]){
                       ////////////All comments shown
                    //  console.log("All comments "+current_max+"/"+mess[0]+"Shown");

                }
                else{
                    $('#all_comms').html(bod);
                    setTimeout(function () {
                        scrollbottomdiv('allcomments_wrapper');
                    },500);
                }
            }

            localStorage.setItem("n_max_message", mess[0]);


        }
        else{
            $('#all_comms').html("<span class='nohistory'>No Chat History ...</span>");
        }

        setTimeout(function () {
            comments(offset, trial+1);
            //   console.log("Reloading comments"+offset+"."+trial);
        },2000);

    });


}

function play_status_check(t) ///////Check status of the other player
{
  //  console.log("Checking  play state"+t);


    let turn = localStorage.getItem("n_turn");
    let local_player = localStorage.getItem("NLocalPlayer");

   
        let deck = localStorage.getItem("n_current_deck");
        let current_q = localStorage.getItem("ncurrent_q");

        let playerpos1 = localStorage.getItem("Playerpos1");
        let playerpos2 = localStorage.getItem("Playerpos2");

       let n_coins_1 = localStorage.getItem("n_coins_1");
       let n_coins_2 = localStorage.getItem("n_coins_2");

        let localPlayer = localStorage.getItem("NLocalPlayer");
        let currentq = localStorage.getItem("ncurrent_q");
        let n_turn = localStorage.getItem("n_turn");

        let n_level = localStorage.getItem("n_level");

        $('#Level_').text("Level "+n_level);
       ////Its the local player turn to listen
        let session_id = localStorage.getItem("nInviteCode");
        let jso = {"where_":{"where_":"sessionid='"+session_id+"'"},"limit_":{"limit_":"0,1"}};
        crudaction(jso, "/n_play_status_check.php",function (result) {
            let bod = "";
            let json_ = JSON.parse(result).details_;
            let player1_position =  json_[0].player1_position;
            let player2_position =  json_[0].player2_position;

            let player1_points = parseInt(json_[0].player1_points);
            let player2_points = parseInt(json_[0].player2_points);
            let turn =  json_[0].turn;
            let deck =  json_[0].deck;
            let card =  json_[0].card;
            let bg =  json_[0].bg;
            let current_level = json_[0].current_level;
            let current_winner = json_[0].last_winner;
            let die_number =  json_[0].die_number;
            let lasttransaction =  json_[0].lasttransaction;
            let status =  json_[0].status;
            let repeatLevel = json_[0].repeatLevel;

            console.log("Result"+result);

            

            if(parseInt(current_level) > parseInt(n_level)){

                let localbg = localStorage.getItem("bg_");
                if(localbg){
                    if(localbg !== bg){
                        localStorage.setItem("bg_",bg);
                        $('body').css('background-image',"url(backgrounds/"+bg+")");

                        points(parseInt(current_winner));
                        toast("Going to Next Level", 3);
                        localStorage.setItem("n_level",current_level);
                        player_move(1,0);
                        player_move(2,0);
                        reload();///Reload Page
                        initialize(); 
                    }
                }
                else
                {
                    localStorage.setItem("bg_",bg);
                    $('body').css('background-image',"url(backgrounds/"+bg+")");
                }
                localStorage.setItem("Playerpos2",0);
                localStorage.setItem("Playerpos1",0);
                localStorage.removeItem("Playerpos12");
                localStorage.removeItem("Playerpos11");
                localStorage.setItem("n_level",current_level);
                reload(); ///Reload Page
                toast("New Level", 3);
                player_move(1,0);
                player_move(2,0);
                setTimeout(function () {
                    initialize();
                },1000);

            }
            else
             {
                /////Sync background and music

                //////Sync player positions
                change_turn(turn);
                if (parseInt(player1_position) !== parseInt(playerpos1)) {
                    //   console.log("Players 1 not in sync. Sync now"+player1_position+","+playerpos1)
                    ////Players are not in sync
                    player_move(1, player1_position);
                    localStorage.setItem("Playerpos1", player1_position);
                }
                if (parseInt(player2_position) !== parseInt(playerpos2)) {
                    ////Players are not in sync
                    player_move(2, player2_position);
                    localStorage.setItem("Playerpos2", player2_position);
                }
                /////Sync Player Positions
                if (player1_points > parseInt(n_coins_1)) {
                    let diff = player1_points - parseInt(n_coins_1);
                    //    console.log("New points for player 1: Diff"+diff);
                    points_update(1, diff);
                }
                /////Update coins for player 2
                if (player2_points > parseInt(n_coins_2)) {
                    let diff = player2_points - parseInt(n_coins_2);
                    //  console.log("New points for player 2: Diff"+diff);
                    points_update(2, diff);
                }

                if(repeatLevel === n_level) {
                    localStorage.setItem("Playerpos1",0);
                    localStorage.setItem("Playerpos2",0);
                    localStorage.removeItem("Playerpos12");
                    localStorage.removeItem("Playerpos11");
                   initialize();
                }
                  
                if (bg !== localStorage.getItem("bg_")) {
                   
                    localStorage.setItem("bg_", bg);
                    
                }
                if(current_level != n_level){
                    localStorage.setItem("n_level", current_level);
                }
                //////Sync Pop cards
                if (turn === localPlayer) ////It;s local player chance, check if there is a new card popup
                {
                    //  console.log("Try sync card");
                    if (parseInt(current_q) !== parseInt(card)) {
                      //  console.log("They are out of sync. Show card for " + other_turn(turn));
                        localStorage.setItem("ncurrent_q", card);
                        ask_question(turn, card);
                    }
                    $('#cube').removeClass('cubedisabled');

                }

                if(parseInt(player1_position) > 19){
                    console.log("player1_position" + player1_position);
                    winner(1); 
                    localStorage.setItem("Playerpos1", parseInt(player1_position));  
                }
            
          
                if(parseInt(player2_position)  > 19){
                    console.log("player2_position" + player2_position);
                    winner(2);
                    localStorage.setItem("Playerpos2", parseInt(player2_position));  
                }

            }


            if(turn === localPlayer) //////It's your turn
            {
              //  console.log("Its your turn");
                localStorage.setItem("n_turn", turn);
                $('#cube').removeClass('cubedisabled');
                
            }
            else{
                //////Its still other players turn recheck after 2 seconds
                $('#cube').addClass('cubedisabled');
             // console.log("Its not your turn .... Rechecking...");
                setTimeout(function () {
                    play_status_check(t+1);
                },2000);

            }


        //    console.log(result);
        });
    

}

///////---------------Save status when someone plays
function play_status_save(quiz=0, gonext=0) {

  //  console.log("Update Online");
    $('#cube').addClass('cubedisabled');

    let local_player = localStorage.getItem("NLocalPlayer");
    let invitecode = localStorage.getItem("nInviteCode");
    let currentcard = localStorage.getItem("ncurrent_q");
    let turn = localStorage.getItem("n_turn");

    let die_number = localStorage.getItem("die_number");

    let bg = localStorage.getItem("bg_");
    let level = localStorage.getItem("n_level");
    let music = localStorage.getItem("n_music");

    let current_player_pos = 1;
    let current_player_points = 0;
    if(local_player === '1') {
         current_player_pos = localStorage.getItem("Playerpos1");
         current_player_points = localStorage.getItem("n_coins_1");
    }
    else if(local_player === '2'){
         current_player_pos = localStorage.getItem("Playerpos2");
        current_player_points = localStorage.getItem("n_coins_2");
    }

    let current_card_corrected = parseInt(currentcard);   /////FOr some reason, current card is one step behind

        let params = "local_player=" + local_player + "&sessionid=" + invitecode + "&current_player_pos="+current_player_pos+"&current_card="+current_card_corrected+"&die_number="+die_number+"&current_player_points="+current_player_points+"&bg="+bg+"&level="+level+"&music="+music+"&gonext="+gonext;
     //   console.log("Push object to server"+params);
        dbaction("/n_play_status_update.php", params, function (result) {
            if (result === "1") {
              //  console.log("Updated the other side");
                localStorage.setItem("n_turn", other_turn(turn));

                play_status_check(1);
            } else {
              setTimeout(function () {
                  console.log(result);
                  play_status_save();
              },2000);

            }

        });
        if(gonext === 1){
            reload(); ///Reload Page
        }

}




function next_question(){
    let current_player = localStorage.getItem("n_turn");
   // console.log("Question for player"+current_player)
    let p = readProfile(parseInt(current_player));
    let player_name = p['profile'].Name;
    let prof = readProfile(parseInt(current_player));
    let current_q = localStorage.getItem("ncurrent_q");
    let cardcurrent = 1;
    if(current_q){
        cardcurrent = parseInt(current_q);
    }
    else{
        localStorage.setItem("ncurrent_q",1);
    }


    let current_deck = localStorage.getItem("n_current_deck");
    if(current_deck){
        let cards = localStorage.getItem("n_"+current_deck);
        if(cards){
            let cards_obj = JSON.parse(cards);
            let q = cards_obj[cardcurrent+1];
            setTimeout(function () {
                let currentcard_fixed = cardcurrent+1
                $('#card0_').html(q).fadeIn('slow').addClass("card_"+currentcard_fixed);
                $('#q_info').html("A question for both of you");
                let NPlayType = localStorage.getItem("NPlayType");
                if(NPlayType === 'ONLINE'){
                    $('#q_footer').html("Please type a response below");
                }
                else{
                    $('#q_footer').html("Please give a verbal response...");
                }



            },1000);
            localStorage.setItem("ncurrent_q",cardcurrent+1);

        }
        else{
            ////-----Implement no cards in deck handler
        }

    }
    else{
        ////Implement no deck selected handler
    }

    comments();
    setTimeout(function () {
        scrollbottomdiv('allcomments_wrapper');
    },1000);
    return cardcurrent+1;
}

function winner(player) {
    let  player_winner = readProfile(player)['profile'].Name;

    $('#popup').fadeIn('fast');
    $('#overlay_dyn').html("");
    change_turn(other_turn(player));
    $('#overlay_dyn').html("<div class=\"winnerbox\"><h3>"+player_winner+" has won the round.</h3><h5> Discuss a reasonable gift for the winner.</h5><button class='nextbut' onclick=\"nextlevel();\">Next Level</button></div>");


}

function repeatlevel(){

    localStorage.setItem("Playerpos1",0);
    localStorage.setItem("Playerpos2",0);
    localStorage.removeItem("Playerpos12");
    localStorage.removeItem("Playerpos11");
    reload();
    // play_status_save();
    let playtype = localStorage.getItem("NPlayType");

    if(playtype === "ONLINE") {
        let local_player = localStorage.getItem("NLocalPlayer");
        if(local_player === '1') {
             current_player_pos = 0;
             current_player_points = 0;
        }
        else if(local_player === '2'){
             current_player_pos = 0;
            current_player_points = 0;
        }
        let level = localStorage.getItem("n_level");
        let invitecode = localStorage.getItem("nInviteCode");
        let currentcard = localStorage.getItem("ncurrent_q");
        let turn = localStorage.getItem("n_turn");
        let die_number = localStorage.getItem("die_number");
        let bg = localStorage.getItem("bg_");
        let music = localStorage.getItem("n_music");

    
        let params = "local_player=" + local_player + "&sessionid=" + invitecode + "&current_player_pos=0"+"&current_card="+currentcard+"&die_number="+die_number+
        "&current_player_points="+current_player_points+"&bg="+bg+"&level="+level+"&music="+music+"&gonext=2"+"&repeatLevel="+level;
        //Change Level In API
        dbaction("/n_play_status_update.php",params, function callback(result) {
            let theResponse_ = JSON.parse(result);
            
            console.log("Updated level on the other side");
            localStorage.setItem("n_turn", other_turn(turn));

            play_status_check(1);

        });
     }


}
function previousLevel(){

    localStorage.removeItem("Playerpos1", 0);
    localStorage.removeItem("Playerpos2", 0);
    let next = -1;
    let n_level = localStorage.getItem("n_level");
    let local_player = localStorage.getItem("NLocalPlayer");
    let invitecode = localStorage.getItem("nInviteCode");
    let currentcard = localStorage.getItem("ncurrent_q");
    let turn = localStorage.getItem("n_turn");

    let die_number = localStorage.getItem("die_number");
    if(n_level){
         next = parseInt(n_level) - 1;
        localStorage.setItem("n_level",next);
    }
    else{
        localStorage.setItem("n_level",1);
        next = 1;
    }
    
    let current_player_pos = 1;
    let current_player_points = 0;
    if(local_player === '1') {
         current_player_pos = localStorage.getItem("Playerpos1");
         current_player_points = localStorage.getItem("n_coins_1");
    }
    else if(local_player === '2'){
         current_player_pos = localStorage.getItem("Playerpos2");
        current_player_points = localStorage.getItem("n_coins_2");
    }

    localStorage.setItem("bg_","b"+next+".jpg");
    hideDiv('#popup');
    setTimeout(function () {
        localStorage.setItem("Playerpos1",0);
        localStorage.setItem("Playerpos2",0);
        localStorage.removeItem("Playerpos12");
        localStorage.removeItem("Playerpos11");

        initialize();
    },1000);
    setTimeout(function () {
        play_status_save(0,1);
        
    },2000);

    if(playtype === "ONLINE") {
        let params = "local_player=" + local_player + "&sessionid=" + invitecode + "&current_player_pos="+current_player_pos+"&current_card="+currentcard+"&die_number="+die_number+"&current_player_points="+current_player_points+"&bg="+bg+"&level="+next+"&music="+music+"&gonext=1";
        //Change Level In API
        dbaction("/n_play_status_update.php",params, function callback(result) {
            let theResponse_ = JSON.parse(result);
            
            console.log("Updated level on the other side");
            localStorage.setItem("n_turn", other_turn(turn));

            play_status_check(1);

        });
     }

}

function nextlevel() {

    localStorage.removeItem("Playerpos1", 0);
    localStorage.removeItem("Playerpos2", 0);
    let next = 2;
    let n_level = localStorage.getItem("n_level");

    let local_player = localStorage.getItem("NLocalPlayer");
    let invitecode = localStorage.getItem("nInviteCode");
    let currentcard = localStorage.getItem("ncurrent_q");
    let turn = localStorage.getItem("n_turn");

    let die_number = localStorage.getItem("die_number");


    if(n_level=== "1") {
        localStorage.setItem("bg_","b"+2+".jpg");
    }else{
        let levelGamePic = parseInt(n_level) +1;
        localStorage.setItem("bg_","b"+levelGamePic+".jpg");
    }
    
    let bg = localStorage.getItem("bg_");

    let music = localStorage.getItem("n_music");

    let current_player_pos = 1;
    let current_player_points = 0;
    if(local_player === '1') {
         current_player_pos = localStorage.getItem("Playerpos1");
         current_player_points = localStorage.getItem("n_coins_1");
    }
    else if(local_player === '2'){
         current_player_pos = localStorage.getItem("Playerpos2");
        current_player_points = localStorage.getItem("n_coins_2");
    }

    if(n_level){
         next = parseInt(n_level) + 1;
         let playtype = localStorage.getItem("NPlayType");

        if(playtype === "OFFLINE") {
            localStorage.setItem("n_level", next);
            initialize();
        }

         if(playtype === "ONLINE") {
            let params = "local_player=" + local_player + "&sessionid=" + invitecode + "&current_player_pos="+current_player_pos+"&current_card="+currentcard+"&die_number="+die_number+"&current_player_points="+current_player_points+"&bg="+bg+"&level="+next+"&music="+music+"&gonext=1";
            //Change Level In API
            dbaction("/n_play_status_update.php",params, function callback(result) {
                let theResponse_ = JSON.parse(result);
                
                console.log("Updated level on the other side");
                localStorage.setItem("n_turn", other_turn(turn));

                play_status_check(1);

            });
         }
        
    }
    else{
        localStorage.setItem("n_level",2);
        next = 2;
    }

    localStorage.setItem("bg_","b"+next+".jpg");
    hideDiv('#popup');
    setTimeout(function () {
        localStorage.setItem("Playerpos1",0);
        localStorage.setItem("Playerpos2",0);
        localStorage.removeItem("Playerpos12");
        localStorage.removeItem("Playerpos11");

        initialize();
    },1000);
    setTimeout(function () {
        play_status_save(0,1);
        
    },2000);

}

function full_profile_display(player) {
    let  player_details = readProfile(player);
    let player_name = player_details['profile'].Name;
    let avatar = player_details['profile'].Avatar;
    let img = "<img src=\"graphics/" + avatar + ".png\" height='30px'>";

    return img+" "+player_name;
}
function points_update(player, total) {
    let profile = readProfile(player);
       let name = profile['profile'].Name;
     boommessage(""+total+" hearts for "+name);
    let current_count = localStorage.getItem("n_coins_"+player);
    if(!current_count){current_count = 0;}
    $('#coincount'+player+'_').html(total+parseInt(current_count));
    localStorage.setItem("n_coins_"+player, total+parseInt(current_count));

}

function boommessage(message) {
    $('#boom_').html(message).css('display','block').css('opacity','1');

    $('#boom_').animate({
        fontSize: "3em"
    }, 1000);

    setTimeout(function () {
        $( "#boom_" ).animate({
            opacity: 0,
            fontSize: "5em"
        }, 1000, function() {
            // Animation complete.
            $('#boom_').css('display','none');
            $('#boom_').html("").css("font-size","1em");

        });
    },3000);

}

function heartpath() {
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"-70,184\" style=\"bottom: -70px;left: 184px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"-60,139\" style=\"bottom: -60px;left: 139px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"-38,84\" style=\"bottom: -38px;left: 84px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"1,40\" style=\"bottom: 1px;left: 40px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"52,18\" style=\"bottom: 52px;left: 18px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"110,10\" style=\"bottom: 110px;left: 10px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"157,23\" style=\"bottom: 157px;left: 23px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"206,56\" style=\"bottom: 206px;left: 56px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"206,113\" style=\"bottom: 206px;left: 113px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"160,153\" style=\"bottom: 160px;left: 153px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"205,189\" style=\"bottom: 205px;left: 189px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"206,242\" style=\"bottom: 206px;left: 242px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"169,283\" style=\"bottom: 169px;left: 283px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"110,304\" style=\"bottom: 110px;left: 304px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"52,296\" style=\"bottom: 52px;left: 296px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"1,269\" style=\"bottom: 1px;left: 269px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"-38,230\" style=\"bottom: -39px;left: 230px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"6,189\" style=\"bottom: 6px;left: 189px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"54,153\" style=\"bottom: 54px;left: 153px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"110,153\" style=\"bottom: 110px;left: 153px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}

function spath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"-60,23\" style=\"bottom: -60px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"-75,75\" style=\"bottom: -75px;left: 75px;background-color: #0c6794; \">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"-68,130\" style=\"bottom: -68px;left: 130px;background-color: #0c6794; \">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"-45,179\" style=\"bottom: -45px;left: 179px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"1,210\" style=\"bottom: 1px;left: 210px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"54,210\" style=\"bottom: 54px;left: 210px;background-color: #0c6794; \">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"90,180\" style=\"bottom: 90px;left: 180px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"120,140\" style=\"bottom: 120px;left: 140px;background-color: #316e41; \">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"130,90\" style=\"bottom: 130px;left: 90px;background-color: #ed143d; \">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"160,45\" style=\"bottom: 160px;left: 45px;background-color: #ed143d; \">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"200,25\" style=\"bottom: 200px;left: 25px;background-color: #316e41; \">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"250,25\" style=\"bottom: 250px;left: 25px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"300,40\" style=\"bottom: 300px;left: 40px;background-color: #316e41; \">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"325,85\" style=\"bottom: 325px;left: 85px;background-color: #316e41; \">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"335,134\" style=\"bottom: 335px;left: 134px;background-color: #316e41; \">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"339,180\" style=\"bottom: 339px;left: 180px;background-color: #ed143d; \">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"339,230\" style=\"bottom: 339px;left: 230px;background-color: #ed143d; \">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"320,270\" style=\"bottom: 320px;left: 270px;background-color: #ed143d; \">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"280,290\" style=\"bottom: 280px;left: 290px;background-color: #ed143d; \">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"230,290\" style=\"bottom: 230px;left: 290px;background-color: #ed143d; \">20</div>";

    $('#stage_').html(ico);
}

function cpath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"240,312\" style=\"bottom: 240px;left: 312px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"240,264\" style=\"bottom: 240px;left: 264px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"240,216\" style=\"bottom: 240px;left: 216px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"240,168\" style=\"bottom: 240px;left: 168px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"240,118\" style=\"bottom: 240px;left: 118px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"240,70\" style=\"bottom: 240px;left: 70px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"240,23\" style=\"bottom: 240px;left: 23px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"195,23\" style=\"bottom: 195px;left: 23px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"150,23\" style=\"bottom: 150px;left: 23px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"105,23\" style=\"bottom: 105px;left: 23px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"65,23\" style=\"bottom: 65px;left: 23px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"20,23\" style=\"bottom: 20px;left: 23px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"-25,23\" style=\"bottom: -25px;left: 23px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"-70,23\" style=\"bottom: -70px;left: 23px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"-70,70\" style=\"bottom: -70px;left: 70px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"-70,118\" style=\"bottom: -70px;left: 118px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"-70,168\" style=\"bottom: -70px;left: 168px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"-70,216\" style=\"bottom: -70px;left: 216px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"-70,264\" style=\"bottom: -70px;left: 264px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"-70,312\" style=\"bottom: -70px;left: 312px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}

function npath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"-70,23\" style=\"bottom: -70px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"-25,23\" style=\"bottom: -25px;left: 23px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"20,23\" style=\"bottom: 20px;left: 23px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"65,23\" style=\"bottom: 65px;left: 23px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"105,23\" style=\"bottom: 105px;left: 23px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"150,23\" style=\"bottom: 150px;left: 23px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"195,23\" style=\"bottom: 195px;left: 23px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"240,23\" style=\"bottom: 240px;left: 23px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"240,70\" style=\"bottom: 240px;left: 70px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"240,118\" style=\"bottom: 240px;left: 118px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"240,168\" style=\"bottom: 240px;left: 168px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"240,216\" style=\"bottom: 240px;left: 216px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"240,264\" style=\"bottom: 240px;left: 264px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"195,264\" style=\"bottom: 195px;left: 264px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"150,264\" style=\"bottom: 150px;left: 264px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"105,264\" style=\"bottom: 105px;left: 264px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"65,264\" style=\"bottom: 65px;left: 264px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"20,264\" style=\"bottom: 20px;left: 264px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"-25,264\" style=\"bottom: -25px;left: 264px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"-70,264\" style=\"bottom: -70px;left: 264px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}
function vpath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"325,23\" style=\"bottom: 325px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"285,33\" style=\"bottom: 285px;left: 33px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"250,43\" style=\"bottom: 250px;left: 43px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"205,53\" style=\"bottom: 205px;left: 53px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"160,63\" style=\"bottom: 160px;left: 63px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"115,73\" style=\"bottom: 115px;left: 73px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"70,83\" style=\"bottom: 70px;left: 83px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"25,93\" style=\"bottom: 25px;left: 93px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"-15,103\" style=\"bottom: -15px;left: 103px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"-60,113\" style=\"bottom: -60px;left: 113px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"-60,153\" style=\"bottom: -60px;left: 153px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"-15,163\" style=\"bottom: -15px;left: 163px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"25,173\" style=\"bottom: 25px;left: 173px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"70,183\" style=\"bottom: 70px;left: 183px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"115,193\" style=\"bottom: 115px;left: 193px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"160,203\" style=\"bottom: 160px;left: 203px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"205,213\" style=\"bottom: 205px;left: 213px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"250,223\" style=\"bottom: 250px;left: 223px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"280,233\" style=\"bottom: 285px;left: 233px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"335,243\" style=\"bottom: 325px;left: 243px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}
function upath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"240,23\" style=\"bottom: 240px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"195,23\" style=\"bottom: 195px;left: 23px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"150,23\" style=\"bottom: 150px;left: 23px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"105,23\" style=\"bottom: 105px;left: 23px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"65,23\" style=\"bottom: 65px;left: 23px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"20,23\" style=\"bottom: 20px;left: 23px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"-25,23\" style=\"bottom: -25px;left: 23px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"-70,23\" style=\"bottom: -70px;left: 23px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"-70,70\" style=\"bottom: -70px;left: 70px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"-70,115\" style=\"bottom: -70px;left: 115px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"-70,165\" style=\"bottom: -70px;left: 165px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"-70,215\" style=\"bottom: -70px;left: 215px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"-70,264\" style=\"bottom: -70px;left: 264px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"-25,264\" style=\"bottom: -25px;left: 264px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"20,264\" style=\"bottom: 20px;left: 264px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"65,264\" style=\"bottom: 65px;left: 264px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"105,264\" style=\"bottom: 105px;left: 264px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"150,264\" style=\"bottom: 150px;left: 264px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"195,264\" style=\"bottom: 195px;left: 264px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"240,264\" style=\"bottom: 240px;left: 264px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}
function trianglePath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"-70,216\" style=\"bottom: -70px;left: 216px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"-20,180\" style=\"bottom: -20px;left: 180px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"20,148\" style=\"bottom: 20px;left: 148px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"65,118\" style=\"bottom: 65px;left: 118px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"105,93\" style=\"bottom: 105px;left: 93px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"150,63\" style=\"bottom: 150px;left: 63px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"193,33\" style=\"bottom: 195px;left: 33px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"240,23\" style=\"bottom: 240px;left: 23px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"240,70\" style=\"bottom: 240px;left: 70px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"240,118\" style=\"bottom: 240px;left: 118px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"240,168\" style=\"bottom: 240px;left: 168px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"240,216\" style=\"bottom: 240px;left: 216px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"240,264\" style=\"bottom: 240px;left: 264px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"195,264\" style=\"bottom: 195px;left: 264px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"150,264\" style=\"bottom: 150px;left: 264px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"105,264\" style=\"bottom: 105px;left: 264px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"65,264\" style=\"bottom: 65px;left: 264px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"20,264\" style=\"bottom: 20px;left: 264px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"-25,264\" style=\"bottom: -25px;left: 264px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"-70,264\" style=\"bottom: -70px;left: 264px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}

function zpath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"240,23\" style=\"bottom: 240px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"240,70\" style=\"bottom: 240px;left: 70px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"240,118\" style=\"bottom: 240px;left: 118px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"240,168\" style=\"bottom: 240px;left: 168px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"240,218\" style=\"bottom: 240px;left: 218px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"240,264\" style=\"bottom: 240px;left: 264px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"205,240\" style=\"bottom: 205px;left: 240px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"170,213\" style=\"bottom: 170px;left: 213px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"140,183\" style=\"bottom: 140px;left: 183px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"100,150\" style=\"bottom: 100px;left: 150px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"70,115\" style=\"bottom: 70px;left: 115px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"40,85\" style=\"bottom: 40px;left: 85px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"1,60\" style=\"bottom: 1px;left: 60px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"32,35\" style=\"bottom: -32px;left: 35px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"-70,23\" style=\"bottom: -70px;left: 23px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"-70,70\" style=\"bottom: -70px;left: 70px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"-70,118\" style=\"bottom: -70px;left: 118px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"-70,168\" style=\"bottom: -70px;left: 168px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"-70,220\" style=\"bottom: -70px;left: 220px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"-70,272\" style=\"bottom: -70px;left: 272px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}

function rhombusPath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"100,23\" style=\"bottom: 100px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"130,50\" style=\"bottom: 130px;left: 50px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"160,80\" style=\"bottom: 160px;left: 80px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"190,110\" style=\"bottom: 190px;left: 110px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"220,140\" style=\"bottom: 220px;left: 140px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"220,180\" style=\"bottom: 220px;left: 180px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"190,210\" style=\"bottom: 190px;left: 210px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"160,240\" style=\"bottom: 160px;left: 240px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"130,270\" style=\"bottom: 130px;left: 270px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"100,300\" style=\"bottom: 100px;left: 300px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"60,300\" style=\"bottom: 60px;left: 300px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"30,270\" style=\"bottom: 30px;left: 270px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"1,240\" style=\"bottom: 1px;left: 240px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"-32,210\" style=\"bottom: -32px;left: 210px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"-60,168\" style=\"bottom: -60px;left: 168px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"-60,128\" style=\"bottom: -60px;left: 128px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"-32,100\" style=\"bottom: -32px;left: 100px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"-1,70\" style=\"bottom: -1px;left: 70px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"30,40\" style=\"bottom: 30px;left: 40px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"60,10\" style=\"bottom: 60px;left: 10px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}
function threePath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"240,23\" style=\"bottom: 240px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"240,70\" style=\"bottom: 240px;left: 70px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"240,118\" style=\"bottom: 240px;left: 118px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"240,168\" style=\"bottom: 240px;left: 168px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"240,218\" style=\"bottom: 240px;left: 218px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"240,264\" style=\"bottom: 240px;left: 264px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"205,240\" style=\"bottom: 205px;left: 240px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"170,213\" style=\"bottom: 170px;left: 213px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"140,183\" style=\"bottom: 140px;left: 183px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"100,150\" style=\"bottom: 100px;left: 150px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"60,120\" style=\"bottom: 60px;left: 120px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"40,160\" style=\"bottom: 40px;left: 160px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"1,195\" style=\"bottom: 1px;left: 195px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"32,240\" style=\"bottom: -32px;left: 240px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"-70,272\" style=\"bottom: -70px;left: 273px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"-70,220\" style=\"bottom: -70px;left: 220px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"-70,168\" style=\"bottom: -70px;left: 168px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"-70,118\" style=\"bottom: -70px;left: 118px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"-70,70\" style=\"bottom: -70px;left: 70px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"-70,23\" style=\"bottom: -70px;left: 23px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}

function twoPath(){
    let ico = "";

    let color = randomcolor();
    ["#ed143d","#316e41","#0c6794"];
    ico+="<div class=\"mine\" id=\"m1\" name=\"190,23\" style=\"bottom: 190px;left: 23px;background-color: #0c6794;\">1</div>";
    ico+="<div class=\"mine\" id=\"m2\" name=\"220,50\" style=\"bottom: 220px;left: 50px;background-color: #0c6794;\">2</div>";
    ico+="<div class=\"mine\" id=\"m3\" name=\"240,90\" style=\"bottom: 240px;left: 90px;background-color: #0c6794;\">3</div>";
    ico+="<div class=\"mine\" id=\"m4\" name=\"250,138\" style=\"bottom: 250px;left: 138px;background-color: #0c6794;\">4</div>";
    ico+="<div class=\"mine\" id=\"m5\" name=\"240,190\" style=\"bottom: 240px;left: 190px;background-color: #0c6794;\">5</div>";
    ico+="<div class=\"mine\" id=\"m6\" name=\"205,230\" style=\"bottom: 205px;left: 230px;background-color: #0c6794;\">6</div>";
    ico+="<div class=\"mine\" id=\"m7\" name=\"160,240\" style=\"bottom: 160px;left: 240px;background-color: #0c6794;\">7</div>";
    ico+="<div class=\"mine\" id=\"m8\" name=\"120,230\" style=\"bottom: 120px;left: 230px;background-color: #316e41;\">8</div>";
    ico+="<div class=\"mine\" id=\"m9\" name=\"90,210\" style=\"bottom: 90px;left: 210px;background-color: #ed143d;\">9</div>";
    ico+="<div class=\"mine\" id=\"m10\" name=\"70,180\" style=\"bottom: 70px;left: 180px;background-color: #ed143d;\">10</div>";

    ico+="<div class=\"mine\" id=\"m11\" name=\"40,150\" style=\"bottom: 40px;left: 150px;background-color: #316e41;\">11</div>";
    ico+="<div class=\"mine\" id=\"m12\" name=\"20,120\" style=\"bottom: 20px;left: 120px;background-color: #316e41;\">12</div>";
    ico+="<div class=\"mine\" id=\"m13\" name=\"1,85\" style=\"bottom: 1px;left: 85px;background-color: #316e41;\">13</div>";
    ico+="<div class=\"mine\" id=\"m14\" name=\"32,55\" style=\"bottom: -32px;left: 55px;background-color: #316e41;\">14</div>";
    ico+="<div class=\"mine\" id=\"m15\" name=\"-70,23\" style=\"bottom: -70px;left: 23px;background-color: #316e41;\">15</div>";
    ico+="<div class=\"mine\" id=\"m16\" name=\"-70,70\" style=\"bottom: -70px;left: 70px;background-color: #ed143d;\">16</div>";
    ico+="<div class=\"mine\" id=\"m17\" name=\"-70,118\" style=\"bottom: -70px;left: 118px;background-color: #ed143d;\">17</div>";
    ico+="<div class=\"mine\" id=\"m18\" name=\"-70,168\" style=\"bottom: -70px;left: 168px;background-color: #ed143d;\">18</div>";
    ico+="<div class=\"mine\" id=\"m19\" name=\"-70,220\" style=\"bottom: -70px;left: 220px;background-color: #ed143d;\">19</div>";
    ico+="<div class=\"mine\" id=\"m20\" name=\"-70,272\" style=\"bottom: -70px;left: 272px;background-color: #ed143d;\">20</div>";

    $('#stage_').html(ico);
}

function randomIntFromInterval(min, max) { // min and max included
    let random = Math.floor(Math.random() * (max - min + 1) + min);
   // console.log(random);
    return random;
}

function randomalphanum(length){
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
}

function dieroll(n,sync=false, plyer = null) {
    sound('DIE_ROLL');

  //  console.log("Role complete turn"+plyer);
    let cango = localStorage.getItem("cango"); /////Prevent double firing event
    let NPlayType = localStorage.getItem("NPlayType");
    if(cango === '1') {
    // console.log("User can go");
        localStorage.setItem("cango",'0');
        let turn = localStorage.getItem('n_turn');
        if(plyer){
            turn = plyer;
        }
        if(!turn){turn = 1;}
      //  console.log("Turn playing"+turn);
        let player = 1;
        if (turn) {
            if (turn === '1') {
                player = 1;
            } else if (turn === '2') {
                player = 2;
            } else {
                player = 1;
            }
        } else {
            player = 1;
        }

        let next = 1;
        if (player === 1) {
            next = 2;
        } else {
            next = 1;
        }
        if(NPlayType !== 'ONLINE') {
            localStorage.setItem('n_turn', next);
          //  console.log("Next turn is" + next);
        }
        let newpos = localStorage.getItem('die_number');

        if (newpos) {

        } else {
            newpos = 0;
        }
        let current = localStorage.getItem('Playerpos' + player);
        if(!current){
            current = 0;
        }
        let finalpos = parseInt(newpos) + parseInt(current);
        if(!finalpos){
            finalpos = 0;
        }

      //  console.log("Final POS"+finalpos);
        if (current) {
            localStorage.setItem("Playerpos" + player, finalpos);
        } else {
            localStorage.setItem('Playerpos' + player, newpos);
        }
        let pos = $('#m'+finalpos).attr('name');//"24,23"
        
        if(!pos || pos=== undefined) {
            pos= $('#m20').attr('name');
           }


      //Call the advert   
      let playerpos1 = localStorage.getItem("Playerpos1");
      let playerpos2 = localStorage.getItem("Playerpos2");
      let level = localStorage.getItem("n_level");
   
        let theadvert = "";
        let gosync = true;
        if(NPlayType !== 'ONLINE') {
            if(playerpos1){
                if((parseInt(playerpos1)) > 20){
                    theadvert = "Reject";
                    winner(1);
                    gosync = false;
                }
            }
            if(playerpos2){
                if((parseInt(playerpos2)) > 20){
                    theadvert = "Reject";
                    winner(2);
                    gosync = false;
                }
            }
        }


            console.log("POS"+pos);
            let cord = pos.split(",");
            let x = cord[0];
            let y = cord[1];

            let shift = 0;
            if(player === 1){
             shift = -25;
            }
            else{
              shift = 25;
            }

            $('#prof' + player).css('left', '0');

            move_('#ply' + player,parseInt(y)+shift, x, 1500, function () {
                sound('MOVE');
                $('#prof' + player).css('position', 'absolute');
                let playtype = localStorage.getItem("NPlayType");

                let random = null;

                if(playtype === 'ONLINE' && sync === false) {
                     random = reward(parseInt(n));
                }
                else{
                     random = reward();
                }
                let result = random['reward'];
                let value = random['value'];
                let quiznext = 0;

              //console.log("Roll reward"+result+"From"+n);
              let playerpos1 = localStorage.getItem("Playerpos1");
              let playerpos2 = localStorage.getItem("Playerpos2");
              let level = localStorage.getItem("n_level");

              //Prevent cards after a win on offline play
              if(theadvert === "Reject") {
                result = 'GO_BACK';
              }

              if(playerpos1 && playerpos2 && level) {
                if(playerpos1=== "9" || playerpos1 === "10" || playerpos2=== "10" || playerpos2 === "9" ) {
                    result = 'GO_BACK';
                    displayAdvert(parseInt(level),1);
             
                }else if(playerpos1=== "18" || playerpos1 === "19" || playerpos2=== "18" || playerpos2 === "19") {
                    result = 'GO_BACK';
                    displayAdvert(parseInt(level),2);  
                }
              } 

                if(result === 'POINTS'){
                    points_update(parseInt(turn),value);
                }
                else if(result === 'QUIZ'){
                    prepare_comment_box();
                    // comments();
                    quiznext = next_question();
                }
                else if(result === 'GO_BACK'){
                 //   move_('#ply' + player,parseInt(y)+shift, x, 1500, function () {
                  //      $('#prof' + player).css('position', 'absolute');
                  //  });
                }

                /////////--------------If its online game, update online
                let NPlayType = localStorage.getItem("NPlayType");
                if(NPlayType === 'ONLINE'){
                    if(sync === true && gosync === true) {
                        play_status_save(quiznext);
                    }
                }

            });




    }
    localStorage.setItem("cango",'0');
    setTimeout(function () {
        localStorage.setItem("cango",'1');
    },1000);

}

//////////////PICK AN EVENT CAUSED BY DIE ROLE. e.g give points, pick card
function reward(no=null){
    let res = {};
    res.reward = "QUIZ";
    res.value = 0;
    if(!no) {
        no = randomIntFromInterval(1, 2);
    }
   // console.log("Reward no"+no);
    if(no === 0 || no === 2 || no === 4 || no === 6 || no === 8 || no === 9 || no === 10)
       {
           res.reward = "QUIZ";
           res.value = no;
       }
    else if(no === 1 || no === 3)
       {
           res.reward = "POINTS";
           res.value = no*10;
       }
    else if(no === 5 || no === 7)
        {
        res.reward = "POINTS";
        res.value = no*10;
        }
    else if(no === 5 || no === 7)
        {
        res.reward = "GO_BACK";
        res.value = no;
        }
    else{
        res.reward = "NONE";
        res.value = no;
        }

    return res;

}

function restart() {
        localStorage.setItem("Playerpos1" , "1");
        localStorage.setItem("Playerpos2" , "1");
        localStorage.setItem("n_turn" , "1");

}


/////-----Random colors
function randomcolor() {

    let colors = ["#ed143d","#316e41","#0c6794"];
    return  colors[Math.floor(Math.random() * colors.length)];
}


///////////////////////
function crudaction(jsonbody, url, callback) ////////------Reusable
{
    let server_ = server();


    $.ajax({
        url: server_ + url,
        method: "post",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "dataType": "json"
        },
        dataType: 'json',
        data: JSON.stringify(jsonbody),

        success: function (result) {
            callback(result);
        },
        beforeSend: function () {
            // Handle the beforeSend event
            $("#loader").fadeIn();
        },
        error: function (err) {
               console.log(err);
            callback(err);
        },
        complete: function () {
            // Handle the complete event
            $("#loader").fadeOut();
        }
    });
}

function toast(message, tim = 3) {
    $('#toast').fadeIn("fast").html(message);
    setTimeout(function () {
        $('#toast').fadeOut("slow").html(message);
    }, 1000 * tim);
}


function showhide(sho, hid) {
    $(sho).css('display', 'none');
    $(hid).fadeIn('fast');
}

function move_(element, x, y, time, callback) {
    //  var currentX = ($(element).css('left')).replace("px","");   //////---Get the current X position of element in whole number
    //  var currentY = ($(element).css('bottom')).replace("px","");    //////---Get the current Y position of element in whole number

    $(element).animate({
            left: x,
            bottom: y
        }, time, function () {
            callback();
        },
    );

    let points_p1 = localStorage.getItem("n_coins_1");
    let points_p2 = localStorage.getItem("n_coins_2");
    //Set Points and Level   
    $('#Level_').text("Level "+localStorage.getItem("n_level"));
    $('#coincount1_').text(points_p1);
    $('#coincount2_').text(points_p2);
}

function hideDiv(x) {
    $(x).fadeOut('fast');
}
function showDiv(x) {
    $(x).fadeIn('fast');
}
function scrollbottomdiv(divid) {
    var objDiv = document.getElementById(divid);
    objDiv.scrollTop = objDiv.scrollHeight;
}

function messages_() {
    showDiv('#popup');
    scrollbottomdiv('all_comms');

}

function send_reply() {

    let rep = $('#rep').val().trim();

    if(rep) {
        $('#sendreply').prop('disabled', true);
        let session_id = localStorage.getItem("nInviteCode");
        let player = localStorage.getItem("NLocalPlayer");
        let deck = localStorage.getItem("n_current_deck");
        let questionid = localStorage.getItem("ncurrent_q");

        let question = "";
        if(deck) {
            let cards = localStorage.getItem("n_" + deck);
         //   console.log("Caaards"+cards);
            if (cards) {
                let cards_obj = JSON.parse(cards);
                 question = cards_obj[questionid];

            }
        }
        let feedback = rep;
        let personal = 0;

        let params = "session_id=" + session_id + "&player=" + player + "&deck=" + deck + "&questionid=" + questionid + "&feedback=" + feedback + "&its_personal=" + personal+"&question="+question;

        dbaction("/chat_new.php", params, function (result) {
            if (result === "1") {
                $('#rep').val("");
                scrollbottomdiv('all_comms');
                comments(offset=0, trial=1);
            } else {

                toast(result, 3);
            }
            $('#sendreply').prop('disabled', false);
        });


    }
}

function invite_code(){
    /////-----------Generate random code
    let rand = randomalphanum(5);
    $('#invcode_').html(rand);

    $('#invbox').html(" <a href=\"whatsapp://send?text=Please play Ntarasi Game with me. Click this link https://www.ntarasiplay.co.ke/invites.html?inv="+rand+"\"       data-action=\"share/whatsapp/share\"\n" +
        "target=\"_blank\"> <img src=\"graphics/whatsapp.png\" height=\"32px\"> WhatsApp </a> ----- <a onclick=\"window.open('mailto:test@example.com?subject=Invitation&body=Please play Ntarasi Game with me. Click this link https://www.ntarasiplay.co.ke/invites.html?inv="+rand+"');\"> <img src=\"graphics/mail.png\" height=\"32px\"> Mail </a>");

    /////-----------save local
    localStorage.setItem("nInviteCode",rand);
    /////-----------save online
    saveInviteOnline(rand);
    checkinvite_status();
}


///////--------Check if an invite is available
function invite_check(inv, callback = null) {
    if(inv){
        let nInviteCode = localStorage.getItem("nInviteCode");

        if(nInviteCode === inv){
          let red = redirectoldgame();
          if(red === true){

          }
          else{
              clearGame();
              invite_check(inv, callback);
          }
        }
        else {
            clearTheGame();
            let params = "inv=" + inv;
            dbaction("/check_invite.php", params, function (feedback) {

                console.log(feedback);

                let feed = JSON.parse(feedback);
                let res = parseInt(feed.result_);
                let details = feed.details_;
                let deck = feed.deck_;

                if (res === 1) {
                    if (deck) {
                        let name = details['profile']['Name'];
                        let avatar = details['profile']['Avatar'];
                        let img = "<img src=\"graphics/" + avatar + ".png\" height='30px'>"

                        $('#profile_').val(JSON.stringify(details));
                        $('#deck_').val(deck);

                        if (callback) {
                            callback();
                        }


                        $('#inv_message').html(img + " " + name + " has invited you to play Ntarasi");
                    } else {
                        $('#inv_message').html("There is a problem with the deck the user chose, please request user to make a fresh invite");
                    }
                } else {
                    $('#inv_message').html(details);
                }
            });
        }
    }
    else{
    $('#inv_message').html("The Invitation is invalid");
    }
}

function prepare_accept(inv= null) {

    if(!inv) {
        const urlParams = new URLSearchParams(window.location.search);
        inv = urlParams.get('inv');
    }

    if(inv){
        invite_check(inv, function () {
            setTimeout(function () {
                accept_invite(inv);
            }, 500);
        });
    }



}

///////-------Accept invite
function accept_invite(inv = null) {


    if(!inv) {
        const urlParams = new URLSearchParams(window.location.search);
        inv = urlParams.get('inv');
    }

    /////---------Clear local variables
    //clearGame();
    localStorage.setItem("NPlayType","ONLINE");
    localStorage.setItem("NLocalPlayer","2");
    localStorage.setItem("nInviteCode",inv);
    localStorage.removeItem("n_profile_1");
    localStorage.removeItem("n_profile_2");
 
    ////------Set the deck
    let deck = $('#deck_').val();
    let profile1 = $('#profile_').val();
    download_cards(deck, function () {
        localStorage.setItem("n_profile_1" , profile1);
        module_profile();
    });
    ////------Set player 1 profile

    ////---------Set Profile


    ////---------Go to Gameplay


}

/////////////Save invite code online
function saveInviteOnline(rand) {
    let player1 = localStorage.getItem("n_profile_1");
    let d = localStorage.getItem("n_current_deck");
    let deck  = d.substr(1);
    let params = "rand="+rand+"&player1="+player1+"&deck="+deck;
 //  console.log(rand);

    dbaction( "/save_invite.php",params, function (result) {

      // console.log(result);

    });


}

//////////Check invite acceptance status
function checkinvite_status() {
    let code = localStorage.getItem("nInviteCode");
    let params = "inv="+code;
    dbaction("/check_invite_status.php",params,function (feedback) {

        console.log("Check Invite Pending Status"+feedback);

        let feed = JSON.parse(feedback);
        let res = parseInt(feed.result_);
        let details = feed.details_;

        if(res === 1){ //////Invite has been accepted
                let profile2 = JSON.stringify(details);
                localStorage.setItem("n_profile_2", profile2);
            $('#invite_result').html(profile2);
            redirect("gameplay.html");

        }else {
            $('#invite_result').html(details);
            setTimeout(function () {
                checkinvite_status();
            },3000);

        }
    });
}
//////////Check total messages
function messages_count(c){
    let code = localStorage.getItem("nInviteCode");
    let jso = {"where_":{"where_":"sessionid='"+code+"' AND status = 1"},"limit_":{"limit_":"0,10"}};
        crudaction(jso, "/chat_count.php",function (feedback) {
     //   console.log("Message count"+c+"Feedback"+JSON.stringify(feedback));


        let feed = JSON.parse(feedback);
        let res = parseInt(feed.result_);
        let details = parseInt(feed.details_);
        console.log("Messages Count"+details);
        let lcount = 0;

        let n_latest_read = localStorage.getItem("n_latest_read");
        if(n_latest_read){
             lcount = parseInt(n_latest_read);
            if(lcount >= details )
            {
                console.log("No new message");
            }
            else
            {
              //
                console.log("New message alert");
                localStorage.setItem("n_latest_read", details);
                sound("NEW_MESSAGE");
                let boxval = $('#popup').css('display');
                    if(boxval === 'none') {
                        prepare_comment_box();
                    }
            }
        }
        else{
            localStorage.setItem("n_latest_read", details);
           // console.log("New message alert");
            sound("NEW_MESSAGE");
        }

        if(res === 1){ //////Total messages
           $('#new_mess_count').text(details-lcount);
        }else {
            $('#new_mess_count').text("");
        }
        setTimeout(function () {
            messages_count(c+1);
        },3000);
    });

}

//////True random
function rand(min, max){
    return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
}

// Helper rand
function rollRands(min, max, rolls) {
    let roll = 0, n = 0;
    let counts = {};

    for(let i = min; i <= max; i++){
        counts[i]=0
    }

    while (roll < rolls){
        roll++;
        counts[rand(min,max)]++;
    }
    return counts;
}

function other_turn(t){
    if((parseInt(t)) === 1){
        return 2;
    }
    else if((parseInt(t)) === 2){
        return 1;
    }
    else {
        return 2;
    }

}

//////Check if there is a pending old game

function check_old_game() {
    let playtype = localStorage.getItem("NPlayType");
    let playcode = localStorage.getItem("nInviteCode");
    let NLocalPlayer = localStorage.getItem("NLocalPlayer");

    if(playtype === 'ONLINE' && playcode){
        if(NLocalPlayer === "1") {
            checkinvite_status(); /////This is player 1
        }
        else{

            //////Check local player
            clearTheGame();
            let profile2 = localStorage.getItem("n_profile_2");
            if(NLocalPlayer === '2' && profile2){
                redirect("gameplay.html");
            }

        }
    }

}

function redirectoldgame() {
   let n_profile_2 = localStorage.getItem("n_profile_2");
   let n_profile_1 =  localStorage.getItem("n_profile_1");
   let nInviteCode =     localStorage.getItem("nInviteCode");
   let n_current_deck =  localStorage.getItem("n_current_deck");
   let n_level = localStorage.getItem("n_level");
   let NPlayType = localStorage.getItem("NPlayType");

   
   
   if(n_profile_1 && n_profile_2 && n_profile_2 && n_current_deck  && n_level && NPlayType){

       redirect("gameplay.html");
       return true;

   }
   else{
       return false;
   }
}

function sound(type){
    if(type === 'NEW_MESSAGE'){
        var audio = new Audio('sounds/ting.mp3');
        audio.play();
    }
    else if(type === 'DIE_ROLL'){
        var audio = new Audio('sounds/die_roll.mp3');
        audio.play();
    }
    else if(type === 'MOVE'){
        var audio = new Audio('sounds/movement.mp3');
        audio.play();
    }
}



function clearGame() {
    ///------Save points
    localStorage.removeItem("n_profile_2");
    localStorage.removeItem("n_music");
    localStorage.removeItem("n_profile_1");
    localStorage.removeItem("Playerpos1");
    localStorage.removeItem("Playerpos2");
    localStorage.removeItem("n_turn");
    localStorage.removeItem("NPlayType");
    localStorage.removeItem("nInviteCode");
    localStorage.removeItem("NLocalPlayer");
    localStorage.removeItem("ncurrent_q");
    localStorage.removeItem("die_number");
    localStorage.removeItem("n_current_deck");
    localStorage.removeItem("n_latest_read");
    localStorage.removeItem("bg_");
    localStorage.removeItem("Playerpos12");
    localStorage.removeItem("Playerpos11");
    localStorage.removeItem("n_level");
    localStorage.removeItem("cango");
    localStorage.removeItem("n_coins_1");
    localStorage.removeItem("n_coins_2");



    redirect("index.html");
    
}

function clearTheGame() {
    ///------Save points
    localStorage.removeItem("n_profile_2");
    localStorage.removeItem("n_music");
    localStorage.removeItem("n_profile_1");
    localStorage.removeItem("Playerpos1");
    localStorage.removeItem("Playerpos2");
    localStorage.removeItem("n_turn");
    localStorage.removeItem("NPlayType");
    localStorage.removeItem("nInviteCode");
    localStorage.removeItem("NLocalPlayer");
    localStorage.removeItem("ncurrent_q");
    localStorage.removeItem("die_number");
    localStorage.removeItem("n_current_deck");
    localStorage.removeItem("n_latest_read");
    localStorage.removeItem("bg_");
    localStorage.removeItem("Playerpos12");
    localStorage.removeItem("Playerpos11");
    localStorage.removeItem("n_level");
    localStorage.removeItem("cango");
    localStorage.removeItem("n_coins_1");
    localStorage.removeItem("n_coins_2");

    
}

////////////Move a local player to a point
function player_move(player, finalpos){
  //  console.log("Player "+player+" Move"+finalpos);
    let pos = $('#m'+finalpos).attr('name');
    if(pos) {
        let cord = pos.split(",");
        let x = cord[0];
        let y = cord[1];

        let shift = 0;
        if (player === 1) {
            shift = -25;
        } else {
            shift = 25;
        }

        $('#prof' + player).css('left', '0');

        move_('#ply' + player, parseInt(y) + shift, x, 1500, function () {
            sound('MOVE');
            $('#prof' + player).css('position', 'absolute');
            localStorage.setItem("Playerpos1" + player, pos);

        });
    }
    else{
        setTimeout(function () {
            player_move(player, finalpos)
        },1000);
    }
}


///////Popup a question for local player
function  ask_question(player, question) {
  //  console.log("WIll pop up box soon");
    prepare_comment_box();
    comments();
    let current_deck = localStorage.getItem("n_current_deck");
    if(current_deck){
        let cards = localStorage.getItem("n_"+current_deck);
        if(cards){
            let cards_obj = JSON.parse(cards);
            let q = cards_obj[question];
            setTimeout(function () {
                $('#card0_').html(q).fadeIn('slow').addClass("card_"+question);
                $('#q_info').html("A question for both of you");

            },10);


        }
        else{
            ////-----Implement no cards in deck handler
        }

    }
  //  comments();

}

function change_turn(turn){
   // console.log("Changing turn to player"+turn);
    let t = parseInt(turn);
    let local_player = localStorage.getItem("NLocalPlayer");
    let NPlayType = localStorage.getItem("NPlayType");
    let l_player = 0;
    if(local_player){
        l_player = parseInt(local_player);
    }

    localStorage.setItem("n_turn", turn);
    if(NPlayType === 'ONLINE') {
      //  console.log("Turn"+t+"LocalPlayer"+l_player);
        if (t === l_player) {
            $('#cube').removeClass('cubedisabled');
        } else {
            $('#cube').addClass('cubedisabled');
        }
    }
   turn_blob();

}

function test(){
    let deck = localStorage.getItem("n_current_deck");

    let questionid = localStorage.getItem("ncurrent_q");

    let question = "";
    if(deck) {
        let cards = localStorage.getItem("n_" + deck);

        if (cards) {
            let cards_obj = JSON.parse(cards);
            question = cards_obj[questionid];

        }
    }


}

function reload(){
    location.reload();
}

