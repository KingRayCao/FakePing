{
    /*
        巨巨巨巨巨巨
        平  巨巨  平
      巨巨巨巨巨巨巨巨
            巨巨
            巨巨
    */
    const PI = Math.PI;
    const fps = 30;
    const diffT = 1;
    const playField = getElem('dv');
    const field = getElem('ui');
    var mtro, mtrb, sc, mtrhp;
    const width = 1000,
        height = 540;
    const planeHealthMax = 100,
        planeBulletMax = 100;
    var difficulty = 1.0;
    var intervalForMain, intervalForStateCheck, intervalForShow;
    var GameState = 0;
    var boss_num = 0,
        existBoss = false;
    var userName = '';
    var table = getElem("rank");
    var imageMap = []

    field.width = width
    field.height = height
    window.addEventListener('resize', (s, e) => {
        field.width = width
        field.height = height
    })

    function getElem(s) {
        return document.getElementById(s);
    }

    function isJSON(str) {
        if (typeof str == 'string') {
            try {
                let obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }

            } catch (e) {
                console.log('error：' + str + '!!!' + e);
                return false;
            }
        }
    }

    class Datatransfer {
        write_record(sc) {
            let request = new XMLHttpRequest();
            request.open('post', 'record.php');
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send("action=write&username=" + userName + "&score=" + String(sc));
            request.onreadystatechange = function () {
                if (request.readyState == 4 && (request.status == 200 || request.status == 304)) {
                    alert(request.responseText);
                }
            }
        }
        read_record() {
            let request = new XMLHttpRequest();
            let receive, str = '';
            let list;
            request.open('post', 'record.php');
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send("action=read");
            request.onreadystatechange = function () {
                if (request.readyState == 4 && (request.status == 200 || request.status == 304)) {
                    receive = request.responseText;
                    if (isJSON(receive)) {
                        list = eval("(" + receive + ")");
                    }
                    for (let i = 0; i < Math.min(10, list.length); i++) {
                        str += '<tr><td>' + list[i].name + '</td><td>' + list[i].score + '</td><td>' + list[i].date + '</td></tr>';
                    }
                    table.innerHTML = str;
                }
            }
        }
    }

    function bump(ob1, ob2) {
        return Math.abs(ob1.pos.x - ob2.pos.x) <= (ob1.w + ob2.w) / 2 && Math.abs(ob1.pos.y - ob2.pos.y) <= (ob1.h + ob2.h) / 2;
    }

    function checkPos(_pos) {
        return _pos.x >= 0 && _pos.x <= width && _pos.y >= 0 && _pos.y <= height;
    }

    function removeobj(arr, i) {
        //arr[i].inst.remove();
        arr[i] = null;
    }

    function removeall(arr, num) {
        for (let i = 0; i < num; i++) {
            if (arr[i] != null) {
                arr[i] = null;
            }
        }
    }

    function mouseTrack() {
        document.addEventListener('mousemove', function (e) {
            let x = e.pageX - field.getBoundingClientRect().x
            let y = e.pageY - field.getBoundingClientRect().y
            if (x < 0)
                x = 0;
            if (x > width)
                x = width;
            if (y < 0)
                y = 0;
            if (y > height)
                y = height;
            plane[0].moveTo({
                x,
                y
            });
        });
    }
    var buttonPressed = {
        w: false,
        d: false,
        s: false,
        a: false,
        space: false
    };

    function keyboardCtrl() {
        document.addEventListener('keydown', Plane.onKeyDown);
        document.addEventListener('keyup', Plane.onKeyUp);
    }

    class Entity {
        constructor(_name, _w, _h, _picsrc, _class, _health, _speed, _imgTransform = undefined) {
            this.name = _name;
            this.inst = null;
            this.parentObj = null;
            this.pos = {
                x: width / 2,
                y: height / 2
            };
            this.w = _w;
            this.h = _h;
            this.picsrc = _picsrc;
            this.class = _class;
            this.health = _health;
            this.speed = _speed;
            this.imgTransform = _imgTransform
        }
        appendTo() {


            /*this.inst = document.createElement('img');
            this.inst.src = this.picsrc;
            this.inst.style.position = 'absolute';
            this.inst.className = this.class;
            playField.appendChild(this.inst);*/
            this.drawPos();
        }
        drawPos() {
            if (imageMap[this.picsrc] == undefined) {
                let img = new Image()
                img.src = this.picsrc
                img.className += this.class
                img.style.width = String(this.w) + 'px'
                img.style.height = String(this.h) + 'px'
                imageMap[this.picsrc] = img
            }

            let context = ui.getContext("2d")
            context.drawImage(imageMap[this.picsrc], 0, 0, imageMap[this.picsrc].width, imageMap[this.picsrc].height, this.pos.x - this.w / 2, this.pos.y - this.h / 2
                , this.w, this.h)

            /*this.inst.style.left = String(this.pos.x - this.w / 2) + 'px';
            this.inst.style.top = String(this.pos.y - this.h / 2) + 'px';
            this.inst.style.width = String(this.w) + 'px';
            this.inst.style.height = String(this.h) + 'px';*/
        }
    }

    class Plane extends Entity {
        constructor() {
            super('Plane', 100, 100, 'img/plane.png', 'PlaneRight', planeHealthMax, 10)
            this.ctrlMode = 1; //1:mouse 2:keyboard
            this.bulletnum = planeBulletMax;
            this.tickperbullet = 5;
            this.appendTo();
            this.wudi = false;
            this.direction = 0; //0 right
        }
        moveByStep(d) { //0 up 1 right 2 down 3 left
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
        moveTo(_pos) {
            this.pos = _pos;
        }
        updatePos() {
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
        }
        shoot() {
            if (this.bulletnum == 0) return;
            let x = this.pos.x,
                y = this.pos.y;
            all_bul[buln] = new Bullet({
                x,
                y
            });
            all_bul[buln++].parentObj = this;
            this.bulletnum--;
        }
        static onKeyDown(e) {
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
                case 'v':
                    plane[0].direction = 1 - plane[0].direction;
                    if (plane[0].direction == 1) {
                        plane[0].inst.className = 'PlaneLeft';
                    } else {
                        plane[0].inst.className = 'PlaneRight';
                    }
                    break;
                case ' ':
                    buttonPressed.space = true;
                    break;
            }
        }
        static onKeyUp(e) {
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
        }
    }
    class Vegetable extends Entity {
        constructor() {
            super('Vegetable', 20, 20, 'img/vege.png', 'Vegetable', 5, 5);
            this.theta = PI;
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            if (GameState == 1) {
                this.theta += Math.random() * PI / 480 - PI / 960;
                if (this.parentObj == null || this.parentObj.name != 'VegetableKing') {
                    if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
                    if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
                }
            } else if (GameState == 0) {
                this.theta = Math.random() * PI * 2;
                r = 5;
            }
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
    }
    class Bullet extends Entity {
        constructor(_pos) {
            super('Bullet', 5, 5, 'img/bul.png', 'Bullet', 0, 5);
            this.pos = _pos;
            this.damage = 10;
            this.appendTo();
            this.theta = plane[0].direction * PI;
        }
        updatePos() {
            this.pos.x += this.speed * Math.cos(this.theta);
            this.pos.y -= this.speed * Math.sin(this.theta);
        }
    }
    class VegetableKing extends Entity {
        constructor() {
            super('VegetableKing', 50, 50, 'img/vege.png', 'VegetableKing', 10, 2);
            this.theta = PI;
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.splitcnt = 8;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            if (GameState == 1) {
                this.theta += Math.random() * PI / 480 - PI / 960;
                if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
                if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
            }
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
        split() {
            for (let i = 0; i < this.splitcnt; i++) {
                all_veg[vegn] = new Vegetable();
                all_veg[vegn].parentObj = this;
                all_veg[vegn].pos.x = this.pos.x;
                all_veg[vegn].pos.y = this.pos.y;
                all_veg[vegn].theta = 2 * PI / this.splitcnt * i;
                all_veg[vegn].pos.x += 10 * Math.cos(all_veg[vegn].theta);
                all_veg[vegn].pos.y -= 10 * Math.sin(all_veg[vegn].theta);
                all_veg[vegn].speed *= 10;
                vegn++;
            }
        }
    }
    class Boss extends Entity {
        constructor() {
            super('Boss', 100, 100, 'img/vege.png', 'Boss', Math.sqrt(boss_num) * 1000, 2);
            this.theta = PI;
            this.maxHealth = Math.sqrt(boss_num) * 1000;
            this.pos.x = Math.random() * width / 2 + width / 2;
            this.pos.y = Math.random() * height;
            while (bump(this, plane[0])) {
                this.pos.x = Math.random() * width / 2 + width / 2;
                this.pos.y = Math.random() * height;
            }
            this.splitcnt = 10;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            let dx = plane[0].pos.x - this.pos.x;
            let dy = plane[0].pos.y - this.pos.y;
            let dis = Math.sqrt(dx ** 2 + dy ** 2);
            this.pos.x += r * dx / dis;
            this.pos.y += r * dy / dis;
        }
        split() {
            for (let i = 0; i < this.splitcnt; i++) {
                if (Math.random() <= 0.95) {
                    all_veg[vegn] = new Vegetable();
                    all_veg[vegn].parentObj = this;
                    all_veg[vegn].pos.x = this.pos.x + 10 * Math.cos(all_veg[vegn].theta);
                    all_veg[vegn].pos.y = this.pos.y - 10 * Math.sin(all_veg[vegn].theta);
                    all_veg[vegn].theta = 2 * PI / this.splitcnt * i;
                    all_veg[vegn].speed *= 3;
                    vegn++;
                } else {
                    all_vk[vkn] = new VegetableKing();
                    all_vk[vkn].parentObj = this;
                    all_vk[vkn].pos.x = this.pos.x + 10 * Math.cos(all_vk[vkn].theta);
                    all_vk[vkn].pos.y = this.pos.y - 10 * Math.cos(all_vk[vkn].theta);
                    all_vk[vkn].theta = 2 * PI / this.splitcnt * i;
                    all_vk[vkn].speed *= 3;
                    vkn++;
                }
            }
        }
    }
    class Pingnut extends Entity {
        constructor() {
            super('Pingnut', 50, 50, 'img/pingnut.png', 'Pingnut', 10, 2);
            this.theta = PI;
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.splitcnt = 30;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            this.theta += Math.random() * PI / 480 - PI / 960;
            if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
            if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
        split() {
            for (let i = 0; i < this.splitcnt; i++) {
                let x = this.pos.x,
                    y = this.pos.y;
                all_bul[buln] = new Bullet({
                    x,
                    y
                });
                all_bul[buln].theta = 2 * PI / this.splitcnt * i;
                all_bul[buln].speed *= 8;
                all_bul[buln++].parentObj = this;
            }
        }
    }
    class Oiltank extends Entity {
        constructor() {
            super('Oiltank', 30, 50, 'img/oiltank.png', 'Oiltank', 10, 2);
            this.theta = PI;
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            this.theta += Math.random() * PI / 480 - PI / 960;
            if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
            if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
    }
    class Shield extends Entity {
        constructor() {
            super('Shield', 50, 50, 'img/shield.png', 'Shield', 10, 2);
            this.theta = PI;
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            this.theta += Math.random() * PI / 480 - PI / 960;
            if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
            if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
    }
    class BulletBox extends Entity {
        constructor() {
            super('BulletBox', 50, 50, 'img/bulbox.png', 'BulletBox', 10, 2);
            this.theta = PI;
            this.pos.x = width;
            this.pos.y = Math.random() * height;
            this.appendTo();
        }
        updatePos() {
            let r = this.speed * Math.sqrt(difficulty) * Math.random();
            this.theta += Math.random() * PI / 480 - PI / 960;
            if (this.theta < 0.5 * PI) this.theta = 0.5 * PI;
            if (this.theta > 1.5 * PI) this.theta = 1.5 * PI;
            this.pos.x += r * Math.cos(this.theta);
            this.pos.y -= r * Math.sin(this.theta);
        }
    }

    function welcomePage() {
        GameState = 0;
        let tmp_veg = [];
        let tmp_vegn = 50;

        function vegTremble() {
            for (let i = 0; i < tmp_vegn; i++) {
                tmp_veg[i].updatePos();
            }
            for (let i = 0; i < tmp_vegn; i++) {
                tmp_veg[i].drawPos();
            }
        }
        for (let i = 0; i < tmp_vegn; i++) {
            tmp_veg.push(new Vegetable());
            tmp_veg[i].pos.x = Math.random() * width;
            tmp_veg[i].pos.y = Math.random() * height;
        }
        intervalForShow = setInterval(vegTremble, 1000 / fps);
    }

    class Game {
        constructor() {

        }
        static Init(_ctrlMode) {
            mtro = getElem('mtro');
            mtrb = getElem('mtrb');
            sc = getElem('sc');
            plane.push(new Plane());
            plane[0].ctrlMode = _ctrlMode;
            vegn = Math.floor(Math.log2(difficulty + 1) * 4);
            for (let i = 0; i < vegn; i++) {
                all_veg.push(new Vegetable());
            }
        }
        static Die(word = '菜偷走了你的燃油，你发生了空难……你的得分：') { //OnPlayerDeath
            clearInterval(intervalForMain); //stop message loop
            mtro.value = 0;
            mtrb.value = 0;
            transferer.write_record(Math.floor(score * 100) / 100);
            alert(word + String(Math.floor(score * 100) / 100));
        }
        static Bumpevent(arr1, n1, arr2, n2, eventHandler) { //Collide
            for (let i = 0; i < n1; i++) {
                if (arr1[i] != null && arr1[i].name != "Plane" && !checkPos(arr1[i].pos)) {
                    removeobj(arr1, i);
                }
            }
            for (let i = 0; i < n2; i++) {
                if (arr2[i] != null && arr2[i].name != "Plane" && !checkPos(arr2[i].pos)) {
                    removeobj(arr2, i);
                }
            }
            for (let i = 0; i < n1; i++) {
                if (arr1[i] == null) continue;
                for (let j = 0; j < n2; j++) {
                    if (arr1[i] == null) break;
                    if (arr2[j] != null && bump(arr1[i], arr2[j])) {
                        eventHandler(arr1, arr2, i, j);
                    }
                }
            }
        }
        static Update() {
            if (plane[0].health <= 0) return;
            if (!plane[0].wudi) {
                //plane[0] with vegetable[]
                Game.Bumpevent(plane, 1, all_veg, vegn, function (arr1, arr2, i, j) {
                    arr1[i].health -= 10;
                    removeobj(arr2, j);
                    if (arr1[i].health <= 0) {
                        Game.Die();
                    }
                });
                //plane[0] with vegking
                Game.Bumpevent(plane, 1, all_vk, vkn, function (arr1, arr2, i, j) {
                    arr1[i].health -= 20;
                    removeobj(arr2, j);
                    if (arr1[i].health <= 0) {
                        Game.Die();
                    }
                });
            }
            //bullet[] with vegking
            Game.Bumpevent(all_bul, buln, all_vk, vkn, function (arr1, arr2, i, j) {
                arr2[j].health -= arr1[i].damage;
                removeobj(arr1, i);
                if (arr2[j].health <= 0) {
                    arr2[j].split();
                    removeobj(arr2, j);
                    score += 15;
                }
            });
            //bullet[] with vegetable[]
            Game.Bumpevent(all_bul, buln, all_veg, vegn, function (arr1, arr2, i, j) {
                arr2[j].health -= arr1[i].damage;
                removeobj(arr1, i);
                if (arr2[j].health <= 0) {
                    removeobj(arr2, j);
                    score += 10;
                }
            });
            //plane[0] with oiltank
            Game.Bumpevent(plane, 1, all_ot, otn, function (arr1, arr2, i, j) {
                arr1[i].health = Math.min(arr1[i].health + 15, planeHealthMax);
                removeobj(arr2, j);
                otn--;
            });
            //plane with shield
            Game.Bumpevent(plane, 1, all_sd, sdn, function (arr1, arr2, i, j) {
                arr1[i].picsrc = 'img/plane_wudi.png';
                arr1[i].wuditick = gametick;
                arr1[i].wudi = true;
                removeobj(arr2, j);
                sdn--;
            });
            Game.Bumpevent(plane, 1, all_bb, bbn, function (arr1, arr2, i, j) {
                arr1[i].bulletnum = Math.max(plane[0].bulletnum + 20, planeBulletMax);
                removeobj(arr2, j);
                bbn--;
            });
            //bullet with Pingnut
            Game.Bumpevent(all_bul, buln, all_pn, pnn, function (arr1, arr2, i, j) {
                arr2[j].health -= arr1[i].damage;
                removeobj(arr1, i);
                if (arr2[j].health <= 0) {
                    arr2[j].split();
                    removeobj(arr2, j);
                    score += 15;
                    pnn--;
                }
            });
            if (GameState == 2 && boss[0] != null) {
                Game.Bumpevent(all_bul, buln, boss, 1, function (arr1, arr2, i, j) {
                    arr2[j].health -= arr1[i].damage;
                    removeobj(arr1, i);
                    if (arr2[j].health <= 0) {
                        removeobj(arr2, j);
                        mtrhp.remove();
                        mtrhp = null;
                        score += 500;
                        GameState = 1;
                    }
                });
                if (!plane[0].wudi) {
                    Game.Bumpevent(plane, 1, boss, 1, function (arr1, arr2, i, j) {
                        Game.Die('殒命于Boss身下……你的得分：');
                    });
                }

            }
            //vegking[] auto split
            for (let i = 0; i < vkn; i++) {
                if (all_vk[i] != null && all_vk[i].pos.x < width / 3 && GameState == 1) {
                    all_vk[i].split();
                    removeobj(all_vk, i);
                }
            }
            //generate new items
            pnn = Math.max(Math.floor(Math.random() * 1.003), pnn);
            otn = Math.max(Math.floor(Math.random() * 1.003), otn);
            sdn = Math.max(Math.floor(Math.random() * 1.0015), sdn);
            bbn = Math.max(Math.floor(Math.random() * 1.003), bbn);
            for (let i = 0; i < pnn; i++) {
                if (all_pn[i] == null) all_pn[i] = new Pingnut();
            }
            for (let i = 0; i < otn; i++) {
                if (all_ot[i] == null) all_ot[i] = new Oiltank();
            }
            for (let i = 0; i < sdn; i++) {
                if (all_sd[i] == null) all_sd[i] = new Shield();
            }
            for (let i = 0; i < bbn; i++) {
                if (all_bb[i] == null) all_bb[i] = new BulletBox();
            }
            let tmp = 0;
            switch (GameState) {
                case 1:
                    vkn = Math.max(Math.floor(Math.log2(difficulty + 1)), vkn);
                    //new normal
                    tmp = 0;
                    let tmp2 = Math.floor(Math.log2(difficulty + 1) * 4);
                    for (let i = 0; i < vegn; i++) {
                        if (all_veg[i] != null) {
                            all_veg[tmp++] = all_veg[i];
                        }
                    }
                    for (let i = tmp; i < tmp2; i++) {
                        all_veg[i] = new Vegetable();
                    }
                    vegn = Math.max(tmp2, tmp);
                    //new vegking
                    for (let i = 0; i < vkn; i++) {
                        if (all_vk[i] == null) all_vk[i] = new VegetableKing();
                    }
                    tmp = 0;
                    //new bullet
                    for (let i = 0; i < buln; i++) {
                        if (all_bul[i] != null) all_bul[tmp++] = all_bul[i];
                    }
                    buln = tmp;

                    break;
                case 2:
                    tmp = 0;
                    for (let i = 0; i < vegn; i++) {
                        if (all_veg[i] != null) {
                            all_veg[tmp++] = all_veg[i];
                        }
                    }
                    vegn = tmp;
                    tmp = 0;
                    for (let i = 0; i < vkn; i++) {
                        if (all_vk[i] != null) {
                            all_vk[tmp++] = all_vk[i];
                        }
                    }
                    vkn = tmp;
                    tmp = 0;
                    for (let i = 0; i < buln; i++) {
                        if (all_bul[i] != null) all_bul[tmp++] = all_bul[i];
                    }
                    buln = tmp;
                    if (gametick % (Math.floor(50 / Math.log2(boss_num + 1))) == 0) {
                        boss[0].split();
                    }
                    break;
            }
            //shoot&update pos
            if (buttonPressed.space) plane[0].shoot();
            plane[0].updatePos();
            for (let i = 0; i < vegn; i++) {
                all_veg[i].updatePos();
            }
            for (let i = 0; i < buln; i++) {
                all_bul[i].updatePos();
            }
            for (let i = 0; i < vkn; i++) {
                all_vk[i].updatePos();
            }
            for (let i = 0; i < pnn; i++) {
                all_pn[i].updatePos();
            }
            for (let i = 0; i < otn; i++) {
                all_ot[i].updatePos();
            }
            for (let i = 0; i < sdn; i++) {
                all_sd[i].updatePos();
            }
            for (let i = 0; i < bbn; i++) {
                all_bb[i].updatePos();
            }
            if (GameState == 2 && boss[0] != null) {
                boss[0].updatePos();
            }
            //add bullet
            if (gametick % plane[0].tickperbullet == 0 && plane[0].bulletnum < planeBulletMax) plane[0].bulletnum++;
            if (gametick % Math.floor(fps * diffT) == 0) difficulty += 0.05;
            //judge wudi
            if (gametick - plane[0].wuditick >= 5 * fps) {
                plane[0].wudi = false;
                plane[0].picsrc = 'img/plane.png';
            }
            score += 0.01 * Math.sqrt(difficulty);
            if (score >= boss_num * 2000 + 2000) {
                GameState = 2;
                //clear all vegetables
                removeall(all_veg, vegn);
                removeall(all_vk, vkn);
                vegn = 0;
                vkn = 0;
                //new boss
                boss_num++;
                boss[0] = new Boss();
                existBoss = true;
                //hp
                mtrhp = document.createElement('meter');
                mtrhp.style.position = 'absolute';
                mtrhp.style.top = '100px';
                mtrhp.style.left = String(width / 2) + 'px';
                mtrhp.value = 1;
                playField.appendChild(mtrhp);
            }
        }
        static Draw() {
            let ctx = ui.getContext("2d")
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, width, height)

            plane[0].drawPos();
            for (let i = 0; i < vegn; i++) {
                all_veg[i].drawPos();
            }
            for (let i = 0; i < buln; i++) {
                all_bul[i].drawPos();
            }
            for (let i = 0; i < vkn; i++) {
                all_vk[i].drawPos();
            }
            for (let i = 0; i < pnn; i++) {
                all_pn[i].drawPos();
            }
            for (let i = 0; i < otn; i++) {
                all_ot[i].drawPos();
            }
            for (let i = 0; i < sdn; i++) {
                all_sd[i].drawPos();
            }
            for (let i = 0; i < bbn; i++) {
                all_bb[i].drawPos();
            }
            if (GameState == 2 && boss[0] != null) boss[0].drawPos();
            mtro.value = plane[0].health / planeHealthMax;
            mtrb.value = plane[0].bulletnum / planeBulletMax;
            if (GameState == 2 && boss[0] != null) mtrhp.value = boss[0].health / (boss[0].maxHealth);
            sc.innerHTML = String(Math.floor(score * 100) / 100);
        }

        static Run() {
            try {
                Game.Update();
                Game.Draw();
                gametick++;
            } catch (err) {
                clearInterval(intervalForMain);
                alert(err);
            }
        }
    }

    var plane = [];
    var all_veg = [],
        vegn = 0;
    var all_bul = [],
        buln = 0;
    var all_vk = [],
        vkn = 0;
    var all_pn = [],
        pnn = 0;
    var all_ot = [],
        otn = 0;
    var boss = [null];
    var transferer = new Datatransfer();
    var all_sd = [],
        sdn = 0;
    var all_bb = [],
        bbn = 0;
    var gametick = 0,
        score = 0;

    function gameMain() {
        let perimeters = window.location.search;
        let ctrlMode = parseInt(perimeters.slice(1).split('&')[0].split('=')[1]);
        userName = perimeters.slice(1).split('&')[1].split('=')[1];
        transferer.read_record();
        Game.Init(ctrlMode);
        GameState = 1;
        switch (plane[0].ctrlMode) {
            case 1:
                mouseTrack();
                keyboardCtrl();
                break;
            case 2:
                keyboardCtrl();
                break;
        }
        intervalForMain = setInterval(Game.Run, 1000 / fps);
    }
}