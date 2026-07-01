import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Profile, ProfileState } from '@/helpers/interfaces';

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        profile: null,
    } as ProfileState,
    reducers: {
        setProfile: (state, action: PayloadAction<Profile>) => {
            state.profile = action.payload;
        },
        clearProfile: state => {
            state.profile = null;
        },
    },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
