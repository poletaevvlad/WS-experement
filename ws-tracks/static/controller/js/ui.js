var BUTTON_RADIUS = 3;

// --------------------
//		Level selection
// --------------------

var trackSelectionLayout = {
	previousButton: null,
	previousButtonIcon: null,

	nextButton: null,
	nextButtonIcon: null,

	selectButton: null,
	selectButtonIcon:null,

	init: function(){
		this.previousButton = new Path.Rectangle({
			height: 90,
			width: 90,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.previousButton.bounds.center = view.bounds.center + new Point(-120, 0);
		this.previousButton.active = false;
		this.previousButton.touchId = 0;
		this.previousButton.onclickCommand = "track_previous";

		this.previousButtonIcon = new Path();
		this.previousButtonIcon.add(this.previousButton.bounds.center + new Point(10, -15));
		this.previousButtonIcon.add(this.previousButton.bounds.center + new Point(-10, 0));
		this.previousButtonIcon.add(this.previousButton.bounds.center + new Point(10, 15));
		this.previousButtonIcon.strokeWidth = 3;
		this.previousButtonIcon.strokeColor = "#417505";
		this.previousButtonIcon.strokeCap = "round";
		this.previousButtonIcon.strokeJoin = "round";

		this.nextButton = new Path.Rectangle({
			height: 90,
			width: 90,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.nextButton.bounds.center = view.bounds.center + new Point(120, 0);
		this.nextButton.active = false;
		this.nextButton.touchId = 0;
		this.nextButton.onclickCommand = "track_next";

		this.nextButtonIcon = new Path();
		this.nextButtonIcon.add(this.nextButton.bounds.center + new Point(-10, -15));
		this.nextButtonIcon.add(this.nextButton.bounds.center + new Point(10, 0));
		this.nextButtonIcon.add(this.nextButton.bounds.center + new Point(-10, 15));
		this.nextButtonIcon.strokeWidth = 3;
		this.nextButtonIcon.strokeColor = "#417505";
		this.nextButtonIcon.strokeCap = "round";
		this.nextButtonIcon.strokeJoin = "round";

		this.selectButton = new Path.Rectangle({
			height: 90,
			width: 90,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.selectButton.bounds.center = view.bounds.center;
		this.selectButton.active = false;
		this.selectButton.touchId = 0;
		this.selectButton.onclickCommand = "select_track";

		this.selectButtonIcon = new Path();
		this.selectButtonIcon.add(this.selectButton.bounds.center + new Point(0, 15));
		this.selectButtonIcon.add(this.selectButton.bounds.center + new Point(0, -15));
		this.selectButtonIcon.add(this.selectButton.bounds.center + new Point(-13, 0));
		this.selectButtonIcon.add(this.selectButton.bounds.center + new Point(0, -15));
		this.selectButtonIcon.add(this.selectButton.bounds.center + new Point(13, 0));
		this.selectButtonIcon.strokeWidth = 3;
		this.selectButtonIcon.strokeColor = "#417505";
		this.selectButtonIcon.strokeCap = "round";
		this.selectButtonIcon.strokeJoin = "round";

		this.buttons = [this.previousButton, this.nextButton, this.selectButton];
	},

	remove: function(){
		this.previousButton.remove();
		this.nextButton.remove();
		this.selectButton.remove();
		this.previousButtonIcon.remove();
		this.nextButtonIcon.remove();
		this.selectButtonIcon.remove();
	},

	resize: function(){
		this.nextButton.bounds.center = view.bounds.center + new Point(120, 0);
		this.nextButtonIcon.bounds.center = this.nextButton.bounds.center;

		this.selectButton.bounds.center = view.bounds.center;
		this.selectButtonIcon.bounds.center = this.selectButton.bounds.center;

		this.previousButton.bounds.center = view.bounds.center + new Point(-120, 0);
		this.previousButtonIcon.bounds.center = this.previousButton.bounds.center;
	},

	handleTouchStart: function(e){
		for (touchi in e.changedTouches){
			var touch = e.changedTouches[touchi];
			var touchPoint = new Point(touch.clientX, touch.clientY);
			for (buttoni in this.buttons){
				var button = this.buttons[buttoni];
				if (!button.active && button.contains(touchPoint)){
					button.active = true;
					button.touchId = touch.identifier;
					button.fillColor = "#ccc";
					view.draw();
				}
			}
		}
	},

	handleTouchMove: function(e){
		for (touchi in e.changedTouches){
			var touch = e.changedTouches[touchi];
			var touchPoint = new Point(touch.clientX, touch.clientY);
			for (buttoni in this.buttons){
				var button = this.buttons[buttoni];
				if (button.active && (button.touchId == touch.identifier) && !button.contains(touchPoint)){
					button.active = false;
					button.fillColor = "#E7E7E7";
					view.draw();
				}
			}
		}
	},

	handleTouchEnd: function(e){
		for (touchi in e.changedTouches){
			var touch = e.changedTouches[touchi];
			var touchPoint = new Point(touch.clientX, touch.clientY);
			for (buttoni in this.buttons){
				var button = this.buttons[buttoni];
				if (button.active && (button.touchId == touch.identifier)){
					button.active = false;
					button.fillColor = "#E7E7E7";
					view.draw();
					if (typeof button.onclickCommand != "undefined"){
						sockets.ws.send(button.onclickCommand);
					}
				}
			}
		}
	}
}


// -----------------
//		Gamepad 
// -----------------

var gamepadLayout = {
	accelerationButton: null,
	accelerationButtonIcon: null,

	decelerationButton: null,
	decelerationButtonIcon: null,

	thumbstickBackground: null,
	thumbstickIndicator: null,
	thumbstickLine: null,
	thumbstickVector: new Point(0, 0),

	backButton: null,
	backButtonIcon: null,

	previouslySend: 0,

	init: function(){
		this.accelerationButton = new Path.Rectangle({
			height: 60,
			width: 60,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.accelerationButton.bounds.center = new Point(70, view.size.height - 130);
		this.accelerationButton.active = false;
		this.accelerationButton.touchId = 0;
		this.accelerationButton.onstartmessage = "accelerationBegin";
		this.accelerationButton.onendmessage = "accelerationEnd";

		this.accelerationButtonIcon = new Path();
		this.accelerationButtonIcon.add(this.accelerationButton.bounds.center + new Point(-12, 8));
		this.accelerationButtonIcon.add(this.accelerationButton.bounds.center + new Point(0, -8));
		this.accelerationButtonIcon.add(this.accelerationButton.bounds.center + new Point(12, 8));
		this.accelerationButtonIcon.strokeColor = "#417505";
		this.accelerationButtonIcon.strokeWidth = 3;
		this.accelerationButtonIcon.strokeCap = "round";
		this.accelerationButtonIcon.strokeJoin = "round";
		this.accelerationButtonIcon.bounds.center = this.accelerationButton.bounds.center;

		this.decelerationButton = new Path.Rectangle({
			height: 60,
			width: 60,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.decelerationButton.bounds.center = new Point(140, view.size.height - 60);
		this.decelerationButton.active = false;
		this.decelerationButton.touchId = 0;
		this.decelerationButton.onstartmessage = "decelerationBegin";
		this.decelerationButton.onendmessage = "decelerationEnd";

		this.decelerationButtonIcon = new Path();
		this.decelerationButtonIcon.add(this.decelerationButton.bounds.center + new Point(-12, -8));
		this.decelerationButtonIcon.add(this.decelerationButton.bounds.center + new Point(0, 8));
		this.decelerationButtonIcon.add(this.decelerationButton.bounds.center + new Point(12, -8));
		this.decelerationButtonIcon.strokeColor = "#417505";
		this.decelerationButtonIcon.strokeWidth = 3;
		this.decelerationButtonIcon.strokeCap = "round";
		this.decelerationButtonIcon.strokeJoin = "round";
		this.decelerationButtonIcon.bounds.center = this.decelerationButton.bounds.center;

		this.backButton = new Path.Rectangle({
			width: 40,
			height: 40,
			x: 20,
			y: 20,
			fillColor: "#E7E7E7"
		})
		this.backButton.onendmessage = "game_terminate";

		this.backButtonIcon = new Path();
		this.backButtonIcon.add(this.backButton.bounds.center + new Point(5, -8));
		this.backButtonIcon.add(this.backButton.bounds.center + new Point(-5, 0));
		this.backButtonIcon.add(this.backButton.bounds.center + new Point(5, 8));
		this.backButtonIcon.strokeColor = "#417505";
		this.backButtonIcon.strokeWidth = 3;
		this.backButtonIcon.strokeCap = "round";
		this.backButtonIcon.strokeJoin = "round"

		this.buttons = [this.accelerationButton, this.decelerationButton, this.backButton];


		this.thumbstickBackground = new Path.Circle({
			radius: 75,
			fillColor: "#E7E7E7"
		});
		this.thumbstickBackground.bounds.center = new Point(view.size.width - 95, view.size.height - 95);

		this.thumbstickLine = new Path();
		this.thumbstickLine.strokeColor = "#417505";
		this.thumbstickLine.strokeWidth = 3;
		this.thumbstickLine.strokeCap = "round";

		this.thumbstickIndicator = new Path.Circle({
			radius: 16,
			fillColor: "#FFFFFF",
			strokeColor: "#417505",
			strokeWidth: 3
		})
		this.thumbstickIndicator.bounds.center = this.thumbstickBackground.bounds.center;
	},

	repositionIndicator: function(point){
		var vector = this.thumbstickBackground.bounds.center - point;
		this.thumbstickVector = vector;
		if (! this.nosend){
			var angle = vector.angle - 90;
			angle = ((angle / 5) | 0) * 5;
			if (angle != this.previouslySend){
				sockets.ws.send("a " + (angle | 0));
				this.previouslySend = angle;
			}
		}
		this.thumbstickIndicator.bounds.center = point;

		// this.thumbstickLine.removeSegments();
		// this.thumbstickLine.add(this.thumbstickIndicator.bounds.center);
		// this.thumbstickLine.add(this.thumbstickBackground.bounds.center);
	},

	reset: function(){
		this.nosend = true;
		this.repositionIndicator(this.thumbstickBackground.bounds.center);
		this.nosend = false;
	},

	remove: function(){
		this.reset();
		this.accelerationButton.remove();
		this.accelerationButtonIcon.remove();
		this.decelerationButton.remove();
		this.decelerationButtonIcon.remove();
		this.thumbstickBackground.remove();
		this.thumbstickIndicator.remove();
		this.thumbstickLine.remove();
		this.backButton.remove();
		this.backButtonIcon.remove();
	},

	resize: function(){
		this.accelerationButton.bounds.center = new Point(70, view.size.height - 130);
		this.decelerationButton.bounds.center = new Point(140, view.size.height - 60);
		
		this.thumbstickBackground.bounds.center = new Point(view.size.width - 95, view.size.height - 95);
		this.thumbstickIndicator.bounds.center = this.thumbstickBackground.bounds.center - this.thumbstickVector;

		this.decelerationButtonIcon.bounds.center = this.decelerationButton.bounds.center;
		this.accelerationButtonIcon.bounds.center = this.accelerationButton.bounds.center;
	},

	handleTouchStart: function(e){
		for (touchi in e.changedTouches){
			var touch = e.changedTouches[touchi];
			var touchPoint = new Point(touch.clientX, touch.clientY);
			if (this.thumbstickBackground.contains(touchPoint) && !this.thumbstickBackground.activeMoving){
				this.thumbstickBackground.activeMoving = true;
				this.thumbstickBackground.activeTouch = touch.identifier;
				this.repositionIndicator(touchPoint);
			}else{
				for (buttoni in this.buttons){
					var button = this.buttons[buttoni];
					if (!button.active && button.contains(touchPoint)){
						button.active = true;
						button.touchId = touch.identifier;
						button.fillColor = "#ccc";
						view.draw();
						if (typeof button.onstartmessage != "undefined"){
							sockets.ws.send(button.onstartmessage);
						}
					}
				}
			}
		}
	},

	handleTouchMove: function(e){
		for (touchi in e.changedTouches){
			var touch = e.changedTouches[touchi];
			var touchPoint = new Point(touch.clientX, touch.clientY);

			if (this.thumbstickBackground.activeMoving && this.thumbstickBackground.activeTouch == touch.identifier){
				var vector = touchPoint - this.thumbstickBackground.bounds.center;
				var radius = this.thumbstickBackground.bounds.width / 2;
				vector.length = (vector.length > radius) ? radius : vector.length;
				this.repositionIndicator(this.thumbstickBackground.bounds.center + vector);
			}else{
				for (buttoni in this.buttons){
					var button = this.buttons[buttoni];
					if (button.active && (button.touchId == touch.identifier) && !button.contains(touchPoint)){
						button.active = false;
						button.fillColor = "#E7E7E7";
						view.draw();
						if (typeof button.onendmessage != "undefined"){
							sockets.ws.send(button.onendmessage);
						}

					}
				}
			}
		}
	},

	handleTouchEnd: function(e){
		for (touchi in e.changedTouches){
			var touch = e.changedTouches[touchi];
			var touchPoint = new Point(touch.clientX, touch.clientY);
			if (this.thumbstickBackground.activeMoving && this.thumbstickBackground.activeTouch == touch.identifier){
				this.thumbstickBackground.activeMoving = false;
				this.reset();
			}else{
				for (buttoni in this.buttons){
					var button = this.buttons[buttoni];
					if (button.active && (button.touchId == touch.identifier)){
						button.active = false;
						button.fillColor = "#E7E7E7";
						view.draw();
						if (typeof button.onendmessage != "undefined"){
							sockets.ws.send(button.onendmessage);
						}
					}
				}
			}
		}
	}
}

// -----------------
//		Gameover
// -----------------

var gameoverLayout = {

	replayButton: null,
	replayButtonText:null,

	menuButton: null,
	menuButtonText: null,

	init: function(){
		this.replayButton = new Path.Rectangle({
			height: 50,
			width: 220,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.replayButton.bounds.center = view.bounds.center - new Point(0, 35);
		this.replayButton.active = false;
		this.replayButton.touchId = 0;
		this.replayButton.onclickCommand = "replay_track";

		this.replayButtonText  = new PointText();
		this.replayButtonText.content = "Replay";
		this.replayButtonText.position = this.replayButton.bounds.center;
		this.replayButtonText.fontFamily = "Roboto";
		this.replayButtonText.fontWeight = 100;
		this.replayButtonText.fontSize = 20;
		this.replayButtonText.fillColor = "#417505";

		this.menuButton = new Path.Rectangle({
			height: 50,
			width: 220,
			fillColor: "#E7E7E7",
			radius: BUTTON_RADIUS
		});
		this.menuButton.bounds.center = view.bounds.center + new Point(0, 35);
		this.menuButton.active = false;
		this.menuButton.touchId = 0;
		this.menuButton.onclickCommand = "game_terminate";

		this.menuButtonText  = new PointText();
		this.menuButtonText.content = "Select another track";
		this.menuButtonText.position = this.menuButton.bounds.center;
		this.menuButtonText.fontFamily = "Roboto";
		this.menuButtonText.fontWeight = 100;
		this.menuButtonText.fontSize = 20; 
		this.menuButtonText.fillColor = "#417505";

		this.buttons = [this.menuButton, this.replayButton];
	},

	remove: function(){
		this.replayButton.remove();
		this.replayButtonText.remove();
		this.menuButton.remove();
		this.menuButtonText.remove();
	},

	resize: function(){
		this.replayButton.bounds.center = view.bounds.center - new Point(0, 35);
		this.replayButtonText.position = this.replayButton.bounds.center;
		this.menuButton.bounds.center = view.bounds.center + new Point(0, 35);
		this.menuButtonText.position = this.menuButton.bounds.center;
	},

	handleTouchStart: trackSelectionLayout.handleTouchStart,
	handleTouchMove: trackSelectionLayout.handleTouchMove,
	handleTouchEnd: trackSelectionLayout.handleTouchEnd
}


layouts = {
	"track_selection": trackSelectionLayout,
	"gamepad": gamepadLayout,
	"gameover_options": gameoverLayout
}

view.fillColor = "green";
var currentLayout = null;

window.setLayout = function(layout){
	if (layout in layouts){
		if (currentLayout){
			currentLayout.remove();
		}
		currentLayout = layouts[layout];
		currentLayout.init();
		currentLayout.resize();
		view.draw();
	}else{
		console.log("Unknown layout");
	}
}

function onResize(){
	if (currentLayout){
		currentLayout.resize();
	} 
}

function handleTouchStart(e){
	if (currentLayout){
		currentLayout.handleTouchStart(e);
	}
}

function handleTouchMove(e){
	if (currentLayout){
		currentLayout.handleTouchMove(e);
	}
}

function handleTouchEnd(e){
	if (currentLayout){
		currentLayout.handleTouchEnd(e);
	}
}

view.element.addEventListener("touchstart", handleTouchStart);
view.element.addEventListener("touchmove", handleTouchMove);
view.element.addEventListener("touchend", handleTouchEnd);
view.element.addEventListener("touchcancel", handleTouchEnd);
view.element.addEventListener("touchleave", handleTouchEnd);