import { v1 as uuidv1 } from 'uuid';

import {
  DB_CREATE_USER,
  DB_DELETE_USER,
  DB_GET_ALL_USERS,
  DB_GET_USER_BY_ID,
  DB_UPDATE_USER,
} from './constants.js';

export interface IUser {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export interface IDbState {
  users: IUser[];
}

export interface IOperationPayload {
  id?: string;
  data: Omit<IUser, 'id'>;
}

export type IDbOperationData = IUser | IUser[] | IDbState;

export interface IDbOperation {
  type: string;
  payload?: IOperationPayload;
}

export type DbConnect = () => {
  executeOperation: (operation: IDbOperation) => void;
};

const manageUsers = (
  state: IDbState = { users: [] },
  operation: IDbOperation,
): IDbOperationData => {
  switch (operation.type) {
    case DB_GET_ALL_USERS:
      return state.users;
    case DB_GET_USER_BY_ID:
      return state.users.find((user) => user.id === operation.payload.id);
    case DB_CREATE_USER:
      return {
        ...state,
        users: [...state.users, { ...operation.payload.data, id: uuidv1() }],
      };
    case DB_UPDATE_USER:
      return {
        ...state,
        users: [
          ...state.users.map((user) => {
            if (user.id === operation.payload.id) {
              return {
                ...user,
                ...operation.payload.data,
                id: operation.payload.id,
              };
            }

            return user;
          }),
        ],
      };
    case DB_DELETE_USER:
      return {
        ...state,
        users: [
          ...state.users.filter((user) => user.id !== operation.payload.id),
        ],
      };
    default:
      return state;
  }
};

const initializeDB = (
  dbStateManager: (
    state: IDbState,
    operation?: IDbOperation,
  ) => IDbOperationData,
): {
  connect: DbConnect;
} => {
  let dbState;

  const executeOperation = (operation: IDbOperation): void => {
    dbState = dbStateManager(dbState, operation);
  };

  dbStateManager({} as IDbState);

  const connect: DbConnect = () => ({
    executeOperation,
  });

  return { connect };
};

const isUserValid = (user: unknown): boolean => {
  const { username, age, hobbies } = user as Omit<IUser, 'id'>;

  const hasAllProperties = !!username && !!age && !!hobbies;
  const hasCorrectValues =
    typeof username === 'string' &&
    typeof age === 'number' &&
    hobbies instanceof Array;

  return hasAllProperties && hasCorrectValues;
};

export { manageUsers, initializeDB, isUserValid };
