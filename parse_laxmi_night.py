import json, re
from datetime import date, timedelta

# ============================================================
# JODI DATA – no dates, Mo-Sun columns
# Assumed start: 2023-01-02 (same as Laxmi Day)
# ============================================================
JODI_RAW = """40	96	98	78	30	07	05
21	02	20	21	07	19	49
31	50	17	78	33	82	47
99	27	88	28	84	60	28
11	08	02	36	80	13	54
39	52	39	17	01	60	55
68	44	74	08	62	48	02
78	92	96	83	66	38	61
61	89	62	72	97	59	24
76	13	01	64	97	52	11
07	89	05	64	71	04	18
92	22	91	89	27	83	33
70	28	19	97	31	69	62
37	91	12	63	52	67	53
34	66	32	57	93	65	67
65	99	70	87	85	15	47
18	20	70	65	50	47	96
60	10	19	32	81	44	69
84	23	15	12	73	95	53
15	08	34	87	91	80	77
91	62	80	41	17	35	53
75	75	77	22	80	17	56
17	77	33	95	29	50	46
95	30	28	47	23	48	84
91	73	06	38	38	10	53
68	40	26	77	92	68	61
72	73	69	83	30	02	96
85	26	16	79	11	40	30
01	53	81	75	79	81	62
58	26	18	52	15	07	38
24	98	59	18	59	95	96
39	74	39	62	54	72	47
47	98	83	54	10	86	51
93	97	08	43	46	36	79
40	14	10	49	93	79	73
17	10	95	58	82	81	75
49	73	35	04	39	39	84
66	38	17	51	70	81	49
82	12	57	68	90	30	69
62	68	56	70	10	77	03
97	69	44	24	74	32	72
31	43	96	45	30	28	97
32	80	13	70	69	75	32
26	11	71	45	25	69	84
35	87	58	99	58	10	73
57	56	97	60	80	36	68
03	43	47	27	42	51	90
42	28	21	49	76	43	62
48	69	13	91	97	91	88
71	91	27	20	70	25	86
20	46	91	11	47	49	71
24	21	47	99	10	32	47
50	16	15	03	73	95	61
85	27	92	70	75	81	54
58	87	25	98	95	32	85
11	15	95	45	93	87	70
94	10	28	32	02	09	10
57	03	02	49	12	06	66
01	80	58	54	91	58	78
51	75	72	75	39	21	12
80	01	88	04	99	33	51
05	03	13	70	97	86	61
52	78	17	93	47	02	48
80	82	93	50	65	71	59
56	43	09	72	87	87	69
05	78	77	93	25	35	97
69	12	32	08	98	42	03
90	07	74	90	64	20	79
69	14	74	63	57	36	98
25	69	13	84	90	24	30
26	47	63	56	40	10	32
08	69	71	49	25	09	48
08	30	06	43	30	08	86
84	76	23	28	79	69	70
10	77	80	24	84	30	84
54	39	20	90	10	17	39
76	60	25	21	95	78	60
06	13	82	72	25	81	68
24	51	56	07	95	81	31
04	71	19	80	04	38	64
83	47	79	79	18	21	32
52	26	35	71	34	61	92
34	32	11	93	43	40	46
20	93	48	31	69	86	84
50	46	81	08	73	62	60
06	40	50	42	47	17	03
72	33	98	40	23	61	20
19	97	04	32	03	80	41
57	73	10	68	10	27	11
91	37	89	76	30	26	03
59	40	59	51	87	18	49
61	93	80	29	40	01	96
31	57	44	91	89	59	20
12	57	17	81	83	04	22
12	54	32	09	21	74	69
59	20	53	28	64	14	25
46	77	46	50	88	06	85
74	63	66	29	07	26	97
53	06	29	04	58	14	54
03	40	13	07	43	25	72
08	96	06	35	93	70	25
28	98	35	49	67	96	38
52	13	29	96	17	55	86
92	61	40	40	58	69	10
65	49	11	51	50	57	39
82	98	77	45	67	19	01
80	46	59	07	70	58	28
00	09	16	48	55	94	86
50	11	42	92	65	03	77
49	18	20	89	40	51	89
94	50	38	45	29	80	46
24	21	85	33	18	50	33
10	98	91	92	67	08	62
49	26	17	37	16	64	13
23	45	23	96	11	86	86
67	18	21	25	37	82	26
83	60	09	00	89	15	25
41	09	39	99	30	57	48
66	07	44	27	21	38	22
42	65	08	81	23	35	90
45	76	20	50	46	68	97
56	51	82	72	33	84	04
23	07	81	41	53	50	34
88	50	40	33	89	27	90
61	59	52	59	12	61	16
56	28	90	39	33	15	81
69	10	43	03	84	17	19
94	70	66	68	29	40	35
85	68	72	58	28	71	06
57	91	88	04	60	23	46
70	94	39	04	81	51	09
51	91	22	52	67	42	85
15	12	79	09	02	21	41
23	10	69	43	12	64	99
82	91	55	64	29	62	47
32	47	89	52	08	11	48
11	09	81	84	07	66	65
45	80	94	36	21	67	80
01	90	86	26	45	31	76
48	27	04	55	47	40	20
64	67	81	39	26	32	53
05	87	76	90	78	34	84
73	64	90	74	35	32	10
30	72	63	98	14	24	29
78	99	26	85	27	93	43
34	41	89	10	30	22	87
19	90	16	58	42	40	36
03	61	77	48	29	53	50
71	44	07	43	37	65	42
38	90	80	17	13	43	02
58	01	36	18	17	04	96
56	84	70	34	74	98	26
39	16	28	53	07	27	09
43	64	70	93	20	59	80
99	10	06	83	65	18	52
54	23	85	00	84	63	01
31	03	68	07	23	99	14
03	25	85	76	29	76	51
99	01	78	39	23	05	39
15	96	97	30	31	75	78
48	71	75	95	52	89	13
06	29	76	46	08	94	40
00	56	81	95	41	34	82
07	18	45	69	31	12	01
30	48	38	96	52	41	75
38	57	15	64	47	36	42
01	74	89	46	63	87	80
29	10	33	48	75	90	95
71	58	66	13	99	37	43
68	95	03	67	51	38	61
90	30	59	97	75	33	43
33	06	14	42	58	15	37
98	86	10	92	66	52	99
41	93	51	01	58	04	30
95	61	01	26	26	97	09
32	15	79	01	42	82	61
21	95	34	11	03	12	26
50	99	16	28	43	83	81
86	47	30	32	43	79	70
25	17	84	96	53	39	15
10	06	69	45	76	03	91
21	87	52	70	91	28	93
38	40	76	99	40	59	73
23	37	61	57	45	75	47
16	97	85	53	65	39	90
45	93	01	83	14	72	12
79	66	31	87	77	30	69
17	54	18	39	61	25	48
90	10	26	74	89	33	51
42	63	57	06	**	14	98
15	70	29	31	67	90	84
09	54	98	70	45	51	26
31	60	43	22	90	18	67
89	55	61	08	74	28	03
27	18	74	36	93	66	59
34	03	15	89	74	62	48
69	75	29	04	31	07	15
98	01	53	26	50	32	14
82	76	43	21	95	68	**
**	**	**	60	71	63	58
24	13	57	99	23	20	91
50	87	62	31	04	66	29
34	91	42	95	47	01	87
76	15	38	27	02	76	41
89	03	96	78	38	45	00
01	50	49	13	52	67	23
74	39	78	06	89	17	58
52	68	17	23	48	09	22
30	85	64	56	12	37	65
75	07	**	80	42	49	18
22	64	19	26	05	17	38
79	50	74	39	69	42	56
81	35	25	19	70	02	91
**	63	17	32	74	85	50
41	09	24	49	85	92	18
79	92	96	07	12	01	30
98	50	**	95	89	70	91
40	24	66	45	02	55	26
56	08	**	10	58	93	07
85	34	26	63	24	08	15
02	71	93	**	39	56	99
48	62	75	83	20	12	07
90	25	01	99	45	73	16
33	86	40	64	02	85	94
15	08	92	37	80	37	23
49	34	50	51	62	18	40
86	18	22	69	98	55	30
75	41	37	61	43	91	73
28	38	09	17	66	84	48
51	86	91	73	51	06	20
52	47	08	60	29	98	33
16	23	92	15	76	60	81
40	59	64	90	37	66	12"""

# ============================================================
# PANEL DATA – with dates, mixed old (9-field) / new (16-field) format
# ============================================================
PANEL_RAW = """06-01-2025\nto\n12/01/2025\t1\n4\n4\n99\t4\n5\n0\n6\n7\n7\n01\t1\n3\n7\n2\n5\n0\n78\t5\n6\n7\n2\n3\n8\n39\t2\n7\n0\n1\n1\n0\n23\t6\n8\n9\n4\n6\n0\n05\t1\n6\n8\n3\n3\n7\n39\t4\n6\n9
13-01-2025\nto\n19/01/2025\t1\n2\n8\n15\t2\n5\n8\n1\n3\n5\n96\t1\n2\n3\n1\n4\n4\n97\t1\n2\n4\n4\n9\n0\n30\t3\n7\n0\n6\n8\n9\n31\t2\n4\n5\n5\n6\n6\n75\t3\n6\n6\n5\n5\n7\n78\t4\n4\n0
20-01-2025\nto\n26/01/2025\t2\n2\n0\n48\t3\n7\n8\n1\n7\n9\n71\t3\n8\n0\n1\n2\n4\n75\t3\n4\n8\n2\n3\n4\n95\t1\n4\n0\n4\n5\n6\n52\t6\n7\n9\n2\n8\n8\n89\t3\n6\n0\n5\n6\n0\n13\t1\n2\n0
27-01-2025\nto\n02/02/2025\t4\n6\n0\n06\t1\n7\n8\n3\n3\n6\n29\t1\n3\n5\n1\n6\n0\n76\t1\n6\n9\n2\n5\n7\n46\t2\n4\n0\n5\n6\n9\n08\t1\n2\n5\n1\n2\n6\n94\t4\n4\n6\n3\n3\n8\n40\t1\n9\n0
03-02-2025\nto\n09/02/2025\t1\n1\n8\n00\t6\n7\n7\n4\n5\n6\n56\t1\n2\n3\n2\n6\n0\n81\t4\n8\n9\n3\n7\n9\n95\t3\n5\n7\n2\n2\n0\n41\t1\n2\n8\n5\n8\n0\n34\t2\n2\n0\n3\n7\n8\n82\t6\n7\n9
10-02-2025\nto\n16/02/2025\t1\n2\n7\n07\t1\n2\n4\n5\n7\n9\n18\t5\n6\n7\n2\n2\n0\n45\t2\n6\n7\n4\n5\n7\n69\t3\n7\n9\n1\n2\n0\n31\t1\n2\n8\n3\n9\n9\n12\t2\n4\n6\n5\n6\n9\n01\t1\n2\n8
17-02-2025\nto\n23/02/2025\t2\n3\n8\n30\t1\n9\n0\n3\n4\n7\n48\t3\n6\n9\n4\n9\n0\n38\t1\n3\n4\n1\n9\n9\n96\t2\n4\n0\n3\n6\n6\n52\t2\n0\n0\n2\n4\n8\n41\t1\n4\n6\n3\n7\n7\n75\t3\n4\n8
24-02-2025\nto\n02/03/2025\t3\n4\n6\n38\t1\n1\n6\n3\n3\n9\n57\t4\n5\n8\n2\n9\n0\n15\t2\n5\n8\n3\n6\n7\n64\t1\n3\n0\n5\n9\n0\n47\t3\n4\n0\n1\n2\n0\n36\t1\n6\n9\n6\n8\n0\n42\t1\n2\n9
03-03-2025\nto\n09/03/2025\t2\n3\n5\n01\t3\n8\n0\n1\n2\n4\n74\t2\n5\n7\n2\n3\n3\n89\t2\n7\n0\n5\n9\n0\n46\t2\n5\n9\n1\n2\n3\n63\t3\n4\n6\n4\n5\n9\n87\t2\n7\n8\n2\n6\n0\n80\t1\n2\n7
10-03-2025\nto\n16/03/2025\t2\n4\n6\n29\t2\n3\n4\n3\n8\n0\n10\t5\n6\n9\n2\n2\n9\n33\t4\n9\n0\n2\n2\n0\n48\t2\n6\n0\n1\n2\n4\n75\t1\n5\n9\n2\n3\n4\n90\t2\n8\n0\n2\n7\n0\n95\t3\n4\n8
17-03-2025\nto\n23/03/2025\t1\n2\n4\n71\t2\n9\n0\n3\n3\n9\n58\t4\n6\n8\n2\n5\n9\n66\t1\n5\n0\n1\n4\n6\n13\t6\n7\n0\n1\n2\n6\n99\t1\n3\n5\n2\n5\n6\n37\t3\n4\n0\n5\n9\n0\n43\t1\n5\n7
24-03-2025\nto\n30/03/2025\t2\n6\n8\n68\t2\n7\n9\n3\n7\n9\n95\t1\n1\n3\n4\n6\n0\n03\t2\n3\n8\n3\n5\n8\n67\t1\n1\n5\n3\n4\n8\n51\t6\n6\n9\n6\n8\n9\n38\t2\n6\n0\n3\n6\n7\n61\t4\n7\n0
31-03-2025\nto\n06/04/2025\t3\n6\n0\n90\t2\n8\n0\n6\n8\n9\n30\t2\n8\n0\n4\n5\n6\n59\t5\n7\n7\n6\n6\n7\n97\t2\n6\n9\n1\n3\n3\n75\t2\n6\n7\n2\n2\n9\n33\t1\n2\n0\n6\n8\n0\n43\t1\n4\n8
07-04-2025\nto\n13/04/2025\t2\n5\n6\n33\t6\n7\n0\n1\n1\n8\n06\t6\n0\n0\n2\n9\n0\n14\t1\n1\n2\n3\n5\n6\n42\t1\n1\n0\n2\n5\n8\n58\t1\n2\n5\n4\n8\n9\n15\t2\n3\n0\n6\n7\n0\n37\t1\n6\n0
14-04-2025\nto\n20/04/2025\t1\n3\n5\n98\t2\n2\n4\n2\n2\n4\n86\t4\n5\n7\n6\n7\n8\n10\t2\n4\n4\n5\n6\n8\n92\t4\n8\n0\n1\n2\n3\n66\t2\n4\n0\n2\n3\n0\n52\t1\n5\n6\n2\n8\n9\n99\t1\n3\n5
21-04-2025\nto\n27/04/2025\t1\n4\n9\n41\t5\n6\n0\n2\n3\n4\n93\t1\n3\n9\n2\n3\n0\n51\t5\n6\n0\n1\n3\n6\n01\t2\n3\n6\n2\n3\n0\n58\t2\n7\n9\n1\n9\n0\n04\t2\n3\n9\n1\n4\n8\n30\t5\n6\n9
28-04-2025\nto\n04/05/2025\t2\n2\n5\n95\t2\n4\n9\n1\n6\n9\n61\t2\n3\n6\n4\n6\n0\n01\t2\n3\n6\n1\n5\n6\n26\t2\n4\n0\n1\n5\n6\n26\t2\n4\n0\n5\n6\n8\n97\t3\n6\n8\n1\n2\n7\n09\t3\n6\n0
05-05-2025\nto\n11/05/2025\t2\n3\n8\n32\t1\n2\n9\n2\n3\n6\n15\t1\n4\n0\n5\n6\n6\n79\t2\n3\n4\n4\n7\n9\n01\t2\n9\n0\n1\n1\n2\n42\t1\n2\n9\n2\n2\n4\n82\t2\n4\n6\n4\n5\n7\n61\t3\n4\n4
12-05-2025\nto\n18/05/2025\t5\n8\n9\n21\t2\n3\n6\n1\n2\n6\n95\t2\n5\n8\n1\n5\n7\n34\t3\n4\n7\n2\n9\n0\n11\t2\n3\n6\n2\n8\n0\n03\t3\n5\n5\n5\n7\n9\n12\t2\n2\n8\n6\n6\n0\n26\t1\n6\n9
19-05-2025\nto\n25/05/2025\t2\n4\n9\n50\t1\n1\n8\n6\n6\n7\n99\t1\n1\n7\n1\n2\n8\n16\t4\n5\n7\n1\n3\n8\n28\t1\n2\n5\n1\n6\n7\n43\t6\n8\n9\n4\n6\n8\n83\t1\n2\n0\n2\n8\n8\n81\t1\n2\n8
26-05-2025\nto\n01/06/2025\t4\n5\n9\n86\t8\n9\n9\n2\n6\n6\n47\t1\n3\n3\n2\n3\n8\n30\t5\n6\n9\n1\n1\n1\n32\t6\n8\n8\n7\n8\n9\n43\t2\n2\n9\n1\n1\n5\n79\t1\n2\n6\n3\n4\n0\n70\t4\n8\n8
02-06-2025\nto\n08/06/2025\t3\n3\n6\n25\t4\n5\n6\n6\n6\n9\n17\t3\n6\n8\n2\n7\n9\n84\t1\n1\n2\n3\n7\n9\n96\t1\n1\n4\n3\n5\n7\n53\t1\n4\n8\n4\n4\n5\n39\t2\n8\n9\n5\n7\n9\n15\t2\n4\n9
09-06-2025\nto\n15/06/2025\t1\n3\n7\n10\t4\n7\n9\n4\n6\n0\n06\t1\n7\n8\n3\n6\n7\n69\t3\n6\n0\n2\n5\n7\n45\t1\n5\n9\n1\n7\n9\n76\t1\n7\n8\n4\n7\n9\n03\t5\n9\n9\n5\n5\n9\n91\t4\n7\n0
16-06-2025\nto\n22/06/2025\t3\n4\n5\n21\t6\n6\n9\n1\n7\n0\n87\t1\n3\n3\n6\n9\n0\n52\t4\n8\n0\n1\n2\n4\n70\t5\n7\n8\n2\n7\n0\n91\t4\n7\n0\n6\n6\n0\n28\t2\n6\n0\n1\n4\n4\n93\t3\n3\n7
23-06-2025\nto\n29/06/2025\t5\n8\n0\n38\t5\n6\n7\n2\n3\n9\n40\t5\n7\n8\n4\n6\n7\n76\t4\n6\n6\n2\n8\n9\n99\t3\n3\n3\n6\n8\n0\n40\t2\n2\n6\n4\n5\n6\n59\t5\n7\n7\n1\n2\n4\n73\t4\n9\n0
30-06-2025\nto\n06/07/2025\t2\n4\n6\n23\t1\n5\n7\n1\n3\n9\n37\t3\n5\n9\n2\n5\n9\n61\t5\n7\n9\n1\n6\n8\n57\t2\n6\n9\n3\n5\n6\n45\t1\n4\n0\n1\n7\n9\n75\t1\n1\n3\n4\n0\n0\n47\t3\n7\n7
07-07-2025\nto\n13/07/2025\t1\n0\n0\n16\t1\n5\n0\n5\n6\n8\n97\t2\n6\n9\n3\n7\n8\n85\t7\n8\n0\n2\n4\n9\n53\t3\n4\n6\n2\n4\n0\n65\t3\n5\n7\n1\n3\n9\n39\t4\n6\n9\n3\n6\n0\n90\t2\n8\n0
14-07-2025\nto\n20/07/2025\t2\n2\n0\n45\t1\n6\n8\n1\n8\n0\n93\t1\n5\n7\n3\n7\n0\n01\t1\n4\n6\n5\n6\n7\n83\t1\n3\n9\n1\n2\n8\n14\t1\n5\n8\n2\n6\n9\n72\t1\n4\n7\n1\n1\n9\n12\t6\n7\n9
21-07-2025\nto\n27/07/2025\t2\n5\n0\n79\t1\n4\n4\n7\n9\n0\n66\t1\n2\n3\n2\n4\n7\n31\t3\n8\n0\n1\n1\n6\n87\t1\n6\n0\n2\n6\n9\n77\t1\n3\n3\n6\n8\n9\n30\t2\n8\n0\n4\n4\n8\n69\t2\n3\n4
28/07/2025\nto\n03/08/2025\t4\n8\n9\t17\t3\n6\n8\n2\n6\n7\t54\t1\n6\n7\n2\n3\n6\t18\t4\n6\n8\n3\n3\n7\t39\t4\n6\n9\n3\n5\n8\t61\t2\n9\n0\n3\n3\n6\t25\t3\n4\n8\n1\n1\n2\t48\t1\n8\n9
04/08/2025\nto\n10/08/2025\t2\n3\n4\t90\t2\n8\n0\n4\n7\n0\t10\t6\n6\n8\n3\n4\n5\t26\t1\n2\n3\n2\n7\n8\t74\t5\n9\n0\n9\n9\n0\t89\t3\n6\n0\n1\n5\n7\t33\t5\n8\n0\n4\n5\n6\t51\t2\n3\n6
11/08/2025\nto\n17/08/2025\t7\n8\n9\t42\t1\n5\n6\n1\n2\n3\t63\t4\n9\n0\n2\n5\n8\t57\t3\n4\n0\n2\n4\n4\t06\t3\n4\n9\n*\n*\n*\t**\t*\n*\n*\n1\n3\n7\t14\t6\n9\n9\n5\n5\n9\t98\t3\n5\n0
18/08/2025\nto\n24/08/2025\t3\n3\n5\t15\t4\n4\n7\n4\n4\n9\t70\t1\n3\n6\n1\n2\n9\t29\t2\n7\n0\n3\n3\n7\t31\t5\n6\n0\n1\n5\n0\t67\t8\n9\n0\n4\n7\n8\t90\t5\n6\n9\n2\n6\n0\t84\t6\n8\n0
25/08/2025\nto\n31/08/2025\t1\n9\n0\t09\t2\n8\n9\n2\n3\n0\t54\t3\n4\n7\n4\n5\n0\t98\t5\n5\n8\n1\n2\n4\t70\t2\n3\n5\n2\n5\n7\t45\t5\n0\n0\n1\n7\n7\t51\t3\n4\n4\n1\n1\n0\t26\t8\n8\n0
01/09/2025\nto\n07/09/2025\t7\n8\n8\t31\t4\n7\n0\n2\n6\n8\t60\t1\n4\n5\n3\n5\n6\t43\t6\n7\n0\n1\n3\n8\t22\t5\n7\n0\n2\n2\n5\t90\t3\n8\n9\n2\n4\n5\t18\t1\n2\n5\n1\n6\n9\t67\t3\n6\n8
08/09/2025\nto\n14/09/2025\t1\n3\n4\t89\t1\n2\n6\n1\n5\n9\t55\t6\n9\n0\n4\n5\n7\t61\t5\n7\n9\n3\n7\n0\t08\t4\n5\n9\n1\n7\n9\t74\t2\n4\n8\n4\n8\n0\t28\t1\n7\n0\n2\n9\n9\t03\t1\n4\n8
15/09/2025\nto\n21/09/2025\t2\n3\n7\t27\t4\n5\n8\n1\n1\n9\t18\t3\n6\n9\n2\n6\n9\t74\t2\n2\n0\n3\n4\n6\t36\t1\n7\n8\n1\n8\n0\t93\t4\n4\n5\n6\n0\n0\t66\t2\n4\n0\n3\n3\n9\t59\t1\n3\n5
22/09/2025\nto\n28/09/2025\t1\n2\n0\t34\t1\n4\n9\n2\n2\n6\t03\t3\n0\n0\n1\n2\n8\t15\t7\n8\n0\n8\n0\n0\t89\t2\n3\n4\n3\n6\n8\t74\t4\n4\n6\n2\n5\n9\t62\t1\n2\n9\n1\n5\n8\t48\t4\n4\n0
29/09/2025\nto\n05/10/2025\t3\n6\n7\t69\t5\n6\n8\n1\n2\n4\t75\t2\n6\n7\n3\n9\n0\t29\t6\n6\n7\n2\n8\n0\t04\t1\n3\n0\n5\n9\n9\t31\t6\n7\n8\n1\n2\n7\t07\t3\n4\n0\n1\n4\n6\t15\t2\n5\n8
06/10/2025\nto\n12/10/2025\t1\n1\n7\t98\t2\n8\n8\n4\n7\n9\t01\t3\n8\n0\n1\n6\n8\t53\t7\n7\n9\n2\n4\n6\t26\t3\n5\n8\n1\n4\n0\t50\t4\n6\n0\n2\n3\n8\t32\t1\n3\n8\n5\n8\n8\t14\t2\n3\n9
13/10/2025\nto\n19/10/2025\t3\n7\n8\t82\t6\n7\n9\n1\n6\n0\t76\t1\n2\n3\n5\n9\n0\t43\t2\n5\n6\n1\n5\n6\t21\t4\n8\n9\n2\n7\n0\t95\t3\n5\n7\n7\n9\n0\t68\t4\n6\n8\n*\n*\n*\t**\t*\n*\n*
20/10/2025\nto\n26/10/2025\t*\n*\n*\t**\t*\n*\n*\n*\n*\n*\t**\t*\n*\n*\n*\n*\n*\t**\t*\n*\n*\n8\n8\n0\t60\t5\n6\n9\n4\n6\n7\t71\t2\n3\n6\n7\n9\n0\t63\t4\n4\n5\n2\n3\n0\t58\t3\n5\n0
27/10/2025\nto\n02/11/2025\t5\n8\n9\t24\t1\n6\n7\n2\n9\n0\t13\t3\n3\n7\n4\n5\n6\t57\t1\n7\n9\n3\n6\n0\t99\t2\n2\n5\n4\n9\n9\t23\t1\n3\n9\n3\n4\n5\t20\t5\n7\n8\n2\n2\n5\t91\t1\n4\n6
03/11/2025\nto\n09/11/2025\t2\n4\n9\t50\t3\n7\n0\n9\n9\n0\t87\t5\n6\n6\n2\n7\n7\t62\t1\n4\n7\n1\n4\n8\t31\t5\n6\n0\n6\n6\n8\t04\t3\n5\n6\n1\n6\n9\t66\t2\n6\n8\n4\n8\n0\t29\t4\n7\n8
10/11/2025\nto\n16/11/2025\t4\n9\n0\t34\t6\n8\n0\n1\n2\n6\t91\t1\n3\n7\n1\n5\n8\t42\t5\n7\n0\n1\n8\n0\t95\t3\n4\n8\n2\n5\n7\t47\t4\n4\n9\n3\n8\n9\t01\t1\n2\n8\n2\n6\n0\t87\t4\n5\n8
17/11/2025\nto\n23/11/2025\t2\n7\n8\t76\t1\n5\n0\n4\n7\n0\t15\t3\n5\n7\n3\n0\n0\t38\t1\n1\n6\n2\n3\n7\t27\t8\n9\n0\n1\n3\n6\t02\t1\n2\n9\n3\n5\n9\t76\t2\n6\n7\n1\n4\n9\t41\t5\n7\n9
24/11/2025\nto\n30/11/2025\t8\n0\n0\t89\t4\n6\n9\n1\n4\n5\t03\t2\n4\n7\n3\n7\n9\t96\t4\n5\n7\n2\n2\n3\t78\t1\n7\n0\n4\n9\n0\t38\t3\n6\n9\n6\n9\n9\t45\t7\n8\n0\n4\n6\n0\t00\t1\n2\n7
01/12/2025\nto\n07/12/2025\t2\n3\n5\t01\t6\n7\n8\n3\n6\n6\t50\t1\n9\n0\n7\n8\n9\t49\t4\n7\n8\n2\n3\n6\t13\t1\n2\n0\n5\n0\n0\t52\t6\n7\n9\n8\n9\n9\t67\t4\n6\n7\n2\n4\n6\t23\t1\n5\n7
08/12/2025\nto\n14/12/2025\t1\n6\n0\t74\t3\n3\n8\n2\n3\n8\t39\t5\n7\n7\n1\n2\n4\t78\t5\n6\n7\n2\n4\n4\t06\t1\n6\n9\n4\n6\n8\t89\t1\n4\n4\n2\n3\n6\t17\t3\n6\n8\n6\n9\n0\t58\t1\n3\n4
15/12/2025\nto\n21/12/2025\t1\n5\n9\t52\t5\n8\n9\n3\n3\n0\t68\t2\n6\n0\n5\n7\n9\t17\t4\n5\n8\n6\n8\n8\t23\t3\n4\n6\n2\n4\n8\t48\t1\n2\n5\n2\n2\n6\t09\t5\n5\n9\n1\n3\n8\t22\t3\n9\n0
22/12/2025\nto\n28/12/2025\t1\n3\n9\t30\t4\n7\n9\n3\n6\n9\t85\t1\n6\n8\n7\n9\n0\t64\t2\n3\n9\n2\n6\n7\t56\t1\n5\n0\n4\n8\n9\t12\t5\n7\n0\n6\n8\n9\t37\t2\n7\n8\n1\n7\n8\t65\t7\n8\n0
29/12/2025\nto\n04/01/2026\t3\n5\n9\t75\t2\n4\n9\n1\n4\n5\t07\t4\n6\n7\n*\n*\n*\t**\t*\n*\n*\n5\n6\n7\t80\t1\n9\n0\n1\n5\n8\t42\t3\n4\n5\n1\n3\n0\t49\t2\n8\n9\n3\n9\n9\t18\t9\n9\n0
05/01/2026\nto\n11/01/2026\t1\n5\n6\t22\t4\n8\n0\n2\n5\n9\t64\t5\n9\n0\n3\n3\n5\t19\t1\n3\n5\n1\n2\n9\t26\t4\n4\n8\n5\n7\n8\t05\t3\n4\n8\n2\n4\n5\t17\t1\n7\n9\n1\n2\n0\t38\t3\n5\n0
12/01/2026\nto\n18/01/2026\t2\n5\n0\t79\t3\n8\n8\n1\n6\n8\t50\t5\n7\n8\n7\n0\n0\t74\t2\n6\n6\n6\n7\n0\t39\t3\n6\n0\n2\n5\n9\t69\t1\n2\n6\n1\n6\n7\t42\t5\n8\n9\n2\n5\n8\t56\t7\n9\n0
19/01/2026\nto\n25/01/2026\t1\n3\n4\t81\t2\n3\n6\n2\n5\n6\t35\t1\n4\n0\n1\n3\n8\t25\t3\n5\n7\n5\n8\n8\t19\t1\n3\n5\n2\n7\n8\t70\t2\n8\n0\n3\n7\n0\t02\t6\n7\n9\n3\n3\n3\t91\t1\n4\n6
26/01/2026\nto\n01/02/2026\t*\n*\n*\t**\t*\n*\n*\n1\n5\n0\t63\t2\n5\n6\n4\n8\n9\t17\t1\n2\n4\n3\n4\n6\t32\t6\n6\n0\n8\n9\n0\t74\t1\n4\n9\n4\n7\n7\t85\t2\n3\n0\n1\n6\n8\t50\t5\n7\n8
02/02/2026\nto\n08/02/2026\t1\n3\n0\t41\t3\n8\n0\n6\n6\n8\t09\t1\n9\n9\n3\n9\n0\t24\t3\n5\n6\n1\n5\n8\t49\t2\n8\n9\n4\n5\n9\t85\t2\n4\n9\n1\n8\n0\t92\t4\n9\n9\n2\n3\n6\t18\t2\n7\n9
09/02/2026\nto\n15/02/2026\t2\n6\n9\t79\t3\n7\n9\n2\n3\n4\t92\t1\n4\n7\n4\n7\n8\t96\t3\n4\n9\n1\n9\n0\t07\t5\n6\n6\n6\n7\n8\t12\t2\n3\n7\n1\n3\n6\t01\t5\n6\n0\n4\n9\n0\t30\t3\n8\n9
16/02/2026\nto\n22/02/2026\t2\n7\n0\t98\t1\n8\n9\n4\n4\n7\t50\t5\n6\n9\n*\n*\n*\t**\t*\n*\n*\n1\n2\n6\t95\t3\n3\n9\n1\n3\n4\t89\t2\n8\n9\n3\n6\n8\t70\t5\n7\n8\n1\n8\n0\t91\t2\n3\n6
23/02/2026\nto\n01/03/2026\t6\n8\n0\t40\t1\n9\n0\n2\n5\n5\t24\t7\n7\n0\n1\n6\n9\t66\t3\n3\n0\n1\n5\n8\t45\t6\n9\n0\n2\n8\n0\t02\t4\n9\n9\n1\n5\n9\t55\t2\n6\n7\n4\n8\n0\t26\t1\n2\n3
02/03/2026\nto\n08/03/2026\t1\n6\n8\t56\t2\n5\n9\n1\n2\n7\t08\t6\n6\n6\n*\n*\n*\t**\t*\n*\n*\n2\n4\n5\t10\t4\n6\n0\n1\n4\n0\t58\t5\n6\n7\n3\n6\n0\t93\t1\n5\n7\n1\n4\n5\t07\t3\n4\n0
09/03/2026\nto\n15/03/2026\t2\n6\n0\t85\t4\n5\n6\n1\n4\n8\t34\t3\n3\n8\n2\n3\n7\t26\t8\n9\n9\n2\n4\n0\t63\t1\n2\n0\n2\n4\n6\t24\t1\n6\n7\n4\n7\n9\t08\t3\n5\n0\n1\n2\n8\t15\t8\n8\n9
16/03/2026\nto\n22/03/2026\t3\n8\n9\t02\t1\n4\n7\n5\n6\n6\t71\t2\n2\n7\n6\n6\n7\t93\t1\n2\n0\n*\n*\n*\t**\t*\n*\n*\n3\n4\n6\t39\t1\n2\n6\n2\n5\n8\t56\t8\n8\n0\n1\n2\n6\t99\t4\n7\n8
23/03/2026\nto\n29/03/2026\t2\n4\n8\t48\t4\n6\n8\n3\n4\n9\t62\t1\n1\n0\n8\n9\n0\t75\t2\n3\n0\n5\n6\n7\t83\t6\n7\n0\n4\n8\n0\t20\t2\n4\n4\n6\n6\n9\t12\t1\n2\n9\n2\n3\n5\t07\t2\n7\n8
30/03/2026\nto\n05/04/2026\t2\n7\n0\t90\t5\n5\n0\n6\n7\n9\t25\t1\n6\n8\n5\n6\n9\t01\t3\n9\n9\n3\n6\n0\t99\t5\n6\n8\n1\n5\n8\t45\t2\n6\n7\n4\n4\n9\t73\t3\n0\n0\n1\n3\n7\t16\t7\n9\n0
06/04/2026\nto\n12/04/2026\t1\n3\n9\t33\t6\n8\n9\n2\n6\n0\t86\t2\n5\n9\n3\n4\n7\t40\t5\n7\n8\n4\n4\n8\t64\t1\n4\n9\n3\n8\n9\t02\t3\n4\n5\n1\n2\n5\t85\t7\n9\n9\n5\n5\n9\t94\t2\n5\n7
13/04/2026\nto\n19/04/2026\t2\n4\n5\t15\t1\n4\n0\n3\n7\n0\t08\t4\n6\n8\n1\n2\n6\t92\t1\n3\n8\n5\n8\n0\t37\t2\n6\n9\n1\n7\n0\t80\t4\n7\n9\n3\n4\n6\t37\t3\n5\n9\n3\n9\n0\t23\t2\n5\n6
20/04/2026\nto\n26/04/2026\t3\n5\n6\t49\t2\n8\n9\n1\n5\n7\t34\t6\n8\n0\n2\n3\n0\t50\t3\n3\n4\n4\n5\n6\t51\t1\n2\n8\n3\n6\n7\t62\t7\n7\n8\n5\n6\n0\t18\t2\n3\n3\n1\n6\n7\t40\t4\n7\n9
27/04/2026\nto\n03/05/2026\t1\n2\n5\t86\t4\n6\n6\n3\n3\n5\t18\t1\n3\n4\n2\n4\n6\t22\t5\n7\n0\n2\n5\n9\t69\t3\n6\n0\n1\n3\n5\t98\t2\n7\n9\n8\n8\n9\t55\t6\n9\n0\n1\n2\n0\t30\t2\n9\n9
04/05/2026\nto\n10/05/2026\t1\n7\n9\t75\t2\n6\n7\n5\n9\n0\t41\t6\n6\n9\n3\n3\n7\t37\t1\n1\n5\n4\n5\n7\t61\t4\n7\n0\n1\n4\n9\t43\t5\n8\n0\n3\n7\n9\t91\t6\n7\n8\n2\n7\n8\t73\t4\n9\n0
11/05/2026\nto\n17/05/2026\t2\n4\n6\t28\t4\n5\n9\n6\n7\n0\t38\t3\n5\n0\n6\n6\n8\t09\t2\n7\n0\n4\n8\n9\t17\t3\n6\n8\n1\n7\n8\t66\t2\n6\n8\n2\n6\n0\t84\t3\n5\n6\n4\n5\n5\t48\t1\n2\n5
18/05/2026\nto\n24/05/2026\t1\n6\n8\t51\t3\n8\n0\n5\n6\n7\t86\t7\n9\n0\n4\n5\n0\t91\t5\n6\n0\n8\n9\n0\t73\t6\n7\n0\n1\n6\n8\t51\t1\n1\n9\n1\n9\n0\t06\t2\n4\n0\n3\n3\n6\t20\t5\n7\n8
25/05/2026\nto\n31/05/2026\t4\n5\n6\t52\t5\n8\n9\n3\n3\n8\t47\t1\n6\n0\n1\n1\n8\t08\t4\n6\n8\n3\n4\n9\t60\t6\n7\n7\n2\n3\n7\t29\t1\n3\n5\n5\n7\n7\t98\t8\n0\n0\n3\n4\n6\t33\t5\n9\n9
01/06/2026\nto\n07/06/2026\t1\n0\n0\t16\t2\n5\n9\n3\n9\n0\t23\t7\n8\n8\n2\n3\n4\t92\t1\n2\n9\n5\n7\n9\t15\t2\n6\n7\n3\n4\n0\t76\t8\n8\n0\n2\n5\n9\t60\t3\n8\n9\n1\n7\n0\t81\t1\n3\n7
08/06/2026\nto\n14/06/2026\t1\n3\n0\t40\t6\n6\n8\n2\n4\n9\t59\t4\n5\n0\n1\n6\n9\t64\t1\n5\n8\n3\n6\n0\t90\t5\n7\n8\n4\n9\n0\t37\t1\n7\n9\n2\n7\n7\t66\t6\n0\n0\n6\n7\n8\t12\t4\n9\n9"""

# ============================================================
# PARSING HELPERS
# ============================================================
def norm_date(s):
    s = s.strip().replace('/', '-')
    d, m, y = s.split('-')
    return f'{y}-{m}-{d}'

def ls(field):
    return [x.strip() for x in field.split('\n') if x.strip()]

def make_cell(top, main, bottom):
    m = (main or '**').strip()
    is_red = bool(m and m != '**' and m != '*' and len(m) == 2 and m[0] == m[1])
    return {'topDigits': top or ['*','*','*'], 'main': m,
            'bottomDigits': bottom or ['*','*','*'], 'isRed': is_red}

def parse_panel_block_old(fields):
    # Old: 9 fields. Field[1]=Mon_top3+main(4 lines), Field[2-7]=prev_bot3+curr_top3+main(7 lines), Field[8]=Sun_bot3
    f1 = ls(fields[1])
    if len(f1) >= 4:
        mon_top, mon_main = f1[:3], f1[3]
    else:
        mon_top, mon_main = ['*','*','*'], '**'

    cells = [None] * 7
    tops = [mon_top] + [None]*6
    mains = [mon_main] + [None]*6
    bottoms = [None] * 7

    for fi in range(2, 8):
        day_idx = fi - 1
        f = ls(fields[fi])
        if len(f) >= 7:
            bottoms[day_idx-1] = f[:3]
            tops[day_idx] = f[3:6]
            mains[day_idx] = f[6]
        elif len(f) >= 6:
            bottoms[day_idx-1] = f[:3]
            tops[day_idx] = f[3:6]
            mains[day_idx] = '**'
        else:
            bottoms[day_idx-1] = ['*','*','*']
            tops[day_idx] = ['*','*','*']
            mains[day_idx] = '**'

    f8 = ls(fields[8]) if len(fields) > 8 else []
    bottoms[6] = f8[:3] if len(f8) >= 3 else ['*','*','*']

    return [make_cell(tops[i], mains[i], bottoms[i]) for i in range(7)]

def parse_panel_block_new(fields):
    # New: 16 fields. [1]=Mon_top3, [2]=Mon_main, [3]=Mon_bot3+Tue_top3(6), [4]=Tue_main, ..., [15]=Sun_bot3
    mon_top = ls(fields[1])[:3] or ['*','*','*']
    mon_main = fields[2].strip() if len(fields) > 2 else '**'

    combined, mains = [], []
    for fi in range(3, 15, 2):
        combined.append(ls(fields[fi]) if fi < len(fields) else [])
    for fi in range(4, 15, 2):
        mains.append(fields[fi].strip() if fi < len(fields) else '**')
    sun_bot = ls(fields[15])[:3] if len(fields) > 15 else ['*','*','*']

    bottoms = [c[:3] if len(c) >= 3 else ['*','*','*'] for c in combined]
    tops    = [c[3:6] if len(c) >= 6 else ['*','*','*'] for c in combined]

    all_tops    = [mon_top]    + tops
    all_mains   = [mon_main]   + mains
    all_bottoms = bottoms[:6]  + [sun_bot]
    if len(bottoms) >= 1:
        all_bottoms = [bottoms[0]] + [bottoms[i+1] if i+1 < len(bottoms) else ['*','*','*'] for i in range(5)] + [sun_bot]
    else:
        all_bottoms = [['*','*','*']]*6 + [sun_bot]

    return [make_cell(all_tops[i], all_mains[i], all_bottoms[i]) for i in range(7)]

def parse_panel_row(block):
    parts = block.split('\t')
    date_lines = parts[0].split('\n')
    start_date = norm_date(date_lines[0])
    end_date   = norm_date(date_lines[2]) if len(date_lines) >= 3 else start_date

    f1_lines = len(ls(parts[1])) if len(parts) > 1 else 0
    if f1_lines == 4:
        while len(parts) < 9: parts.append('')
        cells = parse_panel_block_old(parts)
    else:
        while len(parts) < 16: parts.append('')
        cells = parse_panel_block_new(parts)

    return {'startDate': start_date, 'endDate': end_date, 'cells': cells}

# Parse panel rows
panel_blocks = re.split(r'(?=\d{2}[-/]\d{2}[-/]\d{4}\nto\n\d{2}[-/]\d{2}[-/]\d{4})', PANEL_RAW.strip())
panel_rows = []
for b in panel_blocks:
    b = b.strip()
    if not b: continue
    try:
        panel_rows.append(parse_panel_row(b))
    except Exception as e:
        print(f'Panel parse error: {e} | {b[:50]}')

print(f'Panel rows parsed: {len(panel_rows)}')
print(f'Panel range: {panel_rows[0]["startDate"]} to {panel_rows[-1]["endDate"]}')

# Verify a few
r = panel_rows[0]
c = r['cells'][0]
t, m, b = c['topDigits'], c['main'], c['bottomDigits']
if all(x not in ('*','**') for x in t+b) and m not in ('**','*'):
    s1 = sum(int(x) for x in t) % 10
    s2 = sum(int(x) for x in b) % 10
    print(f'Row0 Mon verify: top_sum%10={s1}=={m[0]}? {s1==int(m[0])}, bot_sum%10={s2}=={m[1]}? {s2==int(m[1])}')

# Parse jodi rows, start from 2023-01-02
from datetime import date, timedelta
jodi_start = date(2023, 1, 2)
jodi_rows = []
week = jodi_start
for line in JODI_RAW.strip().split('\n'):
    parts = [p.strip() for p in line.strip().split('\t')]
    if len(parts) != 7:
        continue
    cells = [make_cell(['*','*','*'], p, ['*','*','*']) for p in parts]
    end = week + timedelta(days=6)
    jodi_rows.append({'startDate': week.isoformat(), 'endDate': end.isoformat(), 'cells': cells})
    week += timedelta(days=7)

print(f'Jodi rows parsed: {len(jodi_rows)}')
print(f'Jodi range: {jodi_rows[0]["startDate"]} to {jodi_rows[-1]["endDate"]}')

# Merge: panel rows override jodi rows for same startDate
panel_map = {r['startDate']: r for r in panel_rows}
jodi_map  = {r['startDate']: r for r in jodi_rows}

all_dates = sorted(set(list(panel_map.keys()) + list(jodi_map.keys())))
merged = []
for d in all_dates:
    merged.append(panel_map.get(d) or jodi_map[d])

print(f'Merged total: {len(merged)}')
print(f'Merged range: {merged[0]["startDate"]} to {merged[-1]["endDate"]}')
with_digits = sum(1 for r in merged if any(c['topDigits'][0] not in ('*','**') for c in r['cells']))
print(f'Rows with panel digits: {with_digits}')

import json
output = {'gameId': 'LAXMI_NIGHT', 'rows': merged}
with open(r'd:\dpboss\data\laxmi-night.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))
print('Written laxmi-night.json')
