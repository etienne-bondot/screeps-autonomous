import * as repairer from './repairer';

export function run(creep: Creep): void {
    if (creep.memory.working === true && creep.carry.energy === 0) {
        // creeps is bringing energy to the spawn but has no energy left
        creep.memory.working = false;
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
        // creeps is harvesting but is full
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        const hitMax = 3000000; // wall hit max. Quick fix because rampart were repaired only 300.
        const structures = creep.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s: Structure) => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART
        });

        let target;
        for (let percentage = 0.0001; percentage < 1.0 && !target; percentage += 0.001) {
            target = _.find(structures, (s: Structure) => s.hits / hitMax < percentage);
        }

        // creep is suppose to find for construction sites, and go construct
        if (target) {
            const errCode = creep.repair(target);

            if (errCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            // if there is no construction site, call roleRepairer instead
            repairer.run(creep);
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
};
