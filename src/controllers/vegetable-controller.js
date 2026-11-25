import ResponseManager from '#utils/response-magager.js';
import VegetableModel from '#mvc-models/vegetable-model.js';
import VegetableView from '#mvc-views/vegetable-view.js';
import ErrorTypes from '#utils/error-types.js';
import Validator from '#utils/validator.js';
import parseBody from '#utils/parse-body.js';
import parseMultipart from '#utils/parse-multipart.js';
import FileManager from '#utils/file-manager.js';
import PROBLEMS from '#configurations/problems.js';
import { VALIDATOR_TYPES, FOLDERS, UPLOAD_LIMIT, UPLOAD_ALLOWED_TYPES } from '#configs';

// import Redis from '#utils/redis.js';
// import { REDIS_KEYS } from '#configs';

const VegetableController = {

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

            const vegetables = await VegetableModel.selectAll(filters, sortData);

            ResponseManager.send(req, res, 200, VegetableView.collection(vegetables));
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

            const rawId = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            const id = Number(rawId);
            if (!Number.isInteger(id) || id < 1) {
                ResponseManager.problem(req, res, PROBLEMS.VALIDATION_FAILED, 'Invalid id parameter.');
                return false;
            }
            const vegetable = await VegetableModel.selectById(id);

            if (!vegetable) {
                ResponseManager.problem(req, res, PROBLEMS.NOT_FOUND, 'Resource does not exist.');
                return false;
            }

            ResponseManager.send(req, res, 200, VegetableView.single(vegetable));
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

        // Étape #1 : Récupération des données et du fichier image dans TMP
        try {
            await parseMultipart(req, res, UPLOAD_LIMIT, UPLOAD_ALLOWED_TYPES, FOLDERS.TMP);
        } catch (err) {
            if (err instanceof ErrorTypes.MimeTypeError) {
                ResponseManager.problem(req, res, PROBLEMS.UNSUPPORTED_MEDIA_TYPE, err.message);
                return false;
            }
            if (err instanceof ErrorTypes.FileSizeError) {
                ResponseManager.problem(req, res, PROBLEMS.CONTENT_TOO_LARGE, err.message);
                return false;
            }
            throw err;
        }

        // Étape #2 : Validation des champs
        try {
            const data = res.locals.body ?? {};
            const uploadedFile = res.locals.files?.image;
            data.image = uploadedFile?.filename ?? null;

            const errors = Validator.validate(data, {
                category: { required: true, type: VALIDATOR_TYPES.STRING },
                nom: { required: true, type: VALIDATOR_TYPES.STRING },
                prix: { required: true, type: VALIDATOR_TYPES.NUMBER, min: 0.01 },
                stock: { required: true, type: VALIDATOR_TYPES.INTEGER, min: 0 },
                origine: { required: true, type: VALIDATOR_TYPES.STRING },
                image: { required: true, type: VALIDATOR_TYPES.STRING }
            });

            if (Object.keys(errors).length > 0) {
                await FileManager.deleteRequestTempFiles(FOLDERS.TMP, res.locals.files);
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.VALIDATION_FAILED,
                    'Fields are missing or values are invalid.',
                    { errors }
                );
                return false;
            }
        } catch (err) {
            throw err;
        }

        // Étape #3 : Déplacement de TMP vers PUBLIC
        try {
            const uploadedFile = res.locals.files.image;
            await FileManager.move(FOLDERS.TMP, uploadedFile.tempFilename, FOLDERS.PUBLIC, uploadedFile.filename);
        } catch (err) {
            throw err;
        }

        // Étape #4 : Insertion dans MariaDB
        try {
            const data = res.locals.body;
            const uploadedFile = res.locals.files.image;

            const id = await VegetableModel.insertOne(
                data.category,
                data.nom,
                data.prix,
                data.stock,
                data.origine,
                uploadedFile.filename
            );

            const created = await VegetableModel.selectById(id);
            res.setHeader('Location', `${res.locals.url.path}/${id}`);
            ResponseManager.send(req, res, 201, VegetableView.single(created));
            return true;

        } catch (err) {
            if (err instanceof ErrorTypes.DuplicateEntryError) {
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.DUPLICATE,
                    `Vegetable '${res.locals.body.nom}' already exists.`
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

        const rawId = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            const id = Number(rawId);
            if (!Number.isInteger(id) || id < 1) {
                ResponseManager.problem(req, res, PROBLEMS.VALIDATION_FAILED, 'Invalid id parameter.');
                return false;
            }

        try {
            await parseMultipart(req, res, UPLOAD_LIMIT, UPLOAD_ALLOWED_TYPES, FOLDERS.TMP);
        } catch (err) {
            if (err instanceof ErrorTypes.MimeTypeError) {
                ResponseManager.problem(req, res, PROBLEMS.UNSUPPORTED_MEDIA_TYPE, err.message);
                return false;
            }
            if (err instanceof ErrorTypes.FileSizeError) {
                ResponseManager.problem(req, res, PROBLEMS.CONTENT_TOO_LARGE, err.message);
                return false;
            }
            throw err;
        }

        try {
            const data = res.locals.body ?? {};
            const uploadedFile = res.locals.files?.image;
            data.image = uploadedFile?.filename ?? null;

            const errors = Validator.validate(data, {
                category: { required: true, type: VALIDATOR_TYPES.STRING },
                nom: { required: true, type: VALIDATOR_TYPES.STRING },
                prix: { required: true, type: VALIDATOR_TYPES.NUMBER, min: 0.01 },
                stock: { required: true, type: VALIDATOR_TYPES.INTEGER, min: 0 },
                origine: { required: true, type: VALIDATOR_TYPES.STRING },
                image: { required: true, type: VALIDATOR_TYPES.STRING }
            });

            if (Object.keys(errors).length > 0) {
                await FileManager.deleteRequestTempFiles(FOLDERS.TMP, res.locals.files);
                ResponseManager.problem(
                    req,
                    res,
                    PROBLEMS.VALIDATION_FAILED,
                    'Fields are missing or values are invalid.',
                    { errors }
                );
                return false;
            }
        } catch (err) {
            throw err;
        }

        try {
            const uploadedFile = res.locals.files.image;
            await FileManager.move(FOLDERS.TMP, uploadedFile.tempFilename, FOLDERS.PUBLIC, uploadedFile.filename);
        } catch (err) {
            throw err;
        }

        try {
            const data = res.locals.body;
            const uploadedFile = res.locals.files.image;

            const success = await VegetableModel.updateById(
                id,
                data.category,
                data.nom,
                data.prix,
                data.stock,
                data.origine,
                uploadedFile.filename
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
                    `Vegetable '${res.locals.body.nom}' already exists.`
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
            const rawId = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            const id = Number(rawId);
            if (!Number.isInteger(id) || id < 1) {
                ResponseManager.problem(req, res, PROBLEMS.VALIDATION_FAILED, 'Invalid id parameter.');
                return false;
            }
            await parseBody(req, res);
            const data = res.locals.body ?? {};

            const allowedFields = ['category', 'nom', 'prix', 'stock', 'origine', 'image'];
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

            const success = await VegetableModel.modifyById(id, cleanData);

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
                    `Vegetable '${res.locals.body?.nom}' already exists.`
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
            const rawId = res.locals.url?.params?.id ?? res.locals.route?.params?.id;
            const id = Number(rawId);
            if (!Number.isInteger(id) || id < 1) {
                ResponseManager.problem(req, res, PROBLEMS.VALIDATION_FAILED, 'Invalid id parameter.');
                return false;
            }
            const success = await VegetableModel.deleteById(id);

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

export default VegetableController;