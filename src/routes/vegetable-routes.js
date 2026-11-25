import VegetableController from '#controllers/vegetable-controller.js';
import { ROLES, VALIDATOR_TYPES } from '#configs';

export const vegetableRoutes = [

    {
        pattern: '/vegetables',
        method: 'GET',
        handler: VegetableController.index,
        allow: [ROLES.ADMIN, ROLES.CLIENT]
    },

    {
        pattern: '/vegetables/:id',
        method: 'GET',
        handler: VegetableController.show,
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
        pattern: '/vegetables',
        method: 'POST',
        handler: VegetableController.create,
        allow: [ROLES.ADMIN]
    },

    {
        pattern: '/vegetables/:id',
        method: 'PUT',
        handler: VegetableController.update,
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
        pattern: '/vegetables/:id',
        method: 'PATCH',
        handler: VegetableController.modify,
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
        pattern: '/vegetables/:id',
        method: 'DELETE',
        handler: VegetableController.destroy,
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