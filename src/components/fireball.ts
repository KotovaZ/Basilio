import {IBody, Body} from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import gravity from "../gravity";
import {collision} from "../collision";
import {Position} from "../entity";

@collision
@gravity
export class Fireball extends Unit {
    trackable = true;
    body: IBody;
    action: string = 'default';
    speed: number = 32 * 10;
    private lineWidth: number = 2;

    constructor(public position: Position, vector: any) {
        this.body = new Body(12, 12);
        this.vector = vector;
        this.velocity = {y: 0, x: 1 * this.vector.x};
        super();
    }

    render = (ctx: CanvasRenderingContext2D) => {
        if (this.collisions[90] || this.collisions[270]) {
            this.vector.x = this.vector.x * -1;
        }

        if (this.collisions[180] || this.collisions[270]) {
            this.velocity.y = 240 / window.framerate;
        }

        this.getCurrentFrame();
        ctx.beginPath();
        ctx.fillStyle = '#ff7500';
        ctx.strokeStyle = '#aa0000';
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.position.x + (this.body.width / 2) + window.camera.x, 768 - this.position.y - this.body.height, this.body.height / 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    };

    getCurrentFrame = () => {
        return this.animations[this.action].render();
    };

    animations: { [key: string]: any } = {
        'default': (() => {
            let time = 0;
            return {
                render: () => {
                    time += 1;
                    this.velocity.x = this.vector.x * this.speed / window.framerate;
                    if (time > window.framerate * 4)
                        this.layer.deleteObject(this)

                    return {x: 22 * 32 + 1, y: 33}
                }
            };
        })()
    };
}