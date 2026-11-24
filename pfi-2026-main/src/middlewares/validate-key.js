import AuthenticationManager from "#utils/authentication-manager.js";
import UserModel from '#models/user-model.js';

const validateKey = async (req, res) => {
      
    if (Object.hasOwn(res.locals, 'user')) return true;
    if (Object.hasOwn(res.locals.route, 'authentication') && !res.locals.route.authentication) return true;

    const key = req.headers['x-api-key'];
    
    if (key) {
        
        const hash = AuthenticationManager.hashKey(key);
        const user = await UserModel.selectByHash(hash);

        // if (user) res.locals.user = user;
        
        if (user) {
        
            res.locals.user = {
                id: user.id, //ou user['id']
                role: user.role
            }
            
        }

    }
    
    return true;    
    
};

export default validateKey;