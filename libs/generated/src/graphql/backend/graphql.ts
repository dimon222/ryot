/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: { input: string; output: string; }
  Decimal: { input: string; output: string; }
  /** A scalar that can represent any JSON value. */
  JSON: { input: any; output: any; }
  /** A scalar that can represent any JSON Object value. */
  JSONObject: { input: any; output: any; }
  /**
   * ISO 8601 calendar date without timezone.
   * Format: %Y-%m-%d
   *
   * # Examples
   *
   * * `1994-11-13`
   * * `2000-02-24`
   */
  NaiveDate: { input: string; output: string; }
};

export type AnimeSpecifics = {
  episodes?: Maybe<Scalars['Int']['output']>;
};

export type AnimeSpecificsInput = {
  episodes?: InputMaybe<Scalars['Int']['input']>;
};

export type AnimeSummary = {
  episodes: Scalars['Int']['output'];
  watched: Scalars['Int']['output'];
};

export type AudioBookSpecifics = {
  runtime?: Maybe<Scalars['Int']['output']>;
};

export type AudioBookSpecificsInput = {
  runtime?: InputMaybe<Scalars['Int']['input']>;
};

export type AudioBooksSummary = {
  played: Scalars['Int']['output'];
  runtime: Scalars['Int']['output'];
};

export type AuthUserInput = {
  oidc?: InputMaybe<OidcUserInput>;
  password?: InputMaybe<PasswordUserInput>;
};

export enum BackendError {
  AdminOnlyAction = 'ADMIN_ONLY_ACTION',
  MutationNotAllowed = 'MUTATION_NOT_ALLOWED',
  NoAuthToken = 'NO_AUTH_TOKEN',
  NoUserId = 'NO_USER_ID',
  SessionExpired = 'SESSION_EXPIRED'
}

export enum BackgroundJob {
  CalculateSummary = 'CALCULATE_SUMMARY',
  EvaluateWorkouts = 'EVALUATE_WORKOUTS',
  PerformBackgroundTasks = 'PERFORM_BACKGROUND_TASKS',
  RecalculateCalendarEvents = 'RECALCULATE_CALENDAR_EVENTS',
  SyncIntegrationsData = 'SYNC_INTEGRATIONS_DATA',
  UpdateAllExercises = 'UPDATE_ALL_EXERCISES',
  UpdateAllMetadata = 'UPDATE_ALL_METADATA'
}

export type BookSpecifics = {
  pages?: Maybe<Scalars['Int']['output']>;
};

export type BookSpecificsInput = {
  pages?: InputMaybe<Scalars['Int']['input']>;
};

export type BooksSummary = {
  pages: Scalars['Int']['output'];
  read: Scalars['Int']['output'];
};

export type ChangeCollectionToEntityInput = {
  collectionName: Scalars['String']['input'];
  creatorUserId: Scalars['String']['input'];
  exerciseId?: InputMaybe<Scalars['String']['input']>;
  information?: InputMaybe<Scalars['JSON']['input']>;
  metadataGroupId?: InputMaybe<Scalars['String']['input']>;
  metadataId?: InputMaybe<Scalars['String']['input']>;
  personId?: InputMaybe<Scalars['String']['input']>;
  workoutId?: InputMaybe<Scalars['String']['input']>;
};

export type Collection = {
  createdOn: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  informationTemplate?: Maybe<Array<CollectionExtraInformation>>;
  lastUpdatedOn: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type CollectionContents = {
  details: Collection;
  results: MediaCollectionContentsResults;
  reviews: Array<ReviewItem>;
  user: User;
};

export type CollectionContentsFilter = {
  entityType?: InputMaybe<EntityLot>;
  metadataLot?: InputMaybe<MediaLot>;
};

export type CollectionContentsInput = {
  collectionId: Scalars['String']['input'];
  filter?: InputMaybe<CollectionContentsFilter>;
  search?: InputMaybe<SearchInput>;
  sort?: InputMaybe<CollectionContentsSortInput>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum CollectionContentsSortBy {
  Date = 'DATE',
  LastUpdatedOn = 'LAST_UPDATED_ON',
  Title = 'TITLE'
}

export type CollectionContentsSortInput = {
  by?: CollectionContentsSortBy;
  order?: GraphqlSortOrder;
};

export type CollectionExtraInformation = {
  defaultValue?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  lot: CollectionExtraInformationLot;
  name: Scalars['String']['output'];
  required?: Maybe<Scalars['Boolean']['output']>;
};

export enum CollectionExtraInformationLot {
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  Number = 'NUMBER',
  String = 'STRING',
  StringArray = 'STRING_ARRAY'
}

export type CollectionItem = {
  collaborators: Array<IdAndNamedObject>;
  count: Scalars['Int']['output'];
  creator: IdAndNamedObject;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  informationTemplate?: Maybe<Array<CollectionExtraInformation>>;
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type CommitMediaInput = {
  identifier: Scalars['String']['input'];
  lot: MediaLot;
  source: MediaSource;
};

export type CommitPersonInput = {
  identifier: Scalars['String']['input'];
  name: Scalars['String']['input'];
  source: MediaSource;
  sourceSpecifics?: InputMaybe<PersonSourceSpecificsInput>;
};

export type CoreDetails = {
  authorName: Scalars['String']['output'];
  backendErrors: Array<BackendError>;
  docsLink: Scalars['String']['output'];
  fileStorageEnabled: Scalars['Boolean']['output'];
  isPro: Scalars['Boolean']['output'];
  localAuthDisabled: Scalars['Boolean']['output'];
  oidcEnabled: Scalars['Boolean']['output'];
  pageLimit: Scalars['Int']['output'];
  repositoryLink: Scalars['String']['output'];
  signupAllowed: Scalars['Boolean']['output'];
  smtpEnabled: Scalars['Boolean']['output'];
  tokenValidForDays: Scalars['Int']['output'];
  version: Scalars['String']['output'];
  websiteUrl: Scalars['String']['output'];
};

export type CreateCustomMetadataInput = {
  animeSpecifics?: InputMaybe<AnimeSpecificsInput>;
  audioBookSpecifics?: InputMaybe<AudioBookSpecificsInput>;
  bookSpecifics?: InputMaybe<BookSpecificsInput>;
  creators?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  genres?: InputMaybe<Array<Scalars['String']['input']>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isNsfw?: InputMaybe<Scalars['Boolean']['input']>;
  lot: MediaLot;
  mangaSpecifics?: InputMaybe<MangaSpecificsInput>;
  movieSpecifics?: InputMaybe<MovieSpecificsInput>;
  podcastSpecifics?: InputMaybe<PodcastSpecificsInput>;
  publishYear?: InputMaybe<Scalars['Int']['input']>;
  showSpecifics?: InputMaybe<ShowSpecificsInput>;
  title: Scalars['String']['input'];
  videoGameSpecifics?: InputMaybe<VideoGameSpecificsInput>;
  videos?: InputMaybe<Array<Scalars['String']['input']>>;
  visualNovelSpecifics?: InputMaybe<VisualNovelSpecificsInput>;
};

export type CreateOrUpdateCollectionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  updateId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateReviewCommentInput = {
  commentId?: InputMaybe<Scalars['String']['input']>;
  decrementLikes?: InputMaybe<Scalars['Boolean']['input']>;
  incrementLikes?: InputMaybe<Scalars['Boolean']['input']>;
  /** The review this comment belongs to. */
  reviewId: Scalars['String']['input'];
  shouldDelete?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserIntegrationInput = {
  maximumProgress?: InputMaybe<Scalars['Decimal']['input']>;
  minimumProgress?: InputMaybe<Scalars['Decimal']['input']>;
  provider: IntegrationProvider;
  providerSpecifics?: InputMaybe<IntegrationSourceSpecificsInput>;
};

export type CreateUserNotificationPlatformInput = {
  apiToken?: InputMaybe<Scalars['String']['input']>;
  authHeader?: InputMaybe<Scalars['String']['input']>;
  baseUrl?: InputMaybe<Scalars['String']['input']>;
  chatId?: InputMaybe<Scalars['String']['input']>;
  lot: NotificationPlatformLot;
  priority?: InputMaybe<Scalars['Int']['input']>;
};

export enum DashboardElementLot {
  InProgress = 'IN_PROGRESS',
  Summary = 'SUMMARY',
  Upcoming = 'UPCOMING'
}

export type DeployGenericCsvImportInput = {
  csvPath: Scalars['String']['input'];
};

export type DeployIgdbImportInput = {
  collection: Scalars['String']['input'];
  csvPath: Scalars['String']['input'];
};

export type DeployImportJobInput = {
  genericCsv?: InputMaybe<DeployGenericCsvImportInput>;
  genericJson?: InputMaybe<DeployJsonImportInput>;
  igdb?: InputMaybe<DeployIgdbImportInput>;
  jellyfin?: InputMaybe<DeployUrlAndKeyAndUsernameImportInput>;
  mal?: InputMaybe<DeployMalImportInput>;
  movary?: InputMaybe<DeployMovaryImportInput>;
  source: ImportSource;
  strongApp?: InputMaybe<DeployStrongAppImportInput>;
  trakt?: InputMaybe<DeployTraktImportInput>;
  urlAndKey?: InputMaybe<DeployUrlAndKeyImportInput>;
};

export type DeployJsonImportInput = {
  export: Scalars['String']['input'];
};

export type DeployMalImportInput = {
  /** The anime export file path (uploaded via temporary upload). */
  animePath?: InputMaybe<Scalars['String']['input']>;
  /** The manga export file path (uploaded via temporary upload). */
  mangaPath?: InputMaybe<Scalars['String']['input']>;
};

export type DeployMovaryImportInput = {
  history: Scalars['String']['input'];
  ratings: Scalars['String']['input'];
  watchlist: Scalars['String']['input'];
};

export type DeployStrongAppImportInput = {
  exportPath: Scalars['String']['input'];
  mapping: Array<StrongAppImportMapping>;
};

export type DeployTraktImportInput = {
  username: Scalars['String']['input'];
};

export type DeployUrlAndKeyAndUsernameImportInput = {
  apiUrl: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type DeployUrlAndKeyImportInput = {
  apiKey: Scalars['String']['input'];
  apiUrl: Scalars['String']['input'];
};

/** The assets that were uploaded for an entity. */
export type EntityAssets = {
  /** The keys of the S3 images. */
  images: Array<Scalars['String']['output']>;
  /** The keys of the S3 videos. */
  videos: Array<Scalars['String']['output']>;
};

/** The assets that were uploaded for an entity. */
export type EntityAssetsInput = {
  /** The keys of the S3 images. */
  images: Array<Scalars['String']['input']>;
  /** The keys of the S3 videos. */
  videos: Array<Scalars['String']['input']>;
};

export enum EntityLot {
  Collection = 'COLLECTION',
  Exercise = 'EXERCISE',
  Metadata = 'METADATA',
  MetadataGroup = 'METADATA_GROUP',
  Person = 'PERSON',
  Workout = 'WORKOUT'
}

export type EntityWithLot = {
  entityId: Scalars['String']['output'];
  entityLot: EntityLot;
};

export type Exercise = {
  attributes: ExerciseAttributes;
  createdByUserId?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<ExerciseEquipment>;
  force?: Maybe<ExerciseForce>;
  id: Scalars['String']['output'];
  level: ExerciseLevel;
  lot: ExerciseLot;
  mechanic?: Maybe<ExerciseMechanic>;
  muscles: Array<ExerciseMuscle>;
  source: ExerciseSource;
};

export type ExerciseAttributes = {
  images: Array<Scalars['String']['output']>;
  instructions: Array<Scalars['String']['output']>;
};

export type ExerciseAttributesInput = {
  images: Array<Scalars['String']['input']>;
  instructions: Array<Scalars['String']['input']>;
};

export type ExerciseBestSetRecord = {
  exerciseIdx: Scalars['Int']['output'];
  setIdx: Scalars['Int']['output'];
  workoutId: Scalars['String']['output'];
};

export enum ExerciseEquipment {
  Bands = 'BANDS',
  Barbell = 'BARBELL',
  BodyOnly = 'BODY_ONLY',
  Cable = 'CABLE',
  Dumbbell = 'DUMBBELL',
  ExerciseBall = 'EXERCISE_BALL',
  EzCurlBar = 'EZ_CURL_BAR',
  FoamRoll = 'FOAM_ROLL',
  Kettlebells = 'KETTLEBELLS',
  Machine = 'MACHINE',
  MedicineBall = 'MEDICINE_BALL',
  Other = 'OTHER'
}

export type ExerciseFilters = {
  equipment: Array<ExerciseEquipment>;
  force: Array<ExerciseForce>;
  level: Array<ExerciseLevel>;
  mechanic: Array<ExerciseMechanic>;
  muscle: Array<ExerciseMuscle>;
  type: Array<ExerciseLot>;
};

export enum ExerciseForce {
  Pull = 'PULL',
  Push = 'PUSH',
  Static = 'STATIC'
}

export type ExerciseInput = {
  attributes: ExerciseAttributesInput;
  equipment?: InputMaybe<ExerciseEquipment>;
  force?: InputMaybe<ExerciseForce>;
  id: Scalars['String']['input'];
  level: ExerciseLevel;
  lot: ExerciseLot;
  mechanic?: InputMaybe<ExerciseMechanic>;
  muscles: Array<ExerciseMuscle>;
};

export enum ExerciseLevel {
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export type ExerciseListFilter = {
  collection?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<ExerciseEquipment>;
  force?: InputMaybe<ExerciseForce>;
  level?: InputMaybe<ExerciseLevel>;
  mechanic?: InputMaybe<ExerciseMechanic>;
  muscle?: InputMaybe<ExerciseMuscle>;
  type?: InputMaybe<ExerciseLot>;
};

export type ExerciseListItem = {
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastUpdatedOn?: Maybe<Scalars['DateTime']['output']>;
  lot: ExerciseLot;
  muscle?: Maybe<ExerciseMuscle>;
  numTimesInteracted?: Maybe<Scalars['Int']['output']>;
};

export type ExerciseListResults = {
  details: SearchDetails;
  items: Array<ExerciseListItem>;
};

/** The different types of exercises that can be done. */
export enum ExerciseLot {
  DistanceAndDuration = 'DISTANCE_AND_DURATION',
  Duration = 'DURATION',
  Reps = 'REPS',
  RepsAndWeight = 'REPS_AND_WEIGHT'
}

export enum ExerciseMechanic {
  Compound = 'COMPOUND',
  Isolation = 'ISOLATION'
}

export enum ExerciseMuscle {
  Abdominals = 'ABDOMINALS',
  Abductors = 'ABDUCTORS',
  Adductors = 'ADDUCTORS',
  Biceps = 'BICEPS',
  Calves = 'CALVES',
  Chest = 'CHEST',
  Forearms = 'FOREARMS',
  Glutes = 'GLUTES',
  Hamstrings = 'HAMSTRINGS',
  Lats = 'LATS',
  LowerBack = 'LOWER_BACK',
  MiddleBack = 'MIDDLE_BACK',
  Neck = 'NECK',
  Quadriceps = 'QUADRICEPS',
  Shoulders = 'SHOULDERS',
  Traps = 'TRAPS',
  Triceps = 'TRICEPS'
}

export type ExerciseParameters = {
  downloadRequired: Scalars['Boolean']['output'];
  /** All filters applicable to an exercises query. */
  filters: ExerciseFilters;
};

export enum ExerciseSortBy {
  LastPerformed = 'LAST_PERFORMED',
  Name = 'NAME',
  TimesPerformed = 'TIMES_PERFORMED'
}

export enum ExerciseSource {
  Custom = 'CUSTOM',
  Github = 'GITHUB'
}

export type ExercisesListInput = {
  filter?: InputMaybe<ExerciseListFilter>;
  search: SearchInput;
  sortBy?: InputMaybe<ExerciseSortBy>;
};

export enum ExportItem {
  Measurements = 'MEASUREMENTS',
  Media = 'MEDIA',
  MediaGroup = 'MEDIA_GROUP',
  People = 'PEOPLE',
  Workouts = 'WORKOUTS'
}

export type ExportJob = {
  endedAt: Scalars['DateTime']['output'];
  exported: Array<ExportItem>;
  startedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type GenreDetails = {
  contents: IdResults;
  details: GenreListItem;
};

export type GenreDetailsInput = {
  genreId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type GenreListItem = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  numItems?: Maybe<Scalars['Int']['output']>;
};

export type GenreListResults = {
  details: SearchDetails;
  items: Array<GenreListItem>;
};

export type GraphqlCalendarEvent = {
  calendarEventId: Scalars['String']['output'];
  date: Scalars['NaiveDate']['output'];
  episodeName?: Maybe<Scalars['String']['output']>;
  metadataId: Scalars['String']['output'];
  metadataImage?: Maybe<Scalars['String']['output']>;
  metadataLot: MediaLot;
  metadataTitle: Scalars['String']['output'];
  podcastExtraInformation?: Maybe<SeenPodcastExtraInformation>;
  showExtraInformation?: Maybe<SeenShowExtraInformation>;
};

export type GraphqlMediaAssets = {
  images: Array<Scalars['String']['output']>;
  videos: Array<GraphqlVideoAsset>;
};

export type GraphqlMetadataDetails = {
  animeSpecifics?: Maybe<AnimeSpecifics>;
  assets: GraphqlMediaAssets;
  audioBookSpecifics?: Maybe<AudioBookSpecifics>;
  bookSpecifics?: Maybe<BookSpecifics>;
  creators: Array<MetadataCreatorGroupedByRole>;
  description?: Maybe<Scalars['String']['output']>;
  genres: Array<GenreListItem>;
  group?: Maybe<GraphqlMetadataGroup>;
  id: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  isNsfw?: Maybe<Scalars['Boolean']['output']>;
  isPartial?: Maybe<Scalars['Boolean']['output']>;
  lot: MediaLot;
  mangaSpecifics?: Maybe<MangaSpecifics>;
  movieSpecifics?: Maybe<MovieSpecifics>;
  originalLanguage?: Maybe<Scalars['String']['output']>;
  podcastSpecifics?: Maybe<PodcastSpecifics>;
  productionStatus?: Maybe<Scalars['String']['output']>;
  providerRating?: Maybe<Scalars['Decimal']['output']>;
  publishDate?: Maybe<Scalars['NaiveDate']['output']>;
  publishYear?: Maybe<Scalars['Int']['output']>;
  showSpecifics?: Maybe<ShowSpecifics>;
  source: MediaSource;
  sourceUrl?: Maybe<Scalars['String']['output']>;
  suggestions: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  videoGameSpecifics?: Maybe<VideoGameSpecifics>;
  visualNovelSpecifics?: Maybe<VisualNovelSpecifics>;
  watchProviders: Array<WatchProvider>;
};

export type GraphqlMetadataGroup = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  part: Scalars['Int']['output'];
};

export enum GraphqlSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type GraphqlVideoAsset = {
  source: MetadataVideoSource;
  videoId: Scalars['String']['output'];
};

export type GroupedCalendarEvent = {
  date: Scalars['NaiveDate']['output'];
  events: Array<GraphqlCalendarEvent>;
};

export type IdAndNamedObject = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type IdResults = {
  details: SearchDetails;
  items: Array<Scalars['String']['output']>;
};

export type ImportDetails = {
  total: Scalars['Int']['output'];
};

/** The various steps in which media importing can fail */
export enum ImportFailStep {
  /** Failed to transform the data into the required format */
  InputTransformation = 'INPUT_TRANSFORMATION',
  /** Failed to get details from the source itself (for eg: MediaTracker, Goodreads etc.) */
  ItemDetailsFromSource = 'ITEM_DETAILS_FROM_SOURCE',
  /** Failed to get metadata from the provider (for eg: Openlibrary, IGDB etc.) */
  MediaDetailsFromProvider = 'MEDIA_DETAILS_FROM_PROVIDER',
  /** Failed to save a review/rating item */
  ReviewConversion = 'REVIEW_CONVERSION',
  /** Failed to save a seen history item */
  SeenHistoryConversion = 'SEEN_HISTORY_CONVERSION'
}

export type ImportFailedItem = {
  error?: Maybe<Scalars['String']['output']>;
  identifier: Scalars['String']['output'];
  lot?: Maybe<MediaLot>;
  step: ImportFailStep;
};

/** Comments left in replies to posted reviews. */
export type ImportOrExportItemReviewComment = {
  createdOn: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  /** The user ids of all those who liked it. */
  likedBy: Array<Scalars['String']['output']>;
  text: Scalars['String']['output'];
  user: IdAndNamedObject;
};

export type ImportReport = {
  details?: Maybe<ImportResultResponse>;
  finishedOn?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  source: ImportSource;
  startedOn: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  wasSuccess?: Maybe<Scalars['Boolean']['output']>;
};

export type ImportResultResponse = {
  failedItems: Array<ImportFailedItem>;
  import: ImportDetails;
};

export enum ImportSource {
  Audiobookshelf = 'AUDIOBOOKSHELF',
  GenericJson = 'GENERIC_JSON',
  Goodreads = 'GOODREADS',
  Igdb = 'IGDB',
  Imdb = 'IMDB',
  Jellyfin = 'JELLYFIN',
  Mal = 'MAL',
  MediaTracker = 'MEDIA_TRACKER',
  Movary = 'MOVARY',
  OpenScale = 'OPEN_SCALE',
  StoryGraph = 'STORY_GRAPH',
  StrongApp = 'STRONG_APP',
  Trakt = 'TRAKT'
}

export type Integration = {
  createdOn: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isDisabled?: Maybe<Scalars['Boolean']['output']>;
  lastTriggeredOn?: Maybe<Scalars['DateTime']['output']>;
  lot: IntegrationLot;
  maximumProgress?: Maybe<Scalars['Decimal']['output']>;
  minimumProgress?: Maybe<Scalars['Decimal']['output']>;
  provider: IntegrationProvider;
};

export enum IntegrationLot {
  Push = 'PUSH',
  Sink = 'SINK',
  Yank = 'YANK'
}

export enum IntegrationProvider {
  Audiobookshelf = 'AUDIOBOOKSHELF',
  Emby = 'EMBY',
  Jellyfin = 'JELLYFIN',
  Kodi = 'KODI',
  Plex = 'PLEX',
  Radarr = 'RADARR',
  Sonarr = 'SONARR'
}

export type IntegrationSourceSpecificsInput = {
  audiobookshelfBaseUrl?: InputMaybe<Scalars['String']['input']>;
  audiobookshelfToken?: InputMaybe<Scalars['String']['input']>;
  plexUsername?: InputMaybe<Scalars['String']['input']>;
  radarrApiKey?: InputMaybe<Scalars['String']['input']>;
  radarrBaseUrl?: InputMaybe<Scalars['String']['input']>;
  radarrProfileId?: InputMaybe<Scalars['Int']['input']>;
  radarrRootFolderPath?: InputMaybe<Scalars['String']['input']>;
  radarrSyncCollectionIds?: InputMaybe<Array<Scalars['String']['input']>>;
  sonarrApiKey?: InputMaybe<Scalars['String']['input']>;
  sonarrBaseUrl?: InputMaybe<Scalars['String']['input']>;
  sonarrProfileId?: InputMaybe<Scalars['Int']['input']>;
  sonarrRootFolderPath?: InputMaybe<Scalars['String']['input']>;
  sonarrSyncCollectionIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type LoginError = {
  error: LoginErrorVariant;
};

export enum LoginErrorVariant {
  AccountDisabled = 'ACCOUNT_DISABLED',
  CredentialsMismatch = 'CREDENTIALS_MISMATCH',
  IncorrectProviderChosen = 'INCORRECT_PROVIDER_CHOSEN',
  UsernameDoesNotExist = 'USERNAME_DOES_NOT_EXIST'
}

export type LoginResponse = {
  apiKey: Scalars['String']['output'];
};

export type LoginResult = LoginError | LoginResponse;

export type MangaSpecifics = {
  chapters?: Maybe<Scalars['Int']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  volumes?: Maybe<Scalars['Int']['output']>;
};

export type MangaSpecificsInput = {
  chapters?: InputMaybe<Scalars['Int']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  volumes?: InputMaybe<Scalars['Int']['input']>;
};

export type MangaSummary = {
  chapters: Scalars['Int']['output'];
  read: Scalars['Int']['output'];
};

export type MediaCollectionContentsResults = {
  details: SearchDetails;
  items: Array<EntityWithLot>;
};

export type MediaFilter = {
  collection?: InputMaybe<Scalars['String']['input']>;
  general?: InputMaybe<MediaGeneralFilter>;
};

export enum MediaGeneralFilter {
  All = 'ALL',
  Dropped = 'DROPPED',
  OnAHold = 'ON_A_HOLD',
  Rated = 'RATED',
  Unfinished = 'UNFINISHED',
  Unrated = 'UNRATED'
}

/** The different types of media that can be stored. */
export enum MediaLot {
  Anime = 'ANIME',
  AudioBook = 'AUDIO_BOOK',
  Book = 'BOOK',
  Manga = 'MANGA',
  Movie = 'MOVIE',
  Podcast = 'PODCAST',
  Show = 'SHOW',
  VideoGame = 'VIDEO_GAME',
  VisualNovel = 'VISUAL_NOVEL'
}

export type MediaOverallSummary = {
  interactedWith: Scalars['Int']['output'];
  reviewed: Scalars['Int']['output'];
};

export enum MediaSortBy {
  LastSeen = 'LAST_SEEN',
  LastUpdated = 'LAST_UPDATED',
  Rating = 'RATING',
  ReleaseDate = 'RELEASE_DATE',
  Title = 'TITLE'
}

export type MediaSortInput = {
  by?: MediaSortBy;
  order?: GraphqlSortOrder;
};

/** The different sources (or providers) from which data can be obtained from. */
export enum MediaSource {
  Anilist = 'ANILIST',
  Audible = 'AUDIBLE',
  Custom = 'CUSTOM',
  GoogleBooks = 'GOOGLE_BOOKS',
  Igdb = 'IGDB',
  Itunes = 'ITUNES',
  Listennotes = 'LISTENNOTES',
  Mal = 'MAL',
  MangaUpdates = 'MANGA_UPDATES',
  Openlibrary = 'OPENLIBRARY',
  Tmdb = 'TMDB',
  Vndb = 'VNDB'
}

export enum MediaStateChanged {
  MetadataChaptersOrEpisodesChanged = 'METADATA_CHAPTERS_OR_EPISODES_CHANGED',
  MetadataEpisodeImagesChanged = 'METADATA_EPISODE_IMAGES_CHANGED',
  MetadataEpisodeNameChanged = 'METADATA_EPISODE_NAME_CHANGED',
  MetadataEpisodeReleased = 'METADATA_EPISODE_RELEASED',
  MetadataNumberOfSeasonsChanged = 'METADATA_NUMBER_OF_SEASONS_CHANGED',
  MetadataPublished = 'METADATA_PUBLISHED',
  MetadataReleaseDateChanged = 'METADATA_RELEASE_DATE_CHANGED',
  MetadataStatusChanged = 'METADATA_STATUS_CHANGED',
  PersonMediaAssociated = 'PERSON_MEDIA_ASSOCIATED',
  ReviewPosted = 'REVIEW_POSTED'
}

export type MetadataCreator = {
  character?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type MetadataCreatorGroupedByRole = {
  items: Array<MetadataCreator>;
  name: Scalars['String']['output'];
};

export type MetadataGroup = {
  description?: Maybe<Scalars['String']['output']>;
  displayImages: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  isPartial?: Maybe<Scalars['Boolean']['output']>;
  lot: MediaLot;
  parts: Scalars['Int']['output'];
  source: MediaSource;
  title: Scalars['String']['output'];
};

export type MetadataGroupDetails = {
  contents: Array<Scalars['String']['output']>;
  details: MetadataGroup;
  sourceUrl?: Maybe<Scalars['String']['output']>;
};

export type MetadataGroupSearchInput = {
  lot: MediaLot;
  search: SearchInput;
  source: MediaSource;
};

export type MetadataGroupSearchItem = {
  identifier: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  parts?: Maybe<Scalars['Int']['output']>;
};

export type MetadataGroupSearchResults = {
  details: SearchDetails;
  items: Array<MetadataGroupSearchItem>;
};

export type MetadataListInput = {
  filter?: InputMaybe<MediaFilter>;
  lot?: InputMaybe<MediaLot>;
  search: SearchInput;
  sort?: InputMaybe<MediaSortInput>;
};

export type MetadataPartialDetails = {
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lot: MediaLot;
  publishYear?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
};

export type MetadataSearchInput = {
  lot: MediaLot;
  search: SearchInput;
  source: MediaSource;
};

export type MetadataSearchItem = {
  identifier: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  publishYear?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
};

export type MetadataSearchItemResponse = {
  databaseId?: Maybe<Scalars['String']['output']>;
  /** Whether the user has interacted with this media item. */
  hasInteracted: Scalars['Boolean']['output'];
  item: MetadataSearchItem;
};

export type MetadataSearchResults = {
  details: SearchDetails;
  items: Array<MetadataSearchItemResponse>;
};

export enum MetadataVideoSource {
  Custom = 'CUSTOM',
  Dailymotion = 'DAILYMOTION',
  Youtube = 'YOUTUBE'
}

export type MovieSpecifics = {
  runtime?: Maybe<Scalars['Int']['output']>;
};

export type MovieSpecificsInput = {
  runtime?: InputMaybe<Scalars['Int']['input']>;
};

export type MoviesSummary = {
  runtime: Scalars['Int']['output'];
  watched: Scalars['Int']['output'];
};

export type MutationRoot = {
  /** Add a entity to a collection if it is not there, otherwise do nothing. */
  addEntityToCollection: Scalars['Boolean']['output'];
  /** Fetch details about a media and create a media item in the database. */
  commitMetadata: StringIdObject;
  /** Fetch details about a media group and create a media group item in the database. */
  commitMetadataGroup: StringIdObject;
  /** Fetches details about a person and creates a person item in the database. */
  commitPerson: StringIdObject;
  /** Create a custom exercise. */
  createCustomExercise: Scalars['String']['output'];
  /** Create a custom media item. */
  createCustomMetadata: StringIdObject;
  /** Create a new collection for the logged in user or edit details of an existing one. */
  createOrUpdateCollection: StringIdObject;
  /** Create, like or delete a comment on a review. */
  createReviewComment: Scalars['Boolean']['output'];
  /** Create an integration for the currently logged in user. */
  createUserIntegration: StringIdObject;
  /** Create a user measurement. */
  createUserMeasurement: Scalars['DateTime']['output'];
  /** Add a notification platform for the currently logged in user. */
  createUserNotificationPlatform: Scalars['String']['output'];
  /** Take a user workout, process it and commit it to database. */
  createUserWorkout: Scalars['String']['output'];
  /** Delete a collection. */
  deleteCollection: Scalars['Boolean']['output'];
  /** Delete a review if it belongs to the currently logged in user. */
  deleteReview: Scalars['Boolean']['output'];
  /** Delete an S3 object by the given key. */
  deleteS3Object: Scalars['Boolean']['output'];
  /** Delete a seen item from a user's history. */
  deleteSeenItem: StringIdObject;
  /** Delete a user. The account making the user must an `Admin`. */
  deleteUser: Scalars['Boolean']['output'];
  /** Delete an integration for the currently logged in user. */
  deleteUserIntegration: Scalars['Boolean']['output'];
  /** Delete a user measurement. */
  deleteUserMeasurement: Scalars['Boolean']['output'];
  /** Delete a notification platform for the currently logged in user. */
  deleteUserNotificationPlatform: Scalars['Boolean']['output'];
  /** Delete a workout and remove all exercise associations. */
  deleteUserWorkout: Scalars['Boolean']['output'];
  /** Start a background job. */
  deployBackgroundJob: Scalars['Boolean']['output'];
  /**
   * Deploy job to update progress of media items in bulk. For seen items in progress,
   * progress is updated only if it has actually changed.
   */
  deployBulkProgressUpdate: Scalars['Boolean']['output'];
  /** Deploy a job to export data for a user. */
  deployExportJob: Scalars['Boolean']['output'];
  /** Add job to import data from various sources. */
  deployImportJob: Scalars['Boolean']['output'];
  /** Deploy a job to update a media item's metadata. */
  deployUpdateMetadataJob: Scalars['Boolean']['output'];
  /** Deploy a job to update a person's metadata. */
  deployUpdatePersonJob: Scalars['Boolean']['output'];
  /**
   * Use this mutation to call a function that needs to be tested for implementation.
   * It is only available in development mode.
   */
  developmentMutation: Scalars['Boolean']['output'];
  /** Generate an auth token without any expiry. */
  generateAuthToken: Scalars['String']['output'];
  /** Login a user using their username and password and return an auth token. */
  loginUser: LoginResult;
  /**
   * Merge a media item into another. This will move all `seen`, `collection`
   * and `review` associations with to the metadata.
   */
  mergeMetadata: Scalars['Boolean']['output'];
  /** Create or update a review. */
  postReview: StringIdObject;
  /** Get a presigned URL (valid for 10 minutes) for a given file name. */
  presignedPutS3Url: PresignedPutUrlResponse;
  /**
   * Create a new user for the service. Also set their `lot` as admin if
   * they are the first user.
   */
  registerUser: RegisterResult;
  /** Remove an entity from a collection if it is not there, otherwise do nothing. */
  removeEntityFromCollection: StringIdObject;
  /** Test all notification platforms for the currently logged in user. */
  testUserNotificationPlatforms: Scalars['Boolean']['output'];
  /** Update a custom exercise. */
  updateCustomExercise: Scalars['Boolean']['output'];
  /** Update the start/end date of a seen item. */
  updateSeenItem: Scalars['Boolean']['output'];
  /** Update a user's profile details. */
  updateUser: StringIdObject;
  /** Update an integration for the currently logged in user. */
  updateUserIntegration: Scalars['Boolean']['output'];
  /** Edit a notification platform for the currently logged in user. */
  updateUserNotificationPlatform: Scalars['Boolean']['output'];
  /** Change a user's preferences. */
  updateUserPreference: Scalars['Boolean']['output'];
  /** Change the details about a user's workout. */
  updateUserWorkout: Scalars['Boolean']['output'];
};


export type MutationRootAddEntityToCollectionArgs = {
  input: ChangeCollectionToEntityInput;
};


export type MutationRootCommitMetadataArgs = {
  input: CommitMediaInput;
};


export type MutationRootCommitMetadataGroupArgs = {
  input: CommitMediaInput;
};


export type MutationRootCommitPersonArgs = {
  input: CommitPersonInput;
};


export type MutationRootCreateCustomExerciseArgs = {
  input: ExerciseInput;
};


export type MutationRootCreateCustomMetadataArgs = {
  input: CreateCustomMetadataInput;
};


export type MutationRootCreateOrUpdateCollectionArgs = {
  input: CreateOrUpdateCollectionInput;
};


export type MutationRootCreateReviewCommentArgs = {
  input: CreateReviewCommentInput;
};


export type MutationRootCreateUserIntegrationArgs = {
  input: CreateUserIntegrationInput;
};


export type MutationRootCreateUserMeasurementArgs = {
  input: UserMeasurementInput;
};


export type MutationRootCreateUserNotificationPlatformArgs = {
  input: CreateUserNotificationPlatformInput;
};


export type MutationRootCreateUserWorkoutArgs = {
  input: UserWorkoutInput;
};


export type MutationRootDeleteCollectionArgs = {
  collectionName: Scalars['String']['input'];
};


export type MutationRootDeleteReviewArgs = {
  reviewId: Scalars['String']['input'];
};


export type MutationRootDeleteS3ObjectArgs = {
  key: Scalars['String']['input'];
};


export type MutationRootDeleteSeenItemArgs = {
  seenId: Scalars['String']['input'];
};


export type MutationRootDeleteUserArgs = {
  toDeleteUserId: Scalars['String']['input'];
};


export type MutationRootDeleteUserIntegrationArgs = {
  integrationId: Scalars['String']['input'];
};


export type MutationRootDeleteUserMeasurementArgs = {
  timestamp: Scalars['DateTime']['input'];
};


export type MutationRootDeleteUserNotificationPlatformArgs = {
  notificationId: Scalars['String']['input'];
};


export type MutationRootDeleteUserWorkoutArgs = {
  workoutId: Scalars['String']['input'];
};


export type MutationRootDeployBackgroundJobArgs = {
  jobName: BackgroundJob;
};


export type MutationRootDeployBulkProgressUpdateArgs = {
  input: Array<ProgressUpdateInput>;
};


export type MutationRootDeployExportJobArgs = {
  toExport: Array<ExportItem>;
};


export type MutationRootDeployImportJobArgs = {
  input: DeployImportJobInput;
};


export type MutationRootDeployUpdateMetadataJobArgs = {
  metadataId: Scalars['String']['input'];
};


export type MutationRootDeployUpdatePersonJobArgs = {
  personId: Scalars['String']['input'];
};


export type MutationRootLoginUserArgs = {
  input: AuthUserInput;
};


export type MutationRootMergeMetadataArgs = {
  mergeFrom: Scalars['String']['input'];
  mergeInto: Scalars['String']['input'];
};


export type MutationRootPostReviewArgs = {
  input: PostReviewInput;
};


export type MutationRootPresignedPutS3UrlArgs = {
  input: PresignedPutUrlInput;
};


export type MutationRootRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationRootRemoveEntityFromCollectionArgs = {
  input: ChangeCollectionToEntityInput;
};


export type MutationRootUpdateCustomExerciseArgs = {
  input: UpdateCustomExerciseInput;
};


export type MutationRootUpdateSeenItemArgs = {
  input: UpdateSeenItemInput;
};


export type MutationRootUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationRootUpdateUserIntegrationArgs = {
  input: UpdateUserIntegrationInput;
};


export type MutationRootUpdateUserNotificationPlatformArgs = {
  input: UpdateUserNotificationPlatformInput;
};


export type MutationRootUpdateUserPreferenceArgs = {
  input: UpdateUserPreferenceInput;
};


export type MutationRootUpdateUserWorkoutArgs = {
  input: UpdateUserWorkoutInput;
};

export type NotificationPlatform = {
  createdOn: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isDisabled?: Maybe<Scalars['Boolean']['output']>;
  lot: NotificationPlatformLot;
};

export enum NotificationPlatformLot {
  Apprise = 'APPRISE',
  Discord = 'DISCORD',
  Email = 'EMAIL',
  Gotify = 'GOTIFY',
  Ntfy = 'NTFY',
  PushBullet = 'PUSH_BULLET',
  PushOver = 'PUSH_OVER',
  PushSafer = 'PUSH_SAFER',
  Telegram = 'TELEGRAM'
}

export type OidcTokenOutput = {
  email: Scalars['String']['output'];
  subject: Scalars['String']['output'];
};

export type OidcUserInput = {
  email: Scalars['String']['input'];
  issuerId: Scalars['String']['input'];
};

export type PasswordUserInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type PeopleListInput = {
  search: SearchInput;
  sort?: InputMaybe<PersonSortInput>;
};

export type PeopleSearchInput = {
  search: SearchInput;
  source: MediaSource;
  sourceSpecifics?: InputMaybe<PersonSourceSpecificsInput>;
};

export type PeopleSearchItem = {
  birthYear?: Maybe<Scalars['Int']['output']>;
  identifier: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type PeopleSearchResults = {
  details: SearchDetails;
  items: Array<PeopleSearchItem>;
};

export type Person = {
  birthDate?: Maybe<Scalars['NaiveDate']['output']>;
  createdOn: Scalars['DateTime']['output'];
  deathDate?: Maybe<Scalars['NaiveDate']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayImages: Array<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  isPartial?: Maybe<Scalars['Boolean']['output']>;
  lastUpdatedOn: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  place?: Maybe<Scalars['String']['output']>;
  source: MediaSource;
  website?: Maybe<Scalars['String']['output']>;
};

export type PersonDetails = {
  contents: Array<PersonDetailsGroupedByRole>;
  details: Person;
  sourceUrl?: Maybe<Scalars['String']['output']>;
};

export type PersonDetailsGroupedByRole = {
  /** The media items in which this role was performed. */
  items: Array<PersonDetailsItemWithCharacter>;
  /** The name of the role performed. */
  name: Scalars['String']['output'];
};

export type PersonDetailsItemWithCharacter = {
  character?: Maybe<Scalars['String']['output']>;
  mediaId: Scalars['String']['output'];
};

export enum PersonSortBy {
  MediaItems = 'MEDIA_ITEMS',
  Name = 'NAME'
}

export type PersonSortInput = {
  by?: PersonSortBy;
  order?: GraphqlSortOrder;
};

export type PersonSourceSpecificsInput = {
  isAnilistStudio?: InputMaybe<Scalars['Boolean']['input']>;
  isTmdbCompany?: InputMaybe<Scalars['Boolean']['input']>;
};

export type PodcastEpisode = {
  id: Scalars['String']['output'];
  number: Scalars['Int']['output'];
  overview?: Maybe<Scalars['String']['output']>;
  publishDate: Scalars['NaiveDate']['output'];
  runtime?: Maybe<Scalars['Int']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type PodcastEpisodeInput = {
  id: Scalars['String']['input'];
  number: Scalars['Int']['input'];
  overview?: InputMaybe<Scalars['String']['input']>;
  publishDate: Scalars['NaiveDate']['input'];
  runtime?: InputMaybe<Scalars['Int']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type PodcastSpecifics = {
  episodes: Array<PodcastEpisode>;
  totalEpisodes: Scalars['Int']['output'];
};

export type PodcastSpecificsInput = {
  episodes: Array<PodcastEpisodeInput>;
  totalEpisodes: Scalars['Int']['input'];
};

export type PodcastsSummary = {
  played: Scalars['Int']['output'];
  playedEpisodes: Scalars['Int']['output'];
  runtime: Scalars['Int']['output'];
};

export type PostReviewInput = {
  animeEpisodeNumber?: InputMaybe<Scalars['Int']['input']>;
  collectionId?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  isSpoiler?: InputMaybe<Scalars['Boolean']['input']>;
  mangaChapterNumber?: InputMaybe<Scalars['Int']['input']>;
  mangaVolumeNumber?: InputMaybe<Scalars['Int']['input']>;
  metadataGroupId?: InputMaybe<Scalars['String']['input']>;
  metadataId?: InputMaybe<Scalars['String']['input']>;
  personId?: InputMaybe<Scalars['String']['input']>;
  podcastEpisodeNumber?: InputMaybe<Scalars['Int']['input']>;
  rating?: InputMaybe<Scalars['Decimal']['input']>;
  /** ID of the review if this is an update to an existing review */
  reviewId?: InputMaybe<Scalars['String']['input']>;
  showEpisodeNumber?: InputMaybe<Scalars['Int']['input']>;
  showSeasonNumber?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Visibility>;
};

export type PresignedPutUrlInput = {
  fileName: Scalars['String']['input'];
  prefix: Scalars['String']['input'];
};

export type PresignedPutUrlResponse = {
  key: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

/** An exercise that has been processed and committed to the database. */
export type ProcessedExercise = {
  assets?: Maybe<EntityAssets>;
  lot: ExerciseLot;
  name: Scalars['String']['output'];
  notes: Array<Scalars['String']['output']>;
  restTime?: Maybe<Scalars['Int']['output']>;
  sets: Array<WorkoutSetRecord>;
  /** The indices of the exercises with which this has been superset with. */
  supersetWith: Array<Scalars['Int']['output']>;
  total?: Maybe<WorkoutOrExerciseTotals>;
};

export type ProgressUpdateInput = {
  animeEpisodeNumber?: InputMaybe<Scalars['Int']['input']>;
  changeState?: InputMaybe<SeenState>;
  date?: InputMaybe<Scalars['NaiveDate']['input']>;
  mangaChapterNumber?: InputMaybe<Scalars['Int']['input']>;
  mangaVolumeNumber?: InputMaybe<Scalars['Int']['input']>;
  metadataId: Scalars['String']['input'];
  podcastEpisodeNumber?: InputMaybe<Scalars['Int']['input']>;
  progress?: InputMaybe<Scalars['Decimal']['input']>;
  providerWatchedOn?: InputMaybe<Scalars['String']['input']>;
  showEpisodeNumber?: InputMaybe<Scalars['Int']['input']>;
  showSeasonNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type ProviderLanguageInformation = {
  default: Scalars['String']['output'];
  source: MediaSource;
  supported: Array<Scalars['String']['output']>;
};

export type QueryRoot = {
  /** Get the contents of a collection and respect visibility. */
  collectionContents: CollectionContents;
  /** Get some primary information about the service. */
  coreDetails: CoreDetails;
  /** Get details about an exercise. */
  exerciseDetails: Exercise;
  /** Get all the parameters related to exercises. */
  exerciseParameters: ExerciseParameters;
  /** Get a paginated list of exercises in the database. */
  exercisesList: ExerciseListResults;
  /** Get details about a genre present in the database. */
  genreDetails: GenreDetails;
  /** Get paginated list of genres. */
  genresList: GenreListResults;
  /** Get an authorization URL using the configured OIDC client. */
  getOidcRedirectUrl: Scalars['String']['output'];
  /** Get an access token using the configured OIDC client. */
  getOidcToken: OidcTokenOutput;
  /** Get a presigned URL (valid for 90 minutes) for a given key. */
  getPresignedS3Url: Scalars['String']['output'];
  /** Get all the import jobs deployed by the user. */
  importReports: Array<ImportReport>;
  /** Get a summary of all the media items that have been consumed by this user. */
  latestUserSummary: UserSummary;
  /** Get details about a media present in the database. */
  metadataDetails: GraphqlMetadataDetails;
  /** Get details about a metadata group present in the database. */
  metadataGroupDetails: MetadataGroupDetails;
  /** Search for a list of groups from a given source. */
  metadataGroupSearch: MetadataGroupSearchResults;
  /** Get paginated list of metadata groups. */
  metadataGroupsList: IdResults;
  /** Get all the media items related to a user for a specific media type. */
  metadataList: IdResults;
  /** Get partial details about a media present in the database. */
  metadataPartialDetails: MetadataPartialDetails;
  /** Search for a list of media for a given type. */
  metadataSearch: MetadataSearchResults;
  /** Get paginated list of people. */
  peopleList: IdResults;
  /** Search for a list of people from a given source. */
  peopleSearch: PeopleSearchResults;
  /** Get details about a creator present in the database. */
  personDetails: PersonDetails;
  /** Get all languages supported by all the providers. */
  providersLanguageInformation: Array<ProviderLanguageInformation>;
  /** Get user by OIDC issuer ID. */
  userByOidcIssuerId?: Maybe<Scalars['String']['output']>;
  /** Get calendar events for a user between a given date range. */
  userCalendarEvents: Array<GroupedCalendarEvent>;
  /** Get all collections for the currently logged in user. */
  userCollectionsList: Array<CollectionItem>;
  /** Get details about the currently logged in user. */
  userDetails: UserDetailsResult;
  /** Get information about an exercise for a user. */
  userExerciseDetails: UserExerciseDetails;
  /** Get all the export jobs for the current user. */
  userExports: Array<ExportJob>;
  /** Get all the integrations for the currently logged in user. */
  userIntegrations: Array<Integration>;
  /** Get all the measurements for a user. */
  userMeasurementsList: Array<UserMeasurement>;
  /** Get details that can be displayed to a user for a media. */
  userMetadataDetails: UserMetadataDetails;
  /** Get details that can be displayed to a user for a metadata group. */
  userMetadataGroupDetails: UserMetadataGroupDetails;
  /** Get all the notification platforms for the currently logged in user. */
  userNotificationPlatforms: Array<NotificationPlatform>;
  /** Get details that can be displayed to a user for a creator. */
  userPersonDetails: UserPersonDetails;
  /** Get a user's preferences. */
  userPreferences: UserPreferences;
  /** Get upcoming calendar events for the given filter. */
  userUpcomingCalendarEvents: Array<GraphqlCalendarEvent>;
  /** Get a paginated list of workouts done by the user. */
  userWorkoutsList: WorkoutListResults;
  /** Get details about all the users in the service. */
  usersList: Array<User>;
  /** Get details about a workout. */
  workoutDetails: UserWorkoutDetails;
};


export type QueryRootCollectionContentsArgs = {
  input: CollectionContentsInput;
};


export type QueryRootExerciseDetailsArgs = {
  exerciseId: Scalars['String']['input'];
};


export type QueryRootExercisesListArgs = {
  input: ExercisesListInput;
};


export type QueryRootGenreDetailsArgs = {
  input: GenreDetailsInput;
};


export type QueryRootGenresListArgs = {
  input: SearchInput;
};


export type QueryRootGetOidcTokenArgs = {
  code: Scalars['String']['input'];
};


export type QueryRootGetPresignedS3UrlArgs = {
  key: Scalars['String']['input'];
};


export type QueryRootMetadataDetailsArgs = {
  metadataId: Scalars['String']['input'];
};


export type QueryRootMetadataGroupDetailsArgs = {
  metadataGroupId: Scalars['String']['input'];
};


export type QueryRootMetadataGroupSearchArgs = {
  input: MetadataGroupSearchInput;
};


export type QueryRootMetadataGroupsListArgs = {
  input: SearchInput;
};


export type QueryRootMetadataListArgs = {
  input: MetadataListInput;
};


export type QueryRootMetadataPartialDetailsArgs = {
  metadataId: Scalars['String']['input'];
};


export type QueryRootMetadataSearchArgs = {
  input: MetadataSearchInput;
};


export type QueryRootPeopleListArgs = {
  input: PeopleListInput;
};


export type QueryRootPeopleSearchArgs = {
  input: PeopleSearchInput;
};


export type QueryRootPersonDetailsArgs = {
  personId: Scalars['String']['input'];
};


export type QueryRootUserByOidcIssuerIdArgs = {
  oidcIssuerId: Scalars['String']['input'];
};


export type QueryRootUserCalendarEventsArgs = {
  input: UserCalendarEventInput;
};


export type QueryRootUserCollectionsListArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRootUserExerciseDetailsArgs = {
  exerciseId: Scalars['String']['input'];
};


export type QueryRootUserMeasurementsListArgs = {
  input: UserMeasurementsListInput;
};


export type QueryRootUserMetadataDetailsArgs = {
  metadataId: Scalars['String']['input'];
};


export type QueryRootUserMetadataGroupDetailsArgs = {
  metadataGroupId: Scalars['String']['input'];
};


export type QueryRootUserPersonDetailsArgs = {
  personId: Scalars['String']['input'];
};


export type QueryRootUserUpcomingCalendarEventsArgs = {
  input: UserUpcomingCalendarEventInput;
};


export type QueryRootUserWorkoutsListArgs = {
  input: SearchInput;
};


export type QueryRootUsersListArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRootWorkoutDetailsArgs = {
  workoutId: Scalars['String']['input'];
};

export type RegisterError = {
  error: RegisterErrorVariant;
};

export enum RegisterErrorVariant {
  Disabled = 'DISABLED',
  IdentifierAlreadyExists = 'IDENTIFIER_ALREADY_EXISTS'
}

export type RegisterResult = RegisterError | StringIdObject;

export type RegisterUserInput = {
  /** If registration is disabled, this can be used to override it. */
  adminAccessToken?: InputMaybe<Scalars['String']['input']>;
  data: AuthUserInput;
};

export type ReviewItem = {
  animeExtraInformation?: Maybe<SeenAnimeExtraInformation>;
  comments: Array<ImportOrExportItemReviewComment>;
  id: Scalars['String']['output'];
  isSpoiler: Scalars['Boolean']['output'];
  mangaExtraInformation?: Maybe<SeenMangaExtraInformation>;
  podcastExtraInformation?: Maybe<SeenPodcastExtraInformation>;
  postedBy: IdAndNamedObject;
  postedOn: Scalars['DateTime']['output'];
  rating?: Maybe<Scalars['Decimal']['output']>;
  showExtraInformation?: Maybe<SeenShowExtraInformation>;
  textOriginal?: Maybe<Scalars['String']['output']>;
  textRendered?: Maybe<Scalars['String']['output']>;
  visibility: Visibility;
};

export type SearchDetails = {
  nextPage?: Maybe<Scalars['Int']['output']>;
  total: Scalars['Int']['output'];
};

export type SearchInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type Seen = {
  animeExtraInformation?: Maybe<SeenAnimeExtraInformation>;
  finishedOn?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  lastUpdatedOn: Scalars['DateTime']['output'];
  mangaExtraInformation?: Maybe<SeenMangaExtraInformation>;
  metadataId: Scalars['String']['output'];
  numTimesUpdated: Scalars['Int']['output'];
  podcastExtraInformation?: Maybe<SeenPodcastExtraInformation>;
  progress: Scalars['Decimal']['output'];
  providerWatchedOn?: Maybe<Scalars['String']['output']>;
  showExtraInformation?: Maybe<SeenShowExtraInformation>;
  startedOn?: Maybe<Scalars['NaiveDate']['output']>;
  state: SeenState;
  userId: Scalars['String']['output'];
};

export type SeenAnimeExtraInformation = {
  episode?: Maybe<Scalars['Int']['output']>;
};

export type SeenMangaExtraInformation = {
  chapter?: Maybe<Scalars['Int']['output']>;
  volume?: Maybe<Scalars['Int']['output']>;
};

export type SeenPodcastExtraInformation = {
  episode: Scalars['Int']['output'];
};

export type SeenShowExtraInformation = {
  episode: Scalars['Int']['output'];
  season: Scalars['Int']['output'];
};

export enum SeenState {
  Completed = 'COMPLETED',
  Dropped = 'DROPPED',
  InProgress = 'IN_PROGRESS',
  OnAHold = 'ON_A_HOLD'
}

/** The types of set (mostly characterized by exertion level). */
export enum SetLot {
  Drop = 'DROP',
  Failure = 'FAILURE',
  Normal = 'NORMAL',
  WarmUp = 'WARM_UP'
}

/** Details about the statistics of the set performed. */
export type SetStatisticInput = {
  distance?: InputMaybe<Scalars['Decimal']['input']>;
  duration?: InputMaybe<Scalars['Decimal']['input']>;
  oneRm?: InputMaybe<Scalars['Decimal']['input']>;
  pace?: InputMaybe<Scalars['Decimal']['input']>;
  reps?: InputMaybe<Scalars['Decimal']['input']>;
  volume?: InputMaybe<Scalars['Decimal']['input']>;
  weight?: InputMaybe<Scalars['Decimal']['input']>;
};

export type ShowEpisode = {
  episodeNumber: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  overview?: Maybe<Scalars['String']['output']>;
  posterImages: Array<Scalars['String']['output']>;
  publishDate?: Maybe<Scalars['NaiveDate']['output']>;
  runtime?: Maybe<Scalars['Int']['output']>;
};

export type ShowEpisodeSpecificsInput = {
  episodeNumber: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  overview?: InputMaybe<Scalars['String']['input']>;
  posterImages: Array<Scalars['String']['input']>;
  publishDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  runtime?: InputMaybe<Scalars['Int']['input']>;
};

export type ShowSeason = {
  backdropImages: Array<Scalars['String']['output']>;
  episodes: Array<ShowEpisode>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  overview?: Maybe<Scalars['String']['output']>;
  posterImages: Array<Scalars['String']['output']>;
  publishDate?: Maybe<Scalars['NaiveDate']['output']>;
  seasonNumber: Scalars['Int']['output'];
};

export type ShowSeasonSpecificsInput = {
  backdropImages: Array<Scalars['String']['input']>;
  episodes: Array<ShowEpisodeSpecificsInput>;
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  overview?: InputMaybe<Scalars['String']['input']>;
  posterImages: Array<Scalars['String']['input']>;
  publishDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  seasonNumber: Scalars['Int']['input'];
};

export type ShowSpecifics = {
  runtime?: Maybe<Scalars['Int']['output']>;
  seasons: Array<ShowSeason>;
  totalEpisodes?: Maybe<Scalars['Int']['output']>;
  totalSeasons?: Maybe<Scalars['Int']['output']>;
};

export type ShowSpecificsInput = {
  runtime?: InputMaybe<Scalars['Int']['input']>;
  seasons: Array<ShowSeasonSpecificsInput>;
  totalEpisodes?: InputMaybe<Scalars['Int']['input']>;
  totalSeasons?: InputMaybe<Scalars['Int']['input']>;
};

export type ShowsSummary = {
  runtime: Scalars['Int']['output'];
  watched: Scalars['Int']['output'];
  watchedEpisodes: Scalars['Int']['output'];
  watchedSeasons: Scalars['Int']['output'];
};

export type StringIdObject = {
  id: Scalars['String']['output'];
};

export type StrongAppImportMapping = {
  multiplier?: InputMaybe<Scalars['Decimal']['input']>;
  sourceName: Scalars['String']['input'];
  targetName: Scalars['String']['input'];
};

export type UpdateCustomExerciseInput = {
  attributes: ExerciseAttributesInput;
  equipment?: InputMaybe<ExerciseEquipment>;
  force?: InputMaybe<ExerciseForce>;
  id: Scalars['String']['input'];
  level: ExerciseLevel;
  lot: ExerciseLot;
  mechanic?: InputMaybe<ExerciseMechanic>;
  muscles: Array<ExerciseMuscle>;
  oldName: Scalars['String']['input'];
  shouldDelete?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateSeenItemInput = {
  finishedOn?: InputMaybe<Scalars['NaiveDate']['input']>;
  providerWatchedOn?: InputMaybe<Scalars['String']['input']>;
  seenId: Scalars['String']['input'];
  startedOn?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type UpdateUserInput = {
  adminAccessToken?: InputMaybe<Scalars['String']['input']>;
  extraInformation?: InputMaybe<Scalars['JSON']['input']>;
  isDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  lot?: InputMaybe<UserLot>;
  password?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserIntegrationInput = {
  integrationId: Scalars['String']['input'];
  isDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  maximumProgress?: InputMaybe<Scalars['Decimal']['input']>;
  minimumProgress?: InputMaybe<Scalars['Decimal']['input']>;
};

export type UpdateUserNotificationPlatformInput = {
  isDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  notificationId: Scalars['String']['input'];
};

export type UpdateUserPreferenceInput = {
  /**
   * Dot delimited path to the property that needs to be changed. Setting it\
   * to empty resets the preferences to default.
   */
  property: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type UpdateUserWorkoutInput = {
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type User = {
  createdOn: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isDisabled?: Maybe<Scalars['Boolean']['output']>;
  lot: UserLot;
  name: Scalars['String']['output'];
  oidcIssuerId?: Maybe<Scalars['String']['output']>;
};

export type UserCalendarEventInput = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};

export type UserCustomMeasurement = {
  dataType: UserCustomMeasurementDataType;
  name: Scalars['String']['output'];
};

export enum UserCustomMeasurementDataType {
  Decimal = 'DECIMAL'
}

export type UserDetailsError = {
  error: UserDetailsErrorVariant;
};

export enum UserDetailsErrorVariant {
  AuthTokenInvalid = 'AUTH_TOKEN_INVALID'
}

export type UserDetailsResult = User | UserDetailsError;

export type UserExerciseDetails = {
  collections: Array<Collection>;
  details?: Maybe<UserToEntity>;
  history?: Maybe<Array<UserToExerciseHistoryExtraInformation>>;
};

export type UserExerciseInput = {
  assets?: InputMaybe<EntityAssetsInput>;
  exerciseId: Scalars['String']['input'];
  notes: Array<Scalars['String']['input']>;
  restTime?: InputMaybe<Scalars['Int']['input']>;
  sets: Array<UserWorkoutSetRecord>;
  supersetWith: Array<Scalars['Int']['input']>;
};

export type UserExercisePreferences = {
  saveHistory: Scalars['Int']['output'];
  unitSystem: UserUnitSystem;
};

export type UserFeaturesEnabledPreferences = {
  fitness: UserFitnessFeaturesEnabledPreferences;
  media: UserMediaFeaturesEnabledPreferences;
  others: UserOthersFeaturesEnabledPreferences;
};

export type UserFitnessFeaturesEnabledPreferences = {
  enabled: Scalars['Boolean']['output'];
  measurements: Scalars['Boolean']['output'];
  workouts: Scalars['Boolean']['output'];
};

export type UserFitnessPreferences = {
  exercises: UserExercisePreferences;
  measurements: UserMeasurementsPreferences;
};

export type UserFitnessSummary = {
  exercisesInteractedWith: Scalars['Int']['output'];
  measurementsRecorded: Scalars['Int']['output'];
  workouts: UserFitnessWorkoutSummary;
};

export type UserFitnessWorkoutSummary = {
  duration: Scalars['Decimal']['output'];
  recorded: Scalars['Int']['output'];
  weight: Scalars['Decimal']['output'];
};

export type UserGeneralDashboardElement = {
  hidden: Scalars['Boolean']['output'];
  numElements?: Maybe<Scalars['Int']['output']>;
  section: DashboardElementLot;
};

export type UserGeneralPreferences = {
  dashboard: Array<UserGeneralDashboardElement>;
  disableIntegrations: Scalars['Boolean']['output'];
  disableNavigationAnimation: Scalars['Boolean']['output'];
  disableReviews: Scalars['Boolean']['output'];
  disableVideos: Scalars['Boolean']['output'];
  disableWatchProviders: Scalars['Boolean']['output'];
  displayNsfw: Scalars['Boolean']['output'];
  persistQueries: Scalars['Boolean']['output'];
  reviewScale: UserReviewScale;
  watchProviders: Array<Scalars['String']['output']>;
};

export enum UserLot {
  Admin = 'ADMIN',
  Normal = 'NORMAL'
}

/** An export of a measurement taken at a point in time. */
export type UserMeasurement = {
  /** Any comment associated entered by the user. */
  comment?: Maybe<Scalars['String']['output']>;
  /** The name given to this measurement by the user. */
  name?: Maybe<Scalars['String']['output']>;
  /** The contents of the actual measurement. */
  stats: UserMeasurementStats;
  /** The date and time this measurement was made. */
  timestamp: Scalars['DateTime']['output'];
};

/** The actual statistics that were logged in a user measurement. */
export type UserMeasurementDataInput = {
  abdominalSkinfold?: InputMaybe<Scalars['Decimal']['input']>;
  basalMetabolicRate?: InputMaybe<Scalars['Decimal']['input']>;
  bicepsCircumference?: InputMaybe<Scalars['Decimal']['input']>;
  bodyFat?: InputMaybe<Scalars['Decimal']['input']>;
  bodyFatCaliper?: InputMaybe<Scalars['Decimal']['input']>;
  bodyMassIndex?: InputMaybe<Scalars['Decimal']['input']>;
  boneMass?: InputMaybe<Scalars['Decimal']['input']>;
  calories?: InputMaybe<Scalars['Decimal']['input']>;
  chestCircumference?: InputMaybe<Scalars['Decimal']['input']>;
  chestSkinfold?: InputMaybe<Scalars['Decimal']['input']>;
  custom?: InputMaybe<Scalars['JSONObject']['input']>;
  hipCircumference?: InputMaybe<Scalars['Decimal']['input']>;
  leanBodyMass?: InputMaybe<Scalars['Decimal']['input']>;
  muscle?: InputMaybe<Scalars['Decimal']['input']>;
  neckCircumference?: InputMaybe<Scalars['Decimal']['input']>;
  thighCircumference?: InputMaybe<Scalars['Decimal']['input']>;
  thighSkinfold?: InputMaybe<Scalars['Decimal']['input']>;
  totalBodyWater?: InputMaybe<Scalars['Decimal']['input']>;
  totalDailyEnergyExpenditure?: InputMaybe<Scalars['Decimal']['input']>;
  visceralFat?: InputMaybe<Scalars['Decimal']['input']>;
  waistCircumference?: InputMaybe<Scalars['Decimal']['input']>;
  waistToHeightRatio?: InputMaybe<Scalars['Decimal']['input']>;
  waistToHipRatio?: InputMaybe<Scalars['Decimal']['input']>;
  weight?: InputMaybe<Scalars['Decimal']['input']>;
};

/** An export of a measurement taken at a point in time. */
export type UserMeasurementInput = {
  /** Any comment associated entered by the user. */
  comment?: InputMaybe<Scalars['String']['input']>;
  /** The name given to this measurement by the user. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** The contents of the actual measurement. */
  stats: UserMeasurementDataInput;
  /** The date and time this measurement was made. */
  timestamp: Scalars['DateTime']['input'];
};

/** The actual statistics that were logged in a user measurement. */
export type UserMeasurementStats = {
  abdominalSkinfold?: Maybe<Scalars['Decimal']['output']>;
  basalMetabolicRate?: Maybe<Scalars['Decimal']['output']>;
  bicepsCircumference?: Maybe<Scalars['Decimal']['output']>;
  bodyFat?: Maybe<Scalars['Decimal']['output']>;
  bodyFatCaliper?: Maybe<Scalars['Decimal']['output']>;
  bodyMassIndex?: Maybe<Scalars['Decimal']['output']>;
  boneMass?: Maybe<Scalars['Decimal']['output']>;
  calories?: Maybe<Scalars['Decimal']['output']>;
  chestCircumference?: Maybe<Scalars['Decimal']['output']>;
  chestSkinfold?: Maybe<Scalars['Decimal']['output']>;
  custom?: Maybe<Scalars['JSONObject']['output']>;
  hipCircumference?: Maybe<Scalars['Decimal']['output']>;
  leanBodyMass?: Maybe<Scalars['Decimal']['output']>;
  muscle?: Maybe<Scalars['Decimal']['output']>;
  neckCircumference?: Maybe<Scalars['Decimal']['output']>;
  thighCircumference?: Maybe<Scalars['Decimal']['output']>;
  thighSkinfold?: Maybe<Scalars['Decimal']['output']>;
  totalBodyWater?: Maybe<Scalars['Decimal']['output']>;
  totalDailyEnergyExpenditure?: Maybe<Scalars['Decimal']['output']>;
  visceralFat?: Maybe<Scalars['Decimal']['output']>;
  waistCircumference?: Maybe<Scalars['Decimal']['output']>;
  waistToHeightRatio?: Maybe<Scalars['Decimal']['output']>;
  waistToHipRatio?: Maybe<Scalars['Decimal']['output']>;
  weight?: Maybe<Scalars['Decimal']['output']>;
};

export type UserMeasurementsInBuiltPreferences = {
  abdominalSkinfold: Scalars['Boolean']['output'];
  basalMetabolicRate: Scalars['Boolean']['output'];
  bicepsCircumference: Scalars['Boolean']['output'];
  bodyFat: Scalars['Boolean']['output'];
  bodyFatCaliper: Scalars['Boolean']['output'];
  bodyMassIndex: Scalars['Boolean']['output'];
  boneMass: Scalars['Boolean']['output'];
  calories: Scalars['Boolean']['output'];
  chestCircumference: Scalars['Boolean']['output'];
  chestSkinfold: Scalars['Boolean']['output'];
  hipCircumference: Scalars['Boolean']['output'];
  leanBodyMass: Scalars['Boolean']['output'];
  muscle: Scalars['Boolean']['output'];
  neckCircumference: Scalars['Boolean']['output'];
  thighCircumference: Scalars['Boolean']['output'];
  thighSkinfold: Scalars['Boolean']['output'];
  totalBodyWater: Scalars['Boolean']['output'];
  totalDailyEnergyExpenditure: Scalars['Boolean']['output'];
  visceralFat: Scalars['Boolean']['output'];
  waistCircumference: Scalars['Boolean']['output'];
  waistToHeightRatio: Scalars['Boolean']['output'];
  waistToHipRatio: Scalars['Boolean']['output'];
  weight: Scalars['Boolean']['output'];
};

export type UserMeasurementsListInput = {
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UserMeasurementsPreferences = {
  custom: Array<UserCustomMeasurement>;
  inbuilt: UserMeasurementsInBuiltPreferences;
};

export type UserMediaFeaturesEnabledPreferences = {
  anime: Scalars['Boolean']['output'];
  audioBook: Scalars['Boolean']['output'];
  book: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  genres: Scalars['Boolean']['output'];
  groups: Scalars['Boolean']['output'];
  manga: Scalars['Boolean']['output'];
  movie: Scalars['Boolean']['output'];
  people: Scalars['Boolean']['output'];
  podcast: Scalars['Boolean']['output'];
  show: Scalars['Boolean']['output'];
  videoGame: Scalars['Boolean']['output'];
  visualNovel: Scalars['Boolean']['output'];
};

export type UserMediaNextEntry = {
  chapter?: Maybe<Scalars['Int']['output']>;
  episode?: Maybe<Scalars['Int']['output']>;
  season?: Maybe<Scalars['Int']['output']>;
  volume?: Maybe<Scalars['Int']['output']>;
};

export type UserMediaSummary = {
  anime: AnimeSummary;
  audioBooks: AudioBooksSummary;
  books: BooksSummary;
  manga: MangaSummary;
  metadataOverall: MediaOverallSummary;
  movies: MoviesSummary;
  peopleOverall: MediaOverallSummary;
  podcasts: PodcastsSummary;
  shows: ShowsSummary;
  videoGames: VideoGamesSummary;
  visualNovels: VisualNovelsSummary;
};

export type UserMetadataDetails = {
  /** The average rating of this media in this service. */
  averageRating?: Maybe<Scalars['Decimal']['output']>;
  /** The collections in which this media is present. */
  collections: Array<Collection>;
  /** Whether this media has been interacted with */
  hasInteracted: Scalars['Boolean']['output'];
  /** The seen history of this media. */
  history: Array<Seen>;
  /** The seen item if it is in progress. */
  inProgress?: Maybe<Seen>;
  /** The reasons why this metadata is related to this user */
  mediaReason?: Maybe<Array<UserToMediaReason>>;
  /** The next episode/chapter of this media. */
  nextEntry?: Maybe<UserMediaNextEntry>;
  /** The seen progress of this media if it is a podcast. */
  podcastProgress?: Maybe<Array<UserMetadataDetailsEpisodeProgress>>;
  /** The public reviews of this media. */
  reviews: Array<ReviewItem>;
  /** The number of users who have seen this media. */
  seenByAllCount: Scalars['Int']['output'];
  /** The number of times this user has seen this media. */
  seenByUserCount: Scalars['Int']['output'];
  /** The seen progress of this media if it is a show. */
  showProgress?: Maybe<Array<UserMetadataDetailsShowSeasonProgress>>;
  /** The number of units of this media that were consumed. */
  unitsConsumed?: Maybe<Scalars['Int']['output']>;
};

export type UserMetadataDetailsEpisodeProgress = {
  episodeNumber: Scalars['Int']['output'];
  timesSeen: Scalars['Int']['output'];
};

export type UserMetadataDetailsShowSeasonProgress = {
  episodes: Array<UserMetadataDetailsEpisodeProgress>;
  seasonNumber: Scalars['Int']['output'];
  timesSeen: Scalars['Int']['output'];
};

export type UserMetadataGroupDetails = {
  collections: Array<Collection>;
  reviews: Array<ReviewItem>;
};

export type UserNotificationsPreferences = {
  enabled: Scalars['Boolean']['output'];
  toSend: Array<MediaStateChanged>;
};

export type UserOthersFeaturesEnabledPreferences = {
  calendar: Scalars['Boolean']['output'];
  collections: Scalars['Boolean']['output'];
};

export type UserPersonDetails = {
  collections: Array<Collection>;
  reviews: Array<ReviewItem>;
};

export type UserPreferences = {
  featuresEnabled: UserFeaturesEnabledPreferences;
  fitness: UserFitnessPreferences;
  general: UserGeneralPreferences;
  notifications: UserNotificationsPreferences;
};

export enum UserReviewScale {
  OutOfFive = 'OUT_OF_FIVE',
  OutOfHundred = 'OUT_OF_HUNDRED'
}

export type UserSummary = {
  calculatedOn: Scalars['DateTime']['output'];
  data: UserSummaryData;
};

export type UserSummaryData = {
  fitness: UserFitnessSummary;
  media: UserMediaSummary;
};

export type UserToEntity = {
  createdOn: Scalars['DateTime']['output'];
  exerciseExtraInformation?: Maybe<UserToExerciseExtraInformation>;
  exerciseId?: Maybe<Scalars['String']['output']>;
  exerciseNumTimesInteracted?: Maybe<Scalars['Int']['output']>;
  lastUpdatedOn: Scalars['DateTime']['output'];
  metadataGroupId?: Maybe<Scalars['String']['output']>;
  metadataId?: Maybe<Scalars['String']['output']>;
  metadataUnitsConsumed?: Maybe<Scalars['Int']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserToExerciseBestSetExtraInformation = {
  lot: WorkoutSetPersonalBest;
  sets: Array<ExerciseBestSetRecord>;
};

export type UserToExerciseExtraInformation = {
  history: Array<UserToExerciseHistoryExtraInformation>;
  lifetimeStats: WorkoutOrExerciseTotals;
  personalBests: Array<UserToExerciseBestSetExtraInformation>;
};

export type UserToExerciseHistoryExtraInformation = {
  idx: Scalars['Int']['output'];
  workoutId: Scalars['String']['output'];
};

export enum UserToMediaReason {
  Collection = 'COLLECTION',
  Finished = 'FINISHED',
  Monitoring = 'MONITORING',
  Owned = 'OWNED',
  Reminder = 'REMINDER',
  Reviewed = 'REVIEWED',
  Seen = 'SEEN',
  Watchlist = 'WATCHLIST'
}

export enum UserUnitSystem {
  Imperial = 'IMPERIAL',
  Metric = 'METRIC'
}

export type UserUpcomingCalendarEventInput = {
  nextDays?: InputMaybe<Scalars['Int']['input']>;
  nextMedia?: InputMaybe<Scalars['Int']['input']>;
};

export type UserWorkoutDetails = {
  collections: Array<Collection>;
  details: Workout;
};

export type UserWorkoutInput = {
  assets?: InputMaybe<EntityAssetsInput>;
  comment?: InputMaybe<Scalars['String']['input']>;
  endTime: Scalars['DateTime']['input'];
  exercises: Array<UserExerciseInput>;
  name: Scalars['String']['input'];
  repeatedFrom?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['DateTime']['input'];
};

export type UserWorkoutSetRecord = {
  confirmedAt?: InputMaybe<Scalars['DateTime']['input']>;
  lot: SetLot;
  note?: InputMaybe<Scalars['String']['input']>;
  statistic: SetStatisticInput;
};

export type VideoGameSpecifics = {
  platforms: Array<Scalars['String']['output']>;
};

export type VideoGameSpecificsInput = {
  platforms: Array<Scalars['String']['input']>;
};

export type VideoGamesSummary = {
  played: Scalars['Int']['output'];
};

export enum Visibility {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type VisualNovelSpecifics = {
  length?: Maybe<Scalars['Int']['output']>;
};

export type VisualNovelSpecificsInput = {
  length?: InputMaybe<Scalars['Int']['input']>;
};

export type VisualNovelsSummary = {
  played: Scalars['Int']['output'];
  runtime: Scalars['Int']['output'];
};

export type WatchProvider = {
  image?: Maybe<Scalars['String']['output']>;
  languages: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/** A workout that was completed by the user. */
export type Workout = {
  endTime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  information: WorkoutInformation;
  name: Scalars['String']['output'];
  repeatedFrom?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['DateTime']['output'];
  summary: WorkoutSummary;
};

/** Information about a workout done. */
export type WorkoutInformation = {
  assets?: Maybe<EntityAssets>;
  comment?: Maybe<Scalars['String']['output']>;
  exercises: Array<ProcessedExercise>;
};

export type WorkoutListResults = {
  details: SearchDetails;
  items: Array<Workout>;
};

/** The totals of a workout and the different bests achieved. */
export type WorkoutOrExerciseTotals = {
  distance: Scalars['Decimal']['output'];
  duration: Scalars['Decimal']['output'];
  /** The number of personal bests achieved. */
  personalBestsAchieved: Scalars['Int']['output'];
  reps: Scalars['Decimal']['output'];
  /** The total seconds that were logged in the rest timer. */
  restTime: Scalars['Int']['output'];
  weight: Scalars['Decimal']['output'];
};

/** The different types of personal bests that can be achieved on a set. */
export enum WorkoutSetPersonalBest {
  OneRm = 'ONE_RM',
  Pace = 'PACE',
  Reps = 'REPS',
  Time = 'TIME',
  Volume = 'VOLUME',
  Weight = 'WEIGHT'
}

/** Details about the set performed. */
export type WorkoutSetRecord = {
  actualRestTime?: Maybe<Scalars['Int']['output']>;
  confirmedAt?: Maybe<Scalars['DateTime']['output']>;
  lot: SetLot;
  note?: Maybe<Scalars['String']['output']>;
  personalBests?: Maybe<Array<WorkoutSetPersonalBest>>;
  statistic: WorkoutSetStatistic;
  totals?: Maybe<WorkoutSetTotals>;
};

/** Details about the statistics of the set performed. */
export type WorkoutSetStatistic = {
  distance?: Maybe<Scalars['Decimal']['output']>;
  duration?: Maybe<Scalars['Decimal']['output']>;
  oneRm?: Maybe<Scalars['Decimal']['output']>;
  pace?: Maybe<Scalars['Decimal']['output']>;
  reps?: Maybe<Scalars['Decimal']['output']>;
  volume?: Maybe<Scalars['Decimal']['output']>;
  weight?: Maybe<Scalars['Decimal']['output']>;
};

export type WorkoutSetTotals = {
  weight?: Maybe<Scalars['Decimal']['output']>;
};

export type WorkoutSummary = {
  exercises: Array<WorkoutSummaryExercise>;
  total?: Maybe<WorkoutOrExerciseTotals>;
};

/** The summary about an exercise done in a workout. */
export type WorkoutSummaryExercise = {
  bestSet?: Maybe<WorkoutSetRecord>;
  id: Scalars['String']['output'];
  lot?: Maybe<ExerciseLot>;
  numSets: Scalars['Int']['output'];
};

export type RegisterUserMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type RegisterUserMutation = { registerUser: { __typename: 'RegisterError', error: RegisterErrorVariant } | { __typename: 'StringIdObject', id: string } };

export type LoginUserMutationVariables = Exact<{
  input: AuthUserInput;
}>;


export type LoginUserMutation = { loginUser: { __typename: 'LoginError', error: LoginErrorVariant } | { __typename: 'LoginResponse', apiKey: string } };

export type AddEntityToCollectionMutationVariables = Exact<{
  input: ChangeCollectionToEntityInput;
}>;


export type AddEntityToCollectionMutation = { addEntityToCollection: boolean };

export type CommitMetadataMutationVariables = Exact<{
  input: CommitMediaInput;
}>;


export type CommitMetadataMutation = { commitMetadata: { id: string } };

export type CommitMetadataGroupMutationVariables = Exact<{
  input: CommitMediaInput;
}>;


export type CommitMetadataGroupMutation = { commitMetadataGroup: { id: string } };

export type CommitPersonMutationVariables = Exact<{
  input: CommitPersonInput;
}>;


export type CommitPersonMutation = { commitPerson: { id: string } };

export type CreateCustomExerciseMutationVariables = Exact<{
  input: ExerciseInput;
}>;


export type CreateCustomExerciseMutation = { createCustomExercise: string };

export type UpdateCustomExerciseMutationVariables = Exact<{
  input: UpdateCustomExerciseInput;
}>;


export type UpdateCustomExerciseMutation = { updateCustomExercise: boolean };

export type UpdateUserIntegrationMutationVariables = Exact<{
  input: UpdateUserIntegrationInput;
}>;


export type UpdateUserIntegrationMutation = { updateUserIntegration: boolean };

export type CreateCustomMetadataMutationVariables = Exact<{
  input: CreateCustomMetadataInput;
}>;


export type CreateCustomMetadataMutation = { createCustomMetadata: { id: string } };

export type CreateOrUpdateCollectionMutationVariables = Exact<{
  input: CreateOrUpdateCollectionInput;
}>;


export type CreateOrUpdateCollectionMutation = { createOrUpdateCollection: { id: string } };

export type CreateReviewCommentMutationVariables = Exact<{
  input: CreateReviewCommentInput;
}>;


export type CreateReviewCommentMutation = { createReviewComment: boolean };

export type CreateUserMeasurementMutationVariables = Exact<{
  input: UserMeasurementInput;
}>;


export type CreateUserMeasurementMutation = { createUserMeasurement: string };

export type CreateUserNotificationPlatformMutationVariables = Exact<{
  input: CreateUserNotificationPlatformInput;
}>;


export type CreateUserNotificationPlatformMutation = { createUserNotificationPlatform: string };

export type CreateUserIntegrationMutationVariables = Exact<{
  input: CreateUserIntegrationInput;
}>;


export type CreateUserIntegrationMutation = { createUserIntegration: { id: string } };

export type CreateUserWorkoutMutationVariables = Exact<{
  input: UserWorkoutInput;
}>;


export type CreateUserWorkoutMutation = { createUserWorkout: string };

export type DeleteCollectionMutationVariables = Exact<{
  collectionName: Scalars['String']['input'];
}>;


export type DeleteCollectionMutation = { deleteCollection: boolean };

export type DeleteReviewMutationVariables = Exact<{
  reviewId: Scalars['String']['input'];
}>;


export type DeleteReviewMutation = { deleteReview: boolean };

export type DeleteS3ObjectMutationVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type DeleteS3ObjectMutation = { deleteS3Object: boolean };

export type DeleteSeenItemMutationVariables = Exact<{
  seenId: Scalars['String']['input'];
}>;


export type DeleteSeenItemMutation = { deleteSeenItem: { id: string } };

export type DeleteUserMutationVariables = Exact<{
  toDeleteUserId: Scalars['String']['input'];
}>;


export type DeleteUserMutation = { deleteUser: boolean };

export type DeleteUserIntegrationMutationVariables = Exact<{
  integrationId: Scalars['String']['input'];
}>;


export type DeleteUserIntegrationMutation = { deleteUserIntegration: boolean };

export type DeleteUserMeasurementMutationVariables = Exact<{
  timestamp: Scalars['DateTime']['input'];
}>;


export type DeleteUserMeasurementMutation = { deleteUserMeasurement: boolean };

export type DeleteUserNotificationPlatformMutationVariables = Exact<{
  notificationId: Scalars['String']['input'];
}>;


export type DeleteUserNotificationPlatformMutation = { deleteUserNotificationPlatform: boolean };

export type DeleteUserWorkoutMutationVariables = Exact<{
  workoutId: Scalars['String']['input'];
}>;


export type DeleteUserWorkoutMutation = { deleteUserWorkout: boolean };

export type DeployBackgroundJobMutationVariables = Exact<{
  jobName: BackgroundJob;
}>;


export type DeployBackgroundJobMutation = { deployBackgroundJob: boolean };

export type DeployBulkProgressUpdateMutationVariables = Exact<{
  input: Array<ProgressUpdateInput> | ProgressUpdateInput;
}>;


export type DeployBulkProgressUpdateMutation = { deployBulkProgressUpdate: boolean };

export type DeployExportJobMutationVariables = Exact<{
  toExport: Array<ExportItem> | ExportItem;
}>;


export type DeployExportJobMutation = { deployExportJob: boolean };

export type DeployImportJobMutationVariables = Exact<{
  input: DeployImportJobInput;
}>;


export type DeployImportJobMutation = { deployImportJob: boolean };

export type DeployUpdateMetadataJobMutationVariables = Exact<{
  metadataId: Scalars['String']['input'];
}>;


export type DeployUpdateMetadataJobMutation = { deployUpdateMetadataJob: boolean };

export type DeployUpdatePersonJobMutationVariables = Exact<{
  personId: Scalars['String']['input'];
}>;


export type DeployUpdatePersonJobMutation = { deployUpdatePersonJob: boolean };

export type UpdateSeenItemMutationVariables = Exact<{
  input: UpdateSeenItemInput;
}>;


export type UpdateSeenItemMutation = { updateSeenItem: boolean };

export type UpdateUserNotificationPlatformMutationVariables = Exact<{
  input: UpdateUserNotificationPlatformInput;
}>;


export type UpdateUserNotificationPlatformMutation = { updateUserNotificationPlatform: boolean };

export type UpdateUserWorkoutMutationVariables = Exact<{
  input: UpdateUserWorkoutInput;
}>;


export type UpdateUserWorkoutMutation = { updateUserWorkout: boolean };

export type GenerateAuthTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateAuthTokenMutation = { generateAuthToken: string };

export type MergeMetadataMutationVariables = Exact<{
  mergeFrom: Scalars['String']['input'];
  mergeInto: Scalars['String']['input'];
}>;


export type MergeMetadataMutation = { mergeMetadata: boolean };

export type PostReviewMutationVariables = Exact<{
  input: PostReviewInput;
}>;


export type PostReviewMutation = { postReview: { id: string } };

export type PresignedPutS3UrlMutationVariables = Exact<{
  input: PresignedPutUrlInput;
}>;


export type PresignedPutS3UrlMutation = { presignedPutS3Url: { key: string, uploadUrl: string } };

export type RemoveEntityFromCollectionMutationVariables = Exact<{
  input: ChangeCollectionToEntityInput;
}>;


export type RemoveEntityFromCollectionMutation = { removeEntityFromCollection: { id: string } };

export type TestUserNotificationPlatformsMutationVariables = Exact<{ [key: string]: never; }>;


export type TestUserNotificationPlatformsMutation = { testUserNotificationPlatforms: boolean };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string } };

export type UpdateUserPreferenceMutationVariables = Exact<{
  input: UpdateUserPreferenceInput;
}>;


export type UpdateUserPreferenceMutation = { updateUserPreference: boolean };

export type CollectionContentsQueryVariables = Exact<{
  input: CollectionContentsInput;
}>;


export type CollectionContentsQuery = { collectionContents: { user: { id: string, name: string }, reviews: Array<{ id: string, rating?: string | null, textOriginal?: string | null, textRendered?: string | null, isSpoiler: boolean, visibility: Visibility, postedOn: string, postedBy: { id: string, name: string }, comments: Array<{ id: string, text: string, createdOn: string, likedBy: Array<string>, user: { id: string, name: string } }>, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null }>, results: { details: { total: number, nextPage?: number | null }, items: Array<{ entityId: string, entityLot: EntityLot }> }, details: { name: string, description?: string | null, createdOn: string } } };

export type CoreDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type CoreDetailsQuery = { coreDetails: { isPro: boolean, version: string, docsLink: string, pageLimit: number, websiteUrl: string, authorName: string, smtpEnabled: boolean, oidcEnabled: boolean, signupAllowed: boolean, repositoryLink: string, localAuthDisabled: boolean, fileStorageEnabled: boolean, tokenValidForDays: number } };

export type ExerciseDetailsQueryVariables = Exact<{
  exerciseId: Scalars['String']['input'];
}>;


export type ExerciseDetailsQuery = { exerciseDetails: { id: string, lot: ExerciseLot, source: ExerciseSource, level: ExerciseLevel, force?: ExerciseForce | null, mechanic?: ExerciseMechanic | null, equipment?: ExerciseEquipment | null, muscles: Array<ExerciseMuscle>, createdByUserId?: string | null, attributes: { instructions: Array<string>, images: Array<string> } } };

export type ExerciseParametersQueryVariables = Exact<{ [key: string]: never; }>;


export type ExerciseParametersQuery = { exerciseParameters: { downloadRequired: boolean, filters: { type: Array<ExerciseLot>, level: Array<ExerciseLevel>, force: Array<ExerciseForce>, mechanic: Array<ExerciseMechanic>, equipment: Array<ExerciseEquipment>, muscle: Array<ExerciseMuscle> } } };

export type ExercisesListQueryVariables = Exact<{
  input: ExercisesListInput;
}>;


export type ExercisesListQuery = { exercisesList: { details: { total: number, nextPage?: number | null }, items: Array<{ id: string, lot: ExerciseLot, image?: string | null, muscle?: ExerciseMuscle | null, numTimesInteracted?: number | null, lastUpdatedOn?: string | null }> } };

export type GenreDetailsQueryVariables = Exact<{
  input: GenreDetailsInput;
}>;


export type GenreDetailsQuery = { genreDetails: { details: { id: string, name: string, numItems?: number | null }, contents: { items: Array<string>, details: { total: number, nextPage?: number | null } } } };

export type GenresListQueryVariables = Exact<{
  input: SearchInput;
}>;


export type GenresListQuery = { genresList: { details: { total: number, nextPage?: number | null }, items: Array<{ id: string, name: string, numItems?: number | null }> } };

export type ImportReportsQueryVariables = Exact<{ [key: string]: never; }>;


export type ImportReportsQuery = { importReports: Array<{ id: string, source: ImportSource, startedOn: string, finishedOn?: string | null, wasSuccess?: boolean | null, details?: { import: { total: number }, failedItems: Array<{ lot?: MediaLot | null, step: ImportFailStep, identifier: string, error?: string | null }> } | null }> };

export type LatestUserSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type LatestUserSummaryQuery = { latestUserSummary: { calculatedOn: string, data: { fitness: { measurementsRecorded: number, exercisesInteractedWith: number, workouts: { recorded: number, duration: string, weight: string } }, media: { metadataOverall: { reviewed: number, interactedWith: number }, peopleOverall: { reviewed: number, interactedWith: number }, manga: { chapters: number, read: number }, books: { pages: number, read: number }, movies: { runtime: number, watched: number }, anime: { episodes: number, watched: number }, podcasts: { runtime: number, played: number, playedEpisodes: number }, visualNovels: { played: number, runtime: number }, videoGames: { played: number }, shows: { runtime: number, watchedEpisodes: number, watchedSeasons: number, watched: number }, audioBooks: { runtime: number, played: number } } } } };

export type MetadataDetailsQueryVariables = Exact<{
  metadataId: Scalars['String']['input'];
}>;


export type MetadataDetailsQuery = { metadataDetails: { id: string, lot: MediaLot, title: string, source: MediaSource, isNsfw?: boolean | null, isPartial?: boolean | null, sourceUrl?: string | null, identifier: string, description?: string | null, suggestions: Array<string>, publishYear?: number | null, publishDate?: string | null, providerRating?: string | null, productionStatus?: string | null, originalLanguage?: string | null, genres: Array<{ id: string, name: string }>, group?: { id: string, name: string, part: number } | null, assets: { images: Array<string>, videos: Array<{ videoId: string, source: MetadataVideoSource }> }, creators: Array<{ name: string, items: Array<{ id?: string | null, name: string, image?: string | null, character?: string | null }> }>, watchProviders: Array<{ name: string, image?: string | null, languages: Array<string> }>, animeSpecifics?: { episodes?: number | null } | null, audioBookSpecifics?: { runtime?: number | null } | null, bookSpecifics?: { pages?: number | null } | null, movieSpecifics?: { runtime?: number | null } | null, mangaSpecifics?: { volumes?: number | null, chapters?: number | null } | null, podcastSpecifics?: { totalEpisodes: number, episodes: Array<{ id: string, title: string, overview?: string | null, thumbnail?: string | null, number: number, runtime?: number | null, publishDate: string }> } | null, showSpecifics?: { totalSeasons?: number | null, totalEpisodes?: number | null, runtime?: number | null, seasons: Array<{ id: number, seasonNumber: number, name: string, overview?: string | null, backdropImages: Array<string>, posterImages: Array<string>, episodes: Array<{ id: number, name: string, posterImages: Array<string>, episodeNumber: number, publishDate?: string | null, overview?: string | null, runtime?: number | null }> }> } | null, visualNovelSpecifics?: { length?: number | null } | null, videoGameSpecifics?: { platforms: Array<string> } | null } };

export type MetadataGroupDetailsQueryVariables = Exact<{
  metadataGroupId: Scalars['String']['input'];
}>;


export type MetadataGroupDetailsQuery = { metadataGroupDetails: { contents: Array<string>, sourceUrl?: string | null, details: { id: string, title: string, lot: MediaLot, source: MediaSource, displayImages: Array<string>, parts: number, isPartial?: boolean | null } } };

export type MetadataGroupSearchQueryVariables = Exact<{
  input: MetadataGroupSearchInput;
}>;


export type MetadataGroupSearchQuery = { metadataGroupSearch: { details: { total: number, nextPage?: number | null }, items: Array<{ identifier: string, name: string, image?: string | null, parts?: number | null }> } };

export type MetadataListQueryVariables = Exact<{
  input: MetadataListInput;
}>;


export type MetadataListQuery = { metadataList: { items: Array<string>, details: { total: number, nextPage?: number | null } } };

export type MetadataSearchQueryVariables = Exact<{
  input: MetadataSearchInput;
}>;


export type MetadataSearchQuery = { metadataSearch: { details: { total: number, nextPage?: number | null }, items: Array<{ databaseId?: string | null, hasInteracted: boolean, item: { identifier: string, title: string, image?: string | null, publishYear?: number | null } }> } };

export type PeopleSearchQueryVariables = Exact<{
  input: PeopleSearchInput;
}>;


export type PeopleSearchQuery = { peopleSearch: { details: { total: number, nextPage?: number | null }, items: Array<{ identifier: string, name: string, image?: string | null, birthYear?: number | null }> } };

export type PersonDetailsQueryVariables = Exact<{
  personId: Scalars['String']['input'];
}>;


export type PersonDetailsQuery = { personDetails: { sourceUrl?: string | null, details: { id: string, name: string, source: MediaSource, isPartial?: boolean | null, description?: string | null, birthDate?: string | null, deathDate?: string | null, place?: string | null, website?: string | null, gender?: string | null, displayImages: Array<string> }, contents: Array<{ name: string, items: Array<{ mediaId: string, character?: string | null }> }> } };

export type UserDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserDetailsQuery = { userDetails: { __typename: 'User', id: string, lot: UserLot, name: string, oidcIssuerId?: string | null } | { __typename: 'UserDetailsError' } };

export type UserExerciseDetailsQueryVariables = Exact<{
  exerciseId: Scalars['String']['input'];
}>;


export type UserExerciseDetailsQuery = { userExerciseDetails: { collections: Array<{ id: string, name: string, userId: string }>, history?: Array<{ idx: number, workoutId: string }> | null, details?: { exerciseId?: string | null, createdOn: string, lastUpdatedOn: string, exerciseNumTimesInteracted?: number | null, exerciseExtraInformation?: { lifetimeStats: { weight: string, reps: string, distance: string, duration: string, personalBestsAchieved: number }, personalBests: Array<{ lot: WorkoutSetPersonalBest, sets: Array<{ workoutId: string, exerciseIdx: number, setIdx: number }> }> } | null } | null } };

export type UserMeasurementsListQueryVariables = Exact<{
  input: UserMeasurementsListInput;
}>;


export type UserMeasurementsListQuery = { userMeasurementsList: Array<{ timestamp: string, name?: string | null, comment?: string | null, stats: { weight?: string | null, bodyMassIndex?: string | null, totalBodyWater?: string | null, muscle?: string | null, leanBodyMass?: string | null, bodyFat?: string | null, boneMass?: string | null, visceralFat?: string | null, waistCircumference?: string | null, waistToHeightRatio?: string | null, hipCircumference?: string | null, waistToHipRatio?: string | null, chestCircumference?: string | null, thighCircumference?: string | null, bicepsCircumference?: string | null, neckCircumference?: string | null, bodyFatCaliper?: string | null, chestSkinfold?: string | null, abdominalSkinfold?: string | null, thighSkinfold?: string | null, basalMetabolicRate?: string | null, totalDailyEnergyExpenditure?: string | null, calories?: string | null, custom?: any | null } }> };

export type UserMetadataDetailsQueryVariables = Exact<{
  metadataId: Scalars['String']['input'];
}>;


export type UserMetadataDetailsQuery = { userMetadataDetails: { mediaReason?: Array<UserToMediaReason> | null, hasInteracted: boolean, averageRating?: string | null, unitsConsumed?: number | null, seenByAllCount: number, seenByUserCount: number, collections: Array<{ id: string, name: string, userId: string }>, inProgress?: { id: string, progress: string, providerWatchedOn?: string | null, state: SeenState, startedOn?: string | null, finishedOn?: string | null, lastUpdatedOn: string, numTimesUpdated: number, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null } | null, history: Array<{ id: string, progress: string, providerWatchedOn?: string | null, state: SeenState, startedOn?: string | null, finishedOn?: string | null, lastUpdatedOn: string, numTimesUpdated: number, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null }>, reviews: Array<{ id: string, rating?: string | null, textOriginal?: string | null, textRendered?: string | null, isSpoiler: boolean, visibility: Visibility, postedOn: string, postedBy: { id: string, name: string }, comments: Array<{ id: string, text: string, createdOn: string, likedBy: Array<string>, user: { id: string, name: string } }>, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null }>, nextEntry?: { season?: number | null, volume?: number | null, episode?: number | null, chapter?: number | null } | null, showProgress?: Array<{ timesSeen: number, seasonNumber: number, episodes: Array<{ episodeNumber: number, timesSeen: number }> }> | null, podcastProgress?: Array<{ episodeNumber: number, timesSeen: number }> | null } };

export type UserMetadataGroupDetailsQueryVariables = Exact<{
  metadataGroupId: Scalars['String']['input'];
}>;


export type UserMetadataGroupDetailsQuery = { userMetadataGroupDetails: { reviews: Array<{ id: string, rating?: string | null, textOriginal?: string | null, textRendered?: string | null, isSpoiler: boolean, visibility: Visibility, postedOn: string, postedBy: { id: string, name: string }, comments: Array<{ id: string, text: string, createdOn: string, likedBy: Array<string>, user: { id: string, name: string } }>, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null }>, collections: Array<{ id: string, name: string, userId: string }> } };

export type UserPersonDetailsQueryVariables = Exact<{
  personId: Scalars['String']['input'];
}>;


export type UserPersonDetailsQuery = { userPersonDetails: { collections: Array<{ id: string, name: string, userId: string }>, reviews: Array<{ id: string, rating?: string | null, textOriginal?: string | null, textRendered?: string | null, isSpoiler: boolean, visibility: Visibility, postedOn: string, postedBy: { id: string, name: string }, comments: Array<{ id: string, text: string, createdOn: string, likedBy: Array<string>, user: { id: string, name: string } }>, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null }> } };

export type UserPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type UserPreferencesQuery = { userPreferences: { general: { reviewScale: UserReviewScale, displayNsfw: boolean, disableVideos: boolean, persistQueries: boolean, watchProviders: Array<string>, disableReviews: boolean, disableIntegrations: boolean, disableWatchProviders: boolean, disableNavigationAnimation: boolean, dashboard: Array<{ section: DashboardElementLot, hidden: boolean, numElements?: number | null }> }, fitness: { measurements: { custom: Array<{ name: string, dataType: UserCustomMeasurementDataType }>, inbuilt: { weight: boolean, bodyMassIndex: boolean, totalBodyWater: boolean, muscle: boolean, leanBodyMass: boolean, bodyFat: boolean, boneMass: boolean, visceralFat: boolean, waistCircumference: boolean, waistToHeightRatio: boolean, hipCircumference: boolean, waistToHipRatio: boolean, chestCircumference: boolean, thighCircumference: boolean, bicepsCircumference: boolean, neckCircumference: boolean, bodyFatCaliper: boolean, chestSkinfold: boolean, abdominalSkinfold: boolean, thighSkinfold: boolean, basalMetabolicRate: boolean, totalDailyEnergyExpenditure: boolean, calories: boolean } }, exercises: { saveHistory: number, unitSystem: UserUnitSystem } }, notifications: { toSend: Array<MediaStateChanged>, enabled: boolean }, featuresEnabled: { others: { calendar: boolean, collections: boolean }, fitness: { enabled: boolean, workouts: boolean, measurements: boolean }, media: { enabled: boolean, anime: boolean, audioBook: boolean, book: boolean, manga: boolean, movie: boolean, podcast: boolean, show: boolean, videoGame: boolean, visualNovel: boolean, people: boolean, groups: boolean, genres: boolean } } } };

export type UserWorkoutsListQueryVariables = Exact<{
  input: SearchInput;
}>;


export type UserWorkoutsListQuery = { userWorkoutsList: { details: { total: number, nextPage?: number | null }, items: Array<{ id: string, name: string, startTime: string, endTime: string, summary: { total?: { personalBestsAchieved: number, weight: string, reps: string, distance: string, duration: string, restTime: number } | null, exercises: Array<{ numSets: number, id: string, lot?: ExerciseLot | null, bestSet?: { lot: SetLot, personalBests?: Array<WorkoutSetPersonalBest> | null, statistic: { duration?: string | null, distance?: string | null, reps?: string | null, weight?: string | null, oneRm?: string | null, pace?: string | null, volume?: string | null } } | null }> } }> } };

export type WorkoutDetailsQueryVariables = Exact<{
  workoutId: Scalars['String']['input'];
}>;


export type WorkoutDetailsQuery = { workoutDetails: { collections: Array<{ id: string, name: string, userId: string }>, details: { id: string, name: string, endTime: string, startTime: string, repeatedFrom?: string | null, summary: { total?: { personalBestsAchieved: number, weight: string, reps: string, distance: string, duration: string, restTime: number } | null, exercises: Array<{ numSets: number, id: string, lot?: ExerciseLot | null, bestSet?: { lot: SetLot, personalBests?: Array<WorkoutSetPersonalBest> | null, statistic: { duration?: string | null, distance?: string | null, reps?: string | null, weight?: string | null, oneRm?: string | null, pace?: string | null, volume?: string | null } } | null }> }, information: { comment?: string | null, assets?: { images: Array<string>, videos: Array<string> } | null, exercises: Array<{ name: string, lot: ExerciseLot, notes: Array<string>, restTime?: number | null, supersetWith: Array<number>, total?: { personalBestsAchieved: number, weight: string, reps: string, distance: string, duration: string, restTime: number } | null, assets?: { images: Array<string>, videos: Array<string> } | null, sets: Array<{ note?: string | null, lot: SetLot, personalBests?: Array<WorkoutSetPersonalBest> | null, confirmedAt?: string | null, statistic: { duration?: string | null, distance?: string | null, reps?: string | null, weight?: string | null, oneRm?: string | null, pace?: string | null, volume?: string | null } }> }> } } } };

export type GetOidcRedirectUrlQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOidcRedirectUrlQuery = { getOidcRedirectUrl: string };

export type UserByOidcIssuerIdQueryVariables = Exact<{
  oidcIssuerId: Scalars['String']['input'];
}>;


export type UserByOidcIssuerIdQuery = { userByOidcIssuerId?: string | null };

export type GetOidcTokenQueryVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type GetOidcTokenQuery = { getOidcToken: { subject: string, email: string } };

export type GetPresignedS3UrlQueryVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type GetPresignedS3UrlQuery = { getPresignedS3Url: string };

export type ProvidersLanguageInformationQueryVariables = Exact<{ [key: string]: never; }>;


export type ProvidersLanguageInformationQuery = { providersLanguageInformation: Array<{ supported: Array<string>, default: string, source: MediaSource }> };

export type UserExportsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserExportsQuery = { userExports: Array<{ startedAt: string, endedAt: string, url: string, exported: Array<ExportItem> }> };

export type UserCollectionsListQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type UserCollectionsListQuery = { userCollectionsList: Array<{ id: string, name: string, count: number, isDefault: boolean, description?: string | null, creator: { id: string, name: string }, collaborators: Array<{ id: string, name: string }>, informationTemplate?: Array<{ lot: CollectionExtraInformationLot, name: string, required?: boolean | null, description: string, defaultValue?: string | null }> | null }> };

export type UserIntegrationsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserIntegrationsQuery = { userIntegrations: Array<{ id: string, lot: IntegrationLot, provider: IntegrationProvider, createdOn: string, isDisabled?: boolean | null, maximumProgress?: string | null, minimumProgress?: string | null, lastTriggeredOn?: string | null }> };

export type UserNotificationPlatformsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserNotificationPlatformsQuery = { userNotificationPlatforms: Array<{ id: string, lot: NotificationPlatformLot, createdOn: string, isDisabled?: boolean | null, description: string }> };

export type UsersListQueryVariables = Exact<{
  query?: InputMaybe<Scalars['String']['input']>;
}>;


export type UsersListQuery = { usersList: Array<{ id: string, lot: UserLot, name: string, isDisabled?: boolean | null }> };

export type UserUpcomingCalendarEventsQueryVariables = Exact<{
  input: UserUpcomingCalendarEventInput;
}>;


export type UserUpcomingCalendarEventsQuery = { userUpcomingCalendarEvents: Array<{ date: string, metadataId: string, metadataLot: MediaLot, episodeName?: string | null, metadataTitle: string, metadataImage?: string | null, calendarEventId: string, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null }> };

export type UserCalendarEventsQueryVariables = Exact<{
  input: UserCalendarEventInput;
}>;


export type UserCalendarEventsQuery = { userCalendarEvents: Array<{ date: string, events: Array<{ date: string, metadataId: string, metadataLot: MediaLot, episodeName?: string | null, metadataTitle: string, metadataImage?: string | null, calendarEventId: string, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null }> }> };

export type MetadataPartialDetailsQueryVariables = Exact<{
  metadataId: Scalars['String']['input'];
}>;


export type MetadataPartialDetailsQuery = { metadataPartialDetails: { id: string, lot: MediaLot, title: string, image?: string | null, publishYear?: number | null } };

export type MetadataGroupsListQueryVariables = Exact<{
  input: SearchInput;
}>;


export type MetadataGroupsListQuery = { metadataGroupsList: { items: Array<string>, details: { total: number, nextPage?: number | null } } };

export type PeopleListQueryVariables = Exact<{
  input: PeopleListInput;
}>;


export type PeopleListQuery = { peopleList: { items: Array<string>, details: { total: number, nextPage?: number | null } } };

export type SeenPodcastExtraInformationPartFragment = { episode: number };

export type SeenShowExtraInformationPartFragment = { episode: number, season: number };

export type SeenAnimeExtraInformationPartFragment = { episode?: number | null };

export type SeenMangaExtraInformationPartFragment = { chapter?: number | null, volume?: number | null };

export type CalendarEventPartFragment = { date: string, metadataId: string, metadataLot: MediaLot, episodeName?: string | null, metadataTitle: string, metadataImage?: string | null, calendarEventId: string, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null };

export type SeenPartFragment = { id: string, progress: string, providerWatchedOn?: string | null, state: SeenState, startedOn?: string | null, finishedOn?: string | null, lastUpdatedOn: string, numTimesUpdated: number, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null };

export type MetadataSearchItemPartFragment = { identifier: string, title: string, image?: string | null, publishYear?: number | null };

export type WorkoutOrExerciseTotalsPartFragment = { personalBestsAchieved: number, weight: string, reps: string, distance: string, duration: string, restTime: number };

export type EntityAssetsPartFragment = { images: Array<string>, videos: Array<string> };

export type WorkoutSetStatisticPartFragment = { duration?: string | null, distance?: string | null, reps?: string | null, weight?: string | null, oneRm?: string | null, pace?: string | null, volume?: string | null };

export type WorkoutSummaryPartFragment = { total?: { personalBestsAchieved: number, weight: string, reps: string, distance: string, duration: string, restTime: number } | null, exercises: Array<{ numSets: number, id: string, lot?: ExerciseLot | null, bestSet?: { lot: SetLot, personalBests?: Array<WorkoutSetPersonalBest> | null, statistic: { duration?: string | null, distance?: string | null, reps?: string | null, weight?: string | null, oneRm?: string | null, pace?: string | null, volume?: string | null } } | null }> };

export type CollectionPartFragment = { id: string, name: string, userId: string };

export type ReviewItemPartFragment = { id: string, rating?: string | null, textOriginal?: string | null, textRendered?: string | null, isSpoiler: boolean, visibility: Visibility, postedOn: string, postedBy: { id: string, name: string }, comments: Array<{ id: string, text: string, createdOn: string, likedBy: Array<string>, user: { id: string, name: string } }>, showExtraInformation?: { episode: number, season: number } | null, podcastExtraInformation?: { episode: number } | null, animeExtraInformation?: { episode?: number | null } | null, mangaExtraInformation?: { chapter?: number | null, volume?: number | null } | null };

export type WorkoutInformationPartFragment = { comment?: string | null, assets?: { images: Array<string>, videos: Array<string> } | null, exercises: Array<{ name: string, lot: ExerciseLot, notes: Array<string>, restTime?: number | null, supersetWith: Array<number>, total?: { personalBestsAchieved: number, weight: string, reps: string, distance: string, duration: string, restTime: number } | null, assets?: { images: Array<string>, videos: Array<string> } | null, sets: Array<{ note?: string | null, lot: SetLot, personalBests?: Array<WorkoutSetPersonalBest> | null, confirmedAt?: string | null, statistic: { duration?: string | null, distance?: string | null, reps?: string | null, weight?: string | null, oneRm?: string | null, pace?: string | null, volume?: string | null } }> }> };

export const SeenShowExtraInformationPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}}]} as unknown as DocumentNode<SeenShowExtraInformationPartFragment, unknown>;
export const SeenPodcastExtraInformationPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}}]} as unknown as DocumentNode<SeenPodcastExtraInformationPartFragment, unknown>;
export const CalendarEventPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CalendarEventPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GraphqlCalendarEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"metadataId"}},{"kind":"Field","name":{"kind":"Name","value":"metadataLot"}},{"kind":"Field","name":{"kind":"Name","value":"episodeName"}},{"kind":"Field","name":{"kind":"Name","value":"metadataTitle"}},{"kind":"Field","name":{"kind":"Name","value":"metadataImage"}},{"kind":"Field","name":{"kind":"Name","value":"calendarEventId"}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}}]} as unknown as DocumentNode<CalendarEventPartFragment, unknown>;
export const SeenAnimeExtraInformationPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}}]} as unknown as DocumentNode<SeenAnimeExtraInformationPartFragment, unknown>;
export const SeenMangaExtraInformationPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]} as unknown as DocumentNode<SeenMangaExtraInformationPartFragment, unknown>;
export const SeenPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Seen"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"providerWatchedOn"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"startedOn"}},{"kind":"Field","name":{"kind":"Name","value":"finishedOn"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdatedOn"}},{"kind":"Field","name":{"kind":"Name","value":"numTimesUpdated"}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]} as unknown as DocumentNode<SeenPartFragment, unknown>;
export const MetadataSearchItemPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataSearchItemPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataSearchItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"publishYear"}}]}}]} as unknown as DocumentNode<MetadataSearchItemPartFragment, unknown>;
export const WorkoutOrExerciseTotalsPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutOrExerciseTotals"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personalBestsAchieved"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}}]}}]} as unknown as DocumentNode<WorkoutOrExerciseTotalsPartFragment, unknown>;
export const WorkoutSetStatisticPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSetStatisticPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSetStatistic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"oneRm"}},{"kind":"Field","name":{"kind":"Name","value":"pace"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]} as unknown as DocumentNode<WorkoutSetStatisticPartFragment, unknown>;
export const WorkoutSummaryPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSummaryPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numSets"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"bestSet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSetStatisticPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"personalBests"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutOrExerciseTotals"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personalBestsAchieved"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSetStatisticPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSetStatistic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"oneRm"}},{"kind":"Field","name":{"kind":"Name","value":"pace"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]} as unknown as DocumentNode<WorkoutSummaryPartFragment, unknown>;
export const CollectionPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]} as unknown as DocumentNode<CollectionPartFragment, unknown>;
export const ReviewItemPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewItemPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"textOriginal"}},{"kind":"Field","name":{"kind":"Name","value":"textRendered"}},{"kind":"Field","name":{"kind":"Name","value":"isSpoiler"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"postedOn"}},{"kind":"Field","name":{"kind":"Name","value":"postedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]} as unknown as DocumentNode<ReviewItemPartFragment, unknown>;
export const EntityAssetsPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EntityAssetsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EntityAssets"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"videos"}}]}}]} as unknown as DocumentNode<EntityAssetsPartFragment, unknown>;
export const WorkoutInformationPartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EntityAssetsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"supersetWith"}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EntityAssetsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSetStatisticPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"personalBests"}},{"kind":"Field","name":{"kind":"Name","value":"confirmedAt"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EntityAssetsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EntityAssets"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"videos"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutOrExerciseTotals"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personalBestsAchieved"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSetStatisticPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSetStatistic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"oneRm"}},{"kind":"Field","name":{"kind":"Name","value":"pace"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]} as unknown as DocumentNode<WorkoutInformationPartFragment, unknown>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StringIdObject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const LoginUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoginError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoginResponse"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKey"}}]}}]}}]}}]} as unknown as DocumentNode<LoginUserMutation, LoginUserMutationVariables>;
export const AddEntityToCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddEntityToCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeCollectionToEntityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addEntityToCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AddEntityToCollectionMutation, AddEntityToCollectionMutationVariables>;
export const CommitMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CommitMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommitMediaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commitMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CommitMetadataMutation, CommitMetadataMutationVariables>;
export const CommitMetadataGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CommitMetadataGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommitMediaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commitMetadataGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CommitMetadataGroupMutation, CommitMetadataGroupMutationVariables>;
export const CommitPersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CommitPerson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommitPersonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commitPerson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CommitPersonMutation, CommitPersonMutationVariables>;
export const CreateCustomExerciseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomExercise"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExerciseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCustomExercise"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateCustomExerciseMutation, CreateCustomExerciseMutationVariables>;
export const UpdateCustomExerciseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomExercise"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCustomExerciseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomExercise"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateCustomExerciseMutation, UpdateCustomExerciseMutationVariables>;
export const UpdateUserIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateUserIntegrationMutation, UpdateUserIntegrationMutationVariables>;
export const CreateCustomMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCustomMetadataInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCustomMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateCustomMetadataMutation, CreateCustomMetadataMutationVariables>;
export const CreateOrUpdateCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrUpdateCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrUpdateCollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrUpdateCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateOrUpdateCollectionMutation, CreateOrUpdateCollectionMutationVariables>;
export const CreateReviewCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReviewComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReviewCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReviewComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateReviewCommentMutation, CreateReviewCommentMutationVariables>;
export const CreateUserMeasurementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUserMeasurement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserMeasurementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUserMeasurement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateUserMeasurementMutation, CreateUserMeasurementMutationVariables>;
export const CreateUserNotificationPlatformDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUserNotificationPlatform"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserNotificationPlatformInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUserNotificationPlatform"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateUserNotificationPlatformMutation, CreateUserNotificationPlatformMutationVariables>;
export const CreateUserIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUserIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUserIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateUserIntegrationMutation, CreateUserIntegrationMutationVariables>;
export const CreateUserWorkoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUserWorkout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserWorkoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUserWorkout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateUserWorkoutMutation, CreateUserWorkoutMutationVariables>;
export const DeleteCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"collectionName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"collectionName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"collectionName"}}}]}]}}]} as unknown as DocumentNode<DeleteCollectionMutation, DeleteCollectionMutationVariables>;
export const DeleteReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reviewId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"reviewId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reviewId"}}}]}]}}]} as unknown as DocumentNode<DeleteReviewMutation, DeleteReviewMutationVariables>;
export const DeleteS3ObjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteS3Object"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteS3Object"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}]}]}}]} as unknown as DocumentNode<DeleteS3ObjectMutation, DeleteS3ObjectMutationVariables>;
export const DeleteSeenItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSeenItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSeenItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteSeenItemMutation, DeleteSeenItemMutationVariables>;
export const DeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDeleteUserId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"toDeleteUserId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDeleteUserId"}}}]}]}}]} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const DeleteUserIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUserIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"integrationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUserIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"integrationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"integrationId"}}}]}]}}]} as unknown as DocumentNode<DeleteUserIntegrationMutation, DeleteUserIntegrationMutationVariables>;
export const DeleteUserMeasurementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUserMeasurement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timestamp"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUserMeasurement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"timestamp"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timestamp"}}}]}]}}]} as unknown as DocumentNode<DeleteUserMeasurementMutation, DeleteUserMeasurementMutationVariables>;
export const DeleteUserNotificationPlatformDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUserNotificationPlatform"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notificationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUserNotificationPlatform"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"notificationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notificationId"}}}]}]}}]} as unknown as DocumentNode<DeleteUserNotificationPlatformMutation, DeleteUserNotificationPlatformMutationVariables>;
export const DeleteUserWorkoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUserWorkout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUserWorkout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workoutId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workoutId"}}}]}]}}]} as unknown as DocumentNode<DeleteUserWorkoutMutation, DeleteUserWorkoutMutationVariables>;
export const DeployBackgroundJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeployBackgroundJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BackgroundJob"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployBackgroundJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobName"}}}]}]}}]} as unknown as DocumentNode<DeployBackgroundJobMutation, DeployBackgroundJobMutationVariables>;
export const DeployBulkProgressUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeployBulkProgressUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProgressUpdateInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployBulkProgressUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeployBulkProgressUpdateMutation, DeployBulkProgressUpdateMutationVariables>;
export const DeployExportJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeployExportJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toExport"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExportItem"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployExportJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"toExport"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toExport"}}}]}]}}]} as unknown as DocumentNode<DeployExportJobMutation, DeployExportJobMutationVariables>;
export const DeployImportJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeployImportJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeployImportJobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployImportJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeployImportJobMutation, DeployImportJobMutationVariables>;
export const DeployUpdateMetadataJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeployUpdateMetadataJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployUpdateMetadataJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"metadataId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}}}]}]}}]} as unknown as DocumentNode<DeployUpdateMetadataJobMutation, DeployUpdateMetadataJobMutationVariables>;
export const DeployUpdatePersonJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeployUpdatePersonJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"personId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployUpdatePersonJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"personId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"personId"}}}]}]}}]} as unknown as DocumentNode<DeployUpdatePersonJobMutation, DeployUpdatePersonJobMutationVariables>;
export const UpdateSeenItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSeenItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSeenItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSeenItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateSeenItemMutation, UpdateSeenItemMutationVariables>;
export const UpdateUserNotificationPlatformDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserNotificationPlatform"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserNotificationPlatformInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserNotificationPlatform"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateUserNotificationPlatformMutation, UpdateUserNotificationPlatformMutationVariables>;
export const UpdateUserWorkoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserWorkout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserWorkoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserWorkout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateUserWorkoutMutation, UpdateUserWorkoutMutationVariables>;
export const GenerateAuthTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateAuthToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAuthToken"}}]}}]} as unknown as DocumentNode<GenerateAuthTokenMutation, GenerateAuthTokenMutationVariables>;
export const MergeMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergeMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mergeFrom"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mergeInto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mergeMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mergeFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mergeFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"mergeInto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mergeInto"}}}]}]}}]} as unknown as DocumentNode<MergeMetadataMutation, MergeMetadataMutationVariables>;
export const PostReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PostReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PostReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"postReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<PostReviewMutation, PostReviewMutationVariables>;
export const PresignedPutS3UrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PresignedPutS3Url"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PresignedPutUrlInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"presignedPutS3Url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}}]}}]}}]} as unknown as DocumentNode<PresignedPutS3UrlMutation, PresignedPutS3UrlMutationVariables>;
export const RemoveEntityFromCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveEntityFromCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeCollectionToEntityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeEntityFromCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveEntityFromCollectionMutation, RemoveEntityFromCollectionMutationVariables>;
export const TestUserNotificationPlatformsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TestUserNotificationPlatforms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testUserNotificationPlatforms"}}]}}]} as unknown as DocumentNode<TestUserNotificationPlatformsMutation, TestUserNotificationPlatformsMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserPreferenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserPreference"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserPreferenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserPreference"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateUserPreferenceMutation, UpdateUserPreferenceMutationVariables>;
export const CollectionContentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CollectionContents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CollectionContentsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionContents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewItemPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"entityLot"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewItemPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"textOriginal"}},{"kind":"Field","name":{"kind":"Name","value":"textRendered"}},{"kind":"Field","name":{"kind":"Name","value":"isSpoiler"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"postedOn"}},{"kind":"Field","name":{"kind":"Name","value":"postedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}}]} as unknown as DocumentNode<CollectionContentsQuery, CollectionContentsQueryVariables>;
export const CoreDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CoreDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coreDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isPro"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"docsLink"}},{"kind":"Field","name":{"kind":"Name","value":"pageLimit"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"smtpEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"oidcEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"signupAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"repositoryLink"}},{"kind":"Field","name":{"kind":"Name","value":"localAuthDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"fileStorageEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"tokenValidForDays"}}]}}]}}]} as unknown as DocumentNode<CoreDetailsQuery, CoreDetailsQueryVariables>;
export const ExerciseDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExerciseDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"exerciseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"force"}},{"kind":"Field","name":{"kind":"Name","value":"mechanic"}},{"kind":"Field","name":{"kind":"Name","value":"equipment"}},{"kind":"Field","name":{"kind":"Name","value":"muscles"}},{"kind":"Field","name":{"kind":"Name","value":"createdByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"images"}}]}}]}}]}}]} as unknown as DocumentNode<ExerciseDetailsQuery, ExerciseDetailsQueryVariables>;
export const ExerciseParametersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExerciseParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"force"}},{"kind":"Field","name":{"kind":"Name","value":"mechanic"}},{"kind":"Field","name":{"kind":"Name","value":"equipment"}},{"kind":"Field","name":{"kind":"Name","value":"muscle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"downloadRequired"}}]}}]}}]} as unknown as DocumentNode<ExerciseParametersQuery, ExerciseParametersQueryVariables>;
export const ExercisesListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExercisesList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExercisesListInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exercisesList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"muscle"}},{"kind":"Field","name":{"kind":"Name","value":"numTimesInteracted"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdatedOn"}}]}}]}}]}}]} as unknown as DocumentNode<ExercisesListQuery, ExercisesListQueryVariables>;
export const GenreDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenreDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenreDetailsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"genreDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"numItems"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"}}]}}]}}]}}]} as unknown as DocumentNode<GenreDetailsQuery, GenreDetailsQueryVariables>;
export const GenresListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenresList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"genresList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"numItems"}}]}}]}}]}}]} as unknown as DocumentNode<GenresListQuery, GenresListQueryVariables>;
export const ImportReportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ImportReports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importReports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"startedOn"}},{"kind":"Field","name":{"kind":"Name","value":"finishedOn"}},{"kind":"Field","name":{"kind":"Name","value":"wasSuccess"}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"import"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"failedItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"step"}},{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ImportReportsQuery, ImportReportsQueryVariables>;
export const LatestUserSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LatestUserSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"latestUserSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"calculatedOn"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fitness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"measurementsRecorded"}},{"kind":"Field","name":{"kind":"Name","value":"exercisesInteractedWith"}},{"kind":"Field","name":{"kind":"Name","value":"workouts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recorded"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataOverall"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewed"}},{"kind":"Field","name":{"kind":"Name","value":"interactedWith"}}]}},{"kind":"Field","name":{"kind":"Name","value":"peopleOverall"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewed"}},{"kind":"Field","name":{"kind":"Name","value":"interactedWith"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manga"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapters"}},{"kind":"Field","name":{"kind":"Name","value":"read"}}]}},{"kind":"Field","name":{"kind":"Name","value":"books"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pages"}},{"kind":"Field","name":{"kind":"Name","value":"read"}}]}},{"kind":"Field","name":{"kind":"Name","value":"movies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"watched"}}]}},{"kind":"Field","name":{"kind":"Name","value":"anime"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodes"}},{"kind":"Field","name":{"kind":"Name","value":"watched"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcasts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"played"}},{"kind":"Field","name":{"kind":"Name","value":"playedEpisodes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visualNovels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"played"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"played"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"watchedEpisodes"}},{"kind":"Field","name":{"kind":"Name","value":"watchedSeasons"}},{"kind":"Field","name":{"kind":"Name","value":"watched"}}]}},{"kind":"Field","name":{"kind":"Name","value":"audioBooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"played"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<LatestUserSummaryQuery, LatestUserSummaryQueryVariables>;
export const MetadataDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"metadataId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"isNsfw"}},{"kind":"Field","name":{"kind":"Name","value":"isPartial"}},{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"suggestions"}},{"kind":"Field","name":{"kind":"Name","value":"publishYear"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"providerRating"}},{"kind":"Field","name":{"kind":"Name","value":"productionStatus"}},{"kind":"Field","name":{"kind":"Name","value":"originalLanguage"}},{"kind":"Field","name":{"kind":"Name","value":"genres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"part"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"creators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"character"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"languages"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"audioBookSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runtime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bookSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pages"}}]}},{"kind":"Field","name":{"kind":"Name","value":"movieSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runtime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"volumes"}},{"kind":"Field","name":{"kind":"Name","value":"chapters"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"overview"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalEpisodes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalSeasons"}},{"kind":"Field","name":{"kind":"Name","value":"totalEpisodes"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"seasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seasonNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"overview"}},{"kind":"Field","name":{"kind":"Name","value":"backdropImages"}},{"kind":"Field","name":{"kind":"Name","value":"posterImages"}},{"kind":"Field","name":{"kind":"Name","value":"episodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"posterImages"}},{"kind":"Field","name":{"kind":"Name","value":"episodeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"publishDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"overview"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"visualNovelSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"length"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoGameSpecifics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platforms"}}]}}]}}]}}]} as unknown as DocumentNode<MetadataDetailsQuery, MetadataDetailsQueryVariables>;
export const MetadataGroupDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataGroupDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadataGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataGroupDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"metadataGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadataGroupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"}},{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"parts"}},{"kind":"Field","name":{"kind":"Name","value":"isPartial"}}]}}]}}]}}]} as unknown as DocumentNode<MetadataGroupDetailsQuery, MetadataGroupDetailsQueryVariables>;
export const MetadataGroupSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataGroupSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataGroupSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataGroupSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"parts"}}]}}]}}]}}]} as unknown as DocumentNode<MetadataGroupSearchQuery, MetadataGroupSearchQueryVariables>;
export const MetadataListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataListInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"}}]}}]}}]} as unknown as DocumentNode<MetadataListQuery, MetadataListQueryVariables>;
export const MetadataSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"hasInteracted"}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"publishYear"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MetadataSearchQuery, MetadataSearchQueryVariables>;
export const PeopleSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PeopleSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PeopleSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"peopleSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"birthYear"}}]}}]}}]}}]} as unknown as DocumentNode<PeopleSearchQuery, PeopleSearchQueryVariables>;
export const PersonDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PersonDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"personId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"personId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"personId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"isPartial"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"deathDate"}},{"kind":"Field","name":{"kind":"Name","value":"place"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediaId"}},{"kind":"Field","name":{"kind":"Name","value":"character"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PersonDetailsQuery, PersonDetailsQueryVariables>;
export const UserDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"oidcIssuerId"}}]}}]}}]}}]} as unknown as DocumentNode<UserDetailsQuery, UserDetailsQueryVariables>;
export const UserExerciseDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserExerciseDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExerciseDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"exerciseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"idx"}},{"kind":"Field","name":{"kind":"Name","value":"workoutId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseId"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdatedOn"}},{"kind":"Field","name":{"kind":"Name","value":"exerciseNumTimesInteracted"}},{"kind":"Field","name":{"kind":"Name","value":"exerciseExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lifetimeStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"personalBestsAchieved"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personalBests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"sets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workoutId"}},{"kind":"Field","name":{"kind":"Name","value":"exerciseIdx"}},{"kind":"Field","name":{"kind":"Name","value":"setIdx"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]} as unknown as DocumentNode<UserExerciseDetailsQuery, UserExerciseDetailsQueryVariables>;
export const UserMeasurementsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserMeasurementsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserMeasurementsListInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userMeasurementsList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"bodyMassIndex"}},{"kind":"Field","name":{"kind":"Name","value":"totalBodyWater"}},{"kind":"Field","name":{"kind":"Name","value":"muscle"}},{"kind":"Field","name":{"kind":"Name","value":"leanBodyMass"}},{"kind":"Field","name":{"kind":"Name","value":"bodyFat"}},{"kind":"Field","name":{"kind":"Name","value":"boneMass"}},{"kind":"Field","name":{"kind":"Name","value":"visceralFat"}},{"kind":"Field","name":{"kind":"Name","value":"waistCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"waistToHeightRatio"}},{"kind":"Field","name":{"kind":"Name","value":"hipCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"waistToHipRatio"}},{"kind":"Field","name":{"kind":"Name","value":"chestCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"thighCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"bicepsCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"neckCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"bodyFatCaliper"}},{"kind":"Field","name":{"kind":"Name","value":"chestSkinfold"}},{"kind":"Field","name":{"kind":"Name","value":"abdominalSkinfold"}},{"kind":"Field","name":{"kind":"Name","value":"thighSkinfold"}},{"kind":"Field","name":{"kind":"Name","value":"basalMetabolicRate"}},{"kind":"Field","name":{"kind":"Name","value":"totalDailyEnergyExpenditure"}},{"kind":"Field","name":{"kind":"Name","value":"calories"}},{"kind":"Field","name":{"kind":"Name","value":"custom"}}]}}]}}]}}]} as unknown as DocumentNode<UserMeasurementsListQuery, UserMeasurementsListQueryVariables>;
export const UserMetadataDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserMetadataDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userMetadataDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"metadataId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediaReason"}},{"kind":"Field","name":{"kind":"Name","value":"hasInteracted"}},{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"unitsConsumed"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewItemPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seenByAllCount"}},{"kind":"Field","name":{"kind":"Name","value":"seenByUserCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextEntry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"chapter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesSeen"}},{"kind":"Field","name":{"kind":"Name","value":"seasonNumber"}},{"kind":"Field","name":{"kind":"Name","value":"episodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"timesSeen"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episodeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"timesSeen"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Seen"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"providerWatchedOn"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"startedOn"}},{"kind":"Field","name":{"kind":"Name","value":"finishedOn"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdatedOn"}},{"kind":"Field","name":{"kind":"Name","value":"numTimesUpdated"}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewItemPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"textOriginal"}},{"kind":"Field","name":{"kind":"Name","value":"textRendered"}},{"kind":"Field","name":{"kind":"Name","value":"isSpoiler"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"postedOn"}},{"kind":"Field","name":{"kind":"Name","value":"postedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}}]} as unknown as DocumentNode<UserMetadataDetailsQuery, UserMetadataDetailsQueryVariables>;
export const UserMetadataGroupDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserMetadataGroupDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadataGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userMetadataGroupDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"metadataGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadataGroupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewItemPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPart"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewItemPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"textOriginal"}},{"kind":"Field","name":{"kind":"Name","value":"textRendered"}},{"kind":"Field","name":{"kind":"Name","value":"isSpoiler"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"postedOn"}},{"kind":"Field","name":{"kind":"Name","value":"postedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]} as unknown as DocumentNode<UserMetadataGroupDetailsQuery, UserMetadataGroupDetailsQueryVariables>;
export const UserPersonDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserPersonDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"personId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userPersonDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"personId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"personId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewItemPart"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenAnimeExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenMangaExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewItemPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"textOriginal"}},{"kind":"Field","name":{"kind":"Name","value":"textRendered"}},{"kind":"Field","name":{"kind":"Name","value":"isSpoiler"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"postedOn"}},{"kind":"Field","name":{"kind":"Name","value":"postedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"animeExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenAnimeExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mangaExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenMangaExtraInformationPart"}}]}}]}}]} as unknown as DocumentNode<UserPersonDetailsQuery, UserPersonDetailsQueryVariables>;
export const UserPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"general"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewScale"}},{"kind":"Field","name":{"kind":"Name","value":"displayNsfw"}},{"kind":"Field","name":{"kind":"Name","value":"disableVideos"}},{"kind":"Field","name":{"kind":"Name","value":"persistQueries"}},{"kind":"Field","name":{"kind":"Name","value":"watchProviders"}},{"kind":"Field","name":{"kind":"Name","value":"disableReviews"}},{"kind":"Field","name":{"kind":"Name","value":"disableIntegrations"}},{"kind":"Field","name":{"kind":"Name","value":"disableWatchProviders"}},{"kind":"Field","name":{"kind":"Name","value":"disableNavigationAnimation"}},{"kind":"Field","name":{"kind":"Name","value":"dashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"numElements"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"fitness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"measurements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"custom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inbuilt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"bodyMassIndex"}},{"kind":"Field","name":{"kind":"Name","value":"totalBodyWater"}},{"kind":"Field","name":{"kind":"Name","value":"muscle"}},{"kind":"Field","name":{"kind":"Name","value":"leanBodyMass"}},{"kind":"Field","name":{"kind":"Name","value":"bodyFat"}},{"kind":"Field","name":{"kind":"Name","value":"boneMass"}},{"kind":"Field","name":{"kind":"Name","value":"visceralFat"}},{"kind":"Field","name":{"kind":"Name","value":"waistCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"waistToHeightRatio"}},{"kind":"Field","name":{"kind":"Name","value":"hipCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"waistToHipRatio"}},{"kind":"Field","name":{"kind":"Name","value":"chestCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"thighCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"bicepsCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"neckCircumference"}},{"kind":"Field","name":{"kind":"Name","value":"bodyFatCaliper"}},{"kind":"Field","name":{"kind":"Name","value":"chestSkinfold"}},{"kind":"Field","name":{"kind":"Name","value":"abdominalSkinfold"}},{"kind":"Field","name":{"kind":"Name","value":"thighSkinfold"}},{"kind":"Field","name":{"kind":"Name","value":"basalMetabolicRate"}},{"kind":"Field","name":{"kind":"Name","value":"totalDailyEnergyExpenditure"}},{"kind":"Field","name":{"kind":"Name","value":"calories"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveHistory"}},{"kind":"Field","name":{"kind":"Name","value":"unitSystem"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toSend"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuresEnabled"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"others"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"calendar"}},{"kind":"Field","name":{"kind":"Name","value":"collections"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fitness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"workouts"}},{"kind":"Field","name":{"kind":"Name","value":"measurements"}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"anime"}},{"kind":"Field","name":{"kind":"Name","value":"audioBook"}},{"kind":"Field","name":{"kind":"Name","value":"book"}},{"kind":"Field","name":{"kind":"Name","value":"manga"}},{"kind":"Field","name":{"kind":"Name","value":"movie"}},{"kind":"Field","name":{"kind":"Name","value":"podcast"}},{"kind":"Field","name":{"kind":"Name","value":"show"}},{"kind":"Field","name":{"kind":"Name","value":"videoGame"}},{"kind":"Field","name":{"kind":"Name","value":"visualNovel"}},{"kind":"Field","name":{"kind":"Name","value":"people"}},{"kind":"Field","name":{"kind":"Name","value":"groups"}},{"kind":"Field","name":{"kind":"Name","value":"genres"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserPreferencesQuery, UserPreferencesQueryVariables>;
export const UserWorkoutsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserWorkoutsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userWorkoutsList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"summary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSummaryPart"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutOrExerciseTotals"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personalBestsAchieved"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSetStatisticPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSetStatistic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"oneRm"}},{"kind":"Field","name":{"kind":"Name","value":"pace"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSummaryPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numSets"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"bestSet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSetStatisticPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"personalBests"}}]}}]}}]}}]} as unknown as DocumentNode<UserWorkoutsListQuery, UserWorkoutsListQueryVariables>;
export const WorkoutDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkoutDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workoutDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workoutId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workoutId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"repeatedFrom"}},{"kind":"Field","name":{"kind":"Name","value":"summary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSummaryPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"information"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutInformationPart"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutOrExerciseTotals"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personalBestsAchieved"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSetStatisticPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSetStatistic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"oneRm"}},{"kind":"Field","name":{"kind":"Name","value":"pace"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EntityAssetsPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EntityAssets"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"videos"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutSummaryPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numSets"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"bestSet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSetStatisticPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"personalBests"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkoutInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EntityAssetsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"restTime"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutOrExerciseTotalsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"supersetWith"}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EntityAssetsPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkoutSetStatisticPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"personalBests"}},{"kind":"Field","name":{"kind":"Name","value":"confirmedAt"}}]}}]}}]}}]} as unknown as DocumentNode<WorkoutDetailsQuery, WorkoutDetailsQueryVariables>;
export const GetOidcRedirectUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOidcRedirectUrl"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOidcRedirectUrl"}}]}}]} as unknown as DocumentNode<GetOidcRedirectUrlQuery, GetOidcRedirectUrlQueryVariables>;
export const UserByOidcIssuerIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserByOidcIssuerId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"oidcIssuerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userByOidcIssuerId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"oidcIssuerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"oidcIssuerId"}}}]}]}}]} as unknown as DocumentNode<UserByOidcIssuerIdQuery, UserByOidcIssuerIdQueryVariables>;
export const GetOidcTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOidcToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOidcToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<GetOidcTokenQuery, GetOidcTokenQueryVariables>;
export const GetPresignedS3UrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPresignedS3Url"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPresignedS3Url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}]}]}}]} as unknown as DocumentNode<GetPresignedS3UrlQuery, GetPresignedS3UrlQueryVariables>;
export const ProvidersLanguageInformationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProvidersLanguageInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"providersLanguageInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supported"}},{"kind":"Field","name":{"kind":"Name","value":"default"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<ProvidersLanguageInformationQuery, ProvidersLanguageInformationQueryVariables>;
export const UserExportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserExports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"endedAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"exported"}}]}}]}}]} as unknown as DocumentNode<UserExportsQuery, UserExportsQueryVariables>;
export const UserCollectionsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserCollectionsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userCollectionsList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collaborators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"informationTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}}]}}]}}]}}]} as unknown as DocumentNode<UserCollectionsListQuery, UserCollectionsListQueryVariables>;
export const UserIntegrationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserIntegrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userIntegrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"maximumProgress"}},{"kind":"Field","name":{"kind":"Name","value":"minimumProgress"}},{"kind":"Field","name":{"kind":"Name","value":"lastTriggeredOn"}}]}}]}}]} as unknown as DocumentNode<UserIntegrationsQuery, UserIntegrationsQueryVariables>;
export const UserNotificationPlatformsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserNotificationPlatforms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userNotificationPlatforms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UserNotificationPlatformsQuery, UserNotificationPlatformsQueryVariables>;
export const UsersListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usersList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}}]}}]}}]} as unknown as DocumentNode<UsersListQuery, UsersListQueryVariables>;
export const UserUpcomingCalendarEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserUpcomingCalendarEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserUpcomingCalendarEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userUpcomingCalendarEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CalendarEventPart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CalendarEventPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GraphqlCalendarEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"metadataId"}},{"kind":"Field","name":{"kind":"Name","value":"metadataLot"}},{"kind":"Field","name":{"kind":"Name","value":"episodeName"}},{"kind":"Field","name":{"kind":"Name","value":"metadataTitle"}},{"kind":"Field","name":{"kind":"Name","value":"metadataImage"}},{"kind":"Field","name":{"kind":"Name","value":"calendarEventId"}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}}]}}]} as unknown as DocumentNode<UserUpcomingCalendarEventsQuery, UserUpcomingCalendarEventsQueryVariables>;
export const UserCalendarEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserCalendarEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserCalendarEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userCalendarEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CalendarEventPart"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenShowExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenShowExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SeenPodcastExtraInformation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"episode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CalendarEventPart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GraphqlCalendarEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"metadataId"}},{"kind":"Field","name":{"kind":"Name","value":"metadataLot"}},{"kind":"Field","name":{"kind":"Name","value":"episodeName"}},{"kind":"Field","name":{"kind":"Name","value":"metadataTitle"}},{"kind":"Field","name":{"kind":"Name","value":"metadataImage"}},{"kind":"Field","name":{"kind":"Name","value":"calendarEventId"}},{"kind":"Field","name":{"kind":"Name","value":"showExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenShowExtraInformationPart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"podcastExtraInformation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeenPodcastExtraInformationPart"}}]}}]}}]} as unknown as DocumentNode<UserCalendarEventsQuery, UserCalendarEventsQueryVariables>;
export const MetadataPartialDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataPartialDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataPartialDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"metadataId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadataId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lot"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"publishYear"}}]}}]}}]} as unknown as DocumentNode<MetadataPartialDetailsQuery, MetadataPartialDetailsQueryVariables>;
export const MetadataGroupsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MetadataGroupsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadataGroupsList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"}}]}}]}}]} as unknown as DocumentNode<MetadataGroupsListQuery, MetadataGroupsListQueryVariables>;
export const PeopleListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PeopleList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PeopleListInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"peopleList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"}}]}}]}}]} as unknown as DocumentNode<PeopleListQuery, PeopleListQueryVariables>;