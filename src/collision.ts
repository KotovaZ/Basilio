import {Position, Velocity} from "./entity";
import {IBody} from "./components/body";

export type Collisionable = {
    position: Position
    body: IBody
    velocity: Velocity
    getAABB: Coordinates
}

export type Coordinates = {
    min: Position,
    max: Position
}

export function collision<T extends {new (...args: any[]): {}}>(target: T) {
    return class extends target implements Collisionable{
        position: Position;
        body: IBody;
        velocity: Velocity = {y: 0, x: 0};
        getAABB = (): Coordinates => {
            return {
                min:  { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity .y },
                max: { x: this.position.x + this.body.width  + this.velocity.x, y: this.position.y + this.body.height }
            };
        }
    }
}