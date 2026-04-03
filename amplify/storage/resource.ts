import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'theaterMedia',
  isDefault: true,
  access: (allow) => ({
    'posters/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    'backdrops/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    'trailers/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    'theaters/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'events/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'admin/*': [allow.groups(['ADMINS']).to(['read', 'write', 'delete'])],
  }),
});
