import * as Manager from './manager';

export function run(creep: Creep): void {
    creep.memory.working = Manager.isWorking(creep);

    if (creep.memory.working) {
        // creep is suppose to upgrade the controller of the room
        const controller = creep.room.controller;

        if (controller) {
            const errCode = creep.transfer(controller, RESOURCE_ENERGY);

            if (errCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }
    } else {
        // creep is suppose to harvest energy from the clothest source
        const source = creep.pos.findClosestByPath<Source>(FIND_SOURCES);

        if (source) {
            const errCode = creep.harvest(source);

            if (errCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
}
