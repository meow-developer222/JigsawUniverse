export class AnimationTween
{
    from: number;
    to: number;
    name: string;

    constructor(from: number, to: number, name: string)
    {
        this.from = from;
        this.to = to;
        this.name = name;
    }
}


export class RawAnimation
{
    duration: number;
    tweens: Array<AnimationTween>;
    startTime: number = -1;
    isPlaying: boolean = false;
    callback: Function;
    onEnd: Function | undefined;

    constructor(duration: number, tweens: Array<AnimationTween>, callback: Function, onEnd?: Function)
    {
        this.onEnd = onEnd
        this.duration = duration;
        this.tweens = tweens;
        this.callback = callback
    }

    play()
    {
        
        this.isPlaying = true;
        requestAnimationFrame(this.playing.bind(this))
    }


    playing(ts: number)
    {
        
        if (this.startTime == -1) this.startTime = ts;
        let values: { [key: string]: number;} = {};

        this.tweens.forEach(
            (tween) => {
                values[tween.name] = ((ts - this.startTime) / this.duration) * (tween.to - tween.from) + tween.from;
            }
        )
        
        if (ts - this.startTime < this.duration && this.isPlaying)
        {
            requestAnimationFrame(this.playing.bind(this));
        }
        else
        {
            this.tweens.forEach(
                (tween) => {
                    values[tween.name] = tween.to;
                }
            )
            this.callback(values);
            if (this.onEnd)
            {
                this.onEnd();
            }
            this.isPlaying = false;
            this.startTime = -1;
            return;
        }
        this.callback(values);
        
    }
    stop()
    {
        this.isPlaying = false;
    }
}