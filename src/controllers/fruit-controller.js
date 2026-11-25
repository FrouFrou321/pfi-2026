import ResponseManager from '#utils/response-magager.js';
import FruitModel from '#mvc-models/fruit-model.js';
import FruitView from '#mvc-views/fruit-view.js';
import ErrorTypes from '#utils/error-types.js';
import Validator from '#utils/validator.js';
import parseBody from '#utils/parse-body.js';
import PROBLEMS from '#configurations/problems.js';
import { VALIDATOR_TYPES } from '#configs';

const FruitController = {

    index: async (req, res) => {

        try {

            const allowedColumns = ['id', 'category', 'nom', 'prix', 'stock', 'origine'];
            const allowedOrders = ['asc', 'desc'];
            const query = res.locals.url?.query ?? {};

            const filters = {};
            if (typeof query.category === 'string' && query.category.trim() !== '') {
                filters.category = query.category.trim();
            }

            const sortData = {};
            if (Object.hasOwn(query, 'sort') && allowedColumns.includes(query.sort)) {
                const direction = Object.hasOwn(query, 'order') && allowedOrders.includes(query.order.toLowerCase())
                    ? query.order.toLowerCase()
                    : 'asc';
                sortData[query.sort] = direction;
            }

            const fruits = await FruitModel.selectAll(filters, sortData);

            ResponseManager.send(req, res, 200, FruitView.collection(fruits));
            return true;

        } catch (err) {

            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;

        }

    },

    show: async (req, res) => {

        try {

            const id = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            const fruit = await FruitModel.selectById(id);

            if (!fruit) {
                ResponseManager.problem(req, res, PROBLEMS.NOT_FOUND, 'Resource does not exist.');
                return false;
            }

            ResponseManager.send(req, res, 200, FruitView.single(fruit));
            return true;

        } catch (err) {

            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;

        }

    },

    create: async (req, res) => {

        try {

            await parseBody(req, res);
            const data = res.locals.body ?? {};

            const errors = Validator.validate(data, {
                category: { required: true, type: VALIDATOR_TYPES.STRING },
                nom: { required: true, type: VALIDATOR_TYPES.STRING },
                prix: { required: true, type: VALIDATOR_TYPES.NUMBER, min: 0.01 },
                stock: { required: true, type: VALIDATOR_TYPES.INTEGER, min: 0 },
                origine: { required: true, type: VALIDATOR_TYPES.STRING }
            });

            if (Object.keys(errors).length > 0) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.VALIDATION_FAILED,
                    'Fields are missing or values are invalid.',
                    { errors }
                );
                return false;
            }

            const id = await FruitModel.insertOne(
                data.category,
                data.nom,
                data.prix,
                data.stock,
                data.origine
            );

            const created = await FruitModel.selectById(id);
            res.setHeader('Location', `${res.locals.url.path}/${id}`);
            ResponseManager.send(req, res, 201, FruitView.single(created));
            return true;

        } catch (err) {

            if (err instanceof ErrorTypes.DuplicateEntryError) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.DUPLICATE,
                    `Fruit '${res.locals.body?.nom}' already exists.`
                );
                return false;
            }

            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;

        }

    },

    update: async (req, res) => {

        try {

            const id = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            await parseBody(req, res);
            const data = res.locals.body ?? {};

            const errors = Validator.validate(data, {
                category: { required: true, type: VALIDATOR_TYPES.STRING },
                nom: { required: true, type: VALIDATOR_TYPES.STRING },
                prix: { required: true, type: VALIDATOR_TYPES.NUMBER, min: 0.01 },
                stock: { required: true, type: VALIDATOR_TYPES.INTEGER, min: 0 },
                origine: { required: true, type: VALIDATOR_TYPES.STRING }
            });

            if (Object.keys(errors).length > 0) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.VALIDATION_FAILED,
                    'Fields are missing or values are invalid.',
                    { errors }
                );
                return false;
            }

            const success = await FruitModel.updateById(
                id,
                data.category,
                data.nom,
                data.prix,
                data.stock,
                data.origine
            );

            if (success) {
                res.statusCode = 204;
                res.removeHeader('Content-Type');
                res.end();
                return true;
            }

            ResponseManager.problem(req, res, PROBLEMS.NOT_FOUND, 'Resource does not exist.');
            return false;

        } catch (err) {

            if (err instanceof ErrorTypes.DuplicateEntryError) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.DUPLICATE,
                    `Fruit '${res.locals.body?.nom}' already exists.`
                );
                return false;
            }

            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;

        }

    },

    modify: async (req, res) => {

        try {

            const id = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            await parseBody(req, res);
            const data = res.locals.body ?? {};

            const allowedFields = ['category', 'nom', 'prix', 'stock', 'origine'];
            const cleanData = allowedFields.reduce((acc, field) => {
                if (Object.hasOwn(data, field)) {
                    acc[field] = data[field];
                }
                return acc;
            }, {});

            if (Object.keys(cleanData).length === 0) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.BAD_REQUEST,
                    'Fields are missing or values are invalid.'
                );
                return false;
            }

            const success = await FruitModel.modifyById(id, cleanData);

            if (success) {
                res.statusCode = 204;
                res.removeHeader('Content-Type');
                res.end();
                return true;
            }

            ResponseManager.problem(req, res, PROBLEMS.NOT_FOUND, 'Resource does not exist.');
            return false;

        } catch (err) {

            if (err instanceof ErrorTypes.DuplicateEntryError) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.DUPLICATE,
                    `Fruit '${res.locals.body?.nom}' already exists.`
                );
                return false;
            }

            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;

        }

    },

    destroy: async (req, res) => {

        try {

            const id = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            const success = await FruitModel.deleteById(id);

            if (success) {
                res.statusCode = 204;
                res.removeHeader('Content-Type');
                res.end();
                return true;
            }

            ResponseManager.problem(req, res, PROBLEMS.NOT_FOUND, 'Resource does not exist.');
            return false;

        } catch (err) {

            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;

        }

    }

};

export default FruitController;