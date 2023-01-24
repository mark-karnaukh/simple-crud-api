// Endpoints
export const API_URL_USERS = '/api/users';

// RegExp
export const API_URL_USERS_REG_EXP = /^\/api\/users\/?[A-Za-z0-9-]*$/;
export const API_URL_USERS_REG_EXP_WITH_ID = /^\/api\/users\/[A-Za-z0-9-]+$/;
export const API_URL_USERS_REG_EXP_WITHOUT_ID = /^\/api\/users\/?$/;

// DB Operations
export const DB_GET_ALL_USERS = 'GET_ALL_USERS';
export const DB_GET_USER_BY_ID = 'GET_USER_BY_ID';
export const DB_CREATE_USER = 'CREATE_USER';
export const DB_UPDATE_USER = 'UPDATE_USER';
export const DB_DELETE_USER = 'DELETE_USER';
