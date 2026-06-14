--
-- PostgreSQL database dump
--

\restrict GbAwedfBXdWeM7e5KF2NgzHXcREtjm1H0Oovud5LM8lZ0hh0qVzQw7oKi769RJ3

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    department character varying(100) NOT NULL
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL,
    target_audience character varying(50) NOT NULL,
    target_course_code character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usn character varying(50) NOT NULL,
    course_code character varying(50) NOT NULL,
    assessment_type character varying(50) NOT NULL,
    score numeric(5,2) NOT NULL,
    max_score numeric(5,2) NOT NULL,
    recorded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid NOT NULL,
    student_usn character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assignment_submissions OWNER TO postgres;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    due_date timestamp with time zone,
    priority character varying(20) DEFAULT 'Medium'::character varying NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_by_role character varying(20) NOT NULL,
    author_id uuid NOT NULL,
    audience character varying(20) NOT NULL,
    course_code character varying(50),
    section character varying(10),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    file_data text,
    file_name character varying(255)
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usn character varying(50) NOT NULL,
    course_code character varying(50) NOT NULL,
    date date NOT NULL,
    status character varying(20) NOT NULL,
    recorded_by character varying(50) NOT NULL
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action character varying(255) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100),
    details jsonb,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_code character varying(50) NOT NULL,
    course_name character varying(255) NOT NULL,
    department character varying(100) NOT NULL,
    semester integer NOT NULL,
    credits integer NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usn character varying(50) NOT NULL,
    course_code character varying(50) NOT NULL,
    faculty_emp_id character varying(50) NOT NULL,
    section character varying(10) NOT NULL,
    enrolled_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: explanations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.explanations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prediction_id uuid NOT NULL,
    feature_name character varying(100) NOT NULL,
    feature_value numeric(10,4) NOT NULL,
    shap_value numeric(10,4) NOT NULL,
    impact_description character varying(255) NOT NULL
);


ALTER TABLE public.explanations OWNER TO postgres;

--
-- Name: faculty; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculty (
    emp_id character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    department character varying(100) NOT NULL,
    designation character varying(100) NOT NULL,
    is_hod boolean DEFAULT false NOT NULL,
    consultation_hours jsonb DEFAULT '[]'::jsonb,
    custom_thresholds jsonb DEFAULT '{}'::jsonb,
    notification_prefs jsonb DEFAULT '{"emailOnHighRisk": true, "autoNotifyAbsentee": false}'::jsonb
);


ALTER TABLE public.faculty OWNER TO postgres;

--
-- Name: fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usn character varying(50) NOT NULL,
    semester integer NOT NULL,
    amount_due numeric(10,2) NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    due_date date,
    status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.fees OWNER TO postgres;

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    description character varying(255),
    course_code character varying(50),
    faculty_emp_id character varying(50)
);


ALTER TABLE public.holidays OWNER TO postgres;

--
-- Name: interventions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interventions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usn character varying(50) NOT NULL,
    faculty_emp_id character varying(50) NOT NULL,
    prediction_id uuid,
    action_taken character varying(255) NOT NULL,
    notes text,
    status character varying(50) DEFAULT 'open'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interventions OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: predictions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predictions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usn character varying(50) NOT NULL,
    course_code character varying(50),
    risk_level character varying(20) NOT NULL,
    risk_score numeric(4,3) NOT NULL,
    explanation_text text NOT NULL,
    model_version character varying(50) NOT NULL,
    predicted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.predictions OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    usn character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    program character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    semester integer NOT NULL,
    enrollment_date date NOT NULL,
    mentor_id uuid,
    cgpa numeric(4,2) DEFAULT 0.00,
    academic_standing character varying(50) DEFAULT 'Good'::character varying
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    key character varying(50) NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    faculty_emp_id character varying(50) NOT NULL,
    text character varying(255) NOT NULL,
    due_date character varying(100) NOT NULL,
    done boolean DEFAULT false NOT NULL,
    urgent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: timetables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_code character varying(50) NOT NULL,
    faculty_emp_id character varying(50) NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time character varying(10) NOT NULL,
    end_time character varying(10) NOT NULL,
    room character varying(50) NOT NULL
);


ALTER TABLE public.timetables OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (admin_id, user_id, department) FROM stdin;
MUSE-ADM-001	aff4045e-a92f-4873-be38-f372b610768e	IT
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, author_id, target_audience, target_course_code, created_at) FROM stdin;
457b2686-dc1f-41a5-990b-015edc0f45dd	🚨 Holiday Declared: AM501	Please note that a holiday has been declared on Friday, May 22, 2026. Description: Holiday declared for AM501.	ca14a7e1-97fe-4502-b334-476b9b9d5d70	students	AM501	2026-05-29 15:01:15.032+05:30
b98597d2-57e6-41fc-a323-00483ef80d3f	Teacher Announcement	abcdefg	ca14a7e1-97fe-4502-b334-476b9b9d5d70	students	\N	2026-05-29 15:13:55.331+05:30
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (id, usn, course_code, assessment_type, score, max_score, recorded_at) FROM stdin;
05dea0de-134d-4135-bd8a-01a1d9586080	21AM045	AM501	IA-1	30.00	30.00	2026-05-29 07:27:51.166+05:30
e0ab0197-e147-411a-971f-e3d330db4c35	21AM045	AM501	IA-2	25.00	30.00	2026-05-29 07:27:51.206+05:30
d3fd65b5-eb99-4930-8eae-0746ab865b07	21AM045	AM501	IA-3	25.00	30.00	2026-05-29 07:27:51.209+05:30
516d92b8-7590-42af-a9fd-94ce265fdb56	21AM045	AM501	Practical	20.00	20.00	2026-05-29 07:27:51.212+05:30
8b68a708-60d3-4895-ab3f-cd1b2048cad3	21AM045	AM501	Final	100.00	100.00	2026-05-29 07:27:51.217+05:30
d3e55fdb-0888-45da-ac21-2481e37fc3fd	21AM045	AM503	IA-1	30.00	30.00	2026-05-29 17:06:19.382+05:30
c73363f6-adde-4716-840c-cd82e23c5baa	21AM045	AM503	IA-2	25.00	30.00	2026-05-29 17:06:19.401+05:30
0d7b0a91-f153-400f-b91d-bb1271360a4c	21AM045	AM503	IA-3	25.00	30.00	2026-05-29 17:06:19.403+05:30
fa0d4952-d67a-4c67-ba09-c0f4df7fe1ec	21AM045	AM503	Practical	18.00	20.00	2026-05-29 17:06:19.41+05:30
50ef6005-f1ea-485b-b7d3-706037de4cf4	21AM045	AM503	Final	80.00	100.00	2026-05-29 17:06:19.414+05:30
\.


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_submissions (id, assignment_id, student_usn, status, updated_at) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, type, title, description, due_date, priority, status, created_by_role, author_id, audience, course_code, section, created_at, file_data, file_name) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, usn, course_code, date, status, recorded_by) FROM stdin;
8d5668a8-b1b1-48a7-a90f-33e0e00fb0d5	21AM045	AM501	2026-05-29	present	FAC-084
d6b0d506-ed7a-401d-b6d4-6fc1fb3b3730	21AM045	AM501	2026-05-28	absent	FAC-084
7852fc03-b1f7-47c8-aa35-59da566d6153	21AM045	AM501	2026-05-27	absent	FAC-084
5ba95fa5-916c-4c69-9991-7dd50de68cc4	21AM045	AM501	2026-05-26	absent	FAC-084
8273cac2-f253-4fd9-a666-60bb3c4b1125	21AM045	AM501	2026-05-21	absent	FAC-084
d91a8f43-c05a-43d5-8695-c8f58fc75d64	21AM045	AM501	2026-05-20	absent	FAC-084
ae5deb3b-436c-4f55-8f48-d9c03d845f55	21AM045	AM501	2026-05-19	absent	FAC-084
df5bce8c-7849-4e18-a1d8-55424ee0dfe3	21AM045	AM501	2026-05-18	absent	FAC-084
60fb35ce-6c00-4af8-8ec5-fb09d59f30b0	21AM045	AM501	2026-05-15	absent	FAC-084
6c905829-ae56-4e4c-aeb1-16d1115f7b29	21AM045	AM501	2026-05-25	present	FAC-084
d819c763-c2bb-4a83-b8ee-3dd29975fbc0	21AM045	AM501	2026-05-14	present	FAC-084
28f48bf5-ed51-485a-8cd9-a46dd05c4269	21AM045	AM501	2026-05-13	present	FAC-084
4f156afc-549f-40cf-a003-bd3f716c5d8c	21AM045	AM501	2026-05-12	present	FAC-084
c9cd6b15-94d6-46ce-808c-03da0db092de	21AM045	AM501	2026-05-11	present	FAC-084
e25df798-a1b3-40bc-b080-8fc7fb44d51c	21AM045	AM501	2026-05-08	present	FAC-084
3b12cdd1-f7a9-493c-9819-c1a971e10658	21AM045	AM501	2026-05-07	absent	FAC-084
6f0ac2b1-bdd2-468b-bcbf-79456d9ae475	21AM045	AM501	2026-05-06	present	FAC-084
ed8b88e5-0cc6-460a-84ff-6855a010f168	21AM045	AM501	2026-05-05	present	FAC-084
623f6622-3225-4883-9abd-08943cbafba9	21AM045	AM501	2026-05-04	present	FAC-084
74918111-62f2-4938-920b-85e8163eeade	21AM045	AM504	2026-05-29	present	FAC-082
e0976b4f-9241-4372-8911-063198d1d839	21AM045	AM504	2026-05-28	present	FAC-082
f0679def-20e2-4810-89fc-041c276bc1f7	21AM045	AM504	2026-05-27	present	FAC-082
0a213313-6653-412a-a626-f93dd79004c4	21AM045	AM504	2026-05-26	absent	FAC-082
9b2de820-2c55-4853-a1db-dc70c34d212c	21AM045	AM504	2026-05-25	absent	FAC-082
4647f7b2-0a86-4b44-a808-1ca725e1f994	21AM045	AM505	2026-05-07	present	FAC-082
14f3ac18-e7ff-42c9-a7f0-066befcfd353	21AM045	AM505	2026-05-08	present	FAC-082
2feb27f0-8b51-4891-919f-a8915452ffc6	21AM045	AM505	2026-05-14	absent	FAC-082
bae3d8fb-0146-4329-baf2-c93f2ba8da1e	21AM045	AM505	2026-05-13	absent	FAC-082
dac757e7-c51b-44e5-974c-51ec0309871b	21AM045	AM505	2026-05-20	present	FAC-082
47aed2f9-2729-4674-8367-65faa28fce61	21AM045	AM505	2026-05-15	present	FAC-082
f7438f8d-037f-48d5-9e14-a738ede9ec3c	21AM045	AM504	2026-04-24	present	FAC-082
eb2592c5-a730-430b-8c37-5fed5d5d2c29	21AM045	AM501	2026-05-22	present	FAC-082
03396bce-0745-4900-993c-3c24637095e3	21AM045	AM505	2026-05-22	present	FAC-082
c3862490-59c1-40de-91ef-176ef8eddf55	21AM045	AM505	2026-05-21	present	FAC-082
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) FROM stdin;
a8939732-62ec-4818-bcf0-3da752e3df0b	ca14a7e1-97fe-4502-b334-476b9b9d5d70	TEACHER_DIRECT_MESSAGE	student	d1757181-17f9-41aa-8fb1-b634f9cf1bcb	{"usn": "21AM045", "type": "Attendance Alert", "action": "TEACHER_DIRECT_MESSAGE", "message": "Your attendance has dropped close to the critical 75% threshold. Please ensure regular attendance to avoid academic blockages."}	\N	2026-05-29 21:56:46.334996+05:30
cc26f878-f0d9-4046-a49b-8061c35b93e1	aff4045e-a92f-4873-be38-f372b610768e	ASSIGN_HOD	faculty	FAC-082	"Assigned Jane Smith as HOD for AI & ML"	\N	2026-05-30 11:11:04.696+05:30
144ea5a3-002a-49c7-b6ae-6cf63821a90e	aff4045e-a92f-4873-be38-f372b610768e	ASSIGN_HOD	faculty	FAC-084	"Assigned Ayush M as HOD for AI & ML"	\N	2026-05-30 11:15:23.483+05:30
1319f7b9-f2cb-47c9-97ce-4ac9466c3b1d	aff4045e-a92f-4873-be38-f372b610768e	ASSIGN_HOD	faculty	FAC-082	"Assigned Jane Smith as HOD for AI & ML"	\N	2026-05-30 11:15:30.155+05:30
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (course_code, course_name, department, semester, credits) FROM stdin;
AM101	Engineering Math I	AI & ML	1	4
AM102	Engineering Physics	AI & ML	1	3
AM103	Basic Electrical Eng	AI & ML	1	3
AM104	Programming in C	AI & ML	1	3
AM105	Engineering Graphics	AI & ML	1	3
AM201	Engineering Math II	AI & ML	2	4
AM202	Engineering Chemistry	AI & ML	2	3
AM203	Basic Electronics	AI & ML	2	3
AM204	Data Structures & Algos	AI & ML	2	3
AM205	Applied Mechanics	AI & ML	2	3
AM301	Discrete Mathematical Structures	AI & ML	3	4
AM302	Object Oriented Programming	AI & ML	3	3
AM303	Digital Electronics	AI & ML	3	3
AM304	Unix & Shell Programming	AI & ML	3	3
AM305	AI Foundations	AI & ML	3	3
AM401	Database Management Systems	AI & ML	4	4
AM402	Operating Systems	AI & ML	4	3
AM403	Design & Analysis of Algos	AI & ML	4	3
AM404	Software Engineering	AI & ML	4	3
AM405	Python for AI	AI & ML	4	3
AM501	Machine Learning	AI & ML	5	4
AM502	Deep Learning	AI & ML	5	3
AM503	Computer Networks	AI & ML	5	3
AM504	Formal Languages & Automata	AI & ML	5	3
AM505	System Software	AI & ML	5	3
AM601	Natural Language Processing	AI & ML	6	4
AM602	Computer Vision	AI & ML	6	3
AM603	Reinforcement Learning	AI & ML	6	3
AM604	AI Ethics & Laws	AI & ML	6	3
AM605	Cloud Computing	AI & ML	6	3
AM701	Big Data Analytics	AI & ML	7	4
AM702	Internet of Things	AI & ML	7	3
AM703	Information & Cyber Security	AI & ML	7	3
AM704	Optimization Techniques	AI & ML	7	3
AM705	Distributed Systems	AI & ML	7	3
AM801	Major Project Work	AI & ML	8	4
AM802	Technical Seminar	AI & ML	8	3
AM803	Internship Viva-Voce	AI & ML	8	3
AM804	Research Methodology	AI & ML	8	3
AM805	Elective	AI & ML	8	3
AD101	Engineering Math I	AI & DS	1	4
AD102	Engineering Physics	AI & DS	1	3
AD103	Basic Electrical Eng	AI & DS	1	3
AD104	Programming in C	AI & DS	1	3
AD105	Engineering Graphics	AI & DS	1	3
AD201	Engineering Math II	AI & DS	2	4
AD202	Engineering Chemistry	AI & DS	2	3
AD203	Basic Electronics	AI & DS	2	3
AD204	Data Structures & Algos	AI & DS	2	3
AD205	Applied Mechanics	AI & DS	2	3
AD301	Discrete Mathematical Structures	AI & DS	3	4
AD302	Object Oriented Programming	AI & DS	3	3
AD303	Digital Electronics	AI & DS	3	3
AD304	Unix & Shell Programming	AI & DS	3	3
AD305	Probability & Stats	AI & DS	3	3
AD401	Database Management Systems	AI & DS	4	4
AD402	Operating Systems	AI & DS	4	3
AD403	Design & Analysis of Algos	AI & DS	4	3
AD404	Software Engineering	AI & DS	4	3
AD405	Data Wrangling	AI & DS	4	3
AD501	Data Mining & Warehousing	AI & DS	5	4
AD502	Predictive Analytics	AI & DS	5	3
AD503	Computer Networks	AI & DS	5	3
AD504	Automata Theory	AI & DS	5	3
AD505	Machine Learning in DS	AI & DS	5	3
AD601	Big Data Technologies	AI & DS	6	4
AD602	Business Intelligence	AI & DS	6	3
AD603	Data Visualization	AI & DS	6	3
AD604	Ethics in Data Science	AI & DS	6	3
AD605	Cloud Computing	AI & DS	6	3
AD701	NoSQL Databases	AI & DS	7	4
AD702	Internet of Things	AI & DS	7	3
AD703	Information & Cyber Security	AI & DS	7	3
AD704	Deep Learning for Data	AI & DS	7	3
AD705	Distributed Systems	AI & DS	7	3
AD801	Major Project Work	AI & DS	8	4
AD802	Technical Seminar	AI & DS	8	3
AD803	Internship Viva-Voce	AI & DS	8	3
AD804	Research Methodology	AI & DS	8	3
AD805	Elective	AI & DS	8	3
CD101	Engineering Math I	CS Design	1	4
CD102	Engineering Physics	CS Design	1	3
CD103	Basic Electrical Eng	CS Design	1	3
CD104	Programming in C	CS Design	1	3
CD105	Engineering Graphics	CS Design	1	3
CD201	Engineering Math II	CS Design	2	4
CD202	Engineering Chemistry	CS Design	2	3
CD203	Basic Electronics	CS Design	2	3
CD204	Data Structures & Algos	CS Design	2	3
CD205	Applied Mechanics	CS Design	2	3
CD301	Discrete Mathematical Structures	CS Design	3	4
CD302	Object Oriented Programming	CS Design	3	3
CD303	Digital Electronics	CS Design	3	3
CD304	Introduction to Design	CS Design	3	3
CD305	UI/UX Principles	CS Design	3	3
CD401	Database Management Systems	CS Design	4	4
CD402	Operating Systems	CS Design	4	3
CD403	Design & Analysis of Algos	CS Design	4	3
CD404	Software Engineering	CS Design	4	3
CD405	Computer Graphics	CS Design	4	3
CD501	Human Computer Interaction	CS Design	5	4
CD502	Virtual & Augmented Reality	CS Design	5	3
CD503	Computer Networks	CS Design	5	3
CD504	Game Design Foundations	CS Design	5	3
CD505	Interaction Design	CS Design	5	3
CD601	Web Development	CS Design	6	4
CD602	Mobile App Development	CS Design	6	3
CD603	3D Modeling & Animation	CS Design	6	3
CD604	Ethics in Computing	CS Design	6	3
CD605	Cloud Computing	CS Design	6	3
CD701	Big Data Design	CS Design	7	4
CD702	Internet of Things	CS Design	7	3
CD703	Information & Cyber Security	CS Design	7	3
CD704	Multimedia Systems	CS Design	7	3
CD705	Distributed Systems	CS Design	7	3
CD801	Major Project Work	CS Design	8	4
CD802	Technical Seminar	CS Design	8	3
CD803	Internship Viva-Voce	CS Design	8	3
CD804	Research Methodology	CS Design	8	3
CD805	Elective	CS Design	8	3
BM101	Engineering Math I	Biomedical	1	4
BM102	Engineering Physics	Biomedical	1	3
BM103	Basic Electrical Eng	Biomedical	1	3
BM104	Programming in C	Biomedical	1	3
BM105	Engineering Graphics	Biomedical	1	3
BM201	Engineering Math II	Biomedical	2	4
BM202	Engineering Chemistry	Biomedical	2	3
BM203	Basic Electronics	Biomedical	2	3
BM204	Data Structures & Algos	Biomedical	2	3
BM205	Applied Mechanics	Biomedical	2	3
BM301	Human Anatomy & Physiology	Biomedical	3	4
BM302	Biomedical Sensors	Biomedical	3	3
BM303	Network Analysis	Biomedical	3	3
BM304	Electronic Circuits	Biomedical	3	3
BM305	Medical Biochemistry	Biomedical	3	3
BM401	Medical Instrumentation I	Biomedical	4	4
BM402	Signal & Linear Systems	Biomedical	4	3
BM403	Digital Electronics	Biomedical	4	3
BM404	Biomaterials	Biomedical	4	3
BM405	Pathology & Microbiology	Biomedical	4	3
BM501	Medical Instrumentation II	Biomedical	5	4
BM502	Diagnostic Medical Imaging	Biomedical	5	3
BM503	Microcontrollers & Embedded	Biomedical	5	3
BM504	Medical Informatics	Biomedical	5	3
BM505	Bio-signal Processing	Biomedical	5	3
BM601	Biomedical Equipment Control	Biomedical	6	4
BM602	Biotelemetry & Telemedicine	Biomedical	6	3
BM603	Rehabilitation Engineering	Biomedical	6	3
BM604	Hospital Engineering & Ethics	Biomedical	6	3
BM605	Artificial Organs	Biomedical	6	3
BM701	Biophotonics & Laser	Biomedical	7	4
BM702	Medical Device Regulations	Biomedical	7	3
BM703	Information & Cyber Security	Biomedical	7	3
BM704	Embedded Systems in Medicine	Biomedical	7	3
BM705	Biomechanics	Biomedical	7	3
BM801	Major Project Work	Biomedical	8	4
BM802	Technical Seminar	Biomedical	8	3
BM803	Internship Viva-Voce	Biomedical	8	3
BM804	Research Methodology	Biomedical	8	3
BM805	Elective	Biomedical	8	3
CSE101	Engineering Math I	CSE	1	4
CSE102	Engineering Physics	CSE	1	3
CSE103	Basic Electrical Eng	CSE	1	3
CSE104	Programming in C	CSE	1	3
CSE105	Engineering Graphics	CSE	1	3
CSE201	Engineering Math II	CSE	2	4
CSE202	Engineering Chemistry	CSE	2	3
CSE203	Basic Electronics	CSE	2	3
CSE204	Data Structures & Algos	CSE	2	3
CSE205	Applied Mechanics	CSE	2	3
CSE301	Discrete Mathematical Structures	CSE	3	4
CSE302	Object Oriented Programming	CSE	3	3
CSE303	Digital Electronics	CSE	3	3
CSE304	Unix & Shell Programming	CSE	3	3
CSE305	Computer Organization	CSE	3	3
CSE401	Database Management Systems	CSE	4	4
CSE402	Operating Systems	CSE	4	3
CSE403	Design & Analysis of Algos	CSE	4	3
CSE404	Software Engineering	CSE	4	3
CSE405	Theory of Computation	CSE	4	3
CSE501	Computer Networks	CSE	5	4
CSE502	Database Systems II	CSE	5	3
CSE503	Microprocessors	CSE	5	3
CSE504	Compiler Design	CSE	5	3
CSE505	Web Technologies	CSE	5	3
CSE601	Software Testing	CSE	6	4
CSE602	Computer Architecture	CSE	6	3
CSE603	Cryptography	CSE	6	3
CSE604	Cloud Computing	CSE	6	3
CSE605	Artificial Intelligence	CSE	6	3
CSE701	Big Data Analytics	CSE	7	4
CSE702	Internet of Things	CSE	7	3
CSE703	Information & Cyber Security	CSE	7	3
CSE704	Data Mining	CSE	7	3
CSE705	Distributed Systems	CSE	7	3
CSE801	Major Project Work	CSE	8	4
CSE802	Technical Seminar	CSE	8	3
CSE803	Internship Viva-Voce	CSE	8	3
CSE804	Research Methodology	CSE	8	3
CSE805	Elective	CSE	8	3
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, usn, course_code, faculty_emp_id, section, enrolled_at) FROM stdin;
df2667c4-a7b9-4d47-9ab5-c9357c90bc51	21AM045	AM504	FAC-082	A	2026-05-29 06:37:50.951+05:30
4ab3f0e1-f696-42fb-836a-1882adb24844	21AM045	AM505	FAC-082	A	2026-05-29 06:37:50.951+05:30
a91b5e09-7ce2-4c8e-81ee-5e4e4433182c	21AM045	AM502	FAC-084	A	2026-05-29 06:37:50.951+05:30
a0d513f3-5b84-41b7-8ab3-9fec5e770e87	21AM045	AM501	FAC-082	A	2026-05-29 17:21:34.232+05:30
94dfa5bb-1871-4003-b0dc-b56305f1bd0f	21AM045	AM503	FAC-402	A	2026-05-29 17:21:34.232+05:30
\.


--
-- Data for Name: explanations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.explanations (id, prediction_id, feature_name, feature_value, shap_value, impact_description) FROM stdin;
ac7c6217-5d17-4c94-af23-82f2c6085ed9	a19f7cc6-06f9-4b87-9f71-1664e0428602	Attendance	100.0000	0.3716	High attendance (100.0%) secured low risk standing.
81747bb3-bf31-4886-b593-9f9d13fb30fe	a19f7cc6-06f9-4b87-9f71-1664e0428602	IA-2	25.0000	0.0740	Strong IA-2 score (25.0) ensured low risk.
e7079881-9a89-4e3f-9ef5-b85c0166c018	a19f7cc6-06f9-4b87-9f71-1664e0428602	IA-1	25.0000	0.0348	Strong IA-1 score (25.0) ensured low risk.
17bf1b26-9d30-4f20-8998-4172034625ce	475710a0-aa9e-42c3-a086-a4d3354acac6	Attendance	42.8571	0.5253	Low attendance (42.857142857142854%) strongly increased risk.
ccaa1299-353b-40e0-a23e-8099653f6c41	475710a0-aa9e-42c3-a086-a4d3354acac6	IA-2	25.0000	-0.0354	Metric IA-2 (25.0) slightly mitigated risk.
2981206f-2913-4160-aa76-9f91aa457bbe	475710a0-aa9e-42c3-a086-a4d3354acac6	IA-1	30.0000	-0.0033	Metric IA-1 (30.0) slightly mitigated risk.
35753ad0-c009-4f47-9c97-769c63b2bdf6	d179d558-b4f2-4872-b1c9-ae19c7a4bf89	Attendance	52.6316	0.5253	Low attendance (52.63157894736842%) strongly increased risk.
d9f697b4-fcef-411b-bdd7-9169b189ac74	d179d558-b4f2-4872-b1c9-ae19c7a4bf89	IA-2	25.0000	-0.0354	Metric IA-2 (25.0) slightly mitigated risk.
16dd75a9-a9c4-46aa-a44e-ef3b39b6d3f4	d179d558-b4f2-4872-b1c9-ae19c7a4bf89	IA-1	30.0000	-0.0033	Metric IA-1 (30.0) slightly mitigated risk.
959d4b17-888b-4c39-8feb-98bc85835829	3ba39ff0-6333-48a0-8668-f44ad40d5102	Attendance	55.0000	0.5253	Low attendance (55.00000000000001%) strongly increased risk.
e616661f-2e8d-4bad-8f8b-04ee716ecc39	3ba39ff0-6333-48a0-8668-f44ad40d5102	IA-2	25.0000	-0.0354	Metric IA-2 (25.0) slightly mitigated risk.
e6c6c47f-e619-4961-8338-f34a803473cd	3ba39ff0-6333-48a0-8668-f44ad40d5102	IA-1	30.0000	-0.0033	Metric IA-1 (30.0) slightly mitigated risk.
95329c90-f815-4c10-bfe3-27de6c9af516	4512489b-fd10-4fa7-9e07-a4f1978c7355	Attendance	66.6667	0.5253	Low attendance (66.66666666666666%) strongly increased risk.
a9a16baf-875a-4c38-a967-fa640fc3d114	4512489b-fd10-4fa7-9e07-a4f1978c7355	IA-2	25.0000	-0.0354	Metric IA-2 (25.0) slightly mitigated risk.
fb9828c5-28f6-48e6-aa54-9c015f542661	4512489b-fd10-4fa7-9e07-a4f1978c7355	IA-1	25.0000	-0.0033	Metric IA-1 (25.0) slightly mitigated risk.
c2c18171-670d-4b1e-af2f-92dfcd0d516c	173211a9-b0b1-43b4-a239-f9f644af2491	Attendance	66.6667	0.5253	Low attendance (66.66666666666666%) strongly increased risk.
393dd817-92d4-46a3-8f44-eb39a941856a	173211a9-b0b1-43b4-a239-f9f644af2491	IA-2	25.0000	-0.0354	Metric IA-2 (25.0) slightly mitigated risk.
b8856405-470d-4ae1-b6ac-cf77252e00ef	173211a9-b0b1-43b4-a239-f9f644af2491	IA-1	25.0000	-0.0033	Metric IA-1 (25.0) slightly mitigated risk.
40dcf305-0a6c-496e-93f1-49143720dca9	75044fe4-bd7f-45c1-840e-acddd4a73643	Attendance	75.0000	0.4318	Metric Attendance (75.0) increased risk profile.
63c85b92-8aa9-443d-b893-367481ddf7d3	75044fe4-bd7f-45c1-840e-acddd4a73643	IA-2	25.0000	-0.0274	Metric IA-2 (25.0) slightly mitigated risk.
e95222e3-0413-40fd-a37e-a3a7e35607a3	75044fe4-bd7f-45c1-840e-acddd4a73643	IA-1	25.0000	-0.0096	Metric IA-1 (25.0) slightly mitigated risk.
08625624-efc8-42a6-b212-353fbbfb6c63	dbc77372-2018-4012-96ec-f7ba62ad8457	Attendance	55.0000	0.5253	Low attendance (55.00000000000001%) strongly increased risk.
64d92893-b674-4b15-aded-3687b44ed470	dbc77372-2018-4012-96ec-f7ba62ad8457	IA-2	25.0000	-0.0354	Metric IA-2 (25.0) slightly mitigated risk.
63c624d9-5f06-4317-a93a-e23468270f2e	dbc77372-2018-4012-96ec-f7ba62ad8457	IA-1	30.0000	-0.0033	Metric IA-1 (30.0) slightly mitigated risk.
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty (emp_id, user_id, department, designation, is_hod, consultation_hours, custom_thresholds, notification_prefs) FROM stdin;
FAC-402	5c8db300-d61f-40a5-bb43-a9a0737476ad	AI & ML	Faculty	f	[]	{}	{"emailOnHighRisk": true, "autoNotifyAbsentee": false}
FAC-084	ca14a7e1-97fe-4502-b334-476b9b9d5d70	AI & ML	Faculty	f	[]	{}	{"emailOnHighRisk": true, "autoNotifyAbsentee": false}
TBD	c0526e47-6d18-449c-a803-8d14672ff65e	All	Placeholder	f	[{"day": "Tuesday", "end": "10:30", "start": "09:30"}]	{"AM402": 80, "CS501": 85}	{"emailOnHighRisk": false, "autoNotifyAbsentee": true}
FAC-082	d2e1ee97-a047-443b-a2b4-b99072fbbb22	AI & ML	Faculty	t	[{"day": "Monday", "end": "11:00", "start": "10:00"}]	{"AM501": 78}	{"emailOnHighRisk": true, "autoNotifyAbsentee": false}
\.


--
-- Data for Name: fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fees (id, usn, semester, amount_due, amount_paid, due_date, status, updated_at) FROM stdin;
5f593786-6734-4537-b67b-5b0060808990	21AM045	5	150000.00	140000.00	2024-09-01	Pending	2026-05-29 06:30:08.121+05:30
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.holidays (id, date, description, course_code, faculty_emp_id) FROM stdin;
2f002432-26a9-4198-9615-9a0c9da0e8d4	2026-05-01	Holiday declared for CSE805	CSE805	EMP-CSE-124
b1ac5f5c-14aa-4d76-8cd1-090e59d95df4	2026-06-01	Holiday declared for CSE805	CSE805	EMP-CSE-124
4299e12a-1d9b-4b78-a219-add676de7702	2026-06-05	Holiday declared for CSE105	CSE105	EMP-CSE-124
0e9e74ba-1a62-4454-bb80-206db565311c	2026-06-05	Holiday declared for CSE205	CSE205	EMP-CSE-124
3a6089da-ef41-4647-9b22-c1f0cc00a83e	2026-06-05	Holiday declared for CSE305	CSE305	EMP-CSE-124
dcae0620-f0aa-4f2c-8da3-0dc1439de334	2026-06-05	Holiday declared for CSE805	CSE805	EMP-CSE-124
\.


--
-- Data for Name: interventions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interventions (id, usn, faculty_emp_id, prediction_id, action_taken, notes, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, content, is_read, created_at) FROM stdin;
ac483806-bbae-423b-90d2-6e5a298904f3	d1757181-17f9-41aa-8fb1-b634f9cf1bcb	Attendance Alert	Personal Guidance from teacher Ayush M: "Your attendance has dropped close to the critical 75% threshold. Please ensure regular attendance to avoid academic blockages."	t	2026-05-29 16:26:46.322+05:30
\.


--
-- Data for Name: predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predictions (id, usn, course_code, risk_level, risk_score, explanation_text, model_version, predicted_at) FROM stdin;
a19f7cc6-06f9-4b87-9f71-1664e0428602	21AM045	AM501	Low	0.912	High attendance (100.0%) secured low risk standing.	v2.0-randomforest	2026-05-29 06:41:08.255+05:30
475710a0-aa9e-42c3-a086-a4d3354acac6	21AM045	AM501	High	0.755	Low attendance (42.857142857142854%) strongly increased risk.	v2.0-randomforest	2026-05-29 15:02:45.594+05:30
d179d558-b4f2-4872-b1c9-ae19c7a4bf89	21AM045	AM501	High	0.755	Low attendance (52.63157894736842%) strongly increased risk.	v2.0-randomforest	2026-05-29 16:44:57.88+05:30
3ba39ff0-6333-48a0-8668-f44ad40d5102	21AM045	AM501	High	0.755	Low attendance (55.00000000000001%) strongly increased risk.	v2.0-randomforest	2026-05-29 17:47:39.568+05:30
4512489b-fd10-4fa7-9e07-a4f1978c7355	21AM045	AM504	High	0.755	Low attendance (66.66666666666666%) strongly increased risk.	v2.0-randomforest	2026-05-29 17:48:11.224+05:30
173211a9-b0b1-43b4-a239-f9f644af2491	21AM045	AM505	High	0.755	Low attendance (66.66666666666666%) strongly increased risk.	v2.0-randomforest	2026-05-29 17:48:14.511+05:30
75044fe4-bd7f-45c1-840e-acddd4a73643	21AM045	AM505	Medium	0.694	Metric Attendance (75.0) increased risk profile.	v2.0-randomforest	2026-05-29 17:48:33.992+05:30
dbc77372-2018-4012-96ec-f7ba62ad8457	21AM045	AM501	High	0.755	Low attendance (55.00000000000001%) strongly increased risk.	v2.0-randomforest	2026-05-30 11:16:42.393+05:30
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (usn, user_id, program, department, semester, enrollment_date, mentor_id, cgpa, academic_standing) FROM stdin;
21AM045	d1757181-17f9-41aa-8fb1-b634f9cf1bcb	B.E. AI & ML	AI & ML	5	2026-05-29	\N	0.00	Good
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (key, value, updated_at) FROM stdin;
iaMax	30	2026-05-29 06:18:08.37+05:30
minAtt	75	2026-05-29 06:18:08.37+05:30
medT	0.4	2026-05-29 06:18:08.37+05:30
highT	0.80	2026-05-29 06:18:08.37+05:30
feeDueDate	2026-06-25	2026-06-03 18:06:00.833+05:30
semStart	2026-03-01	2026-05-29 06:18:08.37+05:30
ay	2025-2026	2026-05-29 06:18:08.37+05:30
semEnd	2026-07-30	2026-05-29 06:18:08.37+05:30
dataRetentionDays	365	2026-06-03 15:37:39.714+05:30
mlModelType	Logistic Regression	2026-06-03 15:37:39.711+05:30
autoBackupEnabled	true	2026-06-03 15:37:39.718+05:30
smtpPass	mySecurePass123	2026-06-03 15:37:39.709+05:30
ssoClientId		2026-06-03 15:41:26.27+05:30
ssoAuthUrl		2026-06-03 15:41:26.27+05:30
ssoTokenUrl		2026-06-03 15:41:26.27+05:30
smtpUser	test@muse.ac.in	2026-06-03 15:37:39.707+05:30
smtpHost	smtp.testmail.com	2026-06-03 15:37:39.702+05:30
smtpPort	587	2026-06-03 15:37:39.705+05:30
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, faculty_emp_id, text, due_date, done, urgent, created_at) FROM stdin;
\.


--
-- Data for Name: timetables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetables (id, course_code, faculty_emp_id, day_of_week, start_time, end_time, room) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, full_name, created_at, last_login, status) FROM stdin;
aff4045e-a92f-4873-be38-f372b610768e	admin@muse.ac.in	$2b$10$yflXNPVzFGl9pruDREkWhuoGgn2jfS4U1oQLx2bw/CdnHWuzbmiNi	admin	System Administrator	2026-05-29 06:18:08.297+05:30	2026-06-04 13:54:55.834+05:30	active
d2e1ee97-a047-443b-a2b4-b99072fbbb22	jane.smith@muse.ac.in	$2b$10$d48PqbLwLmb5XXX4tQU51Oz5cv43n3ByFtCDx5SRW8O747Z0I0pam	teacher	Jane Smith	2026-05-29 06:30:08.151+05:30	2026-06-04 13:58:55.004+05:30	active
d1757181-17f9-41aa-8fb1-b634f9cf1bcb	john.doe@muse.ac.in	$2b$10$d48PqbLwLmb5XXX4tQU51Oz5cv43n3ByFtCDx5SRW8O747Z0I0pam	student	John Doe	2026-05-29 06:30:08.089+05:30	2026-06-04 14:00:06.381+05:30	active
c0526e47-6d18-449c-a803-8d14672ff65e	tbd.faculty@muse.ac.in	$2b$10$uoSx6X/LaznqTl3mA/Z3yuN.MdfHbfsCrCNiRgR.UcraRNEhkDiv6	teacher	To Be Decided	2026-05-29 16:59:42.48+05:30	\N	active
ca14a7e1-97fe-4502-b334-476b9b9d5d70	ayushm123@gmail.com	$2b$10$DNTmf5uaCFYpiM.lQ1wvOudl39Lik03n66cPX0N76sGG.F2b/iSBy	teacher	Ayush M	2026-05-29 07:24:59.866+05:30	2026-05-29 17:24:02.188+05:30	active
5c8db300-d61f-40a5-bb43-a9a0737476ad	abc@gmail.com	$2b$10$4M27Bf.6v8DFAw5yQlXjRuMvFYfbQ0zLzzpUBEXwDTULOWMAnp2Qi	teacher	abc	2026-05-29 17:23:05.597+05:30	2026-06-03 17:21:04.248+05:30	active
\.


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_code);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: explanations explanations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.explanations
    ADD CONSTRAINT explanations_pkey PRIMARY KEY (id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (emp_id);


--
-- Name: fees fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: interventions interventions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: predictions predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (usn);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (key);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admins_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admins_user_id_key ON public.admins USING btree (user_id);


--
-- Name: assessments_usn_course_code_assessment_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX assessments_usn_course_code_assessment_type_key ON public.assessments USING btree (usn, course_code, assessment_type);


--
-- Name: assignment_submissions_assignment_id_student_usn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX assignment_submissions_assignment_id_student_usn_key ON public.assignment_submissions USING btree (assignment_id, student_usn);


--
-- Name: attendance_usn_course_code_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX attendance_usn_course_code_date_key ON public.attendance USING btree (usn, course_code, date);


--
-- Name: enrollments_usn_course_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX enrollments_usn_course_code_key ON public.enrollments USING btree (usn, course_code);


--
-- Name: faculty_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX faculty_user_id_key ON public.faculty USING btree (user_id);


--
-- Name: holidays_date_course_code_faculty_emp_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX holidays_date_course_code_faculty_emp_id_key ON public.holidays USING btree (date, course_code, faculty_emp_id);


--
-- Name: students_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX students_user_id_key ON public.students USING btree (user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: admins admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: announcements announcements_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: announcements announcements_target_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_target_course_code_fkey FOREIGN KEY (target_course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assessments assessments_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assessments assessments_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_usn_fkey FOREIGN KEY (usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_student_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_student_usn_fkey FOREIGN KEY (student_usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.faculty(emp_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_usn_fkey FOREIGN KEY (usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: enrollments enrollments_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enrollments enrollments_faculty_emp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_faculty_emp_id_fkey FOREIGN KEY (faculty_emp_id) REFERENCES public.faculty(emp_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enrollments enrollments_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_usn_fkey FOREIGN KEY (usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: explanations explanations_prediction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.explanations
    ADD CONSTRAINT explanations_prediction_id_fkey FOREIGN KEY (prediction_id) REFERENCES public.predictions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faculty faculty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fees fees_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_usn_fkey FOREIGN KEY (usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: interventions interventions_faculty_emp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_faculty_emp_id_fkey FOREIGN KEY (faculty_emp_id) REFERENCES public.faculty(emp_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: interventions interventions_prediction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_prediction_id_fkey FOREIGN KEY (prediction_id) REFERENCES public.predictions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: interventions interventions_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_usn_fkey FOREIGN KEY (usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: predictions predictions_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: predictions predictions_usn_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_usn_fkey FOREIGN KEY (usn) REFERENCES public.students(usn) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_faculty_emp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_faculty_emp_id_fkey FOREIGN KEY (faculty_emp_id) REFERENCES public.faculty(emp_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(course_code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_faculty_emp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_faculty_emp_id_fkey FOREIGN KEY (faculty_emp_id) REFERENCES public.faculty(emp_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict GbAwedfBXdWeM7e5KF2NgzHXcREtjm1H0Oovud5LM8lZ0hh0qVzQw7oKi769RJ3

