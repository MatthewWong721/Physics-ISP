var canvas = document.querySelector("#myCanvas");
var ctx = canvas.getContext("2d");

var left = new Image();
left.src = "left.png"

var right = new Image();
right.src = "right.png"

var rocks = [];

const RADIUS = 25;
const FRICTION_ACCEL =0.0013;
const FRICTION_CURL = 0.0005;
const FRICTION_SPIN = 0.000045;

var friction = 1;

const STATIC = 0;
const READY = 1;
const MOVING = 2;
var gameState = STATIC;

var aimX = 0;
var aimY = 200;
var aimSpin = 1;


class Rock{
    constructor(x,y,vx,vy,spinDirection,type){
        this.x = x;
        this.y = y;
        this.vy = vy;
        this.vx = vx;
        this.type = type;
        this.spinDirection = spinDirection;
        this.spin = spinDirection*0.03;
        this.angle = 0;
        this.radius = RADIUS;
        this.v = Math.sqrt(vy*vy+vx*vx);
        this.vxratio = Math.abs(vx/this.v);
        this.vyratio = Math.abs(vy/this.v);
        this.state = 1;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "#AAAAAA";
        ctx.fill();
        ctx.closePath();

        if(this.type==0){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius*0.7, 0, Math.PI*2);
            ctx.fillStyle = "#FF0000";
            ctx.fill();
            ctx.closePath();
        }else{
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius*0.7, 0, Math.PI*2);
            ctx.fillStyle = "#FFFF00";
            ctx.fill();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.ellipse(this.x,this.y,3,15,this.angle,0,Math.PI*2);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
        
    }

    update(){
        this.v = Math.sqrt(this.vy*this.vy+this.vx*this.vx);
        this.vxratio = Math.abs(this.vx/this.v);
        this.vyratio = Math.abs(this.vy/this.v);
        this.angle = this.angle+this.spin;
        this.spin = this.spin-FRICTION_SPIN*friction*this.spinDirection;
        if(this.spinDirection>0&&this.spin<0||this.spinDirection<0&&this.spin>0)
            this.spin=0;
        if(this.state==1){
            this.x = this.x+this.vx
            this.y = this.y+this.vy
            if(this.vx>0){
                this.vx = this.vx-FRICTION_ACCEL*friction*this.vxratio;
                if(this.vx<0)
                    this.vx = 0;
            }else if(this.vx<0){
                this.vx = this.vx+FRICTION_ACCEL*friction*this.vxratio;
                if(this.vx>0)
                    this.vx = 0;
            }
            if(this.vy>0){
                this.vy = this.vy-FRICTION_ACCEL*friction*this.vyratio;
                if(this.vy<0)
                    this.vy = 0;
            }else if(this.vy<0){
                this.vy = this.vy+FRICTION_ACCEL*friction*this.vyratio;
                if(this.vy>0)
                    this.vy = 0;
            }
            if(this.vy==0&&this.vx==0)
                this.state = 0;

            if(this.state==1&&this.spin!==0){
                if(this.vx>0){
                    this.vy = this.vy-FRICTION_CURL*friction*this.vxratio*this.spinDirection;
                }else{
                    this.vy = this.vy+FRICTION_CURL*friction*this.vxratio*this.spinDirection;
                }
                if(this.vy>0){
                    this.vx = this.vx-FRICTION_CURL*friction*this.vyratio*this.spinDirection;
                }else{
                    this.vx = this.vx+FRICTION_CURL*friction*this.vyratio*this.spinDirection;
                }
            }
        }
    }
}

function collisionDetection(){
    for(var i = 0;i<rocks.length;i++){
        var rock1 = rocks[i];
        for(var j=i+1;j<rocks.length;j++){
            var rock2 = rocks[j];
            if(Math.sqrt(Math.pow(rock1.x-rock2.x,2)+Math.pow(rock1.y-rock2.y,2))<=RADIUS*2){
                var nor = Math.atan((rock1.y-rock2.y)/(rock1.x-rock2.x));
                if(rock1.vx==0){
                    var rock1Angle = Math.atan((rock1.vy)/(0.00001));
                }else{
                    var rock1Angle = Math.atan((rock1.vy)/(rock1.vx));
                }
                if(rock2.vx==0){
                    var rock2Angle = Math.atan((rock2.vy)/(0.00001));
                }else{
                    var rock2Angle = Math.atan((rock2.vy)/(rock2.vx));
                }
                var vNor1 = Math.cos(nor-rock1Angle)*rock1.v;
                var vxNor1 = Math.cos(nor)*vNor1;
                var vyNor1 = Math.sin(nor)*vNor1;
                var vNor2 = Math.cos(nor-rock2Angle)*rock2.v;
                var vxNor2 = Math.cos(nor)*vNor2;
                var vyNor2 = Math.sin(nor)*vNor2;
                
                rock1.vx = rock1.vx-vxNor1+vxNor2;
                rock1.vy = rock1.vy-vyNor1+vyNor2;
                rock2.vx = rock2.vx-vxNor2+vxNor1;
                rock2.vy = rock2.vy-vyNor2+vyNor1;
                
                rock1.state = 1;
                rock2.state = 1;
            }
        }
    }
}

canvas.addEventListener("click", click, false)

function click(e){
    var mouseX = e.clientX-canvas.offsetLeft;
    var mouseY = e.clientY;
    console.log(mouseX)
    console.log(mouseY);
    if(gameState==READY){
        if(mouseX>=113&&mouseX<138&&mouseY>=660&&mouseY<685){
            aimSpin=-1;
        }else if(mouseX>=164&&mouseX<189&&mouseY>=660&&mouseY<685){
            aimSpin=1;
        }else if(Math.pow(mouseX-151,2)+Math.pow(mouseY-600,2)<=Math.pow(RADIUS,2)){
            var rock = rocks[rocks.length-1];
            rock.state = 1;
            rock.vx = aimX/400;
            rock.vy = -aimY/400;
            rock.spinDirection = aimSpin;
            rock.spin = aimSpin*0.03;
            gameState = MOVING;
        }else if(Math.pow(mouseX-151,2)+Math.pow(mouseY-600,2)>=Math.pow(200,2)){
            aimX = mouseX-151;
            aimY = -mouseY+600;
        }
    }
}

canvas.addEventListener("mousedown", sweep, false)

function sweep(e){
    if(gameState==MOVING){
        friction = 0.7;
    }
}

canvas.addEventListener("mouseup", unsweep, false)

function unsweep(e){
    if(gameState==MOVING)
        friction = 1;
}

function game(){
    if(gameState==STATIC){
        friction = 1;
        rocks[rocks.length] = new Rock(151, 600, 0, 0,0,rocks.length%2);
        gameState = READY;
    }else if(gameState==READY){
        ctx.beginPath();
        ctx.arc(151, 600, 200, 0, Math.PI*2);
        ctx.strokeStyle = "#00AA00";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(151,600);
        ctx.lineTo(151+aimX, 600-aimY);
        ctx.strokeStyle = "#FF0000";
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "#00AA00"
        if(aimSpin==1)            
            ctx.fillRect(164,660,25,25);
        else
            ctx.fillRect(113,660,25,25)
        ctx.drawImage(left, 113,660,25,25);
        ctx.drawImage(right, 164,660,25,25);
    }else if(gameState==MOVING){
        if(roundEnd())
            gameState = STATIC;
    }
}

function roundEnd(){
    for(var i = 0; i<rocks.length; i++){
        if(rocks[i].state == 1)
            return false;
    }
    return true;
}

window.onload = function(){

    function loop(){ 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";	

    ctx.strokeRect(0,0,301,700);

    ctx.beginPath();
	ctx.arc(151, 151, 120, 0, Math.PI*2);
	ctx.fillStyle = "#0000FF";
	ctx.fill();
	ctx.closePath();

    ctx.beginPath();
	ctx.arc(151, 151, 90, 0, Math.PI*2);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();

    ctx.beginPath();
	ctx.arc(151, 151, 60, 0, Math.PI*2);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	ctx.closePath();

    ctx.beginPath();
	ctx.arc(151, 151, 30, 0, Math.PI*2);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(151,0);
    ctx.lineTo(151,700);
    ctx.moveTo(0,151);
    ctx.lineTo(301,151);
    ctx.stroke();
    ctx.closePath();

    game();
    
    for(i = 0;i<rocks.length;i++){
        rocks[i].update();
        rocks[i].draw();
    }

    console.log(gameState)

    if(rocks.length>1)
        collisionDetection();

    window.requestAnimationFrame(loop); 
} 
loop(); 

}