import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({
  auth,
  data,
  storage,
});

backend.addOutput({
  custom: {
    nextjs: {
      internalDataAccess: {
        primaryApi: 'GraphQL',
        amplifyDataClient: 'Use amplify_outputs.json with generateClient<Schema>()',
        realtime: 'Use AppSync subscriptions for Theater, Movie, and Booking changes',
      },
      externalRoutes: {
        reservedPrefix: '/api',
        intendedUse: [
          'vendor integrations',
          'webhooks',
          'third-party callbacks',
        ],
        note: 'Internal application reads and writes should go through Amplify Data',
      },
      mediaStorage: {
        defaultBucket: 'theaterMedia',
        publicPrefixes: ['posters/*', 'backdrops/*', 'trailers/*'],
      },
    },
  },
});
