var app = {
    sockets: null,
    connectionCode: "",
    state: "",
    connectionInstructionShown: false,
    track: null,
    currentControllerLayout: "track_selection"
}

app.onGetConnectionCode = function(code){
    this.connectionCode = code;
    var elements = document.getElementsByClassName("connection_code");
    for (ei in elements){
        elements[ei].innerHTML = this.connectionCode;
    }
}

app.setControllerLayout = function(layout){
    this.currentControllerLayout = layout;
    this.sockets.ws.send("layout "+layout);
}

app.showAlert = function(el_id){
    document.getElementById(el_id).classList.add("alert_shown");
}

app.hideAlert = function(el_id){
    document.getElementById(el_id).classList.remove("alert_shown");
}

app.init = function(){
    initLoadTracks();

    app.sockets = new Socket();

    app.sockets.onHandshakeCompleted = function(){
        app.onGetConnectionCode(app.sockets.code);
    }

    app.sockets.onControllerConnected = function(){
        if (!app.connectionInstructionShown){
            document.getElementById("main_menu").classList.add("connection_complete");
            app.state = "levelSelection";
            app.setControllerLayout("track_selection");
            app.connectionInstructionShown = true;
        }else{
            app.setControllerLayout(app.currentControllerLayout);
        }
        app.hideAlert("alert_controller_disconnected");
    }

    app.sockets.onControllerDisconnected = function(){
        app.showAlert("alert_controller_disconnected")
    }

    app.sockets.onDisconnected = function(){
        app.showAlert("alert_disconnected");
    }

    initTrackSelection();

    app.sockets.registerHandler("game_terminate", function(){
        app.display.remove();
        app.display = null;
        document.getElementById("main_menu").classList.remove("track_selected");
        app.hideAlert("alert_completed");
        app.setControllerLayout("track_selection");
    })

    app.sockets.registerHandler("replay_track", function(){
        app.display.remove();
        app.display = new PaperDisplay();
        app.display.displayTrack(app.track);
        app.hideAlert("alert_completed");
        app.setControllerLayout("gamepad");
    })

    document.getElementById("about_button").addEventListener("click", function(){
        app.showAlert("alert_about");
    })

    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++){
        var div = divs[i];
        if (div.classList.contains("alert_close")){
            div.addEventListener("click", function(){
                var alertBox = this.parentElement;
                app.hideAlert(alertBox.id);
            })
        }
    }

    fitCanvas();
}



// --- Level selection ---

function selectedTrack(){
    var tracks = document.getElementById("mm2_tracks_list");
    var ci = 0;
    while (ci < tracks.children.length && 
        ! tracks.children[ci].classList.contains("mm2_track_selected")){
        ci++;
    } 
    if (ci < tracks.children.length){
        return ci;
    }else{
        return -1;
    }
}

function deselectTrack(i){
    var tracks = document.getElementById("mm2_tracks_list");
    tracks.children[i].classList.remove("mm2_track_selected");

}

function selectTrack(i){
    var tracks = document.getElementById("mm2_tracks_list");
    tracks.children[i].classList.add("mm2_track_selected");

    var x = 528 * i;
    var cont = document.getElementById("mm2_tracks");
    cont.style.marginLeft = -x+"px";
}

function previousTrack(){
    var s = selectedTrack()
    if (s > 0){
        deselectTrack(s);
        selectTrack(s - 1);
    }
}

function nextTrack(){
    var tracks = document.getElementById("mm2_tracks_list");
    var s = selectedTrack();
    if (s != -1 && s < tracks.children.length-1){
        deselectTrack(s);
        selectTrack(s + 1); 
    }
}

function runTrack(){
    var i = selectedTrack();
    var track_div = document.getElementById("mm2_tracks_list").children[i];
    var guid = track_div.attributes["data-track"].value;
    document.getElementById("main_menu").classList.add("track_selected");
    var i = 0;
    while (i < tracks.length && tracks[i].guid != guid){
        i++;
    }
    app.display = new PaperDisplay();
    app.display.displayTrack(tracks[i]);
    app.track = tracks[i];
    app.state = "game";

    app.setControllerLayout("gamepad");
}

function initTrackSelection(){
    app.sockets.registerHandler("track_previous", previousTrack);
    app.sockets.registerHandler("track_next", nextTrack);
    app.sockets.registerHandler("select_track", runTrack);
}

window.onkeydown = function(e){
    if (app.state == "levelSelection"){
        if (e.keyIdentifier == "Right"){
            nextTrack(); 
        }else if (e.keyIdentifier == "Left"){
            previousTrack();
        }else if (e.keyIdentifier == "Up"){
            runTrack();
        }
    }
}


function trackLoaded(track){
    var container = document.getElementById("mm2_tracks_list");

    var track_div = document.createElement("div");
    track_div.classList.add("mm2_track");
    if (container.children.length == 0){
        track_div.classList.add("mm2_track_selected");
    }
    container.appendChild(track_div);
    track_div.setAttribute("data-track", track.guid);

    var map = document.createElement("div");
    map.classList.add("mm2_track_map");
    track_div.appendChild(map);

    var map_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    map_svg.setAttribute("width", 200);
    map_svg.setAttribute("height", 170);
    map.appendChild(map_svg);

    var xScale = (200 - 40) / track.width;
    var yScale = (170 - 40) / track.height;
    var scale = (xScale < yScale) ? xScale : yScale;

    var map_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    map_path.setAttribute("d", track.data);
    map_path.setAttribute("fill", "none");
    map_path.setAttribute("stroke", "#66B60A");
    map_path.setAttribute("stroke-width", 3 / scale);
    map_path.setAttribute("transform", "translate(" + (200 - scale*track.width)/2 + "," + (170 - scale*track.height)/2 +") scale("+scale+")")
    map_svg.appendChild(map_path);
    
    var name = document.createElement("div");
    name.classList.add("mm2_track_name");
    name.innerHTML = track.name;
    track_div.appendChild(name);

    var stat = document.createElement("div");
    stat.classList.add("mm2_track_stat");
    track_div.appendChild(stat);
    if (track.played){
        var time = track.bestTime;
        var seconds = (time | 0) % 60;
        var minutes = (time / 60) | 0;
        var sseconds = (time - (time | 0)) * 100 | 0;

        stat.innerHTML = "Best time: "+minutes+":"+seconds+"."+sseconds;
    }else{
        stat.innerHTML = "Not played yet.";     
    }
}


function fitCanvas(){
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.style.width = window.innerWidth + "px";
    paper.view.width = window.innerWidth;

    canvas.height = window.innerHeight;
    canvas.style.height = window.innerHeight + "px";
    paper.view.height = window.innerHeight;
}

window.addEventListener("resize", fitCanvas);

document.ontouchmove = function(event){
    event.preventDefault();
}