--
-- PostgreSQL database dump
--

\restrict j0zS1YybO7IPtcJxy9ONeBKIaXJBXaXxzwxKQnVNLQIIVc1bKUCxYazgBD8jnUr

-- Dumped from database version 18.1 (Homebrew)
-- Dumped by pg_dump version 18.1 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_following_users DROP CONSTRAINT IF EXISTS "FK_user_following_users_following_id";
ALTER TABLE IF EXISTS ONLY public.user_following_users DROP CONSTRAINT IF EXISTS "FK_user_following_users_follower_id";
ALTER TABLE IF EXISTS ONLY public."requestMatchesPosts" DROP CONSTRAINT IF EXISTS "FK_fd473bd2ef9b7a23f41a40ebed4";
ALTER TABLE IF EXISTS ONLY public.searches DROP CONSTRAINT IF EXISTS "FK_fc8760cf4823ab84b0cb28d3dad";
ALTER TABLE IF EXISTS ONLY public."TransactionReview" DROP CONSTRAINT IF EXISTS "FK_f7cf58b571d5c57ed9da155c628";
ALTER TABLE IF EXISTS ONLY public."eventPostRelationships" DROP CONSTRAINT IF EXISTS "FK_eventPost_postId";
ALTER TABLE IF EXISTS ONLY public."eventPostRelationships" DROP CONSTRAINT IF EXISTS "FK_eventPost_eventTagId";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_dd826149b8ac72ddc2d1f4e234e";
ALTER TABLE IF EXISTS ONLY public."FCMToken" DROP CONSTRAINT IF EXISTS "FK_d215a8d66e472d872409915f7d5";
ALTER TABLE IF EXISTS ONLY public."Request" DROP CONSTRAINT IF EXISTS "FK_cdaf52464b00ac3016a8f6110fd";
ALTER TABLE IF EXISTS ONLY public."userBlockingUsers" DROP CONSTRAINT IF EXISTS "FK_bc2ca85580a5c620ccc7f03f5db";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "FK_bba9ded63ef0013ac2ec578f246";
ALTER TABLE IF EXISTS ONLY public."userSavedPosts" DROP CONSTRAINT IF EXISTS "FK_baa3d7e5e872010a3c23e981532";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_a050c9cf7f461bc8fc040a48e0a";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "FK_97e81bcb59530bfb061e48aee6a";
ALTER TABLE IF EXISTS ONLY public."postCategories" DROP CONSTRAINT IF EXISTS "FK_978f319769e3d7285d6d2e40af8";
ALTER TABLE IF EXISTS ONLY public.user_following_users DROP CONSTRAINT IF EXISTS "FK_80ef95f34370fd0704c156c13ef";
ALTER TABLE IF EXISTS ONLY public."userBlockingUsers" DROP CONSTRAINT IF EXISTS "FK_793578cc63c2442a7944e93131a";
ALTER TABLE IF EXISTS ONLY public."postEventTags" DROP CONSTRAINT IF EXISTS "FK_7532bd6ca893c432ffcfa21f755";
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS "FK_692a909ee0fa9383e7859f9b406";
ALTER TABLE IF EXISTS ONLY public."postEventTags" DROP CONSTRAINT IF EXISTS "FK_61151ebab50db74ea513ff8bd87";
ALTER TABLE IF EXISTS ONLY public."UserReview" DROP CONSTRAINT IF EXISTS "FK_53a14948aa4e941762a403144ea";
ALTER TABLE IF EXISTS ONLY public.user_following_users DROP CONSTRAINT IF EXISTS "FK_503e9a09612f9668063099baff1";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_4bc548745107f37d3512ed688c5";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "FK_4ae4b1f6ff200ae67b40eb5bd8d";
ALTER TABLE IF EXISTS ONLY public."requestMatchesPosts" DROP CONSTRAINT IF EXISTS "FK_3b2f09095e41d9c82bedaa0d8fe";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "FK_30d551dc74a9537b73d4007592f";
ALTER TABLE IF EXISTS ONLY public."Feedback" DROP CONSTRAINT IF EXISTS "FK_26bcf6b3c7c6b742e63d9308676";
ALTER TABLE IF EXISTS ONLY public."postCategories" DROP CONSTRAINT IF EXISTS "FK_1f4b27b2e31fb6263f6fb3a9390";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_16c178e84273608caf9db34df88";
ALTER TABLE IF EXISTS ONLY public."UserReview" DROP CONSTRAINT IF EXISTS "FK_14e4fa2651e5c6d6118e2ba18aa";
ALTER TABLE IF EXISTS ONLY public."userSavedPosts" DROP CONSTRAINT IF EXISTS "FK_0c0a06e6163f7a7315c4ce5fd4c";
DROP INDEX IF EXISTS public."IDX_user_following_users_following_id";
DROP INDEX IF EXISTS public."IDX_user_following_users_follower_id";
DROP INDEX IF EXISTS public."IDX_fd473bd2ef9b7a23f41a40ebed";
DROP INDEX IF EXISTS public."IDX_eventPost_postId";
DROP INDEX IF EXISTS public."IDX_eventPost_eventTagId";
DROP INDEX IF EXISTS public."IDX_bc2ca85580a5c620ccc7f03f5d";
DROP INDEX IF EXISTS public."IDX_baa3d7e5e872010a3c23e98153";
DROP INDEX IF EXISTS public."IDX_978f319769e3d7285d6d2e40af";
DROP INDEX IF EXISTS public."IDX_80ef95f34370fd0704c156c13e";
DROP INDEX IF EXISTS public."IDX_793578cc63c2442a7944e93131";
DROP INDEX IF EXISTS public."IDX_7532bd6ca893c432ffcfa21f75";
DROP INDEX IF EXISTS public."IDX_61151ebab50db74ea513ff8bd8";
DROP INDEX IF EXISTS public."IDX_503e9a09612f9668063099baff";
DROP INDEX IF EXISTS public."IDX_3b2f09095e41d9c82bedaa0d8f";
DROP INDEX IF EXISTS public."IDX_1f4b27b2e31fb6263f6fb3a939";
DROP INDEX IF EXISTS public."IDX_0c0a06e6163f7a7315c4ce5fd4";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."eventPostRelationships" DROP CONSTRAINT IF EXISTS "UQ_eventPost_postId_eventTagId";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_ec60b02aab67f0f99f6f88797ed";
ALTER TABLE IF EXISTS ONLY public."TransactionReview" DROP CONSTRAINT IF EXISTS "UQ_aff62b169ebd519d1f5994e781a";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_4a257d2c9837248d70640b3e36e";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_29a05908a0fa0728526d2833657";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_02dec29f4ca814ab6efa2d4f0c4";
ALTER TABLE IF EXISTS ONLY public.searches DROP CONSTRAINT IF EXISTS "PK_searches";
ALTER TABLE IF EXISTS ONLY public."eventPostRelationships" DROP CONSTRAINT IF EXISTS "PK_eventPostRelationships";
ALTER TABLE IF EXISTS ONLY public."postEventTags" DROP CONSTRAINT IF EXISTS "PK_cc14f1e77d0b18c8ec995937fd0";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "PK_c4d3b3dcd73db0b0129ea829f9f";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "PK_c2727780c5b9b0c564c29a4977c";
ALTER TABLE IF EXISTS ONLY public."TransactionReview" DROP CONSTRAINT IF EXISTS "PK_TransactionReview";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "PK_Transaction";
ALTER TABLE IF EXISTS ONLY public."FCMToken" DROP CONSTRAINT IF EXISTS "PK_FCMToken";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "PK_9dbb4c593be9832c28a5793e258";
ALTER TABLE IF EXISTS ONLY public."EventTag" DROP CONSTRAINT IF EXISTS "PK_929d8d89bf95d848ac3b7546a29";
ALTER TABLE IF EXISTS ONLY public."UserReview" DROP CONSTRAINT IF EXISTS "PK_91b62f63709469ae812a3519dd1";
ALTER TABLE IF EXISTS ONLY public."userBlockingUsers" DROP CONSTRAINT IF EXISTS "PK_8db623e58cc4bce5fbcc252c66b";
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS "PK_8c82d7f526340ab734260ea46be";
ALTER TABLE IF EXISTS ONLY public."postCategories" DROP CONSTRAINT IF EXISTS "PK_88340cf0b1b8a00578602f4c80b";
ALTER TABLE IF EXISTS ONLY public."Feedback" DROP CONSTRAINT IF EXISTS "PK_7ffea537e9c56670b65c2d62316";
ALTER TABLE IF EXISTS ONLY public."requestMatchesPosts" DROP CONSTRAINT IF EXISTS "PK_7f4c04956dd4e84a3437b2a8018";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "PK_7dd6398f0d1dcaf73df342fa325";
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS "PK_6a72c3c0f683f6462415e653c3a";
ALTER TABLE IF EXISTS ONLY public."Request" DROP CONSTRAINT IF EXISTS "PK_23de24dc477765bcc099feae8e5";
ALTER TABLE IF EXISTS ONLY public."userSavedPosts" DROP CONSTRAINT IF EXISTS "PK_11901fe92c42b2d2a71ca74021a";
ALTER TABLE IF EXISTS ONLY public.user_following_users DROP CONSTRAINT IF EXISTS "PK_01b7a923c26f4be4f7c138cbb88";
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.user_following_users;
DROP TABLE IF EXISTS public."userSavedPosts";
DROP TABLE IF EXISTS public."userBlockingUsers";
DROP TABLE IF EXISTS public.typeorm_metadata;
DROP TABLE IF EXISTS public.searches;
DROP TABLE IF EXISTS public."requestMatchesPosts";
DROP TABLE IF EXISTS public."postEventTags";
DROP TABLE IF EXISTS public."postCategories";
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP TABLE IF EXISTS public."eventPostRelationships";
DROP TABLE IF EXISTS public."UserReview";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."TransactionReview";
DROP TABLE IF EXISTS public."Transaction";
DROP TABLE IF EXISTS public."Request";
DROP TABLE IF EXISTS public."Report";
DROP TABLE IF EXISTS public."Post";
DROP TABLE IF EXISTS public."Message";
DROP TABLE IF EXISTS public."Feedback";
DROP TABLE IF EXISTS public."FCMToken";
DROP TABLE IF EXISTS public."EventTag";
DROP TABLE IF EXISTS public."Category";
DROP EXTENSION IF EXISTS vector;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: EventTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EventTag" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: FCMToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FCMToken" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fcmToken" character varying NOT NULL,
    "notificationsEnabled" boolean NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    "userId" character varying
);


--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Feedback" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description character varying NOT NULL,
    images text[] NOT NULL,
    "userId" character varying
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id uuid NOT NULL
);


--
-- Name: Post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Post" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    "originalPrice" numeric CONSTRAINT "Post_original_price_not_null" NOT NULL,
    "alteredPrice" numeric DEFAULT '-1'::numeric CONSTRAINT "Post_altered_price_not_null" NOT NULL,
    images text[] NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    location character varying,
    archive boolean DEFAULT false NOT NULL,
    condition character varying NOT NULL,
    sold boolean DEFAULT false NOT NULL,
    embedding double precision[],
    "userId" character varying
);


--
-- Name: Report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Report" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reason character varying NOT NULL,
    type character varying NOT NULL,
    resolved boolean NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    "reporterFirebaseUid" character varying,
    "reportedFirebaseUid" character varying,
    "postId" uuid,
    "messageId" uuid
);


--
-- Name: Request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Request" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    archive boolean DEFAULT false NOT NULL,
    embedding double precision[],
    "userId" character varying
);


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transaction" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    location character varying NOT NULL,
    amount numeric NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "postId" uuid,
    "buyerId" character varying,
    "sellerId" character varying,
    "transactionDate" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "confirmationSent" boolean DEFAULT false NOT NULL
);


--
-- Name: TransactionReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransactionReview" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    stars integer NOT NULL,
    "transactionId" uuid,
    "hadIssues" boolean DEFAULT false NOT NULL,
    "issueCategory" text,
    "issueDetails" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    comments text
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    username character varying NOT NULL,
    netid character varying,
    admin boolean NOT NULL,
    stars numeric DEFAULT '0'::numeric NOT NULL,
    email character varying NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "firebaseUid" character varying NOT NULL,
    "givenName" character varying,
    "familyName" character varying,
    "numReviews" integer DEFAULT 0 NOT NULL,
    "photoUrl" character varying,
    "venmoHandle" character varying,
    "googleId" character varying,
    "soldPosts" integer DEFAULT 0 NOT NULL,
    "availabilityId" character varying
);


--
-- Name: UserReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserReview" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fulfilled boolean NOT NULL,
    stars integer NOT NULL,
    comments character varying NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL,
    "buyerId" character varying,
    "sellerId" character varying
);


--
-- Name: eventPostRelationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."eventPostRelationships" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "postId" uuid NOT NULL,
    "eventTagId" uuid NOT NULL,
    source character varying(20) NOT NULL,
    "relevanceScore" double precision,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    body character varying NOT NULL,
    data jsonb,
    read boolean DEFAULT false NOT NULL,
    "userId" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: postCategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."postCategories" (
    posts uuid CONSTRAINT post_categories_posts_not_null NOT NULL,
    categories uuid CONSTRAINT post_categories_categories_not_null NOT NULL
);


--
-- Name: postEventTags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."postEventTags" (
    posts uuid CONSTRAINT post_event_tags_posts_not_null NOT NULL,
    "eventTags" uuid CONSTRAINT post_event_tags_event_tags_not_null NOT NULL
);


--
-- Name: requestMatchesPosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."requestMatchesPosts" (
    matches uuid CONSTRAINT request_matches_posts_matches_not_null NOT NULL,
    matched uuid CONSTRAINT request_matches_posts_matched_not_null NOT NULL
);


--
-- Name: searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.searches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "searchText" character varying NOT NULL,
    "firebaseUid" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "searchVector" character varying NOT NULL
);


--
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


--
-- Name: userBlockingUsers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."userBlockingUsers" (
    blockers character varying CONSTRAINT user_blocking_users_blockers_not_null NOT NULL,
    blocking character varying CONSTRAINT user_blocking_users_blocking_not_null NOT NULL
);


--
-- Name: userSavedPosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."userSavedPosts" (
    saved uuid CONSTRAINT user_saved_posts_saved_not_null NOT NULL,
    savers character varying CONSTRAINT user_saved_posts_savers_not_null NOT NULL
);


--
-- Name: user_following_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_following_users (
    follower_id character varying NOT NULL,
    following_id character varying NOT NULL
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name) FROM stdin;
\.


--
-- Data for Name: EventTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EventTag" (id, name) FROM stdin;
\.


--
-- Data for Name: FCMToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FCMToken" (id, "fcmToken", "notificationsEnabled", "timestamp", "userId") FROM stdin;
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Feedback" (id, description, images, "userId") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id) FROM stdin;
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, title, description, "originalPrice", "alteredPrice", images, created, location, archive, condition, sold, embedding, "userId") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Report" (id, reason, type, resolved, created, "reporterFirebaseUid", "reportedFirebaseUid", "postId", "messageId") FROM stdin;
\.


--
-- Data for Name: Request; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Request" (id, title, description, archive, embedding, "userId") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Transaction" (id, location, amount, completed, "postId", "buyerId", "sellerId", "transactionDate", "createdAt", "confirmationSent") FROM stdin;
\.


--
-- Data for Name: TransactionReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransactionReview" (id, stars, "transactionId", "hadIssues", "issueCategory", "issueDetails", "createdAt", comments) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (username, netid, admin, stars, email, bio, "isActive", "firebaseUid", "givenName", "familyName", "numReviews", "photoUrl", "venmoHandle", "googleId", "soldPosts", "availabilityId") FROM stdin;
\.


--
-- Data for Name: UserReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserReview" (id, fulfilled, stars, comments, date, "buyerId", "sellerId") FROM stdin;
\.


--
-- Data for Name: eventPostRelationships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."eventPostRelationships" (id, "postId", "eventTagId", source, "relevanceScore", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1709163288115	init1709163288115
2	1713139721037	softdelete1713139721037
3	1713218553306	makenetidnullable1713218553306
4	1713308449994	addreports1713308449994
5	1713320015776	UpdateMessageModel1713320015776
6	1731186421123	AddArchiveToRequest1731186421123
7	1731271779741	updatecategories1731271779741
8	1732146942548	addconditiontoposts1732146942548
9	1732906578369	AddTransactionTable1732906578369
10	1732924592033	AddSoldColumnToPost1732924592033
11	1732975238671	AddTransactionReviewTable1732975238671
12	1739899394694	Notifications1739899394694
13	1740007049335	ConvertEmbeddingToVector1631740007049335
14	1740628691583	AuthorizationRefactor1740628691583
15	1743028223060	AddCategoryTable1743028223060
16	1743566564676	CreateSearchesTable1743566564676
17	1761697414368	AddEventTagTable1761697414368
18	1765000000000	RenameSnakeToCamelResellTest1765000000000
19	1767386999887	AddUserStats1767386999887
20	1769385600000	AddAvailabilityToUser1769385600000
21	1769500000000	AddConfirmationSentToTransaction1769500000000
22	1769700000000	CreateEventPostRelationships1769700000000
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, title, body, data, read, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: postCategories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."postCategories" (posts, categories) FROM stdin;
\.


--
-- Data for Name: postEventTags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."postEventTags" (posts, "eventTags") FROM stdin;
\.


--
-- Data for Name: requestMatchesPosts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."requestMatchesPosts" (matches, matched) FROM stdin;
\.


--
-- Data for Name: searches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.searches (id, "searchText", "firebaseUid", "createdAt", "searchVector") FROM stdin;
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.typeorm_metadata (type, database, schema, "table", name, value) FROM stdin;
\.


--
-- Data for Name: userBlockingUsers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."userBlockingUsers" (blockers, blocking) FROM stdin;
\.


--
-- Data for Name: userSavedPosts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."userSavedPosts" (saved, savers) FROM stdin;
\.


--
-- Data for Name: user_following_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_following_users (follower_id, following_id) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 22, true);


--
-- Name: user_following_users PK_01b7a923c26f4be4f7c138cbb88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_users
    ADD CONSTRAINT "PK_01b7a923c26f4be4f7c138cbb88" PRIMARY KEY (follower_id, following_id);


--
-- Name: userSavedPosts PK_11901fe92c42b2d2a71ca74021a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userSavedPosts"
    ADD CONSTRAINT "PK_11901fe92c42b2d2a71ca74021a" PRIMARY KEY (saved, savers);


--
-- Name: Request PK_23de24dc477765bcc099feae8e5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Request"
    ADD CONSTRAINT "PK_23de24dc477765bcc099feae8e5" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: Message PK_7dd6398f0d1dcaf73df342fa325; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "PK_7dd6398f0d1dcaf73df342fa325" PRIMARY KEY (id);


--
-- Name: requestMatchesPosts PK_7f4c04956dd4e84a3437b2a8018; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."requestMatchesPosts"
    ADD CONSTRAINT "PK_7f4c04956dd4e84a3437b2a8018" PRIMARY KEY (matches, matched);


--
-- Name: Feedback PK_7ffea537e9c56670b65c2d62316; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "PK_7ffea537e9c56670b65c2d62316" PRIMARY KEY (id);


--
-- Name: postCategories PK_88340cf0b1b8a00578602f4c80b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."postCategories"
    ADD CONSTRAINT "PK_88340cf0b1b8a00578602f4c80b" PRIMARY KEY (posts, categories);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: userBlockingUsers PK_8db623e58cc4bce5fbcc252c66b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userBlockingUsers"
    ADD CONSTRAINT "PK_8db623e58cc4bce5fbcc252c66b" PRIMARY KEY (blockers, blocking);


--
-- Name: UserReview PK_91b62f63709469ae812a3519dd1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "PK_91b62f63709469ae812a3519dd1" PRIMARY KEY (id);


--
-- Name: EventTag PK_929d8d89bf95d848ac3b7546a29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventTag"
    ADD CONSTRAINT "PK_929d8d89bf95d848ac3b7546a29" PRIMARY KEY (id);


--
-- Name: Report PK_9dbb4c593be9832c28a5793e258; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "PK_9dbb4c593be9832c28a5793e258" PRIMARY KEY (id);


--
-- Name: FCMToken PK_FCMToken; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FCMToken"
    ADD CONSTRAINT "PK_FCMToken" PRIMARY KEY (id);


--
-- Name: Transaction PK_Transaction; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "PK_Transaction" PRIMARY KEY (id);


--
-- Name: TransactionReview PK_TransactionReview; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionReview"
    ADD CONSTRAINT "PK_TransactionReview" PRIMARY KEY (id);


--
-- Name: Category PK_c2727780c5b9b0c564c29a4977c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "PK_c2727780c5b9b0c564c29a4977c" PRIMARY KEY (id);


--
-- Name: Post PK_c4d3b3dcd73db0b0129ea829f9f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "PK_c4d3b3dcd73db0b0129ea829f9f" PRIMARY KEY (id);


--
-- Name: postEventTags PK_cc14f1e77d0b18c8ec995937fd0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."postEventTags"
    ADD CONSTRAINT "PK_cc14f1e77d0b18c8ec995937fd0" PRIMARY KEY (posts, "eventTags");


--
-- Name: eventPostRelationships PK_eventPostRelationships; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."eventPostRelationships"
    ADD CONSTRAINT "PK_eventPostRelationships" PRIMARY KEY (id);


--
-- Name: searches PK_searches; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "PK_searches" PRIMARY KEY (id);


--
-- Name: User UQ_02dec29f4ca814ab6efa2d4f0c4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "UQ_02dec29f4ca814ab6efa2d4f0c4" UNIQUE ("googleId");


--
-- Name: User UQ_29a05908a0fa0728526d2833657; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "UQ_29a05908a0fa0728526d2833657" UNIQUE (username);


--
-- Name: User UQ_4a257d2c9837248d70640b3e36e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE (email);


--
-- Name: TransactionReview UQ_aff62b169ebd519d1f5994e781a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionReview"
    ADD CONSTRAINT "UQ_aff62b169ebd519d1f5994e781a" UNIQUE ("transactionId");


--
-- Name: User UQ_ec60b02aab67f0f99f6f88797ed; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "UQ_ec60b02aab67f0f99f6f88797ed" UNIQUE (netid);


--
-- Name: eventPostRelationships UQ_eventPost_postId_eventTagId; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."eventPostRelationships"
    ADD CONSTRAINT "UQ_eventPost_postId_eventTagId" UNIQUE ("postId", "eventTagId");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("firebaseUid");


--
-- Name: IDX_0c0a06e6163f7a7315c4ce5fd4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0c0a06e6163f7a7315c4ce5fd4" ON public."userSavedPosts" USING btree (savers);


--
-- Name: IDX_1f4b27b2e31fb6263f6fb3a939; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1f4b27b2e31fb6263f6fb3a939" ON public."postCategories" USING btree (categories);


--
-- Name: IDX_3b2f09095e41d9c82bedaa0d8f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3b2f09095e41d9c82bedaa0d8f" ON public."requestMatchesPosts" USING btree (matched);


--
-- Name: IDX_503e9a09612f9668063099baff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_503e9a09612f9668063099baff" ON public.user_following_users USING btree (following_id);


--
-- Name: IDX_61151ebab50db74ea513ff8bd8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_61151ebab50db74ea513ff8bd8" ON public."postEventTags" USING btree (posts);


--
-- Name: IDX_7532bd6ca893c432ffcfa21f75; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7532bd6ca893c432ffcfa21f75" ON public."postEventTags" USING btree ("eventTags");


--
-- Name: IDX_793578cc63c2442a7944e93131; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_793578cc63c2442a7944e93131" ON public."userBlockingUsers" USING btree (blockers);


--
-- Name: IDX_80ef95f34370fd0704c156c13e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_80ef95f34370fd0704c156c13e" ON public.user_following_users USING btree (follower_id);


--
-- Name: IDX_978f319769e3d7285d6d2e40af; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_978f319769e3d7285d6d2e40af" ON public."postCategories" USING btree (posts);


--
-- Name: IDX_baa3d7e5e872010a3c23e98153; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_baa3d7e5e872010a3c23e98153" ON public."userSavedPosts" USING btree (saved);


--
-- Name: IDX_bc2ca85580a5c620ccc7f03f5d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_bc2ca85580a5c620ccc7f03f5d" ON public."userBlockingUsers" USING btree (blocking);


--
-- Name: IDX_eventPost_eventTagId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_eventPost_eventTagId" ON public."eventPostRelationships" USING btree ("eventTagId");


--
-- Name: IDX_eventPost_postId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_eventPost_postId" ON public."eventPostRelationships" USING btree ("postId");


--
-- Name: IDX_fd473bd2ef9b7a23f41a40ebed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fd473bd2ef9b7a23f41a40ebed" ON public."requestMatchesPosts" USING btree (matches);


--
-- Name: IDX_user_following_users_follower_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_following_users_follower_id" ON public.user_following_users USING btree (follower_id);


--
-- Name: IDX_user_following_users_following_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_following_users_following_id" ON public.user_following_users USING btree (following_id);


--
-- Name: userSavedPosts FK_0c0a06e6163f7a7315c4ce5fd4c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userSavedPosts"
    ADD CONSTRAINT "FK_0c0a06e6163f7a7315c4ce5fd4c" FOREIGN KEY (savers) REFERENCES public."User"("firebaseUid");


--
-- Name: UserReview FK_14e4fa2651e5c6d6118e2ba18aa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "FK_14e4fa2651e5c6d6118e2ba18aa" FOREIGN KEY ("sellerId") REFERENCES public."User"("firebaseUid");


--
-- Name: Report FK_16c178e84273608caf9db34df88; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_16c178e84273608caf9db34df88" FOREIGN KEY ("reportedFirebaseUid") REFERENCES public."User"("firebaseUid");


--
-- Name: postCategories FK_1f4b27b2e31fb6263f6fb3a9390; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."postCategories"
    ADD CONSTRAINT "FK_1f4b27b2e31fb6263f6fb3a9390" FOREIGN KEY (categories) REFERENCES public."Category"(id);


--
-- Name: Feedback FK_26bcf6b3c7c6b742e63d9308676; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "FK_26bcf6b3c7c6b742e63d9308676" FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE CASCADE;


--
-- Name: Transaction FK_30d551dc74a9537b73d4007592f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "FK_30d551dc74a9537b73d4007592f" FOREIGN KEY ("sellerId") REFERENCES public."User"("firebaseUid");


--
-- Name: requestMatchesPosts FK_3b2f09095e41d9c82bedaa0d8fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."requestMatchesPosts"
    ADD CONSTRAINT "FK_3b2f09095e41d9c82bedaa0d8fe" FOREIGN KEY (matched) REFERENCES public."Request"(id);


--
-- Name: Transaction FK_4ae4b1f6ff200ae67b40eb5bd8d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "FK_4ae4b1f6ff200ae67b40eb5bd8d" FOREIGN KEY ("buyerId") REFERENCES public."User"("firebaseUid");


--
-- Name: Report FK_4bc548745107f37d3512ed688c5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_4bc548745107f37d3512ed688c5" FOREIGN KEY ("postId") REFERENCES public."Post"(id);


--
-- Name: user_following_users FK_503e9a09612f9668063099baff1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_users
    ADD CONSTRAINT "FK_503e9a09612f9668063099baff1" FOREIGN KEY (following_id) REFERENCES public."User"("firebaseUid");


--
-- Name: UserReview FK_53a14948aa4e941762a403144ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "FK_53a14948aa4e941762a403144ea" FOREIGN KEY ("buyerId") REFERENCES public."User"("firebaseUid");


--
-- Name: postEventTags FK_61151ebab50db74ea513ff8bd87; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."postEventTags"
    ADD CONSTRAINT "FK_61151ebab50db74ea513ff8bd87" FOREIGN KEY (posts) REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications FK_692a909ee0fa9383e7859f9b406; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid");


--
-- Name: postEventTags FK_7532bd6ca893c432ffcfa21f755; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."postEventTags"
    ADD CONSTRAINT "FK_7532bd6ca893c432ffcfa21f755" FOREIGN KEY ("eventTags") REFERENCES public."EventTag"(id);


--
-- Name: userBlockingUsers FK_793578cc63c2442a7944e93131a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userBlockingUsers"
    ADD CONSTRAINT "FK_793578cc63c2442a7944e93131a" FOREIGN KEY (blockers) REFERENCES public."User"("firebaseUid") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_following_users FK_80ef95f34370fd0704c156c13ef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_users
    ADD CONSTRAINT "FK_80ef95f34370fd0704c156c13ef" FOREIGN KEY (follower_id) REFERENCES public."User"("firebaseUid") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: postCategories FK_978f319769e3d7285d6d2e40af8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."postCategories"
    ADD CONSTRAINT "FK_978f319769e3d7285d6d2e40af8" FOREIGN KEY (posts) REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post FK_97e81bcb59530bfb061e48aee6a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "FK_97e81bcb59530bfb061e48aee6a" FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE CASCADE;


--
-- Name: Report FK_a050c9cf7f461bc8fc040a48e0a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_a050c9cf7f461bc8fc040a48e0a" FOREIGN KEY ("reporterFirebaseUid") REFERENCES public."User"("firebaseUid");


--
-- Name: userSavedPosts FK_baa3d7e5e872010a3c23e981532; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userSavedPosts"
    ADD CONSTRAINT "FK_baa3d7e5e872010a3c23e981532" FOREIGN KEY (saved) REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction FK_bba9ded63ef0013ac2ec578f246; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "FK_bba9ded63ef0013ac2ec578f246" FOREIGN KEY ("postId") REFERENCES public."Post"(id);


--
-- Name: userBlockingUsers FK_bc2ca85580a5c620ccc7f03f5db; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userBlockingUsers"
    ADD CONSTRAINT "FK_bc2ca85580a5c620ccc7f03f5db" FOREIGN KEY (blocking) REFERENCES public."User"("firebaseUid");


--
-- Name: Request FK_cdaf52464b00ac3016a8f6110fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Request"
    ADD CONSTRAINT "FK_cdaf52464b00ac3016a8f6110fd" FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE CASCADE;


--
-- Name: FCMToken FK_d215a8d66e472d872409915f7d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FCMToken"
    ADD CONSTRAINT "FK_d215a8d66e472d872409915f7d5" FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid");


--
-- Name: Report FK_dd826149b8ac72ddc2d1f4e234e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_dd826149b8ac72ddc2d1f4e234e" FOREIGN KEY ("messageId") REFERENCES public."Message"(id);


--
-- Name: eventPostRelationships FK_eventPost_eventTagId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."eventPostRelationships"
    ADD CONSTRAINT "FK_eventPost_eventTagId" FOREIGN KEY ("eventTagId") REFERENCES public."EventTag"(id) ON DELETE CASCADE;


--
-- Name: eventPostRelationships FK_eventPost_postId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."eventPostRelationships"
    ADD CONSTRAINT "FK_eventPost_postId" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON DELETE CASCADE;


--
-- Name: TransactionReview FK_f7cf58b571d5c57ed9da155c628; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionReview"
    ADD CONSTRAINT "FK_f7cf58b571d5c57ed9da155c628" FOREIGN KEY ("transactionId") REFERENCES public."Transaction"(id);


--
-- Name: searches FK_fc8760cf4823ab84b0cb28d3dad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "FK_fc8760cf4823ab84b0cb28d3dad" FOREIGN KEY ("firebaseUid") REFERENCES public."User"("firebaseUid") ON DELETE CASCADE;


--
-- Name: requestMatchesPosts FK_fd473bd2ef9b7a23f41a40ebed4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."requestMatchesPosts"
    ADD CONSTRAINT "FK_fd473bd2ef9b7a23f41a40ebed4" FOREIGN KEY (matches) REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_following_users FK_user_following_users_follower_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_users
    ADD CONSTRAINT "FK_user_following_users_follower_id" FOREIGN KEY (follower_id) REFERENCES public."User"("firebaseUid") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_following_users FK_user_following_users_following_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_users
    ADD CONSTRAINT "FK_user_following_users_following_id" FOREIGN KEY (following_id) REFERENCES public."User"("firebaseUid") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict j0zS1YybO7IPtcJxy9ONeBKIaXJBXaXxzwxKQnVNLQIIVc1bKUCxYazgBD8jnUr

