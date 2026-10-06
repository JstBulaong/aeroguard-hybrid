import { Capacitor } from '@capacitor/core';

const host = Capacitor.getPlatform() === 'android' ? '10.0.2.2' : 'localhost';

export const environment = {
  production: false,
  apiUrl: `http://${host}/aeroguard-api`,
};
