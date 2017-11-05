export function isWorking(creep: Creep): boolean {
    if (creep.memory.working === true && creep.carry.energy === 0) {
        // creeps is bringing energy to the spawn but has no energy left
        creep.memory.working = false;
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
        // creeps is harvesting but is full
        creep.memory.working = true;
    }

    return creep.memory.working;
}
