import { JWT_CONFIG, VALIDATOR_TYPES } from '#configs';
import PROBLEMS from '#configurations/problems.js';
import AuthenticationManager from '#utils/authentication-manager.js';
import parseBody from '#utils/parse-body.js';
import ResponseManager from '#utils/response-magager.js';
import Validator from '#utils/validator.js';

const AuthController = {
    login: async (req, res) => {
        await parseBody(req, res);

        const errors = Validator.validate(res.locals.body, {
            email: { required: true, type: VALIDATOR_TYPES.STRING },
            password: { required: true, type: VALIDATOR_TYPES.STRING }
        });

        if (Object.keys(errors).length > 0) {
            ResponseManager.problem(
                req,
                res,
                PROBLEMS.VALIDATION_FAILED,
                'Email and password are required.',
                { errors }
            );
            return false;
        }

        const user = await AuthenticationManager.authenticateUserByEmail(req, res);

        if (!user) {
            ResponseManager.problem(req, res, PROBLEMS.UNAUTHORIZED, 'Invalid email or password.');
            return false;
        }

        const token = AuthenticationManager.generateToken(
            user.id,
            user.role,
            JWT_CONFIG.secret,
            JWT_CONFIG.lifespan
        );

        ResponseManager.send(req, res, 200, {
            id: user.id,
            role: user.role
        }, {
            'Set-Cookie': AuthenticationManager.jwtCookieHeader(
                'access_token',
                token,
                JWT_CONFIG.lifespan
            )
        });

        return true;
    }
};

export default AuthController;
