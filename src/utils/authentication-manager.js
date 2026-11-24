import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { VALIDATOR_TYPES, JWT_CONFIG } from '#configs';
import UserModel from '#models/user-model.js';
import parseBody from '#utils/parse-body.js';
import Validator from '#utils/validator.js';

const AuthenticationManager = {
  
    // Clé API
    //========

    generateApiKey: (prefix = 'myapp') => {
      const secret = crypto.randomBytes(32).toString('base64url');
      return `${prefix}_${secret}`;
    }, 

    hashKey: (apiKey) => {
      return crypto.createHash('sha256').update(apiKey).digest('hex');
    },


    // Jeton JWT
    //==========

    generateToken: (id, role, secret, expire) => {

        return jwt.sign(
            { id: id, role: role },  // payload
            secret,
            { expiresIn: expire, algorithm: 'HS256' } // options
        );
        
    },

    validateToken: (token) => {

      return jwt.verify(token, JWT_CONFIG.secret, {algorithms: ['HS256']});

    },


    // Structure pour générer Cookie pour jeton JWT
    jwtCookieHeader: (name, token, lifespan) => {

      return [
        `${name}=${token}`,
        'HttpOnly',                  // Prevents XSS script access via document.cookie
        'Path=/',                    // Cookie sent for all backend endpoints
        `Max-Age=${lifespan}`,       // Lifespan in seconds
        'Secure',                    // Can only be sent over encrypted HTTPS
        'SameSite=None'              // None: Allows the cookie to be sent on cross-site requests.
        ].filter(Boolean).join('; ');

    },


    // Structure pour détruire Cookie de jeton JWT
    jwtCookieDestroyHeader: (name) => {

      return [
        `${name}=`,
        'HttpOnly',                  // Prevents XSS script access via document.cookie
        'Path=/',                    // Cookie sent for all backend endpoints
        'Max-Age=0',                 // Lifespan in seconds (1 hour)
        'Secure',
        'SameSite=None'
        ].filter(Boolean).join('; '); 

    },


    // Mot de passe
    //=============

    hashPassword: async (plainPassword) => {
      // The 'saltRounds' determines the cost factor. 
      // 10-12 is generally recommended for a good balance of security/speed.
      const saltRounds = 10;
      const hash = await bcrypt.hash(plainPassword, saltRounds);
      return hash;
    },

    verifyPassword: async (plainPassword, storedHash) => {
      const match = await bcrypt.compare(plainPassword, storedHash);
      return match; // Returns true if they match, false otherwise
    },


    // Utilitaire d'authentification
    //==============================

    authenticateUserByEmail: async (req, res) => {

      await parseBody(req, res);

      const errors = Validator.validate(res.locals.body, {
          email: { required: true, type: VALIDATOR_TYPES.STRING },
          password: { required: true, type: VALIDATOR_TYPES.STRING },
      });

      if (Object.keys(errors).length > 0) return false;

      const { email, password } = res.locals.body;

      const user = await UserModel.selectByEmail(email);
      
      if (!user) return false;

      const match = await AuthenticationManager.verifyPassword(password, user.pass_hash);

      if (!match) return false;

      return user;

    },

};

export default AuthenticationManager;