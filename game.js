var pic=document.getElementById('plane');
var time=document.getElementById('time');
var vnum=20;
var panding=40;
var fx=[],fy=[];
var w=800,h=500,vx=[];vy=[];
var wudi=false;
var start_time,cur_time,start,cur;
document.addEventListener('mousemove',function(e){
    var x=e.pageX;
    var y=e.pageY;
    if(x<0) x=0;
    if(x>w) x=w;
    if(y<0) y=0;
    if(y>h) y=h;
    pic.style.left=x-50+'px';
    pic.style.top=y-50+'px';
});

var obs=[];
var dv=document.getElementById("dv");


var str2num=function(s){
    return s.split('px')[0]-0;
};
var v_init=function(){
    for(i=1;i<=vnum;i++){
        vx[i]=Math.random()*3+1;
        vy[i]=Math.random()*3+1;
        obs[i].style.left=Math.random()*w+'px';
        obs[i].style.top=Math.random()*h+'px';
        while(bump(i,true)){
            obs[i].style.left=Math.random()*w+'px';
            obs[i].style.top=Math.random()*h+'px';
        }
        fx[i]=1;
        fy[i]=1;
        wudi_f();
    }
};
var bump=function(n,flag=false){//bump
    if(Math.abs(str2num(pic.style.left)+45-str2num(obs[n].style.left))<=panding&&Math.abs(str2num(pic.style.top)+45-str2num(obs[n].style.top))<=panding)
    {
        if(!flag&&!wudi)
        {
            alert("菜到了！共飞行"+Math.floor((cur_time-start_time)/100)/10+'s');
            v_init();
        }
        return true;
    }
    else{
        return false;
    }
};
var move=function(n){//vege move around
    obs[i].style.left=str2num(obs[i].style.left)+(vx[i]+Math.random()*2-1)*fx[i]+'px';
    obs[i].style.top=str2num(obs[i].style.top)+(vy[i]+Math.random()*2-1)*fy[i]+'px';
    if(str2num(obs[i].style.left)<0||str2num(obs[i].style.left)>w) fx[i]=-fx[i];
    if(str2num(obs[i].style.top)<0||str2num(obs[i].style.top)>h) fy[i]=-fy[i];
};
var all_vege=function(){//main function
    cur_time=new Date();
    if(!wudi) time.innerText='飞行时间：'+Math.floor((cur_time-start_time)/100)/10+'s';
    for(i=1;i<=vnum;i++)
    {
        bump(i);
        if(!wudi) move(i);
    }

};
var wudi_f=function(){//wudi time
    wudi=true;
    pic.src="img/plane_wudi.png";
    time.innerText='飞行时间：无敌';
    setTimeout(tmp=function(){
        pic.src="img/plane.png";
        time.innerText='飞行时间:0s';
        wudi=false;
        start_time=new Date();},1000);
};

//initiate
for(i=1;i<=vnum;i++)
{
    obs[i]=document.createElement('img');
    obs[i].class='obstacle';
    obs[i].src='img/vege.png';
    obs[i].style.left=Math.random()*w+'px';
    obs[i].style.top=Math.random()*h+'px';
    vx[i]=Math.random()*3+1;
    vy[i]=Math.random()*3+1;
    while(bump(i,true)){
        obs[i].style.left=Math.random()*w+'px';
        obs[i].style.top=Math.random()*h+'px';
    }
    dv.appendChild(obs[i]);
    fx[i]=1;
    fy[i]=1;
    
}

//begin
wudi_f();
setInterval(all_vege,20);