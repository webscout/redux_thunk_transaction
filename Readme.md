
# Redux thunk transaction

This library creates a copy of the state inside a [thunk](https://github.com/reduxjs/redux-thunk).
After thunk finished loading, it applies all changes to the main state. 
If some problems happened during the loading (thunk promise catch an error), no changes got applied in the main state.

## Why? Why do i need this?


This can be useful in page loading.
In my case page loading consists of a lot of small actions.
And changes should be applied to the view only after all data is loaded
 (yes, sometimes it's easy to make by some "loading" flag, but it's not always the case).

Also, if page loading is aborted, none of these actions will be applied in the state.


## Usage

At first, install the library.

```
npm install redux-thunk-transaction
```

After, wrap the thunk you need to isolate from the main state.
```js
import createThunkTransaction from 'react-thunk-transaction';


const thunk = createThunkTransaction(
    async (dispatch, getState) => {
      await fetchCategories();
      await fetchProducts();
      await fetchBanners();
    },
    createStore
);

dispatch(thunk);
```