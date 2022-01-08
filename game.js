var pic=document.getElementById('plane');
var vnum=20;
var panding=40;
var fx=[],fy=[];
var w=800,h=500,v=2;
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

str2num=function(s){
    return s.split('px')[0]-0;
};
v_init=function(){
    for(i=1;i<=vnum;i++){
        obs[i].style.left=Math.random()*w+'px';
        obs[i].style.top=Math.random()*h+'px';
        fx[i]=1;
        fy[i]=1;
    }
};
bump=function(n,flag=false){
    if(Math.abs(str2num(pic.style.left)+45-str2num(obs[n].style.left))<=panding&&Math.abs(str2num(pic.style.top)+45-str2num(obs[n].style.top))<=panding)
    {
        if(!flag){alert("cai");v_init();}
        return true;
    }
    else{
        return false;
    }
};
move=function(n){
    obs[i].style.left=str2num(obs[i].style.left)+(v+Math.random()*2-1)*fx[i]+'px';
    obs[i].style.top=str2num(obs[i].style.top)+(v+Math.random()*2-1)*fy[i]+'px';
    if(str2num(obs[i].style.left)<0||str2num(obs[i].style.left)>w) fx[i]=-fx[i];
    if(str2num(obs[i].style.top)<0||str2num(obs[i].style.top)>h) fy[i]=-fy[i];
}
all_vege=function(){
    for(i=1;i<=vnum;i++)
    {
        bump(i);
        move(i);
    }
};

for(i=1;i<=vnum;i++)
{
    obs[i]=document.createElement('img');
    obs[i].class='obstacle';
    obs[i].src='img/vege.png';
    obs[i].style.left=Math.random()*w+'px';
    obs[i].style.top=Math.random()*h+'px';
    while(bump(i,true)){
        obs[i].style.left=Math.random()*w+'px';
        obs[i].style.top=Math.random()*h+'px';
    }
    dv.appendChild(obs[i]);
    fx[i]=1;
    fy[i]=1;
};

setInterval(all_vege,20);