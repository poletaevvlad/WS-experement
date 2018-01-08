var track_guids = ["track1"]

var Track = function(guid){
	this.guid = guid;
	this.loaded = false;
}

Track.prototype.load = function(){
	function getXmlHttp(){
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			} catch (ee) {
			}
		}
		if (typeof XMLHttpRequest!='undefined') {
			return new XMLHttpRequest();
	   }
	}

	var that = this;
	var xmlHttp = getXmlHttp();
	xmlHttp.open("GET", "/tracks/" + this.guid + ".json");
	xmlHttp.onreadystatechange = function(){
		if (xmlHttp.readyState == 4){
			if (xmlHttp.status == 200){
				that.loaded = true;				
				var obj = JSON.parse(xmlHttp.responseText);
				that.name = obj["name"];
				that.width = obj["width"];
				that.height = obj["height"];
				that.data = obj["data"];
				that.start = obj["startPoint"];
				that.runPoints = obj["runPoints"];

				if (that.guid in localStorage){
					that.played = true;
					that.bestTime = parseFloat(localStorage[that.guid]);
				}else{
					that.played = false;
				}

				that.onFinishLoading();
			}else{
				that.loaded = false;
				that.onFailedLoading();
			}
		}

	}
	xmlHttp.send(null);
}

Track.prototype.saveScore = function(time){
	if (!this.played || this.bestTime > time){
		localStorage[this.guid] = time.toString();

		var container = document.getElementById("mm2_tracks_list");
		for (var i = 0; i < container.children.length; i++){
			var element = container.children[i];
			if (element.attributes["data-track"].value == this.guid){
				var seconds = (time | 0) % 60;
				var minutes = (time / 60) | 0;
				var sseconds = (time - (time | 0)) * 100 | 0;
				element.children[element.children.length-1].innerHTML = "Best time: "+minutes+":"+seconds+"."+sseconds;				
			}
		} 
	}
}

Track.prototype.onFinishLoading = function(){ }
Track.prototype.onFailedLoading = function(){ }



function loadTracks(tracks){
	var result = [];
	var i=0;
	function onLoad(){
		result.push(this);
		i++;
		trackLoaded(this);
		if (i < tracks.length){
			var track = new Track(tracks[i]);
			track.onFinishLoading = onLoad;
			track.load();
		}
	}
	var track1 = new Track(tracks[i]);
	track1.onFinishLoading = onLoad;
	track1.load();
	return result;
}

var tracks = [];

var track_names = [
	"basics1", 
	"basics2", 
	"infinity", 
	"intersection", 
	"loop", 
	"only_forward1", 
	"only_forward2", 
	"choose_a_path"
];

function initLoadTracks(){
	tracks = loadTracks(track_names); 
}