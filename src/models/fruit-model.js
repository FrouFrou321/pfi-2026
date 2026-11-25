import pool from '#services/db.js';
import { handleDBError } from '#tools';

const ALLOWED_COLUMNS = ['id', 'category', 'nom', 'prix', 'stock', 'origine'];
const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];

const FruitModel = {

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
                if (ALLOWED_COLUMNS.includes(key) && ALLOWED_DIRECTIONS.includes(direction)) {
                    sort.push(`${key} ${direction}`);
                }
            }

            if (sort.length > 0) {
                orderBy = ' ORDER BY ' + sort.join(', ');
            }

            const query = `SELECT id, category, nom, prix, stock, origine FROM fruits` + whereSql + orderBy;

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
                'SELECT id, category, nom, prix, stock, origine FROM fruits WHERE id = :id',
                params
            );

            return row;

        } catch (err) {

            handleDBError(err);

        }

    },

    insertOne: async (category, nom, prix, stock, origine) => {

        try {

            const params = {
                category,
                nom,
                prix,
                stock,
                origine
            };

            const result = await pool.query(
                'INSERT INTO fruits (category, nom, prix, stock, origine) VALUES (:category, :nom, :prix, :stock, :origine)',
                params
            );

            return Number(result.insertId);

        } catch (err) {

            handleDBError(err);

        }

    },

    updateById: async (id, category, nom, prix, stock, origine) => {

        try {

            const params = {
                id,
                category,
                nom,
                prix,
                stock,
                origine
            };

            const result = await pool.query(
                'UPDATE fruits SET category = :category, nom = :nom, prix = :prix, stock = :stock, origine = :origine WHERE id = :id',
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
                ALLOWED_COLUMNS.includes(key) && key !== 'id'
            );

            if (safeEntries.length === 0) {
                return false;
            }

            const params = {
                id,
                ...Object.fromEntries(safeEntries)
            };

            const fields = safeEntries
                .map(([key]) => `${key} = :${key}`)
                .join(', ');

            const query = `UPDATE fruits SET ${fields} WHERE id = :id`;

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
                'DELETE FROM fruits WHERE id = :id',
                params
            );

            return result.affectedRows > 0;

        } catch (err) {

            handleDBError(err);

        }

    }

};

export default FruitModel;