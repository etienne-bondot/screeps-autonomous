import {DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL} from '../../../config';
import * as Manager from './manager';

export function run(creep: Creep): void {
    const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    creep.memory.working = Manager.isWorking(creep);

    // check if need to renew
    if (creep.ticksToLive < DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL) {
        const errCode = spawn.renewCreep(creep);

        if (errCode === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
    } else if (creep.memory.working) {
        // search for the clothest and not full structure of type SPAWN | EXTENSION | TOWER
        let clothestEnergyStructure = creep.pos.findClosestByPath<Structure>(FIND_MY_STRUCTURES, {
            filter: (s: Structure) => (s.structureType === STRUCTURE_SPAWN
                || s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_TOWER)
                && s.energy < s.energyCapacity
        });

        if (!clothestEnergyStructure) {
            // search for the clothest and not full structure of type CONTAINER
            clothestEnergyStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s: Storage) => s.structureType === STRUCTURE_STORAGE && _.sum(s.store) < s.storeCapacity
            });

            // take the main SPAWN as default if no empty structure was found
            if (!clothestEnergyStructure) {
                clothestEnergyStructure = spawn;
            }
        }

        if (clothestEnergyStructure) {
            // creep is suppose to transfer energy to the spawn
            const errCode = creep.transfer(clothestEnergyStructure, RESOURCE_ENERGY);

            if (errCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(clothestEnergyStructure);
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
