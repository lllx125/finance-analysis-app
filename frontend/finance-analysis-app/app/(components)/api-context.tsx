"use client";

import { createContext, ReactNode, useContext } from "react";

type APIContextType = {
    api: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE || "/api";
//const API = '/api';

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIProvider = ({ children }: { children: ReactNode }) => {
    const api = API;
    return (
        <APIContext.Provider value={{ api }}>{children}</APIContext.Provider>
    );
};

export const useAPI = () => {
    const ctx = useContext(APIContext);
    if (!ctx) throw new Error("useAPI must be inside APIProvider");
    return ctx.api;
};
