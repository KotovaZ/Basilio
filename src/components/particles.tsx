import { IBody, Body } from "./body";
import {Unit} from "./unit/unit";
import gravity from "../gravity";
import {collision} from "../collision";
import {Position} from "../entity";

@gravity
export class Particles extends Unit {
    trackable = false;
    position: Position;
    velocity: any;
    action: string = 'wait';

    constructor(position: Position, velocity: any, lifetime = 30, size: number) {
        this.position = position;
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.body = new Body(size, size);
        super();
    }

    render = (ctx: CanvasRenderingContext2D) => {
        let frame = this.getCurrentFrame();
        ctx.beginPath();

        switch (this.body.width) {
            case 1:
                ctx.strokeStyle = '#ffcda5'
                break;
            case 2:
                ctx.strokeStyle = '#ffb474'
                break;
            case 3:
                ctx.strokeStyle = '#ff9554'
                break;
            default:
                ctx.strokeStyle = '#69aaff'
        }

        ctx.lineWidth = 2;
        ctx.arc(this.position.x + (this.body.width / 2) + window.camera.x * this.layer.config.speed, 768 - this.position.y - this.body.height, this.body.height / 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    };

    getCurrentFrame = () => {
        return this.animations['default'].render();
    };

    animations: { [key: string]: any } = {
        'default': (() => {
            let frames = [
                {x: 23*32, y: 32},
                {x: 24*32, y: 32},
                {x: 25*32, y: 32},
            ];

            let frame = 0;
            let time = 0;

            let render = () => {
                time += 1;
                if (time % 2 / window.framerate == 0) {
                    frame += 1;
                    frame = frame < frames.length ? frame : 0;
                }
                time += 1;
                if (time >= this.lifetime) {
                    this.layer.deleteObject(this);
                }

                return frames[frame];
            };
            return { render };
        })()
    };
}