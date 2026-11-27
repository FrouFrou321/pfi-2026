import AuthController from '#controllers/auth-controller.js';

export const authRoutes = [
    {
        pattern: '/auth/login',
        method: 'POST',
        handler: AuthController.login,
        authentication: false
    }
];
