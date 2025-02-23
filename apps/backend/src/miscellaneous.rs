use std::{
    collections::{HashMap, HashSet},
    fmt,
    fs::File,
    future::Future,
    iter::zip,
    path::PathBuf,
    str::FromStr,
    sync::Arc,
};

use anyhow::Result as AnyhowResult;
use apalis::prelude::{MemoryStorage, MessageQueue};
use argon2::{Argon2, PasswordHash, PasswordVerifier};
use async_graphql::{
    Context, Enum, Error, InputObject, InputType, Object, OneofObject, Result, SimpleObject, Union,
};
use cached::{DiskCache, IOCached};
use chrono::{Days, Duration as ChronoDuration, NaiveDate, Utc};
use database::{
    AliasedCollection, AliasedCollectionToEntity, AliasedExercise, AliasedMetadata,
    AliasedMetadataGroup, AliasedMetadataToGenre, AliasedPerson, AliasedSeen, AliasedUser,
    AliasedUserToCollection, AliasedUserToEntity, EntityLot, IntegrationLot, IntegrationProvider,
    MediaLot, MediaSource, MetadataToMetadataRelation, NotificationPlatformLot, SeenState, UserLot,
    UserToMediaReason, Visibility,
};
use enum_meta::Meta;
use futures::TryStreamExt;
use itertools::Itertools;
use markdown::{
    to_html as markdown_to_html, to_html_with_options as markdown_to_html_opts, CompileOptions,
    Options,
};
use nanoid::nanoid;
use openidconnect::{
    core::{CoreClient, CoreResponseType},
    reqwest::async_http_client,
    AuthenticationFlow, AuthorizationCode, CsrfToken, Nonce, Scope, TokenResponse,
};
use rs_utils::{get_first_and_last_day_of_month, IsFeatureEnabled};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use sea_orm::{
    prelude::DateTimeUtc, sea_query::NullOrdering, ActiveModelTrait, ActiveValue, ColumnTrait,
    ConnectionTrait, DatabaseBackend, DatabaseConnection, DbBackend, EntityTrait, FromQueryResult,
    ItemsAndPagesNumber, Iterable, JoinType, ModelTrait, Order, PaginatorTrait, QueryFilter,
    QueryOrder, QuerySelect, QueryTrait, RelationTrait, Statement, TransactionTrait,
};
use sea_query::{
    extension::postgres::PgExpr, Alias, Asterisk, Cond, Condition, Expr, Func, Iden, OnConflict,
    PgFunc, PostgresQueryBuilder, Query, SelectStatement, SimpleExpr, Write,
};
use serde::{Deserialize, Serialize};
use struson::writer::{JsonStreamWriter, JsonWriter};

use crate::{
    background::{ApplicationJob, CoreApplicationJob},
    entities::{
        calendar_event, collection, collection_to_entity, genre, import_report, integration,
        metadata, metadata_group, metadata_to_genre, metadata_to_metadata,
        metadata_to_metadata_group, metadata_to_person, notification_platform, person,
        prelude::{
            CalendarEvent, Collection, CollectionToEntity, Exercise, Genre, ImportReport,
            Integration, Metadata, MetadataGroup, MetadataToGenre, MetadataToMetadata,
            MetadataToMetadataGroup, MetadataToPerson, NotificationPlatform, Person,
            QueuedNotification, Review, Seen, User, UserMeasurement, UserSummary, UserToCollection,
            UserToEntity, Workout,
        },
        queued_notification, review, seen, user, user_measurement, user_summary,
        user_to_collection, user_to_entity, workout,
    },
    file_storage::FileStorageService,
    fitness::resolver::ExerciseService,
    integrations::{IntegrationMediaSeen, IntegrationService},
    jwt,
    models::{
        fitness::UserUnitSystem,
        media::{
            AnimeSpecifics, AudioBookSpecifics, BookSpecifics, CommitMediaInput, CommitPersonInput,
            CreateOrUpdateCollectionInput, EntityWithLot, GenreListItem, ImportOrExportItemRating,
            ImportOrExportItemReview, ImportOrExportItemReviewComment,
            ImportOrExportMediaGroupItem, ImportOrExportMediaItem, ImportOrExportMediaItemSeen,
            ImportOrExportPersonItem, IntegrationProviderSpecifics, MangaSpecifics,
            MediaAssociatedPersonStateChanges, MediaDetails, MetadataFreeCreator,
            MetadataGroupSearchItem, MetadataImage, MetadataImageForMediaDetails,
            MetadataPartialDetails, MetadataSearchItemResponse, MetadataVideo, MetadataVideoSource,
            MovieSpecifics, PartialMetadata, PartialMetadataPerson, PartialMetadataWithoutId,
            PeopleSearchItem, PersonSourceSpecifics, PodcastSpecifics, PostReviewInput,
            ProgressUpdateError, ProgressUpdateErrorVariant, ProgressUpdateInput,
            ProgressUpdateResultUnion, ReviewPostedEvent, SeenAnimeExtraInformation,
            SeenMangaExtraInformation, SeenPodcastExtraInformation, SeenShowExtraInformation,
            ShowSpecifics, VideoGameSpecifics, VisualNovelSpecifics, WatchProvider,
        },
        BackendError, BackgroundJob, ChangeCollectionToEntityInput, CollectionExtraInformation,
        CollectionToEntitySystemInformation, DefaultCollection, IdAndNamedObject,
        MediaStateChanged, SearchDetails, SearchInput, SearchResults, StoredUrl, StringIdObject,
        UserSummaryData,
    },
    providers::{
        anilist::{
            AnilistAnimeService, AnilistMangaService, AnilistService, NonMediaAnilistService,
        },
        audible::AudibleService,
        google_books::GoogleBooksService,
        igdb::IgdbService,
        itunes::ITunesService,
        listennotes::ListennotesService,
        mal::{MalAnimeService, MalMangaService, MalService, NonMediaMalService},
        manga_updates::MangaUpdatesService,
        openlibrary::OpenlibraryService,
        tmdb::{NonMediaTmdbService, TmdbMovieService, TmdbService, TmdbShowService},
        vndb::VndbService,
    },
    traits::{
        AuthProvider, DatabaseAssetsAsSingleUrl, DatabaseAssetsAsUrls, MediaProvider,
        MediaProviderLanguages, TraceOk,
    },
    users::{
        NotificationPlatformSpecifics, UserGeneralDashboardElement, UserGeneralPreferences,
        UserPreferences, UserReviewScale,
    },
    utils::{
        add_entity_to_collection, associate_user_with_entity, entity_in_collections,
        get_current_date, get_user_to_entity_association, ilike_sql, user_by_id,
        user_id_from_token, AUTHOR, SHOW_SPECIAL_SEASON_NAMES, TEMP_DIR, VERSION,
    },
};

type Provider = Box<(dyn MediaProvider + Send + Sync)>;

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct CreateCustomMetadataInput {
    title: String,
    lot: MediaLot,
    description: Option<String>,
    creators: Option<Vec<String>>,
    genres: Option<Vec<String>>,
    images: Option<Vec<String>>,
    videos: Option<Vec<String>>,
    is_nsfw: Option<bool>,
    publish_year: Option<i32>,
    audio_book_specifics: Option<AudioBookSpecifics>,
    book_specifics: Option<BookSpecifics>,
    movie_specifics: Option<MovieSpecifics>,
    podcast_specifics: Option<PodcastSpecifics>,
    show_specifics: Option<ShowSpecifics>,
    video_game_specifics: Option<VideoGameSpecifics>,
    manga_specifics: Option<MangaSpecifics>,
    anime_specifics: Option<AnimeSpecifics>,
    visual_novel_specifics: Option<VisualNovelSpecifics>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct CreateUserIntegrationInput {
    provider: IntegrationProvider,
    provider_specifics: Option<IntegrationProviderSpecifics>,
    minimum_progress: Option<Decimal>,
    maximum_progress: Option<Decimal>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct UpdateUserIntegrationInput {
    integration_id: String,
    is_disabled: Option<bool>,
    minimum_progress: Option<Decimal>,
    maximum_progress: Option<Decimal>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct CreateUserNotificationPlatformInput {
    lot: NotificationPlatformLot,
    base_url: Option<String>,
    #[graphql(secret)]
    api_token: Option<String>,
    #[graphql(secret)]
    auth_header: Option<String>,
    priority: Option<i32>,
    chat_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct UpdateUserNotificationPlatformInput {
    notification_id: String,
    is_disabled: Option<bool>,
}

#[derive(Enum, Clone, Debug, Copy, PartialEq, Eq)]
enum CreateCustomMediaErrorVariant {
    LotDoesNotMatchSpecifics,
}

#[derive(Debug, SimpleObject)]
struct ProviderLanguageInformation {
    source: MediaSource,
    supported: Vec<String>,
    default: String,
}

#[derive(Enum, Clone, Debug, Copy, PartialEq, Eq)]
enum UserDetailsErrorVariant {
    AuthTokenInvalid,
}

#[derive(Debug, SimpleObject)]
struct UserDetailsError {
    error: UserDetailsErrorVariant,
}

#[derive(Union)]
enum UserDetailsResult {
    Ok(Box<user::Model>),
    Error(UserDetailsError),
}

#[derive(Debug, InputObject, Serialize, Deserialize, Clone)]
struct PasswordUserInput {
    username: String,
    #[graphql(secret)]
    password: String,
}

#[derive(Debug, InputObject, Serialize, Deserialize, Clone)]
struct OidcUserInput {
    email: String,
    #[graphql(secret)]
    issuer_id: String,
}

#[derive(Debug, Serialize, Deserialize, OneofObject, Clone)]
enum AuthUserInput {
    Password(PasswordUserInput),
    Oidc(OidcUserInput),
}

#[derive(Debug, InputObject)]
struct RegisterUserInput {
    data: AuthUserInput,
    /// If registration is disabled, this can be used to override it.
    admin_access_token: Option<String>,
}

#[derive(Enum, Clone, Debug, Copy, PartialEq, Eq)]
enum RegisterErrorVariant {
    IdentifierAlreadyExists,
    Disabled,
}

#[derive(Debug, SimpleObject)]
struct RegisterError {
    error: RegisterErrorVariant,
}

#[derive(Union)]
enum RegisterResult {
    Ok(StringIdObject),
    Error(RegisterError),
}

#[derive(Enum, Clone, Debug, Copy, PartialEq, Eq)]
enum LoginErrorVariant {
    AccountDisabled,
    UsernameDoesNotExist,
    CredentialsMismatch,
    IncorrectProviderChosen,
}

#[derive(Debug, SimpleObject)]
struct LoginError {
    error: LoginErrorVariant,
}

#[derive(Debug, SimpleObject)]
struct LoginResponse {
    api_key: String,
}

#[derive(Union)]
enum LoginResult {
    Ok(LoginResponse),
    Error(LoginError),
}

#[derive(Debug, InputObject)]
struct UpdateUserInput {
    user_id: String,
    is_disabled: Option<bool>,
    lot: Option<UserLot>,
    #[graphql(secret)]
    password: Option<String>,
    username: Option<String>,
    extra_information: Option<serde_json::Value>,
    admin_access_token: Option<String>,
}

#[derive(Debug, InputObject)]
struct UpdateUserPreferenceInput {
    /// Dot delimited path to the property that needs to be changed. Setting it\
    /// to empty resets the preferences to default.
    property: String,
    value: String,
}

#[derive(Debug, InputObject)]
struct GenreDetailsInput {
    genre_id: String,
    page: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Enum, Clone, PartialEq, Eq, Copy, Default)]
enum CollectionContentsSortBy {
    Title,
    #[default]
    LastUpdatedOn,
    Date,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone, Default)]
struct CollectionContentsFilter {
    entity_type: Option<EntityLot>,
    metadata_lot: Option<MediaLot>,
}

#[derive(Debug, InputObject)]
struct CollectionContentsInput {
    collection_id: String,
    search: Option<SearchInput>,
    filter: Option<CollectionContentsFilter>,
    take: Option<u64>,
    sort: Option<SortInput<CollectionContentsSortBy>>,
}

#[derive(Debug, SimpleObject)]
struct CollectionContents {
    details: collection::Model,
    results: SearchResults<EntityWithLot>,
    reviews: Vec<ReviewItem>,
    user: user::Model,
}

#[derive(Debug, SimpleObject)]
struct ReviewItem {
    id: String,
    posted_on: DateTimeUtc,
    rating: Option<Decimal>,
    text_original: Option<String>,
    text_rendered: Option<String>,
    visibility: Visibility,
    is_spoiler: bool,
    posted_by: IdAndNamedObject,
    show_extra_information: Option<SeenShowExtraInformation>,
    podcast_extra_information: Option<SeenPodcastExtraInformation>,
    anime_extra_information: Option<SeenAnimeExtraInformation>,
    manga_extra_information: Option<SeenMangaExtraInformation>,
    comments: Vec<ImportOrExportItemReviewComment>,
}

#[derive(Debug, SimpleObject, FromQueryResult)]
struct CollectionItem {
    id: String,
    name: String,
    count: i64,
    is_default: bool,
    description: Option<String>,
    information_template: Option<Vec<CollectionExtraInformation>>,
    creator: IdAndNamedObject,
    collaborators: Vec<IdAndNamedObject>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct MetadataCreator {
    id: Option<String>,
    name: String,
    image: Option<String>,
    character: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct MetadataCreatorGroupedByRole {
    name: String,
    items: Vec<MetadataCreator>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct PersonDetails {
    details: person::Model,
    contents: Vec<PersonDetailsGroupedByRole>,
    source_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct MetadataGroupDetails {
    details: metadata_group::Model,
    source_url: Option<String>,
    contents: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct GenreDetails {
    details: GenreListItem,
    contents: SearchResults<String>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct PersonDetailsItemWithCharacter {
    media_id: String,
    character: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct PersonDetailsGroupedByRole {
    /// The name of the role performed.
    name: String,
    /// The media items in which this role was performed.
    items: Vec<PersonDetailsItemWithCharacter>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct MetadataBaseData {
    model: metadata::Model,
    suggestions: Vec<String>,
    genres: Vec<GenreListItem>,
    assets: GraphqlMediaAssets,
    creators: Vec<MetadataCreatorGroupedByRole>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct GraphqlMetadataGroup {
    id: String,
    name: String,
    part: i32,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct GraphqlVideoAsset {
    video_id: String,
    source: MetadataVideoSource,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct GraphqlMediaAssets {
    images: Vec<String>,
    videos: Vec<GraphqlVideoAsset>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct GraphqlMetadataDetails {
    id: String,
    title: String,
    identifier: String,
    is_nsfw: Option<bool>,
    is_partial: Option<bool>,
    description: Option<String>,
    original_language: Option<String>,
    provider_rating: Option<Decimal>,
    production_status: Option<String>,
    lot: MediaLot,
    source: MediaSource,
    creators: Vec<MetadataCreatorGroupedByRole>,
    watch_providers: Vec<WatchProvider>,
    genres: Vec<GenreListItem>,
    assets: GraphqlMediaAssets,
    publish_year: Option<i32>,
    publish_date: Option<NaiveDate>,
    book_specifics: Option<BookSpecifics>,
    movie_specifics: Option<MovieSpecifics>,
    show_specifics: Option<ShowSpecifics>,
    video_game_specifics: Option<VideoGameSpecifics>,
    visual_novel_specifics: Option<VisualNovelSpecifics>,
    audio_book_specifics: Option<AudioBookSpecifics>,
    podcast_specifics: Option<PodcastSpecifics>,
    manga_specifics: Option<MangaSpecifics>,
    anime_specifics: Option<AnimeSpecifics>,
    source_url: Option<String>,
    suggestions: Vec<String>,
    group: Option<GraphqlMetadataGroup>,
}

#[derive(Debug, Serialize, Deserialize, Enum, Clone, PartialEq, Eq, Copy, Default)]
enum GraphqlSortOrder {
    Desc,
    #[default]
    Asc,
}

impl From<GraphqlSortOrder> for Order {
    fn from(value: GraphqlSortOrder) -> Self {
        match value {
            GraphqlSortOrder::Desc => Self::Desc,
            GraphqlSortOrder::Asc => Self::Asc,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Enum, Clone, PartialEq, Eq, Copy, Default)]
enum MediaSortBy {
    LastUpdated,
    Title,
    #[default]
    ReleaseDate,
    LastSeen,
    Rating,
}

#[derive(Debug, Serialize, Deserialize, Enum, Clone, PartialEq, Eq, Copy, Default)]
enum PersonSortBy {
    #[default]
    Name,
    MediaItems,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone, Default)]
#[graphql(concrete(name = "MediaSortInput", params(MediaSortBy)))]
#[graphql(concrete(name = "PersonSortInput", params(PersonSortBy)))]
#[graphql(concrete(name = "CollectionContentsSortInput", params(CollectionContentsSortBy)))]
struct SortInput<T: InputType + Default> {
    #[graphql(default)]
    order: GraphqlSortOrder,
    #[graphql(default)]
    by: T,
}

#[derive(Debug, Serialize, Deserialize, Enum, Clone, Copy, Eq, PartialEq)]
enum MediaGeneralFilter {
    All,
    Rated,
    Unrated,
    Dropped,
    OnAHold,
    Unfinished,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct MediaFilter {
    general: Option<MediaGeneralFilter>,
    collection: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct MetadataListInput {
    search: SearchInput,
    lot: Option<MediaLot>,
    filter: Option<MediaFilter>,
    sort: Option<SortInput<MediaSortBy>>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct PeopleListInput {
    search: SearchInput,
    sort: Option<SortInput<PersonSortBy>>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct MediaConsumedInput {
    identifier: String,
    lot: MediaLot,
}

#[derive(Debug, SimpleObject, Serialize, Deserialize)]
struct CoreDetails {
    is_pro: bool,
    page_limit: i32,
    version: String,
    docs_link: String,
    oidc_enabled: bool,
    smtp_enabled: bool,
    website_url: String,
    author_name: String,
    signup_allowed: bool,
    repository_link: String,
    token_valid_for_days: i32,
    file_storage_enabled: bool,
    local_auth_disabled: bool,
    backend_errors: Vec<BackendError>,
}

#[derive(Debug, Ord, PartialEq, Eq, PartialOrd, Clone, Hash)]
struct ProgressUpdateCache {
    user_id: String,
    metadata_id: String,
    show_season_number: Option<i32>,
    show_episode_number: Option<i32>,
    podcast_episode_number: Option<i32>,
    anime_episode_number: Option<i32>,
    manga_chapter_number: Option<i32>,
}

impl fmt::Display for ProgressUpdateCache {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:#?}", self)
    }
}

#[derive(SimpleObject)]
struct UserPersonDetails {
    reviews: Vec<ReviewItem>,
    collections: Vec<collection::Model>,
}

#[derive(SimpleObject)]
struct UserMetadataGroupDetails {
    reviews: Vec<ReviewItem>,
    collections: Vec<collection::Model>,
}

#[derive(SimpleObject)]
struct UserMetadataDetailsEpisodeProgress {
    episode_number: i32,
    times_seen: usize,
}

#[derive(SimpleObject)]
struct UserMetadataDetailsShowSeasonProgress {
    season_number: i32,
    times_seen: usize,
    episodes: Vec<UserMetadataDetailsEpisodeProgress>,
}

#[derive(SimpleObject)]
struct UserMetadataDetails {
    /// The reasons why this metadata is related to this user
    media_reason: Option<Vec<UserToMediaReason>>,
    /// The collections in which this media is present.
    collections: Vec<collection::Model>,
    /// The public reviews of this media.
    reviews: Vec<ReviewItem>,
    /// The seen history of this media.
    history: Vec<seen::Model>,
    /// The seen item if it is in progress.
    in_progress: Option<seen::Model>,
    /// The next episode/chapter of this media.
    next_entry: Option<UserMediaNextEntry>,
    /// The number of users who have seen this media.
    seen_by_all_count: usize,
    /// The number of times this user has seen this media.
    seen_by_user_count: usize,
    /// The average rating of this media in this service.
    average_rating: Option<Decimal>,
    /// The number of units of this media that were consumed.
    units_consumed: Option<i32>,
    /// The seen progress of this media if it is a show.
    show_progress: Option<Vec<UserMetadataDetailsShowSeasonProgress>>,
    /// The seen progress of this media if it is a podcast.
    podcast_progress: Option<Vec<UserMetadataDetailsEpisodeProgress>>,
    /// Whether this media has been interacted with
    has_interacted: bool,
}

#[derive(SimpleObject, Debug, Clone, Default)]
struct UserMediaNextEntry {
    season: Option<i32>,
    volume: Option<i32>,
    chapter: Option<i32>,
    episode: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct UpdateSeenItemInput {
    seen_id: String,
    started_on: Option<NaiveDate>,
    finished_on: Option<NaiveDate>,
    provider_watched_on: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone)]
struct PresignedPutUrlResponse {
    upload_url: String,
    key: String,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct CreateReviewCommentInput {
    /// The review this comment belongs to.
    review_id: String,
    comment_id: Option<String>,
    text: Option<String>,
    increment_likes: Option<bool>,
    decrement_likes: Option<bool>,
    should_delete: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone, Default)]
struct GraphqlCalendarEvent {
    date: NaiveDate,
    metadata_id: String,
    metadata_title: String,
    metadata_lot: MediaLot,
    calendar_event_id: String,
    episode_name: Option<String>,
    metadata_image: Option<String>,
    show_extra_information: Option<SeenShowExtraInformation>,
    podcast_extra_information: Option<SeenPodcastExtraInformation>,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone, Default)]
struct OidcTokenOutput {
    subject: String,
    email: String,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone, Default)]
struct UserCalendarEventInput {
    year: i32,
    month: u32,
}

#[derive(Debug, Serialize, Deserialize, OneofObject, Clone)]
enum UserUpcomingCalendarEventInput {
    /// The number of media to select
    NextMedia(u64),
    /// The number of days to select
    NextDays(u64),
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct PresignedPutUrlInput {
    file_name: String,
    prefix: String,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct PeopleSearchInput {
    search: SearchInput,
    source: MediaSource,
    source_specifics: Option<PersonSourceSpecifics>,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct MetadataGroupSearchInput {
    search: SearchInput,
    lot: MediaLot,
    source: MediaSource,
}

#[derive(Debug, Serialize, Deserialize, InputObject, Clone)]
struct MetadataSearchInput {
    search: SearchInput,
    lot: MediaLot,
    source: MediaSource,
}

#[derive(Debug, Serialize, Deserialize, SimpleObject, Clone, Default)]
struct GroupedCalendarEvent {
    events: Vec<GraphqlCalendarEvent>,
    date: NaiveDate,
}

fn get_password_hasher() -> Argon2<'static> {
    Argon2::default()
}

fn get_review_export_item(rev: ReviewItem) -> ImportOrExportItemRating {
    let (show_season_number, show_episode_number) = match rev.show_extra_information {
        Some(d) => (Some(d.season), Some(d.episode)),
        None => (None, None),
    };
    let podcast_episode_number = rev.podcast_extra_information.map(|d| d.episode);
    let anime_episode_number = rev.anime_extra_information.and_then(|d| d.episode);
    let manga_chapter_number = rev.manga_extra_information.and_then(|d| d.chapter);
    ImportOrExportItemRating {
        review: Some(ImportOrExportItemReview {
            visibility: Some(rev.visibility),
            date: Some(rev.posted_on),
            spoiler: Some(rev.is_spoiler),
            text: rev.text_original,
        }),
        rating: rev.rating,
        show_season_number,
        show_episode_number,
        podcast_episode_number,
        anime_episode_number,
        manga_chapter_number,
        comments: match rev.comments.is_empty() {
            true => None,
            false => Some(rev.comments),
        },
    }
}

fn empty_nonce_verifier(_nonce: Option<&Nonce>) -> Result<(), String> {
    Ok(())
}

#[derive(Debug, Clone)]
struct CustomService {}

impl MediaProviderLanguages for CustomService {
    fn supported_languages() -> Vec<String> {
        ["us"].into_iter().map(String::from).collect()
    }

    fn default_language() -> String {
        "us".to_owned()
    }
}

#[derive(Default)]
pub struct MiscellaneousQuery;

impl AuthProvider for MiscellaneousQuery {}

#[Object]
impl MiscellaneousQuery {
    /// Get some primary information about the service.
    async fn core_details(&self, gql_ctx: &Context<'_>) -> CoreDetails {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.core_details().await
    }

    /// Get all collections for the currently logged in user.
    async fn user_collections_list(
        &self,
        gql_ctx: &Context<'_>,
        name: Option<String>,
    ) -> Result<Vec<CollectionItem>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_collections_list(&user_id, name).await
    }

    /// Get the contents of a collection and respect visibility.
    async fn collection_contents(
        &self,
        gql_ctx: &Context<'_>,
        input: CollectionContentsInput,
    ) -> Result<CollectionContents> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.collection_contents(input).await
    }

    /// Get partial details about a media present in the database.
    async fn metadata_partial_details(
        &self,
        gql_ctx: &Context<'_>,
        metadata_id: String,
    ) -> Result<MetadataPartialDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.metadata_partial_details(&metadata_id).await
    }

    /// Get details about a media present in the database.
    async fn metadata_details(
        &self,
        gql_ctx: &Context<'_>,
        metadata_id: String,
    ) -> Result<GraphqlMetadataDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.metadata_details(&metadata_id).await
    }

    /// Get details about a creator present in the database.
    async fn person_details(
        &self,
        gql_ctx: &Context<'_>,
        person_id: String,
    ) -> Result<PersonDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.person_details(person_id).await
    }

    /// Get details about a genre present in the database.
    async fn genre_details(
        &self,
        gql_ctx: &Context<'_>,
        input: GenreDetailsInput,
    ) -> Result<GenreDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.genre_details(input).await
    }

    /// Get details about a metadata group present in the database.
    async fn metadata_group_details(
        &self,
        gql_ctx: &Context<'_>,
        metadata_group_id: String,
    ) -> Result<MetadataGroupDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.metadata_group_details(metadata_group_id).await
    }

    /// Get all the media items related to a user for a specific media type.
    async fn metadata_list(
        &self,
        gql_ctx: &Context<'_>,
        input: MetadataListInput,
    ) -> Result<SearchResults<String>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.metadata_list(user_id, input).await
    }

    /// Get a presigned URL (valid for 90 minutes) for a given key.
    async fn get_presigned_s3_url(&self, gql_ctx: &Context<'_>, key: String) -> String {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.file_storage_service.get_presigned_url(key).await
    }

    /// Search for a list of media for a given type.
    async fn metadata_search(
        &self,
        gql_ctx: &Context<'_>,
        input: MetadataSearchInput,
    ) -> Result<SearchResults<MetadataSearchItemResponse>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.metadata_search(&user_id, input).await
    }

    /// Get paginated list of genres.
    async fn genres_list(
        &self,
        gql_ctx: &Context<'_>,
        input: SearchInput,
    ) -> Result<SearchResults<GenreListItem>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.genres_list(input).await
    }

    /// Get paginated list of metadata groups.
    async fn metadata_groups_list(
        &self,
        gql_ctx: &Context<'_>,
        input: SearchInput,
    ) -> Result<SearchResults<String>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.metadata_groups_list(user_id, input).await
    }

    /// Get all languages supported by all the providers.
    async fn providers_language_information(
        &self,
        gql_ctx: &Context<'_>,
    ) -> Vec<ProviderLanguageInformation> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.providers_language_information()
    }

    /// Get a summary of all the media items that have been consumed by this user.
    async fn latest_user_summary(&self, gql_ctx: &Context<'_>) -> Result<user_summary::Model> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.latest_user_summary(&user_id).await
    }

    /// Get details that can be displayed to a user for a metadata group.
    async fn user_metadata_group_details(
        &self,
        gql_ctx: &Context<'_>,
        metadata_group_id: String,
    ) -> Result<UserMetadataGroupDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .user_metadata_group_details(user_id, metadata_group_id)
            .await
    }

    /// Get a user's preferences.
    async fn user_preferences(&self, gql_ctx: &Context<'_>) -> Result<UserPreferences> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_preferences(&user_id).await
    }

    /// Get details about all the users in the service.
    async fn users_list(
        &self,
        gql_ctx: &Context<'_>,
        query: Option<String>,
    ) -> Result<Vec<user::Model>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.users_list(query).await
    }

    /// Get details about the currently logged in user.
    async fn user_details(&self, gql_ctx: &Context<'_>) -> Result<UserDetailsResult> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let token = self.user_auth_token_from_ctx(gql_ctx)?;
        service.user_details(&token).await
    }

    /// Get all the integrations for the currently logged in user.
    async fn user_integrations(&self, gql_ctx: &Context<'_>) -> Result<Vec<integration::Model>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_integrations(&user_id).await
    }

    /// Get all the notification platforms for the currently logged in user.
    async fn user_notification_platforms(
        &self,
        gql_ctx: &Context<'_>,
    ) -> Result<Vec<notification_platform::Model>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_notification_platforms(&user_id).await
    }

    /// Get details that can be displayed to a user for a media.
    async fn user_metadata_details(
        &self,
        gql_ctx: &Context<'_>,
        metadata_id: String,
    ) -> Result<UserMetadataDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_metadata_details(user_id, metadata_id).await
    }

    /// Get details that can be displayed to a user for a creator.
    async fn user_person_details(
        &self,
        gql_ctx: &Context<'_>,
        person_id: String,
    ) -> Result<UserPersonDetails> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_person_details(user_id, person_id).await
    }

    /// Get calendar events for a user between a given date range.
    async fn user_calendar_events(
        &self,
        gql_ctx: &Context<'_>,
        input: UserCalendarEventInput,
    ) -> Result<Vec<GroupedCalendarEvent>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_calendar_events(user_id, input).await
    }

    /// Get upcoming calendar events for the given filter.
    async fn user_upcoming_calendar_events(
        &self,
        gql_ctx: &Context<'_>,
        input: UserUpcomingCalendarEventInput,
    ) -> Result<Vec<GraphqlCalendarEvent>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.user_upcoming_calendar_events(user_id, input).await
    }

    /// Get paginated list of people.
    async fn people_list(
        &self,
        gql_ctx: &Context<'_>,
        input: PeopleListInput,
    ) -> Result<SearchResults<String>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.people_list(user_id, input).await
    }

    /// Search for a list of people from a given source.
    async fn people_search(
        &self,
        gql_ctx: &Context<'_>,
        input: PeopleSearchInput,
    ) -> Result<SearchResults<PeopleSearchItem>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.people_search(&user_id, input).await
    }

    /// Search for a list of groups from a given source.
    async fn metadata_group_search(
        &self,
        gql_ctx: &Context<'_>,
        input: MetadataGroupSearchInput,
    ) -> Result<SearchResults<MetadataGroupSearchItem>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.metadata_group_search(&user_id, input).await
    }

    /// Get an authorization URL using the configured OIDC client.
    async fn get_oidc_redirect_url(&self, gql_ctx: &Context<'_>) -> Result<String> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.get_oidc_redirect_url().await
    }

    /// Get an access token using the configured OIDC client.
    async fn get_oidc_token(&self, gql_ctx: &Context<'_>, code: String) -> Result<OidcTokenOutput> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.get_oidc_token(code).await
    }

    /// Get user by OIDC issuer ID.
    async fn user_by_oidc_issuer_id(
        &self,
        gql_ctx: &Context<'_>,
        oidc_issuer_id: String,
    ) -> Result<Option<String>> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.user_by_oidc_issuer_id(oidc_issuer_id).await
    }
}

#[derive(Default)]
pub struct MiscellaneousMutation;

impl AuthProvider for MiscellaneousMutation {
    fn is_mutation(&self) -> bool {
        true
    }
}

#[Object]
impl MiscellaneousMutation {
    /// Create or update a review.
    async fn post_review(
        &self,
        gql_ctx: &Context<'_>,
        input: PostReviewInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.post_review(&user_id, input).await
    }

    /// Delete a review if it belongs to the currently logged in user.
    async fn delete_review(&self, gql_ctx: &Context<'_>, review_id: String) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.delete_review(user_id, review_id).await
    }

    /// Create a new collection for the logged in user or edit details of an existing one.
    async fn create_or_update_collection(
        &self,
        gql_ctx: &Context<'_>,
        input: CreateOrUpdateCollectionInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.create_or_update_collection(&user_id, input).await
    }

    /// Add a entity to a collection if it is not there, otherwise do nothing.
    async fn add_entity_to_collection(
        &self,
        gql_ctx: &Context<'_>,
        input: ChangeCollectionToEntityInput,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.add_entity_to_collection(&user_id, input).await
    }

    /// Remove an entity from a collection if it is not there, otherwise do nothing.
    async fn remove_entity_from_collection(
        &self,
        gql_ctx: &Context<'_>,
        input: ChangeCollectionToEntityInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.remove_entity_from_collection(&user_id, input).await
    }

    /// Delete a collection.
    async fn delete_collection(
        &self,
        gql_ctx: &Context<'_>,
        collection_name: String,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.delete_collection(user_id, &collection_name).await
    }

    /// Delete a seen item from a user's history.
    async fn delete_seen_item(
        &self,
        gql_ctx: &Context<'_>,
        seen_id: String,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.delete_seen_item(&user_id, seen_id).await
    }

    /// Create a custom media item.
    async fn create_custom_metadata(
        &self,
        gql_ctx: &Context<'_>,
        input: CreateCustomMetadataInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .create_custom_metadata(user_id, input)
            .await
            .map(|m| StringIdObject { id: m.id })
    }

    /// Deploy job to update progress of media items in bulk. For seen items in progress,
    /// progress is updated only if it has actually changed.
    async fn deploy_bulk_progress_update(
        &self,
        gql_ctx: &Context<'_>,
        input: Vec<ProgressUpdateInput>,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.deploy_bulk_progress_update(user_id, input).await
    }

    /// Deploy a job to update a media item's metadata.
    async fn deploy_update_metadata_job(
        &self,
        gql_ctx: &Context<'_>,
        metadata_id: String,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.deploy_update_metadata_job(&metadata_id, true).await
    }

    /// Deploy a job to update a person's metadata.
    async fn deploy_update_person_job(
        &self,
        gql_ctx: &Context<'_>,
        person_id: String,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.deploy_update_person_job(person_id).await
    }

    /// Merge a media item into another. This will move all `seen`, `collection`
    /// and `review` associations with to the metadata.
    async fn merge_metadata(
        &self,
        gql_ctx: &Context<'_>,
        merge_from: String,
        merge_into: String,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .merge_metadata(user_id, merge_from, merge_into)
            .await
    }

    /// Fetch details about a media and create a media item in the database.
    async fn commit_metadata(
        &self,
        gql_ctx: &Context<'_>,
        input: CommitMediaInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service
            .commit_metadata(input)
            .await
            .map(|m| StringIdObject { id: m.id })
    }

    /// Fetches details about a person and creates a person item in the database.
    async fn commit_person(
        &self,
        gql_ctx: &Context<'_>,
        input: CommitPersonInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.commit_person(input).await
    }

    /// Fetch details about a media group and create a media group item in the database.
    async fn commit_metadata_group(
        &self,
        gql_ctx: &Context<'_>,
        input: CommitMediaInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.commit_metadata_group(input).await
    }

    /// Create a new user for the service. Also set their `lot` as admin if
    /// they are the first user.
    async fn register_user(
        &self,
        gql_ctx: &Context<'_>,
        input: RegisterUserInput,
    ) -> Result<RegisterResult> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.register_user(input).await
    }

    /// Login a user using their username and password and return an auth token.
    async fn login_user(&self, gql_ctx: &Context<'_>, input: AuthUserInput) -> Result<LoginResult> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.login_user(input).await
    }

    /// Update a user's profile details.
    async fn update_user(
        &self,
        gql_ctx: &Context<'_>,
        input: UpdateUserInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await.ok();
        service.update_user(user_id, input).await
    }

    /// Change a user's preferences.
    async fn update_user_preference(
        &self,
        gql_ctx: &Context<'_>,
        input: UpdateUserPreferenceInput,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.update_user_preference(user_id, input).await
    }

    /// Create an integration for the currently logged in user.
    async fn create_user_integration(
        &self,
        gql_ctx: &Context<'_>,
        input: CreateUserIntegrationInput,
    ) -> Result<StringIdObject> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.create_user_integration(user_id, input).await
    }

    /// Update an integration for the currently logged in user.
    async fn update_user_integration(
        &self,
        gql_ctx: &Context<'_>,
        input: UpdateUserIntegrationInput,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.update_user_integration(user_id, input).await
    }

    /// Delete an integration for the currently logged in user.
    async fn delete_user_integration(
        &self,
        gql_ctx: &Context<'_>,
        integration_id: String,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .delete_user_integration(user_id, integration_id)
            .await
    }

    /// Add a notification platform for the currently logged in user.
    async fn create_user_notification_platform(
        &self,
        gql_ctx: &Context<'_>,
        input: CreateUserNotificationPlatformInput,
    ) -> Result<String> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .create_user_notification_platform(user_id, input)
            .await
    }

    /// Edit a notification platform for the currently logged in user.
    async fn update_user_notification_platform(
        &self,
        gql_ctx: &Context<'_>,
        input: UpdateUserNotificationPlatformInput,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .update_user_notification_platform(user_id, input)
            .await
    }

    /// Delete a notification platform for the currently logged in user.
    async fn delete_user_notification_platform(
        &self,
        gql_ctx: &Context<'_>,
        notification_id: String,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service
            .delete_user_notification_platform(user_id, notification_id)
            .await
    }

    /// Test all notification platforms for the currently logged in user.
    async fn test_user_notification_platforms(&self, gql_ctx: &Context<'_>) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.test_user_notification_platforms(&user_id).await
    }

    /// Delete a user. The account making the user must an `Admin`.
    async fn delete_user(&self, gql_ctx: &Context<'_>, to_delete_user_id: String) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.admin_account_guard(&user_id).await?;
        service.delete_user(to_delete_user_id).await
    }

    /// Get a presigned URL (valid for 10 minutes) for a given file name.
    async fn presigned_put_s3_url(
        &self,
        gql_ctx: &Context<'_>,
        input: PresignedPutUrlInput,
    ) -> Result<PresignedPutUrlResponse> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let (key, upload_url) = service
            .file_storage_service
            .get_presigned_put_url(input.file_name, input.prefix, true, None)
            .await;
        Ok(PresignedPutUrlResponse { upload_url, key })
    }

    /// Delete an S3 object by the given key.
    async fn delete_s3_object(&self, gql_ctx: &Context<'_>, key: String) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let resp = service.file_storage_service.delete_object(key).await;
        Ok(resp)
    }

    /// Generate an auth token without any expiry.
    async fn generate_auth_token(&self, gql_ctx: &Context<'_>) -> Result<String> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.generate_auth_token(user_id).await
    }

    /// Create, like or delete a comment on a review.
    async fn create_review_comment(
        &self,
        gql_ctx: &Context<'_>,
        input: CreateReviewCommentInput,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.create_review_comment(user_id, input).await
    }

    /// Update the start/end date of a seen item.
    async fn update_seen_item(
        &self,
        gql_ctx: &Context<'_>,
        input: UpdateSeenItemInput,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.update_seen_item(user_id, input).await
    }

    /// Start a background job.
    async fn deploy_background_job(
        &self,
        gql_ctx: &Context<'_>,
        job_name: BackgroundJob,
    ) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        let user_id = self.user_id_from_ctx(gql_ctx).await?;
        service.deploy_background_job(&user_id, job_name).await
    }

    /// Use this mutation to call a function that needs to be tested for implementation.
    /// It is only available in development mode.
    #[cfg(debug_assertions)]
    async fn development_mutation(&self, gql_ctx: &Context<'_>) -> Result<bool> {
        let service = gql_ctx.data_unchecked::<Arc<MiscellaneousService>>();
        service.development_mutation().await
    }
}

pub struct MiscellaneousService {
    pub db: DatabaseConnection,
    pub perform_application_job: MemoryStorage<ApplicationJob>,
    pub perform_core_application_job: MemoryStorage<CoreApplicationJob>,
    timezone: Arc<chrono_tz::Tz>,
    file_storage_service: Arc<FileStorageService>,
    config: Arc<config::AppConfig>,
    oidc_client: Arc<Option<CoreClient>>,
    seen_progress_cache: DiskCache<ProgressUpdateCache, ()>,
}

impl MiscellaneousService {
    pub async fn new(
        db: &DatabaseConnection,
        config: Arc<config::AppConfig>,
        file_storage_service: Arc<FileStorageService>,
        perform_application_job: &MemoryStorage<ApplicationJob>,
        perform_core_application_job: &MemoryStorage<CoreApplicationJob>,
        timezone: Arc<chrono_tz::Tz>,
        oidc_client: Arc<Option<CoreClient>>,
    ) -> Self {
        let cache_name = "seen_progress_cache";
        let path = PathBuf::new().join(TEMP_DIR);
        let seen_progress_cache = DiskCache::new(cache_name)
            .set_lifespan(
                ChronoDuration::try_hours(config.server.progress_update_threshold)
                    .unwrap()
                    .num_seconds()
                    .try_into()
                    .unwrap(),
            )
            .set_disk_directory(path)
            .build()
            .unwrap();

        Self {
            db: db.clone(),
            config,
            timezone,
            file_storage_service,
            perform_application_job: perform_application_job.clone(),
            perform_core_application_job: perform_core_application_job.clone(),
            oidc_client,
            seen_progress_cache,
        }
    }
}

type EntityBeingMonitoredByMap = HashMap<String, Vec<String>>;

impl MiscellaneousService {
    async fn core_details(&self) -> CoreDetails {
        let mut files_enabled = self.config.file_storage.is_enabled();
        if files_enabled && !self.file_storage_service.is_enabled().await {
            files_enabled = false;
        }
        CoreDetails {
            is_pro: false,
            version: VERSION.to_owned(),
            author_name: AUTHOR.to_owned(),
            file_storage_enabled: files_enabled,
            oidc_enabled: self.oidc_client.is_some(),
            page_limit: self.config.frontend.page_size,
            docs_link: "https://docs.ryot.io".to_owned(),
            backend_errors: BackendError::iter().collect(),
            smtp_enabled: self.config.server.smtp.is_enabled(),
            website_url: "https://ryot.io".to_owned(),
            signup_allowed: self.config.users.allow_registration,
            local_auth_disabled: self.config.users.disable_local_auth,
            token_valid_for_days: self.config.users.token_valid_for_days,
            repository_link: "https://github.com/ignisda/ryot".to_owned(),
        }
    }

    fn get_integration_service(&self) -> IntegrationService {
        IntegrationService::new(&self.db)
    }

    async fn metadata_assets(&self, meta: &metadata::Model) -> Result<GraphqlMediaAssets> {
        let images = meta.images.as_urls(&self.file_storage_service).await;
        let mut videos = vec![];
        if let Some(vids) = &meta.videos {
            for v in vids.clone() {
                let url = self
                    .file_storage_service
                    .get_stored_asset(v.identifier)
                    .await;
                videos.push(GraphqlVideoAsset {
                    source: v.source,
                    video_id: url,
                })
            }
        }
        Ok(GraphqlMediaAssets { images, videos })
    }

    async fn generic_metadata(&self, metadata_id: &String) -> Result<MetadataBaseData> {
        let mut meta = match Metadata::find_by_id(metadata_id)
            .one(&self.db)
            .await
            .unwrap()
        {
            Some(m) => m,
            None => return Err(Error::new("The record does not exist".to_owned())),
        };
        let genres = meta
            .find_related(Genre)
            .order_by_asc(genre::Column::Name)
            .into_model::<GenreListItem>()
            .all(&self.db)
            .await
            .unwrap();
        #[derive(Debug, FromQueryResult)]
        struct PartialCreator {
            id: String,
            name: String,
            images: Option<Vec<MetadataImage>>,
            role: String,
            character: Option<String>,
        }
        let crts = MetadataToPerson::find()
            .expr(Expr::col(Asterisk))
            .filter(metadata_to_person::Column::MetadataId.eq(&meta.id))
            .join(
                JoinType::Join,
                metadata_to_person::Relation::Person
                    .def()
                    .on_condition(|left, right| {
                        Condition::all().add(
                            Expr::col((left, metadata_to_person::Column::PersonId))
                                .equals((right, person::Column::Id)),
                        )
                    }),
            )
            .order_by_asc(metadata_to_person::Column::Index)
            .into_model::<PartialCreator>()
            .all(&self.db)
            .await?;
        let mut creators: HashMap<String, Vec<_>> = HashMap::new();
        for cr in crts {
            let image = cr.images.first_as_url(&self.file_storage_service).await;
            let creator = MetadataCreator {
                image,
                name: cr.name,
                id: Some(cr.id),
                character: cr.character,
            };
            creators
                .entry(cr.role)
                .and_modify(|e| {
                    e.push(creator.clone());
                })
                .or_insert(vec![creator.clone()]);
        }
        if let Some(free_creators) = &meta.free_creators {
            for cr in free_creators.clone() {
                let creator = MetadataCreator {
                    id: None,
                    name: cr.name,
                    image: cr.image,
                    character: None,
                };
                creators
                    .entry(cr.role)
                    .and_modify(|e| {
                        e.push(creator.clone());
                    })
                    .or_insert(vec![creator.clone()]);
            }
        }
        if let Some(ref mut d) = meta.description {
            *d = markdown_to_html_opts(
                d,
                &Options {
                    compile: CompileOptions {
                        allow_dangerous_html: true,
                        allow_dangerous_protocol: true,
                        ..CompileOptions::default()
                    },
                    ..Options::default()
                },
            )
            .unwrap();
        }
        let creators = creators
            .into_iter()
            .sorted_by(|(k1, _), (k2, _)| k1.cmp(k2))
            .map(|(name, items)| MetadataCreatorGroupedByRole { name, items })
            .collect_vec();
        let suggestions = MetadataToMetadata::find()
            .select_only()
            .column(metadata_to_metadata::Column::ToMetadataId)
            .filter(metadata_to_metadata::Column::FromMetadataId.eq(&meta.id))
            .filter(
                metadata_to_metadata::Column::Relation.eq(MetadataToMetadataRelation::Suggestion),
            )
            .into_tuple::<String>()
            .all(&self.db)
            .await?;
        let assets = self.metadata_assets(&meta).await.unwrap();
        Ok(MetadataBaseData {
            model: meta,
            creators,
            assets,
            genres,
            suggestions,
        })
    }

    async fn metadata_partial_details(
        &self,
        metadata_id: &String,
    ) -> Result<MetadataPartialDetails> {
        let mut metadata = Metadata::find_by_id(metadata_id)
            .select_only()
            .columns([
                metadata::Column::Id,
                metadata::Column::Lot,
                metadata::Column::Title,
                metadata::Column::Images,
                metadata::Column::PublishYear,
            ])
            .into_model::<MetadataPartialDetails>()
            .one(&self.db)
            .await
            .unwrap()
            .unwrap();
        metadata.image = metadata
            .images
            .first_as_url(&self.file_storage_service)
            .await;
        Ok(metadata)
    }

    async fn metadata_details(&self, metadata_id: &String) -> Result<GraphqlMetadataDetails> {
        let MetadataBaseData {
            model,
            creators,
            assets,
            genres,
            suggestions,
        } = self.generic_metadata(metadata_id).await?;
        if model.is_partial.unwrap_or_default() {
            self.deploy_update_metadata_job(metadata_id, true).await?;
        }
        let slug = slug::slugify(&model.title);
        let identifier = &model.identifier;
        let source_url = match model.source {
            MediaSource::Custom => None,
            // DEV: This is updated by the specifics
            MediaSource::MangaUpdates => None,
            MediaSource::Itunes => Some(format!(
                "https://podcasts.apple.com/us/podcast/{slug}/id{identifier}"
            )),
            MediaSource::GoogleBooks => Some(format!(
                "https://www.google.co.in/books/edition/{slug}/{identifier}"
            )),
            MediaSource::Audible => Some(format!("https://www.audible.com/pd/{slug}/{identifier}")),
            MediaSource::Openlibrary => {
                Some(format!("https://openlibrary.org/works/{identifier}/{slug}"))
            }
            MediaSource::Tmdb => {
                let bw = match model.lot {
                    MediaLot::Movie => "movie",
                    MediaLot::Show => "tv",
                    _ => unreachable!(),
                };
                Some(format!(
                    "https://www.themoviedb.org/{bw}/{identifier}-{slug}"
                ))
            }
            MediaSource::Listennotes => Some(format!(
                "https://www.listennotes.com/podcasts/{slug}-{identifier}"
            )),
            MediaSource::Igdb => Some(format!("https://www.igdb.com/games/{slug}")),
            MediaSource::Anilist => {
                let bw = match model.lot {
                    MediaLot::Anime => "anime",
                    MediaLot::Manga => "manga",
                    _ => unreachable!(),
                };
                Some(format!("https://anilist.co/{bw}/{identifier}/{slug}"))
            }
            MediaSource::Mal => {
                let bw = match model.lot {
                    MediaLot::Anime => "anime",
                    MediaLot::Manga => "manga",
                    _ => unreachable!(),
                };
                Some(format!("https://myanimelist.net/{bw}/{identifier}/{slug}"))
            }
            MediaSource::Vndb => Some(format!("https://vndb.org/{identifier}")),
        };

        let group = {
            let association = MetadataToMetadataGroup::find()
                .filter(metadata_to_metadata_group::Column::MetadataId.eq(metadata_id))
                .one(&self.db)
                .await?;
            match association {
                None => None,
                Some(a) => {
                    let grp = a.find_related(MetadataGroup).one(&self.db).await?.unwrap();
                    Some(GraphqlMetadataGroup {
                        id: grp.id,
                        name: grp.title,
                        part: a.part,
                    })
                }
            }
        };
        let watch_providers = model.watch_providers.unwrap_or_default();

        let resp = GraphqlMetadataDetails {
            id: model.id,
            lot: model.lot,
            title: model.title,
            source: model.source,
            is_nsfw: model.is_nsfw,
            is_partial: model.is_partial,
            identifier: model.identifier,
            description: model.description,
            publish_date: model.publish_date,
            publish_year: model.publish_year,
            provider_rating: model.provider_rating,
            production_status: model.production_status,
            original_language: model.original_language,
            book_specifics: model.book_specifics,
            show_specifics: model.show_specifics,
            movie_specifics: model.movie_specifics,
            manga_specifics: model.manga_specifics,
            anime_specifics: model.anime_specifics,
            podcast_specifics: model.podcast_specifics,
            video_game_specifics: model.video_game_specifics,
            audio_book_specifics: model.audio_book_specifics,
            visual_novel_specifics: model.visual_novel_specifics,
            group,
            assets,
            genres,
            creators,
            source_url,
            suggestions,
            watch_providers,
        };
        Ok(resp)
    }

    async fn user_metadata_details(
        &self,
        user_id: String,
        metadata_id: String,
    ) -> Result<UserMetadataDetails> {
        let media_details = self.generic_metadata(&metadata_id).await?;
        let collections = entity_in_collections(
            &self.db,
            &user_id,
            Some(metadata_id.clone()),
            None,
            None,
            None,
            None,
        )
        .await?;
        let reviews = self
            .item_reviews(&user_id, Some(metadata_id.clone()), None, None, None)
            .await?;
        let (_, history) = self
            .is_metadata_finished_by_user(&user_id, &media_details)
            .await?;
        let in_progress = history
            .iter()
            .find(|h| h.state == SeenState::InProgress || h.state == SeenState::OnAHold)
            .cloned();
        let next_entry = history.first().and_then(|h| {
            if let Some(s) = &media_details.model.show_specifics {
                let all_episodes = s
                    .seasons
                    .iter()
                    .map(|s| (s.season_number, &s.episodes))
                    .collect_vec()
                    .into_iter()
                    .flat_map(|(s, e)| {
                        e.iter().map(move |e| UserMediaNextEntry {
                            season: Some(s),
                            episode: Some(e.episode_number),
                            ..Default::default()
                        })
                    })
                    .collect_vec();
                let next = all_episodes.iter().position(|e| {
                    e.season == Some(h.show_extra_information.as_ref().unwrap().season)
                        && e.episode == Some(h.show_extra_information.as_ref().unwrap().episode)
                });
                Some(all_episodes.get(next? + 1)?.clone())
            } else if let Some(p) = &media_details.model.podcast_specifics {
                let all_episodes = p
                    .episodes
                    .iter()
                    .map(|e| UserMediaNextEntry {
                        episode: Some(e.number),
                        ..Default::default()
                    })
                    .collect_vec();
                let next = all_episodes.iter().position(|e| {
                    e.episode == Some(h.podcast_extra_information.as_ref().unwrap().episode)
                });
                Some(all_episodes.get(next? + 1)?.clone())
            } else if let Some(_anime_spec) = &media_details.model.anime_specifics {
                h.anime_extra_information.as_ref().and_then(|hist| {
                    hist.episode.map(|e| UserMediaNextEntry {
                        episode: Some(e + 1),
                        ..Default::default()
                    })
                })
            } else if let Some(_manga_spec) = &media_details.model.manga_specifics {
                h.manga_extra_information.as_ref().and_then(|hist| {
                    hist.chapter
                        .map(|e| UserMediaNextEntry {
                            chapter: Some(e + 1),
                            ..Default::default()
                        })
                        .or(hist.volume.map(|e| UserMediaNextEntry {
                            volume: Some(e + 1),
                            ..Default::default()
                        }))
                })
            } else {
                None
            }
        });
        let metadata_alias = Alias::new("m");
        let seen_alias = Alias::new("s");
        let seen_select = Query::select()
            .expr_as(
                Expr::col((metadata_alias.clone(), AliasedMetadata::Id)),
                Alias::new("metadata_id"),
            )
            .expr_as(
                Func::count(Expr::col((seen_alias.clone(), AliasedSeen::MetadataId))),
                Alias::new("num_times_seen"),
            )
            .from_as(AliasedMetadata::Table, metadata_alias.clone())
            .join_as(
                JoinType::LeftJoin,
                AliasedSeen::Table,
                seen_alias.clone(),
                Expr::col((metadata_alias.clone(), AliasedMetadata::Id))
                    .equals((seen_alias.clone(), AliasedSeen::MetadataId)),
            )
            .and_where(Expr::col((metadata_alias.clone(), AliasedMetadata::Id)).eq(&metadata_id))
            .group_by_col((metadata_alias.clone(), AliasedMetadata::Id))
            .to_owned();
        let stmt = self.get_db_stmt(seen_select);
        let seen_by = self
            .db
            .query_one(stmt)
            .await?
            .map(|qr| qr.try_get_by_index::<i64>(1).unwrap())
            .unwrap();
        let seen_by: usize = seen_by.try_into().unwrap();
        let user_to_meta =
            get_user_to_entity_association(&user_id, Some(metadata_id), None, None, None, &self.db)
                .await;
        let units_consumed = user_to_meta.clone().and_then(|n| n.metadata_units_consumed);
        let average_rating = if reviews.is_empty() {
            None
        } else {
            let total_rating = reviews.iter().flat_map(|r| r.rating).collect_vec();
            let sum = total_rating.iter().sum::<Decimal>();
            if sum == dec!(0) {
                None
            } else {
                Some(sum / Decimal::from(total_rating.iter().len()))
            }
        };
        let seen_by_user_count = history.len();
        let show_progress = if let Some(show_specifics) = media_details.model.show_specifics {
            let mut seasons = vec![];
            for season in show_specifics.seasons {
                let mut episodes = vec![];
                for episode in season.episodes {
                    let seen = history
                        .iter()
                        .filter(|h| {
                            h.show_extra_information.as_ref().map_or(false, |s| {
                                s.season == season.season_number
                                    && s.episode == episode.episode_number
                            })
                        })
                        .collect_vec();
                    episodes.push(UserMetadataDetailsEpisodeProgress {
                        episode_number: episode.episode_number,
                        times_seen: seen.len(),
                    })
                }
                let times_season_seen = episodes
                    .iter()
                    .map(|e| e.times_seen)
                    .min()
                    .unwrap_or_default();
                seasons.push(UserMetadataDetailsShowSeasonProgress {
                    episodes,
                    times_seen: times_season_seen,
                    season_number: season.season_number,
                })
            }
            Some(seasons)
        } else {
            None
        };
        let podcast_progress =
            if let Some(podcast_specifics) = media_details.model.podcast_specifics {
                let mut episodes = vec![];
                for episode in podcast_specifics.episodes {
                    let seen = history
                        .iter()
                        .filter(|h| {
                            h.podcast_extra_information
                                .as_ref()
                                .map_or(false, |s| s.episode == episode.number)
                        })
                        .collect_vec();
                    episodes.push(UserMetadataDetailsEpisodeProgress {
                        episode_number: episode.number,
                        times_seen: seen.len(),
                    })
                }
                Some(episodes)
            } else {
                None
            };
        Ok(UserMetadataDetails {
            reviews,
            history,
            next_entry,
            collections,
            in_progress,
            show_progress,
            average_rating,
            units_consumed,
            podcast_progress,
            seen_by_user_count,
            seen_by_all_count: seen_by,
            has_interacted: user_to_meta.is_some(),
            media_reason: user_to_meta.and_then(|n| n.media_reason),
        })
    }

    async fn user_person_details(
        &self,
        user_id: String,
        person_id: String,
    ) -> Result<UserPersonDetails> {
        let reviews = self
            .item_reviews(&user_id, None, Some(person_id.clone()), None, None)
            .await?;
        let collections =
            entity_in_collections(&self.db, &user_id, None, Some(person_id), None, None, None)
                .await?;
        Ok(UserPersonDetails {
            reviews,
            collections,
        })
    }

    async fn user_metadata_group_details(
        &self,
        user_id: String,
        metadata_group_id: String,
    ) -> Result<UserMetadataGroupDetails> {
        let collections = entity_in_collections(
            &self.db,
            &user_id,
            None,
            None,
            Some(metadata_group_id.clone()),
            None,
            None,
        )
        .await?;
        let reviews = self
            .item_reviews(&user_id, None, None, Some(metadata_group_id), None)
            .await?;
        Ok(UserMetadataGroupDetails {
            reviews,
            collections,
        })
    }

    async fn get_calendar_events(
        &self,
        user_id: String,
        only_monitored: bool,
        start_date: Option<NaiveDate>,
        end_date: Option<NaiveDate>,
        media_limit: Option<u64>,
    ) -> Result<Vec<GraphqlCalendarEvent>> {
        #[derive(Debug, FromQueryResult, Clone)]
        struct CalEvent {
            id: String,
            m_lot: MediaLot,
            date: NaiveDate,
            m_title: String,
            metadata_id: String,
            m_images: Option<Vec<MetadataImage>>,
            m_show_specifics: Option<ShowSpecifics>,
            m_podcast_specifics: Option<PodcastSpecifics>,
            metadata_show_extra_information: Option<SeenShowExtraInformation>,
            metadata_podcast_extra_information: Option<SeenPodcastExtraInformation>,
        }
        let all_events = CalendarEvent::find()
            .column_as(
                Expr::col((AliasedMetadata::Table, AliasedMetadata::Lot)),
                "m_lot",
            )
            .column_as(
                Expr::col((AliasedMetadata::Table, AliasedMetadata::Title)),
                "m_title",
            )
            .column_as(
                Expr::col((AliasedMetadata::Table, AliasedMetadata::Images)),
                "m_images",
            )
            .column_as(
                Expr::col((AliasedMetadata::Table, AliasedMetadata::ShowSpecifics)),
                "m_show_specifics",
            )
            .column_as(
                Expr::col((AliasedMetadata::Table, AliasedMetadata::PodcastSpecifics)),
                "m_podcast_specifics",
            )
            .filter(
                Expr::col((AliasedUserToEntity::Table, AliasedUserToEntity::UserId)).eq(user_id),
            )
            .inner_join(Metadata)
            .join_rev(
                JoinType::Join,
                UserToEntity::belongs_to(CalendarEvent)
                    .from(user_to_entity::Column::MetadataId)
                    .to(calendar_event::Column::MetadataId)
                    .on_condition(move |left, _right| {
                        Condition::all().add_option(match only_monitored {
                            true => Some(Expr::val(UserToMediaReason::Monitoring.to_string()).eq(
                                PgFunc::any(Expr::col((left, user_to_entity::Column::MediaReason))),
                            )),
                            false => None,
                        })
                    })
                    .into(),
            )
            .order_by_asc(calendar_event::Column::Date)
            .apply_if(end_date, |q, v| {
                q.filter(calendar_event::Column::Date.gte(v))
            })
            .apply_if(start_date, |q, v| {
                q.filter(calendar_event::Column::Date.lte(v))
            })
            .limit(media_limit)
            .into_model::<CalEvent>()
            .all(&self.db)
            .await?;
        let mut events = vec![];
        for evt in all_events {
            let mut calc = GraphqlCalendarEvent {
                calendar_event_id: evt.id,
                date: evt.date,
                metadata_id: evt.metadata_id,
                metadata_title: evt.m_title,
                metadata_lot: evt.m_lot,
                ..Default::default()
            };
            let mut image = None;
            let mut title = None;

            if let Some(s) = evt.metadata_show_extra_information {
                if let Some(sh) = evt.m_show_specifics {
                    if let Some((_, ep)) = sh.get_episode(s.season, s.episode) {
                        image = ep.poster_images.first().cloned();
                        title = Some(ep.name.clone());
                    }
                }
                calc.show_extra_information = Some(s);
            } else if let Some(p) = evt.metadata_podcast_extra_information {
                if let Some(po) = evt.m_podcast_specifics {
                    if let Some(ep) = po.episode_by_number(p.episode) {
                        image = ep.thumbnail.clone();
                        title = Some(ep.title.clone());
                    }
                };
                calc.podcast_extra_information = Some(p);
            };

            if image.is_none() {
                image = evt.m_images.first_as_url(&self.file_storage_service).await
            }
            calc.metadata_image = image;
            calc.episode_name = title;
            events.push(calc);
        }
        Ok(events)
    }

    async fn user_calendar_events(
        &self,
        user_id: String,
        input: UserCalendarEventInput,
    ) -> Result<Vec<GroupedCalendarEvent>> {
        let (end_date, start_date) = get_first_and_last_day_of_month(input.year, input.month);
        let events = self
            .get_calendar_events(user_id, false, Some(start_date), Some(end_date), None)
            .await?;
        let grouped_events = events
            .into_iter()
            .chunk_by(|event| event.date)
            .into_iter()
            .map(|(date, events)| GroupedCalendarEvent {
                date,
                events: events.collect(),
            })
            .collect();
        Ok(grouped_events)
    }

    async fn user_upcoming_calendar_events(
        &self,
        user_id: String,
        input: UserUpcomingCalendarEventInput,
    ) -> Result<Vec<GraphqlCalendarEvent>> {
        let from_date = Utc::now().date_naive();
        let (media_limit, to_date) = match input {
            UserUpcomingCalendarEventInput::NextMedia(l) => (Some(l), None),
            UserUpcomingCalendarEventInput::NextDays(d) => {
                (None, from_date.checked_add_days(Days::new(d)))
            }
        };
        let events = self
            .get_calendar_events(user_id, true, to_date, Some(from_date), media_limit)
            .await?;
        Ok(events)
    }

    async fn seen_history(
        &self,
        user_id: &String,
        metadata_id: &String,
    ) -> Result<Vec<seen::Model>> {
        let seen_items = Seen::find()
            .filter(seen::Column::UserId.eq(user_id))
            .filter(seen::Column::MetadataId.eq(metadata_id))
            .order_by_desc(seen::Column::LastUpdatedOn)
            .all(&self.db)
            .await
            .unwrap();
        Ok(seen_items)
    }

    async fn metadata_list(
        &self,
        user_id: String,
        input: MetadataListInput,
    ) -> Result<SearchResults<String>> {
        let avg_rating_col = "average_rating";
        let cloned_user_id_1 = user_id.clone();
        let cloned_user_id_2 = user_id.clone();
        #[derive(Debug, FromQueryResult)]
        struct InnerMediaSearchItem {
            id: String,
        }

        let order_by = input
            .sort
            .clone()
            .map(|a| Order::from(a.order))
            .unwrap_or(Order::Asc);

        let select = Metadata::find()
            .select_only()
            .column(metadata::Column::Id)
            .group_by(metadata::Column::Id)
            .group_by(user_to_entity::Column::MediaReason)
            .filter(user_to_entity::Column::UserId.eq(&user_id))
            .apply_if(input.lot, |query, v| {
                query.filter(metadata::Column::Lot.eq(v))
            })
            .inner_join(UserToEntity)
            .join(
                JoinType::LeftJoin,
                metadata::Relation::Review
                    .def()
                    .on_condition(move |_left, right| {
                        Condition::all().add(
                            Expr::col((right, review::Column::UserId)).eq(cloned_user_id_1.clone()),
                        )
                    }),
            )
            .join(
                JoinType::LeftJoin,
                metadata::Relation::Seen
                    .def()
                    .on_condition(move |_left, right| {
                        Condition::all().add(
                            Expr::col((right, seen::Column::UserId)).eq(cloned_user_id_2.clone()),
                        )
                    }),
            )
            .apply_if(input.search.query.clone(), |query, v| {
                query.filter(
                    Cond::any()
                        .add(Expr::col(metadata::Column::Title).ilike(ilike_sql(&v)))
                        .add(Expr::col(metadata::Column::Description).ilike(ilike_sql(&v))),
                )
            })
            .apply_if(
                input.filter.clone().and_then(|f| f.collection),
                |query, v| {
                    query
                        .inner_join(CollectionToEntity)
                        .filter(collection_to_entity::Column::CollectionId.eq(v))
                },
            )
            .apply_if(input.filter.and_then(|f| f.general), |query, v| match v {
                MediaGeneralFilter::All => query.filter(metadata::Column::Id.is_not_null()),
                MediaGeneralFilter::Rated => query.filter(review::Column::Id.is_not_null()),
                MediaGeneralFilter::Unrated => query.filter(review::Column::Id.is_null()),
                MediaGeneralFilter::Unfinished => query.filter(
                    Expr::expr(
                        Expr::val(UserToMediaReason::Finished.to_string())
                            .eq(PgFunc::any(Expr::col(user_to_entity::Column::MediaReason))),
                    )
                    .not(),
                ),
                s => query.filter(seen::Column::State.eq(match s {
                    MediaGeneralFilter::Dropped => SeenState::Dropped,
                    MediaGeneralFilter::OnAHold => SeenState::OnAHold,
                    _ => unreachable!(),
                })),
            })
            .apply_if(input.sort.map(|s| s.by), |query, v| match v {
                MediaSortBy::LastUpdated => query
                    .order_by(user_to_entity::Column::LastUpdatedOn, order_by)
                    .group_by(user_to_entity::Column::LastUpdatedOn),
                MediaSortBy::Title => query.order_by(metadata::Column::Title, order_by),
                MediaSortBy::ReleaseDate => query.order_by_with_nulls(
                    metadata::Column::PublishYear,
                    order_by,
                    NullOrdering::Last,
                ),
                MediaSortBy::Rating => query.order_by_with_nulls(
                    Expr::col(Alias::new(avg_rating_col)),
                    order_by,
                    NullOrdering::Last,
                ),
                MediaSortBy::LastSeen => query.order_by_with_nulls(
                    seen::Column::FinishedOn.max(),
                    order_by,
                    NullOrdering::Last,
                ),
            });
        let total: i32 = select.clone().count(&self.db).await?.try_into().unwrap();

        let items = select
            .limit(self.config.frontend.page_size as u64)
            .offset(((input.search.page.unwrap() - 1) * self.config.frontend.page_size) as u64)
            .into_model::<InnerMediaSearchItem>()
            .all(&self.db)
            .await?
            .into_iter()
            .map(|m| m.id)
            .collect_vec();

        let next_page =
            if total - ((input.search.page.unwrap()) * self.config.frontend.page_size) > 0 {
                Some(input.search.page.unwrap() + 1)
            } else {
                None
            };
        Ok(SearchResults {
            details: SearchDetails { next_page, total },
            items,
        })
    }

    pub async fn progress_update(
        &self,
        input: ProgressUpdateInput,
        user_id: &String,
        // update only if media has not been consumed for this user in the last `n` duration
        respect_cache: bool,
    ) -> Result<ProgressUpdateResultUnion> {
        let cache = ProgressUpdateCache {
            user_id: user_id.to_owned(),
            metadata_id: input.metadata_id.clone(),
            show_season_number: input.show_season_number,
            show_episode_number: input.show_episode_number,
            podcast_episode_number: input.podcast_episode_number,
            anime_episode_number: input.anime_episode_number,
            manga_chapter_number: input.manga_chapter_number,
        };
        let in_cache = self.seen_progress_cache.cache_get(&cache).unwrap();
        if respect_cache && in_cache.is_some() {
            return Ok(ProgressUpdateResultUnion::Error(ProgressUpdateError {
                error: ProgressUpdateErrorVariant::AlreadySeen,
            }));
        }
        tracing::debug!("Input for progress_update = {:?}", input);

        let all_prev_seen = Seen::find()
            .filter(seen::Column::Progress.lt(100))
            .filter(seen::Column::UserId.eq(user_id))
            .filter(seen::Column::State.ne(SeenState::Dropped))
            .filter(seen::Column::MetadataId.eq(&input.metadata_id))
            .order_by_desc(seen::Column::LastUpdatedOn)
            .all(&self.db)
            .await
            .unwrap();
        #[derive(Debug, Serialize, Deserialize, Enum, Clone, PartialEq, Eq, Copy)]
        enum ProgressUpdateAction {
            Update,
            Now,
            InThePast,
            JustStarted,
            ChangeState,
        }
        let action = match input.change_state {
            None => match input.progress {
                None => ProgressUpdateAction::ChangeState,
                Some(p) => {
                    if p == dec!(100) {
                        match input.date {
                            None => ProgressUpdateAction::InThePast,
                            Some(u) => {
                                if get_current_date(&self.timezone) == u {
                                    if all_prev_seen.is_empty() {
                                        ProgressUpdateAction::Now
                                    } else {
                                        ProgressUpdateAction::Update
                                    }
                                } else {
                                    ProgressUpdateAction::InThePast
                                }
                            }
                        }
                    } else if all_prev_seen.is_empty() {
                        ProgressUpdateAction::JustStarted
                    } else {
                        ProgressUpdateAction::Update
                    }
                }
            },
            Some(_) => ProgressUpdateAction::ChangeState,
        };
        tracing::debug!("Progress update action = {:?}", action);
        let err = || {
            Ok(ProgressUpdateResultUnion::Error(ProgressUpdateError {
                error: ProgressUpdateErrorVariant::NoSeenInProgress,
            }))
        };
        let seen = match action {
            ProgressUpdateAction::Update => {
                let prev_seen = all_prev_seen[0].clone();
                let progress = input.progress.unwrap();
                let watched_on = prev_seen.provider_watched_on.clone();
                if prev_seen.progress == progress && watched_on == input.provider_watched_on {
                    return Ok(ProgressUpdateResultUnion::Error(ProgressUpdateError {
                        error: ProgressUpdateErrorVariant::UpdateWithoutProgressUpdate,
                    }));
                }
                let mut updated_at = prev_seen.updated_at.clone();
                let now = Utc::now();
                if prev_seen.progress != progress {
                    updated_at.push(now);
                }
                let mut last_seen: seen::ActiveModel = prev_seen.into();
                last_seen.state = ActiveValue::Set(SeenState::InProgress);
                last_seen.progress = ActiveValue::Set(progress);
                last_seen.updated_at = ActiveValue::Set(updated_at);
                last_seen.provider_watched_on =
                    ActiveValue::Set(input.provider_watched_on.or(watched_on));
                if progress == dec!(100) {
                    last_seen.finished_on = ActiveValue::Set(Some(now.date_naive()));
                }
                last_seen.update(&self.db).await.unwrap()
            }
            ProgressUpdateAction::ChangeState => {
                let new_state = input.change_state.unwrap_or(SeenState::Dropped);
                let last_seen = Seen::find()
                    .filter(seen::Column::UserId.eq(user_id))
                    .filter(seen::Column::MetadataId.eq(input.metadata_id))
                    .order_by_desc(seen::Column::LastUpdatedOn)
                    .one(&self.db)
                    .await
                    .unwrap();
                match last_seen {
                    Some(ls) => {
                        let watched_on = ls.provider_watched_on.clone();
                        let mut updated_at = ls.updated_at.clone();
                        let now = Utc::now();
                        updated_at.push(now);
                        let mut last_seen: seen::ActiveModel = ls.into();
                        last_seen.state = ActiveValue::Set(new_state);
                        last_seen.updated_at = ActiveValue::Set(updated_at);
                        last_seen.provider_watched_on =
                            ActiveValue::Set(input.provider_watched_on.or(watched_on));
                        last_seen.update(&self.db).await.unwrap()
                    }
                    None => {
                        return err();
                    }
                }
            }
            ProgressUpdateAction::Now
            | ProgressUpdateAction::InThePast
            | ProgressUpdateAction::JustStarted => {
                let meta = Metadata::find_by_id(&input.metadata_id)
                    .one(&self.db)
                    .await
                    .unwrap()
                    .unwrap();
                tracing::debug!("Progress update for meta {:?} ({:?})", meta.title, meta.lot);

                let show_ei = if matches!(meta.lot, MediaLot::Show) {
                    let season = input.show_season_number.ok_or_else(|| {
                        Error::new("Season number is required for show progress update")
                    })?;
                    let episode = input.show_episode_number.ok_or_else(|| {
                        Error::new("Episode number is required for show progress update")
                    })?;
                    Some(SeenShowExtraInformation { season, episode })
                } else {
                    None
                };
                let podcast_ei = if matches!(meta.lot, MediaLot::Podcast) {
                    let episode = input.podcast_episode_number.ok_or_else(|| {
                        Error::new("Episode number is required for podcast progress update")
                    })?;
                    Some(SeenPodcastExtraInformation { episode })
                } else {
                    None
                };
                let anime_ei = if matches!(meta.lot, MediaLot::Anime) {
                    Some(SeenAnimeExtraInformation {
                        episode: input.anime_episode_number,
                    })
                } else {
                    None
                };
                let manga_ei = if matches!(meta.lot, MediaLot::Manga) {
                    Some(SeenMangaExtraInformation {
                        chapter: input.manga_chapter_number,
                        volume: input.manga_volume_number,
                    })
                } else {
                    None
                };
                let finished_on = if action == ProgressUpdateAction::JustStarted {
                    None
                } else {
                    input.date
                };
                tracing::debug!("Progress update finished on = {:?}", finished_on);
                let (progress, started_on) = if matches!(action, ProgressUpdateAction::JustStarted)
                {
                    (
                        input.progress.unwrap_or(dec!(0)),
                        Some(Utc::now().date_naive()),
                    )
                } else {
                    (dec!(100), None)
                };
                tracing::debug!("Progress update percentage = {:?}", progress);
                let seen_insert = seen::ActiveModel {
                    progress: ActiveValue::Set(progress),
                    user_id: ActiveValue::Set(user_id.to_owned()),
                    metadata_id: ActiveValue::Set(input.metadata_id),
                    started_on: ActiveValue::Set(started_on),
                    finished_on: ActiveValue::Set(finished_on),
                    state: ActiveValue::Set(SeenState::InProgress),
                    provider_watched_on: ActiveValue::Set(input.provider_watched_on),
                    show_extra_information: ActiveValue::Set(show_ei),
                    podcast_extra_information: ActiveValue::Set(podcast_ei),
                    anime_extra_information: ActiveValue::Set(anime_ei),
                    manga_extra_information: ActiveValue::Set(manga_ei),
                    ..Default::default()
                };
                seen_insert.insert(&self.db).await.unwrap()
            }
        };
        tracing::debug!("Progress update = {:?}", seen);
        let id = seen.id.clone();
        if seen.state == SeenState::Completed && respect_cache {
            self.seen_progress_cache.cache_set(cache, ()).unwrap();
        }
        self.after_media_seen_tasks(seen).await?;
        Ok(ProgressUpdateResultUnion::Ok(StringIdObject { id }))
    }

    async fn deploy_bulk_progress_update(
        &self,
        user_id: String,
        input: Vec<ProgressUpdateInput>,
    ) -> Result<bool> {
        self.perform_core_application_job
            .clone()
            .enqueue(CoreApplicationJob::BulkProgressUpdate(user_id, input))
            .await
            .unwrap();
        Ok(true)
    }

    pub async fn bulk_progress_update(
        &self,
        user_id: String,
        input: Vec<ProgressUpdateInput>,
    ) -> Result<bool> {
        for seen in input {
            self.progress_update(seen, &user_id, false).await.trace_ok();
        }
        Ok(true)
    }

    pub async fn deploy_background_job(
        &self,
        user_id: &String,
        job_name: BackgroundJob,
    ) -> Result<bool> {
        let core_sqlite_storage = &mut self.perform_core_application_job.clone();
        let sqlite_storage = &mut self.perform_application_job.clone();
        match job_name {
            BackgroundJob::UpdateAllMetadata
            | BackgroundJob::UpdateAllExercises
            | BackgroundJob::RecalculateCalendarEvents
            | BackgroundJob::PerformBackgroundTasks => {
                self.admin_account_guard(user_id).await?;
            }
            _ => {}
        }
        match job_name {
            BackgroundJob::UpdateAllMetadata => {
                let many_metadata = Metadata::find()
                    .select_only()
                    .column(metadata::Column::Id)
                    .order_by_asc(metadata::Column::LastUpdatedOn)
                    .into_tuple::<String>()
                    .all(&self.db)
                    .await
                    .unwrap();
                for metadata_id in many_metadata {
                    self.deploy_update_metadata_job(&metadata_id, true).await?;
                }
            }
            BackgroundJob::UpdateAllExercises => {
                let service = ExerciseService::new(
                    &self.db,
                    self.config.clone(),
                    self.file_storage_service.clone(),
                    &self.perform_application_job,
                );
                service.deploy_update_exercise_library_job().await?;
            }
            BackgroundJob::RecalculateCalendarEvents => {
                sqlite_storage
                    .enqueue(ApplicationJob::RecalculateCalendarEvents)
                    .await
                    .unwrap();
            }
            BackgroundJob::PerformBackgroundTasks => {
                sqlite_storage
                    .enqueue(ApplicationJob::PerformBackgroundTasks)
                    .await
                    .unwrap();
            }
            BackgroundJob::SyncIntegrationsData => {
                core_sqlite_storage
                    .enqueue(CoreApplicationJob::SyncIntegrationsData(user_id.to_owned()))
                    .await
                    .unwrap();
            }
            BackgroundJob::CalculateSummary => {
                sqlite_storage
                    .enqueue(ApplicationJob::RecalculateUserSummary(user_id.to_owned()))
                    .await
                    .unwrap();
            }
            BackgroundJob::EvaluateWorkouts => {
                sqlite_storage
                    .enqueue(ApplicationJob::ReEvaluateUserWorkouts(user_id.to_owned()))
                    .await
                    .unwrap();
            }
        };
        Ok(true)
    }

    async fn cleanup_user_and_metadata_association(&self) -> Result<()> {
        let all_users = User::find()
            .select_only()
            .column(user::Column::Id)
            .into_tuple::<String>()
            .all(&self.db)
            .await
            .unwrap();
        for user_id in all_users {
            let collections = Collection::find()
                .column(collection::Column::Id)
                .column(collection::Column::UserId)
                .left_join(UserToCollection)
                .filter(user_to_collection::Column::UserId.eq(&user_id))
                .all(&self.db)
                .await
                .unwrap();
            let monitoring_collection_id = collections
                .iter()
                .find(|c| {
                    c.name == DefaultCollection::Monitoring.to_string() && c.user_id == user_id
                })
                .map(|c| c.id.clone())
                .unwrap();
            let watchlist_collection_id = collections
                .iter()
                .find(|c| {
                    c.name == DefaultCollection::Watchlist.to_string() && c.user_id == user_id
                })
                .map(|c| c.id.clone())
                .unwrap();
            let owned_collection_id = collections
                .iter()
                .find(|c| c.name == DefaultCollection::Owned.to_string() && c.user_id == user_id)
                .map(|c| c.id.clone())
                .unwrap();
            let reminder_collection_id = collections
                .iter()
                .find(|c| {
                    c.name == DefaultCollection::Reminders.to_string() && c.user_id == user_id
                })
                .map(|c| c.id.clone())
                .unwrap();
            let all_user_to_entities = UserToEntity::find()
                .filter(user_to_entity::Column::NeedsToBeUpdated.eq(true))
                .filter(user_to_entity::Column::UserId.eq(user_id))
                .all(&self.db)
                .await
                .unwrap();
            for ute in all_user_to_entities {
                let mut new_reasons = HashSet::new();
                if let Some(metadata_id) = ute.metadata_id.clone() {
                    let metadata = self.generic_metadata(&metadata_id).await?;
                    let (is_finished, seen_history) = self
                        .is_metadata_finished_by_user(&ute.user_id, &metadata)
                        .await?;
                    if !seen_history.is_empty() {
                        new_reasons.insert(UserToMediaReason::Seen);
                    }
                    if is_finished {
                        new_reasons.insert(UserToMediaReason::Finished);
                    }
                } else if ute.person_id.is_some() || ute.metadata_group_id.is_some() {
                } else {
                    tracing::debug!("Skipping user_to_entity = {:?}", ute.id);
                    continue;
                };

                let collections_part_of = CollectionToEntity::find()
                    .select_only()
                    .column(collection_to_entity::Column::CollectionId)
                    .filter(
                        collection_to_entity::Column::MetadataId
                            .eq(ute.metadata_id.clone())
                            .or(collection_to_entity::Column::PersonId.eq(ute.person_id.clone()))
                            .or(collection_to_entity::Column::MetadataGroupId
                                .eq(ute.metadata_group_id.clone())),
                    )
                    .filter(collection_to_entity::Column::CollectionId.is_not_null())
                    .into_tuple::<String>()
                    .all(&self.db)
                    .await
                    .unwrap();
                if Review::find()
                    .filter(review::Column::UserId.eq(&ute.user_id))
                    .filter(
                        review::Column::MetadataId
                            .eq(ute.metadata_id.clone())
                            .or(review::Column::MetadataGroupId.eq(ute.metadata_group_id.clone()))
                            .or(review::Column::PersonId.eq(ute.person_id.clone())),
                    )
                    .count(&self.db)
                    .await
                    .unwrap()
                    > 0
                {
                    new_reasons.insert(UserToMediaReason::Reviewed);
                }
                let is_in_collection = !collections_part_of.is_empty();
                let is_monitoring = collections_part_of.contains(&monitoring_collection_id);
                let is_watchlist = collections_part_of.contains(&watchlist_collection_id);
                let is_owned = collections_part_of.contains(&owned_collection_id);
                let has_reminder = collections_part_of.contains(&reminder_collection_id);
                if is_in_collection {
                    new_reasons.insert(UserToMediaReason::Collection);
                }
                if is_monitoring {
                    new_reasons.insert(UserToMediaReason::Monitoring);
                }
                if is_watchlist {
                    new_reasons.insert(UserToMediaReason::Watchlist);
                }
                if is_owned {
                    new_reasons.insert(UserToMediaReason::Owned);
                }
                if has_reminder {
                    new_reasons.insert(UserToMediaReason::Reminder);
                }
                let previous_reasons =
                    HashSet::from_iter(ute.media_reason.clone().unwrap_or_default().into_iter());
                if new_reasons.is_empty() {
                    tracing::debug!("Deleting user_to_entity = {id:?}", id = (&ute.id));
                    ute.delete(&self.db).await.unwrap();
                } else {
                    let mut ute: user_to_entity::ActiveModel = ute.into();
                    if new_reasons != previous_reasons {
                        tracing::debug!("Updating user_to_entity = {id:?}", id = (&ute.id));
                        ute.media_reason =
                            ActiveValue::Set(Some(new_reasons.into_iter().collect()));
                    }
                    ute.needs_to_be_updated = ActiveValue::Set(None);
                    ute.update(&self.db).await.unwrap();
                }
            }
        }
        Ok(())
    }

    async fn update_media(
        &self,
        metadata_id: &String,
        input: MediaDetails,
    ) -> Result<Vec<(String, MediaStateChanged)>> {
        let mut notifications = vec![];

        let meta = Metadata::find_by_id(metadata_id)
            .one(&self.db)
            .await
            .unwrap()
            .unwrap();

        if let (Some(p1), Some(p2)) = (&meta.production_status, &input.production_status) {
            if p1 != p2 {
                notifications.push((
                    format!("Status changed from {:#?} to {:#?}", p1, p2),
                    MediaStateChanged::MetadataStatusChanged,
                ));
            }
        }
        if let (Some(p1), Some(p2)) = (meta.publish_year, input.publish_year) {
            if p1 != p2 {
                notifications.push((
                    format!("Publish year from {:#?} to {:#?}", p1, p2),
                    MediaStateChanged::MetadataReleaseDateChanged,
                ));
            }
        }
        if let (Some(s1), Some(s2)) = (&meta.show_specifics, &input.show_specifics) {
            if s1.seasons.len() != s2.seasons.len() {
                notifications.push((
                    format!(
                        "Number of seasons changed from {:#?} to {:#?}",
                        s1.seasons.len(),
                        s2.seasons.len()
                    ),
                    MediaStateChanged::MetadataNumberOfSeasonsChanged,
                ));
            } else {
                for (s1, s2) in zip(s1.seasons.iter(), s2.seasons.iter()) {
                    if SHOW_SPECIAL_SEASON_NAMES.contains(&s1.name.as_str())
                        && SHOW_SPECIAL_SEASON_NAMES.contains(&s2.name.as_str())
                    {
                        continue;
                    }
                    if s1.episodes.len() != s2.episodes.len() {
                        notifications.push((
                            format!(
                                "Number of episodes changed from {:#?} to {:#?} (Season {})",
                                s1.episodes.len(),
                                s2.episodes.len(),
                                s1.season_number
                            ),
                            MediaStateChanged::MetadataEpisodeReleased,
                        ));
                    } else {
                        for (before_episode, after_episode) in
                            zip(s1.episodes.iter(), s2.episodes.iter())
                        {
                            if before_episode.name != after_episode.name {
                                notifications.push((
                                    format!(
                                        "Episode name changed from {:#?} to {:#?} (S{}E{})",
                                        before_episode.name,
                                        after_episode.name,
                                        s1.season_number,
                                        before_episode.episode_number
                                    ),
                                    MediaStateChanged::MetadataEpisodeNameChanged,
                                ));
                            }
                            if before_episode.poster_images != after_episode.poster_images {
                                notifications.push((
                                    format!(
                                        "Episode image changed for S{}E{}",
                                        s1.season_number, before_episode.episode_number
                                    ),
                                    MediaStateChanged::MetadataEpisodeImagesChanged,
                                ));
                            }
                            if let (Some(pd1), Some(pd2)) =
                                (before_episode.publish_date, after_episode.publish_date)
                            {
                                if pd1 != pd2 {
                                    notifications.push((
                                            format!(
                                                "Episode release date changed from {:?} to {:?} (S{}E{})",
                                                pd1,
                                                pd2,
                                                s1.season_number,
                                                before_episode.episode_number
                                            ),
                                            MediaStateChanged::MetadataReleaseDateChanged,
                                        ));
                                }
                            }
                        }
                    }
                }
            }
        };
        if let (Some(a1), Some(a2)) = (&meta.anime_specifics, &input.anime_specifics) {
            if let (Some(e1), Some(e2)) = (a1.episodes, a2.episodes) {
                if e1 != e2 {
                    notifications.push((
                        format!("Number of episodes changed from {:#?} to {:#?}", e1, e2),
                        MediaStateChanged::MetadataChaptersOrEpisodesChanged,
                    ));
                }
            }
        };
        if let (Some(m1), Some(m2)) = (&meta.manga_specifics, &input.manga_specifics) {
            if let (Some(c1), Some(c2)) = (m1.chapters, m2.chapters) {
                if c1 != c2 {
                    notifications.push((
                        format!("Number of chapters changed from {:#?} to {:#?}", c1, c2),
                        MediaStateChanged::MetadataChaptersOrEpisodesChanged,
                    ));
                }
            }
        };
        if let (Some(p1), Some(p2)) = (&meta.podcast_specifics, &input.podcast_specifics) {
            if p1.episodes.len() != p2.episodes.len() {
                notifications.push((
                    format!(
                        "Number of episodes changed from {:#?} to {:#?}",
                        p1.episodes.len(),
                        p2.episodes.len()
                    ),
                    MediaStateChanged::MetadataEpisodeReleased,
                ));
            } else {
                for (before_episode, after_episode) in zip(p1.episodes.iter(), p2.episodes.iter()) {
                    if before_episode.title != after_episode.title {
                        notifications.push((
                            format!(
                                "Episode name changed from {:#?} to {:#?} (EP{})",
                                before_episode.title, after_episode.title, before_episode.number
                            ),
                            MediaStateChanged::MetadataEpisodeNameChanged,
                        ));
                    }
                    if before_episode.thumbnail != after_episode.thumbnail {
                        notifications.push((
                            format!("Episode image changed for EP{}", before_episode.number),
                            MediaStateChanged::MetadataEpisodeImagesChanged,
                        ));
                    }
                }
            }
        };

        let notifications = notifications
            .into_iter()
            .map(|n| (format!("{} for {:?}.", n.0, meta.title), n.1))
            .collect_vec();

        let mut images = vec![];
        images.extend(input.url_images.into_iter().map(|i| MetadataImage {
            url: StoredUrl::Url(i.image),
        }));
        images.extend(input.s3_images.into_iter().map(|i| MetadataImage {
            url: StoredUrl::S3(i.image),
        }));
        let free_creators = if input.creators.is_empty() {
            None
        } else {
            Some(input.creators)
        };
        let watch_providers = if input.watch_providers.is_empty() {
            None
        } else {
            Some(input.watch_providers)
        };

        let mut meta: metadata::ActiveModel = meta.into();
        meta.last_updated_on = ActiveValue::Set(Utc::now());
        meta.title = ActiveValue::Set(input.title);
        meta.is_nsfw = ActiveValue::Set(input.is_nsfw);
        meta.is_partial = ActiveValue::Set(Some(false));
        meta.provider_rating = ActiveValue::Set(input.provider_rating);
        meta.description = ActiveValue::Set(input.description);
        meta.images = ActiveValue::Set(Some(images));
        meta.videos = ActiveValue::Set(Some(input.videos));
        meta.production_status = ActiveValue::Set(input.production_status);
        meta.original_language = ActiveValue::Set(input.original_language);
        meta.publish_year = ActiveValue::Set(input.publish_year);
        meta.publish_date = ActiveValue::Set(input.publish_date);
        meta.free_creators = ActiveValue::Set(free_creators);
        meta.watch_providers = ActiveValue::Set(watch_providers);
        meta.anime_specifics = ActiveValue::Set(input.anime_specifics);
        meta.audio_book_specifics = ActiveValue::Set(input.audio_book_specifics);
        meta.manga_specifics = ActiveValue::Set(input.manga_specifics);
        meta.movie_specifics = ActiveValue::Set(input.movie_specifics);
        meta.podcast_specifics = ActiveValue::Set(input.podcast_specifics);
        meta.show_specifics = ActiveValue::Set(input.show_specifics);
        meta.book_specifics = ActiveValue::Set(input.book_specifics);
        meta.video_game_specifics = ActiveValue::Set(input.video_game_specifics);
        meta.visual_novel_specifics = ActiveValue::Set(input.visual_novel_specifics);
        meta.external_identifiers = ActiveValue::Set(input.external_identifiers);
        let metadata = meta.update(&self.db).await.unwrap();

        self.change_metadata_associations(
            &metadata.id,
            metadata.lot,
            metadata.source,
            input.genres,
            input.suggestions,
            input.group_identifiers,
            input.people,
        )
        .await?;
        Ok(notifications)
    }

    async fn associate_person_with_metadata(
        &self,
        metadata_id: &str,
        person: PartialMetadataPerson,
        index: usize,
    ) -> Result<()> {
        let role = person.role.clone();
        let db_person = self
            .commit_person(CommitPersonInput {
                identifier: person.identifier.clone(),
                source: person.source,
                source_specifics: person.source_specifics,
                name: person.name,
            })
            .await?;
        let intermediate = metadata_to_person::ActiveModel {
            metadata_id: ActiveValue::Set(metadata_id.to_owned()),
            person_id: ActiveValue::Set(db_person.id),
            role: ActiveValue::Set(role),
            index: ActiveValue::Set(Some(index.try_into().unwrap())),
            character: ActiveValue::Set(person.character),
        };
        intermediate.insert(&self.db).await.ok();
        Ok(())
    }

    async fn deploy_associate_group_with_metadata_job(
        &self,
        lot: MediaLot,
        source: MediaSource,
        identifier: String,
    ) -> Result<()> {
        self.perform_application_job
            .clone()
            .enqueue(ApplicationJob::AssociateGroupWithMetadata(
                lot, source, identifier,
            ))
            .await
            .unwrap();
        Ok(())
    }

    pub async fn commit_metadata_group_internal(
        &self,
        identifier: &String,
        lot: MediaLot,
        source: MediaSource,
    ) -> Result<(String, Vec<PartialMetadataWithoutId>)> {
        let existing_group = MetadataGroup::find()
            .filter(metadata_group::Column::Identifier.eq(identifier))
            .filter(metadata_group::Column::Lot.eq(lot))
            .filter(metadata_group::Column::Source.eq(source))
            .one(&self.db)
            .await?;
        let provider = self.get_metadata_provider(lot, source).await?;
        let (group_details, associated_items) = provider.metadata_group_details(identifier).await?;
        let group_id = match existing_group {
            Some(eg) => eg.id,
            None => {
                let mut db_group: metadata_group::ActiveModel =
                    group_details.into_model("".to_string(), None).into();
                db_group.id = ActiveValue::NotSet;
                let new_group = db_group.insert(&self.db).await?;
                new_group.id
            }
        };
        Ok((group_id, associated_items))
    }

    async fn associate_suggestion_with_metadata(
        &self,
        data: PartialMetadataWithoutId,
        metadata_id: &str,
    ) -> Result<()> {
        let db_partial_metadata = self.create_partial_metadata(data).await?;
        let intermediate = metadata_to_metadata::ActiveModel {
            from_metadata_id: ActiveValue::Set(metadata_id.to_owned()),
            to_metadata_id: ActiveValue::Set(db_partial_metadata.id),
            relation: ActiveValue::Set(MetadataToMetadataRelation::Suggestion),
            ..Default::default()
        };
        intermediate.insert(&self.db).await.ok();
        Ok(())
    }

    async fn create_partial_metadata(
        &self,
        data: PartialMetadataWithoutId,
    ) -> Result<PartialMetadata> {
        let mode = if let Some(c) = Metadata::find()
            .filter(metadata::Column::Identifier.eq(&data.identifier))
            .filter(metadata::Column::Lot.eq(data.lot))
            .filter(metadata::Column::Source.eq(data.source))
            .one(&self.db)
            .await
            .unwrap()
        {
            c
        } else {
            let image = data.image.clone().map(|i| {
                vec![MetadataImage {
                    url: StoredUrl::Url(i),
                }]
            });
            let c = metadata::ActiveModel {
                title: ActiveValue::Set(data.title),
                identifier: ActiveValue::Set(data.identifier),
                lot: ActiveValue::Set(data.lot),
                source: ActiveValue::Set(data.source),
                images: ActiveValue::Set(image),
                is_partial: ActiveValue::Set(Some(true)),
                ..Default::default()
            };
            c.insert(&self.db).await?
        };
        let model = PartialMetadata {
            id: mode.id,
            title: mode.title,
            identifier: mode.identifier,
            lot: mode.lot,
            source: mode.source,
            image: data.image,
        };
        Ok(model)
    }

    async fn associate_genre_with_metadata(&self, name: String, metadata_id: &str) -> Result<()> {
        let db_genre = if let Some(c) = Genre::find()
            .filter(genre::Column::Name.eq(&name))
            .one(&self.db)
            .await
            .unwrap()
        {
            c
        } else {
            let c = genre::ActiveModel {
                name: ActiveValue::Set(name),
                ..Default::default()
            };
            c.insert(&self.db).await.unwrap()
        };
        let intermediate = metadata_to_genre::ActiveModel {
            metadata_id: ActiveValue::Set(metadata_id.to_owned()),
            genre_id: ActiveValue::Set(db_genre.id),
        };
        intermediate.insert(&self.db).await.ok();
        Ok(())
    }

    async fn update_seen_item(&self, user_id: String, input: UpdateSeenItemInput) -> Result<bool> {
        let seen = match Seen::find_by_id(input.seen_id).one(&self.db).await.unwrap() {
            Some(s) => s,
            None => return Err(Error::new("No seen found for this user and metadata")),
        };
        if seen.user_id != user_id {
            return Err(Error::new("No seen found for this user and metadata"));
        }
        let mut seen: seen::ActiveModel = seen.into();
        if let Some(started_on) = input.started_on {
            seen.started_on = ActiveValue::Set(Some(started_on));
        }
        if let Some(finished_on) = input.finished_on {
            seen.finished_on = ActiveValue::Set(Some(finished_on));
        }
        if let Some(provider_watched_on) = input.provider_watched_on {
            seen.provider_watched_on = ActiveValue::Set(Some(provider_watched_on));
        }
        let seen = seen.update(&self.db).await.unwrap();
        self.after_media_seen_tasks(seen).await?;
        Ok(true)
    }

    pub async fn commit_metadata_internal(
        &self,
        details: MediaDetails,
        is_partial: Option<bool>,
    ) -> Result<metadata::Model> {
        let mut images = vec![];
        images.extend(details.url_images.into_iter().map(|i| MetadataImage {
            url: StoredUrl::Url(i.image),
        }));
        images.extend(details.s3_images.into_iter().map(|i| MetadataImage {
            url: StoredUrl::S3(i.image),
        }));
        let metadata = metadata::ActiveModel {
            lot: ActiveValue::Set(details.lot),
            source: ActiveValue::Set(details.source),
            title: ActiveValue::Set(details.title),
            description: ActiveValue::Set(details.description),
            publish_year: ActiveValue::Set(details.publish_year),
            publish_date: ActiveValue::Set(details.publish_date),
            images: ActiveValue::Set(Some(images)),
            videos: ActiveValue::Set(Some(details.videos)),
            identifier: ActiveValue::Set(details.identifier),
            audio_book_specifics: ActiveValue::Set(details.audio_book_specifics),
            anime_specifics: ActiveValue::Set(details.anime_specifics),
            book_specifics: ActiveValue::Set(details.book_specifics),
            manga_specifics: ActiveValue::Set(details.manga_specifics),
            movie_specifics: ActiveValue::Set(details.movie_specifics),
            podcast_specifics: ActiveValue::Set(details.podcast_specifics),
            show_specifics: ActiveValue::Set(details.show_specifics),
            video_game_specifics: ActiveValue::Set(details.video_game_specifics),
            visual_novel_specifics: ActiveValue::Set(details.visual_novel_specifics),
            provider_rating: ActiveValue::Set(details.provider_rating),
            production_status: ActiveValue::Set(details.production_status),
            original_language: ActiveValue::Set(details.original_language),
            external_identifiers: ActiveValue::Set(details.external_identifiers),
            is_nsfw: ActiveValue::Set(details.is_nsfw),
            is_partial: ActiveValue::Set(is_partial),
            free_creators: ActiveValue::Set(if details.creators.is_empty() {
                None
            } else {
                Some(details.creators)
            }),
            watch_providers: ActiveValue::Set(if details.watch_providers.is_empty() {
                None
            } else {
                Some(details.watch_providers)
            }),
            ..Default::default()
        };
        let metadata = metadata.insert(&self.db).await?;

        self.change_metadata_associations(
            &metadata.id,
            metadata.lot,
            metadata.source,
            details.genres.clone(),
            details.suggestions.clone(),
            details.group_identifiers.clone(),
            details.people.clone(),
        )
        .await?;
        Ok(metadata)
    }

    #[allow(clippy::too_many_arguments)]
    async fn change_metadata_associations(
        &self,
        metadata_id: &String,
        lot: MediaLot,
        source: MediaSource,
        genres: Vec<String>,
        suggestions: Vec<PartialMetadataWithoutId>,
        groups: Vec<String>,
        people: Vec<PartialMetadataPerson>,
    ) -> Result<()> {
        MetadataToPerson::delete_many()
            .filter(metadata_to_person::Column::MetadataId.eq(metadata_id))
            .exec(&self.db)
            .await?;
        MetadataToGenre::delete_many()
            .filter(metadata_to_genre::Column::MetadataId.eq(metadata_id))
            .exec(&self.db)
            .await?;
        MetadataToMetadata::delete_many()
            .filter(metadata_to_metadata::Column::FromMetadataId.eq(metadata_id))
            .filter(
                metadata_to_metadata::Column::Relation.eq(MetadataToMetadataRelation::Suggestion),
            )
            .exec(&self.db)
            .await?;
        for (index, creator) in people.into_iter().enumerate() {
            self.associate_person_with_metadata(metadata_id, creator, index)
                .await
                .ok();
        }
        for genre in genres {
            self.associate_genre_with_metadata(genre, metadata_id)
                .await
                .ok();
        }
        for suggestion in suggestions {
            self.associate_suggestion_with_metadata(suggestion, metadata_id)
                .await
                .ok();
        }
        for group_identifier in groups {
            self.deploy_associate_group_with_metadata_job(lot, source, group_identifier)
                .await
                .ok();
        }
        Ok(())
    }

    async fn deploy_update_metadata_job(
        &self,
        metadata_id: &String,
        force_update: bool,
    ) -> Result<bool> {
        let metadata = Metadata::find_by_id(metadata_id)
            .one(&self.db)
            .await
            .unwrap()
            .unwrap();
        self.perform_application_job
            .clone()
            .enqueue(ApplicationJob::UpdateMetadata(metadata.id, force_update))
            .await
            .unwrap();
        Ok(true)
    }

    async fn deploy_update_person_job(&self, person_id: String) -> Result<bool> {
        let person = Person::find_by_id(person_id)
            .one(&self.db)
            .await
            .unwrap()
            .unwrap();
        self.perform_application_job
            .clone()
            .enqueue(ApplicationJob::UpdatePerson(person.id))
            .await
            .unwrap();
        Ok(true)
    }

    async fn merge_metadata(
        &self,
        user_id: String,
        merge_from: String,
        merge_into: String,
    ) -> Result<bool> {
        let txn = self.db.begin().await?;
        for old_seen in Seen::find()
            .filter(seen::Column::MetadataId.eq(&merge_from))
            .filter(seen::Column::UserId.eq(&user_id))
            .all(&txn)
            .await
            .unwrap()
        {
            let old_seen_active: seen::ActiveModel = old_seen.clone().into();
            let new_seen = seen::ActiveModel {
                id: ActiveValue::NotSet,
                last_updated_on: ActiveValue::NotSet,
                num_times_updated: ActiveValue::NotSet,
                metadata_id: ActiveValue::Set(merge_into.clone()),
                ..old_seen_active
            };
            new_seen.insert(&txn).await?;
            old_seen.delete(&txn).await?;
        }
        for old_review in Review::find()
            .filter(review::Column::MetadataId.eq(&merge_from))
            .filter(review::Column::UserId.eq(&user_id))
            .all(&txn)
            .await
            .unwrap()
        {
            let old_review_active: review::ActiveModel = old_review.clone().into();
            let new_review = review::ActiveModel {
                id: ActiveValue::NotSet,
                metadata_id: ActiveValue::Set(Some(merge_into.clone())),
                ..old_review_active
            };
            new_review.insert(&txn).await?;
            old_review.delete(&txn).await?;
        }
        let collections = Collection::find()
            .select_only()
            .column(collection::Column::Id)
            .left_join(UserToCollection)
            .filter(user_to_collection::Column::UserId.eq(&user_id))
            .into_tuple::<String>()
            .all(&txn)
            .await
            .unwrap();
        for item in CollectionToEntity::find()
            .filter(collection_to_entity::Column::MetadataId.eq(&merge_from))
            .filter(collection_to_entity::Column::CollectionId.is_in(collections))
            .all(&txn)
            .await?
            .into_iter()
        {
            if CollectionToEntity::find()
                .filter(collection_to_entity::Column::CollectionId.eq(item.collection_id.clone()))
                .filter(collection_to_entity::Column::MetadataId.eq(&merge_into))
                .count(&txn)
                .await?
                == 0
            {
                let mut item_active: collection_to_entity::ActiveModel = item.into();
                item_active.metadata_id = ActiveValue::Set(Some(merge_into.clone()));
                item_active.update(&txn).await?;
            }
        }
        if let Some(_association) = get_user_to_entity_association(
            &user_id,
            Some(merge_into.clone()),
            None,
            None,
            None,
            &txn,
        )
        .await
        {
            let old_association = get_user_to_entity_association(
                &user_id,
                Some(merge_from.clone()),
                None,
                None,
                None,
                &txn,
            )
            .await
            .unwrap();
            let mut cloned: user_to_entity::ActiveModel = old_association.clone().into();
            cloned.needs_to_be_updated = ActiveValue::Set(Some(true));
            cloned.update(&txn).await?;
        } else {
            UserToEntity::update_many()
                .filter(user_to_entity::Column::MetadataId.eq(merge_from))
                .filter(user_to_entity::Column::UserId.eq(user_id))
                .set(user_to_entity::ActiveModel {
                    metadata_id: ActiveValue::Set(Some(merge_into.clone())),
                    ..Default::default()
                })
                .exec(&txn)
                .await?;
        }
        txn.commit().await?;
        Ok(true)
    }

    async fn user_preferences(&self, user_id: &String) -> Result<UserPreferences> {
        let mut preferences = user_by_id(&self.db, user_id).await?.preferences;
        preferences.features_enabled.media.anime =
            self.config.anime_and_manga.is_enabled() && preferences.features_enabled.media.anime;
        preferences.features_enabled.media.audio_book =
            self.config.audio_books.is_enabled() && preferences.features_enabled.media.audio_book;
        preferences.features_enabled.media.book =
            self.config.books.is_enabled() && preferences.features_enabled.media.book;
        preferences.features_enabled.media.show =
            self.config.movies_and_shows.is_enabled() && preferences.features_enabled.media.show;
        preferences.features_enabled.media.manga =
            self.config.anime_and_manga.is_enabled() && preferences.features_enabled.media.manga;
        preferences.features_enabled.media.movie =
            self.config.movies_and_shows.is_enabled() && preferences.features_enabled.media.movie;
        preferences.features_enabled.media.podcast =
            self.config.podcasts.is_enabled() && preferences.features_enabled.media.podcast;
        preferences.features_enabled.media.video_game =
            self.config.video_games.is_enabled() && preferences.features_enabled.media.video_game;
        Ok(preferences)
    }

    async fn metadata_search(
        &self,
        user_id: &String,
        input: MetadataSearchInput,
    ) -> Result<SearchResults<MetadataSearchItemResponse>> {
        let query = input.search.query.unwrap_or_default();
        if query.is_empty() {
            return Ok(SearchResults {
                details: SearchDetails {
                    total: 0,
                    next_page: None,
                },
                items: vec![],
            });
        }
        let cloned_user_id = user_id.to_owned();
        let preferences = user_by_id(&self.db, user_id).await?.preferences;
        let provider = self.get_metadata_provider(input.lot, input.source).await?;
        let results = provider
            .metadata_search(&query, input.search.page, preferences.general.display_nsfw)
            .await?;
        let all_identifiers = results
            .items
            .iter()
            .map(|i| i.identifier.to_owned())
            .collect_vec();
        let interactions = Metadata::find()
            .join(
                JoinType::LeftJoin,
                metadata::Relation::UserToEntity
                    .def()
                    .on_condition(move |_left, right| {
                        Condition::all().add(
                            Expr::col((right, user_to_entity::Column::UserId))
                                .eq(cloned_user_id.clone()),
                        )
                    }),
            )
            .select_only()
            .column(metadata::Column::Identifier)
            .column_as(
                Expr::col((Alias::new("metadata"), metadata::Column::Id)),
                "database_id",
            )
            .column_as(
                Expr::col((Alias::new("user_to_entity"), user_to_entity::Column::Id)).is_not_null(),
                "has_interacted",
            )
            .filter(metadata::Column::Lot.eq(input.lot))
            .filter(metadata::Column::Source.eq(input.source))
            .filter(metadata::Column::Identifier.is_in(&all_identifiers))
            .into_tuple::<(String, String, bool)>()
            .all(&self.db)
            .await?
            .into_iter()
            .map(|(key, value1, value2)| (key, (value1, value2)));
        let interactions = HashMap::<_, _>::from_iter(interactions.into_iter());
        let data = results
            .items
            .into_iter()
            .map(|i| {
                let interaction = interactions.get(&i.identifier).cloned();
                MetadataSearchItemResponse {
                    has_interacted: interaction.clone().unwrap_or_default().1,
                    database_id: interaction.map(|i| i.0),
                    item: i,
                }
            })
            .collect();
        let results = SearchResults {
            details: results.details,
            items: data,
        };
        Ok(results)
    }

    async fn people_search(
        &self,
        user_id: &String,
        input: PeopleSearchInput,
    ) -> Result<SearchResults<PeopleSearchItem>> {
        let query = input.search.query.unwrap_or_default();
        if query.is_empty() {
            return Ok(SearchResults {
                details: SearchDetails {
                    total: 0,
                    next_page: None,
                },
                items: vec![],
            });
        }
        let preferences = user_by_id(&self.db, user_id).await?.preferences;
        let provider = self.get_non_metadata_provider(input.source).await?;
        let results = provider
            .people_search(
                &query,
                input.search.page,
                &input.source_specifics,
                preferences.general.display_nsfw,
            )
            .await?;
        Ok(results)
    }

    async fn metadata_group_search(
        &self,
        user_id: &String,
        input: MetadataGroupSearchInput,
    ) -> Result<SearchResults<MetadataGroupSearchItem>> {
        let query = input.search.query.unwrap_or_default();
        if query.is_empty() {
            return Ok(SearchResults {
                details: SearchDetails {
                    total: 0,
                    next_page: None,
                },
                items: vec![],
            });
        }
        let preferences = user_by_id(&self.db, user_id).await?.preferences;
        let provider = self.get_metadata_provider(input.lot, input.source).await?;
        let results = provider
            .metadata_group_search(&query, input.search.page, preferences.general.display_nsfw)
            .await?;
        Ok(results)
    }

    pub async fn get_openlibrary_service(&self) -> Result<OpenlibraryService> {
        Ok(OpenlibraryService::new(
            &self.config.books.openlibrary,
            self.config.frontend.page_size,
        )
        .await)
    }

    pub async fn get_isbn_service(&self) -> Result<GoogleBooksService> {
        Ok(GoogleBooksService::new(
            &self.config.books.google_books,
            self.config.frontend.page_size,
        )
        .await)
    }

    async fn get_metadata_provider(&self, lot: MediaLot, source: MediaSource) -> Result<Provider> {
        let err = || Err(Error::new("This source is not supported".to_owned()));
        let service: Provider = match source {
            MediaSource::Vndb => Box::new(
                VndbService::new(&self.config.visual_novels, self.config.frontend.page_size).await,
            ),
            MediaSource::Openlibrary => Box::new(self.get_openlibrary_service().await?),
            MediaSource::Itunes => Box::new(
                ITunesService::new(&self.config.podcasts.itunes, self.config.frontend.page_size)
                    .await,
            ),
            MediaSource::GoogleBooks => Box::new(self.get_isbn_service().await?),
            MediaSource::Audible => Box::new(
                AudibleService::new(
                    &self.config.audio_books.audible,
                    self.config.frontend.page_size,
                )
                .await,
            ),
            MediaSource::Listennotes => Box::new(
                ListennotesService::new(&self.config.podcasts, self.config.frontend.page_size)
                    .await,
            ),
            MediaSource::Tmdb => match lot {
                MediaLot::Show => Box::new(
                    TmdbShowService::new(
                        &self.config.movies_and_shows.tmdb,
                        *self.timezone,
                        self.config.frontend.page_size,
                    )
                    .await,
                ),
                MediaLot::Movie => Box::new(
                    TmdbMovieService::new(
                        &self.config.movies_and_shows.tmdb,
                        *self.timezone,
                        self.config.frontend.page_size,
                    )
                    .await,
                ),
                _ => return err(),
            },
            MediaSource::Anilist => match lot {
                MediaLot::Anime => Box::new(
                    AnilistAnimeService::new(
                        &self.config.anime_and_manga.anilist,
                        self.config.frontend.page_size,
                    )
                    .await,
                ),
                MediaLot::Manga => Box::new(
                    AnilistMangaService::new(
                        &self.config.anime_and_manga.anilist,
                        self.config.frontend.page_size,
                    )
                    .await,
                ),
                _ => return err(),
            },
            MediaSource::Mal => match lot {
                MediaLot::Anime => Box::new(
                    MalAnimeService::new(
                        &self.config.anime_and_manga.mal,
                        self.config.frontend.page_size,
                    )
                    .await,
                ),
                MediaLot::Manga => Box::new(
                    MalMangaService::new(
                        &self.config.anime_and_manga.mal,
                        self.config.frontend.page_size,
                    )
                    .await,
                ),
                _ => return err(),
            },
            MediaSource::Igdb => Box::new(
                IgdbService::new(&self.config.video_games, self.config.frontend.page_size).await,
            ),
            MediaSource::MangaUpdates => Box::new(
                MangaUpdatesService::new(
                    &self.config.anime_and_manga.manga_updates,
                    self.config.frontend.page_size,
                )
                .await,
            ),
            MediaSource::Custom => return err(),
        };
        Ok(service)
    }

    pub async fn get_tmdb_non_media_service(&self) -> Result<NonMediaTmdbService> {
        Ok(NonMediaTmdbService::new(&self.config.movies_and_shows.tmdb, *self.timezone).await)
    }

    async fn get_non_metadata_provider(&self, source: MediaSource) -> Result<Provider> {
        let err = || Err(Error::new("This source is not supported".to_owned()));
        let service: Provider = match source {
            MediaSource::Vndb => Box::new(
                VndbService::new(&self.config.visual_novels, self.config.frontend.page_size).await,
            ),
            MediaSource::Openlibrary => Box::new(self.get_openlibrary_service().await?),
            MediaSource::Itunes => Box::new(
                ITunesService::new(&self.config.podcasts.itunes, self.config.frontend.page_size)
                    .await,
            ),
            MediaSource::GoogleBooks => Box::new(
                GoogleBooksService::new(
                    &self.config.books.google_books,
                    self.config.frontend.page_size,
                )
                .await,
            ),
            MediaSource::Audible => Box::new(
                AudibleService::new(
                    &self.config.audio_books.audible,
                    self.config.frontend.page_size,
                )
                .await,
            ),
            MediaSource::Listennotes => Box::new(
                ListennotesService::new(&self.config.podcasts, self.config.frontend.page_size)
                    .await,
            ),
            MediaSource::Igdb => Box::new(
                IgdbService::new(&self.config.video_games, self.config.frontend.page_size).await,
            ),
            MediaSource::MangaUpdates => Box::new(
                MangaUpdatesService::new(
                    &self.config.anime_and_manga.manga_updates,
                    self.config.frontend.page_size,
                )
                .await,
            ),
            MediaSource::Tmdb => Box::new(self.get_tmdb_non_media_service().await?),
            MediaSource::Anilist => Box::new(
                NonMediaAnilistService::new(
                    &self.config.anime_and_manga.anilist,
                    self.config.frontend.page_size,
                )
                .await,
            ),
            MediaSource::Mal => Box::new(NonMediaMalService::new().await),
            MediaSource::Custom => return err(),
        };
        Ok(service)
    }

    async fn details_from_provider(
        &self,
        lot: MediaLot,
        source: MediaSource,
        identifier: &str,
    ) -> Result<MediaDetails> {
        let provider = self.get_metadata_provider(lot, source).await?;
        let results = provider.metadata_details(identifier).await?;
        Ok(results)
    }

    pub async fn commit_metadata(&self, input: CommitMediaInput) -> Result<metadata::Model> {
        if let Some(m) = Metadata::find()
            .filter(metadata::Column::Lot.eq(input.lot))
            .filter(metadata::Column::Source.eq(input.source))
            .filter(metadata::Column::Identifier.eq(input.identifier.clone()))
            .one(&self.db)
            .await?
        {
            if input.force_update.unwrap_or_default() {
                tracing::debug!("Forcing update of metadata with id {}", m.id);
                self.update_metadata_and_notify_users(&m.id, true).await?;
            }
            Ok(m)
        } else {
            let details = self
                .details_from_provider(input.lot, input.source, &input.identifier)
                .await?;
            let media = self.commit_metadata_internal(details, None).await?;
            Ok(media)
        }
    }

    pub async fn commit_person(&self, input: CommitPersonInput) -> Result<StringIdObject> {
        if let Some(p) = Person::find()
            .filter(person::Column::Source.eq(input.source))
            .filter(person::Column::Identifier.eq(input.identifier.clone()))
            .apply_if(input.source_specifics.clone(), |query, v| {
                query.filter(person::Column::SourceSpecifics.eq(v))
            })
            .one(&self.db)
            .await?
            .map(|p| StringIdObject { id: p.id })
        {
            Ok(p)
        } else {
            let person = person::ActiveModel {
                identifier: ActiveValue::Set(input.identifier),
                source: ActiveValue::Set(input.source),
                source_specifics: ActiveValue::Set(input.source_specifics),
                name: ActiveValue::Set(input.name),
                is_partial: ActiveValue::Set(Some(true)),
                ..Default::default()
            };
            let person = person.insert(&self.db).await?;
            Ok(StringIdObject { id: person.id })
        }
    }

    pub async fn commit_metadata_group(&self, input: CommitMediaInput) -> Result<StringIdObject> {
        let (group_id, associated_items) = self
            .commit_metadata_group_internal(&input.identifier, input.lot, input.source)
            .await?;
        for (idx, media) in associated_items.into_iter().enumerate() {
            let db_partial_metadata = self.create_partial_metadata(media).await?;
            MetadataToMetadataGroup::delete_many()
                .filter(metadata_to_metadata_group::Column::MetadataGroupId.eq(&group_id))
                .filter(metadata_to_metadata_group::Column::MetadataId.eq(&db_partial_metadata.id))
                .exec(&self.db)
                .await
                .ok();
            let intermediate = metadata_to_metadata_group::ActiveModel {
                metadata_group_id: ActiveValue::Set(group_id.clone()),
                metadata_id: ActiveValue::Set(db_partial_metadata.id),
                part: ActiveValue::Set((idx + 1).try_into().unwrap()),
            };
            intermediate.insert(&self.db).await.ok();
        }
        Ok(StringIdObject { id: group_id })
    }

    async fn review_by_id(
        &self,
        review_id: String,
        user_id: &String,
        respect_preferences: bool,
    ) -> Result<ReviewItem> {
        let review = Review::find_by_id(review_id).one(&self.db).await?;
        match review {
            Some(r) => {
                let user = r.find_related(User).one(&self.db).await.unwrap().unwrap();
                let rating = match respect_preferences {
                    true => {
                        let preferences = user_by_id(&self.db, user_id).await?.preferences;
                        r.rating.map(|s| {
                            s.checked_div(match preferences.general.review_scale {
                                UserReviewScale::OutOfFive => dec!(20),
                                UserReviewScale::OutOfHundred => dec!(1),
                            })
                            .unwrap()
                            .round_dp(1)
                        })
                    }
                    false => r.rating,
                };
                Ok(ReviewItem {
                    id: r.id,
                    posted_on: r.posted_on,
                    rating,
                    is_spoiler: r.is_spoiler,
                    text_original: r.text.clone(),
                    text_rendered: r.text.map(|t| markdown_to_html(&t)),
                    visibility: r.visibility,
                    show_extra_information: r.show_extra_information,
                    podcast_extra_information: r.podcast_extra_information,
                    anime_extra_information: r.anime_extra_information,
                    manga_extra_information: r.manga_extra_information,
                    posted_by: IdAndNamedObject {
                        id: user.id,
                        name: user.name,
                    },
                    comments: r.comments,
                })
            }
            None => Err(Error::new("Unable to find review".to_owned())),
        }
    }

    async fn item_reviews(
        &self,
        user_id: &String,
        metadata_id: Option<String>,
        person_id: Option<String>,
        metadata_group_id: Option<String>,
        collection_id: Option<String>,
    ) -> Result<Vec<ReviewItem>> {
        let all_reviews = Review::find()
            .select_only()
            .column(review::Column::Id)
            .order_by_desc(review::Column::PostedOn)
            .apply_if(metadata_id, |query, v| {
                query.filter(review::Column::MetadataId.eq(v))
            })
            .apply_if(metadata_group_id, |query, v| {
                query.filter(review::Column::MetadataGroupId.eq(v))
            })
            .apply_if(person_id, |query, v| {
                query.filter(review::Column::PersonId.eq(v))
            })
            .apply_if(collection_id, |query, v| {
                query.filter(review::Column::CollectionId.eq(v))
            })
            .into_tuple::<String>()
            .all(&self.db)
            .await
            .unwrap();
        let mut reviews = vec![];
        for r_id in all_reviews {
            reviews.push(self.review_by_id(r_id, user_id, true).await?);
        }
        let all_reviews = reviews
            .into_iter()
            .filter(|r| match r.visibility {
                Visibility::Private => &r.posted_by.id == user_id,
                _ => true,
            })
            .collect();
        Ok(all_reviews)
    }

    async fn user_collections_list(
        &self,
        user_id: &String,
        name: Option<String>,
    ) -> Result<Vec<CollectionItem>> {
        // TODO: Replace when https://github.com/SeaQL/sea-query/pull/787 is merged
        struct JsonBuildObject;
        impl Iden for JsonBuildObject {
            fn unquoted(&self, s: &mut dyn Write) {
                write!(s, "JSON_BUILD_OBJECT").unwrap();
            }
        }
        struct JsonAgg;
        impl Iden for JsonAgg {
            fn unquoted(&self, s: &mut dyn Write) {
                write!(s, "JSON_AGG").unwrap();
            }
        }
        let collaborators_subquery = Query::select()
            .from(UserToCollection)
            .expr(SimpleExpr::FunctionCall(
                Func::cust(JsonAgg).arg(
                    Func::cust(JsonBuildObject)
                        .arg(Expr::val("id"))
                        .arg(Expr::col((AliasedUser::Table, AliasedUser::Id)))
                        .arg(Expr::val("name"))
                        .arg(Expr::col((AliasedUser::Table, AliasedUser::Name))),
                ),
            ))
            .join(
                JoinType::InnerJoin,
                AliasedUser::Table,
                Expr::col((
                    AliasedUserToCollection::Table,
                    AliasedUserToCollection::UserId,
                ))
                .equals((AliasedUser::Table, AliasedUser::Id)),
            )
            .and_where(
                Expr::col((
                    AliasedUserToCollection::Table,
                    AliasedUserToCollection::CollectionId,
                ))
                .equals((AliasedCollection::Table, AliasedCollection::Id)),
            )
            .and_where(
                Expr::col((AliasedUser::Table, AliasedUser::Id))
                    .not_equals((AliasedCollection::Table, AliasedCollection::UserId)),
            )
            .to_owned();
        let count_subquery = Query::select()
            .expr(collection_to_entity::Column::Id.count())
            .from(CollectionToEntity)
            .and_where(
                Expr::col((
                    AliasedCollectionToEntity::Table,
                    AliasedCollectionToEntity::CollectionId,
                ))
                .equals((
                    AliasedUserToCollection::Table,
                    AliasedUserToCollection::CollectionId,
                )),
            )
            .to_owned();
        let collections = Collection::find()
            .apply_if(name, |query, v| {
                query.filter(collection::Column::Name.eq(v))
            })
            .select_only()
            .column(collection::Column::Id)
            .column(collection::Column::Name)
            .column_as(
                collection::Column::Name
                    .is_in(DefaultCollection::iter().map(|s| s.to_string()))
                    .and(collection::Column::UserId.eq(user_id)),
                "is_default",
            )
            .column(collection::Column::InformationTemplate)
            .expr_as_(
                SimpleExpr::SubQuery(None, Box::new(count_subquery.into_sub_query_statement())),
                "count",
            )
            .expr_as_(
                SimpleExpr::FunctionCall(Func::coalesce([
                    SimpleExpr::SubQuery(
                        None,
                        Box::new(collaborators_subquery.into_sub_query_statement()),
                    ),
                    SimpleExpr::FunctionCall(Func::cast_as(Expr::val("[]"), Alias::new("JSON"))),
                ])),
                "collaborators",
            )
            .column(collection::Column::Description)
            .column_as(
                SimpleExpr::FunctionCall(
                    Func::cust(JsonBuildObject)
                        .arg(Expr::val("id"))
                        .arg(Expr::col((AliasedUser::Table, AliasedUser::Id)))
                        .arg(Expr::val("name"))
                        .arg(Expr::col((AliasedUser::Table, AliasedUser::Name))),
                ),
                "creator",
            )
            .order_by_desc(collection::Column::LastUpdatedOn)
            .left_join(User)
            .left_join(UserToCollection)
            .filter(user_to_collection::Column::UserId.eq(user_id))
            .into_model::<CollectionItem>()
            .all(&self.db)
            .await
            .unwrap();
        Ok(collections)
    }

    async fn collection_contents(
        &self,
        input: CollectionContentsInput,
    ) -> Result<CollectionContents> {
        let search = input.search.unwrap_or_default();
        let sort = input.sort.unwrap_or_default();
        let filter = input.filter.unwrap_or_default();
        let page: u64 = search.page.unwrap_or(1).try_into().unwrap();
        let maybe_collection = Collection::find_by_id(input.collection_id.clone())
            .one(&self.db)
            .await
            .unwrap();
        let collection = match maybe_collection {
            Some(c) => c,
            None => return Err(Error::new("Collection not found".to_owned())),
        };

        let take = input
            .take
            .unwrap_or_else(|| self.config.frontend.page_size.try_into().unwrap());
        let results = if take != 0 {
            let paginator = CollectionToEntity::find()
                .left_join(Metadata)
                .left_join(MetadataGroup)
                .left_join(Person)
                .left_join(Exercise)
                .left_join(Workout)
                .filter(collection_to_entity::Column::CollectionId.eq(collection.id.clone()))
                .apply_if(search.query, |query, v| {
                    query.filter(
                        Condition::any()
                            .add(
                                Expr::col((AliasedMetadata::Table, AliasedMetadata::Title))
                                    .ilike(ilike_sql(&v)),
                            )
                            .add(
                                Expr::col((
                                    AliasedMetadataGroup::Table,
                                    AliasedMetadataGroup::Title,
                                ))
                                .ilike(ilike_sql(&v)),
                            )
                            .add(
                                Expr::col((AliasedPerson::Table, AliasedPerson::Name))
                                    .ilike(ilike_sql(&v)),
                            )
                            .add(
                                Expr::col((AliasedExercise::Table, AliasedExercise::Id))
                                    .ilike(ilike_sql(&v)),
                            ),
                    )
                })
                .apply_if(filter.metadata_lot, |query, v| {
                    query.filter(
                        Condition::any()
                            .add(Expr::col((AliasedMetadata::Table, AliasedMetadata::Lot)).eq(v)),
                    )
                })
                .apply_if(filter.entity_type, |query, v| {
                    let f = match v {
                        EntityLot::Metadata => {
                            collection_to_entity::Column::MetadataId.is_not_null()
                        }
                        EntityLot::MetadataGroup => {
                            collection_to_entity::Column::MetadataGroupId.is_not_null()
                        }
                        EntityLot::Person => collection_to_entity::Column::PersonId.is_not_null(),
                        EntityLot::Exercise => {
                            collection_to_entity::Column::ExerciseId.is_not_null()
                        }
                        EntityLot::Workout => collection_to_entity::Column::WorkoutId.is_not_null(),
                        EntityLot::Collection => unreachable!(),
                    };
                    query.filter(f)
                })
                .order_by(
                    match sort.by {
                        CollectionContentsSortBy::LastUpdatedOn => {
                            Expr::col(collection_to_entity::Column::LastUpdatedOn)
                        }
                        CollectionContentsSortBy::Title => Expr::expr(Func::coalesce([
                            Expr::col((AliasedMetadata::Table, AliasedMetadata::Title)).into(),
                            Expr::col((AliasedMetadataGroup::Table, AliasedMetadataGroup::Title))
                                .into(),
                            Expr::col((AliasedPerson::Table, AliasedPerson::Name)).into(),
                            Expr::col((AliasedExercise::Table, AliasedExercise::Id)).into(),
                        ])),
                        CollectionContentsSortBy::Date => Expr::expr(Func::coalesce([
                            Expr::col((AliasedMetadata::Table, AliasedMetadata::PublishDate))
                                .into(),
                            Expr::col((AliasedPerson::Table, AliasedPerson::BirthDate)).into(),
                        ])),
                    },
                    sort.order.into(),
                )
                .paginate(&self.db, take);
            let mut items = vec![];
            let ItemsAndPagesNumber {
                number_of_items,
                number_of_pages,
            } = paginator.num_items_and_pages().await?;
            for cte in paginator.fetch_page(page - 1).await? {
                items.push(EntityWithLot {
                    entity_id: cte.entity_id,
                    entity_lot: cte.entity_lot,
                });
            }
            SearchResults {
                details: SearchDetails {
                    total: number_of_items.try_into().unwrap(),
                    next_page: if page < number_of_pages {
                        Some((page + 1).try_into().unwrap())
                    } else {
                        None
                    },
                },
                items,
            }
        } else {
            SearchResults {
                details: SearchDetails::default(),
                items: vec![],
            }
        };
        let user = collection.find_related(User).one(&self.db).await?.unwrap();
        let reviews = self
            .item_reviews(
                &collection.user_id,
                None,
                None,
                None,
                Some(input.collection_id),
            )
            .await?;
        Ok(CollectionContents {
            details: collection,
            reviews,
            results,
            user,
        })
    }

    pub async fn post_review(
        &self,
        user_id: &String,
        input: PostReviewInput,
    ) -> Result<StringIdObject> {
        let preferences = user_by_id(&self.db, user_id).await?.preferences;
        if preferences.general.disable_reviews {
            return Err(Error::new("Reviews are disabled"));
        }
        let show_ei = if let (Some(season), Some(episode)) =
            (input.show_season_number, input.show_episode_number)
        {
            Some(SeenShowExtraInformation { season, episode })
        } else {
            None
        };
        let podcast_ei = input
            .podcast_episode_number
            .map(|episode| SeenPodcastExtraInformation { episode });
        let anime_ei = input
            .anime_episode_number
            .map(|episode| SeenAnimeExtraInformation {
                episode: Some(episode),
            });
        let manga_ei =
            if input.manga_chapter_number.is_none() && input.manga_volume_number.is_none() {
                None
            } else {
                Some(SeenMangaExtraInformation {
                    chapter: input.manga_chapter_number,
                    volume: input.manga_volume_number,
                })
            };

        if input.rating.is_none() && input.text.is_none() {
            return Err(Error::new("At-least one of rating or review is required."));
        }
        let mut review_obj = review::ActiveModel {
            id: match input.review_id.clone() {
                Some(i) => ActiveValue::Unchanged(i),
                None => ActiveValue::NotSet,
            },
            rating: ActiveValue::Set(input.rating.map(
                |r| match preferences.general.review_scale {
                    UserReviewScale::OutOfFive => r * dec!(20),
                    UserReviewScale::OutOfHundred => r,
                },
            )),
            text: ActiveValue::Set(input.text),
            user_id: ActiveValue::Set(user_id.to_owned()),
            metadata_id: ActiveValue::Set(input.metadata_id),
            metadata_group_id: ActiveValue::Set(input.metadata_group_id),
            person_id: ActiveValue::Set(input.person_id),
            collection_id: ActiveValue::Set(input.collection_id),
            show_extra_information: ActiveValue::Set(show_ei),
            podcast_extra_information: ActiveValue::Set(podcast_ei),
            anime_extra_information: ActiveValue::Set(anime_ei),
            manga_extra_information: ActiveValue::Set(manga_ei),
            comments: ActiveValue::Set(vec![]),
            ..Default::default()
        };
        if let Some(s) = input.is_spoiler {
            review_obj.is_spoiler = ActiveValue::Set(s);
        }
        if let Some(v) = input.visibility {
            review_obj.visibility = ActiveValue::Set(v);
        }
        if let Some(d) = input.date {
            review_obj.posted_on = ActiveValue::Set(d);
        }
        let insert = review_obj.save(&self.db).await.unwrap();
        if insert.visibility.unwrap() == Visibility::Public {
            let (obj_id, obj_title, entity_lot) = if let Some(mi) = insert.metadata_id.unwrap() {
                (
                    mi.to_string(),
                    self.generic_metadata(&mi).await?.model.title,
                    EntityLot::Metadata,
                )
            } else if let Some(mgi) = insert.metadata_group_id.unwrap() {
                (
                    mgi.to_string(),
                    self.metadata_group_details(mgi).await?.details.title,
                    EntityLot::MetadataGroup,
                )
            } else if let Some(pi) = insert.person_id.unwrap() {
                (
                    pi.to_string(),
                    self.person_details(pi).await?.details.name,
                    EntityLot::Person,
                )
            } else if let Some(ci) = insert.collection_id.unwrap() {
                (
                    ci.clone(),
                    self.collection_contents(CollectionContentsInput {
                        collection_id: ci,
                        filter: None,
                        search: None,
                        take: None,
                        sort: None,
                    })
                    .await?
                    .details
                    .name,
                    EntityLot::Collection,
                )
            } else {
                unreachable!()
            };
            let user = user_by_id(&self.db, &insert.user_id.unwrap()).await?;
            // DEV: Do not send notification if updating a review
            if input.review_id.is_none() {
                self.perform_application_job
                    .clone()
                    .enqueue(ApplicationJob::ReviewPosted(ReviewPostedEvent {
                        obj_id,
                        obj_title,
                        entity_lot,
                        username: user.name,
                        review_id: insert.id.clone().unwrap(),
                    }))
                    .await
                    .unwrap();
            }
        }
        Ok(StringIdObject {
            id: insert.id.unwrap(),
        })
    }

    async fn delete_review(&self, user_id: String, review_id: String) -> Result<bool> {
        let review = Review::find()
            .filter(review::Column::Id.eq(review_id))
            .one(&self.db)
            .await
            .unwrap();
        match review {
            Some(r) => {
                if r.user_id == user_id {
                    associate_user_with_entity(
                        &user_id,
                        r.metadata_id.clone(),
                        r.person_id.clone(),
                        None,
                        r.metadata_group_id.clone(),
                        &self.db,
                    )
                    .await?;
                    r.delete(&self.db).await?;
                    Ok(true)
                } else {
                    Err(Error::new("This review does not belong to you".to_owned()))
                }
            }
            None => Ok(false),
        }
    }

    pub async fn create_or_update_collection(
        &self,
        user_id: &String,
        input: CreateOrUpdateCollectionInput,
    ) -> Result<StringIdObject> {
        let meta = Collection::find()
            .filter(collection::Column::Name.eq(input.name.clone()))
            .filter(collection::Column::UserId.eq(user_id))
            .one(&self.db)
            .await
            .unwrap();
        let mut new_name = input.name.clone();
        match meta {
            Some(m) if input.update_id.is_none() => Ok(StringIdObject { id: m.id }),
            _ => {
                let col = collection::ActiveModel {
                    id: match input.update_id {
                        Some(i) => {
                            let already = Collection::find_by_id(i.clone())
                                .one(&self.db)
                                .await
                                .unwrap()
                                .unwrap();
                            if DefaultCollection::iter()
                                .map(|s| s.to_string())
                                .contains(&already.name)
                            {
                                new_name = already.name;
                            }
                            ActiveValue::Unchanged(i.clone())
                        }
                        None => ActiveValue::NotSet,
                    },
                    last_updated_on: ActiveValue::Set(Utc::now()),
                    name: ActiveValue::Set(new_name),
                    user_id: ActiveValue::Set(user_id.to_owned()),
                    description: ActiveValue::Set(input.description),
                    information_template: ActiveValue::Set(input.information_template),
                    ..Default::default()
                };
                let inserted = col.save(&self.db).await.map_err(|_| {
                    Error::new("There was an error creating the collection".to_owned())
                })?;
                let id = inserted.id.unwrap();
                user_to_collection::ActiveModel {
                    user_id: ActiveValue::Set(user_id.to_owned()),
                    collection_id: ActiveValue::Set(id.clone()),
                }
                .insert(&self.db)
                .await
                .ok();
                Ok(StringIdObject { id })
            }
        }
    }

    async fn delete_collection(&self, user_id: String, name: &str) -> Result<bool> {
        if DefaultCollection::iter().any(|col_name| col_name.to_string() == name) {
            return Err(Error::new("Can not delete a default collection".to_owned()));
        }
        let collection = Collection::find()
            .filter(collection::Column::Name.eq(name))
            .filter(collection::Column::UserId.eq(user_id.to_owned()))
            .one(&self.db)
            .await?;
        let resp = if let Some(c) = collection {
            Collection::delete_by_id(c.id).exec(&self.db).await.is_ok()
        } else {
            false
        };
        Ok(resp)
    }

    pub async fn add_entity_to_collection(
        &self,
        user_id: &String,
        input: ChangeCollectionToEntityInput,
    ) -> Result<bool> {
        add_entity_to_collection(&self.db, user_id, input).await
    }

    pub async fn remove_entity_from_collection(
        &self,
        user_id: &String,
        input: ChangeCollectionToEntityInput,
    ) -> Result<StringIdObject> {
        let collect = Collection::find()
            .left_join(UserToCollection)
            .filter(collection::Column::Name.eq(input.collection_name))
            .filter(user_to_collection::Column::UserId.eq(input.creator_user_id))
            .one(&self.db)
            .await
            .unwrap()
            .unwrap();
        CollectionToEntity::delete_many()
            .filter(collection_to_entity::Column::CollectionId.eq(collect.id.clone()))
            .filter(
                collection_to_entity::Column::MetadataId
                    .eq(input.metadata_id.clone())
                    .or(collection_to_entity::Column::PersonId.eq(input.person_id.clone()))
                    .or(collection_to_entity::Column::MetadataGroupId
                        .eq(input.metadata_group_id.clone()))
                    .or(collection_to_entity::Column::ExerciseId.eq(input.exercise_id.clone()))
                    .or(collection_to_entity::Column::WorkoutId.eq(input.workout_id.clone())),
            )
            .exec(&self.db)
            .await?;
        if input.workout_id.is_none() {
            associate_user_with_entity(
                user_id,
                input.metadata_id,
                input.person_id,
                input.exercise_id,
                input.metadata_group_id,
                &self.db,
            )
            .await?;
        }
        Ok(StringIdObject { id: collect.id })
    }

    async fn delete_seen_item(&self, user_id: &String, seen_id: String) -> Result<StringIdObject> {
        let seen_item = Seen::find_by_id(seen_id).one(&self.db).await.unwrap();
        if let Some(si) = seen_item {
            let cloned_seen = si.clone();
            let (ssn, sen) = match &si.show_extra_information {
                Some(d) => (Some(d.season), Some(d.episode)),
                None => (None, None),
            };
            let pen = si.podcast_extra_information.as_ref().map(|d| d.episode);
            let aen = si.anime_extra_information.as_ref().and_then(|d| d.episode);
            let mcn = si.manga_extra_information.as_ref().and_then(|d| d.chapter);
            let cache = ProgressUpdateCache {
                user_id: user_id.to_owned(),
                metadata_id: si.metadata_id.clone(),
                show_season_number: ssn,
                show_episode_number: sen,
                podcast_episode_number: pen,
                anime_episode_number: aen,
                manga_chapter_number: mcn,
            };
            self.seen_progress_cache.cache_remove(&cache).unwrap();
            let seen_id = si.id.clone();
            let metadata_id = si.metadata_id.clone();
            if &si.user_id != user_id {
                return Err(Error::new(
                    "This seen item does not belong to this user".to_owned(),
                ));
            }
            si.delete(&self.db).await.trace_ok();
            associate_user_with_entity(user_id, Some(metadata_id), None, None, None, &self.db)
                .await?;
            self.after_media_seen_tasks(cloned_seen).await?;
            Ok(StringIdObject { id: seen_id })
        } else {
            Err(Error::new("This seen item does not exist".to_owned()))
        }
    }

    async fn update_metadata(
        &self,
        metadata_id: &String,
        force_update: bool,
    ) -> Result<Vec<(String, MediaStateChanged)>> {
        let metadata = Metadata::find_by_id(metadata_id)
            .one(&self.db)
            .await
            .unwrap()
            .unwrap();
        if !force_update {
            // check whether the metadata needs to be updated
            let provider = self
                .get_metadata_provider(metadata.lot, metadata.source)
                .await?;
            if let Ok(false) = provider
                .metadata_updated_since(&metadata.identifier, metadata.last_updated_on)
                .await
            {
                tracing::debug!("Metadata {:?} does not need to be updated", metadata_id);
                return Ok(vec![]);
            }
        }
        tracing::debug!("Updating metadata for {:?}", metadata_id);
        Metadata::update_many()
            .filter(metadata::Column::Id.eq(metadata_id))
            .col_expr(metadata::Column::IsPartial, Expr::value(false))
            .exec(&self.db)
            .await?;
        let maybe_details = self
            .details_from_provider(metadata.lot, metadata.source, &metadata.identifier)
            .await;
        let notifications = match maybe_details {
            Ok(details) => self.update_media(metadata_id, details).await?,
            Err(e) => {
                tracing::error!("Error while updating metadata = {:?}: {:?}", metadata_id, e);
                vec![]
            }
        };
        tracing::debug!("Updated metadata for {:?}", metadata_id);
        Ok(notifications)
    }

    pub async fn update_metadata_and_notify_users(
        &self,
        metadata_id: &String,
        force_update: bool,
    ) -> Result<()> {
        let notifications = self
            .update_metadata(metadata_id, force_update)
            .await
            .unwrap();
        if !notifications.is_empty() {
            let (meta_map, _, _) = self.get_entities_monitored_by().await.unwrap();
            let users_to_notify = meta_map.get(metadata_id).cloned().unwrap_or_default();
            for notification in notifications {
                for user_id in users_to_notify.iter() {
                    self.queue_media_state_changed_notification_for_user(user_id, &notification)
                        .await
                        .trace_ok();
                }
            }
        }
        Ok(())
    }

    async fn user_details(&self, token: &str) -> Result<UserDetailsResult> {
        let found_token = user_id_from_token(token, &self.config.users.jwt_secret);
        if let Ok(user_id) = found_token {
            let user = user_by_id(&self.db, &user_id).await?;
            Ok(UserDetailsResult::Ok(Box::new(user)))
        } else {
            Ok(UserDetailsResult::Error(UserDetailsError {
                error: UserDetailsErrorVariant::AuthTokenInvalid,
            }))
        }
    }

    async fn latest_user_summary(&self, user_id: &String) -> Result<user_summary::Model> {
        let ls = UserSummary::find_by_id(user_id)
            .one(&self.db)
            .await?
            .unwrap();
        Ok(ls)
    }

    #[tracing::instrument(skip(self))]
    pub async fn calculate_user_summary(
        &self,
        user_id: &String,
        calculate_from_beginning: bool,
    ) -> Result<()> {
        let (mut ls, start_from) = match calculate_from_beginning {
            true => {
                UserToEntity::update_many()
                    .filter(user_to_entity::Column::UserId.eq(user_id))
                    .col_expr(
                        user_to_entity::Column::MetadataUnitsConsumed,
                        Expr::value(Some(0)),
                    )
                    .exec(&self.db)
                    .await?;
                (UserSummaryData::default(), None)
            }
            false => {
                let here = self.latest_user_summary(user_id).await?;
                let time = here.calculated_on;
                (here.data, Some(time))
            }
        };

        tracing::debug!("Calculating numbers summary for user: {:?}", ls);

        let metadata_num_reviews = Review::find()
            .filter(review::Column::UserId.eq(user_id.to_owned()))
            .filter(review::Column::MetadataId.is_not_null())
            .count(&self.db)
            .await?;

        tracing::debug!(
            "Calculated number of metadata reviews for user: {:?}",
            metadata_num_reviews
        );

        let person_num_reviews = Review::find()
            .filter(review::Column::UserId.eq(user_id.to_owned()))
            .filter(review::Column::PersonId.is_not_null())
            .count(&self.db)
            .await?;

        tracing::debug!(
            "Calculated number of person reviews for user: {:?}",
            person_num_reviews
        );

        let num_measurements = UserMeasurement::find()
            .filter(user_measurement::Column::UserId.eq(user_id.to_owned()))
            .count(&self.db)
            .await?;

        tracing::debug!(
            "Calculated number measurements for user: {:?}",
            num_measurements
        );

        let num_workouts = Workout::find()
            .filter(workout::Column::UserId.eq(user_id.to_owned()))
            .count(&self.db)
            .await?;

        tracing::debug!("Calculated number workouts for user: {:?}", num_workouts);

        let num_metadata_interacted_with = UserToEntity::find()
            .filter(user_to_entity::Column::UserId.eq(user_id.to_owned()))
            .filter(user_to_entity::Column::MetadataId.is_not_null())
            .count(&self.db)
            .await?;

        tracing::debug!(
            "Calculated number metadata interacted with for user: {:?}",
            num_metadata_interacted_with
        );

        let num_people_interacted_with = UserToEntity::find()
            .filter(user_to_entity::Column::UserId.eq(user_id.to_owned()))
            .filter(user_to_entity::Column::PersonId.is_not_null())
            .count(&self.db)
            .await?;

        tracing::debug!(
            "Calculated number people interacted with for user: {:?}",
            num_people_interacted_with
        );

        let num_exercises_interacted_with = UserToEntity::find()
            .filter(user_to_entity::Column::UserId.eq(user_id.to_owned()))
            .filter(user_to_entity::Column::ExerciseId.is_not_null())
            .count(&self.db)
            .await?;

        tracing::debug!(
            "Calculated number exercises interacted with for user: {:?}",
            num_exercises_interacted_with
        );

        let (total_workout_time, total_workout_weight) = Workout::find()
            .filter(workout::Column::UserId.eq(user_id.to_owned()))
            .select_only()
            .column_as(
                Expr::cust("coalesce(extract(epoch from sum(end_time - start_time)) / 60, 0)"),
                "minutes",
            )
            .column_as(
                Expr::cust("coalesce(sum((summary -> 'total' ->> 'weight')::numeric), 0)"),
                "weight",
            )
            .into_tuple::<(Decimal, Decimal)>()
            .one(&self.db)
            .await?
            .unwrap();

        tracing::debug!(
            "Calculated total workout time for user: {:?}",
            total_workout_time
        );

        ls.media.metadata_overall.reviewed = metadata_num_reviews;
        ls.media.metadata_overall.interacted_with = num_metadata_interacted_with;
        ls.media.people_overall.reviewed = person_num_reviews;
        ls.media.people_overall.interacted_with = num_people_interacted_with;
        ls.fitness.measurements_recorded = num_measurements;
        ls.fitness.exercises_interacted_with = num_exercises_interacted_with;
        ls.fitness.workouts.recorded = num_workouts;
        ls.fitness.workouts.weight = total_workout_weight;
        ls.fitness.workouts.duration = total_workout_time;

        tracing::debug!("Calculated numbers summary for user: {:?}", ls);

        let mut seen_items = Seen::find()
            .filter(seen::Column::UserId.eq(user_id.to_owned()))
            .filter(seen::Column::UserId.eq(user_id.to_owned()))
            .filter(seen::Column::Progress.eq(100))
            .apply_if(start_from, |query, v| {
                query.filter(seen::Column::LastUpdatedOn.gt(v))
            })
            .find_also_related(Metadata)
            .stream(&self.db)
            .await?;

        while let Some((seen, metadata)) = seen_items.try_next().await.unwrap() {
            let meta = metadata.to_owned().unwrap();
            let mut units_consumed = None;
            if let Some(item) = meta.audio_book_specifics {
                ls.unique_items.audio_books.insert(meta.id.clone());
                if let Some(r) = item.runtime {
                    ls.media.audio_books.runtime += r;
                    units_consumed = Some(r);
                }
            } else if let Some(item) = meta.book_specifics {
                ls.unique_items.books.insert(meta.id.clone());
                if let Some(pg) = item.pages {
                    ls.media.books.pages += pg;
                    units_consumed = Some(pg);
                }
            } else if let Some(item) = meta.movie_specifics {
                ls.unique_items.movies.insert(meta.id.clone());
                if let Some(r) = item.runtime {
                    ls.media.movies.runtime += r;
                    units_consumed = Some(r);
                }
            } else if let Some(_item) = meta.anime_specifics {
                ls.unique_items.anime.insert(meta.id.clone());
                if let Some(s) = seen.anime_extra_information.to_owned() {
                    if let Some(episode) = s.episode {
                        ls.unique_items
                            .anime_episodes
                            .insert((meta.id.clone(), episode));
                        units_consumed = Some(1);
                    }
                }
            } else if let Some(_item) = meta.manga_specifics {
                ls.unique_items.manga.insert(meta.id.clone());
                if let Some(s) = seen.manga_extra_information.to_owned() {
                    units_consumed = Some(1);
                    if let Some(chapter) = s.chapter {
                        ls.unique_items
                            .manga_chapters
                            .insert((meta.id.clone(), chapter));
                    }
                    if let Some(volume) = s.volume {
                        ls.unique_items
                            .manga_volumes
                            .insert((meta.id.clone(), volume));
                    }
                }
            } else if let Some(item) = meta.show_specifics {
                ls.unique_items.shows.insert(meta.id.clone());
                if let Some(s) = seen.show_extra_information.to_owned() {
                    if let Some((season, episode)) = item.get_episode(s.season, s.episode) {
                        if let Some(r) = episode.runtime {
                            ls.media.shows.runtime += r;
                            units_consumed = Some(r);
                        }
                        ls.unique_items.show_episodes.insert((
                            meta.id.clone(),
                            season.season_number,
                            episode.episode_number,
                        ));
                        ls.unique_items
                            .show_seasons
                            .insert((meta.id.clone(), season.season_number));
                    }
                };
            } else if let Some(item) = meta.podcast_specifics {
                ls.unique_items.podcasts.insert(meta.id.clone());
                if let Some(s) = seen.podcast_extra_information.to_owned() {
                    if let Some(episode) = item.episode_by_number(s.episode) {
                        if let Some(r) = episode.runtime {
                            ls.media.podcasts.runtime += r;
                            units_consumed = Some(r);
                        }
                        ls.unique_items
                            .podcast_episodes
                            .insert((meta.id.clone(), s.episode));
                    }
                }
            } else if let Some(_item) = meta.video_game_specifics {
                ls.unique_items.video_games.insert(meta.id.clone());
            } else if let Some(item) = meta.visual_novel_specifics {
                ls.unique_items.visual_novels.insert(meta.id.clone());
                if let Some(r) = item.length {
                    ls.media.visual_novels.runtime += r;
                    units_consumed = Some(r);
                }
            };

            if let Some(consumed_update) = units_consumed {
                UserToEntity::update_many()
                    .filter(user_to_entity::Column::UserId.eq(user_id))
                    .filter(user_to_entity::Column::MetadataId.eq(&meta.id))
                    .col_expr(
                        user_to_entity::Column::MetadataUnitsConsumed,
                        Expr::expr(Func::coalesce([
                            Expr::col(user_to_entity::Column::MetadataUnitsConsumed).into(),
                            Expr::val(0).into(),
                        ]))
                        .add(consumed_update),
                    )
                    .exec(&self.db)
                    .await?;
            }
        }

        ls.media.podcasts.played_episodes = ls.unique_items.podcast_episodes.len();
        ls.media.podcasts.played = ls.unique_items.podcasts.len();

        ls.media.shows.watched_episodes = ls.unique_items.show_episodes.len();
        ls.media.shows.watched_seasons = ls.unique_items.show_seasons.len();
        ls.media.shows.watched = ls.unique_items.shows.len();

        ls.media.anime.episodes = ls.unique_items.anime_episodes.len();
        ls.media.anime.watched = ls.unique_items.anime.len();

        ls.media.manga.read = ls.unique_items.manga.len();
        ls.media.manga.chapters = ls.unique_items.manga_chapters.len();

        ls.media.video_games.played = ls.unique_items.video_games.len();
        ls.media.audio_books.played = ls.unique_items.audio_books.len();
        ls.media.books.read = ls.unique_items.books.len();
        ls.media.movies.watched = ls.unique_items.movies.len();
        ls.media.visual_novels.played = ls.unique_items.visual_novels.len();

        let usr = UserSummary::insert(user_summary::ActiveModel {
            data: ActiveValue::Set(ls),
            calculated_on: ActiveValue::Set(Utc::now()),
            user_id: ActiveValue::Set(user_id.to_owned()),
            is_fresh: ActiveValue::Set(calculate_from_beginning),
        })
        .on_conflict(
            OnConflict::column(user_summary::Column::UserId)
                .update_columns([
                    user_summary::Column::Data,
                    user_summary::Column::IsFresh,
                    user_summary::Column::CalculatedOn,
                ])
                .to_owned(),
        )
        .exec_with_returning(&self.db)
        .await?;
        tracing::debug!("Calculated summary for user: {:?}", usr.user_id);
        Ok(())
    }

    async fn register_user(&self, input: RegisterUserInput) -> Result<RegisterResult> {
        if !self.config.users.allow_registration
            && input.admin_access_token.unwrap_or_default() != self.config.server.admin_access_token
        {
            return Ok(RegisterResult::Error(RegisterError {
                error: RegisterErrorVariant::Disabled,
            }));
        }
        let (filter, username, password) = match input.data.clone() {
            AuthUserInput::Oidc(data) => (
                user::Column::OidcIssuerId.eq(&data.issuer_id),
                data.email,
                None,
            ),
            AuthUserInput::Password(data) => (
                user::Column::Name.eq(&data.username),
                data.username,
                Some(data.password),
            ),
        };
        if User::find().filter(filter).count(&self.db).await.unwrap() != 0 {
            return Ok(RegisterResult::Error(RegisterError {
                error: RegisterErrorVariant::IdentifierAlreadyExists,
            }));
        };
        let oidc_issuer_id = match input.data {
            AuthUserInput::Oidc(data) => Some(data.issuer_id),
            AuthUserInput::Password(_) => None,
        };
        let lot = if User::find().count(&self.db).await.unwrap() == 0 {
            UserLot::Admin
        } else {
            UserLot::Normal
        };
        let user = user::ActiveModel {
            id: ActiveValue::Set(format!("usr_{}", nanoid!(12))),
            name: ActiveValue::Set(username),
            password: ActiveValue::Set(password),
            oidc_issuer_id: ActiveValue::Set(oidc_issuer_id),
            lot: ActiveValue::Set(lot),
            preferences: ActiveValue::Set(UserPreferences::default()),
            ..Default::default()
        };
        let user = user.insert(&self.db).await.unwrap();
        tracing::debug!("User {:?} registered with id {:?}", user.name, user.id);
        self.user_created_job(&user.id).await?;
        self.calculate_user_summary(&user.id, true).await?;
        Ok(RegisterResult::Ok(StringIdObject { id: user.id }))
    }

    async fn login_user(&self, input: AuthUserInput) -> Result<LoginResult> {
        let filter = match input.clone() {
            AuthUserInput::Oidc(input) => user::Column::OidcIssuerId.eq(input.issuer_id),
            AuthUserInput::Password(input) => user::Column::Name.eq(input.username),
        };
        match User::find().filter(filter).one(&self.db).await.unwrap() {
            None => Ok(LoginResult::Error(LoginError {
                error: LoginErrorVariant::UsernameDoesNotExist,
            })),
            Some(user) => {
                if user.is_disabled.unwrap_or_default() {
                    return Ok(LoginResult::Error(LoginError {
                        error: LoginErrorVariant::AccountDisabled,
                    }));
                }
                if self.config.users.validate_password {
                    if let AuthUserInput::Password(PasswordUserInput { password, .. }) = input {
                        if let Some(hashed_password) = user.password {
                            let parsed_hash = PasswordHash::new(&hashed_password).unwrap();
                            if get_password_hasher()
                                .verify_password(password.as_bytes(), &parsed_hash)
                                .is_err()
                            {
                                return Ok(LoginResult::Error(LoginError {
                                    error: LoginErrorVariant::CredentialsMismatch,
                                }));
                            }
                        } else {
                            return Ok(LoginResult::Error(LoginError {
                                error: LoginErrorVariant::IncorrectProviderChosen,
                            }));
                        }
                    }
                }
                let jwt_key = self.generate_auth_token(user.id).await?;
                Ok(LoginResult::Ok(LoginResponse { api_key: jwt_key }))
            }
        }
    }

    // this job is run when a user is created for the first time
    async fn user_created_job(&self, user_id: &String) -> Result<()> {
        for col in DefaultCollection::iter() {
            let meta = col.meta().to_owned();
            self.create_or_update_collection(
                user_id,
                CreateOrUpdateCollectionInput {
                    name: col.to_string(),
                    description: Some(meta.1.to_owned()),
                    information_template: meta.0,
                    ..Default::default()
                },
            )
            .await
            .ok();
        }
        Ok(())
    }

    async fn update_user(
        &self,
        user_id: Option<String>,
        input: UpdateUserInput,
    ) -> Result<StringIdObject> {
        if user_id.unwrap_or_default() != input.user_id
            && input.admin_access_token.unwrap_or_default() != self.config.server.admin_access_token
        {
            return Err(Error::new("Admin access token mismatch".to_owned()));
        }
        let mut user_obj: user::ActiveModel = User::find_by_id(input.user_id)
            .one(&self.db)
            .await
            .unwrap()
            .unwrap()
            .into();
        if let Some(n) = input.username {
            user_obj.name = ActiveValue::Set(n);
        }
        if let Some(p) = input.password {
            user_obj.password = ActiveValue::Set(Some(p));
        }
        if let Some(i) = input.extra_information {
            user_obj.extra_information = ActiveValue::Set(Some(i));
        }
        if let Some(l) = input.lot {
            user_obj.lot = ActiveValue::Set(l);
        }
        if let Some(d) = input.is_disabled {
            user_obj.is_disabled = ActiveValue::Set(Some(d));
        }
        let user_obj = user_obj.update(&self.db).await.unwrap();
        Ok(StringIdObject { id: user_obj.id })
    }

    async fn regenerate_user_summaries(&self) -> Result<()> {
        let all_users = User::find()
            .select_only()
            .column(user::Column::Id)
            .into_tuple::<String>()
            .all(&self.db)
            .await
            .unwrap();
        for user_id in all_users {
            self.calculate_user_summary(&user_id, false).await?;
        }
        Ok(())
    }

    async fn create_custom_metadata(
        &self,
        user_id: String,
        input: CreateCustomMetadataInput,
    ) -> Result<metadata::Model> {
        let identifier = nanoid!(10);
        let images = input
            .images
            .unwrap_or_default()
            .into_iter()
            .map(|i| MetadataImageForMediaDetails { image: i })
            .collect();
        let videos = input
            .videos
            .unwrap_or_default()
            .into_iter()
            .map(|i| MetadataVideo {
                identifier: StoredUrl::S3(i),
                source: MetadataVideoSource::Custom,
            })
            .collect();
        let creators = input
            .creators
            .unwrap_or_default()
            .into_iter()
            .map(|c| MetadataFreeCreator {
                name: c,
                role: "Creator".to_string(),
                image: None,
            })
            .collect();
        let is_partial = match input.lot {
            MediaLot::Anime => input.anime_specifics.is_none(),
            MediaLot::AudioBook => input.audio_book_specifics.is_none(),
            MediaLot::Book => input.book_specifics.is_none(),
            MediaLot::Manga => input.manga_specifics.is_none(),
            MediaLot::Movie => input.movie_specifics.is_none(),
            MediaLot::Podcast => input.podcast_specifics.is_none(),
            MediaLot::Show => input.show_specifics.is_none(),
            MediaLot::VideoGame => input.video_game_specifics.is_none(),
            MediaLot::VisualNovel => input.visual_novel_specifics.is_none(),
        };
        let details = MediaDetails {
            identifier,
            title: input.title,
            description: input.description,
            lot: input.lot,
            source: MediaSource::Custom,
            creators,
            genres: input.genres.unwrap_or_default(),
            s3_images: images,
            videos,
            publish_year: input.publish_year,
            anime_specifics: input.anime_specifics,
            audio_book_specifics: input.audio_book_specifics,
            book_specifics: input.book_specifics,
            manga_specifics: input.manga_specifics,
            movie_specifics: input.movie_specifics,
            podcast_specifics: input.podcast_specifics,
            show_specifics: input.show_specifics,
            video_game_specifics: input.video_game_specifics,
            visual_novel_specifics: input.visual_novel_specifics,
            ..Default::default()
        };
        let media = self
            .commit_metadata_internal(details, Some(is_partial))
            .await?;
        self.add_entity_to_collection(
            &user_id,
            ChangeCollectionToEntityInput {
                creator_user_id: user_id.to_owned(),
                collection_name: DefaultCollection::Custom.to_string(),
                metadata_id: Some(media.id.clone()),
                ..Default::default()
            },
        )
        .await?;
        Ok(media)
    }

    fn get_db_stmt(&self, stmt: SelectStatement) -> Statement {
        let (sql, values) = stmt.build(PostgresQueryBuilder {});
        Statement::from_sql_and_values(DatabaseBackend::Postgres, sql, values)
    }

    async fn update_user_preference(
        &self,
        user_id: String,
        input: UpdateUserPreferenceInput,
    ) -> Result<bool> {
        let err = || Error::new("Incorrect property value encountered");
        let user_model = user_by_id(&self.db, &user_id).await?;
        let mut preferences = user_model.preferences.clone();
        match input.property.is_empty() {
            true => {
                preferences = UserPreferences::default();
            }
            false => {
                let (left, right) = input.property.split_once('.').ok_or_else(err)?;
                let value_bool = input.value.parse::<bool>();
                let value_usize = input.value.parse::<usize>();
                match left {
                    "fitness" => {
                        let (left, right) = right.split_once('.').ok_or_else(err)?;
                        match left {
                            "measurements" => {
                                let (left, right) = right.split_once('.').ok_or_else(err)?;
                                match left {
                                    "custom" => {
                                        let value = serde_json::from_str(&input.value).unwrap();
                                        preferences.fitness.measurements.custom = value;
                                    }
                                    "inbuilt" => match right {
                                        "weight" => {
                                            preferences.fitness.measurements.inbuilt.weight =
                                                value_bool.unwrap();
                                        }
                                        "body_mass_index" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .body_mass_index = value_bool.unwrap();
                                        }
                                        "total_body_water" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .total_body_water = value_bool.unwrap();
                                        }
                                        "muscle" => {
                                            preferences.fitness.measurements.inbuilt.muscle =
                                                value_bool.unwrap();
                                        }
                                        "lean_body_mass" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .lean_body_mass = value_bool.unwrap();
                                        }
                                        "body_fat" => {
                                            preferences.fitness.measurements.inbuilt.body_fat =
                                                value_bool.unwrap();
                                        }
                                        "bone_mass" => {
                                            preferences.fitness.measurements.inbuilt.bone_mass =
                                                value_bool.unwrap();
                                        }
                                        "visceral_fat" => {
                                            preferences.fitness.measurements.inbuilt.visceral_fat =
                                                value_bool.unwrap();
                                        }
                                        "waist_circumference" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .waist_circumference = value_bool.unwrap();
                                        }
                                        "waist_to_height_ratio" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .waist_to_height_ratio = value_bool.unwrap();
                                        }
                                        "hip_circumference" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .hip_circumference = value_bool.unwrap();
                                        }
                                        "waist_to_hip_ratio" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .waist_to_hip_ratio = value_bool.unwrap();
                                        }
                                        "chest_circumference" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .chest_circumference = value_bool.unwrap();
                                        }
                                        "thigh_circumference" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .thigh_circumference = value_bool.unwrap();
                                        }
                                        "biceps_circumference" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .biceps_circumference = value_bool.unwrap();
                                        }
                                        "neck_circumference" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .neck_circumference = value_bool.unwrap();
                                        }
                                        "body_fat_caliper" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .body_fat_caliper = value_bool.unwrap();
                                        }
                                        "chest_skinfold" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .chest_skinfold = value_bool.unwrap();
                                        }
                                        "abdominal_skinfold" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .abdominal_skinfold = value_bool.unwrap();
                                        }
                                        "thigh_skinfold" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .thigh_skinfold = value_bool.unwrap();
                                        }
                                        "basal_metabolic_rate" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .basal_metabolic_rate = value_bool.unwrap();
                                        }
                                        "total_daily_energy_expenditure" => {
                                            preferences
                                                .fitness
                                                .measurements
                                                .inbuilt
                                                .total_daily_energy_expenditure =
                                                value_bool.unwrap();
                                        }
                                        "calories" => {
                                            preferences.fitness.measurements.inbuilt.calories =
                                                value_bool.unwrap();
                                        }
                                        _ => return Err(err()),
                                    },
                                    _ => return Err(err()),
                                }
                            }
                            "exercises" => match right {
                                "save_history" => {
                                    preferences.fitness.exercises.save_history =
                                        value_usize.unwrap()
                                }
                                "unit_system" => {
                                    preferences.fitness.exercises.unit_system =
                                        UserUnitSystem::from_str(&input.value).unwrap();
                                }
                                _ => return Err(err()),
                            },
                            _ => return Err(err()),
                        }
                    }
                    "features_enabled" => {
                        let (left, right) = right.split_once('.').ok_or_else(err)?;
                        match left {
                            "others" => match right {
                                "collections" => {
                                    preferences.features_enabled.others.collections =
                                        value_bool.unwrap()
                                }
                                "calendar" => {
                                    preferences.features_enabled.others.calendar =
                                        value_bool.unwrap()
                                }
                                _ => return Err(err()),
                            },
                            "fitness" => match right {
                                "enabled" => {
                                    preferences.features_enabled.fitness.enabled =
                                        value_bool.unwrap()
                                }
                                "measurements" => {
                                    preferences.features_enabled.fitness.measurements =
                                        value_bool.unwrap()
                                }
                                "workouts" => {
                                    preferences.features_enabled.fitness.workouts =
                                        value_bool.unwrap()
                                }
                                _ => return Err(err()),
                            },
                            "media" => {
                                match right {
                                    "enabled" => {
                                        preferences.features_enabled.media.enabled =
                                            value_bool.unwrap()
                                    }
                                    "audio_book" => {
                                        preferences.features_enabled.media.audio_book =
                                            value_bool.unwrap()
                                    }
                                    "book" => {
                                        preferences.features_enabled.media.book =
                                            value_bool.unwrap()
                                    }
                                    "movie" => {
                                        preferences.features_enabled.media.movie =
                                            value_bool.unwrap()
                                    }
                                    "podcast" => {
                                        preferences.features_enabled.media.podcast =
                                            value_bool.unwrap()
                                    }
                                    "show" => {
                                        preferences.features_enabled.media.show =
                                            value_bool.unwrap()
                                    }
                                    "video_game" => {
                                        preferences.features_enabled.media.video_game =
                                            value_bool.unwrap()
                                    }
                                    "visual_novel" => {
                                        preferences.features_enabled.media.visual_novel =
                                            value_bool.unwrap()
                                    }
                                    "manga" => {
                                        preferences.features_enabled.media.manga =
                                            value_bool.unwrap()
                                    }
                                    "anime" => {
                                        preferences.features_enabled.media.anime =
                                            value_bool.unwrap()
                                    }
                                    "people" => {
                                        preferences.features_enabled.media.people =
                                            value_bool.unwrap()
                                    }
                                    "groups" => {
                                        preferences.features_enabled.media.groups =
                                            value_bool.unwrap()
                                    }
                                    "genres" => {
                                        preferences.features_enabled.media.genres =
                                            value_bool.unwrap()
                                    }
                                    _ => return Err(err()),
                                };
                            }
                            _ => return Err(err()),
                        }
                    }
                    "notifications" => match right {
                        "to_send" => {
                            preferences.notifications.to_send =
                                serde_json::from_str(&input.value).unwrap();
                        }
                        "enabled" => {
                            preferences.notifications.enabled = value_bool.unwrap();
                        }
                        _ => return Err(err()),
                    },
                    "general" => match right {
                        "review_scale" => {
                            preferences.general.review_scale =
                                UserReviewScale::from_str(&input.value).unwrap();
                        }
                        "display_nsfw" => {
                            preferences.general.display_nsfw = value_bool.unwrap();
                        }
                        "dashboard" => {
                            let value = serde_json::from_str::<Vec<UserGeneralDashboardElement>>(
                                &input.value,
                            )
                            .unwrap();
                            let default_general_preferences = UserGeneralPreferences::default();
                            if value.len() != default_general_preferences.dashboard.len() {
                                return Err(err());
                            }
                            preferences.general.dashboard = value;
                        }
                        "disable_integrations" => {
                            preferences.general.disable_integrations = value_bool.unwrap();
                        }
                        "persist_queries" => {
                            preferences.general.persist_queries = value_bool.unwrap();
                        }
                        "disable_navigation_animation" => {
                            preferences.general.disable_navigation_animation = value_bool.unwrap();
                        }
                        "disable_videos" => {
                            preferences.general.disable_videos = value_bool.unwrap();
                        }
                        "disable_watch_providers" => {
                            preferences.general.disable_watch_providers = value_bool.unwrap();
                        }
                        "watch_providers" => {
                            preferences.general.watch_providers =
                                serde_json::from_str(&input.value).unwrap();
                        }
                        "disable_reviews" => {
                            preferences.general.disable_reviews = value_bool.unwrap();
                        }
                        _ => return Err(err()),
                    },
                    _ => return Err(err()),
                };
            }
        };
        let mut user_model: user::ActiveModel = user_model.into();
        user_model.preferences = ActiveValue::Set(preferences);
        user_model.update(&self.db).await?;
        Ok(true)
    }

    async fn user_integrations(&self, user_id: &String) -> Result<Vec<integration::Model>> {
        let integrations = Integration::find()
            .filter(integration::Column::UserId.eq(user_id))
            .all(&self.db)
            .await?;
        Ok(integrations)
    }

    async fn user_notification_platforms(
        &self,
        user_id: &String,
    ) -> Result<Vec<notification_platform::Model>> {
        let all_notifications = NotificationPlatform::find()
            .filter(notification_platform::Column::UserId.eq(user_id))
            .all(&self.db)
            .await?;
        Ok(all_notifications)
    }

    async fn create_user_integration(
        &self,
        user_id: String,
        input: CreateUserIntegrationInput,
    ) -> Result<StringIdObject> {
        if input.minimum_progress > input.maximum_progress {
            return Err(Error::new(
                "Minimum progress cannot be greater than maximum progress",
            ));
        }
        let lot = match input.provider {
            IntegrationProvider::Audiobookshelf => IntegrationLot::Yank,
            IntegrationProvider::Radarr | IntegrationProvider::Sonarr => IntegrationLot::Push,
            _ => IntegrationLot::Sink,
        };
        let to_insert = integration::ActiveModel {
            lot: ActiveValue::Set(lot),
            user_id: ActiveValue::Set(user_id),
            provider: ActiveValue::Set(input.provider),
            minimum_progress: ActiveValue::Set(input.minimum_progress),
            maximum_progress: ActiveValue::Set(input.maximum_progress),
            provider_specifics: ActiveValue::Set(input.provider_specifics),
            ..Default::default()
        };
        let integration = to_insert.insert(&self.db).await?;
        Ok(StringIdObject { id: integration.id })
    }

    async fn update_user_integration(
        &self,
        user_id: String,
        input: UpdateUserIntegrationInput,
    ) -> Result<bool> {
        let db_integration = Integration::find_by_id(input.integration_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| Error::new("Integration with the given id does not exist"))?;
        if db_integration.user_id != user_id {
            return Err(Error::new("Integration does not belong to the user"));
        }
        if input.minimum_progress > input.maximum_progress {
            return Err(Error::new(
                "Minimum progress cannot be greater than maximum progress",
            ));
        }
        let mut db_integration: integration::ActiveModel = db_integration.into();
        if let Some(s) = input.minimum_progress {
            db_integration.minimum_progress = ActiveValue::Set(Some(s));
        }
        if let Some(s) = input.maximum_progress {
            db_integration.maximum_progress = ActiveValue::Set(Some(s));
        }
        if let Some(d) = input.is_disabled {
            db_integration.is_disabled = ActiveValue::Set(Some(d));
        }
        db_integration.update(&self.db).await?;
        Ok(true)
    }

    async fn delete_user_integration(
        &self,
        user_id: String,
        integration_id: String,
    ) -> Result<bool> {
        let integration = Integration::find_by_id(integration_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| Error::new("Integration with the given id does not exist"))?;
        if integration.user_id != user_id {
            return Err(Error::new("Integration does not belong to the user"));
        }
        integration.delete(&self.db).await?;
        Ok(true)
    }

    async fn create_user_notification_platform(
        &self,
        user_id: String,
        input: CreateUserNotificationPlatformInput,
    ) -> Result<String> {
        let specifics = match input.lot {
            NotificationPlatformLot::Apprise => NotificationPlatformSpecifics::Apprise {
                url: input.base_url.unwrap(),
                key: input.api_token.unwrap(),
            },
            NotificationPlatformLot::Discord => NotificationPlatformSpecifics::Discord {
                url: input.base_url.unwrap(),
            },
            NotificationPlatformLot::Gotify => NotificationPlatformSpecifics::Gotify {
                url: input.base_url.unwrap(),
                token: input.api_token.unwrap(),
                priority: input.priority,
            },
            NotificationPlatformLot::Ntfy => NotificationPlatformSpecifics::Ntfy {
                url: input.base_url,
                topic: input.api_token.unwrap(),
                priority: input.priority,
                auth_header: input.auth_header,
            },
            NotificationPlatformLot::PushBullet => NotificationPlatformSpecifics::PushBullet {
                api_token: input.api_token.unwrap(),
            },
            NotificationPlatformLot::PushOver => NotificationPlatformSpecifics::PushOver {
                key: input.api_token.unwrap(),
                app_key: input.auth_header,
            },
            NotificationPlatformLot::PushSafer => NotificationPlatformSpecifics::PushSafer {
                key: input.api_token.unwrap(),
            },
            NotificationPlatformLot::Email => NotificationPlatformSpecifics::Email {
                email: input.api_token.unwrap(),
            },
            NotificationPlatformLot::Telegram => NotificationPlatformSpecifics::Telegram {
                bot_token: input.api_token.unwrap(),
                chat_id: input.chat_id.unwrap(),
            },
        };
        let description = match &specifics {
            NotificationPlatformSpecifics::Apprise { url, key } => {
                format!("URL: {}, Key: {}", url, key)
            }
            NotificationPlatformSpecifics::Discord { url } => {
                format!("Webhook: {}", url)
            }
            NotificationPlatformSpecifics::Gotify { url, token, .. } => {
                format!("URL: {}, Token: {}", url, token)
            }
            NotificationPlatformSpecifics::Ntfy { url, topic, .. } => {
                format!("URL: {:?}, Topic: {}", url, topic)
            }
            NotificationPlatformSpecifics::PushBullet { api_token } => {
                format!("API Token: {}", api_token)
            }
            NotificationPlatformSpecifics::PushOver { key, app_key } => {
                format!("Key: {}, App Key: {:?}", key, app_key)
            }
            NotificationPlatformSpecifics::PushSafer { key } => {
                format!("Key: {}", key)
            }
            NotificationPlatformSpecifics::Email { email } => {
                format!("ID: {}", email)
            }
            NotificationPlatformSpecifics::Telegram { chat_id, .. } => {
                format!("Chat ID: {}", chat_id)
            }
        };
        let notification = notification_platform::ActiveModel {
            lot: ActiveValue::Set(input.lot),
            user_id: ActiveValue::Set(user_id),
            platform_specifics: ActiveValue::Set(specifics),
            description: ActiveValue::Set(description),
            ..Default::default()
        };
        let new_notification_id = notification.insert(&self.db).await?.id;
        Ok(new_notification_id)
    }

    async fn update_user_notification_platform(
        &self,
        user_id: String,
        input: UpdateUserNotificationPlatformInput,
    ) -> Result<bool> {
        let db_notification = NotificationPlatform::find_by_id(input.notification_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| Error::new("Notification platform with the given id does not exist"))?;
        if db_notification.user_id != user_id {
            return Err(Error::new(
                "Notification platform does not belong to the user",
            ));
        }
        let mut db_notification: notification_platform::ActiveModel = db_notification.into();
        if let Some(s) = input.is_disabled {
            db_notification.is_disabled = ActiveValue::Set(Some(s));
        }
        db_notification.update(&self.db).await?;
        Ok(true)
    }

    async fn delete_user_notification_platform(
        &self,
        user_id: String,
        notification_id: String,
    ) -> Result<bool> {
        let notification = NotificationPlatform::find_by_id(notification_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| Error::new("Notification platform with the given id does not exist"))?;
        if notification.user_id != user_id {
            return Err(Error::new(
                "Notification platform does not belong to the user",
            ));
        }
        notification.delete(&self.db).await?;
        Ok(true)
    }

    fn providers_language_information(&self) -> Vec<ProviderLanguageInformation> {
        MediaSource::iter()
            .map(|source| {
                let (supported, default) = match source {
                    MediaSource::Itunes => (
                        ITunesService::supported_languages(),
                        ITunesService::default_language(),
                    ),
                    MediaSource::Audible => (
                        AudibleService::supported_languages(),
                        AudibleService::default_language(),
                    ),
                    MediaSource::Openlibrary => (
                        OpenlibraryService::supported_languages(),
                        OpenlibraryService::default_language(),
                    ),
                    MediaSource::Tmdb => (
                        TmdbService::supported_languages(),
                        TmdbService::default_language(),
                    ),
                    MediaSource::Listennotes => (
                        ListennotesService::supported_languages(),
                        ListennotesService::default_language(),
                    ),
                    MediaSource::GoogleBooks => (
                        GoogleBooksService::supported_languages(),
                        GoogleBooksService::default_language(),
                    ),
                    MediaSource::Igdb => (
                        IgdbService::supported_languages(),
                        IgdbService::default_language(),
                    ),
                    MediaSource::MangaUpdates => (
                        MangaUpdatesService::supported_languages(),
                        MangaUpdatesService::default_language(),
                    ),
                    MediaSource::Anilist => (
                        AnilistService::supported_languages(),
                        AnilistService::default_language(),
                    ),
                    MediaSource::Mal => (
                        MalService::supported_languages(),
                        MalService::default_language(),
                    ),
                    MediaSource::Custom => (
                        CustomService::supported_languages(),
                        CustomService::default_language(),
                    ),
                    MediaSource::Vndb => (
                        VndbService::supported_languages(),
                        VndbService::default_language(),
                    ),
                };
                ProviderLanguageInformation {
                    supported,
                    default,
                    source,
                }
            })
            .collect()
    }

    pub async fn yank_integrations_data_for_user(&self, user_id: &String) -> Result<bool> {
        let preferences = self.user_preferences(user_id).await?;
        if preferences.general.disable_integrations {
            return Ok(false);
        }
        let integrations = Integration::find()
            .filter(integration::Column::UserId.eq(user_id))
            .all(&self.db)
            .await?;
        let mut progress_updates = vec![];
        let mut collection_updates = vec![];
        let mut to_update_integrations = vec![];
        let integration_service = self.get_integration_service();
        for integration in integrations.into_iter() {
            if integration.is_disabled.unwrap_or_default() {
                tracing::debug!("Integration {} is disabled", integration.id);
                continue;
            }
            let response = match integration.provider {
                IntegrationProvider::Audiobookshelf => {
                    let specifics = integration.clone().provider_specifics.unwrap();
                    integration_service
                        .audiobookshelf_progress(
                            &specifics.audiobookshelf_base_url.unwrap(),
                            &specifics.audiobookshelf_token.unwrap(),
                            &self.get_isbn_service().await.unwrap(),
                            |input| self.commit_metadata(input),
                        )
                        .await
                }
                _ => continue,
            };
            if let Ok((seen_progress, collection_progress)) = response {
                collection_updates.extend(collection_progress);
                to_update_integrations.push(integration.id.clone());
                progress_updates.push((integration, seen_progress));
            }
        }
        for (integration, progress_updates) in progress_updates.into_iter() {
            for pu in progress_updates.into_iter() {
                self.integration_progress_update(&integration, pu, user_id)
                    .await
                    .trace_ok();
            }
        }
        for col_update in collection_updates.into_iter() {
            let metadata::Model { id, .. } = self
                .commit_metadata(CommitMediaInput {
                    lot: col_update.lot,
                    source: col_update.source,
                    identifier: col_update.identifier.clone(),
                    force_update: None,
                })
                .await?;
            self.add_entity_to_collection(
                user_id,
                ChangeCollectionToEntityInput {
                    creator_user_id: user_id.to_owned(),
                    collection_name: col_update.collection,
                    metadata_id: Some(id.clone()),
                    ..Default::default()
                },
            )
            .await
            .trace_ok();
        }
        Integration::update_many()
            .filter(integration::Column::Id.is_in(to_update_integrations))
            .col_expr(
                integration::Column::LastTriggeredOn,
                Expr::value(Utc::now()),
            )
            .exec(&self.db)
            .await?;
        Ok(true)
    }

    pub async fn yank_integrations_data(&self) -> Result<()> {
        let users_with_integrations = Integration::find()
            .filter(integration::Column::Lot.eq(IntegrationLot::Yank))
            .select_only()
            .column(integration::Column::UserId)
            .into_tuple::<String>()
            .all(&self.db)
            .await?;
        for user_id in users_with_integrations {
            tracing::debug!("Yanking integrations data for user {}", user_id);
            self.yank_integrations_data_for_user(&user_id).await?;
        }
        Ok(())
    }

    pub async fn send_data_for_push_integrations(&self) -> Result<()> {
        let users_with_integrations = Integration::find()
            .filter(integration::Column::Lot.eq(IntegrationLot::Push))
            .select_only()
            .column(integration::Column::UserId)
            .into_tuple::<String>()
            .all(&self.db)
            .await?;
        for user_id in users_with_integrations {
            tracing::debug!("Pushing integrations data for user {}", user_id);
            self.push_integrations_data_for_user(&user_id).await?;
        }
        Ok(())
    }

    pub async fn push_integrations_data_for_user(&self, user_id: &String) -> Result<bool> {
        let preferences = self.user_preferences(user_id).await?;
        if preferences.general.disable_integrations {
            return Ok(false);
        }
        let integrations = Integration::find()
            .filter(integration::Column::UserId.eq(user_id))
            .all(&self.db)
            .await?;
        #[allow(clippy::too_many_arguments)]
        async fn push_data_to_arr_service<F>(
            db: &DatabaseConnection,
            integration: integration::Model,
            lot: MediaLot,
            get_collection_ids: impl Fn(IntegrationProviderSpecifics) -> Vec<String>,
            skip_in: impl Fn(CollectionToEntitySystemInformation) -> Option<Vec<String>>,
            get_identifier: impl Fn(metadata::Model) -> Option<String>,
            perform_push: impl Fn(String, IntegrationProviderSpecifics) -> F,
            column_name: &str,
        ) -> Result<()>
        where
            F: Future<Output = AnyhowResult<()>>,
        {
            let specifics = integration.provider_specifics.unwrap();
            let collection_ids = get_collection_ids(specifics.clone());
            let tmdb_ids_to_add = CollectionToEntity::find()
                .find_also_related(Metadata)
                .filter(metadata::Column::Lot.eq(lot))
                .filter(metadata::Column::Source.eq(MediaSource::Tmdb))
                .filter(collection_to_entity::Column::CollectionId.is_in(collection_ids))
                .all(db)
                .await?;
            let mut cte_to_update = vec![];
            for (cte, metadata) in tmdb_ids_to_add {
                let metadata = metadata.unwrap();
                if skip_in(cte.system_information)
                    .unwrap_or_default()
                    .contains(&integration.id)
                {
                    tracing::debug!("{} {} is already synced", lot, metadata.title);
                    continue;
                }
                if let Some(entity_identifier) = get_identifier(metadata) {
                    perform_push(entity_identifier, specifics.clone())
                        .await
                        .ok();
                    cte_to_update.push(cte.id);
                }
            }
            CollectionToEntity::update_many()
                        .filter(collection_to_entity::Column::Id.is_in(cte_to_update))
                        .col_expr(
                            collection_to_entity::Column::SystemInformation,
                            Expr::cust(
                                format!(
                                    r#"JSONB_SET(system_information, '{{{col}}}', COALESCE(system_information->'{col}','[]'::JSONB) || '["{id}"]'::JSONB)"#,
                                    col = column_name,
                                    id = &integration.id
                                )
                            ),
                        )
                        .exec(db)
                        .await?;
            Ok(())
        }
        let mut to_update_integrations = vec![];
        let integration_service = self.get_integration_service();
        for integration in integrations.into_iter() {
            let id = integration.id.clone();
            match integration.provider {
                IntegrationProvider::Radarr => {
                    push_data_to_arr_service(
                        &self.db,
                        integration,
                        MediaLot::Movie,
                        |specifics| specifics.radarr_sync_collection_ids.unwrap(),
                        |info| info.radarr_synced,
                        |m| Some(m.identifier),
                        |entity_tmdb_id, specifics| {
                            integration_service.radarr_push(
                                specifics.radarr_base_url.unwrap(),
                                specifics.radarr_api_key.unwrap(),
                                specifics.radarr_profile_id.unwrap(),
                                specifics.radarr_root_folder_path.unwrap(),
                                entity_tmdb_id,
                            )
                        },
                        "radarr_synced",
                    )
                    .await
                    .ok();
                }
                IntegrationProvider::Sonarr => {
                    push_data_to_arr_service(
                        &self.db,
                        integration,
                        MediaLot::Show,
                        |specifics| specifics.sonarr_sync_collection_ids.unwrap(),
                        |info| info.sonarr_synced,
                        |m| {
                            m.external_identifiers
                                .and_then(|i| i.tvdb_id.map(|s| s.to_string()))
                        },
                        |entity_tmdb_id, specifics| {
                            integration_service.sonarr_push(
                                specifics.sonarr_base_url.unwrap(),
                                specifics.sonarr_api_key.unwrap(),
                                specifics.sonarr_profile_id.unwrap(),
                                specifics.sonarr_root_folder_path.unwrap(),
                                entity_tmdb_id,
                            )
                        },
                        "sonarr_synced",
                    )
                    .await
                    .ok();
                }
                _ => continue,
            };
            to_update_integrations.push(id);
        }
        Integration::update_many()
            .filter(integration::Column::Id.is_in(to_update_integrations))
            .col_expr(
                integration::Column::LastTriggeredOn,
                Expr::value(Utc::now()),
            )
            .exec(&self.db)
            .await?;
        Ok(true)
    }

    async fn admin_account_guard(&self, user_id: &String) -> Result<()> {
        let main_user = user_by_id(&self.db, user_id).await?;
        if main_user.lot != UserLot::Admin {
            return Err(Error::new(BackendError::AdminOnlyAction.to_string()));
        }
        Ok(())
    }

    async fn users_list(&self, query: Option<String>) -> Result<Vec<user::Model>> {
        let users = User::find()
            .apply_if(query, |query, value| {
                query.filter(Expr::col(user::Column::Name).ilike(ilike_sql(&value)))
            })
            .order_by_asc(user::Column::Name)
            .all(&self.db)
            .await?;
        Ok(users)
    }

    async fn delete_user(&self, to_delete_user_id: String) -> Result<bool> {
        let maybe_user = User::find_by_id(to_delete_user_id).one(&self.db).await?;
        if let Some(u) = maybe_user {
            if self
                .users_list(None)
                .await?
                .into_iter()
                .filter(|u| u.lot == UserLot::Admin)
                .collect_vec()
                .len()
                == 1
                && u.lot == UserLot::Admin
            {
                return Ok(false);
            }
            u.delete(&self.db).await?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn process_integration_webhook(
        &self,
        integration_slug: String,
        payload: String,
    ) -> Result<String> {
        tracing::debug!(
            "Processing integration webhook for slug: {}",
            integration_slug
        );
        let integration = Integration::find_by_id(integration_slug)
            .one(&self.db)
            .await?
            .ok_or_else(|| Error::new("Integration does not exist".to_owned()))?;
        let preferences = self.user_preferences(&integration.user_id).await?;
        if integration.is_disabled.unwrap_or_default() || preferences.general.disable_integrations {
            return Err(Error::new("Integration is disabled".to_owned()));
        }
        let service = self.get_integration_service();
        let maybe_progress_update = match integration.provider {
            IntegrationProvider::Kodi => service.kodi_progress(&payload).await,
            IntegrationProvider::Emby => service.emby_progress(&payload).await,
            IntegrationProvider::Jellyfin => service.jellyfin_progress(&payload).await,
            IntegrationProvider::Plex => {
                let specifics = integration.clone().provider_specifics.unwrap();
                service
                    .plex_progress(&payload, specifics.plex_username)
                    .await
            }
            _ => return Err(Error::new("Unsupported integration source".to_owned())),
        };
        match maybe_progress_update {
            Ok(pu) => {
                self.integration_progress_update(&integration, pu, &integration.user_id)
                    .await?;
                let mut to_update: integration::ActiveModel = integration.into();
                to_update.last_triggered_on = ActiveValue::Set(Some(Utc::now()));
                to_update.update(&self.db).await?;
                Ok("Progress updated successfully".to_owned())
            }
            Err(e) => Err(Error::new(e.to_string())),
        }
    }

    #[tracing::instrument(skip(self))]
    async fn integration_progress_update(
        &self,
        integration: &integration::Model,
        pu: IntegrationMediaSeen,
        user_id: &String,
    ) -> Result<()> {
        if pu.progress < integration.minimum_progress.unwrap() {
            return Ok(());
        }
        let progress = if pu.progress > integration.maximum_progress.unwrap() {
            dec!(100)
        } else {
            pu.progress
        };
        let metadata::Model { id, .. } = self
            .commit_metadata(CommitMediaInput {
                lot: pu.lot,
                source: pu.source,
                identifier: pu.identifier,
                force_update: None,
            })
            .await?;
        if let Err(err) = self
            .progress_update(
                ProgressUpdateInput {
                    metadata_id: id,
                    progress: Some(progress),
                    date: Some(Utc::now().date_naive()),
                    show_season_number: pu.show_season_number,
                    show_episode_number: pu.show_episode_number,
                    podcast_episode_number: pu.podcast_episode_number,
                    anime_episode_number: pu.anime_episode_number,
                    manga_chapter_number: pu.manga_chapter_number,
                    manga_volume_number: pu.manga_volume_number,
                    provider_watched_on: pu.provider_watched_on,
                    change_state: None,
                },
                user_id,
                true,
            )
            .await
        {
            tracing::debug!("Error updating progress: {:?}", err);
        };
        Ok(())
    }

    async fn after_media_seen_tasks(&self, seen: seen::Model) -> Result<()> {
        let add_entity_to_collection = |collection_name: &str| {
            self.add_entity_to_collection(
                &seen.user_id,
                ChangeCollectionToEntityInput {
                    creator_user_id: seen.user_id.clone(),
                    collection_name: collection_name.to_string(),
                    metadata_id: Some(seen.metadata_id.clone()),
                    ..Default::default()
                },
            )
        };
        let remove_entity_from_collection = |collection_name: &str| {
            self.remove_entity_from_collection(
                &seen.user_id,
                ChangeCollectionToEntityInput {
                    creator_user_id: seen.user_id.clone(),
                    collection_name: collection_name.to_string(),
                    metadata_id: Some(seen.metadata_id.clone()),
                    ..Default::default()
                },
            )
        };
        remove_entity_from_collection(&DefaultCollection::Watchlist.to_string())
            .await
            .ok();
        match seen.state {
            SeenState::InProgress => {
                for col in &[DefaultCollection::InProgress, DefaultCollection::Monitoring] {
                    add_entity_to_collection(&col.to_string()).await.ok();
                }
            }
            SeenState::Dropped | SeenState::OnAHold => {
                remove_entity_from_collection(&DefaultCollection::InProgress.to_string())
                    .await
                    .ok();
            }
            SeenState::Completed => {
                let metadata = self.generic_metadata(&seen.metadata_id).await?;
                if metadata.model.lot == MediaLot::Podcast
                    || metadata.model.lot == MediaLot::Show
                    || metadata.model.lot == MediaLot::Anime
                    || metadata.model.lot == MediaLot::Manga
                {
                    let (is_complete, _) = self
                        .is_metadata_finished_by_user(&seen.user_id, &metadata)
                        .await?;
                    if is_complete {
                        remove_entity_from_collection(&DefaultCollection::InProgress.to_string())
                            .await
                            .ok();
                        add_entity_to_collection(&DefaultCollection::Completed.to_string())
                            .await
                            .ok();
                    } else {
                        for col in &[DefaultCollection::InProgress, DefaultCollection::Monitoring] {
                            add_entity_to_collection(&col.to_string()).await.ok();
                        }
                    }
                } else {
                    add_entity_to_collection(&DefaultCollection::Completed.to_string())
                        .await
                        .ok();
                    for col in &[DefaultCollection::InProgress, DefaultCollection::Monitoring] {
                        remove_entity_from_collection(&col.to_string()).await.ok();
                    }
                };
            }
        };
        Ok(())
    }

    async fn is_metadata_finished_by_user(
        &self,
        user_id: &String,
        metadata: &MetadataBaseData,
    ) -> Result<(bool, Vec<seen::Model>)> {
        let metadata = metadata.clone();
        let seen_history = self.seen_history(user_id, &metadata.model.id).await?;
        let is_finished = if metadata.model.lot == MediaLot::Podcast
            || metadata.model.lot == MediaLot::Show
            || metadata.model.lot == MediaLot::Anime
            || metadata.model.lot == MediaLot::Manga
        {
            // DEV: If all episodes have been seen the same number of times, the media can be
            // considered finished.
            let all_episodes = if let Some(s) = metadata.model.show_specifics {
                s.seasons
                    .into_iter()
                    .filter(|s| !SHOW_SPECIAL_SEASON_NAMES.contains(&s.name.as_str()))
                    .flat_map(|s| {
                        s.episodes
                            .into_iter()
                            .map(move |e| format!("{}-{}", s.season_number, e.episode_number))
                    })
                    .collect_vec()
            } else if let Some(p) = metadata.model.podcast_specifics {
                p.episodes
                    .into_iter()
                    .map(|e| format!("{}", e.number))
                    .collect_vec()
            } else if let Some(e) = metadata.model.anime_specifics.and_then(|a| a.episodes) {
                (1..e + 1).map(|e| format!("{}", e)).collect_vec()
            } else if let Some(c) = metadata.model.manga_specifics.and_then(|m| m.chapters) {
                (1..c + 1).map(|e| format!("{}", e)).collect_vec()
            } else {
                vec![]
            };
            if all_episodes.is_empty() {
                return Ok((true, seen_history));
            }
            let mut bag =
                HashMap::<String, i32>::from_iter(all_episodes.iter().cloned().map(|e| (e, 0)));
            seen_history
                .clone()
                .into_iter()
                .map(|h| {
                    if let Some(s) = h.show_extra_information {
                        format!("{}-{}", s.season, s.episode)
                    } else if let Some(p) = h.podcast_extra_information {
                        format!("{}", p.episode)
                    } else if let Some(a) = h.anime_extra_information.and_then(|a| a.episode) {
                        format!("{}", a)
                    } else if let Some(m) = h.manga_extra_information.and_then(|m| m.chapter) {
                        format!("{}", m)
                    } else {
                        String::new()
                    }
                })
                .for_each(|ep| {
                    bag.entry(ep).and_modify(|c| *c += 1);
                });
            let values = bag.values().cloned().collect_vec();

            let min_value = values.iter().min();
            let max_value = values.iter().max();

            match (min_value, max_value) {
                (Some(min), Some(max)) => min == max && *min != 0,
                _ => false,
            }
        } else {
            seen_history.iter().any(|h| h.state == SeenState::Completed)
        };
        Ok((is_finished, seen_history))
    }

    async fn queue_notifications_to_user_platforms(
        &self,
        user_id: &String,
        msg: &str,
    ) -> Result<bool> {
        let user_details = user_by_id(&self.db, user_id).await?;
        if user_details.preferences.notifications.enabled {
            let insert_data = queued_notification::ActiveModel {
                user_id: ActiveValue::Set(user_id.to_owned()),
                message: ActiveValue::Set(msg.to_owned()),
                ..Default::default()
            };
            insert_data.insert(&self.db).await?;
        } else {
            tracing::debug!("User has disabled notifications");
        }
        Ok(true)
    }

    async fn update_watchlist_metadata_and_queue_notifications(&self) -> Result<()> {
        let (meta_map, _, _) = self.get_entities_monitored_by().await?;
        tracing::debug!(
            "Users to be notified for metadata state changes: {:?}",
            meta_map
        );
        for (metadata_id, to_notify) in meta_map {
            let notifications = self.update_metadata(&metadata_id, false).await?;
            for user in to_notify {
                for notification in notifications.iter() {
                    self.queue_media_state_changed_notification_for_user(&user, notification)
                        .await?;
                }
            }
        }
        Ok(())
    }

    async fn update_monitored_people_and_queue_notifications(&self) -> Result<()> {
        let (_, _, person_map) = self.get_entities_monitored_by().await?;
        tracing::debug!(
            "Users to be notified for people state changes: {:?}",
            person_map
        );
        for (person_id, to_notify) in person_map {
            let notifications = self
                .update_person(person_id.parse().unwrap())
                .await
                .unwrap_or_default();
            for user in to_notify {
                for notification in notifications.iter() {
                    self.queue_media_state_changed_notification_for_user(&user, notification)
                        .await?;
                }
            }
        }
        Ok(())
    }

    async fn queue_media_state_changed_notification_for_user(
        &self,
        user_id: &String,
        notification: &(String, MediaStateChanged),
    ) -> Result<()> {
        let (msg, change) = notification;
        let notification_preferences = self.user_preferences(user_id).await?.notifications;
        if notification_preferences.enabled && notification_preferences.to_send.contains(change) {
            self.queue_notifications_to_user_platforms(user_id, msg)
                .await
                .trace_ok();
        } else {
            tracing::debug!("User id = {user_id} has disabled notifications for {change}");
        }
        Ok(())
    }

    async fn genres_list(&self, input: SearchInput) -> Result<SearchResults<GenreListItem>> {
        let page: u64 = input.page.unwrap_or(1).try_into().unwrap();
        let num_items = "num_items";
        let query = Genre::find()
            .column_as(
                Expr::expr(Func::count(Expr::col((
                    AliasedMetadataToGenre::Table,
                    AliasedMetadataToGenre::MetadataId,
                )))),
                num_items,
            )
            .apply_if(input.query, |query, v| {
                query.filter(
                    Condition::all().add(Expr::col(genre::Column::Name).ilike(ilike_sql(&v))),
                )
            })
            .join(JoinType::Join, genre::Relation::MetadataToGenre.def())
            .group_by(Expr::tuple([
                Expr::col(genre::Column::Id).into(),
                Expr::col(genre::Column::Name).into(),
            ]))
            .order_by(Expr::col(Alias::new(num_items)), Order::Desc);
        let paginator = query
            .clone()
            .into_model::<GenreListItem>()
            .paginate(&self.db, self.config.frontend.page_size.try_into().unwrap());
        let ItemsAndPagesNumber {
            number_of_items,
            number_of_pages,
        } = paginator.num_items_and_pages().await?;
        let mut items = vec![];
        for c in paginator.fetch_page(page - 1).await? {
            items.push(c);
        }
        Ok(SearchResults {
            details: SearchDetails {
                total: number_of_items.try_into().unwrap(),
                next_page: if page < number_of_pages {
                    Some((page + 1).try_into().unwrap())
                } else {
                    None
                },
            },
            items,
        })
    }

    async fn metadata_groups_list(
        &self,
        user_id: String,
        input: SearchInput,
    ) -> Result<SearchResults<String>> {
        let page: u64 = input.page.unwrap_or(1).try_into().unwrap();
        let query = MetadataGroup::find()
            .apply_if(input.query, |query, v| {
                query.filter(
                    Condition::all()
                        .add(Expr::col(metadata_group::Column::Title).ilike(ilike_sql(&v))),
                )
            })
            .filter(user_to_entity::Column::UserId.eq(user_id))
            .inner_join(UserToEntity)
            .order_by_asc(metadata_group::Column::Title);
        let paginator = query
            .column(metadata_group::Column::Id)
            .clone()
            .into_tuple::<String>()
            .paginate(&self.db, self.config.frontend.page_size.try_into().unwrap());
        let ItemsAndPagesNumber {
            number_of_items,
            number_of_pages,
        } = paginator.num_items_and_pages().await?;
        let mut items = vec![];
        for c in paginator.fetch_page(page - 1).await? {
            items.push(c);
        }
        Ok(SearchResults {
            details: SearchDetails {
                total: number_of_items.try_into().unwrap(),
                next_page: if page < number_of_pages {
                    Some((page + 1).try_into().unwrap())
                } else {
                    None
                },
            },
            items,
        })
    }

    async fn people_list(
        &self,
        user_id: String,
        input: PeopleListInput,
    ) -> Result<SearchResults<String>> {
        #[derive(Debug, FromQueryResult)]
        struct PartialCreator {
            id: String,
        }
        let page: u64 = input.search.page.unwrap_or(1).try_into().unwrap();
        let alias = "media_count";
        let media_items_col = Expr::col(Alias::new(alias));
        let (order_by, sort_order) = match input.sort {
            None => (media_items_col, Order::Desc),
            Some(ord) => (
                match ord.by {
                    PersonSortBy::Name => Expr::col(person::Column::Name),
                    PersonSortBy::MediaItems => media_items_col,
                },
                ord.order.into(),
            ),
        };
        let query = Person::find()
            .apply_if(input.search.query, |query, v| {
                query.filter(
                    Condition::all().add(Expr::col(person::Column::Name).ilike(ilike_sql(&v))),
                )
            })
            .column_as(
                Expr::expr(Func::count(Expr::col((
                    Alias::new("metadata_to_person"),
                    metadata_to_person::Column::MetadataId,
                )))),
                alias,
            )
            .filter(user_to_entity::Column::UserId.eq(user_id))
            .left_join(MetadataToPerson)
            .inner_join(UserToEntity)
            .group_by(person::Column::Id)
            .group_by(person::Column::Name)
            .order_by(order_by, sort_order);
        let creators_paginator = query
            .clone()
            .into_model::<PartialCreator>()
            .paginate(&self.db, self.config.frontend.page_size.try_into().unwrap());
        let ItemsAndPagesNumber {
            number_of_items,
            number_of_pages,
        } = creators_paginator.num_items_and_pages().await?;
        let mut creators = vec![];
        for cr in creators_paginator.fetch_page(page - 1).await? {
            creators.push(cr.id);
        }
        Ok(SearchResults {
            details: SearchDetails {
                total: number_of_items.try_into().unwrap(),
                next_page: if page < number_of_pages {
                    Some((page + 1).try_into().unwrap())
                } else {
                    None
                },
            },
            items: creators,
        })
    }

    async fn person_details(&self, person_id: String) -> Result<PersonDetails> {
        let mut details = Person::find_by_id(person_id.clone())
            .one(&self.db)
            .await?
            .unwrap();
        if details.is_partial.unwrap_or_default() {
            self.deploy_update_person_job(person_id.clone()).await?;
        }
        details.display_images = details.images.as_urls(&self.file_storage_service).await;
        let associations = MetadataToPerson::find()
            .filter(metadata_to_person::Column::PersonId.eq(person_id))
            .order_by_asc(metadata_to_person::Column::Index)
            .all(&self.db)
            .await?;
        let mut contents: HashMap<_, Vec<_>> = HashMap::new();
        for assoc in associations {
            let to_push = PersonDetailsItemWithCharacter {
                character: assoc.character,
                media_id: assoc.metadata_id,
            };
            contents
                .entry(assoc.role)
                .and_modify(|e| {
                    e.push(to_push.clone());
                })
                .or_insert(vec![to_push]);
        }
        let contents = contents
            .into_iter()
            .sorted_by_key(|(role, _)| role.clone())
            .map(|(name, items)| PersonDetailsGroupedByRole { name, items })
            .collect_vec();
        let slug = slug::slugify(&details.name);
        let identifier = &details.identifier;
        let source_url = match details.source {
            MediaSource::Custom
            | MediaSource::Anilist
            | MediaSource::Listennotes
            | MediaSource::Itunes
            | MediaSource::MangaUpdates
            | MediaSource::Mal
            | MediaSource::Vndb
            | MediaSource::GoogleBooks => None,
            MediaSource::Audible => Some(format!(
                "https://www.audible.com/author/{slug}/{identifier}"
            )),
            MediaSource::Openlibrary => Some(format!(
                "https://openlibrary.org/authors/{identifier}/{slug}"
            )),
            MediaSource::Tmdb => Some(format!(
                "https://www.themoviedb.org/person/{identifier}-{slug}"
            )),
            MediaSource::Igdb => Some(format!("https://www.igdb.com/companies/{slug}")),
        };
        Ok(PersonDetails {
            details,
            contents,
            source_url,
        })
    }

    async fn genre_details(&self, input: GenreDetailsInput) -> Result<GenreDetails> {
        let page = input.page.unwrap_or(1);
        let genre = Genre::find_by_id(input.genre_id.clone())
            .one(&self.db)
            .await?
            .unwrap();
        let paginator = MetadataToGenre::find()
            .filter(metadata_to_genre::Column::GenreId.eq(input.genre_id))
            .paginate(&self.db, self.config.frontend.page_size as u64);
        let ItemsAndPagesNumber {
            number_of_items,
            number_of_pages,
        } = paginator.num_items_and_pages().await?;
        let mut contents = vec![];
        for association_items in paginator.fetch_page(page - 1).await? {
            contents.push(association_items.metadata_id);
        }
        Ok(GenreDetails {
            details: GenreListItem {
                id: genre.id,
                name: genre.name,
                num_items: Some(number_of_items.try_into().unwrap()),
            },
            contents: SearchResults {
                details: SearchDetails {
                    total: number_of_items.try_into().unwrap(),
                    next_page: if page < number_of_pages {
                        Some((page + 1).try_into().unwrap())
                    } else {
                        None
                    },
                },
                items: contents,
            },
        })
    }

    async fn metadata_group_details(
        &self,
        metadata_group_id: String,
    ) -> Result<MetadataGroupDetails> {
        let mut group = MetadataGroup::find_by_id(metadata_group_id)
            .one(&self.db)
            .await?
            .unwrap();
        let mut images = vec![];
        for image in group.images.iter() {
            images.push(
                self.file_storage_service
                    .get_stored_asset(image.url.clone())
                    .await,
            );
        }
        group.display_images = images;
        let slug = slug::slugify(&group.title);
        let identifier = &group.identifier;

        let source_url = match group.source {
            MediaSource::Custom
            | MediaSource::Anilist
            | MediaSource::Listennotes
            | MediaSource::Itunes
            | MediaSource::MangaUpdates
            | MediaSource::Mal
            | MediaSource::Openlibrary
            | MediaSource::Vndb
            | MediaSource::GoogleBooks => None,
            MediaSource::Audible => Some(format!(
                "https://www.audible.com/series/{slug}/{identifier}"
            )),
            MediaSource::Tmdb => Some(format!(
                "https://www.themoviedb.org/collections/{identifier}-{slug}"
            )),
            MediaSource::Igdb => Some(format!("https://www.igdb.com/collection/{slug}")),
        };

        let contents = MetadataToMetadataGroup::find()
            .select_only()
            .column(metadata_to_metadata_group::Column::MetadataId)
            .filter(metadata_to_metadata_group::Column::MetadataGroupId.eq(group.id.clone()))
            .order_by_asc(metadata_to_metadata_group::Column::Part)
            .into_tuple::<String>()
            .all(&self.db)
            .await?;
        Ok(MetadataGroupDetails {
            details: group,
            source_url,
            contents,
        })
    }

    async fn queue_pending_reminders(&self) -> Result<()> {
        #[derive(Debug, Serialize, Deserialize)]
        #[serde(rename_all = "PascalCase")]
        struct UserMediaReminder {
            reminder: NaiveDate,
            text: String,
        }
        for (cte, col) in CollectionToEntity::find()
            .find_also_related(Collection)
            .filter(collection::Column::Name.eq(DefaultCollection::Reminders.to_string()))
            .all(&self.db)
            .await?
        {
            if let Some(reminder) = cte.information {
                let reminder: UserMediaReminder =
                    serde_json::from_str(&serde_json::to_string(&reminder)?)?;
                let col = col.unwrap();
                let related_users = col.find_related(UserToCollection).all(&self.db).await?;
                if get_current_date(self.timezone.as_ref()) == reminder.reminder {
                    for user in related_users {
                        self.queue_notifications_to_user_platforms(&user.user_id, &reminder.text)
                            .await?;
                        self.remove_entity_from_collection(
                            &user.user_id,
                            ChangeCollectionToEntityInput {
                                creator_user_id: col.user_id.clone(),
                                collection_name: DefaultCollection::Reminders.to_string(),
                                metadata_id: cte.metadata_id.clone(),
                                exercise_id: cte.exercise_id.clone(),
                                metadata_group_id: cte.metadata_group_id.clone(),
                                person_id: cte.person_id.clone(),
                                ..Default::default()
                            },
                        )
                        .await?;
                    }
                }
            }
        }
        Ok(())
    }

    pub async fn export_media(
        &self,
        user_id: &String,
        writer: &mut JsonStreamWriter<File>,
    ) -> Result<bool> {
        let related_metadata = UserToEntity::find()
            .filter(user_to_entity::Column::UserId.eq(user_id))
            .filter(user_to_entity::Column::MetadataId.is_not_null())
            .all(&self.db)
            .await
            .unwrap();
        for rm in related_metadata.iter() {
            let m = rm
                .find_related(Metadata)
                .one(&self.db)
                .await
                .unwrap()
                .unwrap();
            let seen_history = m
                .find_related(Seen)
                .filter(seen::Column::UserId.eq(user_id))
                .all(&self.db)
                .await
                .unwrap();
            let seen_history = seen_history
                .into_iter()
                .map(|s| {
                    let (show_season_number, show_episode_number) = match s.show_extra_information {
                        Some(d) => (Some(d.season), Some(d.episode)),
                        None => (None, None),
                    };
                    let podcast_episode_number = s.podcast_extra_information.map(|d| d.episode);
                    let anime_episode_number = s.anime_extra_information.and_then(|d| d.episode);
                    let manga_chapter_number =
                        s.manga_extra_information.clone().and_then(|d| d.chapter);
                    let manga_volume_number = s.manga_extra_information.and_then(|d| d.volume);
                    ImportOrExportMediaItemSeen {
                        progress: Some(s.progress),
                        started_on: s.started_on,
                        ended_on: s.finished_on,
                        provider_watched_on: s.provider_watched_on,
                        show_season_number,
                        show_episode_number,
                        podcast_episode_number,
                        anime_episode_number,
                        manga_chapter_number,
                        manga_volume_number,
                    }
                })
                .collect();
            let db_reviews = m
                .find_related(Review)
                .filter(review::Column::UserId.eq(user_id))
                .all(&self.db)
                .await
                .unwrap();
            let mut reviews = vec![];
            for review in db_reviews {
                let review_item = get_review_export_item(
                    self.review_by_id(review.id, user_id, false).await.unwrap(),
                );
                reviews.push(review_item);
            }
            let collections =
                entity_in_collections(&self.db, user_id, Some(m.id), None, None, None, None)
                    .await?
                    .into_iter()
                    .map(|c| c.name)
                    .collect();
            let exp = ImportOrExportMediaItem {
                source_id: m.title,
                lot: m.lot,
                source: m.source,
                identifier: m.identifier.clone(),
                seen_history,
                reviews,
                collections,
            };
            writer.serialize_value(&exp).unwrap();
        }
        Ok(true)
    }

    pub async fn export_media_group(
        &self,
        user_id: &String,
        writer: &mut JsonStreamWriter<File>,
    ) -> Result<bool> {
        let related_metadata = UserToEntity::find()
            .filter(user_to_entity::Column::UserId.eq(user_id))
            .filter(user_to_entity::Column::MetadataGroupId.is_not_null())
            .all(&self.db)
            .await
            .unwrap();
        for rm in related_metadata.iter() {
            let m = rm
                .find_related(MetadataGroup)
                .one(&self.db)
                .await
                .unwrap()
                .unwrap();
            let db_reviews = m
                .find_related(Review)
                .filter(review::Column::UserId.eq(user_id))
                .all(&self.db)
                .await
                .unwrap();
            let mut reviews = vec![];
            for review in db_reviews {
                let review_item = get_review_export_item(
                    self.review_by_id(review.id, user_id, false).await.unwrap(),
                );
                reviews.push(review_item);
            }
            let collections =
                entity_in_collections(&self.db, user_id, None, None, Some(m.id), None, None)
                    .await?
                    .into_iter()
                    .map(|c| c.name)
                    .collect();
            let exp = ImportOrExportMediaGroupItem {
                title: m.title,
                lot: m.lot,
                source: m.source,
                identifier: m.identifier.clone(),
                reviews,
                collections,
            };
            writer.serialize_value(&exp).unwrap();
        }
        Ok(true)
    }

    pub async fn export_people(
        &self,
        user_id: &String,
        writer: &mut JsonStreamWriter<File>,
    ) -> Result<bool> {
        let related_people = UserToEntity::find()
            .filter(user_to_entity::Column::UserId.eq(user_id))
            .filter(user_to_entity::Column::PersonId.is_not_null())
            .all(&self.db)
            .await
            .unwrap();
        for rm in related_people.iter() {
            let p = rm
                .find_related(Person)
                .one(&self.db)
                .await
                .unwrap()
                .unwrap();
            let db_reviews = p
                .find_related(Review)
                .filter(review::Column::UserId.eq(user_id))
                .all(&self.db)
                .await
                .unwrap();
            let mut reviews = vec![];
            for review in db_reviews {
                let review_item = get_review_export_item(
                    self.review_by_id(review.id, user_id, false).await.unwrap(),
                );
                reviews.push(review_item);
            }
            let collections =
                entity_in_collections(&self.db, user_id, None, Some(p.id), None, None, None)
                    .await?
                    .into_iter()
                    .map(|c| c.name)
                    .collect();
            let exp = ImportOrExportPersonItem {
                identifier: p.identifier,
                source: p.source,
                source_specifics: p.source_specifics,
                name: p.name,
                reviews,
                collections,
            };
            writer.serialize_value(&exp).unwrap();
        }
        Ok(true)
    }

    async fn generate_auth_token(&self, user_id: String) -> Result<String> {
        let auth_token = jwt::sign(
            user_id,
            &self.config.users.jwt_secret,
            self.config.users.token_valid_for_days,
        )?;
        Ok(auth_token)
    }

    async fn create_review_comment(
        &self,
        user_id: String,
        input: CreateReviewCommentInput,
    ) -> Result<bool> {
        let review = Review::find_by_id(input.review_id)
            .one(&self.db)
            .await?
            .unwrap();
        let mut comments = review.comments.clone();
        if input.should_delete.unwrap_or_default() {
            let position = comments
                .iter()
                .position(|r| &r.id == input.comment_id.as_ref().unwrap())
                .unwrap();
            comments.remove(position);
        } else if input.increment_likes.unwrap_or_default() {
            let comment = comments
                .iter_mut()
                .find(|r| &r.id == input.comment_id.as_ref().unwrap())
                .unwrap();
            comment.liked_by.insert(user_id.clone());
        } else if input.decrement_likes.unwrap_or_default() {
            let comment = comments
                .iter_mut()
                .find(|r| &r.id == input.comment_id.as_ref().unwrap())
                .unwrap();
            comment.liked_by.remove(&user_id);
        } else {
            let user = user_by_id(&self.db, &user_id).await?;
            comments.push(ImportOrExportItemReviewComment {
                id: nanoid!(20),
                text: input.text.unwrap(),
                user: IdAndNamedObject {
                    id: user_id,
                    name: user.name,
                },
                liked_by: HashSet::new(),
                created_on: Utc::now(),
            });
        }
        let mut review: review::ActiveModel = review.into();
        review.comments = ActiveValue::Set(comments);
        review.update(&self.db).await?;
        Ok(true)
    }

    #[tracing::instrument(skip(self))]
    pub async fn recalculate_calendar_events(&self) -> Result<()> {
        let date_to_calculate_from = get_current_date(self.timezone.as_ref()).pred_opt().unwrap();

        let mut meta_stream = Metadata::find()
            .filter(metadata::Column::LastUpdatedOn.gte(date_to_calculate_from))
            .filter(metadata::Column::IsPartial.eq(false))
            .stream(&self.db)
            .await?;

        while let Some(meta) = meta_stream.try_next().await? {
            tracing::trace!("Processing metadata id = {:#?}", meta.id);
            let calendar_events = meta.find_related(CalendarEvent).all(&self.db).await?;
            for cal_event in calendar_events {
                let mut need_to_delete = true;
                if let Some(show) = cal_event.metadata_show_extra_information {
                    if let Some(show_info) = &meta.show_specifics {
                        if let Some((season, ep)) = show_info.get_episode(show.season, show.episode)
                        {
                            if !SHOW_SPECIAL_SEASON_NAMES.contains(&season.name.as_str()) {
                                if let Some(publish_date) = ep.publish_date {
                                    if publish_date == cal_event.date {
                                        need_to_delete = false;
                                    }
                                }
                            }
                        }
                    }
                } else if let Some(podcast) = cal_event.metadata_podcast_extra_information {
                    if let Some(podcast_info) = &meta.podcast_specifics {
                        if let Some(ep) = podcast_info.episode_by_number(podcast.episode) {
                            if ep.publish_date == cal_event.date {
                                need_to_delete = false;
                            }
                        }
                    }
                } else if cal_event.date == meta.publish_date.unwrap() {
                    need_to_delete = false;
                };

                if need_to_delete {
                    tracing::debug!(
                        "Need to delete calendar event id = {:#?} since it is outdated",
                        cal_event.id
                    );
                    CalendarEvent::delete_by_id(cal_event.id)
                        .exec(&self.db)
                        .await?;
                }
            }
        }

        tracing::debug!("Finished deleting invalid calendar events");

        let mut metadata_stream = Metadata::find()
            .filter(metadata::Column::LastUpdatedOn.gte(date_to_calculate_from))
            .filter(metadata::Column::PublishDate.is_not_null())
            .filter(
                metadata::Column::IsPartial
                    .is_null()
                    .or(metadata::Column::IsPartial.eq(false)),
            )
            .order_by_desc(metadata::Column::LastUpdatedOn)
            .stream(&self.db)
            .await?;
        let mut calendar_events_inserts = vec![];
        let mut metadata_updates = vec![];
        while let Some(meta) = metadata_stream.try_next().await? {
            if let Some(ps) = &meta.podcast_specifics {
                for episode in ps.episodes.iter() {
                    let event = calendar_event::ActiveModel {
                        metadata_id: ActiveValue::Set(Some(meta.id.clone())),
                        date: ActiveValue::Set(episode.publish_date),
                        metadata_podcast_extra_information: ActiveValue::Set(Some(
                            SeenPodcastExtraInformation {
                                episode: episode.number,
                            },
                        )),
                        ..Default::default()
                    };
                    calendar_events_inserts.push(event);
                }
            } else if let Some(ss) = &meta.show_specifics {
                for season in ss.seasons.iter() {
                    if SHOW_SPECIAL_SEASON_NAMES.contains(&season.name.as_str()) {
                        continue;
                    }
                    for episode in season.episodes.iter() {
                        if let Some(date) = episode.publish_date {
                            let event = calendar_event::ActiveModel {
                                metadata_id: ActiveValue::Set(Some(meta.id.clone())),
                                date: ActiveValue::Set(date),
                                metadata_show_extra_information: ActiveValue::Set(Some(
                                    SeenShowExtraInformation {
                                        season: season.season_number,
                                        episode: episode.episode_number,
                                    },
                                )),
                                ..Default::default()
                            };
                            calendar_events_inserts.push(event);
                        }
                    }
                }
            } else {
                let event = calendar_event::ActiveModel {
                    metadata_id: ActiveValue::Set(Some(meta.id.clone())),
                    date: ActiveValue::Set(meta.publish_date.unwrap()),
                    ..Default::default()
                };
                calendar_events_inserts.push(event);
            };
            metadata_updates.push(meta.id.clone());
        }
        tracing::debug!(
            "Inserting {} calendar events",
            calendar_events_inserts.len()
        );
        for cal_insert in calendar_events_inserts {
            cal_insert.insert(&self.db).await.ok();
        }
        tracing::debug!("Finished updating calendar events");
        Ok(())
    }

    #[tracing::instrument(skip(self))]
    async fn queue_notifications_for_released_media(&self) -> Result<()> {
        let today = get_current_date(self.timezone.as_ref());
        let calendar_events = CalendarEvent::find()
            .filter(calendar_event::Column::Date.eq(today))
            .find_also_related(Metadata)
            .all(&self.db)
            .await?;
        let notifications = calendar_events
            .into_iter()
            .map(|(cal_event, meta)| {
                let meta = meta.unwrap();
                let url = self.get_entity_details_frontend_url(
                    meta.id.to_string(),
                    EntityLot::Metadata,
                    None,
                );
                let notification = if let Some(show) = cal_event.metadata_show_extra_information {
                    format!(
                        "S{}E{} of {} ({}) has been released today.",
                        show.season, show.episode, meta.title, url
                    )
                } else if let Some(podcast) = cal_event.metadata_podcast_extra_information {
                    format!(
                        "E{} of {} ({}) has been released today.",
                        podcast.episode, meta.title, url
                    )
                } else {
                    format!("{} ({}) has been released today.", meta.title, url)
                };
                (
                    meta.id.to_string(),
                    (notification, MediaStateChanged::MetadataPublished),
                )
            })
            .collect_vec();
        let (meta_map, _, _) = self.get_entities_monitored_by().await?;
        for (metadata_id, notification) in notifications.into_iter() {
            let users_to_notify = meta_map.get(&metadata_id).cloned().unwrap_or_default();
            for user in users_to_notify {
                self.queue_media_state_changed_notification_for_user(&user, &notification)
                    .await?;
            }
        }
        Ok(())
    }

    async fn update_person(&self, person_id: String) -> Result<Vec<(String, MediaStateChanged)>> {
        let mut notifications = vec![];
        let person = Person::find_by_id(person_id.clone())
            .one(&self.db)
            .await?
            .unwrap();
        let provider = self.get_non_metadata_provider(person.source).await?;
        let provider_person = provider
            .person_details(&person.identifier, &person.source_specifics)
            .await?;
        let images = provider_person.images.map(|images| {
            images
                .into_iter()
                .map(|i| MetadataImage {
                    url: StoredUrl::Url(i),
                })
                .collect()
        });
        let mut default_state_changes = person.clone().state_changes.unwrap_or_default();
        let mut to_update_person: person::ActiveModel = person.clone().into();
        to_update_person.last_updated_on = ActiveValue::Set(Utc::now());
        to_update_person.description = ActiveValue::Set(provider_person.description);
        to_update_person.gender = ActiveValue::Set(provider_person.gender);
        to_update_person.birth_date = ActiveValue::Set(provider_person.birth_date);
        to_update_person.death_date = ActiveValue::Set(provider_person.death_date);
        to_update_person.place = ActiveValue::Set(provider_person.place);
        to_update_person.website = ActiveValue::Set(provider_person.website);
        to_update_person.images = ActiveValue::Set(images);
        to_update_person.is_partial = ActiveValue::Set(Some(false));
        to_update_person.name = ActiveValue::Set(provider_person.name);
        for (role, media) in provider_person.related.clone() {
            let title = media.title.clone();
            let pm = self.create_partial_metadata(media).await?;
            let already_intermediate = MetadataToPerson::find()
                .filter(metadata_to_person::Column::MetadataId.eq(&pm.id))
                .filter(metadata_to_person::Column::PersonId.eq(&person_id))
                .filter(metadata_to_person::Column::Role.eq(&role))
                .one(&self.db)
                .await?;
            if already_intermediate.is_none() {
                let intermediate = metadata_to_person::ActiveModel {
                    person_id: ActiveValue::Set(person.id.clone()),
                    metadata_id: ActiveValue::Set(pm.id.clone()),
                    role: ActiveValue::Set(role.clone()),
                    ..Default::default()
                };
                intermediate.insert(&self.db).await.unwrap();
            }
            let search_for = MediaAssociatedPersonStateChanges {
                media: CommitMediaInput {
                    identifier: pm.identifier.clone(),
                    lot: pm.lot,
                    source: pm.source,
                    ..Default::default()
                },
                role: role.clone(),
            };
            if !default_state_changes.media_associated.contains(&search_for) {
                notifications.push((
                    format!(
                        "{} has been associated with {} as {}",
                        person.name, title, role
                    ),
                    MediaStateChanged::PersonMediaAssociated,
                ));
                default_state_changes.media_associated.insert(search_for);
            }
        }
        to_update_person.state_changes = ActiveValue::Set(Some(default_state_changes));
        to_update_person.update(&self.db).await.unwrap();
        Ok(notifications)
    }

    pub async fn update_person_and_notify_users(&self, person_id: String) -> Result<()> {
        let notifications = self
            .update_person(person_id.clone())
            .await
            .unwrap_or_default();
        if !notifications.is_empty() {
            let (_, _, person_map) = self.get_entities_monitored_by().await.unwrap();
            let users_to_notify = person_map.get(&person_id).cloned().unwrap_or_default();
            for notification in notifications {
                for user_id in users_to_notify.iter() {
                    self.queue_media_state_changed_notification_for_user(user_id, &notification)
                        .await
                        .trace_ok();
                }
            }
        }
        Ok(())
    }

    async fn get_entities_monitored_by(
        &self,
    ) -> Result<(
        EntityBeingMonitoredByMap,
        EntityBeingMonitoredByMap,
        EntityBeingMonitoredByMap,
    )> {
        #[derive(Debug, FromQueryResult, Clone, Default)]
        struct UsersToBeNotified {
            entity_id: String,
            to_notify: Vec<String>,
        }
        let get_sql = |entity_type: &str| {
            format!(
                r#"
SELECT
    m.id as entity_id,
    array_agg(DISTINCT u.id) as to_notify
FROM {entity_type} m
JOIN collection_to_entity cte ON m.id = cte.{entity_type}_id
JOIN collection c ON cte.collection_id = c.id AND c.name = '{}'
JOIN "user" u ON c.user_id = u.id
GROUP BY m.id;
        "#,
                DefaultCollection::Monitoring
            )
        };
        let meta_map: Vec<_> = UsersToBeNotified::find_by_statement(
            Statement::from_sql_and_values(DbBackend::Postgres, get_sql("metadata"), []),
        )
        .all(&self.db)
        .await?;
        let meta_map = meta_map
            .into_iter()
            .map(|m| (m.entity_id, m.to_notify))
            .collect::<EntityBeingMonitoredByMap>();
        let meta_group_map: Vec<_> = UsersToBeNotified::find_by_statement(
            Statement::from_sql_and_values(DbBackend::Postgres, get_sql("metadata_group"), []),
        )
        .all(&self.db)
        .await?;
        let meta_group_map = meta_group_map
            .into_iter()
            .map(|m| (m.entity_id, m.to_notify))
            .collect::<EntityBeingMonitoredByMap>();
        let person_map: Vec<_> = UsersToBeNotified::find_by_statement(
            Statement::from_sql_and_values(DbBackend::Postgres, get_sql("person"), []),
        )
        .all(&self.db)
        .await?;
        let person_map = person_map
            .into_iter()
            .map(|m| (m.entity_id, m.to_notify))
            .collect::<EntityBeingMonitoredByMap>();
        Ok((meta_map, meta_group_map, person_map))
    }

    pub async fn handle_review_posted_event(&self, event: ReviewPostedEvent) -> Result<()> {
        let (meta_map, meta_group_map, person_map) = self.get_entities_monitored_by().await?;
        let monitored_by = match event.entity_lot {
            EntityLot::Metadata => meta_map.get(&event.obj_id).cloned().unwrap_or_default(),
            EntityLot::MetadataGroup => meta_group_map
                .get(&event.obj_id)
                .cloned()
                .unwrap_or_default(),
            EntityLot::Person => person_map.get(&event.obj_id).cloned().unwrap_or_default(),
            _ => vec![],
        };
        let users = User::find()
            .select_only()
            .column(user::Column::Id)
            .filter(user::Column::Id.is_in(monitored_by))
            .filter(Expr::cust(format!(
                "(preferences -> 'notifications' -> 'to_send' ? '{}') = true",
                MediaStateChanged::ReviewPosted
            )))
            .into_tuple::<String>()
            .all(&self.db)
            .await?;
        for user_id in users {
            let url = self.get_entity_details_frontend_url(
                event.obj_id.clone(),
                event.entity_lot,
                Some("reviews"),
            );
            self.queue_notifications_to_user_platforms(
                &user_id,
                &format!(
                    "New review posted for {} ({}, {}) by {}.",
                    event.obj_title, event.entity_lot, url, event.username
                ),
            )
            .await?;
        }
        Ok(())
    }

    fn get_entity_details_frontend_url(
        &self,
        id: String,
        entity_lot: EntityLot,
        default_tab: Option<&str>,
    ) -> String {
        let mut url = match entity_lot {
            EntityLot::Metadata => format!("media/item/{}", id),
            EntityLot::Collection => format!("collections/{}", id),
            EntityLot::Person => format!("media/people/item/{}", id),
            EntityLot::Workout => format!("fitness/workouts/{}", id),
            EntityLot::Exercise => format!("fitness/exercises/{}", id),
            EntityLot::MetadataGroup => format!("media/groups/item/{}", id),
        };
        url = format!("{}/{}", self.config.frontend.url, url);
        if let Some(tab) = default_tab {
            url += format!("?defaultTab={}", tab).as_str()
        }
        url
    }

    async fn get_oidc_redirect_url(&self) -> Result<String> {
        match self.oidc_client.as_ref() {
            Some(client) => {
                let (authorize_url, _, _) = client
                    .authorize_url(
                        AuthenticationFlow::<CoreResponseType>::AuthorizationCode,
                        CsrfToken::new_random,
                        Nonce::new_random,
                    )
                    .add_scope(Scope::new("email".to_string()))
                    .url();
                Ok(authorize_url.to_string())
            }
            _ => Err(Error::new("OIDC client not configured")),
        }
    }

    async fn get_oidc_token(&self, code: String) -> Result<OidcTokenOutput> {
        match self.oidc_client.as_ref() {
            Some(client) => {
                let token = client
                    .exchange_code(AuthorizationCode::new(code))
                    .request_async(async_http_client)
                    .await?;
                let id_token = token.id_token().unwrap();
                let claims = id_token.claims(&client.id_token_verifier(), empty_nonce_verifier)?;
                let subject = claims.subject().to_string();
                let email = claims
                    .email()
                    .map(|e| e.to_string())
                    .ok_or_else(|| Error::new("Email not found in OIDC token claims"))?;
                Ok(OidcTokenOutput { subject, email })
            }
            _ => Err(Error::new("OIDC client not configured")),
        }
    }

    async fn user_by_oidc_issuer_id(&self, oidc_issuer_id: String) -> Result<Option<String>> {
        let user = User::find()
            .filter(user::Column::OidcIssuerId.eq(oidc_issuer_id))
            .one(&self.db)
            .await?
            .map(|u| u.id);
        Ok(user)
    }

    async fn invalidate_import_jobs(&self) -> Result<()> {
        let all_jobs = ImportReport::find()
            .filter(import_report::Column::WasSuccess.is_null())
            .all(&self.db)
            .await?;
        for job in all_jobs {
            if Utc::now() - job.started_on > ChronoDuration::try_hours(24).unwrap() {
                tracing::debug!("Invalidating job with id = {id}", id = job.id);
                let mut job: import_report::ActiveModel = job.into();
                job.was_success = ActiveValue::Set(Some(false));
                job.save(&self.db).await?;
            }
        }
        Ok(())
    }

    async fn remove_old_entities_from_monitoring_collection(&self) -> Result<()> {
        #[derive(Debug, FromQueryResult)]
        struct CustomQueryResponse {
            id: i32,
            created_on: DateTimeUtc,
            last_updated_on: Option<DateTimeUtc>,
        }
        let all_cte = CollectionToEntity::find()
            .select_only()
            .column(collection_to_entity::Column::Id)
            .column(collection_to_entity::Column::CreatedOn)
            .column(metadata::Column::LastUpdatedOn)
            .left_join(Metadata)
            .inner_join(Collection)
            .filter(collection::Column::Name.eq(DefaultCollection::Monitoring.to_string()))
            .order_by_asc(collection_to_entity::Column::Id)
            .into_model::<CustomQueryResponse>()
            .all(&self.db)
            .await?;
        let mut to_delete = vec![];
        for cte in all_cte {
            let delta = cte.last_updated_on.unwrap_or_else(Utc::now) - cte.created_on;
            if delta.num_days().abs() > self.config.media.monitoring_remove_after_days {
                to_delete.push(cte.id);
            }
        }
        CollectionToEntity::delete_many()
            .filter(collection_to_entity::Column::Id.is_in(to_delete))
            .exec(&self.db)
            .await?;
        Ok(())
    }

    pub async fn remove_useless_data(&self) -> Result<()> {
        let mut metadata_stream = Metadata::find()
            .select_only()
            .column(metadata::Column::Id)
            .left_join(UserToEntity)
            .filter(user_to_entity::Column::MetadataId.is_null())
            .into_tuple::<String>()
            .stream(&self.db)
            .await?;
        while let Some(meta) = metadata_stream.try_next().await? {
            tracing::debug!("Removing metadata id = {:#?}", meta);
            Metadata::delete_by_id(meta).exec(&self.db).await?;
        }
        let mut people_stream = Person::find()
            .select_only()
            .column(person::Column::Id)
            .left_join(UserToEntity)
            .filter(user_to_entity::Column::PersonId.is_null())
            .into_tuple::<String>()
            .stream(&self.db)
            .await?;
        while let Some(person) = people_stream.try_next().await? {
            tracing::debug!("Removing person id = {:#?}", person);
            Person::delete_by_id(person).exec(&self.db).await?;
        }
        let mut metadata_group_stream = MetadataGroup::find()
            .select_only()
            .column(metadata_group::Column::Id)
            .left_join(UserToEntity)
            .filter(user_to_entity::Column::MetadataGroupId.is_null())
            .into_tuple::<String>()
            .stream(&self.db)
            .await?;
        while let Some(meta_group) = metadata_group_stream.try_next().await? {
            tracing::debug!("Removing metadata group id = {:#?}", meta_group);
            MetadataGroup::delete_by_id(meta_group)
                .exec(&self.db)
                .await?;
        }
        let mut genre_stream = Genre::find()
            .select_only()
            .column(genre::Column::Id)
            .left_join(MetadataToGenre)
            .filter(metadata_to_genre::Column::MetadataId.is_null())
            .into_tuple::<String>()
            .stream(&self.db)
            .await?;
        while let Some(genre) = genre_stream.try_next().await? {
            tracing::debug!("Removing genre id = {:#?}", genre);
            Genre::delete_by_id(genre).exec(&self.db).await?;
        }
        tracing::debug!("Deleting all queued notifications");
        QueuedNotification::delete_many().exec(&self.db).await?;
        Ok(())
    }

    async fn test_user_notification_platforms(&self, user_id: &String) -> Result<bool> {
        let notifications = NotificationPlatform::find()
            .filter(notification_platform::Column::UserId.eq(user_id))
            .all(&self.db)
            .await?;
        for platform in notifications {
            if platform.is_disabled.unwrap_or_default() {
                continue;
            }
            let msg = format!("This is a test notification for platform: {}", platform.lot);
            platform
                .platform_specifics
                .send_message(&self.config, &msg)
                .await?;
        }
        Ok(true)
    }

    #[tracing::instrument(skip(self))]
    pub async fn send_pending_notifications(&self) -> Result<()> {
        let users = User::find().all(&self.db).await?;
        for user_details in users {
            tracing::debug!("Sending notification to user: {:?}", user_details.id);
            let notifications = QueuedNotification::find()
                .filter(queued_notification::Column::UserId.eq(&user_details.id))
                .all(&self.db)
                .await?;
            if notifications.is_empty() {
                continue;
            }
            let msg = notifications
                .into_iter()
                .map(|n| n.message)
                .collect::<Vec<String>>()
                .join("\n");
            let platforms = NotificationPlatform::find()
                .filter(notification_platform::Column::UserId.eq(&user_details.id))
                .all(&self.db)
                .await?;
            for notification in platforms {
                if notification.is_disabled.unwrap_or_default() {
                    tracing::debug!(
                        "Skipping sending notification to user: {} for platform: {} since it is disabled",
                        user_details.id,
                        notification.lot
                    );
                    continue;
                }
                if let Err(err) = notification
                    .platform_specifics
                    .send_message(&self.config, &msg)
                    .await
                {
                    tracing::trace!("Error sending notification: {:?}", err);
                }
            }
        }
        Ok(())
    }

    pub async fn perform_background_jobs(&self) -> Result<()> {
        tracing::debug!("Starting background jobs...");

        tracing::trace!("Invalidating invalid media import jobs");
        self.invalidate_import_jobs().await.trace_ok();
        tracing::trace!("Removing stale entities from Monitoring collection");
        self.remove_old_entities_from_monitoring_collection()
            .await
            .trace_ok();
        tracing::trace!("Checking for updates for media in Watchlist");
        self.update_watchlist_metadata_and_queue_notifications()
            .await
            .trace_ok();
        tracing::trace!("Checking for updates for monitored people");
        self.update_monitored_people_and_queue_notifications()
            .await
            .trace_ok();
        tracing::trace!("Checking and queuing any pending reminders");
        self.queue_pending_reminders().await.trace_ok();
        tracing::trace!("Recalculating calendar events");
        self.recalculate_calendar_events().await.trace_ok();
        tracing::trace!("Queuing notifications for released media");
        self.queue_notifications_for_released_media()
            .await
            .trace_ok();
        tracing::trace!("Sending all pending notifications");
        self.send_pending_notifications().await.trace_ok();
        tracing::trace!("Cleaning up user and metadata association");
        self.cleanup_user_and_metadata_association()
            .await
            .trace_ok();
        tracing::trace!("Removing old user summaries and regenerating them");
        self.regenerate_user_summaries().await.trace_ok();
        tracing::trace!("Removing useless data");
        self.remove_useless_data().await.trace_ok();

        tracing::debug!("Completed background jobs...");
        Ok(())
    }

    #[cfg(debug_assertions)]
    async fn development_mutation(&self) -> Result<bool> {
        Ok(true)
    }
}
