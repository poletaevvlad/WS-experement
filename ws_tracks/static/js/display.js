var PaperDisplay = function(){
    this.track = null;
    this.roadLayer1 =null;
    this.roadLayer2 =null;
    this.roadLayer3 =null;
    this.roadScale = 1;
    this.car = null;

    this.drivePoints = [];
    this.nextPoint = 0;
    this.currentLap = 0;
    this.totalLaps = 3;

    this.trackName = null;
    this.timeTitle = null;
    this.timeDisplay = null;
    this.lapTitle = null;
    this.lapDisplay = null;

    this.timeStarted = false;
    this.timeSinceBegin = 0;

    this.drivePointsOffsets = {
        left: new Point(-40, 0),
        top: new Point(0, -40),
        right: new Point(40, 0),
        bottom: new Point(0, 40)
    }

    this.onRoadFrames = 0;
    this.totalFrames = 0;

    this.gameOver = false;
}

window.PaperDisplay = PaperDisplay;

PaperDisplay.prototype.updatePath = function(){
    if (! this.track) return;
    if (! this.roadLayer1){
        this.roadLayer1 = new Path(this.track.data);
        this.roadLayer1.strokeColor = "#DEDEDE";
        this.roadLayer1.strokeWidth = 45;
        this.roadLayer1.closed = true;

        this.roadLayer2 = new Path(this.track.data);
        this.roadLayer2.strokeColor = "#5B5B5B";
        this.roadLayer2.strokeWidth = 35;
        this.roadLayer2.closed = true;

        this.roadLayer3 = new Path(this.track.data);
        this.roadLayer3.strokeColor = "#FFFFFF";
        this.roadLayer3.strokeWidth = 2;
        this.roadLayer3.dashArray = [30, 20];
        this.roadLayer3.closed = true;
    }

    var xScale = (view.size.width - 300) / this.track.width;
    var yScale = (view.size.height - 100) / this.track.height;
    var scale = (xScale < yScale) ? xScale : yScale;

    this.roadLayer1.bounds.center = view.bounds.center;
    this.roadLayer1.scale(scale / this.roadScale)

    this.roadLayer2.bounds.center = view.bounds.center;
    this.roadLayer2.scale(scale / this.roadScale);

    this.roadLayer3.bounds.center = view.bounds.center;
    this.roadLayer3.scale(scale / this.roadScale);

    this.roadScale = scale;

    view.draw();
}

PaperDisplay.prototype.displayTrack = function(track){
    this.track = track;
    this.updatePath();

    this.car = new Car(this);
    this.car.rectangle.bringToFront();
    this.car.collisionCircle.bringToFront();
    this.positionCarStart();

    for (var i = 0; i < track.runPoints.length; i++){
        var point = track.runPoints[i];
        point.number = i;
        this.drawDrivePoint(point);
        this.setPointDisabled(i);
    }
    this.setPointEnabled(0);
    this.nextPoint = 0;

    this.createUI();
    view.draw();
}

PaperDisplay.prototype.createUI = function(){
    this.trackName = new PointText();
    this.trackName.content = this.track.name;
    this.trackName.fillColor = "#66B60A";
    this.trackName.fontFamily = "Roboto";
    this.trackName.fontSize = 24;
    this.trackName.fontWeight = 100;
    this.trackName.position = new Point(30 + this.trackName.bounds.width / 2, 30 + this.trackName.bounds.height / 2);

    this.timeTitle = new PointText();
    this.timeTitle.content = "time";
    this.timeTitle.fillColor = "#66B60A";
    this.timeTitle.fontFamily = "Roboto";
    this.timeTitle.fontSize = 12;
    this.timeTitle.position = new Point(view.size.width - 30 - this.timeTitle.bounds.width / 2, 30 + this.timeTitle.bounds.height / 2);

    this.timeDisplay = new PointText();
    this.timeDisplay.content = "00:00";
    this.timeDisplay.fillColor = "#66B60A";
    this.timeDisplay.fontFamily = "Roboto";
    this.timeDisplay.fontSize = 25;
    this.timeDisplay.fontWeight = 100
    this.timeDisplay.position = new Point(view.size.width - 30 - this.timeDisplay.bounds.width / 2, 40 + this.timeDisplay.bounds.height / 2);

    this.lapTitle = new PointText();
    this.lapTitle.content = "lap";
    this.lapTitle.fillColor = "#66B60A";
    this.lapTitle.fontFamily = "lap";
    this.lapTitle.fontFamily = "Roboto";
    this.lapTitle.fontSize = 12;
    this.lapTitle.position = new Point(view.size.width - 30 - this.lapTitle.bounds.width / 2, 100 + this.lapTitle.bounds.height / 2);

    this.lapDisplay = new PointText();
    this.lapDisplay.content = "1/"+this.totalLaps;
    this.lapDisplay.fillColor = "#66B60A";
    this.lapDisplay.fontFamily = "Roboto";
    this.lapDisplay.fontSize = 25;
    this.lapDisplay.fontWeight = 100
    this.lapDisplay.position = new Point(view.size.width - 30 - this.lapDisplay.bounds.width / 2, 110 + this.lapDisplay.bounds.height / 2);     
}

PaperDisplay.prototype.updateLapDisplay = function(){
    this.lapDisplay.content = (this.currentLap + 1) + "/" + this.totalLaps;
    this.lapDisplay.position = new Point(view.size.width - 30 - this.lapDisplay.bounds.width / 2, 110 + this.lapDisplay.bounds.height / 2);     
}

PaperDisplay.prototype.positionCarStart = function(){
    var pos = new Point(this.roadLayer1.bounds.left + this.track.start.x * this.roadScale,
                        this.roadLayer1.bounds.top + this.track.start.y * this.roadScale);
    this.car.place(pos);
}

PaperDisplay.prototype.remove = function(){
    this.track = null;
    this.roadLayer1.remove();
    this.roadLayer2.remove();
    this.roadLayer3.remove();
    this.roadScale = 1;
    this.car.remove();
    this.car = null;
    this.trackName.remove();
    this.timeTitle.remove();
    this.timeDisplay.remove();
    this.lapTitle.remove();
    this.lapDisplay.remove();
    for (var i = 0; i < this.drivePoints.length; i++){
        var point = this.drivePoints[i];
        point.circle.remove();
        point.number_circle.remove();
        point.number_text.remove();
    }
}

PaperDisplay.prototype.drawDrivePoint = function(point){
    point.circle = new Path.Circle({
        radius: 5,
        fillColor: "#A3C4EC"
    });
    point.circle.bounds.center = this.roadLayer1.bounds.topLeft + new Point(point.x, point.y) * this.roadScale;

    point.number_circle = new Path.Circle({
        radius: 9,
        strokeColor: "#4A90E2",
        strokeWidth: 1
    })
    point.number_circle.bounds.center = point.circle.bounds.center + this.drivePointsOffsets[point.displayPosition];

    point.number_text = new PointText();
    point.number_text.content = (point.number + 1).toString();
    point.number_text.position = point.number_circle.bounds.center;
    point.number_text.fillColor = "#4A90E2";
    this.drivePoints.push(point);
}

PaperDisplay.prototype.setPointDisabled = function(i){
    var point = this.drivePoints[i];
    point.circle.visible = false;
    point.number_circle.strokeColor = "#9B9B9B";
    point.number_circle.fillColor = new Color(0,0);
    point.number_text.fillColor = "#9B9B9B";
}

PaperDisplay.prototype.setPointEnabled = function(i){
    var point = this.drivePoints[i];
    point.circle.visible = true;
    point.number_circle.strokeColor = "#4A90E2";
    point.number_circle.fillColor = new Color(0,0);
    point.number_text.fillColor = "#4A90E2";
}

PaperDisplay.prototype.setPointCompleted = function(i){
    var point = this.drivePoints[i];
    point.circle.visible = false;
    point.number_circle.strokeColor = "#7ED321";
    point.number_circle.fillColor = "#7ED321";
    point.number_text.fillColor = "white";
}

PaperDisplay.prototype.updateTime = function(){
    function doubleDigit(number){
        var string = number.toString();
        if (string.length == 1){
            string = "0"+string;
        }
        return string;
    }

    var time = this.timeSinceBegin
    var seconds = (time | 0) % 60;
    var minutes = (time / 60) | 0;
    // var sseconds = (time - (time | 0)) * 100 | 0;

    var timeString = doubleDigit(minutes) + ":" + doubleDigit(seconds);// + "." + doubleDigit(sseconds);
    this.timeDisplay.content = timeString;
    this.timeDisplay.position = new Point(view.size.width - 30 - this.timeDisplay.bounds.width / 2, 40 + this.timeDisplay.bounds.height / 2);
}

PaperDisplay.prototype.runGameOver = function(){
    this.timeStarted = false;
    this.gameOver = true;

    var time = this.timeDisplay.content;
    var onRoadPrercentage = (this.onRoadFrames / this.totalFrames) * 100 | 0;

    var timeTag = document.getElementById("result_time");
    timeTag.innerHTML = time;

    var onRoadTag = document.getElementById("result_onroad");
    onRoadTag.innerHTML = onRoadPrercentage + "%";

    app.showAlert("alert_completed");

    this.track.saveScore(this.timeSinceBegin);
    app.setControllerLayout("gameover_options");
}



var Car = function(display){
    this.rectangle = new Path.Rectangle({
        width: 11,
        height: 18,
        fillColor: "#66B60A",
        radius: 1
    });
    this.rectangle.bounds.center = view.bounds.center;
    this.display = display
    this.road = this.display.roadLayer1;

    this.collisionCircle = new Path.Circle({
        strokeWidth: 1,
        radius: 22.5
    });
    this.collisionCircle.bounds.center = view.bounds.center;
    
    this.angle = 0;
    this.acceleration = 150;
    this.velocity = new Point(0, 0);
    this.onRoad = true;
    this.accelerating = false;

    // --- Lights ---

    var frontLight = new Path("M 0 0 H 14 L 7 37 Z");
    frontLight.fillColor = new Color({
        gradient: {
            stops: ["white", new Color(255, 255, 255, 0)]
        },
        origin: new Point(0, 37),
        destination: new Point(0, 0)
    });

    var frontLightSymbol = new Symbol(frontLight)
    this.lightLeft = frontLightSymbol.place(this.rectangle.bounds.topLeft + new Point(3, -14));
    this.lightRight = frontLightSymbol.place(this.rectangle.bounds.topRight + new Point(-3, -14));

    var backLight = new Path("M 0 6 L 3 0 L 6 6 Z");
    backLight.fillColor = new Color({
        gradient: {
            stops: ["red", new Color(255, 0, 0, 0)]
        },
        origin: new Point(0, 0),
        destination: new Point(0, 6)
    });

    var backLightSymbol = new Symbol(backLight);
    this.backLightLeft = backLightSymbol.place(this.rectangle.bounds.bottomLeft + new Point(3, 0))
    this.backLightRight = backLightSymbol.place(this.rectangle.bounds.bottomRight + new Point(-3, 0))
}

Car.prototype.rotate = function(angle){
    this.rectangle.rotate(angle);
    this.lightLeft.rotate(angle, this.rectangle.bounds.center);
    this.lightRight.rotate(angle, this.rectangle.bounds.center);
    this.backLightLeft.rotate(angle, this.rectangle.bounds.center);
    this.backLightRight.rotate(angle, this.rectangle.bounds.center);
}

Car.prototype.place = function(point){
    var vector =  point - this.rectangle.bounds.center;

    this.rectangle.bounds.center += vector;
    this.collisionCircle.bounds.center = point;

    this.lightLeft.position += vector;
    this.lightLeft.bringToFront();

    this.lightRight.position += vector;
    this.lightRight.bringToFront();

    this.backLightLeft.position += vector;
    this.backLightLeft.bringToFront();

    this.backLightRight.position += vector;
    this.backLightRight.bringToFront();

    this.rectangle.bringToFront();
}

Car.prototype.move = function(vector){
    if (! this.display.gameOver){
        if (vector.length > 0){
            this.display.timeStarted = true;
        }
        this.rectangle.bounds.center += vector;
        this.collisionCircle.bounds.center += vector;
        this.lightLeft.bounds.center += vector;
        this.lightRight.bounds.center += vector;
        this.backLightLeft.bounds.center += vector;
        this.backLightRight.bounds.center += vector;

        var intersections = this.collisionCircle.getIntersections(this.road);
        this.onRoad = intersections.length > 0;
        if (this.onRoad){
            this.display.onRoadFrames ++;
        }
        this.display.totalFrames ++;

        var nextPointPos = this.display.drivePoints[this.display.nextPoint].circle.bounds.center;
        var dist = (nextPointPos - this.rectangle.bounds.center).length;
        if (dist <= 20){
            this.display.setPointCompleted(this.display.nextPoint);
            if (this.display.nextPoint == this.display.drivePoints.length-1){
                if (this.display.currentLap + 1 < this.display.totalLaps){
                    this.display.nextPoint = 0;
                    this.display.setPointEnabled(0);
                    for(var i = 1; i < this.display.drivePoints.length; i++){
                        this.display.setPointDisabled(i);
                    }
                    this.display.currentLap ++;
                    this.display.updateLapDisplay();
                }else{
                    this.display.runGameOver();
                }
            }else{
                this.display.nextPoint ++;
                this.display.setPointEnabled(this.display.nextPoint);   
            }
            
        }
    }
}

Car.prototype.step = function(time){
    var moveVector1 =   new Point({
        angle: 90+this.angle,
        length: 1
    });
    var velocityVector1 = new Point({
        angle: this.velocity.angle,
        length: 1
    })

    if (this.accelerating){
        this.velocity += moveVector1 * this.acceleration * time;
    }else{
        if (this.velocity.length > 10){
            this.velocity.length -= 70  * time;
        }else{
            this.velocity.length = 0;
        }
    }

    if (! this.onRoad && this.velocity.length >= 20){
        this.velocity.length = 20;
    }
    
    this.velocity.angle = moveVector1.angle;
}

Car.prototype.remove = function(){
    this.rectangle.remove();
    this.collisionCircle.remove();
    this.lightLeft.remove();
    this.lightRight.remove();
    this.backLightLeft.remove();
    this.backLightRight.remove();
}

function onResize(){
    if (typeof app.display != "undefined" && app.display!=null){
        var scale1 = app.display.roadScale;
        var c1 = app.display.roadLayer1.bounds.topLeft - app.display.car.rectangle.bounds.center;
        app.display.updatePath();
        var scale2 = app.display.roadScale;
        
        var multiplier = scale2 / scale1;

        app.display.car.place(app.display.roadLayer1.bounds.topLeft - c1 * multiplier);

        for (var i = 0; i < app.display.drivePoints.length; i++){
            var point = app.display.drivePoints[i];
            var tl = app.display.roadLayer1.bounds.topLeft;
            point.circle.bounds.center = tl + new Point(point.x, point.y) * scale2;
            point.number_circle.bounds.center = point.circle.bounds.center + app.display.drivePointsOffsets[point.displayPosition];
            point.number_text.position = point.circle.bounds.center + app.display.drivePointsOffsets[point.displayPosition];
        }

        app.display.trackName.position = new Point(30 + app.display.trackName.bounds.width / 2, 30 + app.display.trackName.bounds.height / 2);
        app.display.timeTitle.position = new Point(view.size.width - 30 - app.display.timeTitle.bounds.width / 2, 30 + app.display.timeTitle.bounds.height / 2);
        app.display.timeDisplay.position = new Point(view.size.width - 30 - app.display.timeDisplay.bounds.width / 2, 40 + app.display.timeDisplay.bounds.height / 2);
        app.display.lapTitle.position = new Point(view.size.width - 30 - app.display.lapTitle.bounds.width / 2, 100 + app.display.lapTitle.bounds.height / 2);
        app.display.lapDisplay.position = new Point(view.size.width - 30 - app.display.lapDisplay.bounds.width / 2, 110 + app.display.lapDisplay.bounds.height / 2);        
    }
}


rotating = 0;

function onFrame(e){
    if (typeof app.display != "undefined" && app.display!=null){
        if (rotating != 0){
            app.display.car.angle += rotating * e.delta;
            app.display.car.rotate(rotating * e.delta);
        }
        app.display.car.step(e.delta);
        app.display.car.move(-app.display.car.velocity * e.delta);
        if (app.display.timeStarted){
            app.display.timeSinceBegin += e.delta;
            app.display.updateTime();
        }
    }
}

function onKeyDown(e){
    if (app.display){
        if (e.key == "up" && app.display.car){
            startAcceleration();
        }else if (e.key == "left" && app.display.car){
            rotating = -100;
        }else if (e.key == "right" && app.display.car){
            rotating = 100;
        }else if (e.key == "down" && app.display.car){
            startDeceleration();
        }
    }
}

function onKeyUp(e){
    if (app.display){
        if ((e.key == "up" || e.key =="down") && app.display.car){
            endAcceleration();
        }else if (e.key == "left" && app.display.car){
            rotating = 0;
        }else if (e.key == "right" && app.display.car){
            rotating = 0;
        }
    }
}

function startAcceleration(){
    app.display.car.accelerating = true;
    app.display.car.acceleration = 150;
}

function endAcceleration(){
    app.display.car.accelerating = false;
}

function startDeceleration(){
    app.display.car.accelerating = true;
    app.display.car.acceleration = -75;
}

function angleChanged(angle){
    var an = parseInt(angle[1]);
    app.display.car.rotate(- app.display.car.angle + an);
    app.display.car.angle = an;
    
}

app.sockets.registerHandler("accelerationBegin", startAcceleration);
app.sockets.registerHandler("accelerationEnd", endAcceleration)
app.sockets.registerHandler("decelerationBegin", startDeceleration)
app.sockets.registerHandler("decelerationEnd", endAcceleration);
app.sockets.registerHandler("a", angleChanged);
