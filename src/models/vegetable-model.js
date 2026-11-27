import pool from '#services/db.js';
import { handleDBError } from '#tools';

const COLUMNS = {
    id: 'id',
    category: 'category',
    nom: 'name',
    prix: 'price',
    stock: 'stock',
    origine: 'origin',
    image: 'picture'
};
const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];

const VegetableModel = {

    selectAll: async (filters = {}, sortData = {}) => {

        try {

            const whereClauses = [];
            const params = {};

            if (filters.category) {
                whereClauses.push('category = :category');
                params.category = filters.category;
            }

            let whereSql = '';
            if (whereClauses.length > 0) {
                whereSql = ' WHERE ' + whereClauses.join(' AND ');
            }

            let orderBy = '';
            const sort = [];

            for (const [key, value] of Object.entries(sortData)) {
                const direction = String(value).toUpperCase();
                if (Object.hasOwn(COLUMNS, key) && ALLOWED_DIRECTIONS.includes(direction)) {
                    sort.push(`${COLUMNS[key]} ${direction}`);
                }
            }

            if (sort.length > 0) {
                orderBy = ' ORDER BY ' + sort.join(', ');
            }

            const query = `SELECT id, category, name AS nom, price AS prix, stock, origin AS origine, picture AS image FROM vegetable` + whereSql + orderBy;

            const rows = await pool.query(query, params);

            return rows;

        } catch (err) {

            handleDBError(err);

        }

    },

    selectById: async (id) => {

        try {

            const params = {
                id
            };

            const [row] = await pool.query(
                'SELECT id, category, name AS nom, price AS prix, stock, origin AS origine, picture AS image FROM vegetable WHERE id = :id',
                params
            );

            return row;

        } catch (err) {

            handleDBError(err);

        }

    },

    insertOne: async (category, nom, prix, stock, origine, image = null) => {

        try {

            const params = {
                category,
                nom,
                prix,
                stock,
                origine,
                image
            };

            const result = await pool.query(
                'INSERT INTO vegetable (category, name, price, stock, origin, picture) VALUES (:category, :nom, :prix, :stock, :origine, :image)',
                params
            );

            return Number(result.insertId);

        } catch (err) {

            handleDBError(err);

        }

    },

    updateById: async (id, category, nom, prix, stock, origine, image) => {

        try {

            const params = {
                id,
                category,
                nom,
                prix,
                stock,
                origine,
                image
            };

            const result = await pool.query(
                'UPDATE vegetable SET category = :category, name = :nom, price = :prix, stock = :stock, origin = :origine, picture = :image WHERE id = :id',
                params
            );

            return result.affectedRows > 0;

        } catch (err) {

            handleDBError(err);

        }

    },

    modifyById: async (id, data) => {

        try {

            const safeEntries = Object.entries(data).filter(([key]) =>
                Object.hasOwn(COLUMNS, key) && key !== 'id'
            );

            if (safeEntries.length === 0) {
                return false;
            }

            const params = {
                id,
                ...Object.fromEntries(safeEntries)
            };

            const fields = safeEntries
                .map(([key]) => `${COLUMNS[key]} = :${key}`)
                .join(', ');

            const query = `UPDATE vegetable SET ${fields} WHERE id = :id`;

            const result = await pool.query(query, params);

            return result.affectedRows > 0;

        } catch (err) {

            handleDBError(err);

        }

    },

    deleteById: async (id) => {

        try {

            const params = {
                id
            };

            const result = await pool.query(
                'DELETE FROM vegetable WHERE id = :id',
                params
            );

            return result.affectedRows > 0;

        } catch (err) {

            handleDBError(err);

        }

    }

};

export default VegetableModel;