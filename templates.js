/**
 * 林口長庚病歷各區塊規範與實戰模板資料
 * 整合自《病歷寫作注意事項》與《Dr.李明勳 / Dr.方基存 住院病歷書寫參考範本》
 */

const CGMH_PEDIGREE_TREE = `Three-generation Pedigree Tree (已標示同住家人):
   [Paternal Grandfather] ──┬── [Paternal Grandmother]    [Maternal Grandfather] ──┬── [Maternal Grandmother]
                            │                                                      │
                        [Father] ───────────────────────┬────────────────────── [Mother]
                                                        │
                                                     ↗ [pt] (Lives with family)`;

const CGMH_SECTION_TEMPLATES = [
  {
    id: 'general_data',
    badgeKey: null,
    group: 'Admission Note',
    shortTitle: 'I. 一般資料',
    title: 'I. 一般資料 (General Data)',
    subtitle: '含成人基本欄位、TOCC 接觸史與兒科生長百分位',
    rules: [
      '必要欄位：入院日期、職業、婚姻 (Married/single/divorced)、教育、宗教、種族、精神心理、社會經濟、TOCC（本人/家屬/親友旅遊史、症狀、職業別、群聚、接觸史）、主要照顧者、資料來源。',
      '兒科/小兒外科開頭寫法例：「A 22-year-3-month-old boy.」，並補齊身高 (BH)、體重 (BW)、BMI 及其生長百分位 (percentile)。',
      '資料來源務必註明對象（如 According to patient himself or family (mother)）。'
    ],
    pitfalls: [
      '兒科漏寫身高體重 BMI 百分位，或 TOCC 僅寫一個「無」而未區分本人與接觸家屬/親友。'
    ],
    template: `一般資料：(General Data)
This [年齡]-year-old [male / female] (兒科例：A [X]-year-[Y]-month-old [boy / girl]).
(兒科選填) BH: ___ cm = ___th percentile, BW: ___ kg = ___th percentile, BMI: ___ kg/m2 = ___th percentile
學歷：___  職業：無  婚姻：未婚 / 已婚 / 離婚  宗教：無  種族：台灣
精神心理：睡眠品質可  社會經濟：經濟無虞
旅遊史(本人)：無  旅遊史(曾接觸之家屬)：無  旅遊史(曾接觸之親友)：無
症狀：___  職業別：無  群聚：無  接觸史：無
主要照顧者：家屬
資料來源：According to patient himself/herself (or family: ___)`,
    pedsTemplate: `一般資料：(General Data)
A __-year-__-month-old boy / girl.
BH: ___ cm = ___th percentile
BW: ___ kg = ___th percentile
BMI: ___ kg/m2 = ___th percentile
旅遊史(本人)：無  旅遊史(曾接觸之家屬)：無  旅遊史(曾接觸之親友)：無
症狀：___  職業別：無  群聚：無  接觸史：無
學歷：無  職業：無  婚姻：未婚  種族：台灣  精神心理：睡眠品質可  社會經濟：經濟無虞  宗教：無
主要照顧者：父母
資料來源：According to patient's mother/father`
  },
  {
    id: 'chief_complaint',
    badgeKey: 'cc',
    group: 'Admission Note',
    shortTitle: 'II. 主訴 (CC)',
    title: 'II. 主訴 (Chief Complaint)',
    subtitle: 'Symptom or sign + duration，症狀不超過兩個',
    rules: [
      '必要格式：「Symptom or sign + duration」（例如：RUQ pain and fever for 3 days）。',
      '症狀盡量精簡，不超過兩個主要症狀。'
    ],
    pitfalls: [
      '不可寫具體日期或時間點（❌ since 6/10, 730pm → ✅ for 1 hour）。',
      '不可把該放在 Present Illness 的住院目的寫進 CC（❌ admitted for scheduled surgery for anorectal malformation）。'
    ],
    template: `主訴：(Chief Complaint)
[Symptom/Sign 1] (and [Symptom/Sign 2]) for [Duration]

(範例：RUQ pain and fever for 3 days)`
  },
  {
    id: 'present_illness',
    badgeKey: 'pi',
    group: 'Admission Note',
    shortTitle: 'III. 現在病症 (PI)',
    title: 'III. 現在病症 (Present Illness)',
    subtitle: '三段式結構 + LQQOPERA 時序記述',
    rules: [
      '第一段：納入與本次住院有關的 past illnesses & previous hospitalizations，以 CC 為中心依時序記錄 LQQOPERA（Location, Quality, Quantity, Onset mode, Precipitating, Exaggerating, Relieving, Accompanying）。',
      '第二段：著重鑑別診斷，列出排除他病的 negative findings、本院急診與外院檢查及治療反應，並強調「為何讓病人入院」。',
      '第三段：描述同時存在的共病（Concurrent diseases / Co-morbidity），並總結病程中關鍵陽陰性症狀。'
    ],
    pitfalls: [
      '英文文法錯誤，或直接 Copy and paste 上一次住院病歷卻一字未改。',
      '只堆疊檢查報告而未說明「住院原因 / 適應症」與「排除鑑別診斷之陰性發現」。'
    ],
    template: `現在病症：(Present Illness)
This [年齡]-year-old [male/female] has a history of [相關過去史與用藥/住院史]. [時間前], he/she developed [主訴症狀] ([Onset: abrupt/sudden/insidious], [Location/Radiation], [Quality], [Quantity: persistent/intermittent]). The symptom was precipitated/aggravated by [誘發或加重因素] and partially relieved by [緩解因素], accompanied by [伴隨症狀].

He/She was brought to [外院或本院急診], where [檢查數據、影像結果與處置反應] were noted. Pertinent negative findings included absence of [排除鑑別診斷之陰性發現]. Due to [明確住院原因與嚴重度], he/she was admitted to our ward for further evaluation and management.

In addition, concurrent problems including [共病] were noted. Throughout the course, there were [重要陽性伴隨症狀], but no [重要陰性症狀].`
  },
  {
    id: 'past_history',
    badgeKey: null,
    group: 'Admission Note',
    shortTitle: 'IV. 過去病史',
    title: 'IV. 過去病史 (Past History)',
    subtitle: 'Active/Inactive 問題、本院住院/手術史與慢病控制',
    rules: [
      '逐項列出 active 與 inactive problems；若與本次住院相關，須併入 Present Illness 第一段。',
      'DM / HTN / 心血管疾病必須寫明：用藥、追蹤院所、是否固定追蹤、平日血糖/血壓控制數值。',
      '住院史以日期區間列點（YYYY/MM/DD-YYYY/MM/DD）；手術史寫明診斷、手術名稱、日期與院所。'
    ],
    pitfalls: [
      '明明在本院已有住院或手術紀錄卻未記載。',
      '8 歲以下兒童未必要記載抽菸、喝酒、吃檳榔（欄位需要時填 not applicable）。'
    ],
    template: `過去病史：(Past History)
1. Allergy: no known drug or food allergy
2. Admission history: denied previous admission history
   (若有：YYYY/MM/DD-YYYY/MM/DD: [診斷/摘要])
3. Operation history: denied previous surgical history
   (若有：[診斷] status post [手術名稱] in [YYYY/MM] in [醫院名稱])
4. Chronic illness:
   - DM: denied (若有：[用藥]、[追蹤院所/固定與否]、平日血糖約 ___ mg/dL)
   - Hypertension: denied (若有：[用藥]、[追蹤院所/固定與否]、平日血壓約 ___/___ mmHg)
   - Denied history of pulmonary TB, COPD, or liver diseases
5. Medication history: denied medication use`
  },
  {
    id: 'personal_adult',
    badgeKey: null,
    group: 'Admission Note',
    shortTitle: 'V-A. 個人病史(成人)',
    title: 'V-A. 個人病史 — 成人版 (Personal History)',
    subtitle: '過敏、菸酒檳榔、旅遊接觸史、本院與非本院現狀用藥',
    rules: [
      '包含 Allergy、Smoking、Alcohol、Betalnut、旅遊史（是否至疫區）、動物接觸史。',
      '務必區分「本院現狀用藥（藥名/劑量/用法/數量）」與「非本院用藥（確認有無院外藥、中藥或保健食品）」。'
    ],
    pitfalls: [
      '未確認病人是否有院外慢性病藥、中藥或保健食品即直接略過。'
    ],
    template: `個人病史：(Personal History)
Allergy：no known drug or food allergy
Smoking：Denied
Alcohol：Denied
Betel nut：Denied
旅遊史：Denied travel to epidemic areas
動物接觸史：Denied
本院現狀用藥：As order list (或貼上藥名 / 劑量 / 用法 / 數量)
非本院用藥：經與病人/家屬確認，無院外用藥、中藥或保健食品`
  },
  {
    id: 'personal_peds',
    badgeKey: null,
    group: '兒科 / 小兒外科',
    shortTitle: 'V-B. 個人病史(5歲以下)',
    title: 'V-B. 個人病史 — 兒科 5 歲以下專用 (Personal History)',
    subtitle: 'Birth history、發展里程碑細項、完整常規與自費疫苗',
    rules: [
      '5 歲以下必須包含 Birth history (G_P_)、Newborn screening、Growth and development、Vaccination。',
      '5 歲以下成長發展最好寫完整里程碑；至少正常的寫 normal development / reach normal milestone，異常部分必須詳述。',
      '8 歲以下 Alcohol / betel nuts / cigarette 填寫 not applicable。'
    ],
    pitfalls: [
      '小兒外科住院病歷最常漏寫 Growth and development 與 Vaccination！'
    ],
    template: `個人病史：(Personal History)
1. Birth history: G_P_, GA __ weeks, NSD / C/S, BBW ___ g, perinatal course smooth
2. Newborn screening: no abnormal finding
3. Growth and development: reach normal milestone
   Development:
   Social smile (~1.5mo): 2mo   Head control (~3mo): 3mo
   Reach for objects (~4mo): 4mo   Transfer object hand to hand (~5.5mo): 5mo
   Roll over (~6.5mo): 6mo   Sit without support (~7mo): 7mo
   Crawl (~8mo): 8mo   Stand alone (~11mo): 11mo
   Walk alone (~12mo): 12mo   Speak first real word (~12mo): 12mo
   Scribble (~13mo): 13mo   Run well (~24mo): 2yr
   Ride tricycle (~3yr): 3yr   Dress and undress (~5yr): 5yr
4. Vaccination:
   <24hr HBIG: not received / received
   2-5dy HepB(1st): vaccinated   1mo HepB(2nd): vaccinated
   2mo DTaP-Hib-IPV1: vaccinated   2mo PCV13(1st): vaccinated
   4mo DTaP-Hib-IPV2: vaccinated   4mo PCV13(2nd): vaccinated
   5mo BCG: vaccinated
   6mo DTaP-Hib-IPV3: vaccinated   6mo HepB(3rd): vaccinated
   12mo Varicella: vaccinated   12mo MMR(1st): vaccinated   12mo PCV13(3rd): vaccinated
   12-15mo HepA(1st): vaccinated   15mo JE(1st): vaccinated
   18mo DTaP-Hib-IPV4: vaccinated   18-21mo HepA(2nd): vaccinated   27mo JE(2nd): vaccinated
   Additional vaccination: Influenza: ___ / Rotavirus: ___
5. Alcohol/betel nuts/cigarette: not applicable
本院現狀用藥：As order list
非本院用藥：經與病人/家屬確認，無院外用藥、中藥或保健食品`
  },
  {
    id: 'family_history',
    badgeKey: 'fh',
    group: 'Admission Note',
    shortTitle: 'VI. 家族史 (FH)',
    title: 'VI. 家族史 (Family History)',
    subtitle: '禁用 Nil / Non-contributory；附三代家族樹與同住者',
    rules: [
      '明確記載血親有無：糖尿病、高血壓、高血脂、心血管疾病、癌症家族史。',
      '確認有無 Similar disease in family，特別是 hernia、Hirschsprung disease 等具遺傳傾向之疾病。',
      '繪製三代 Pedigree Tree，圈出/標示與病人同住的家人及住所環境。'
    ],
    pitfalls: [
      '嚴禁使用 "Non-contributory"、"Nil" 或 "Nothing particular" 一語帶過。',
      '常見整段空白缺失。'
    ],
    template: `家族史：(Family History)
1. 血親無糖尿病、高血壓、高血脂、心血管及癌症家族史（若有請標註成員與病名，如 Father: DM, HTN）。
2. Similar disease in family: denied（特別確認無 hernia, Hirschsprung disease 等遺傳傾向疾病）。
3. 住所環境：與家人同住，居住環境無異常暴露。
${CGMH_PEDIGREE_TREE}`
  },
  {
    id: 'ros',
    badgeKey: 'ros',
    group: 'Admission Note',
    shortTitle: 'VII. 系統整理 (ROS)',
    title: 'VII. 系統整理 (Review of System)',
    subtitle: '11 大系統完整格式，與 CC/PI 連動並標示 *',
    rules: [
      'Positive 症狀請標示 *（例如 weakness:(YES*)、dizziness:(YES*)），並追問部位、時間、性質與強度（不可僅寫 Consciousness (+)）。',
      'CC 或 PI 已提及的症狀，ROS 對應系統必須同步為陽性，跨系統同名症狀（如 Head dizziness 與 Neuropsychiatry dizziness）也要一致。'
    ],
    pitfalls: [
      'CC/PI 寫劇烈腹痛或發燒（如 appendicitis），ROS 的 GI 或 General 卻全部寫 (no)。'
    ],
    template: `系統整理：(Review of System)
1. General: weakness:(no), fatigue:(no), anorexia:(no), fever:(no), insomnia:(no)
2. Integument (skin, hair and nails): changes in color:(no), pruritus:(no), rash:(no), hair loss:(no)
3. HEENT:
   a. Head - headache:(no), dizziness:(no), vertigo:(no)
   b. Eyes - visual acuity:(normal), color vision:(normal), corrective lenses:(no), photophobia:(no), diplopia:(no), pain:(no)
   c. Ears - pain:(no), discharge:(no), hearing loss:(no), tinnitus:(no)
   d. Nose - epistaxis:(no), discharge:(no), stuffiness:(no), sense of smell:(normal)
   e. Throat - status of teeth:(normal), gums:(normal), dentures:(no), taste:(normal), soreness:(no), hoarseness:(no), lump:(no)
4. Respiratory System: cough:(no), sputum:(no), hemoptysis:(no), wheezing:(no), dyspnea:(no)
5. Cardiovascular System: edema:(no), chest distress:(no), chest pain:(no), palpitation:(no), intermittent claudication:(no), cold limbs:(no), cyanosis:(no)
6. Gastrointestinal System: dysphagia:(no), nausea:(no), vomiting:(no), abdominal distress/pain:(no), change in bowel habit:(no), hematemesis:(no), melena:(no), bloody stool:(no)
7. Genito-Urinary System: urinary frequency:(no), hesitancy:(no), urgency:(no), dribbling:(no), incontinence:(no), dysuria:(no), hematuria:(no), nocturia:(no), polyuria:(no), impotence:(no)
8. Metabolic and endocrine: growth:(fair), development:(normal), weight change:(no), heat/cold intolerance:(no), nervousness:(no), sweating:(no), polydipsia:(no)
9. Hematologic: anemia:(no), easy brusity or bleeding:(no), lymphadenopathy:(no), transfusions:(no)
10. Neuropsychiatry: dizziness:(no), syncope:(no), seizure:(no), speech disturbance:(no), loss of sensation:(no), paresthesia:(no), ataxia:(no), weakness or paralysis:(no), tremor:(no), anxiety:(no), depression:(no), irritability:(no)
11. Musculoskeletal: joint pain:(no), stiffness:(no), limitation of motion:(no), muscular weakness:(no), muscle wasting:(no)`
  },
  {
    id: 'physical_exam',
    badgeKey: null,
    group: '參考 / 手動備用',
    shortTitle: 'VIII. 理學檢查 (PE)',
    title: 'VIII. 理學檢查 (Physical Examination — 手冊參考模板)',
    subtitle: '註：本生成神器已預設略過 PE 以便院內系統點選；以下提供完整規範與模板備用',
    rules: [
      '避免主訴、入院診斷與理學檢查互相矛盾；異常發現盡量定量化（如 Pitting edema (+)/(++)、Gr. II/VI Pansystolic murmur...）。',
      '外科小刀（疝氣、陰囊積水、隱睪）須寫明 positive findings（silk sign、hydrocele 左右側）。',
      '急診刀術後住院須載明傷口位置與大小（如 laparoscopic wounds）；多次腹部大手術者必須寫出 surgical scar。'
    ],
    pitfalls: [
      '腹部多次開刀病人 PE 卻完全沒提到手術疤痕；術後病人沒寫傷口狀況。'
    ],
    template: `理學檢查：(Physical Examination)
BP: ___/___ mmHg  P: ___/min  R: ___/min  T: ___ °C  身高: ___ cm  體重: ___ kg  BMI: ___ kg/m2
疼痛評估：___ /10
【General Appearance】Fair looking
【Consciousness】Clear, E4V5M6
【HEENT】Sclerae: NOT icteric; Conjunctivae: NOT pale; Oral cavity: intact oral mucosa, normal tongue appearance, throat NOT injected
【Neck】Supple, no jugular vein engorgement, trachea NOT deviated, no lymphadenopathy; Carotid pulse: normal amplitude, regular rhythm, no bruits
【Chest】Breath pattern: smooth, bilateral symmetric expansion, no use of accessory muscles; Breathing sound: bilateral clear and symmetric, no wheezing, no basal crackles; Percussion: bilateral symmetric normoresonance; No sternal tenderness
【Heart】Regular heart beat without audible murmur; S1, S2 normal; no audible S3/S4; no heave
【Abdomen】Soft and flat, no superficial vein engorgement, no umbilicus herniation (有舊手術須記載 surgical scar); Bowel sound: normoactive; Liver and spleen NOT palpable; no shifting dullness; No tenderness, no rebounding pain, no muscle guarding, no Murphy's sign
【Back】No knocking pain over bilateral flank area
【Extremities】No joint deformity, freely movable, no pitting edema, symmetric peripheral pulse
【Skin】No petechiae or ecchymosis, no abnormal skin rash
【Neurologic examination】Grossly intact`
  },
  {
    id: 'lab_findings',
    badgeKey: null,
    group: 'Admission Note',
    shortTitle: 'IX. 實驗室檢查',
    title: 'IX. 實驗室檢查 (Laboratory Findings)',
    subtitle: '檢驗值必附單位；異常數據以 *** 標示並附簡短解釋',
    rules: [
      '所有檢驗數據都必須附上單位（如 mg/dL, U/L, mEq/L, ng/mL）。',
      '包含已做之血液檢驗、Cultures 與外院相關檢驗資料。',
      '不正常數據須明確標示（如 ***）並加上簡短判讀解釋（例：Sugar: 37 mg/dL *** hypoglycemia）。'
    ],
    pitfalls: [
      '只貼數字沒寫單位，或把異常數據混在正常數據中未標示、未解釋。'
    ],
    template: `實驗室檢查：(Laboratory Findings)
WBC: ___ x10^3/uL, Hb: ___ g/dL, PLT: ___ x10^3/uL
BUN: ___ mg/dL, Creatinine: ___ mg/dL
AST/GOT: ___ U/L, ALT/GPT: ___ U/L
Na: ___ mEq/L, K: ___ mEq/L, Cl: ___ mEq/L
Sugar: ___ mg/dL   (異常標示例：Sugar: 37 mg/dL *** hypoglycemia)
CRP: ___ mg/L, Procalcitonin: ___ ng/mL
Cultures / Urinalysis / Outside data: ___`
  },
  {
    id: 'expert_findings',
    badgeKey: null,
    group: 'Admission Note',
    shortTitle: 'X. 影像檢查 (Expert)',
    title: 'X. 重要影像與檢查報告 (Expert)',
    subtitle: '保留檢查日期/時間與報告重點，務必刪除開單表單頭尾',
    rules: [
      '能夠佐證臨床診斷的重要影像或檢查報告應貼入此區。',
      '貼入 HIS 報告時，必須刪除開單表單頭尾（床號、檢查目的、<A>/<P>、開單科別/醫師、醫囑日期、收件號、主治/放射師簽名），僅保留檢查日期、檢查時間與報告本文/IMP。',
      '小提示：把整段 HIS 報告直接貼入本工具左側輸入框，系統會自動幫您清洗表頭！'
    ],
    pitfalls: [
      '直接全選 HIS 報告整張貼上，留下一堆床號、開單醫師與放射師簽名檔。'
    ],
    template: `重要影像/檢查報告：(Expert Findings)
檢查日期：YYYY/MM/DD  檢查時間：HH:MM:SS
[檢查名稱，例如 Computed Tomography of Abdomen With and Without Enhancement Show:]
1. ...
2. ...
IMP: ...`
  },
  {
    id: 'impression',
    badgeKey: 'imp',
    group: 'Admission Note',
    shortTitle: 'XI. 臨床臆斷 (Imp)',
    title: 'XI. 臨床臆斷 (Impression)',
    subtitle: 'Active 在前、Etiological 優先、1,2,3 條列（禁 # @ 與 with）',
    rules: [
      '排序：目前 Active 的疾病排在前面，非主要或 Inactive 的問題排在後面。',
      '診斷層級：Etiological diagnosis（如 NSAID induced ulcer）最佳 > Anatomical diagnosis（Duodenal ulcer）> 避免 Symptomatic diagnosis（Abdominal pain）。',
      '格式：以 1., 2., 3. 條列（避免 #、@）；不同診斷碼的疾病分開列，禁用 "xxxx with xxxx"（例：Inguinal hernia K4090/K4020 與 Hydrocele of tunica vaginalis/cord N433 應分開列，且依 DRG hydrocele 須合併 hernia）。',
      '惡性腫瘤應附基本分期（Staging）。'
    ],
    pitfalls: [
      '使用 # / @、寫成 "inguinal hernia with hydrocele"、或惡性腫瘤漏寫分期。'
    ],
    template: `臨床臆斷：(Impression)
1. [主要 Active 診斷 — Etiological > Anatomical] (若為惡性腫瘤附分期 cT_N_M_, stage __)
2. [次要 Active 診斷 / 不同診斷碼之併發問題，勿用 with 串接]
3. [相關 Inactive / Co-morbidity 診斷]`
  },
  {
    id: 'plan',
    badgeKey: 'plan',
    group: 'Admission Note',
    shortTitle: 'XII. 處理計畫 (Plan)',
    title: 'XII. 處理計畫 (Plan)',
    subtitle: 'Diagnostic / Therapeutic / Patient Education / Measurable goals',
    rules: [
      '每個診斷對應診斷與處置計畫，檢查與處置後方務必寫明「適應症」（為什麼安排這項檢查或用藥）。',
      '外科 Therapeutic 若為手術，必須寫出明確英文手術名稱（例如 laparoscopic fundoplication），嚴禁只寫 "surgery"、"operation" 等空泛字眼。',
      '須包含對病患/家屬的衛教（Patient Education）與可量化追蹤目標（Measurable goals）。'
    ],
    pitfalls: [
      '只開了一堆檢查項目卻沒寫適應症；外科計畫只寫 "arrange surgery/operation"。'
    ],
    template: `處理計畫：(Plan)
Diagnostic:
- [檢驗或影像項目] for [適應症/欲評估之問題]
- Complete lab and image survey for [適應症]
Therapeutic:
- [明確英文手術名稱，如 Laparoscopic fundoplication / Laparoscopic appendectomy] for [診斷與適應症]
- [藥物/抗生素名稱與途徑] for [適應症]
Patient Education:
- Explained diagnosis, planned procedure/treatment, potential risks, and expected course to patient and family.
Measurable goals:
- [具體可量化目標，如 Complete scheduled survey / Afebrile and symptom resolution]`
  },
  {
    id: 'progression_soap',
    badgeKey: null,
    group: '病程紀錄',
    shortTitle: 'XIII. 病程紀錄 (SOAP)',
    title: 'XIII. Progression Note (含 Pre-op / Post-op SOAP)',
    subtitle: 'POD #? 標註、傷口與引流管 I/O、併發症更新、照會當日與回覆紀錄',
    rules: [
      'S：若有手術，必須標註 POD #?（例如 POD 1）；記錄主觀症狀 s/s（fever, wound pain, flatus passage）。',
      'O：手術病人必須載明 fever 與 wound condition；有引流管、導管或 I/O 必須詳細記載。',
      'A：病情變化時嚴禁直接 Copy & paste；出現併發症（如 intra-abdominal abscess, wound infection）必須即時更新診斷。',
      'P：寫明一般性處置；照會他科「當日」必須記載有照會，收到「照會回復」時必須寫明對方意見與本科對應處置。'
    ],
    pitfalls: [
      '漏寫 POD #?、術後漏寫 fever/wound/drain/I&O、併發症發生卻沒更新 Assessment、照會無回覆紀錄或無對應處置。'
    ],
    template: `Progression Note (POD #___ / Hospital Day #___)

S:
POD ___
- No fever / Mild wound pain / Flatus passage: yes (or no)

O:
- Vital signs: T ___°C (Afebrile / Febrile), BP ___/___ mmHg, P ___/min, R ___/min
- Wound condition: clean, no erythema, no swelling, no discharge
- Drain / Catheter & I/O: [管路名稱] ___ mL/day ([性狀]); I/O: ___ / ___ mL
- Lab / Image update: ___

A:
1. [現行主要診斷 / 術後狀態，如有併發症如 wound infection / abscess 須即時更新]

P:
1. 一般性處置：
   - [飲食進度 / 止痛 / 抗生素 / 傷口換藥或拔管計畫]
2. 照會 (Consultation)：
   - (當日照會) Consulted [科別] for [照會原因] today.
   - (照會回復) [科別] replied: [他科意見] -> Our management: [本科對應處置].`
  }
];
