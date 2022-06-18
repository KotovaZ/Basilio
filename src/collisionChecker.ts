import {Collisionable} from "./collision";
import {Enemy} from "./components/unit/enemy";

export default class CollisionChecker {
    public hasCollision(a, b): boolean {
        if (a.max.x  < b.min.x || a.min.x > b.max.x) return false;
        if (a.max.y < b.min.y || a.min.y > b.max.y) return false;

        return true;
    }

    public checkTop(a: Collisionable, b: Collisionable): boolean {
        if (
            a.velocity.y > 0 &&
            a.getAABB().min.y < b.getAABB().min.y &&
            a.getAABB().max.y >= b.getAABB().min.y &&
            a.getAABB().max.x != b.getAABB().min.x &&
            a.getAABB().min.x != b.getAABB().max.x &&
            a.getAABB().max.y < b.getAABB().max.y
        ) return true;
        return  false;
    }

    public checkBottom(a: Collisionable, b: Collisionable): boolean {
        if (
            a.velocity.y <= 0 &&
            a.getAABB().max.y > b.getAABB().max.y &&
            a.getAABB().min.y <= b.getAABB().max.y &&
            a.getAABB().min.y > b.getAABB().min.y
        ) return true;
        return  false;
    }

    public checkRight(a: Collisionable, b: Collisionable): boolean {
        if (
            a.velocity.x > 0 &&
            a.getAABB().min.x < b.getAABB().min.x &&
            a.getAABB().max.x + a.velocity.x >= b.getAABB().min.x &&
            a.getAABB().max.x + a.velocity.x <= b.getAABB().max.x &&
            a.getAABB().min.y !== b.getAABB().max.y
        ) {
            return true
        };
        return  false;
    }

    public checkLeft(a: Collisionable, b: Collisionable): boolean {
        if (
            a.velocity.x < 0 &&
            a.getAABB().max.x > b.getAABB().max.x &&
            a.getAABB().min.x + a.velocity.x <= b.getAABB().max.x &&
            a.getAABB().min.x + a.velocity.x  >= b.getAABB().min.x &&
            a.getAABB().min.y !== b.getAABB().max.y
        ) return true;
        return  false;
    }
}