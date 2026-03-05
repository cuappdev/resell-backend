--
-- PostgreSQL database dump
--

\restrict 7X6Yc6i4cS7AlllMEN3nDMk2WkbUYaTy9pXDSn0w1T1Po8XcF0eWNZaEEiNxuHP

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

ALTER TABLE IF EXISTS ONLY public.user_saved_posts DROP CONSTRAINT IF EXISTS "FK_user_saved_posts_savers";
ALTER TABLE IF EXISTS ONLY public.user_blocking_users DROP CONSTRAINT IF EXISTS "FK_user_blocking_users_blocking";
ALTER TABLE IF EXISTS ONLY public.user_blocking_users DROP CONSTRAINT IF EXISTS "FK_user_blocking_users_blockers";
ALTER TABLE IF EXISTS ONLY public."TransactionReview" DROP CONSTRAINT IF EXISTS "FK_transaction";
ALTER TABLE IF EXISTS ONLY public.searches DROP CONSTRAINT IF EXISTS "FK_searches_user";
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS "FK_post";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "FK_post";
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS "FK_notifications_user_id";
ALTER TABLE IF EXISTS ONLY public.request_matches_posts DROP CONSTRAINT IF EXISTS "FK_dcf9a982f720a85b68bc354b9f8";
ALTER TABLE IF EXISTS ONLY public.user_saved_posts DROP CONSTRAINT IF EXISTS "FK_ce8de5293eff7bd649291c74452";
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS "FK_category";
ALTER TABLE IF EXISTS ONLY public.request_matches_posts DROP CONSTRAINT IF EXISTS "FK_bfa8c41d1cbae1a3faf79166936";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_b0ecf30cfa1f4908dec8d19547c";
ALTER TABLE IF EXISTS ONLY public."UserReview" DROP CONSTRAINT IF EXISTS "FK_UserReview_seller";
ALTER TABLE IF EXISTS ONLY public."UserReview" DROP CONSTRAINT IF EXISTS "FK_UserReview_buyer";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "FK_Transaction_seller_id";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "FK_Transaction_buyer_id";
ALTER TABLE IF EXISTS ONLY public."Request" DROP CONSTRAINT IF EXISTS "FK_Request_user";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_Report_reporter_id";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_Report_reported_id";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "FK_Post_user";
ALTER TABLE IF EXISTS ONLY public."Feedback" DROP CONSTRAINT IF EXISTS "FK_Feedback_user";
ALTER TABLE IF EXISTS ONLY public."FCMToken" DROP CONSTRAINT IF EXISTS "FK_FCMToken_userId";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "FK_244bde34d749985aa27e551c110";
DROP INDEX IF EXISTS public.idx_searches_vector;
DROP INDEX IF EXISTS public."IDX_dcf9a982f720a85b68bc354b9f";
DROP INDEX IF EXISTS public."IDX_ce8de5293eff7bd649291c7445";
DROP INDEX IF EXISTS public."IDX_bfa8c41d1cbae1a3faf7916693";
DROP INDEX IF EXISTS public."IDX_FCMToken_userId";
DROP INDEX IF EXISTS public."IDX_FCMToken_fcmToken";
DROP INDEX IF EXISTS public."IDX_623743dadf52f9b1c5ebdb0ff8";
DROP INDEX IF EXISTS public."IDX_1860e6d8b1a47e00c8c0ea937b";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_ec60b02aab67f0f99f6f88797ed";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_a4f1fbe21cff2f5860ffa7a3cb6";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_4a257d2c9837248d70640b3e36e";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "UQ_29a05908a0fa0728526d2833657";
ALTER TABLE IF EXISTS ONLY public.searches DROP CONSTRAINT IF EXISTS "PK_searches";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "PK_c4d3b3dcd73db0b0129ea829f9f";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "PK_c2727780c5b9b0c564c29a4977c";
ALTER TABLE IF EXISTS ONLY public."TransactionReview" DROP CONSTRAINT IF EXISTS "PK_TransactionReview";
ALTER TABLE IF EXISTS ONLY public."Transaction" DROP CONSTRAINT IF EXISTS "PK_Transaction";
ALTER TABLE IF EXISTS ONLY public."FCMToken" DROP CONSTRAINT IF EXISTS "PK_FCMToken";
ALTER TABLE IF EXISTS ONLY public."Report" DROP CONSTRAINT IF EXISTS "PK_9dbb4c593be9832c28a5793e258";
ALTER TABLE IF EXISTS ONLY public."UserReview" DROP CONSTRAINT IF EXISTS "PK_91b62f63709469ae812a3519dd1";
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS "PK_8c82d7f526340ab734260ea46be";
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS "PK_88340cf0b1b8a00578602f4c80b";
ALTER TABLE IF EXISTS ONLY public."Feedback" DROP CONSTRAINT IF EXISTS "PK_7ffea537e9c56670b65c2d62316";
ALTER TABLE IF EXISTS ONLY public.request_matches_posts DROP CONSTRAINT IF EXISTS "PK_7f4c04956dd4e84a3437b2a8018";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "PK_7dd6398f0d1dcaf73df342fa325";
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS "PK_6a72c3c0f683f6462415e653c3a";
ALTER TABLE IF EXISTS ONLY public."Request" DROP CONSTRAINT IF EXISTS "PK_23de24dc477765bcc099feae8e5";
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.user_saved_posts;
DROP TABLE IF EXISTS public.user_blocking_users;
DROP TABLE IF EXISTS public.typeorm_metadata;
DROP TABLE IF EXISTS public.searches;
DROP TABLE IF EXISTS public.request_matches_posts;
DROP TABLE IF EXISTS public.post_categories;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
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
-- Name: FCMToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FCMToken" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fcmToken" character varying NOT NULL,
    "notificationsEnabled" boolean DEFAULT true NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" character varying NOT NULL
);


--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Feedback" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description character varying NOT NULL,
    images text[] NOT NULL,
    "user" character varying
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
    original_price numeric NOT NULL,
    altered_price numeric DEFAULT '-1'::numeric NOT NULL,
    images text[] NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    location character varying,
    archive boolean DEFAULT false NOT NULL,
    category character varying NOT NULL,
    condition character varying NOT NULL,
    sold boolean DEFAULT false NOT NULL,
    embedding double precision[],
    "user" character varying
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
    post_id uuid,
    message_id uuid,
    reporter_id character varying,
    reported_id character varying
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
    "user" character varying
);


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transaction" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    location character varying NOT NULL,
    amount numeric NOT NULL,
    transaction_date timestamp with time zone DEFAULT now() NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    post_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    buyer_id character varying,
    seller_id character varying
);


--
-- Name: TransactionReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransactionReview" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    stars integer NOT NULL,
    comments character varying,
    had_issues boolean DEFAULT false NOT NULL,
    issue_category character varying,
    issue_details character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    transaction_id uuid
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    username character varying NOT NULL,
    netid character varying,
    given_name character varying NOT NULL,
    family_name character varying NOT NULL,
    admin boolean NOT NULL,
    stars numeric DEFAULT '0'::numeric NOT NULL,
    num_reviews integer DEFAULT 0 NOT NULL,
    photo_url character varying,
    venmo_handle character varying,
    email character varying NOT NULL,
    google_id character varying NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "firebaseUid" character varying NOT NULL
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
    buyer character varying,
    seller character varying
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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying
);


--
-- Name: post_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_categories (
    posts uuid NOT NULL,
    categories uuid NOT NULL
);


--
-- Name: request_matches_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_matches_posts (
    matches uuid NOT NULL,
    matched uuid NOT NULL
);


--
-- Name: searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.searches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "searchText" character varying NOT NULL,
    "searchVector" public.vector(512),
    "firebaseUid" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: user_blocking_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_blocking_users (
    blockers character varying,
    blocking character varying
);


--
-- Name: user_saved_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_saved_posts (
    saved uuid NOT NULL,
    savers character varying
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
-- Data for Name: FCMToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FCMToken" (id, "fcmToken", "notificationsEnabled", "timestamp", "userId") FROM stdin;
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Feedback" (id, description, images, "user") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id) FROM stdin;
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, title, description, original_price, altered_price, images, created, location, archive, category, condition, sold, embedding, "user") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Report" (id, reason, type, resolved, created, post_id, message_id, reporter_id, reported_id) FROM stdin;
\.


--
-- Data for Name: Request; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Request" (id, title, description, archive, embedding, "user") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Transaction" (id, location, amount, transaction_date, completed, post_id, created_at, buyer_id, seller_id) FROM stdin;
\.


--
-- Data for Name: TransactionReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransactionReview" (id, stars, comments, had_issues, issue_category, issue_details, created_at, transaction_id) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (username, netid, given_name, family_name, admin, stars, num_reviews, photo_url, venmo_handle, email, google_id, bio, "isActive", "firebaseUid") FROM stdin;
\.


--
-- Data for Name: UserReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserReview" (id, fulfilled, stars, comments, date, buyer, seller) FROM stdin;
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
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, title, body, data, read, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: post_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_categories (posts, categories) FROM stdin;
\.


--
-- Data for Name: request_matches_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.request_matches_posts (matches, matched) FROM stdin;
\.


--
-- Data for Name: searches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.searches (id, "searchText", "searchVector", "firebaseUid", "createdAt") FROM stdin;
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.typeorm_metadata (type, database, schema, "table", name, value) FROM stdin;
\.


--
-- Data for Name: user_blocking_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_blocking_users (blockers, blocking) FROM stdin;
\.


--
-- Data for Name: user_saved_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_saved_posts (saved, savers) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 16, true);


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
-- Name: request_matches_posts PK_7f4c04956dd4e84a3437b2a8018; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_matches_posts
    ADD CONSTRAINT "PK_7f4c04956dd4e84a3437b2a8018" PRIMARY KEY (matches, matched);


--
-- Name: Feedback PK_7ffea537e9c56670b65c2d62316; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "PK_7ffea537e9c56670b65c2d62316" PRIMARY KEY (id);


--
-- Name: post_categories PK_88340cf0b1b8a00578602f4c80b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT "PK_88340cf0b1b8a00578602f4c80b" PRIMARY KEY (posts, categories);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: UserReview PK_91b62f63709469ae812a3519dd1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "PK_91b62f63709469ae812a3519dd1" PRIMARY KEY (id);


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
-- Name: searches PK_searches; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "PK_searches" PRIMARY KEY (id);


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
-- Name: User UQ_a4f1fbe21cff2f5860ffa7a3cb6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "UQ_a4f1fbe21cff2f5860ffa7a3cb6" UNIQUE (google_id);


--
-- Name: User UQ_ec60b02aab67f0f99f6f88797ed; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "UQ_ec60b02aab67f0f99f6f88797ed" UNIQUE (netid);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("firebaseUid");


--
-- Name: IDX_1860e6d8b1a47e00c8c0ea937b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1860e6d8b1a47e00c8c0ea937b" ON public.post_categories USING btree (categories);


--
-- Name: IDX_623743dadf52f9b1c5ebdb0ff8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_623743dadf52f9b1c5ebdb0ff8" ON public.post_categories USING btree (posts);


--
-- Name: IDX_FCMToken_fcmToken; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_FCMToken_fcmToken" ON public."FCMToken" USING btree ("fcmToken");


--
-- Name: IDX_FCMToken_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_FCMToken_userId" ON public."FCMToken" USING btree ("userId");


--
-- Name: IDX_bfa8c41d1cbae1a3faf7916693; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_bfa8c41d1cbae1a3faf7916693" ON public.request_matches_posts USING btree (matches);


--
-- Name: IDX_ce8de5293eff7bd649291c7445; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ce8de5293eff7bd649291c7445" ON public.user_saved_posts USING btree (saved);


--
-- Name: IDX_dcf9a982f720a85b68bc354b9f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_dcf9a982f720a85b68bc354b9f" ON public.request_matches_posts USING btree (matched);


--
-- Name: idx_searches_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_searches_vector ON public.searches USING ivfflat ("searchVector" public.vector_cosine_ops);


--
-- Name: Report FK_244bde34d749985aa27e551c110; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_244bde34d749985aa27e551c110" FOREIGN KEY (post_id) REFERENCES public."Post"(id);


--
-- Name: FCMToken FK_FCMToken_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FCMToken"
    ADD CONSTRAINT "FK_FCMToken_userId" FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE CASCADE;


--
-- Name: Feedback FK_Feedback_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "FK_Feedback_user" FOREIGN KEY ("user") REFERENCES public."User"("firebaseUid");


--
-- Name: Post FK_Post_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "FK_Post_user" FOREIGN KEY ("user") REFERENCES public."User"("firebaseUid");


--
-- Name: Report FK_Report_reported_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_Report_reported_id" FOREIGN KEY (reported_id) REFERENCES public."User"("firebaseUid");


--
-- Name: Report FK_Report_reporter_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_Report_reporter_id" FOREIGN KEY (reporter_id) REFERENCES public."User"("firebaseUid");


--
-- Name: Request FK_Request_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Request"
    ADD CONSTRAINT "FK_Request_user" FOREIGN KEY ("user") REFERENCES public."User"("firebaseUid");


--
-- Name: Transaction FK_Transaction_buyer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "FK_Transaction_buyer_id" FOREIGN KEY (buyer_id) REFERENCES public."User"("firebaseUid");


--
-- Name: Transaction FK_Transaction_seller_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "FK_Transaction_seller_id" FOREIGN KEY (seller_id) REFERENCES public."User"("firebaseUid");


--
-- Name: UserReview FK_UserReview_buyer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "FK_UserReview_buyer" FOREIGN KEY (buyer) REFERENCES public."User"("firebaseUid");


--
-- Name: UserReview FK_UserReview_seller; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReview"
    ADD CONSTRAINT "FK_UserReview_seller" FOREIGN KEY (seller) REFERENCES public."User"("firebaseUid");


--
-- Name: Report FK_b0ecf30cfa1f4908dec8d19547c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c" FOREIGN KEY (message_id) REFERENCES public."Message"(id);


--
-- Name: request_matches_posts FK_bfa8c41d1cbae1a3faf79166936; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_matches_posts
    ADD CONSTRAINT "FK_bfa8c41d1cbae1a3faf79166936" FOREIGN KEY (matches) REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_categories FK_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT "FK_category" FOREIGN KEY (categories) REFERENCES public."Category"(id) ON DELETE CASCADE;


--
-- Name: user_saved_posts FK_ce8de5293eff7bd649291c74452; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_saved_posts
    ADD CONSTRAINT "FK_ce8de5293eff7bd649291c74452" FOREIGN KEY (saved) REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: request_matches_posts FK_dcf9a982f720a85b68bc354b9f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_matches_posts
    ADD CONSTRAINT "FK_dcf9a982f720a85b68bc354b9f8" FOREIGN KEY (matched) REFERENCES public."Request"(id);


--
-- Name: notifications FK_notifications_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_notifications_user_id" FOREIGN KEY (user_id) REFERENCES public."User"("firebaseUid");


--
-- Name: Transaction FK_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "FK_post" FOREIGN KEY (post_id) REFERENCES public."Post"(id);


--
-- Name: post_categories FK_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT "FK_post" FOREIGN KEY (posts) REFERENCES public."Post"(id) ON DELETE CASCADE;


--
-- Name: searches FK_searches_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "FK_searches_user" FOREIGN KEY ("firebaseUid") REFERENCES public."User"("firebaseUid") ON DELETE CASCADE;


--
-- Name: TransactionReview FK_transaction; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionReview"
    ADD CONSTRAINT "FK_transaction" FOREIGN KEY (transaction_id) REFERENCES public."Transaction"(id) ON DELETE CASCADE;


--
-- Name: user_blocking_users FK_user_blocking_users_blockers; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocking_users
    ADD CONSTRAINT "FK_user_blocking_users_blockers" FOREIGN KEY (blockers) REFERENCES public."User"("firebaseUid");


--
-- Name: user_blocking_users FK_user_blocking_users_blocking; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocking_users
    ADD CONSTRAINT "FK_user_blocking_users_blocking" FOREIGN KEY (blocking) REFERENCES public."User"("firebaseUid");


--
-- Name: user_saved_posts FK_user_saved_posts_savers; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_saved_posts
    ADD CONSTRAINT "FK_user_saved_posts_savers" FOREIGN KEY (savers) REFERENCES public."User"("firebaseUid");


--
-- PostgreSQL database dump complete
--

\unrestrict 7X6Yc6i4cS7AlllMEN3nDMk2WkbUYaTy9pXDSn0w1T1Po8XcF0eWNZaEEiNxuHP

