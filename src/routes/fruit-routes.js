import FruitController from '#controllers/fruit-controller.js';
import { ROLES, VALIDATOR_TYPES } from '#configs';

export const fruitRoutes = [

    {
        pattern: '/fruits',
        method: 'GET',
        handler: FruitController.index,
        allow: [ROLES.ADMIN, ROLES.CLIENT]
    },

    {
        pattern: '/fruits/:id',
        method: 'GET',
        handler: FruitController.show,
        allow: [ROLES.ADMIN, ROLES.CLIENT],
        validateParams: {
            id: {
                required: true,
                type: VALIDATOR_TYPES.INTEGER,
                min: 1
            }
        }
    },

    {
        pattern: '/fruits',
        method: 'POST',
        handler: FruitController.create,
        allow: [ROLES.ADMIN]
    },

    {
        pattern: '/fruits/:id',
        method: 'PUT',
        handler: FruitController.update,
        allow: [ROLES.ADMIN],
        validateParams: {
            id: {
                required: true,
                type: VALIDATOR_TYPES.INTEGER,
                min: 1
            }
        }
    },

    {
        pattern: '/fruits/:id',
        method: 'PATCH',
        handler: FruitController.modify,
        allow: [ROLES.ADMIN],
        validateParams: {
            id: {
                required: true,
                type: VALIDATOR_TYPES.INTEGER,
                min: 1
            }
        }
    },

    {
        pattern: '/fruits/:id',
        method: 'DELETE',
        handler: FruitController.destroy,
        allow: [ROLES.ADMIN],
        validateParams: {
            id: {
                required: true,
                type: VALIDATOR_TYPES.INTEGER,
                min: 1
            }
        }
    }

];