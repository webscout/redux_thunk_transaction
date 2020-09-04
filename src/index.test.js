const createThunkTransaction = require('./index');
const redux = require('redux');
const thunk = require('redux-thunk').default;

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const testReducer = (state = { number: 0 }, action) => {
  switch (action.type) {
      case 'ADD':
        return {
          ...state,
          number: state.number + action.value
        }
  }

  return state;
}


const createTestStore = inititalState => redux.createStore(testReducer, inititalState, redux.applyMiddleware(thunk));

test('Commit transaction works', () => {
  const { dispatch, getState } = createTestStore();

  const thunk = createThunkTransaction(
    dispatch => sleep(5).then(() => dispatch({ type: 'ADD', value: 5 })),
    createTestStore
  );

  const promise = dispatch(thunk);
  dispatch({ type: 'ADD', value: 15 });

  return promise.then(() => {
    expect(getState().number).toBe(20)    
  });
});

test('Rollback works after catch', () => {
  const { dispatch, getState } = createTestStore();

  const thunk = createThunkTransaction(
    (dispatch, getState) => {
      return sleep(5).then(() => {
        dispatch({ type: 'ADD', value: 5 });
        throw new Error('Test error');
      })
    },
    createTestStore
  );

  const promise = dispatch(thunk);
  dispatch({ type: 'ADD', value: 15 });

  return promise.catch(e => {
    expect(getState().number).toBe(15);
  });
});

test('Dont have dirty ready', () => {
  const { dispatch, getState } = createTestStore();

  const thunk = createThunkTransaction(
    (dispatch, getState) => {
      dispatch({ type: 'ADD', value: 5 });
      return sleep(5).then(() => {
        expect(getState().number).toBe(5);
      })
    },
    createTestStore
  );

  const promise = dispatch(thunk);
  dispatch({ type: 'ADD', value: 15 });

  sleep().then(() => {
    expect(getState().number).toBe(15);
  });

  return promise;  
});

test('Have repeatable read', () => {
  const { dispatch, getState } = createTestStore();

  const thunk = createThunkTransaction(
    (dispatch, getState) => {
      expect(getState().number).toBe(0);

      return sleep(5).then(() => {
        expect(getState().number).toBe(0);        
      })
    },
    createTestStore
  );

  const promise = dispatch(thunk);
  dispatch({ type: 'ADD', value: 15 });

  return promise;
});