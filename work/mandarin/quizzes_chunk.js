// ---- Pinyin Sentence Puzzles Database ----
const PINYIN_PUZZLES = [
  {words: ['Wǒ', 'chī', 'píngguǒ', '.'], answer: 'Wǒ chī píngguǒ.', meaning: 'I eat apples.'},
  {words: ['Nǐ', 'shì', 'xuéshēng', 'ma', '?'], answer: 'Nǐ shì xuéshēng ma?', meaning: 'Are you a student?'},
  {words: ['Wǒmen', 'míngtiān', 'qù', 'Běijīng', '.'], answer: 'Wǒmen míngtiān qù Běijīng.', meaning: 'We will go to Beijing tomorrow.'},
  {words: ['Tā', 'hěn', 'hǎo', '.'], answer: 'Tā hěn hǎo.', meaning: 'She is very good.'},
  {words: ['Duōshǎo', 'qián', '?'], answer: 'Duōshǎo qián?', meaning: 'How much?'},
  {words: ['Wǒ', 'yǒu', 'píngguǒ', 'hé', 'xiāngjiāo', '.'], answer: 'Wǒ yóu píngguǒ hé xiāngjiāo.', meaning: 'I have apples and bananas.'},
  {words: ['Tā', 'míngtiān', 'néng', 'lái', 'ma', '?'], answer: 'Tā míngtiān néng lái ma?', meaning: 'Can he come tomorrow?'},
  {words: ['Wǒ', 'xiǎng', 'hē', 'chá', '.'], answer: 'Wǒ xiǎng hē chá.', meaning: 'I want to drink tea.'},
  {words: ['Nǐ', 'jiào', 'shénme', 'míngzi', '?'], answer: 'Nǐ jiào shénme míngzi?', meaning: 'What is your name?'},
  {words: ['Wǒ', 'láizì', 'Nánfēi', '.'], answer: 'Wǒ láizì Nánfēi.', meaning: 'I come from South Africa.'},
  {words: ['Jīntiān', 'tiānqì', 'hěn', 'rè', '.'], answer: 'Jīntiān tiānqì hěn rè.', meaning: 'Today the weather is very hot.'},
  {words: ['Tā', 'zài', 'yīyuàn', 'gōngzuò', '.'], answer: 'Tā zài yīyuàn gōngzuò.', meaning: 'He works at the hospital.'},
  {words: ['Nǐ', 'xǐhuan', 'shénme', 'yùndòng', '?'], answer: 'Nǐ xǐhuan shénme yùndòng?', meaning: 'What sports do you like?'},
  {words: ['Wǒ', 'xǐhuan', 'dǎ', 'lánqiú', '.'], answer: 'Wǒ xǐhuan dǎ lánqiú.', meaning: 'I like playing basketball.'},
  {words: ['Xiànzài', 'jǐ', 'diǎn', '?'], answer: 'Xiànzài jǐ diǎn?', meaning: 'What time is it now?'},
  {words: ['Bā', 'diǎn', 'bàn', '.'], answer: 'Bā diǎn bàn.', meaning: 'Eight thirty.'},
  {words: ['Jīntiān', 'xià', 'yǔ', 'le', '.'], answer: 'Jīntiān xià yǔ le.', meaning: 'It rained today.'},
  {words: ['Wǒ', 'xǐhuan', 'chī', 'xiāngchángr', '.'], answer: 'Wǒ xǐhuan chī xiāngchángr.', meaning: 'I like to eat sausages.'},
  {words: ['Wǒmen', 'shì', 'liúxuéshēng', '.'], answer: 'Wǒmen shì liúxuéshēng.', meaning: 'We are international students.'},
  {words: ['Míngtiān', 'jiàn', '!'], answer: 'Míngtiān jiàn!', meaning: 'See you tomorrow!'}
];

// ===================== REVISED VOCAB QUIZ (HANZI / PINYIN MODE) =====================
function VocabQuiz() {
  const allWords = Object.values(VOCAB).flat();
  const [quizType, setQuizType] = useState('pinyin'); // pinyin | hanzi
  const [numQs, setNumQs] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  function startQuiz(count) {
    setNumQs(count);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, count);
    const qs = shuffled.map(w => {
      const wrong = [...allWords].filter(x => x.e !== w.e).sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        word: w,
        options: [w, ...wrong].sort(() => Math.random() - 0.5),
        correct: w
      };
    });
    setQuestions(qs);
    setCur(0);
    setSel(null);
    setScore(0);
    setDone(false);
    setStarted(true);
  }

  function pick(opt) {
    if (sel) return;
    setSel(opt);
    if (opt.e === questions[cur].correct.e) {
      setScore(s => s + 1);
    }
  }

  function next() {
    if (cur + 1 >= questions.length) {
      setDone(true);
    } else {
      setCur(c => c + 1);
      setSel(null);
    }
  }

  function restart() {
    setStarted(false);
  }

  if (!started) {
    return (
      <div style={{textAlign:'center', padding:'20px 10px'}}>
        <h3 style={{marginBottom:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>📖 Vocabulary Trainer</h3>
        <p style={{color:'#666', fontSize:14, marginBottom:20}}>Test yourself on the HSK 1 vocabulary database. Select Pinyin Mode to study completely without Hanzi, or Hanzi Mode to focus on character recognition.</p>
        <div style={{display:'flex', justifyContent:'center', gap:10, marginBottom:20}}>
          <button onClick={() => setQuizType('pinyin')} className={`btn ${quizType==='pinyin'?'btn-primary':'btn-outline'}`} style={{padding:'8px 16px'}}>Pinyin Mode (Hanzi-Free)</button>
          <button onClick={() => setQuizType('hanzi')} className={`btn ${quizType==='hanzi'?'btn-primary':'btn-outline'}`} style={{padding:'8px 16px'}}>Hanzi Mode (More Characters)</button>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontWeight:600, marginBottom:10}}>Select Number of Questions:</div>
          <div style={{display:'flex', justifyContent:'center', gap:8}}>
            {[10, 20, 50, 150].map(c => (
              <button key={c} onClick={() => startQuiz(c)} className="btn btn-outline" style={{padding:'8px 16px'}}>{c} Qs</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="score-box">
        <div className="score-big">{score}/{questions.length}</div>
        <div className="score-label">
          {score === questions.length ? '🏆 Perfect!' : score >= questions.length * 0.7 ? '🌟 Great job!' : '📚 Keep studying!'}
        </div>
        <div style={{marginTop:8, color:'#888', fontSize:14}}>{Math.round(score/questions.length*100)}% correct</div>
        <button className="btn btn-primary" style={{marginTop:20}} onClick={restart}>🔄 Setup New Quiz</button>
      </div>
    );
  }

  const q = questions[cur];
  const pct = Math.round((cur / questions.length) * 100);

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'#888', marginBottom:8}}>
        <span>Question {cur+1} of {questions.length} ({quizType === 'pinyin' ? 'Pinyin' : 'Hanzi'} Mode)</span>
        <span>Score: {score}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{width:pct+'%'}}/></div>
      <div className="quiz-q" style={{fontSize:16, fontWeight:600, color:'#555', marginBottom:12}}>What is the English meaning of this word?</div>
      <div style={{textAlign:'center', margin:'24px 0'}}>
        <div className="quiz-hanzi-big" style={{fontSize:44, color:'#c0392b', fontWeight:700}}>{quizType==='hanzi' ? q.word.h : q.word.p}</div>
        {quizType==='hanzi' && <div style={{fontSize:16, color:'#888', marginTop:5}}>{q.word.p}</div>}
        <AudioBtn text={q.word.h}/>
      </div>
      <div style={{display:'grid', gap:10}}>
        {q.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (sel) {
            if (opt.e === q.correct.e) cls += ' correct';
            else if (opt.e === sel.e) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => pick(opt)} style={{textAlign:'left', padding:'12px 18px', border:'2px solid #eee', borderRadius:10, background:'#fff', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center'}}>
              <span style={{fontWeight:700, marginRight:10, color:'#c0392b'}}>{String.fromCharCode(65+i)}.</span>
              {opt.e}
            </button>
          );
        })}
      </div>
      {sel && (
        <div style={{marginTop:20, padding:'16px', background:'#fbfbfb', border:'1px solid #eee', borderRadius:12}}>
          <div style={{fontWeight:700, fontSize:15, color:sel.e===q.correct.e?'#166534':'#c0392b', marginBottom:8}}>
            {sel.e===q.correct.e?'✅ Correct!':'❌ Incorrect'}
          </div>
          <div style={{fontSize:14, color:'#333', lineHeight:1.5}}>
            <strong>Correct Answer:</strong> {q.correct.e}<br/>
            <strong>Word Details:</strong> Pinyin: <em>{q.word.p}</em> | Character: {q.word.h}<br/>
            <span style={{display:'block', marginTop:8, fontSize:13, color:'#888'}}>
              {sel.e!==q.correct.e && `You chose: ${sel.e}. `}
              Study Tip: Learn to associate the sound and Pinyin '{q.word.p}' with the English meaning '{q.correct.e}'.
            </span>
          </div>
          <button className="btn btn-primary" style={{marginTop:15, width:'100%'}} onClick={next}>{cur+1<questions.length?'Next Question →':'See Results 🏆'}</button>
        </div>
      )}
    </div>
  );
}

// ===================== REVISED SENTENCE BUILDER (HANZI-FREE PINYIN CARDS) =====================
function SentenceBuilder(){
  const puzzles = PINYIN_PUZZLES;
  const [pidx, setPidx] = useState(0);
  const [arranged, setArranged] = useState([]);
  const [pool, setPool] = useState([]);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    selectPuzzle(pidx);
  }, [pidx]);

  function selectPuzzle(i) {
    setPidx(i);
    setArranged([]);
    setPool([...puzzles[i].words].sort(() => Math.random() - 0.5));
    setResult(null);
  }

  function pickWord(w, i) {
    if (result !== null) return;
    setArranged(a => [...a, w]);
    setPool(p => {
      const np = [...p];
      np.splice(i, 1);
      return np;
    });
  }

  function removeWord(w, i) {
    if (result !== null) return;
    setPool(p => [...p, w]);
    setArranged(a => {
      const na = [...a];
      na.splice(i, 1);
      return na;
    });
  }

  function check() {
    let userSentence = "";
    arranged.forEach((w, idx) => {
      if (idx === 0) {
        userSentence += w;
      } else if (w === "." || w === "?" || w === "!") {
        userSentence += w;
      } else {
        userSentence += " " + w;
      }
    });

    const isCorrect = userSentence.trim().toLowerCase() === puzzles[pidx].answer.trim().toLowerCase();
    setResult(isCorrect ? 'correct' : 'wrong');
  }

  return (
    <div>
      <h3 style={{marginBottom:10, display:'flex', alignItems:'center', gap:8}}>🧩 Pinyin Sentence Builder</h3>
      <p style={{color:'#666', fontSize:13, marginBottom:16}}>Arrange the Pinyin blocks in the correct grammatical order. No Hanzi used here.</p>
      
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:16}}>
        {puzzles.map((p, i) => (
          <button key={i} onClick={() => selectPuzzle(i)}
            style={{padding:'4px 10px', border:'2px solid', borderColor:pidx===i?'#c0392b':'#eee', borderRadius:8, background:pidx===i?'#fef5f5':'#fff', color:pidx===i?'#c0392b':'#666', cursor:'pointer', fontSize:12}}>
            Puzzle {i+1}
          </button>
        ))}
      </div>
      
      <div style={{fontSize:13, color:'#888', marginBottom:10}}>Arrange words to translate: <strong>"{puzzles[pidx].meaning}"</strong></div>
      
      <div style={{minHeight:52, background:'#fafafa', border:'2px dashed #ddd', borderRadius:10, padding:12, display:'flex', flexWrap:'wrap', gap:8, marginBottom:12, alignItems:'center'}}>
        {arranged.length === 0 && <span style={{color:'#ccc', fontSize:13, margin:'auto'}}>Tap Pinyin blocks below to build the sentence</span>}
        {arranged.map((w, i) => (
          <button key={i} onClick={() => removeWord(w, i)} 
            style={{padding:'8px 14px', border:'2px solid #c0392b', borderRadius:8, background:'#fef5f5', color:'#c0392b', cursor:'pointer', fontSize:15, fontWeight:600}}>
            {w}
          </button>
        ))}
      </div>
      
      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:16}}>
        {pool.map((w, i) => (
          <button key={i} onClick={() => pickWord(w, i)} 
            style={{padding:'8px 14px', border:'2px solid #eee', borderRadius:8, background:'#fff', color:'#333', cursor:'pointer', fontSize:15, fontWeight:600}}>
            {w}
          </button>
        ))}
      </div>
      
      {result === null ? (
        <button className="btn btn-primary" onClick={check} disabled={arranged.length === 0} style={{width:'100%'}}>Verify Sentence ✓</button>
      ) : (
        <div style={{padding:'16px', background:result==='correct'?'#f0fdf4':'#fef5f5', border:'1px solid', borderColor:result==='correct'?'#bbf7d0':'#fee2e2', borderRadius:12}}>
          <div style={{fontWeight:700, fontSize:15, color:result==='correct'?'#166534':'#c0392b', marginBottom:8}}>
            {result === 'correct' ? '✅ Correct! Perfect Word Order.' : '❌ Incorrect Word Order.'}
          </div>
          <div style={{fontSize:14, color:'#333', marginBottom:12}}>
            <strong>Your construction:</strong> {arranged.join(' ')}<br/>
            <strong>Expected answer:</strong> <em>{puzzles[pidx].answer}</em>
          </div>
          <p style={{fontSize:13, color:'#666', lineHeight:1.4, margin:'0 0 12px 0'}}>
            <strong>Grammar Tip:</strong> Time words (like <em>míngtiān</em>) and modal verbs (like <em>xiǎng</em>, <em>néng</em>) always come before main verbs in Chinese!
          </p>
          <button className="btn btn-outline" onClick={() => selectPuzzle(pidx)} style={{marginRight:8}}>Try Again</button>
          {pidx + 1 < puzzles.length && (
            <button className="btn btn-primary" onClick={() => selectPuzzle(pidx + 1)}>Next Puzzle →</button>
          )}
        </div>
      )}
    </div>
  );
}

// ===================== EXAM PRACTICE & TESTING CENTER (360 QUESTIONS, MOCK EXAM & TIMER) =====================
function ExamPracticeCenter() {
  const [subMode, setSubMode] = useState('menu'); // menu | practice | exam | results
  const [headingId, setHeadingId] = useState(0); // 0 to 5
  
  // Practice State
  const [pPool, setPPool] = useState([]);
  const [pCur, setPCur] = useState(0);
  const [pSel, setPSel] = useState(null);
  const [pScore, setPScore] = useState(0);
  const [pDone, setPDone] = useState(false);
  
  // Exam State
  const [eQs, setEQs] = useState([]);
  const [eAnswers, setEAnswers] = useState({}); // idx -> selected index
  const [eCur, setECur] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes = 2400 seconds
  const [eScore, setEScore] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const headings = [
    {id: 0, title: "Heading 1: Syllable Listening", db: SYLLABLE_LISTENING_DB, desc: "Listen to a syllable sound and choose the correct Pinyin romanization (tests tones and consonant pairs).", isListening: true},
    {id: 1, title: "Heading 2: Sentence Listening", db: SENTENCE_LISTENING_DB, desc: "Listen to a spoken sentence and fill in the blank with the correct Pinyin words.", isListening: true},
    {id: 2, title: "Heading 3: Picture Listening (True/False)", db: PICTURE_LISTENING_DB, desc: "Listen to a spoken word and decide whether it matches the picture (emoji) shown.", isListening: true},
    {id: 3, title: "Heading 4: Hanzi Matching (Reading)", db: HANZI_MATCHING_DB, desc: "Look at the Chinese character (Hanzi) and match it to its correct English translation.", isListening: false},
    {id: 4, title: "Heading 5: Picture Pinyin Match (Reading)", db: IMAGE_PINYIN_DB, desc: "Look at the picture (emoji) and choose the correct Pinyin representation.", isListening: false},
    {id: 5, title: "Heading 6: Sentence Completion (Reading)", db: SENTENCE_COMPLETION_DB, desc: "Complete the Pinyin sentence/dialogue with the correct grammatical option (Hanzi-free).", isListening: false}
  ];

  // Ref to prevent stale closure in useEffect timer
  const submitExamRef = React.useRef();
  submitExamRef.current = submitExam;

  // Timer Effect - only runs when timerActive state changes
  React.useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          if (submitExamRef.current) {
            submitExamRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  function startPractice(hIdx) {
    setHeadingId(hIdx);
    const db = headings[hIdx].db;
    // Shuffle and pick 10 questions for practice
    const qs = [...db].sort(() => Math.random() - 0.5).slice(0, 10);
    setPPool(qs);
    setPCur(0);
    setPSel(null);
    setPScore(0);
    setPDone(false);
    setSubMode('practice');
  }

  function answerPractice(optIdx) {
    if (pSel !== null) return;
    setPSel(optIdx);
    if (optIdx === pPool[pCur].ans) {
      setPScore(s => s + 1);
    }
  }

  function nextPractice() {
    if (pCur + 1 >= pPool.length) {
      setPDone(true);
    } else {
      setPCur(c => c + 1);
      setPSel(null);
    }
  }

  function startExam() {
    // Generate HSK-1 Structured Mock Exam (40 Questions total, matching actual HSK-1)
    // Q1-5 (5 Syllable Listening)
    const q1 = [...SYLLABLE_LISTENING_DB].sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({...q, hType: 0}));
    // Q6-10 (5 Sentence Listening)
    const q2 = [...SENTENCE_LISTENING_DB].sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({...q, hType: 1}));
    // Q11-20 (10 Picture Listening T/F)
    const q3 = [...PICTURE_LISTENING_DB].sort(() => Math.random() - 0.5).slice(0, 10).map(q => ({...q, hType: 2}));
    // Q21-25 (5 Hanzi Matching)
    const q4 = [...HANZI_MATCHING_DB].sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({...q, hType: 3}));
    // Q26-30 (5 Picture Pinyin Match)
    const q5 = [...IMAGE_PINYIN_DB].sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({...q, hType: 4}));
    // Q31-40 (10 Sentence Completion)
    const q6 = [...SENTENCE_COMPLETION_DB].sort(() => Math.random() - 0.5).slice(0, 10).map(q => ({...q, hType: 5}));

    const fullExam = [...q1, ...q2, ...q3, ...q4, ...q5, ...q6];
    setEQs(fullExam);
    setEAnswers({});
    setECur(0);
    setTimeLeft(2400); // 40 minutes
    setTimerActive(true);
    setSubMode('exam');
  }

  function answerExam(optIdx) {
    setEAnswers(prev => ({...prev, [eCur]: optIdx}));
  }

  function submitExam() {
    setTimerActive(false);
    let scoreCount = 0;
    eQs.forEach((q, idx) => {
      if (eAnswers[idx] === q.ans) {
        scoreCount += 5; // 5 points per question = 200 points total
      }
    });
    setEScore(scoreCount);
    setSubMode('results');
  }

  function playAudio(txt) {
    window.speakText(txt, window.hskSpeed || 0.7);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (subMode === 'menu') {
    return (
      <div>
        <div style={{background:'linear-gradient(135deg, #c0392b, #e74c3c)', color:'#fff', padding:'20px 24px', borderRadius:16, marginBottom:24}}>
          <h2 style={{margin:0, fontSize:22}}>🎓 DUT Confucius Institute HSK 1 Testing Center</h2>
          <p style={{margin:'8px 0 0 0', opacity:0.9, fontSize:14}}>Practice by specific exam heading with instant feedback & explanations, or attempt a Full Mock Exam simulating the real final test.</p>
        </div>
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, marginBottom:24}}>
          <div className="card" style={{border:'2px solid #1d4ed8', margin:0, display:'flex', flexDirection:'column'}}>
            <div className="card-header blue" style={{fontWeight:700}}>🏆 Full HSK 1 Mock Exam</div>
            <div className="card-body" style={{display:'flex', flexDirection:'column', flex:1, justifyContent:'space-between'}}>
              <div style={{fontSize:13, color:'#555', marginBottom:16}}>
                Simulate the real DUT exam structure:
                <ul style={{paddingLeft:18, margin:'8px 0', lineHeight:1.6}}>
                  <li>20 Listening Qs (Syllables, sentences, T/F images)</li>
                  <li>20 Reading Qs (Character translation, image match, sentences)</li>
                  <li>40 Minutes Timer</li>
                  <li>Passing Score: 120 / 200 points (60% passing standard)</li>
                </ul>
              </div>
              <button className="btn btn-primary" onClick={startExam} style={{width:'100%', padding:'12px'}}>Start Full Mock Exam 🚀</button>
            </div>
          </div>
          
          <div className="card" style={{border:'2px solid #166534', margin:0, display:'flex', flexDirection:'column'}}>
            <div className="card-header green" style={{fontWeight:700}}>📝 Targeted Practice by Section</div>
            <div className="card-body" style={{display:'flex', flexDirection:'column', flex:1, justifyContent:'space-between'}}>
              <p style={{fontSize:13, color:'#555', margin:'0 0 16px 0'}}>Study specific headings of the exam. You will get 10 random questions with **instant detailed explanations** for right and wrong answers.</p>
              <div style={{display:'grid', gap:8}}>
                {headings.map(h => (
                  <button key={h.id} className="btn btn-outline" onClick={() => startPractice(h.id)} style={{textAlign:'left', fontSize:12, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>{h.title}</span>
                    <span style={{fontSize:11, background:'#f0fdf4', color:'#166534', padding:'2px 6px', borderRadius:8}}>60 Qs Available</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subMode === 'practice') {
    if (pDone) {
      return (
        <div style={{textAlign:'center', padding:'30px 10px'}}>
          <div className="score-big" style={{fontSize:60, color:'#c0392b', fontWeight:700}}>{pScore}/10</div>
          <h3>Practice Completed!</h3>
          <p style={{color:'#666', fontSize:14, marginBottom:24}}>Great job! You finished practicing {headings[headingId].title}.</p>
          <div style={{display:'flex', gap:10, justifyContent:'center'}}>
            <button className="btn btn-outline" onClick={() => startPractice(headingId)}>🔄 Retry Section</button>
            <button className="btn btn-primary" onClick={() => setSubMode('menu')}>🏠 Return to Hub</button>
          </div>
        </div>
      );
    }

    const q = pPool[pCur];
    const pct = Math.round((pCur / pPool.length) * 100);
    const isListening = headings[headingId].isListening;

    return (
      <div>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'#888', marginBottom:8}}>
          <span>{headings[headingId].title} — Question {pCur+1} of 10</span>
          <span>Score: {pScore}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:pct+'%'}}/></div>
        
        <div className="card" style={{margin:'20px 0'}}>
          <div className="card-body" style={{textAlign:'center', padding:'24px'}}>
            <div style={{fontSize:14, color:'#777', marginBottom:12}}>
              {isListening ? "🎧 Listen to the pronunciation & answer the question:" : "📖 Read and answer the question:"}
            </div>
            
            {q.emoji && <div style={{fontSize:60, margin:'10px 0'}}>{q.emoji}</div>}
            {q.hz && headingId === 3 && <div style={{fontSize:44, color:'#c0392b', fontWeight:700, margin:'10px 0'}}>{q.hz}</div>}
            {q.qText && <div style={{fontSize:20, fontWeight:700, margin:'12px 0', fontFamily:'inherit'}}>{q.qText}</div>}
            
            {isListening && (
              <button className="btn btn-outline" onClick={() => playAudio(q.audio)} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', margin:'10px 0'}}>
                🔊 Play Audio
              </button>
            )}
          </div>
        </div>

        <div style={{display:'grid', gap:10}}>
          {q.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (pSel !== null) {
              if (i === q.ans) cls += ' correct';
              else if (i === pSel) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => answerPractice(i)} style={{textAlign:'left', padding:'12px 18px', border:'2px solid #eee', borderRadius:10, background:'#fff', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', width:'100%'}}>
                <span style={{fontWeight:700, marginRight:10, color:'#c0392b'}}>{String.fromCharCode(65+i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {pSel !== null && (
          <div style={{marginTop:20, padding:'16px', background:'#fbfbfb', border:'1px solid #eee', borderRadius:12}}>
            <div style={{fontWeight:700, fontSize:15, color:pSel===q.ans?'#166534':'#c0392b', marginBottom:8}}>
              {pSel===q.ans?'✅ Correct Answer!':'❌ Incorrect Option Chosen'}
            </div>
            <div style={{fontSize:14, color:'#333', lineHeight:1.5}}>
              <strong>Explanation:</strong><br/>
              <p style={{margin:'6px 0 0 0', color:'#444'}}>{q.explanation}</p>
            </div>
            <button className="btn btn-primary" style={{marginTop:15, width:'100%'}} onClick={nextPractice}>
              {pCur+1<pPool.length ? 'Next Question →' : 'See Results 🏆'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (subMode === 'exam') {
    const q = eQs[eCur];
    const userAns = eAnswers[eCur];
    const isListening = q.hType <= 2;
    const hInfo = headings[q.hType];

    return (
      <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fbfbfb', padding:'10px 16px', borderRadius:10, border:'1px solid #eee', marginBottom:16}}>
          <span style={{fontWeight:700, color:'#c0392b'}}>🏆 HSK 1 Mock Exam</span>
          <span style={{fontSize:14, fontWeight:600, color:'#555'}}>Time Remaining: <span style={{fontFamily:'monospace', color:timeLeft<300?'#c0392b':'#333'}}>{formatTime(timeLeft)}</span></span>
          <button className="btn btn-outline" onClick={submitExam} style={{padding:'6px 14px', fontSize:12, borderColor:'#c0392b', color:'#c0392b'}}>Submit Exam 📝</button>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'#888', marginBottom:8}}>
          <span>Question {eCur+1} of 50</span>
          <span>Section: {hInfo.title}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:Math.round((eCur/50)*100)+'%'}}/></div>

        <div className="card" style={{margin:'20px 0'}}>
          <div className="card-body" style={{textAlign:'center', padding:'24px'}}>
            <div style={{fontSize:13, color:'#777', marginBottom:10}}>
              {isListening ? "🎧 Listen to the spoken words and answer:" : "📖 Read the question and choose:"}
            </div>

            {q.emoji && <div style={{fontSize:60, margin:'10px 0'}}>{q.emoji}</div>}
            {q.hz && q.hType === 3 && <div style={{fontSize:44, color:'#c0392b', fontWeight:700, margin:'10px 0'}}>{q.hz}</div>}
            {q.qText && <div style={{fontSize:20, fontWeight:700, margin:'12px 0', fontFamily:'inherit'}}>{q.qText}</div>}

            {isListening && (
              <button className="btn btn-outline" onClick={() => playAudio(q.audio)} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', margin:'10px 0'}}>
                🔊 Play Audio
              </button>
            )}
          </div>
        </div>

        <div style={{display:'grid', gap:10, marginBottom:20}}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => answerExam(i)}
              style={{textAlign:'left', padding:'12px 18px', border:'2px solid', borderColor:userAns===i?'#c0392b':'#eee', borderRadius:10, background:userAns===i?'#fef5f5':'#fff', color:'#333', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', width:'100%'}}>
              <span style={{fontWeight:700, marginRight:10, color:userAns===i?'#c0392b':'#888'}}>{String.fromCharCode(65+i)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div style={{display:'flex', justifyContent:'space-between'}}>
          <button className="btn btn-outline" onClick={() => setECur(c => Math.max(0, c-1))} disabled={eCur===0}>← Previous</button>
          {eCur + 1 < 50 ? (
            <button className="btn btn-primary" onClick={() => setECur(c => c+1)}>Next →</button>
          ) : (
            <button className="btn btn-primary" onClick={submitExam} style={{background:'#166534', borderColor:'#166534'}}>Finish & Submit Exam ✓</button>
          )}
        </div>

        <div style={{marginTop:24}}>
          <div style={{fontSize:12, fontWeight:700, color:'#888', marginBottom:8}}>Question Grid:</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
            {Array.from({length: 50}).map((_, idx) => (
              <button key={idx} onClick={() => setECur(idx)}
                style={{width:26, height:26, padding:0, fontSize:10, border:'1px solid', borderColor:eCur===idx?'#c0392b':eAnswers[idx]!==undefined?'#bbf7d0':'#eee', background:eCur===idx?'#fef5f5':eAnswers[idx]!==undefined?'#f0fdf4':'#fff', color:eCur===idx?'#c0392b':eAnswers[idx]!==undefined?'#166534':'#777', borderRadius:4, cursor:'pointer'}}>
                {idx+1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (subMode === 'results') {
    const passed = eScore >= 120;
    return (
      <div>
        <div style={{textAlign:'center', padding:'30px 10px', background:'#fbfbfb', border:'1px solid #eee', borderRadius:16, marginBottom:24}}>
          <div style={{fontSize:72, fontWeight:800, color:passed?'#166534':'#c0392b', lineHeight:1}}>{eScore} <span style={{fontSize:24, color:'#888', fontWeight:500}}>/ 200</span></div>
          <h2 style={{margin:'10px 0 6px 0'}}>{passed ? '🎉 Congratulations! You Passed!' : '📚 Keep Reviewing!'}</h2>
          <p style={{margin:0, color:'#666', fontSize:15}}>Result: {passed ? 'PASS (DUT Certificate Standard)' : 'FAIL (Needs 120+ points to pass)'}</p>
          <div style={{marginTop:20, display:'flex', gap:10, justifyContent:'center'}}>
            <button className="btn btn-primary" onClick={startExam}>🔄 Try Another Exam</button>
            <button className="btn btn-outline" onClick={() => setSubMode('menu')}>🏠 Main Menu</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header blue" style={{fontWeight:700}}>📝 Detailed Exam Review & Explanations</div>
          <div className="card-body" style={{padding:0}}>
            <p style={{padding:'16px 20px', margin:0, background:'#eff6ff', fontSize:13, color:'#1d4ed8'}}>Review every question you answered below, inspect which ones you got correct/incorrect, and read the explanations.</p>
            
            {eQs.map((q, idx) => {
              const uAns = eAnswers[idx];
              const isCorrect = uAns === q.ans;
              const hInfo = headings[q.hType];
              
              return (
                <div key={idx} style={{padding:'20px', borderBottom:'1px solid #eee', background:isCorrect?'#fff':'#fff5f5'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:12}}>
                    <span style={{fontWeight:600, color:'#888'}}>Question {idx+1} — {hInfo.title}</span>
                    <span style={{fontWeight:700, color:isCorrect?'#166534':'#c0392b'}}>
                      {isCorrect ? '✅ Correct' : uAns===undefined ? '⚠️ Unanswered' : '❌ Incorrect'}
                    </span>
                  </div>
                  
                  <div style={{fontSize:16, fontWeight:700, marginBottom:10, color:'#333'}}>
                    {q.qText ? q.qText : q.emoji ? `Emoji: ${q.emoji}` : `Word Listening Question`}
                    {q.hz && ` (${q.hz})`}
                  </div>

                  {q.hType <= 2 && (
                    <div style={{marginBottom:10}}>
                      <button className="btn btn-outline" onClick={() => playAudio(q.audio)} style={{padding:'4px 10px', fontSize:11, display:'inline-flex', alignItems:'center', gap:4}}>
                        🔊 Replay Audio
                      </button>
                    </div>
                  )}

                  <div style={{display:'grid', gap:6, fontSize:13, color:'#555', marginBottom:12}}>
                    {q.options.map((opt, oIdx) => {
                      let optionStyle = {padding:'6px 12px', border:'1px solid #eee', borderRadius:6, background:'#fff'};
                      if (oIdx === q.ans) {
                        optionStyle.borderColor = '#bbf7d0';
                        optionStyle.background = '#f0fdf4';
                        optionStyle.color = '#166534';
                        optionStyle.fontWeight = 'bold';
                      } else if (oIdx === uAns) {
                        optionStyle.borderColor = '#fec2c2';
                        optionStyle.background = '#fef2f2';
                        optionStyle.color = '#991b1b';
                      }
                      return (
                        <div key={oIdx} style={optionStyle}>
                          {String.fromCharCode(65+oIdx)}. {opt} {oIdx === q.ans && '✓'}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{background:'#fafafa', border:'1px solid #eee', padding:'10px 14px', borderRadius:8, fontSize:13, color:'#555'}}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
