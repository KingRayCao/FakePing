{
    const PI = Math.PI;
    const fps = 30;
    const diffT = 1;
    const playField = getElem('dv'), mtro = getElem('mtro'), mtrb = getElem('mtrb'), sc = getElem('sc');
    const width = 1000, height = 600;
    const planeHealthMax = 100, planeBulletMax = 100;
    var difficulty = 1.0;
    var intervalForMain, intervalForStateCheck;
    function getElem (s) {
        return document.getElementById(s);
    }
    function bump (ob1,ob2) {
        return Math.abs(ob1.pos.x - ob2.pos.x) <= (ob1.w + ob2.w) / 2 && Math.abs(ob1.pos.y - ob2.pos.y) <= (ob1.h + ob2.h) / 2;
    }
    function checkPos (_pos) {
        return _pos.x >= 0 && _pos.x <= width && _pos.y >=0 && _pos.y <= height;
    }
    function removeobj(obj) {
        obj.inst.remove();
    }
    function mouseTrack () {
        document.addEventListener('mousemove', function (e) {
            let x = e.pageX;
            let y = e.pageY;
            if (x < 0)
                x = 0;
            if (x > width)
                x = width;
            if (y < 0)
                y = 0;
            if (y > height)
                y = height;
            plane.moveTo({x, y});
        });
    }
    var buttonPressed = {
        w : false,
        d : false,
        s : false,
        a : false,
        space : false
    };
    function keyboardCtrl () {
        document.addEventListener('keydown', function (e) {
            switch (e.key) {
                case 'w':
                    buttonPressed.w = true;
                    break;
                case 'd':
                    buttonPressed.d = true;
                    break;
                case 's':
                    buttonPressed.s = true;
                    break;
                case 'a':
                    buttonPressed.a = true;
                    break;
                case ' ':
                    buttonPressed.space = true;
                    break;
            }
        });
        document.addEventListener('keyup', function (e) {
            switch (e.key) {
                case 'w':
                    buttonPressed.w = false;
                    break;
                case 'd':
                    buttonPressed.d = false;
                    break;
                case 's':
                    buttonPressed.s = false;
                    break;
                case 'a':
                    buttonPressed.a = false;
                    break;
                case ' ':
                    buttonPressed.space = false;
                    break;
            }
        });
    }
    class Plane {
        constructor () {
            this.inst = null;
            this.pos = {x : 0, y : 0};
            this.w = 100;
            this.h = 100;
            this.health = 0;
            this.ctrlMode = 2;  //1:mouse 2:keyboard
            this.speed = 5;
            this.bulletnum = 0;
            this.tickperbullet = 5;
        }
        init (id) {
            this.inst = getElem(id);
            if (this.inst == null) return false;
            this.inst.style.position = 'absolute';
            this.pos.x = width / 2;
            this.pos.y = height / 2;
            this.health = planeHealthMax;
            this.bulletnum = planeBulletMax;
            switch (this.ctrlMode) {
                case 1:
                    mouseTrack();
                    break;
                case 2:
                    keyboardCtrl();
                    break;
            }
            return true;
        }
        moveByStep (d) {  //0 up 1 right 2 down 3 left
            switch (d) {
                case 0:
                    this.pos.y -= this.speed;
                    if (this.pos.y < 0) this.pos.y = 0;
                    break;
                case 1:
                    this.pos.x += this.speed;
                    if (this.pos.x > width) this.pos.x = width;
                    break;
                case 2:
                    this.pos.y += this.speed;
                    if (this.pos.y > height) this.pos.y = height;
                    break;
                case 3:
                    this.pos.x -= this.speed;
                    if (this.pos.x < 0) this.pos.x = 0;
                    break;
            }
        }
        moveTo (_pos) {
            this.pos = _pos;
            this.updatePos();
        }
        updatePos () {
            switch (this.ctrlMode) {
                case 1:
                    break;
                case 2:
                    if (buttonPressed.w) this.moveByStep(0);
                    if (buttonPressed.d) this.moveByStep(1);
                    if (buttonPressed.s) this.moveByStep(2);
                    if (buttonPressed.a) this.moveByStep(3);
                    break;
            }
            this.inst.style.left = String(this.pos.x - this.w / 2) + 'px';
            this.inst.style.top = String(this.pos.y - this.h / 2) + 'px';
        }
        shoot () {
            if (this.bulletnum == 0) return;
            let x = this.pos.x, y = this.pos.y;
            all_bul[buln++] = new bullet({x, y});
            this.bulletnum--;
            // for (let i = 0; i <= buln; i++) {
            //     if (all_bul[i] == null) {
            //         all_bul[i] = new bullet({x, y});
            //         if (i == buln) buln++;
            //         break;
            //     }
            // }
        }
    }
    class vegetable {
        constructor () {
            this.inst = document.createElement('img');
            this.pos = {x : 0, y : 0};
            this.w = 20;
            this.h = 20;
            this.theta = PI;
            this.inst.class = 'obstacle';
            this.inst.src = 'img/vege.png';
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.health = 5 * difficulty;
            playField.appendChild(this.inst);
            this.updatePos();
        }
        move () {
            let r = Math.sqrt(difficulty) * Math.random();
            this.theta += Math.random() * PI / 48 - PI / 96;
            if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
            if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
        updatePos () {
            this.move();
            this.inst.style.left = String(this.pos.x - this.w / 2) + 'px';
            this.inst.style.top = String(this.pos.y - this.h / 2) + 'px';
        }
    }
    class bullet {
        constructor (_pos) {
            this.inst = document.createElement('img');
            this.inst.class = 'bullet';
            this.inst.src = 'img/bul.png';
            this.pos = _pos;
            this.w = 5;
            this.h = 5;
            this.damage = 10;
            this.velocity = 5;
            playField.appendChild(this.inst);
            this.updatePos();
        }
        updatePos () {
            this.pos.x += this.velocity;
            this.inst.style.left = String(this.pos.x - this.w / 2) + 'px';
            this.inst.style.top = String(this.pos.y - this.h / 2) + 'px';
        }
    }
    var plane = new Plane();
    var all_veg = [], vegn = 0;
    var all_bul = [], buln = 0;
    var gametick = 0, score = 0;
    function gameinit () {
        if (!plane.init('plane')) return false;
        vegn = Math.floor(Math.sqrt(difficulty) * 10);
        for (let i = 0; i < vegn; i++) {
            all_veg.push(new vegetable());
        }
    }
    function mainProc () {
        if (plane.health <= 0) return;
        for (let i = 0; i < vegn; i++) {
            if (all_veg[i] != null && bump(plane, all_veg[i])) {
                plane.health -= 10;
                removeobj(all_veg[i]);
                all_veg[i] = null;
                console.log(gametick, i);
                if (plane.health <= 0) {
                    clearInterval(intervalForMain);
                    return;
                }
            }
            for (let j = 0; j < buln; j++) {
                if (all_veg[i] != null && all_bul[j] != null && bump(all_veg[i], all_bul[j])) {
                    all_veg[i].health -= all_bul[j].damage;
                    removeobj(all_bul[j]);
                    all_bul[j] = null;
                    if (all_veg[i].health <= 0) {
                        removeobj(all_veg[i]);
                        all_veg[i] = null;
                        score += 10;
                        break;
                    }
                }
                if (all_bul[j] != null && !checkPos(all_bul[j].pos)) removeobj(all_bul[j]), all_bul[j] = null;
            }
            if (all_veg[i] != null && !checkPos(all_veg[i].pos)) removeobj(all_veg[i]), all_veg[i] = null;
        }
        vegn = Math.floor(Math.log2(difficulty) * 10);
        for (let i = 0; i < vegn; i++) {
            if (all_veg[i] == null) all_veg[i] = new vegetable();
        }
        let tmp = 0;
        for (let i = 0; i < buln; i++) {
            if (all_bul[i] != null) all_bul[tmp++] = all_bul[i];
        }
        buln = tmp;
        if (buttonPressed.space) plane.shoot();
        plane.updatePos();
        for (let i = 0; i < vegn; i++) {
            all_veg[i].updatePos();
        }
        for (let i = 0; i < buln; i++) {
            all_bul[i].updatePos();
        }
        if (gametick % plane.tickperbullet == 0 && plane.bulletnum < planeBulletMax) plane.bulletnum++;
        if (gametick % Math.floor(fps * diffT) == 0) difficulty += 0.05;
        mtro.value = plane.health / planeHealthMax;
        mtrb.value = plane.bulletnum / planeBulletMax;
        score += 0.01 * Math.sqrt(difficulty);
        sc.innerHTML = String(Math.floor(score * 100) / 100);
        gametick++;
    }
    function gameStateCheck () {
        if (plane.health <= 0) {
            clearInterval(intervalForStateCheck);
            alert('Fake');
        }
    }
    function gameMain () {
        gameinit();
        intervalForMain = setInterval(mainProc, 1000 / fps);
        intervalForStateCheck = setInterval(gameStateCheck, 1000 / fps);
    }
}