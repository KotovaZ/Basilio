import { IBody, Body } from "./body";
import Component from "../component.ts";
import {Unit} from "./unit/unit";
import gravity from "../gravity";
import {Position} from "../entity";
import {Particles} from "./particles";

export class Jetpack extends Unit {
    position: Position;
    trackable = false;
    parent: Unit;
    private active:boolean = false;

    constructor(parent) {
        this.parent = parent;
        this.body = new Body(9, 18)
        this.getPosition();
    }

    public activate(): void {
        this.active = true;
    }

    public deactivate(): void {
        this.active = false;
    }

    getPosition() {
        const parentPosition = {...this.parent.position};
        const x = this.parent.vector.x >= 0 ? parentPosition.x - this.body.width : parentPosition.x + this.parent.body.width - 8;
        const y = parentPosition.y ;
        this.position = {x, y};
        return this.position
    }

    render = (ctx: CanvasRenderingContext2D) => {
        let frame = this.getCurrentFrame();
        if (this.active) {
            for (let i=0; i < 20; i++) {
                let particlePosition = {x: this.position.x + window.game.random(-2, 2) + this.body.width / 2, y: this.position.y + 5};
                let particleVelocity = {x: window.game.random(-250, 250)/100 y: window.game.random(-4, 0)};
                const lifeTime = window.game.random(1, 20);
                const particleSize = 4 - Math.ceil(lifeTime/10);
                this.layer.addObject(new Particles(particlePosition, particleVelocity, lifeTime, particleSize))
            }
            this.parent.velocity.y = 3.5;
            const newVelocity = this.parent.velocity.x * (1 + 1.01 / window.game.framerate)
            this.parent.velocity.x = Math.abs(newVelocity) < 8 ? newVelocity : this.parent.velocity.x;
        }
        ctx.beginPath();
        ctx.fillStyle = '#313131';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.rect(this.getPosition().x + (this.body.width / 2) + window.camera.x, 768 - this.getPosition().y - this.parent.body.height + 5, this.body.width, this.body.height);
        ctx.fill();
        ctx.stroke();
    };

    getCurrentFrame = () => {
        return this.animations['default'].render();
    };

    animations: { [key: string]: any } = {
        'default': (() => {
            let render = () => {
            };
            return { render };
        })()
    };
}