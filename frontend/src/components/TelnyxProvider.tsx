"use client";

import { ReactNode } from "react";
import { TelnyxRTCProvider } from "@telnyx/react-client";
import { useAuth } from "@/context/AuthContext";

export default function TelnyxProvider({ children }: { children: ReactNode }) {
    const { profile } = useAuth();
    const credentials = profile?.telnyxCredentials;

    if (!credentials?.login || !credentials?.password) {
        return <>{children}</>;
    }

    return (
        <TelnyxRTCProvider
            key={credentials.login}
            credential={{
                login: credentials.login,
                password: credentials.password,
            }}
        >
            {children}
        </TelnyxRTCProvider>
    );
}
