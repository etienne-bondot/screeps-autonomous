import * as Builder from './builder';
import * as Manager from './manager';

export function run(creep: Creep): void {
    creep.memory.working = Manager.isWorking(creep);

    if (creep.memory.working) {
        const structureNeedToBeRepaired = creep.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
            filter: (s: Structure) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
                && s.structureType !== STRUCTURE_RAMPART
        });

        // creep is suppose to find for construction sites, and go construct
        if (structureNeedToBeRepaired) {
            const errCode = creep.repair(structureNeedToBeRepaired);

            if (errCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(structureNeedToBeRepaired);
            }
        } else {
            // if there is no construction site, call roleUpgrader instead
            Builder.run(creep);
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
