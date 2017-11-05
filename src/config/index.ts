import {LogLevels} from '../lib/logger/logLevels';

/**
 * Enable this if you want a lot of text to be logged to console.
 * @type {boolean}
 */
export const ENABLE_DEBUG_MODE: boolean = true;

/**
 * Enable this to enable screeps profiler
 */
export const USE_PROFILER: boolean = true;

/**
 * Minimum number of ticksToLive for a Creep before they go to renew.
 * @type {number}
 */
export const DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL: number = 700;

/**
 * Debug level for log output
 */
export const LOG_LEVEL: number = LogLevels.DEBUG;

/**
 * Prepend log output with current tick number.
 */
export const LOG_PRINT_TICK: boolean = true;

/**
 * Prepend log output with source line.
 */
export const LOG_PRINT_LINES: boolean = true;

/**
 * Load source maps and resolve source lines back to typeascript.
 */
export const LOG_LOAD_SOURCE_MAP: boolean = true;

/**
 * Maximum padding for source links (for aligning log output).
 */
export const LOG_MAX_PAD: number = 100;

/**
 * VSC location, used to create links back to source.
 * Repo and revision are filled in at build time for git repositories.
 */
// export const LOG_VSC = { repo: '@@_repo_@@', revision: '@@_revision_@@', valid: false };
export const LOG_VSC = {repo: '@@_repo_@@', revision: __REVISION__, valid: false};

/**
 * URL template for VSC links, this one works for github and gitlab.
 */
export const LOG_VSC_URL_TEMPLATE = (path: string, line: string) => {
    return `${LOG_VSC.repo}/blob/${LOG_VSC.revision}/${path}#${line}`;
};

// Roles
export const ROLES = {
    EMERGENCY: 'harvester',

    // Responsible for carrying energy from the clothest energy source to the main spawn.
    HARVESTER: 'harvester',

    // Responsible for upgrading the room's controller.
    UPGRADER: 'upgrader',

    // Responsible for building structure.
    // If there is no structure to build, cascading to UPGRADER role.
    BUILDER: 'builder',

    // Responsible for repairing the clothest structure which need to be repaired.
    // If there is no structure to repair, cascading to BUILDER role.
    REPAIRER: 'repairer',

    // Responsible for repairing walls.
    // If there is no wall to repair, cascading to REPAIRER role.
    WALL_REPAIRER: 'wall_repairer',
};

// Minimum required creep for each role.
export const MIN_HARVESTERS: number = 5;
export const MIN_UPGRADERS: number = 4;
export const MIN_BUILDERS: number = 2;
export const MIN_REPAIRERS: number = 2;
export const MIN_WALL_REPAIRERS: number = 2;

// Body costs
export const BODY = {
    CARRY: 100,
    MOVE: 50,
    WORK: 100,
};

// Errors constants.
export const ERRORS = [
    {name: 'OK', value: 0, desc: 'The operation has been scheduled successfully.'},
    {name: 'ERR_NOT_OWNER', value: -1, desc: 'You are not the owner of this creep or the target controller.'},
    {name: 'ERR_NAME_EXISTS', value: -3, desc: 'There is a creep with the same name already.'},
    {name: 'ERR_BUSY', value: -4, desc: 'The creep is still being spawned.'},
    {name: 'ERR_NOT_ENOUGH_ENERGY', value: -6, desc: 'The creep does not have any carried energy.'},
    {name: 'ERR_INVALID_TARGET', value: -7, desc: 'The target is not a valid controller object.'},
    {name: 'ERR_FULL', value: -8, desc: 'The target cannot receive any more resources.'},
    {name: 'ERR_NOT_IN_RANGE', value: -9, desc: 'The target is too far away.'},
    {name: 'ERR_INVALID_ARGS', value: -10, desc: 'The resources amount is incorrect.'},
    {name: 'ERR_RCL_NOT_ENOUGH', value: -14, desc: 'Your Room Controller level is insufficient to use this spawn.'},
];
