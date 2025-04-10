import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { MenuItem, RouteTagItem, SySState } from './interface';

const initialState: SySState = {
  menu: [],
  routes: [],
  routeTagList: [
    {
      title: '首页',
      path: 'home',
      name: 'home',
    },
  ],
  curPage: 'Home',
};

export const systemSlice = createSlice({
  name: 'sys',
  initialState,
  reducers: {
    setMenu: (state, action: PayloadAction<MenuItem[]>) => {
      state.menu = action.payload;
    },
    setRoutes: (state, action: PayloadAction<RouteWithMetaObject[]>) => {
      state.routes = action.payload;
    },
    setRouteTagList: (state, action: PayloadAction<RouteTagItem[]>) => {
      state.routeTagList = action.payload;
    },
    setCurPage: (state, action: PayloadAction<string>) => {
      state.curPage = action.payload;
    },
  },
});

export const { setMenu, setRoutes, setRouteTagList, setCurPage } = systemSlice.actions;

export default systemSlice.reducer;
