import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';

export const PADDLE_API_KEY = 'pdl_sdbx_apikey_01kxty4p1bf1s4zb0a7197chxk_szVE9HkpJJSBVxxmfMEs7H_AAn';
export const PADDLE_WEBHOOK_SECRET = 'pdl_ntfset_01kxty2myr97j51crjkgqa01v0_Wev/zsSo/hoLnkyTqPSJGWvSdEUI1dz3';
export const PADDLE_ENV = Environment.sandbox;

export const paddle = new Paddle(PADDLE_API_KEY, {
    environment: PADDLE_ENV,
    logLevel: LogLevel.error,
});
