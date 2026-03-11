export class AnimationTween {
    from;
    to;
    name;
    constructor(from, to, name) {
        this.from = from;
        this.to = to;
        this.name = name;
    }
}
export class RawAnimation {
    duration;
    tweens;
    startTime = -1;
    isPlaying = false;
    callback;
    onEnd;
    constructor(duration, tweens, callback, onEnd) {
        this.onEnd = onEnd;
        this.duration = duration;
        this.tweens = tweens;
        this.callback = callback;
    }
    play() {
        this.isPlaying = true;
        requestAnimationFrame(this.playing.bind(this));
    }
    playing(ts) {
        if (this.startTime == -1)
            this.startTime = ts;
        let values = {};
        this.tweens.forEach((tween) => {
            values[tween.name] = ((ts - this.startTime) / this.duration) * (tween.to - tween.from) + tween.from;
        });
        if (ts - this.startTime < this.duration && this.isPlaying) {
            requestAnimationFrame(this.playing.bind(this));
        }
        else {
            this.tweens.forEach((tween) => {
                values[tween.name] = tween.to;
            });
            this.callback(values);
            if (this.onEnd) {
                this.onEnd();
            }
            this.isPlaying = false;
            this.startTime = -1;
            return;
        }
        this.callback(values);
    }
    stop() {
        this.isPlaying = false;
    }
}
//# sourceMappingURL=animation.js.map