import * as Manager from './manager';
import * as Upgrader from './upgrader';

export function run(creep: Creep): void {
    creep.memory.working = Manager.isWorking(creep);

    if (creep.memory.working) {
        const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

        // creep is suppose to find for construction sites, and go construct
        if (constructionSite) {
            const errCode = creep.build(constructionSite);

            if (errCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSite);
            }
        } else {
            // if there is no construction site, call roleUpgrader instead
            Upgrader.run(creep);
        }
    } else {
        // creep is suppose to harvest energy from the clothest source
        const source = creep.pos.findClosestByPath(FIND_SOURCES);

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) creep.moveTo(source);
    }
}
