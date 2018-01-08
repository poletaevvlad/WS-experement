window.onload = function(){

window.sockets = new Socket();

document.getElementById("st1_submit").onclick = function(){
    var code = document.getElementById("st1_textin").value;
    sockets.code = code;
    sockets.ws.send("hello " + code + " controller");

    sockets.registerHandler("connect_succesful", function(){
        document.getElementById("steps").style.display = "none";
    })

    sockets.registerHandler("connect_failed", function(){
        alert("The code is wrong. Try again");
    })
}

sockets.registerHandler("layout", function(args){
    setLayout(args[1])

})

sockets.onDisconnected = function(){
    document.getElementById("alert_disconnected").classList.add("alert_shown");
}

sockets.onDisplayDisconnected = function(){
    document.getElementById("alert_display_disconnected").classList.add("alert_shown"); 
}

}

document.ontouchmove = function(event){
    event.preventDefault();
}