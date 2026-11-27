import pool from '#services/db.js';
import { handleDBError } from '#utils/handle-db-errors.js';

const UserModel = {

    selectByHash: async (hash) => {
        
        try{
            
            const params = {
                hash
            };

            // const [row] = va extraire la première ligne avec les données
            const [row] = await pool.query("SELECT id, role FROM user WHERE hash = :hash and revoked = 0", params);
            return row; // MariaDB retourne un tableau de résultats

        } catch(err) {

            handleDBError(err);
            
        }  
    },

    selectByEmail: async (email) => {
        
        try{
            
            const params = {
                email
            };

            // const [row] = va extraire la première ligne avec les données
            const [row] = await pool.query("SELECT id, role, pass_hash FROM user WHERE email = :email and revoked = 0", params);
            return row; // MariaDB retourne un tableau de résultats

        } catch(err) {

            handleDBError(err);
            
        }  
    },    
    
};

export default UserModel;