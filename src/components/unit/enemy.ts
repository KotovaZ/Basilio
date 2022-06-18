export interface Enemy {
    enemy: number;
}

export function enemy(group: number) {
    return function test<T extends {new (...args: any[]): {}}> (target: T) {
        return class extends target implements Enemy{
            enemy: number = group;
        }
    }
}