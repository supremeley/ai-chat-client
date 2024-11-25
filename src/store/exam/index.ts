import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { Questionnaire } from '@/api/questionnaire/interface';

import type { ExamState } from './interface';

const initialState: ExamState = {
  detail: null,
};

export const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setExamDetail: (state, action: PayloadAction<Questionnaire>) => {
      state.detail = action.payload;
    },
  },
});

export const { setExamDetail } = examSlice.actions;

export default examSlice.reducer;
