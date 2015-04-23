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

    var directedCheckbox = document.getElementById("directed");
    directedCheckbox.onchange = function(){
        directed = directedCheckbox.checked;
        draw();
    }

    var nodenumCheckbox = document.getElementById("node_num");
    nodenumCheckbox.onchange = function(){
        nodeNum = nodenumCheckbox.checked;
        draw();
    }

    var widthInput = document.getElementById("width");
    widthInput.onchange = function(){
        canvas.width = widthInput.valueAsNumber;
    }

    var heightInput = document.getElementById("height");
    heightInput.onchange = function(){
        canvas.height = heightInput.valueAsNumber;
    }

    var nodeColorInput = document.getElementById("nodeColor");
    nodeColorInput.onchange = function(){
        if(selectedNode instanceof Node){
            selectedNode.fillcolor = "#"+nodeColorInput.value;
        }
        draw();
    }

    var nodeArray = []
    var edgeArray = []
    var nodeNum = 0;
    var dragging = null;

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        /*
        ctx.beginPath();
        ctx.moveTo(canvas.width, canvas.height);
        ctx.lineTo(canvas.width-15, canvas.height);
        ctx.lineTo(canvas.width, canvas.height-15);
        ctx.closePath();
        ctx.fillStyle = "#808080";
        ctx.fill();
        */
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

    function selectNode(node){
        if(node instanceof Node){
            selectedNode = node;
            nodeColorInput.value = node.fillcolor.substr(1,6);
            console.log(nodeColorInput.color);
            var event = new KeyboardEvent("keyup");
            nodeColorInput.dispatchEvent(event);
        }
        else{
            selectedNode = null;
        }
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
                selectNode(nearestNode);
            else
                selectNode(null);
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
        var nearestNode = findNearestNode(this.getMousePos(e));

        if(nodeArray.length == 0 || dist(nearestNode.pos, mousePos) > radius){
            var newNode = new Node(mousePos, nodeNum++);
            nodeArray.push(newNode);
            selectNode(newNode);
        }
        else{
            nodeArray.splice(nodeArray.indexOf(nearestNode),1);
        }

        draw();
    }

    draw();

}

function Node(pos, label){
    this.pos = pos;
    this.label = label;
    this.fillcolor = "#FFFFFF";
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
    //http://stackoverflow.com/questions/12772943/getting-cursor-position-in-a-canvas-without-jquery
    var rect = this.getBoundingClientRect();
    var root = document.documentElement;

    // return relative mouse position
    var mouseX = event.clientX - rect.left - root.scrollLeft;
    var mouseY = event.clientY - rect.top - root.scrollTop;
    return [mouseX, mouseY];

};
