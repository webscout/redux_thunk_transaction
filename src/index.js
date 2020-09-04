function createThunkTransaction(thunk, createStore) {
  if (typeof(thunk) !== 'function') {
    return thunk;
  }

  return (dispatch, getState) =>  {
    const storeBranch = createStore({ ...getState() });

    const actions = [];

    const dispatchWithHistory = action => {
      if (typeof action !== 'function') {
        actions.push(action);

        return storeBranch.dispatch(action);
      }

      return action(dispatchWithHistory, storeBranch.getState);
    };

    const commitTransaction = () => {
      actions.forEach(action => dispatch(action));
    };

    return Promise.resolve(dispatchWithHistory(thunk))
      .then(result => {
        commitTransaction();

        return result;
      });
  }
}

module.exports = createThunkTransaction;