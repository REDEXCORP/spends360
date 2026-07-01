export interface ChildrenProps {
    children: React.ReactNode;
}

export interface AuthContextType {
    profile: any;
    loading: boolean;
}

export interface Profile {
    id?: string;
    email?: string;
    name?: string;
    [key: string]: any;
}

export interface ProfileState {
    profile: Profile | null;
}
