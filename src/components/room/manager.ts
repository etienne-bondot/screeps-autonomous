import * as Config from '../../config';
import {log} from '../../lib/logger/log';
import * as Builder from '../creeps/roles/builder';
import * as Harvester from '../creeps/roles/harvester';
import * as Repairer from '../creeps/roles/repairer';
import * as Upgrader from '../creeps/roles/upgrader';
import * as WallRepairer from '../creeps/roles/wallRepairer';

const _runningProcesses = {
    [Config.ROLES.EMERGENCY]: Harvester.run,
    [Config.ROLES.HARVESTER]: Harvester.run,
    [Config.ROLES.UPGRADER]: Upgrader.run,
    [Config.ROLES.BUILDER]: Builder.run,
    [Config.ROLES.REPAIRER]: Repairer.run,
    [Config.ROLES.WALL_REPAIRER]: WallRepairer.run,
};

export function run(room: Room): void {
    const creeps = room.find<Creep>(FIND_MY_CREEPS);
    const creepCount = _.size(creeps);
    // Iterate through each creep and push them into the role array.
    const harvesters = _.filter(creeps, (creep: Creep) => creep.memory.role === Config.ROLES.HARVESTER).length;
    const builders = _.filter(creeps, (creep: Creep) => creep.memory.role === Config.ROLES.BUILDER).length;
    const upgraders = _.filter(creeps, (creep: Creep) => creep.memory.role === Config.ROLES.UPGRADER).length;
    const repairers = _.filter(creeps, (creep: Creep) => creep.memory.role === Config.ROLES.REPAIRER).length;
    const wallRepairers = _.filter(creeps, (creep: Creep) => creep.memory.role === Config.ROLES.WALL_REPAIRER).length;
    const spawns = room.find<Spawn>(FIND_MY_SPAWNS, {
        filter: (spawn: Spawn) => {
            return spawn.spawning === null;
        },
    });

    log.info('Clue: getting reports...');

    if (creepCount === 0) {
        _.each(spawns, (spawn: Spawn) => {

            // start emergency sequence
            spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], `emergency_${Game.time.toString()}`, {
                memory: {
                    level: 1,
                    role: Config.ROLES.HARVESTER,
                    working: false,
                }
            });
        });
    }

    /**
     * Auto-spawning
     * Count the number of creeps alive for each role,
     * Then check if there is enough creep for each role (defined by MIN_[ROLE]S in Config.js)
     * If there are not enough creep in a role, role.controller is responsible for trying to spawn a creep in that role.
     */
    _.each(spawns, (spawn: Spawn) => {
        if (harvesters < Config.MIN_HARVESTERS) {
            _spawnCreep(spawn, Config.ROLES.HARVESTER);
        } else if (upgraders < Config.MIN_UPGRADERS) {
            _spawnCreep(spawn, Config.ROLES.UPGRADER);
        } else if (builders < Config.MIN_BUILDERS) {
            _spawnCreep(spawn, Config.ROLES.BUILDER);
        } else if (repairers < Config.MIN_REPAIRERS) {
            _spawnCreep(spawn, Config.ROLES.REPAIRER);
        } else if (wallRepairers < Config.MIN_WALL_REPAIRERS) {
            _spawnCreep(spawn, Config.ROLES.WALL_REPAIRER);
        }
    });

    /**
     * Lead a creep to his job for a good day of work :)
     *
     * @param creep
     */
    try {
        _.each(creeps, (creep: Creep) => {
            _runningProcesses[creep.memory.role](creep);
        });
    } catch (err) {
        log.info(`err: core.controller: lead: ${err}`);
    }

    /**
     * Towers
     */
    const towers: Tower = room.find<Tower>(FIND_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_TOWER
    });

    for (const tower of towers) {
        const target: Creep = tower.pos.findClosestByRange<Creep>(tower.pos.findInRange(FIND_HOSTILE_CREEPS, 10));
        const damagedStructure = tower.pos.findClosestByRange(tower.pos.findInRange(FIND_STRUCTURES, 10, {
            filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
        }));

        if (target) {
            tower.attack(target);
        } else if (damagedStructure) {
            tower.repair(damagedStructure);
        }
    }

    /**
     * Game information
     */
    if (Config.ENABLE_DEBUG_MODE) {
        log.info(`
            Game information:
            Number of harvesters    : ${harvesters}/${Config.MIN_HARVESTERS} ${_getLevels(room, creeps, Config.ROLES.HARVESTER)}
            Number of upgraders     : ${upgraders}/${Config.MIN_UPGRADERS} ${_getLevels(room, creeps, Config.ROLES.UPGRADER)}
            Number of builders      : ${builders}/${Config.MIN_BUILDERS} ${_getLevels(room, creeps, Config.ROLES.BUILDER)}
            Number of repairers     : ${repairers}/${Config.MIN_REPAIRERS} ${_getLevels(room, creeps, Config.ROLES.REPAIRER)}
            Number of wall repairers: ${wallRepairers}/${Config.MIN_WALL_REPAIRERS} ${
            _getLevels(room, creeps, Config.ROLES.WALL_REPAIRER)
            }
            Room  :
                name                : ${room.name}
                energy available    : ${room.energyAvailable}
            ${_getSpawnInformation(spawns)}
        `);
    }

}

function _spawnCreep(spawn: Spawn, role: string): void {
    const uuid: number = Memory.uuid;
    const name = `${spawn.room.name}-${role}${uuid}`;
    const testIfCanSpawn = spawn.createCustomCreep(spawn.room, `${name}`, role, {dryRun: true});

    if (testIfCanSpawn === OK) {
        Memory.uuid = uuid + 1;

        const errCode = spawn.createCustomCreep(spawn.room, `${name}`, role);
        log.info(`~~ Spawning ${name}: ${_.find(Config.ERRORS, {value: errCode}).desc}`);
    } else if (testIfCanSpawn !== ERR_BUSY && testIfCanSpawn !== ERR_NOT_ENOUGH_ENERGY) {
        log.info(`err: core: _create: cannot spawn[(${testIfCanSpawn})]: ${_.find(Config.ERRORS, {
            value: testIfCanSpawn
        }).desc}`);
    }
}

function _getLevels(room: Room, creeps: Creep[], role: string): string {
    const creepsCountByLevel = [];

    for (let level = room.controller.level; level > 0; level--) {
        creepsCountByLevel.unshift(`[${level}:${_.filter(creeps, (c: Creep) => c.memory.role === role
            && c.memory.level === level).length}]`);
    }
    return creepsCountByLevel.join('');
}

function _getSpawnInformation(spawns: Spawn[]): string {
    const result: string[] = [];

    _.each(spawns, (spawn: Spawn) => {
        result.push(`Spawn :
                name                : ${spawn.name}
                energy              : ${spawn.energy}/${spawn.energyCapacity}
                is spawning         : ${spawn.spawning !== null}
        `);
    });

    return result.join('\n');
}
