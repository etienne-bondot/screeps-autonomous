import {BODY} from '../config';

(() => {
    // Whatever is here will be executed as soon as the script is loaded.
    /**
     * createCustomCreep
     * Create a custom creep.
     *
     * @param name  {string} The name of the new creep
     * @param role  {string} The role of the creep
     * @param opt   {object} Custom options
     * @returns errCode
     */
    StructureSpawn.prototype.createCustomCreep = function (room: Room, name: string, role: string, opt = {}) {
        let ratio;
        let cost;
        const body: BodyPartConstant[] = [];
        const energyAvailable = room.energyAvailable;

        const controller = room.find<Controller>(FIND_STRUCTURES, {
            filter: (s: Structure) => s.structureType === STRUCTURE_CONTROLLER
        });
        if (!controller[0]) {
            return;
        }

        ratio = controller[0].level;

        // Body ratio is a variable which represents the game step.
        // It start at controller level value.
        // To build workers' bodies we want two more move that carry and work:
        // WORK | CARRY | MOVE
        // -------------------
        //    1x|     1x|   2x
        // If number of body parts is too high, decrease body ratio.
        cost = ratio * BODY.WORK + ratio * BODY.CARRY + 2 * ratio * BODY.MOVE;
        while (ratio > 1 && cost > energyAvailable) {
            ratio--;
            cost = ratio * BODY.WORK + ratio * BODY.CARRY + 2 * ratio * BODY.MOVE;
        }

        for (let i = 0; i < ratio; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < ratio; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < (2 * ratio); i++) {
            body.push(MOVE);
        }

        return this.spawnCreep(body, name, _.merge({
            memory: {
                level: ratio,
                role,
                working: false
            }
        }, opt));
    };
})();
