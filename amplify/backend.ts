import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({
  auth,
  data,
  storage,
});

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:AdminDeleteUser',
      'cognito-idp:AdminUpdateUserAttributes',
      'cognito-idp:ListUsers',
    ],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
);

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
        publicPrefixes: [
          'posters/*',
          'backdrops/*',
          'trailers/*',
          'theaters/*',
          'events/*',
          'venue-items/*',
        ],
      },
    },
  },
});
