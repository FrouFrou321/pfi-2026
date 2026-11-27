import AuthenticationManager from '#utils/authentication-manager.js';
import { JWT_COOKIE_PARAMS } from '#configs';


const validateJWTCookie =  async (req, res) => {

    if (Object.hasOwn(res.locals, 'user')) return true;
    if (Object.hasOwn(res.locals.route, 'authentication') && !res.locals.route.authentication) return true;

    const cookieHeader = req.headers.cookie;

    const cookies = {};
    let token = undefined;

    // On cherche le token JWT dans les cookies
    if(cookieHeader) {

        cookieHeader.split(';').forEach((cookie) => {

            const trimmed = cookie.trim();
            if (!trimmed) return;

            const separatorIndex = trimmed.indexOf('=');

            if (separatorIndex !== -1) {
                const name = trimmed.slice(0, separatorIndex).trim();
                const value = trimmed.slice(separatorIndex + 1).trim();
                cookies[name] = value;
            }

        });

        token = cookies[JWT_COOKIE_PARAMS.name] ?? undefined;

    }
    
    if (token) {
        
        try {

            // validateToken lance une erreur dans le cas d'un jeton invalide
            const decoded = AuthenticationManager.validateToken(token);
            
            res.locals.user = {
                id: decoded.id,
                role: decoded.role
            };         
            
        } catch (err) {

            // on s'assure que l'erreur est causée par validateToken
            if (err.name === 'TokenExpiredError') {

            // Comme notre validation d'utilisateur se fait dans l'intergiciel AuthorizeUser
            // nous n'allons pas gérer l'exception qui est générée par validateToken

            //     ResponseManager.problem(req, res, PROBLEMS.INVALID_TOKEN,
            //         "Invalid token"
            //     );
                
            //     return false;

            }       

        }

    }

    return true; 

};

export default validateJWTCookie;


