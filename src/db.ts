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
  data?: Omit<IUser, 'id'>;
}

export type DbSelectedData = IUser | IUser[];

export type DbOperationResult = DbSelectedData | null | undefined;

export interface IDbOperation {
  type: string;
  payload?: IOperationPayload;
}

export type DbConnect = () => {
  executeOperation: (operation: IDbOperation) => DbOperationResult;
};

const selectUsers = (
  state: IDbState = { users: [] },
  operation: IDbOperation = {} as IDbOperation,
): DbSelectedData => {
  switch (operation.type) {
    case DB_GET_ALL_USERS:
      return state.users;
    case DB_GET_USER_BY_ID:
      return state.users.find((user) => user.id === operation.payload.id);

    default:
      return null;
  }
};

const manageUsers = (
  state: IDbState = { users: [] },
  operation: IDbOperation = {} as IDbOperation,
): [IDbState, DbSelectedData?] => {
  if (operation.type === DB_CREATE_USER) {
    const newUser = { ...operation.payload.data, id: uuidv1() };

    return [
      {
        ...state,
        users: [...state.users, newUser],
      },
      newUser,
    ];
  }
  if (operation.type === DB_UPDATE_USER) {
    const updatedState = {
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

    return [
      updatedState,
      updatedState.users.find((user) => user.id === operation.payload.id),
    ];
  }

  if (operation.type === DB_DELETE_USER) {
    return [
      {
        ...state,
        users: [
          ...state.users.filter((user) => user.id !== operation.payload.id),
        ],
      },
      state.users.find((user) => user.id === operation.payload.id),
    ];
  }

  return [state];
};

const initializeDB = (
  dbStateMutator: (
    state: IDbState,
    operation?: IDbOperation,
  ) => [IDbState, DbSelectedData?],
  dbStateQuery: (state: IDbState, operation?: IDbOperation) => DbSelectedData,
  initialState?: IDbState,
): {
  connect: DbConnect;
} => {
  let dbState = initialState;

  const executeOperation = (operation: IDbOperation): DbOperationResult => {
    // Mutations
    if (
      [DB_CREATE_USER, DB_DELETE_USER, DB_UPDATE_USER].includes(operation.type)
    ) {
      const [updatedState, operationResult] = dbStateMutator(
        dbState,
        operation,
      );
      dbState = updatedState;

      return operationResult;
    }

    // Queries
    if ([DB_GET_USER_BY_ID, DB_GET_ALL_USERS].includes(operation.type)) {
      return dbStateQuery(dbState, operation);
    }

    return null;
  };

  dbStateMutator({} as IDbState);

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

export default { selectUsers, manageUsers, initializeDB, isUserValid };
