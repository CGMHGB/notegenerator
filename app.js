/**
 * 林口長庚入院病歷書寫生成神器 (CGMH Admission Note Generator)
 * 極速串流直出架構（Chatbox 同級首字秒噴）：
 * - 直接以純文字串流輸出完整綜合總模板（不使用耗時之 JSON schema 約束解碼）
 * - 三代 Pedigree Tree 與 11 大系統 ROS 以精簡標籤 [PEDIGREE_TREE] / [ROS_POSITIVES: ...] 佔位，前端 0ms 即時展開
 * - 理學檢查 (PE) 略過不生成（醫院 HIS 系統可直接點選）
 */

const state = {
  mode: 'adult_admission', // 'adult_admission' | 'peds_admission' | 'progression_soap'
  customSystemPrompt: null
};

// ============================================================================
// 1. 內建林口長庚「純文字直出總模板」System Prompt
// ============================================================================
function buildDefaultSystemPrompt(mode = state.mode) {
  if (mode === 'progression_soap') {
    return `你是林口長庚紀念醫院 (CGMH) 主治醫師。請直接輸出純文字 Progression Note（嚴禁 Markdown *、**、#，星號 *** 僅用於異常 Lab 後方；略過全身 PE；不要開場白）：

Progression Note (POD #___ / Hospital Day #___)
日期：YYYY/MM/DD

S:
POD #? (有手術必標註)
- (主觀症狀 s/s)

O:
- Fever & Vital signs:
- Wound condition:
- Drain / Catheter & I/O:
- Lab / Image: (檢驗值附單位；僅異常值後方加 *** 並簡短解釋)

A:
1. (依最新病況更新診斷，1., 2., 3. 條列，禁 # @ 及 xxxx with xxxx)

P:
1. 一般性處置：(明確英文術式名稱與適應症 / 藥物 / 管路)
2. 照會：(當日照會紀錄；有回覆記載對方意見與本科處置)`;
  }

  const isPeds = mode === 'peds_admission';
  const ageLine = isPeds
    ? `A [X]-year-[Y]-month-old boy/girl. [有提供身高體重則寫 BH: ___ cm = __th percentile, BW: ___ kg = __th percentile, BMI: ___ kg/m2 = __th percentile]`
    : `This [年齡]-year-old [male/female].`;
  const pedsLines = isPeds
    ? `1. Birth history: [G_P_, GA, NSD/C/S, BBW；未提寫 G_P_, full term]
2. Newborn screening: [no abnormal finding]
3. Growth and development: [reach normal milestone；有異常或細項則詳述]
4. Vaccination: [up to date；有提供則詳列]
`
    : '';
  const habitDefault = isPeds ? 'not applicable (8歲以下)' : 'Denied';

  return `你是林口長庚紀念醫院 (CGMH) 主治醫師，綜合《Dr.李明勳/Dr.方基存範本》與《病歷寫作注意事項》，請直接依照下方純文字總模板填答並立刻串流輸出（嚴禁 Markdown *、**、#，星號 *** 僅能用於異常 Lab 後方；略過理學檢查 PE；不要任何開場白或結語）。
為達最快速度，三代家族樹與 11 大系統 ROS 請分別只寫 [PEDIGREE_TREE] 與 [ROS_POSITIVES: ...]（系統會於 0ms 自動展開）：

Admission Note
入院日期：[YYYY/MM/DD，未提寫今日]

一般資料：(General Data)
${ageLine}
學歷：[未詳]  職業：[無]  婚姻：[未詳]  宗教：無  種族：台灣
精神心理：睡眠品質可  社會經濟：經濟無虞
旅遊史(本人)：[無]  旅遊史(曾接觸之家屬)：[無]  旅遊史(曾接觸之親友)：[無]
症狀：[無]  職業別：無  群聚：[無]  接觸史：[無]
主要照顧者：家屬
資料來源：[According to patient himself/herself or family]

主訴：(Chief Complaint)
[Symptom or sign + duration，最多兩症狀，禁寫日期時間點與 scheduled surgery]

現在病症：(Present Illness)
[第 1 段：相關過去史/住院史 + CC 依時序之 LQQOPERA（Location/Quality/Quantity/Onset/Precipitating/Exaggerating/Relieving/Accompanying）]

[第 2 段：鑑別診斷 negative findings + 急診/外院檢查治療反應 + 住院原因]

[第 3 段：Concurrent diseases / Co-morbidity + Throughout the whole course... 總結]

過去病史：(Past History)
1. Allergy: [no known drug or food allergy]
2. Admission history: [denied previous admission history 或 YYYY/MM/DD-YYYY/MM/DD 診斷]
3. Operation history: [denied previous surgical history 或 診斷 status post 術式 in YYYY/MM in 醫院]
4. Chronic illness:
   - DM: [denied 或用藥/追蹤院所/控制數值]
   - Hypertension: [denied 或用藥/追蹤院所/控制數值]
   - [Denied history of pulmonary TB, COPD, or liver diseases]
5. Medication history: [denied medication use]

個人病史：(Personal History)
Allergy: [no known drug or food allergy]
Smoking: [${habitDefault}]
Alcohol: [${habitDefault}]
Betalnut: [${habitDefault}]
旅遊史: [Denied travel to epidemic areas]
動物接觸史: [Denied]
${pedsLines}本院現狀用藥：[藥名/劑量/用法/數量 或 As order list]
非本院用藥：[經與病人/家屬確認，無院外用藥、中藥或保健食品]

家族史：(Family History)
1. [血親有無糖尿病、高血壓、高血脂、心血管、癌症史，禁寫 Nil/Non-contributory]
2. Similar disease in family: [denied 或確認 hernia/Hirschsprung disease]
3. 住所環境：[與家人同住，居住環境無異常暴露]
[PEDIGREE_TREE]

[ROS_POSITIVES: 列出 CC/PI 與貼文所有陽性症狀英文關鍵字，如 fever, weakness, nausea, vomiting, abdominal distress/pain, cough, dyspnea, dizziness, dysuria；全無則寫 none]

實驗室檢查：(Laboratory Findings)
[檢驗值附單位；僅異常值後方加 *** 並附簡短解釋；未提寫 Pending]

重要影像/檢查報告：(Expert Findings)
[刪除開單科別/醫師/床號/收件號/主治與放射師簽名，僅留檢查日期時間與報告內容/IMP；無則寫 無]

--------------------------------------------------------------------------------------------------------------------------------------------
臨床臆斷：(Impression)
[Active 在前、Etiological > Anatomical；1., 2., 3. 條列，禁 # @ 及 xxxx with xxxx；不同診斷碼分開；腫瘤附分期]

--------------------------------------------------------------------------------------------------------------------------------------------
處理計畫：(Plan)
Diagnostic:
- [項目] for [適應症]
Therapeutic:
- [外科寫明確英文手術名稱，禁只寫 surgery/operation] for [適應症]
Patient Education:
- [衛教]
Measurable goals:
- [具體可追蹤目標]`;
}

// ============================================================================
// 2. 固定模板本地 0ms 自動補齊引擎 + 純文字淨化器
// ============================================================================
function sanitizeClinicalOutput(text) {
  if (!text) return '';
  return String(text)
    .split('\n')
    .map((line) => {
      // 保留檢驗報告異常標記 ***，僅清理其餘區段的 Markdown #、**、*
      return line
        .split('***')
        .map((seg, idx) => {
          let s = seg;
          if (idx === 0) {
            s = s.replace(/^\s*#{1,6}\s+/, '');
            s = s.replace(/^\s*\*{1,2}\s+(?!\*)/, '');
          }
          s = s.replace(/\*\*([^*\n]+?)\*\*/g, '$1');
          if (idx === 0) {
            s = s.replace(/^\s*\*{1,2}(?!\*)\s*/, '');
          }
          return s.replace(/\*\*\s*$/, '');
        })
        .join('***');
    })
    .join('\n');
}

function cleanExpertReportHeader(rawText) {
  if (!rawText || !rawText.trim()) return '';
  const lines = rawText.split(/\r?\n/);
  const cleaned = [];
  let dateLine = '';
  let timeLine = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (cleaned.length > 0 && cleaned[cleaned.length - 1] !== '') {
        cleaned.push('');
      }
      continue;
    }

    const dateMatch = trimmed.match(/檢查日期\s*[：:]\s*([0-9/\-.]+)/);
    if (dateMatch) {
      dateLine = `檢查日期：${dateMatch[1]}`;
      continue;
    }
    const timeMatch = trimmed.match(/檢查時間\s*[：:]\s*([0-9:]+)/);
    if (timeMatch) {
      timeLine = `檢查時間：${timeMatch[1]}`;
      continue;
    }

    if (
      /^[-=]{5,}$/.test(trimmed) ||
      /^<檢查目的及病程摘要>/.test(trimmed) ||
      /^<A>/i.test(trimmed) ||
      /^<P>/i.test(trimmed) ||
      /^<報告內容>/.test(trimmed) ||
      /開單科別\s*[：:]/.test(trimmed) ||
      /開單醫師\s*[：:]/.test(trimmed) ||
      /醫囑日期\s*[：:]/.test(trimmed) ||
      /收件號\s*[：:]/.test(trimmed) ||
      /主治醫師\s*[：:]/.test(trimmed) ||
      /放射師\s*[：:]/.test(trimmed) ||
      /放診專字/.test(trimmed) ||
      /^X\d{2}-\d{3}\s*名稱/.test(trimmed) ||
      /^\*[A-Z]\d{2,3}\s+/.test(trimmed)
    ) {
      continue;
    }

    cleaned.push(line);
  }

  const headerParts = [];
  if (dateLine) headerParts.push(dateLine);
  if (timeLine) headerParts.push(timeLine);

  const body = cleaned.join('\n').trim();
  return headerParts.length > 0 ? `${headerParts.join('  ')}\n${body}` : body;
}

/**
 * 根據 AI 回傳的 ros_positives (或文字關鍵字) 在 0ms 內自動補齊長庚 11 大系統 ROS
 */
function buildStaticROS(positivesInput) {
  let posText = '';
  if (Array.isArray(positivesInput)) {
    posText = positivesInput.join(' ').toLowerCase();
  } else if (positivesInput && typeof positivesInput === 'object') {
    posText = Object.entries(positivesInput)
      .filter(([, v]) => /yes|\+/i.test(String(v)))
      .map(([k]) => k)
      .join(' ')
      .toLowerCase();
  } else {
    posText = String(positivesInput || '').toLowerCase();
  }

  const check = (aliases, fallback = '(no)') => {
    const matched = aliases.some((a) => posText.includes(a));
    return matched ? '(YES)' : fallback;
  };

  return `系統整理：(Review of System)
1. General: weakness:${check(['weakness', '無力', '虛弱'])}, fatigue:${check(['fatigue', '疲倦'])}, anorexia:${check(['anorexia', '食慾'])}, fever:${check(['fever', '發燒', '微燒', '高燒'])}, insomnia:${check(['insomnia', '失眠'])}
2. Integument: changes in color:${check(['jaundice', 'color', '黃疸'])}, pruritus:${check(['pruritus', 'itching', '癢'])}, rash:${check(['rash', '紅疹'])}, hair loss:${check(['hair loss', '掉髮'])}
3. HEENT:
   a. Head - headache:${check(['headache', '頭痛'])}, dizziness:${check(['dizziness', '頭暈'])}, vertigo:${check(['vertigo', '眩暈'])}
   b. Eyes - visual acuity:(normal), color vision:(normal), corrective lenses:(no), photophobia:${check(['photophobia'])}, diplopia:${check(['diplopia'])}, pain:${check(['eye pain'])}
   c. Ears - pain:${check(['ear pain', 'otalgia'])}, discharge:${check(['otorrhea'])}, hearing loss:${check(['hearing loss'])}, tinnitus:${check(['tinnitus', '耳鳴'])}
   d. Nose - epistaxis:${check(['epistaxis'])}, discharge:${check(['rhinorrhea', 'nasal discharge', '流鼻水'])}, stuffiness:${check(['stuffiness', 'nasal congestion', '鼻塞'])}, sense of smell:(normal)
   e. Throat - status of teeth:(normal), gums:(normal), dentures:(no), taste:(normal), soreness:${check(['sore throat', 'soreness', '喉嚨痛'])}, hoarseness:${check(['hoarseness', '沙啞'])}, lump:${check(['neck lump'])}
4. Respiratory System: cough:${check(['cough', '咳嗽'])}, sputum:${check(['sputum', '痰'])}, hemoptysis:${check(['hemoptysis', '咳血'])}, wheezing:${check(['wheezing', '喘鳴'])}, dyspnea:${check(['dyspnea', 'shortness of breath', '喘'])}
5. Cardiovascular System: edema:${check(['edema', '水腫'])}, chest distress:${check(['chest distress', '胸悶'])}, chest pain:${check(['chest pain', '胸痛'])}, palpitation:${check(['palpitation', '心悸'])}, intermittent claudication:(no), cold limbs:(no), cyanosis:${check(['cyanosis'])}
6. Gastrointestinal System: dysphagia:${check(['dysphagia', '吞嚥困難'])}, nausea:${check(['nausea', '噁心'])}, vomiting:${check(['vomiting', '嘔吐'])}, abdominal distress/pain:${check(['abdominal', 'epigastric', 'ruq', 'rlq', 'luq', 'llq', 'belly', '腹痛', '上腹', '右上腹', '右下腹'])}, change in bowel habit:${check(['diarrhea', 'constipation', 'bowel habit', '腹瀉', '便秘'])}, hematemesis:${check(['hematemesis', '吐血'])}, melena:${check(['melena', '黑便'])}, bloody stool:${check(['bloody stool', 'hematochezia', '血便'])}
7. Genito-Urinary System: urinary frequency:${check(['frequency', '頻尿'])}, hesitancy:(no), urgency:${check(['urgency'])}, dribbling:(no), incontinence:(no), dysuria:${check(['dysuria', '解尿痛'])}, hematuria:${check(['hematuria', '血尿'])}, nocturia:${check(['nocturia'])}, polyuria:${check(['polyuria'])}, impotence:(no)
8. Metabolic and endocrine: growth:(fair), development:(normal), weight change:${check(['weight loss', 'weight change', '體重'])}, heat/cold intolerance:(no), nervousness:(no), sweating:${check(['sweating', '盜汗', 'chills'])}, polydipsia:${check(['polydipsia'])}
9. Hematologic: anemia:${check(['anemia', '貧血'])}, easy bruisability or bleeding:${check(['bleeding', 'bruis', 'ecchymosis', 'petechiae'])}, lymphadenopathy:${check(['lymphadenopathy'])}, transfusions:(no)
10. Neuropsychiatry: dizziness:${check(['dizziness', '頭暈'])}, syncope:${check(['syncope', '昏厥'])}, seizure:${check(['seizure', '抽搐'])}, speech disturbance:${check(['dysarthria', 'aphasia', 'speech'])}, loss of sensation:${check(['numbness', 'sensation'])}, paresthesia:${check(['paresthesia', '麻'])}, ataxia:${check(['ataxia'])}, weakness or paralysis:${check(['weakness', 'paralysis', '無力'])}, tremor:${check(['tremor'])}, anxiety:${check(['anxiety'])}, depression:${check(['depression'])}, irritability:${check(['irritability'])}
11. Musculoskeletal: joint pain:${check(['joint pain', 'arthralgia', '關節痛'])}, stiffness:${check(['stiffness'])}, limitation of motion:${check(['limitation of motion'])}, muscular weakness:${check(['muscular weakness'])}, muscle wasting:(no)`;
}

/**
 * 完全依照整合兩份長庚檔案之「綜合總模板」填答組裝病歷（不含 PE）
 */
function assembleAdmissionNoteFromAI(d) {
  const cleanStr = (v) => sanitizeClinicalOutput(String(v || '')).trim();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  const admDate = cleanStr(d.admission_date) || today;
  const isPeds = state.mode === 'peds_admission';

  const pedigreeTree = typeof CGMH_PEDIGREE_TREE === 'string'
    ? CGMH_PEDIGREE_TREE
    : `Three-generation Pedigree Tree (已標示同住家人):
   [Paternal Grandfather] ──┬── [Paternal Grandmother]    [Maternal Grandfather] ──┬── [Maternal Grandmother]
                            │                                                      │
                        [Father] ───────────────────────┬────────────────────── [Mother]
                                                        │
                                                     ↗ [pt] (Lives with family)`;

  const generalSummary = cleanStr(d.general_summary)
    || (isPeds ? 'A __-year-__-month-old boy/girl.' : 'This __-year-old male/female.');

  const pastAllergy = cleanStr(d.past_allergy) || 'no known drug or food allergy';
  const pastAdmission = cleanStr(d.past_admission) || 'denied previous admission history';
  const pastOperation = cleanStr(d.past_operation) || 'denied previous surgical history';
  const pastDm = cleanStr(d.past_dm) || 'denied';
  const pastHtn = cleanStr(d.past_htn) || 'denied';
  const pastOther = cleanStr(d.past_other_chronic) || 'Denied history of pulmonary TB, COPD, or liver diseases';
  const pastMed = cleanStr(d.past_medication) || 'denied medication use';

  const naOrDenied = isPeds ? 'not applicable' : 'Denied';
  const smoking = cleanStr(d.smoking) || naOrDenied;
  const alcohol = cleanStr(d.alcohol) || naOrDenied;
  const betalnut = cleanStr(d.betalnut) || naOrDenied;

  const expert = cleanStr(cleanExpertReportHeader(d.expert_findings || ''));

  const sections = [
    `Admission Note`,
    `入院日期：${admDate}`,
    ``,
    `一般資料：(General Data)`,
    generalSummary,
    `學歷：${cleanStr(d.education) || '未詳'}  職業：${cleanStr(d.occupation) || '無'}  婚姻：${cleanStr(d.marital) || '未詳'}  宗教：無  種族：台灣`,
    `精神心理：睡眠品質可  社會經濟：經濟無虞`,
    `旅遊史(本人)：${cleanStr(d.tocc_travel_self) || '無'}  旅遊史(曾接觸之家屬)：${cleanStr(d.tocc_travel_family) || '無'}  旅遊史(曾接觸之親友)：${cleanStr(d.tocc_travel_friends) || '無'}`,
    `症狀：${cleanStr(d.tocc_symptom) || '無'}  職業別：無  群聚：${cleanStr(d.tocc_cluster) || '無'}  接觸史：${cleanStr(d.tocc_contact) || '無'}`,
    `主要照顧者：家屬`,
    `資料來源：${cleanStr(d.source) || 'According to patient himself/herself or family'}`,
    ``,
    `主訴：(Chief Complaint)`,
    cleanStr(d.chief_complaint) || '[Symptom or sign] for [Duration]',
    ``,
    `現在病症：(Present Illness)`,
    cleanStr(d.present_illness) || '',
    ``,
    `過去病史：(Past History)`,
    `1. Allergy: ${pastAllergy}`,
    `2. Admission history: ${pastAdmission}`,
    `3. Operation history: ${pastOperation}`,
    `4. Chronic illness:`,
    `   - DM: ${pastDm}`,
    `   - Hypertension: ${pastHtn}`,
    `   - ${pastOther}`,
    `5. Medication history: ${pastMed}`,
    ``,
    `個人病史：(Personal History)`,
    `Allergy: ${pastAllergy}`,
    `Smoking: ${smoking}`,
    `Alcohol: ${alcohol}`,
    `Betalnut: ${betalnut}`,
    `旅遊史: ${cleanStr(d.travel_history) || 'Denied travel to epidemic areas'}`,
    `動物接觸史: ${cleanStr(d.animal_contact) || 'Denied'}`,
    isPeds ? `1. Birth history: ${cleanStr(d.peds_birth) || 'G_P_, full term, perinatal course smooth'}` : null,
    isPeds ? `2. Newborn screening: ${cleanStr(d.peds_newborn_screening) || 'no abnormal finding'}` : null,
    isPeds ? `3. Growth and development: ${cleanStr(d.peds_development) || 'reach normal milestone'}` : null,
    isPeds ? `4. Vaccination: ${cleanStr(d.peds_vaccination) || 'up to date'}` : null,
    `本院現狀用藥：${cleanStr(d.meds_cgmh) || 'As order list'}`,
    `非本院用藥：${cleanStr(d.meds_outside) || '經與病人/家屬確認，無院外用藥、中藥或保健食品'}`,
    ``,
    `家族史：(Family History)`,
    `1. ${cleanStr(d.fh_chronic) || '血親無糖尿病、高血壓、高血脂、心血管、癌症疾病史'}`,
    `2. Similar disease in family: ${cleanStr(d.fh_similar) || 'denied (確認無 hernia、Hirschsprung disease 等遺傳傾向疾病)'}`,
    `3. 住所環境：${cleanStr(d.fh_environment) || '與家人同住，居住環境無異常暴露'}`,
    pedigreeTree,
    ``,
    buildStaticROS(d.ros_positives),
    ``,
    `實驗室檢查：(Laboratory Findings)`,
    cleanStr(d.lab_findings) || 'Pending',
    ``,
    `重要影像/檢查報告：(Expert Findings)`,
    expert || '無',
    ``,
    `--------------------------------------------------------------------------------------------------------------------------------------------`,
    `臨床臆斷：(Impression)`,
    cleanStr(d.impression) || '',
    ``,
    `--------------------------------------------------------------------------------------------------------------------------------------------`,
    `處理計畫：(Plan)`,
    cleanStr(d.plan) || ''
  ];

  return sections.filter((s) => s !== null && s !== undefined).join('\n');
}

/**
 * 即時展開 [PEDIGREE_TREE] 與 [ROS_POSITIVES: ...] 為完整長庚格式（0ms）
 */
function expandTemplatePlaceholders(text) {
  if (!text) return '';
  const pedigreeTree = typeof CGMH_PEDIGREE_TREE === 'string'
    ? CGMH_PEDIGREE_TREE
    : `Three-generation Pedigree Tree (已標示同住家人):
   [Paternal Grandfather] ──┬── [Paternal Grandmother]    [Maternal Grandfather] ──┬── [Maternal Grandmother]
                            │                                                      │
                        [Father] ───────────────────────┬────────────────────── [Mother]
                                                        │
                                                     ↗ [pt] (Lives with family)`;

  let out = String(text).replace(/\[PEDIGREE_TREE\]/gi, pedigreeTree);
  out = out.replace(/\[ROS_POSITIVES\s*:?\s*([^\]\n]*)\]/gi, (_, rawKeywords) => {
    const kw = /none|無/i.test(rawKeywords.trim()) ? '' : rawKeywords;
    return buildStaticROS(kw);
  });
  return out;
}

// ============================================================================
// 3. 免 API 本地快速套版引擎 (與生成採用完全一致之綜合總模板，略過 PE)
// ============================================================================
function generateOfflineCGMHNote() {
  const rawInput = document.getElementById('rawClinicalInput').value.trim();
  const raw = sanitizeClinicalOutput(cleanExpertReportHeader(rawInput));
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/');

  if (state.mode === 'progression_soap') {
    return `Progression Note (POD #___ / Hospital Day #___)
日期：${today}

S:
POD #?
- ${raw || 'No fever, mild wound pain, flatus passage: yes'}

O:
- Fever & Vital signs: T ___°C, BP ___/___ mmHg, P ___/min, R ___/min
- Wound condition: clean, no erythema, no swelling, no discharge
- Drain / Catheter & I/O: ___ mL/day; I/O: ___ / ___ mL
- Lab / Image: (異常數值標註 *** 並附簡短解釋)

A:
1. Primary post-operative / active clinical diagnosis (依最新病況更新，禁 # @ 及 with)

P:
1. 一般性處置：
   - Continue specific treatment / named surgical procedure with clear clinical indication.
2. 照會 (Consultation)：
   - 照會他科當日記載有照會；若有回復記載對方意見與本科對應處置。`;
  }

  return assembleAdmissionNoteFromAI({
    admission_date: today,
    general_summary: state.mode === 'peds_admission'
      ? 'A __-year-__-month-old boy/girl.\nBH: ___ cm = __th percentile, BW: ___ kg = __th percentile, BMI: ___ kg/m2 = __th percentile'
      : 'This __-year-old male/female.',
    chief_complaint: '[Symptom or sign] for [Duration]',
    present_illness: raw || '[第 1 段：相關過去史 + CC 依時序 LQQOPERA 描述]\n\n[第 2 段：鑑別診斷 negative findings + 檢查治療反應 + 住院原因]\n\n[第 3 段：Concurrent diseases / Co-morbidity + 病程總結]',
    ros_positives: rawInput,
    lab_findings: 'Pending (異常數值請標示 *** 並附簡短解釋)',
    expert_findings: '',
    impression: '1. [主要 Active 診斷 — Etiological > Anatomical]',
    plan: `Diagnostic:\n- [檢驗或影像項目] for [適應症]\nTherapeutic:\n- [明確英文手術名稱 / 藥物治療] for [適應症]\nPatient Education:\n- Explained diagnosis, planned treatment, and warning signs.\nMeasurable goals:\n- Resolution of acute symptoms and stable vital signs.`
  });
}

// ============================================================================
// 4. 串接 AI API (Chatbox 同級純文字直接串流 + 關閉思考延遲)
// ============================================================================
async function generateWithAI() {
  const provider = document.getElementById('apiProvider').value;
  const modelSelect = document.getElementById('apiModel').value;
  const customModel = document.getElementById('customModelInput').value.trim();
  const model = modelSelect === 'custom' ? customModel : modelSelect;
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    showToast('⚠️ 請先在上方輸入 API Key，或點擊「套版」使用本地格式！');
    document.getElementById('apiKey').focus();
    return;
  }

  const raw = document.getElementById('rawClinicalInput').value.trim();
  if (!raw) {
    showToast('⚠️ 請先貼上病人的臨床資訊！');
    document.getElementById('rawClinicalInput').focus();
    return;
  }

  const preprocessedInput = cleanExpertReportHeader(raw);
  const systemPrompt = state.customSystemPrompt || buildDefaultSystemPrompt(state.mode);
  const userPrompt = `請依長庚總模板整理以下臨床資訊並直接輸出：\n\n${preprocessedInput}`;

  const outputEl = document.getElementById('generatedOutput');
  const genBtn = document.getElementById('generateNoteBtn');
  setStatus('running', '連線中...');
  genBtn.disabled = true;
  outputEl.value = '';

  const startTime = performance.now();
  let firstTokenSec = null;
  let rafPending = false;
  let latestText = '';

  const formatStreamText = (text) => sanitizeClinicalOutput(expandTemplatePlaceholders(text));

  const flushPreview = () => {
    rafPending = false;
    outputEl.value = formatStreamText(latestText);
    outputEl.scrollTop = outputEl.scrollHeight;
  };

  const onReasoningChunk = (rText) => {
    if (firstTokenSec === null) {
      setStatus('running', `深度思考中 (${rText.length} 字)...`);
    }
  };

  const onStreamChunk = (chunkText) => {
    latestText = chunkText;
    if (firstTokenSec === null) {
      firstTokenSec = ((performance.now() - startTime) / 1000).toFixed(1);
      setStatus('running', `串流中 (首字 ${firstTokenSec}s)`);
    }
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(flushPreview);
    }
  };

  try {
    if (provider === 'gemini') {
      await callGeminiStream(apiKey, model || 'gemini-3.8-flash', systemPrompt, userPrompt, onStreamChunk);
    } else if (provider === 'deepseek') {
      await callOpenAIStream('https://api.deepseek.com/chat/completions', 'DeepSeek', apiKey, model || 'deepseek-flash', systemPrompt, userPrompt, onStreamChunk, onReasoningChunk);
    } else {
      await callOpenAIStream('https://api.openai.com/v1/chat/completions', 'OpenAI', apiKey, model || 'gpt-6.1-sol', systemPrompt, userPrompt, onStreamChunk, onReasoningChunk);
    }

    outputEl.value = formatStreamText(latestText);
    const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
    const ttftInfo = firstTokenSec ? `・首字 ${firstTokenSec}s` : '';
    setStatus('done', `完成 ${elapsedSec}s${ttftInfo}`);
    runComplianceAudit(outputEl.value);
    showToast(`⚡ 生成完成！（總計 ${elapsedSec}s${ttftInfo}）`);
  } catch (err) {
    console.error(err);
    setStatus('error', 'API 錯誤');
    outputEl.value = `[API 呼叫失敗]\n錯誤訊息：${err.message}\n\n💡 提示：請檢查 API Key 與模型名稱（可點 🔄 取得最新清單），或點「套版」快速生成。`;
    showToast(`❌ 生成失敗：${err.message}`);
  } finally {
    genBtn.disabled = false;
  }
}

function buildGeminiGenerationConfig(model) {
  const config = { temperature: 0.2 };
  // 依據 Gemini 世代設定最低且相容的思考延遲
  if (/^gemini-2\.5-flash/i.test(model)) {
    config.thinkingConfig = { thinkingBudget: 0 };
  } else if (/^gemini-2\.5-pro/i.test(model)) {
    config.thinkingConfig = { thinkingBudget: 128 };
  } else if (/^gemini-(3|4)/i.test(model)) {
    config.thinkingConfig = { thinkingLevel: 'LOW' };
  }
  return config;
}

async function callGeminiStream(apiKey, model, systemPrompt, userPrompt, onUpdate) {
  const postGeminiStream = async (targetModel, genConfig) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: genConfig
      })
    });
  };

  const requestWith400Fallback = async (targetModel) => {
    const initialConfig = buildGeminiGenerationConfig(targetModel);
    let res = await postGeminiStream(targetModel, initialConfig);
    if (!res.ok && res.status === 400 && initialConfig.thinkingConfig) {
      const errText = await res.text();
      if (/thinking/i.test(errText)) {
        res = await postGeminiStream(targetModel, { temperature: initialConfig.temperature });
      } else {
        throw new Error(`Gemini API (400): ${errText.slice(0, 220)}`);
      }
    }
    return res;
  };

  let response = await requestWith400Fallback(model);
  if (response.status === 503 || response.status === 429) {
    setStatus('running', 'Gemini 尖峰重試中...');
    await new Promise((r) => setTimeout(r, 800));
    response = await requestWith400Fallback(model);

    if ((response.status === 503 || response.status === 429) && !/^gemini-2\.5-flash$/i.test(model)) {
      setStatus('running', '尖峰改用 gemini-2.5-flash...');
      response = await requestWith400Fallback('gemini-2.5-flash');
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API (${response.status}): ${errText.slice(0, 220)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const data = JSON.parse(jsonStr);
          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const p of parts) {
            if (p.text && !p.thought) {
              fullText += p.text;
              onUpdate(fullText);
            }
          }
        } catch (_) {}
      }
    }
  }
}

function buildOpenAIStreamPayload(providerLabel, model, systemPrompt, userPrompt) {
  const bodyPayload = {
    model: model,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  };

  if (/deepseek/i.test(providerLabel)) {
    if (/reasoner/i.test(model)) {
      bodyPayload.reasoning_effort = 'low';
    } else {
      // DeepSeek (deepseek-flash / deepseek-v4-pro 等) API 預設開啟 high 等級深度思考，需顯式關閉才能 1-3 秒內首字噴出
      bodyPayload.thinking = { type: 'disabled' };
      bodyPayload.temperature = 0.2;
    }
    return bodyPayload;
  }

  if (/^gpt-6-(luna|sol)\b/i.test(model)) {
    bodyPayload.reasoning_effort = 'none';
    bodyPayload.temperature = 0.2;
  } else if (/^gpt-6\.1|^gpt-6-astra|^o[1-9]/i.test(model)) {
    bodyPayload.reasoning_effort = 'low';
  } else if (!/reasoner/i.test(model)) {
    bodyPayload.temperature = 0.2;
  }
  return bodyPayload;
}

async function callOpenAIStream(endpointUrl, providerLabel, apiKey, model, systemPrompt, userPrompt, onUpdate, onReasoning) {
  const bodyPayload = buildOpenAIStreamPayload(providerLabel, model, systemPrompt, userPrompt);

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${providerLabel} API (${response.status}): ${errText.slice(0, 220)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let reasoningText = '';
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const data = JSON.parse(jsonStr);
          const deltaObj = data.choices?.[0]?.delta;
          const reasoningDelta = deltaObj?.reasoning_content;
          if (reasoningDelta && typeof onReasoning === 'function') {
            reasoningText += reasoningDelta;
            onReasoning(reasoningText);
          }
          const delta = deltaObj?.content;
          if (delta) {
            fullText += delta;
            onUpdate(fullText);
          }
        } catch (_) {}
      }
    }
  }
}

// ============================================================================
// 5. 長庚病歷合規防呆檢查器 (Compliance Auditor)
// ============================================================================
function runComplianceAudit(text) {
  if (!text || !text.trim()) return;

  const setBadge = (key, status, labelOverride) => {
    const badge = document.querySelector(`.c-badge[data-check="${key}"]`);
    if (!badge) return;
    badge.className = `c-badge ${status}`;
    if (labelOverride) badge.textContent = labelOverride;
  };

  const hasCCDuration = /for\s+\d+\s+(day|days|hour|hours|week|weeks|month|months)|scheduled\s+surgery|POD\s*#/i.test(text);
  setBadge('cc', hasCCDuration ? 'pass' : 'warn', hasCCDuration ? '✓ CC 時間' : '! CC 時間');

  const hasPI = /Present Illness|Throughout the whole course|POD\s*#/i.test(text);
  setBadge('pi', hasPI ? 'pass' : 'warn', hasPI ? '✓ PI 三段式' : '! PI 結構');

  const hasForbiddenFH = /Family History[\s\S]{0,120}\b(Non-contributory|Nil|Nothing particular)\b/i.test(text);
  const hasFHSection = /Family History|家族史|Pedigree|pt/i.test(text);
  setBadge('fh', !hasForbiddenFH && hasFHSection ? 'pass' : 'warn', !hasForbiddenFH ? '✓ FH 家族樹' : '✗ FH 含 Nil!');

  const hasRosSync = /\(YES\)|\(YES\*\)|Review of System/i.test(text);
  setBadge('ros', hasRosSync ? 'pass' : 'warn', hasRosSync ? '✓ ROS 同步' : '! ROS 同步');

  const hasNumberedImp = /Impression[\s\S]*?\n\s*1\./i.test(text) || /Assessment[\s\S]*?\n\s*1\./i.test(text);
  setBadge('imp', hasNumberedImp ? 'pass' : 'warn', hasNumberedImp ? '✓ Imp 1,2,3' : '! Imp 1,2,3');

  const hasPlan = /Diagnostic|Therapeutic|Measurable/i.test(text);
  setBadge('plan', hasPlan ? 'pass' : 'warn', hasPlan ? '✓ Plan 術式/適應症' : '! Plan');
}

// ============================================================================
// 6. UI 事件綁定與初始化 (極速模型優先排序 + 即時 API 同步)
// ============================================================================
const MODEL_CATALOG = {
  gemini: [
    { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (極速主力・推薦)' },
    { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (超輕量秒回)' },
    { id: 'gemini-4-argon', label: 'gemini-4-argon (Gemini 4 高效)' },
    { id: 'gemini-4-carbon', label: 'gemini-4-carbon (Gemini 4 旗艦)' },
    { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (穩定快速)' }
  ],
  deepseek: [
    { id: 'deepseek-flash', label: 'deepseek-flash (V4.1-Flash・極速)' },
    { id: 'deepseek-v4-pro', label: 'deepseek-v4-pro (V4 旗艦)' }
  ],
  openai: [
    { id: 'gpt-6.1-sol', label: 'gpt-6.1-sol (平衡主力・推薦)' },
    { id: 'gpt-6-luna', label: 'gpt-6-luna (極速輕量)' },
    { id: 'gpt-6.1-terra', label: 'gpt-6.1-terra (高效寫作)' },
    { id: 'gpt-6-astra', label: 'gpt-6-astra (GPT-6 旗艦)' }
  ]
};

function renderModelOptions(provider, customModels = null) {
  const modelSelect = document.getElementById('apiModel');
  const list = customModels && customModels.length > 0 ? customModels : MODEL_CATALOG[provider];
  modelSelect.innerHTML = list
    .map((m, idx) => `<option value="${m.id}" ${idx === 0 ? 'selected' : ''}>${m.label}</option>`)
    .join('') + `<option value="custom">自訂模型名稱...</option>`;
  document.getElementById('customModelInput').classList.add('hidden');
}

async function fetchLiveModels() {
  const provider = document.getElementById('apiProvider').value;
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) {
    showToast('⚠️ 請先輸入 API Key，才能從官方伺服器取得最新可用模型清單！');
    document.getElementById('apiKey').focus();
    return;
  }

  const btn = document.getElementById('fetchModelsBtn');
  btn.disabled = true;
  btn.textContent = '⏳';

  try {
    let fetched = [];
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      fetched = (data.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(id => !/embedding|imagen|veo|aqa|tts/i.test(id))
        .sort((a, b) => b.localeCompare(a))
        .map(id => ({ id, label: id }));
    } else {
      const endpoint = provider === 'deepseek' ? 'https://api.deepseek.com/models' : 'https://api.openai.com/v1/models';
      const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      fetched = (data.data || [])
        .map(m => m.id)
        .filter(id => provider === 'deepseek' || /^(gpt-|o[1-9]|chatgpt)/i.test(id))
        .sort((a, b) => b.localeCompare(a))
        .map(id => ({ id, label: id }));
    }

    if (fetched.length === 0) {
      throw new Error('未取得可用對話模型');
    }
    renderModelOptions(provider, fetched);
    showToast(`✅ 已從 ${provider.toUpperCase()} 官方同步最新 ${fetched.length} 個可用模型！`);
  } catch (err) {
    showToast(`❌ 同步模型失敗：${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄';
  }
}

function setStatus(type, text) {
  const pill = document.getElementById('generationStatus');
  pill.className = `status-pill ${type}`;
  pill.textContent = text;
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

function updateModelDropdown() {
  const provider = document.getElementById('apiProvider').value;
  const apiKeyInput = document.getElementById('apiKey');

  renderModelOptions(provider);
  if (provider === 'gemini') {
    apiKeyInput.placeholder = '貼上 Google Gemini API Key...';
  } else if (provider === 'deepseek') {
    apiKeyInput.placeholder = '貼上 DeepSeek API Key (sk-...)...';
  } else {
    apiKeyInput.placeholder = '貼上 OpenAI API Key (sk-...)...';
  }

  const providerKey = localStorage.getItem(`cgmh_note_api_key_${provider}`) || localStorage.getItem('cgmh_note_api_key') || '';
  apiKeyInput.value = providerKey;
}

document.addEventListener('DOMContentLoaded', () => {
  const savedProvider = localStorage.getItem('cgmh_note_api_provider');
  if (savedProvider) {
    document.getElementById('apiProvider').value = savedProvider;
  }
  updateModelDropdown();

  document.getElementById('apiProvider').addEventListener('change', (e) => {
    localStorage.setItem('cgmh_note_api_provider', e.target.value);
    updateModelDropdown();
  });

  document.getElementById('apiModel').addEventListener('change', (e) => {
    const customInput = document.getElementById('customModelInput');
    customInput.classList.toggle('hidden', e.target.value !== 'custom');
  });

  document.getElementById('fetchModelsBtn').addEventListener('click', fetchLiveModels);

  document.getElementById('apiKey').addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const provider = document.getElementById('apiProvider').value;
    localStorage.setItem(`cgmh_note_api_key_${provider}`, val);
    localStorage.setItem('cgmh_note_api_key', val);
  });

  document.getElementById('toggleKeyVisibility').addEventListener('click', () => {
    const input = document.getElementById('apiKey');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // 模式切換
  document.querySelectorAll('#noteModeControl .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#noteModeControl .seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      showToast(`已切換為：${btn.textContent}`);
    });
  });

  // 清空按鈕
  document.getElementById('clearInputBtn').addEventListener('click', () => {
    document.getElementById('rawClinicalInput').value = '';
    document.getElementById('rawClinicalInput').focus();
    showToast('🗑️ 已清空輸入區');
  });

  // 生成 & 套版按鈕
  document.getElementById('generateNoteBtn').addEventListener('click', generateWithAI);
  document.getElementById('offlineFormatBtn').addEventListener('click', () => {
    const res = generateOfflineCGMHNote();
    document.getElementById('generatedOutput').value = res;
    runComplianceAudit(res);
    setStatus('done', '套版完成');
    showToast('⚡ 已完成長庚格式套版！');
  });

  // 複製與下載
  document.getElementById('copyNoteBtn').addEventListener('click', async () => {
    const text = document.getElementById('generatedOutput').value;
    if (!text) {
      showToast('目前尚無可複製的病歷內容');
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast('📋 已複製病歷至剪貼簿！');
  });

  document.getElementById('downloadTxtBtn').addEventListener('click', () => {
    const text = document.getElementById('generatedOutput').value;
    if (!text) {
      showToast('目前尚無可下載的病歷內容');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CGMH_Admission_Note_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // System Prompt Modal
  const modal = document.getElementById('promptModal');
  const promptEditor = document.getElementById('systemPromptEditor');

  document.getElementById('openPromptModalBtn').addEventListener('click', () => {
    promptEditor.value = state.customSystemPrompt || buildDefaultSystemPrompt(state.mode);
    modal.showModal();
  });

  document.getElementById('closePromptModalBtn').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  document.getElementById('resetPromptBtn').addEventListener('click', () => {
    state.customSystemPrompt = null;
    promptEditor.value = buildDefaultSystemPrompt(state.mode);
    showToast('🔄 已還原為林口長庚預設 System Prompt');
  });

  document.getElementById('copyPromptBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(promptEditor.value);
    showToast('📋 已複製 System Prompt！');
  });

  document.getElementById('savePromptModalBtn').addEventListener('click', () => {
    state.customSystemPrompt = promptEditor.value.trim();
    modal.close();
    showToast('✅ 已儲存自訂 System Prompt 設定');
  });

  // Section Templates Modal (分區規範與模板庫)
  initSectionsModal();
});

// ============================================================================
// 5. 分區規範與模板庫 (整合兩份長庚 PDF 手冊)
// ============================================================================
let activeSectionId = 'general_data';

function getSectionTemplateText(sec) {
  if (!sec) return '';
  return state.mode === 'peds_admission' && sec.pedsTemplate ? sec.pedsTemplate : sec.template;
}

function buildFullBlankTemplateForMode(mode) {
  if (mode === 'progression_soap') {
    const soapSec = (typeof CGMH_SECTION_TEMPLATES !== 'undefined')
      ? CGMH_SECTION_TEMPLATES.find((s) => s.id === 'progression_soap')
      : null;
    return soapSec ? soapSec.template : '';
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  const isPeds = mode === 'peds_admission';
  const prevMode = state.mode;
  state.mode = mode;
  const fullText = assembleAdmissionNoteFromAI({
    admission_date: today,
    general_summary: isPeds
      ? 'A __-year-__-month-old boy/girl.\nBH: ___ cm = __th percentile, BW: ___ kg = __th percentile, BMI: ___ kg/m2 = __th percentile'
      : 'This __-year-old male/female.',
    chief_complaint: '[Symptom or sign] for [Duration]',
    present_illness: '[第 1 段：相關過去史 + CC 依時序 LQQOPERA 描述]\n\n[第 2 段：鑑別診斷 negative findings + 檢查治療反應 + 住院原因]\n\n[第 3 段：Concurrent diseases / Co-morbidity + 病程總結]',
    ros_positives: [],
    lab_findings: 'Pending (異常數值請標示 *** 並附簡短解釋)',
    expert_findings: '[檢查日期/時間 + 報告本文與 IMP，刪除表單開頭與醫師簽名]',
    impression: '1. [主要 Active 診斷 — Etiological > Anatomical]',
    plan: 'Diagnostic:\n- [檢驗或影像項目] for [適應症]\nTherapeutic:\n- [明確英文手術名稱 / 治療] for [適應症]\nPatient Education:\n- Explained diagnosis, planned treatment, and warning signs.\nMeasurable goals:\n- [可評估追蹤目標]'
  });
  state.mode = prevMode;
  return fullText;
}

function renderSectionNav(selectedId) {
  const nav = document.getElementById('sectionNavList');
  if (!nav || typeof CGMH_SECTION_TEMPLATES === 'undefined') return;
  nav.innerHTML = '';

  let lastGroup = '';
  for (const sec of CGMH_SECTION_TEMPLATES) {
    if (sec.group !== lastGroup) {
      const groupLabel = document.createElement('div');
      groupLabel.className = 'sec-nav-group';
      groupLabel.textContent = sec.group;
      nav.appendChild(groupLabel);
      lastGroup = sec.group;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sec-nav-btn${sec.id === selectedId ? ' active' : ''}`;
    btn.dataset.sectionId = sec.id;
    btn.textContent = sec.shortTitle;
    btn.addEventListener('click', () => selectSectionTemplate(sec.id));
    nav.appendChild(btn);
  }
}

function selectSectionTemplate(sectionId) {
  if (typeof CGMH_SECTION_TEMPLATES === 'undefined') return;
  const sec = CGMH_SECTION_TEMPLATES.find((s) => s.id === sectionId) || CGMH_SECTION_TEMPLATES[0];
  if (!sec) return;
  activeSectionId = sec.id;

  document.querySelectorAll('#sectionNavList .sec-nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sectionId === sec.id);
  });

  document.getElementById('sectionDetailTitle').textContent = sec.title;
  document.getElementById('sectionDetailSubtitle').textContent = sec.subtitle;

  const rulesEl = document.getElementById('sectionRulesList');
  rulesEl.innerHTML = '';
  for (const r of sec.rules) {
    const li = document.createElement('li');
    li.textContent = r;
    rulesEl.appendChild(li);
  }

  const pitfallsEl = document.getElementById('sectionPitfallsList');
  pitfallsEl.innerHTML = '';
  for (const p of sec.pitfalls) {
    const li = document.createElement('li');
    li.textContent = p;
    pitfallsEl.appendChild(li);
  }

  document.getElementById('sectionTemplatePreview').value = getSectionTemplateText(sec);
}

function openSectionsModal(targetSectionId) {
  const sectionsModal = document.getElementById('sectionsModal');
  if (!sectionsModal || typeof CGMH_SECTION_TEMPLATES === 'undefined') return;
  const fallbackId = state.mode === 'progression_soap' ? 'progression_soap' : 'general_data';
  const initialId = targetSectionId || fallbackId;
  renderSectionNav(initialId);
  selectSectionTemplate(initialId);
  sectionsModal.showModal();
}

function initSectionsModal() {
  const sectionsModal = document.getElementById('sectionsModal');
  if (!sectionsModal) return;

  document.getElementById('openSectionsModalBtn').addEventListener('click', () => openSectionsModal());
  document.getElementById('closeSectionsModalBtn').addEventListener('click', () => sectionsModal.close());
  sectionsModal.addEventListener('click', (e) => {
    if (e.target === sectionsModal) sectionsModal.close();
  });

  document.getElementById('resetSectionTemplateBtn').addEventListener('click', () => {
    if (typeof CGMH_SECTION_TEMPLATES === 'undefined') return;
    const sec = CGMH_SECTION_TEMPLATES.find((s) => s.id === activeSectionId);
    if (sec) {
      document.getElementById('sectionTemplatePreview').value = getSectionTemplateText(sec);
      showToast('🔄 已還原此區塊預設模板');
    }
  });

  document.getElementById('copySectionTemplateBtn').addEventListener('click', async () => {
    const text = document.getElementById('sectionTemplatePreview').value;
    await navigator.clipboard.writeText(text);
    showToast('📋 已複製此區塊模板！');
  });

  document.getElementById('insertSectionTemplateBtn').addEventListener('click', () => {
    const blockText = document.getElementById('sectionTemplatePreview').value.trim();
    const outEl = document.getElementById('generatedOutput');
    if (!blockText) return;
    outEl.value = outEl.value.trim() ? `${outEl.value.replace(/\s+$/, '')}\n\n${blockText}` : blockText;
    runComplianceAudit(outEl.value);
    setStatus('done', '已插入分區');
    sectionsModal.close();
    showToast('⤵️ 已將此區塊模板插入右側生成結果！');
  });

  document.getElementById('copyFullTemplateBtn').addEventListener('click', async () => {
    const fullTemplate = buildFullBlankTemplateForMode(state.mode);
    await navigator.clipboard.writeText(fullTemplate);
    showToast('📑 已複製整份空白總模板！');
  });

  document.querySelectorAll('#complianceBadges .clickable-badge').forEach((badge) => {
    badge.addEventListener('click', () => {
      if (typeof CGMH_SECTION_TEMPLATES === 'undefined') return;
      const matched = CGMH_SECTION_TEMPLATES.find((s) => s.badgeKey === badge.dataset.check);
      openSectionsModal(matched ? matched.id : undefined);
    });
  });
}
