"use strict";

var ctx;
var directed;
var radius = 15;

onload = function(){
    var canvas = document.getElementById("canvas");
    canvas.width = 1000;
    canvas.height = 700;
    ctx = canvas.getContext("2d");

    var directed_checkbox = document.getElementById("directed");
    directed_checkbox.onchange = function(){
        directed = directed_checkbox.checked;
        draw();
    }

    var nodeArray = [new Node([200,150]), new Node([300,150])];
    var edgeArray = [new Edge(nodeArray[0].pos, nodeArray[1].pos)];
    var selected = null;

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(var i=0; i<nodeArray.length; ++i){
            nodeArray[i].draw();
        }
        for(var i=0; i<edgeArray.length; ++i){
            edgeArray[i].draw();
        }
    }

    function findNearestNode(pos){
        var nearestNode = nodeArray[0];
        var nearestDist = dist(pos, nearestNode.pos);
        for(var i=0; i<nodeArray.length; ++i){
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
        if(e.altKey){
            selected = new Edge(nearestNode.pos, mousePos);
            edgeArray.push(selected);
        }
        else{
            selected = nearestNode;
        }
        return;
    }

    canvas.onmousemove = function(e){
        var mousePos = this.getMousePos(e);
        if(selected instanceof Node){
            selected.pos[0] = mousePos[0];
            selected.pos[1] = mousePos[1];
            draw();
            return;
        }
        else if(selected instanceof Edge){
            selected.to = mousePos;
            draw();
            return;
        }
        return;
    }

    canvas.onmouseup = function(e){
        if(selected instanceof Edge){
            var nearestNode = findNearestNode(this.getMousePos(e));
            selected.to = nearestNode.pos;
            draw();
        }
        selected = null;
    }

    canvas.ondblclick = function(e){
        var mousePos = this.getMousePos(e);
        var newNode = new Node(mousePos);
        nodeArray.push(newNode);
        draw();
    }

    draw();

}

function Node(pos){
    this.pos = pos;
    this.draw = function(){
        ctx.beginPath();
        ctx.arc(this.pos[0],this.pos[1],
                radius,0,2*Math.PI,false);
        ctx.closePath();
        ctx.stroke();
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
