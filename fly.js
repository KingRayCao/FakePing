var s=document.getElementById("p1");
var bt1=document.getElementById("bt1");
var ping=document.getElementById("ping");
var start=false;
var desti=document.getElementById("desti");
x=0; y=0;fx=1;fy=1;
tremble=function(time){
    if(start&&time<=200){
        s.style.position='absolute';
        if(time==0) {alert("遇到强气流！！！");}
        x=x+Math.random()*15-7.5;
        y=y+Math.random()*15-7.5;
        w=200+Math.random()*100-50;
        h=200+Math.random()*100-50;
        s.style.top=String(x)+'px';
        s.style.left=String(y)+'px';
        s.style.width=String(w)+'px';
        s.style.height=String(h)+'px';
        ping.style.fontSize=String(Math.random()*40+30)+'px';
        if(time<200) setTimeout(tremble,33,time+1);
    }
    else{
        s.style.width='200px';
        s.style.height='200px';
        ping.style.fontSize='50px';
        if(start){alert("强气流结束！");}
    }
};
fly=function(time){
    if (start){
        bt1.innerText="加速";
        s.style.position='absolute';
        x=x+10*fx;y=y+10*fy;
        if(x>400||x<0) fx=-fx;
        if(y>1000||y<0) fy=-fy;
        s.style.top=String(x)+'px';
        s.style.left=String(y)+'px';
        if(time==100) {
            alert("到达目的地！");
            start=false;
            desti.style.display="block";
            desti.style.animationPlayState="running";
        }
        if(time<100) setTimeout(fly,33,time+1);
    }
};
