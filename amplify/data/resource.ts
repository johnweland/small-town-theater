import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  TheaterStatus: a.enum(['active', 'inactive', 'seasonal']),
  MovieStatus: a.enum(['draft', 'comingSoon', 'nowPlaying', 'archived']),
  BookingStatus: a.enum(['draft', 'published', 'archived']),
  BookingDay: a.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),

  BookingShowtime: a.customType({
    day: a.ref('BookingDay').required(),
    times: a.string().array().required(),
  }),

  BookingException: a.customType({
    date: a.date().required(),
    label: a.string().required(),
  }),

  Theater: a
    .model({
      slug: a.string().required(),
      name: a.string().required(),
      city: a.string().required(),
      state: a.string().required(),
      district: a.string().required(),
      established: a.integer(),
      status: a.ref('TheaterStatus').required(),
      address: a.string().required(),
      phone: a.phone(),
      contactEmail: a.email(),
      manager: a.string(),
      notes: a.string().authorization((allow) => [allow.group('ADMINS')]),
      heroImage: a.url(),
      descriptionParagraphs: a.string().array(),
      bookings: a.hasMany('Booking', 'theaterId'),
    })
    .secondaryIndexes((index) => [
      index('slug').queryField('listTheatersBySlug'),
      index('status').sortKeys(['city']).queryField('listTheatersByStatus'),
    ])
    .authorization((allow) => [
      allow.group('ADMINS'),
      allow.publicApiKey().to(['read', 'create']),
    ]),

  Movie: a
    .model({
      slug: a.string().required(),
      title: a.string().required(),
      tagline: a.string(),
      rating: a.string(),
      runtime: a.string(),
      genre: a.string(),
      status: a.ref('MovieStatus').required(),
      director: a.string(),
      cast: a.string().array(),
      synopsis: a.string(),
      production: a.string(),
      score: a.string(),
      cinematography: a.string(),
      backdrop: a.url(),
      poster: a.url(),
      releaseDate: a.date(),
      audienceScore: a.string(),
      originalLanguage: a.string(),
      productionCompanies: a.string().array(),
      tmdbId: a.integer(),
      trailerYouTubeId: a.string(),
      bookings: a.hasMany('Booking', 'movieId'),
    })
    .secondaryIndexes((index) => [
      index('slug').queryField('listMoviesBySlug'),
      index('status').sortKeys(['releaseDate']).queryField('listMoviesByStatus'),
      index('tmdbId').queryField('listMoviesByTmdbId'),
    ])
    .authorization((allow) => [
      allow.group('ADMINS'),
      allow.publicApiKey().to(['read']),
    ]),

  Booking: a
    .model({
      slug: a.string().required(),
      theaterId: a.id().required(),
      movieId: a.id().required(),
      screenId: a.string().required(),
      screenName: a.string().required(),
      status: a.ref('BookingStatus').required(),
      runStartsOn: a.date().required(),
      runEndsOn: a.date().required(),
      ticketPrice: a.string(),
      badge: a.string(),
      showtimes: a.ref('BookingShowtime').array().required(),
      exceptions: a.ref('BookingException').array(),
      note: a.string().authorization((allow) => [allow.group('ADMINS')]),
      publishedAt: a
        .datetime()
        .authorization((allow) => [allow.group('ADMINS')]),
      expiresAtEpoch: a
        .integer()
        .authorization((allow) => [allow.group('ADMINS')]),
      theater: a.belongsTo('Theater', 'theaterId'),
      movie: a.belongsTo('Movie', 'movieId'),
    })
    .secondaryIndexes((index) => [
      index('slug').queryField('listBookingsBySlug'),
      index('theaterId')
        .sortKeys(['runStartsOn'])
        .queryField('listBookingsByTheater'),
      index('movieId').sortKeys(['runStartsOn']).queryField('listBookingsByMovie'),
      index('status').sortKeys(['runStartsOn']).queryField('listBookingsByStatus'),
    ])
    .authorization((allow) => [
      allow.group('ADMINS'),
      // Native public reads keep the public site simple; the UI should filter to
      // published records until a dedicated public projection is added.
      allow.publicApiKey().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      description: 'Public read access for the Small Town Theater website',
      expiresInDays: 30,
    },
  },
});
