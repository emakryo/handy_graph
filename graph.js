"use strict";

var ctx;
var directed;
var nodeNum;
var radius = 15;
var selectedNode = null;

onload = function(){
    var canvas = document.getElementById("canvas");
    canvas.width = 700;
    canvas.height = 400;
    ctx = canvas.getContext("2d");
    ctx.font = "15px sans-serif";

    var directed_checkbox = document.getElementById("directed");
    directed_checkbox.onchange = function(){
        directed = directed_checkbox.checked;
        draw();
    }

    var nodenum_checkbox = document.getElementById("node_num");
    nodenum_checkbox.onchange = function(){
        nodeNum = nodenum_checkbox.checked;
        draw();
    }

    var width_input = document.getElementById("width");
    width_input.onchange = function(){
        canvas.width = width_input.valueAsNumber;
    }

    var height_input = document.getElementById("height");
    height_input.onchange = function(){
        canvas.height = height_input.valueAsNumber;
    }

    var nodeArray = []
    var edgeArray = []
    var dragging = null;

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(var i=0; i<nodeArray.length; i++){
            nodeArray[i].draw();
        }
        for(var i=0; i<edgeArray.length; i++){
            edgeArray[i].draw();
        }
    }

    function findNearestNode(pos){
        var nearestNode = nodeArray[0];
        if(nearestNode == undefined) return undefined;
        var nearestDist = dist(pos, nearestNode.pos);
        for(var i=0; i<nodeArray.length; i++){
            var d = dist(pos, nodeArray[i].pos);
            if(d < nearestDist){
                nearestDist = d;
                nearestNode = nodeArray[i];
            }
        }
        return nearestNode;
    }

    canvas.onmousedown = function(e){
        var mousePos = this.getMousePos(e);
        var nearestNode = findNearestNode(mousePos);
        if(nearestNode == undefined) return;
        if(e.altKey){
            dragging = new Edge(nearestNode.pos, mousePos);
            edgeArray.push(dragging);
        }
        else{
            dragging = nearestNode;
            if(dist(nearestNode.pos, mousePos) < radius)
                selectedNode = nearestNode;
            else
                selectedNode = null;
        }
    }

    canvas.onmousemove = function(e){
        var mousePos = this.getMousePos(e);
        if(dragging instanceof Node){
            dragging.pos[0] = mousePos[0];
            dragging.pos[1] = mousePos[1];
            draw();
        }
        else if(dragging instanceof Edge){
            dragging.to = mousePos;
            draw();
        }
    }

    canvas.onmouseup = function(e){
        if(dragging instanceof Edge){
            var nearestNode = findNearestNode(this.getMousePos(e));
            dragging.to = nearestNode.pos;
        }
        dragging = null;
        draw();
    }

    canvas.ondblclick = function(e){
        var mousePos = this.getMousePos(e);
        var newNode = new Node(mousePos, nodeArray.length);
        nodeArray.push(newNode);
        selectedNode = newNode;
        draw();
    }

    draw();

}

function Node(pos, label){
    this.pos = pos;
    this.label = label;
    this.fillcolor = null;
    this.framecolor = "#000000";
    this.draw = function(){
        ctx.beginPath();
        ctx.arc(this.pos[0],this.pos[1],
                radius,0,2*Math.PI,false);
        ctx.closePath();
        if(this.fillcolor != null){
            ctx.fillStyle = this.fillcolor;
            ctx.fill();
        }
        if(this.framecolor != null){
            ctx.strokeStyle = this.framecolor;
            ctx.stroke();
        }
        if(selectedNode === this){
            ctx.beginPath();
            ctx.arc(this.pos[0],this.pos[1],radius+1,2*Math.PI,false);
            ctx.closePath();
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
        if(nodeNum == false) return;
        ctx.fillStyle = "#000000";
        ctx.fillText(this.label,pos[0]-5,pos[1]+5);
    }
}

function Edge(from, to){
    this.from = from;
    this.to = to;
    this.draw = function(){
        var v = numeric.sub(this.to, this.from);
        var unit = v.map(function(a){ return a/numeric.norm2(v) });
        var radius_v = unit.map(function(a){ return radius*a });
        var start = numeric.add(this.from, radius_v);
        var end = numeric.sub(this.to, radius_v);
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(start[0],start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.closePath();
        ctx.stroke();
        if(directed == false) return;

        var arrow_angle = 60;
        var arrow_points =
            [numeric.add(end, numeric.dot(rotate_mat(180-arrow_angle/2), radius_v)),
             numeric.add(end, numeric.dot(rotate_mat(180+arrow_angle/2), radius_v))];
        ctx.beginPath();
        ctx.moveTo(end[0], end[1]);
        ctx.lineTo(arrow_points[0][0], arrow_points[0][1]);
        ctx.lineTo(arrow_points[1][0], arrow_points[1][1]);
        ctx.closePath();
        ctx.fill();
    }
}

function dist(p1,p2){
    return Math.sqrt((p1[0]-p2[0])*(p1[0]-p2[0]) + (p1[1]-p2[1])*(p1[1]-p2[1]));
}

function rotate_mat(angle){
    var rad = angle*Math.PI/180;
    return [[Math.cos(rad), -Math.sin(rad)], [Math.sin(rad), Math.cos(rad)]];
}

HTMLCanvasElement.prototype.getMousePos = function(event) {
    // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = this;
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)
    var x = event.pageX - totalOffsetX;
    var y = event.pageY - totalOffsetY;
    return [x, y];
};
