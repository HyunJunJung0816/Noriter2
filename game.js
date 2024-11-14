class RhythmGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.notes = [];
        this.lanes = 4;
        this.laneWidth = this.canvas.width / this.lanes;
        this.isPlaying = false;
        
        // 키 매핑
        this.keyMap = {
            's': 0,
            'd': 1,
            'j': 2,
            'k': 3
        };
        
        // 레인 활성화 상태
        this.activeLanes = new Array(this.lanes).fill(false);
        
        // 파티클과 히트 이펙트
        this.particles = [];
        this.hitEffects = [];

        // 이벤트 리스너
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 게임 시작 (테스트를 위해 바로 시작)
        this.isPlaying = true;
        this.gameLoop();
        
        // 테스트용 노트 생성
        setInterval(() => {
            if (this.isPlaying) {
                this.createNote();
            }
        }, 1000); // 1초마다 노트 생성
    }

    createNote() {
        const lane = Math.floor(Math.random() * this.lanes);
        this.notes.push({
            x: lane * this.laneWidth,
            y: 0,
            lane: lane,
            speed: 5
        });
    }

    createParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 5 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`
            });
        }
    }

    createHitEffect(lane) {
        const x = lane * this.laneWidth + this.laneWidth / 2;
        const y = this.canvas.height - 50;
        this.hitEffects.push({
            x: x,
            y: y,
            size: 0,
            opacity: 1
        });
    }

    handleKeyDown(event) {
        if (!this.isPlaying) return;

        if (this.keyMap[event.key] !== undefined) {
            const lane = this.keyMap[event.key];
            this.activeLanes[lane] = true;
            
            // 파티클 생성
            const x = lane * this.laneWidth + this.laneWidth / 2;
            const y = this.canvas.height - 50;
            this.createParticles(x, y);
            
            this.checkHit(lane);
        }
    }

    handleKeyUp(event) {
        if (this.keyMap[event.key] !== undefined) {
            const lane = this.keyMap[event.key];
            this.activeLanes[lane] = false;
        }
    }

    checkHit(lane) {
        const hitZone = this.canvas.height - 50;
        const hitThreshold = 30;

        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            if (note.lane === lane) {
                const distance = Math.abs(note.y - hitZone);
                if (distance < hitThreshold) {
                    this.createHitEffect(lane);
                    this.notes.splice(i, 1);
                    console.log('Hit!');
                    return;
                }
            }
        }
    }

    update() {
        // 노트 업데이트
        this.notes.forEach((note, index) => {
            note.y += note.speed;
            if (note.y > this.canvas.height) {
                this.notes.splice(index, 1);
                console.log('Miss!');
            }
        });

        // 파티클 업데이트
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            return particle.life > 0;
        });

        // 히트 이펙트 업데이트
        this.hitEffects = this.hitEffects.filter(effect => {
            effect.size += 10;
            effect.opacity -= 0.05;
            return effect.opacity > 0;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 레인 그리기
        for (let i = 0; i < this.lanes; i++) {
            // 레인 배경
            this.ctx.fillStyle = this.activeLanes[i] ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(i * this.laneWidth, 0, this.laneWidth, this.canvas.height);
            
            // 레인 구분선
            if (i > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(i * this.laneWidth, 0);
                this.ctx.lineTo(i * this.laneWidth, this.canvas.height);
                this.ctx.strokeStyle = '#333';
                this.ctx.stroke();
            }
        }

        // 히트 이펙트 그리기
        this.hitEffects.forEach(effect => {
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${effect.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        // 파티클 그리기
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(0, 255, 255, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 노트 그리기
        this.notes.forEach(note => {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(note.x + 2, note.y, this.laneWidth - 4, 20);
        });

        // 판정선 그리기
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 50);
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();

        // 키 가이드 그리기
        const keys = ['S', 'D', 'J', 'K'];
        this.ctx.font = '20px Arial';
        for (let i = 0; i < this.lanes; i++) {
            const x = i * this.laneWidth + this.laneWidth / 2;
            const y = this.canvas.height - 20;
            
            // 키 버튼 배경
            this.ctx.fillStyle = this.activeLanes[i] ? '#fff' : '#333';
            this.ctx.fillRect(x - 15, y - 20, 30, 30);
            
            // 키 텍스트
            this.ctx.fillStyle = this.activeLanes[i] ? '#000' : '#fff';
            this.ctx.fillText(keys[i], x - 10, y);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.onload = () => {
    new RhythmGame();
};