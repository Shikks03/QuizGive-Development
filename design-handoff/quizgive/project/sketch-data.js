// Mock state for the sketch prototype.

const now = Date.now();
const days = (n) => now - n * 86400000;

const MOCK_QUIZZES = {
  'q_bio_241': {
    id: 'q_bio_241',
    title: '[BIO 241] Cell Biology Midterm Review',
    course: 'BIO 241 · Cell Bio',
    createdAt: days(3),
    questions: [
      {
        prompt: 'Which organelle is primarily responsible for ATP production in eukaryotic cells?',
        choices: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'],
        correctIdx: 1,
      },
      {
        prompt: 'During which phase of mitosis do sister chromatids separate?',
        choices: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
        correctIdx: 2,
      },
      {
        prompt: 'The fluid mosaic model describes the structure of:',
        choices: ['DNA double helix', 'The plasma membrane', 'Cytoskeleton filaments', 'Mitochondrial cristae'],
        correctIdx: 1,
      },
      {
        prompt: 'Which process produces 4 haploid daughter cells from one diploid parent cell?',
        choices: ['Mitosis', 'Binary fission', 'Meiosis', 'Cytokinesis'],
        correctIdx: 2,
      },
      {
        prompt: 'Rough endoplasmic reticulum is studded with which structures?',
        choices: ['Mitochondria', 'Ribosomes', 'Centrioles', 'Vacuoles'],
        correctIdx: 1,
      },
      {
        prompt: 'What is the function of the nucleolus?',
        choices: ['DNA replication', 'mRNA splicing', 'Ribosome assembly', 'Protein degradation'],
        correctIdx: 2,
      },
      {
        prompt: 'Active transport across a cell membrane requires:',
        choices: ['Only a concentration gradient', 'Only osmotic pressure', 'Energy (typically ATP)', 'High temperature'],
        correctIdx: 2,
      },
      {
        prompt: 'Which molecule carries genetic information from the nucleus to ribosomes?',
        choices: ['tRNA', 'mRNA', 'rRNA', 'DNA polymerase'],
        correctIdx: 1,
      },
    ],
  },
  'q_hist_eu': {
    id: 'q_hist_eu',
    title: '[HIST 102] Industrial Revolution',
    course: 'HIST 102 · European History',
    createdAt: days(8),
    questions: [
      { prompt: 'In which country did the Industrial Revolution begin?', choices: ['France', 'Britain', 'Germany', 'United States'], correctIdx: 1 },
      { prompt: 'Who invented the improved steam engine in 1769?', choices: ['Eli Whitney', 'Thomas Edison', 'James Watt', 'Henry Ford'], correctIdx: 2 },
      { prompt: 'The spinning jenny was used primarily for:', choices: ['Iron smelting', 'Cotton thread production', 'Train manufacturing', 'Coal mining'], correctIdx: 1 },
      { prompt: 'Which energy source powered most factories in early industrialization?', choices: ['Electricity', 'Coal', 'Natural gas', 'Wind'], correctIdx: 1 },
      { prompt: 'The Luddites protested against:', choices: ['Voting reform', 'Mechanized looms taking jobs', 'High taxes', 'Religious persecution'], correctIdx: 1 },
    ],
  },
  'q_chem_org': {
    id: 'q_chem_org',
    title: '[CHEM 201] Organic Chemistry — Functional Groups',
    course: 'CHEM 201',
    createdAt: days(1),
    questions: [
      { prompt: 'Which functional group is represented by –COOH?', choices: ['Aldehyde', 'Carboxylic acid', 'Ester', 'Ketone'], correctIdx: 1 },
      { prompt: 'An alcohol is characterized by which functional group?', choices: ['–OH', '–NH2', '–CHO', '–COOR'], correctIdx: 0 },
      { prompt: 'Esters are formed from a reaction between:', choices: ['An alkene and water', 'An alcohol and a carboxylic acid', 'Two alkanes', 'An aldehyde and a ketone'], correctIdx: 1 },
      { prompt: 'Which of the following is an amine?', choices: ['CH3CH2OH', 'CH3COOH', 'CH3NH2', 'CH3OCH3'], correctIdx: 2 },
    ],
  },
  'q_cs_data': {
    id: 'q_cs_data',
    title: '[CS 230] Data Structures Quiz 3',
    course: 'CS 230',
    createdAt: days(12),
    questions: [
      { prompt: 'What is the average-case time complexity of inserting into a balanced BST?', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIdx: 1 },
      { prompt: 'Which data structure uses LIFO ordering?', choices: ['Queue', 'Stack', 'Heap', 'Linked list'], correctIdx: 1 },
      { prompt: 'A hash table\u2019s worst-case lookup is:', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctIdx: 2 },
      { prompt: 'Which traversal visits root → left → right?', choices: ['Inorder', 'Preorder', 'Postorder', 'Level-order'], correctIdx: 1 },
      { prompt: 'Adjacency lists are typically used to represent:', choices: ['Trees', 'Graphs', 'Hashmaps', 'Stacks'], correctIdx: 1 },
      { prompt: 'Which sorting algorithm is NOT comparison-based?', choices: ['Quicksort', 'Mergesort', 'Heapsort', 'Counting sort'], correctIdx: 3 },
    ],
  },
  'q_psy_101': {
    id: 'q_psy_101',
    title: '[PSY 101] Intro Psychology — Memory & Learning',
    course: 'PSY 101',
    createdAt: days(20),
    questions: [
      { prompt: 'Classical conditioning was first studied by:', choices: ['B.F. Skinner', 'Ivan Pavlov', 'Carl Jung', 'Albert Bandura'], correctIdx: 1 },
      { prompt: 'Long-term memory has roughly what capacity?', choices: ['7 ± 2 items', '20 items', 'Unlimited (practically)', '50 items'], correctIdx: 2 },
      { prompt: 'The "primacy effect" suggests that people remember:', choices: ['Items in the middle of a list', 'Items at the beginning of a list', 'Random items', 'Items at the end of a list'], correctIdx: 1 },
    ],
  },
};

const MOCK_FOLDERS = {
  'f_finals': { id: 'f_finals', name: 'Spring Finals', quizIds: ['q_bio_241', 'q_chem_org'] },
};

const MOCK_RESULTS = {
  'q_psy_101': {
    right: 2, wrong: 1, skipped: 0, total: 3, pct: 0.667,
    finishedAt: days(2),
    durationMs: 4 * 60 * 1000,
  },
  'q_hist_eu': {
    right: 5, wrong: 0, skipped: 0, total: 5, pct: 1.0,
    finishedAt: days(5),
    durationMs: 6 * 60 * 1000,
  },
};

// Sessions: in-progress one for CS 230
const MOCK_SESSIONS = {
  'q_cs_data': {
    submitted: false,
    answers: [1, 1, null, 1, null, null],
    questionOrder: [0, 1, 2, 3, 4, 5],
    choiceOrders: [[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3]],
    currentIdx: 2,
    layout: 'one',
    feedback: 'instant',
    randomizeQuestions: true,
    randomizeChoices: true,
    startedAt: days(0.2),
  },
  // pre-populated for results display
  'q_psy_101': {
    submitted: true,
    answers: [1, 2, 0],
    questionOrder: [0, 1, 2],
    choiceOrders: [[0,1,2,3],[0,1,2,3],[0,1,2,3]],
    currentIdx: 0,
    layout: 'one',
    feedback: 'instant',
    randomizeQuestions: false,
    randomizeChoices: false,
    startedAt: days(2) - 4*60*1000,
    finishedAt: days(2),
  },
};

const MOCK_BOOKMARKS = ['q_bio_241', 'q_psy_101'];

const INITIAL_STATE = {
  user: { name: 'Maya R.', initials: 'MR' },
  theme: 'light',
  quizzes: MOCK_QUIZZES,
  folders: MOCK_FOLDERS,
  bookmarks: MOCK_BOOKMARKS,
  results: MOCK_RESULTS,
  sessions: MOCK_SESSIONS,
  questionBookmarks: { 'q_bio_241': [0, 3] },
  cardOrder: ['q_cs_data', 'q_psy_101', 'q_hist_eu'],
  folderOrder: ['f_finals'],
};

window.SketchData = {
  INITIAL_STATE,
  POLISH_PROMPT_PREVIEW: `You are a quiz preparation assistant. Convert the study material below into a clean JSON quiz.

Output rules (return ONLY valid JSON, no commentary):
{
  "title": "<short quiz name>",
  "course": "<course code if known, else ''>",
  "questions": [
    {
      "prompt": "<the question text>",
      "choices": ["<choice A>", "<choice B>", "<choice C>", "<choice D>"],
      "correctIdx": 0
    }
  ]
}

- 4 choices per question whenever possible.
- correctIdx is 0-based (0 = first choice).
- Use plain text — no markdown in prompts or choices.
- For true/false items use ["True","False"] and set correctIdx accordingly.

STUDY MATERIAL:
<paste your notes / reviewer / textbook excerpt here>`,
  formatRelative(ts) {
    const diff = Date.now() - ts;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return 'just now';
    if (diff < hour) return Math.floor(diff / minute) + 'm ago';
    if (diff < day) return Math.floor(diff / hour) + 'h ago';
    if (diff < 7 * day) return Math.floor(diff / day) + 'd ago';
    return new Date(ts).toLocaleDateString();
  },
  formatDuration(ms) {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  },
};
