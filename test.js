{
    function getElem(s) {
        return document.getElementById(s);
    }
    class Message {
        type;
        info;
    }
    class MessageQueue {
        constructor() {
            this.queue = [];
        }
        pushMessage(msg) {
            return this.queue.push(msg);
        }
        getMessage() {
            return this.queue.shift();
        }
    }

    var msgqueue = new MessageQueue();

    class Track {
        constructor() {
            this.clear();
        }
        clear() {
            this.noteArray = [];
            this.currentNote = 0;
            this.noteCnt = 0;
        }
        pushnote(t) {
            this.noteArray.push(dt);
            this.noteCnt++;
        }
        nextnote() {
            if (this.currentNote <= this.noteCnt) return this.noteArray[this.currentNote];
            return -1;
        }
        popnote() {
            this.currentNote++;
        }
    }
    class Player {
        constructor() {
            this.clear();
        }
        clear() {
            this.tracks = [];
            this.bpm = 0;
            this.songName = '';
            this.playerElem = null;
            this.time = 0;
            this.isPlaying = false;
            this.noteStatusCnt = {
                Miss: 0,
                Late: 0,
                SLate: 0,
                Perfect: 0,
                SEarly: 0,
                Early: 0
            }
        }
        judge(t, std) {
            if (t - std > 100) return 3;
            if (t - std > 50) return 2;
            if (t - std > 20) return 1;
            if (t - std > -20) return 0;
            if (t - std > -50) return -1;
            if (t - std > -100) return -2;
            return -3;
        }
        Init(_songName, _bpm, notestr) {
            this.songName = _songName;
            this.bpm = _bpm;
            this.playerElem = getElem(_songName);
            let trmax = eval(notestr.split(';')[0]);
            let tmparr = notestr.split(';')[1].split(',');
            let t = 0;
            for (let i = 0; i < tmparr.length; i += 2) {
                let trn = eval(tmparr[i]),
                    dt = eval(tmparr[i + 1]);
                if (trn > trmax) {
                    this.clear();
                    return false;
                }
                t += dt;
                if (this.tracks.length <= trn || this.tracks[trn] == undefined) this.tracks[trn] = new Track();
                this.tracks[trn].pushnote(t);
            }
            return true;
        }
        next() {
            let nextn = this.tracks[0].nextnote(),
                p = 0;
            for (let i = 1; i < this.tracks.length; i++) {
                let t = this.tracks[i].nextnote();
                if (t < nextn) {
                    nextn = t;
                    p = i;
                }
            }
            if (nextn == -1) return null;
            return {
                trn: p,
                t: nextn
            };
        }
        Keypress(t) {
            let trn, std;
            while (true) {
                let tmp = this.next();
                if (tmp == null) return false;
                trn = tmp.trn;
                std = tmp.t;
                if (this.judge(t, std) == 3) {
                    this.noteStatusCnt.Miss++;
                    this.tracks[trn].popnote();
                } else break;
            }
            switch (this.judge(t, std)) {
                case 2:
                    this.noteStatusCnt.Late++;
                    break;
                case 1:
                    this.noteStatusCnt.SLate++;
                    break;
                case 0:
                    this.noteStatusCnt.Perfect++;
                    break;
                case -1:
                    this.noteStatusCnt.SEarly++;
                    break;
                case -2:
                    this.noteStatusCnt.Early++;
                    break;
                case -3:
                    this.noteStatusCnt.Miss++;
                    return;
            }
            this.tracks[trn].popnote();
        }
        Update() {
            if (!this.isPlaying) return;
            while (true) {
                let msg = msgqueue.getMessage();
                if (msg == undefined) break;
                let type = msg.type,
                    t = msg.info;
                switch (type) {
                    case 0:
                        this.Keypress(t);
                        break;
                }
            }
        }
    }
    class Game {
        Init() {
            this.player = new Player();
            if (!this.player.Init('test', 320, '0;0,1,0,1,0,1,0,1,0,1,')) {
                return false;
            }
            this.intv = -1;
            this.fps = 30;
            document.addEventListener('keydown', function (e) {
                //time
            });
            return true;
        }
        Run() {
            this.intv = setInterval((e) => {
                e.Update();
            }, 1000 / this.fps, this.player);
        }
        Shutdown() {
            clearInterval(this.intv);
        }
    }

    function main() {
        let game = new Game();
        if (!game.Init()) return;
        game.Run();
    }

}