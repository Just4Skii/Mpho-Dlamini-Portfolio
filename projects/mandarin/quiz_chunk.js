// ===================== QUIZ TAB =====================

const LISTEN_POOL = (()=>{
  const vw = Object.values(VOCAB).flat();
  const tw = THEMES.flatMap(t=>t.items).filter(w=>w.h&&!w.h.includes('...'));
  const seen=new Set();
  return [...vw,...tw].filter(w=>{if(seen.has(w.h))return false;seen.add(w.h);return true;});
})();

function ListeningQuiz(){
  function buildQ(){
    const sh=[...LISTEN_POOL].sort(()=>Math.random()-.5).slice(0,20);
    return sh.map(w=>{
      const wr=[...LISTEN_POOL].filter(x=>x.h!==w.h).sort(()=>Math.random()-.5).slice(0,3);
      return{word:w,options:[w,...wr].sort(()=>Math.random()-.5),correct:w};
    });
  }
  const[questions,setQ]=React.useState(()=>buildQ());
  const[cur,setCur]=React.useState(0);
  const[sel,setSel]=React.useState(null);
  const[score,setScore]=React.useState(0);
  const[done,setDone]=React.useState(false);
  const[played,setPlayed]=React.useState(false);
  const[amode,setAmode]=React.useState('hanzi');
  function playWord(txt,r){
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(txt);
    u.lang='zh-CN';u.rate=r!=null?r:window.hskSpeed;
    window.speechSynthesis.speak(u);setPlayed(true);
  }
  function pick(opt){if(sel)return;setSel(opt);if(opt.h===questions[cur].correct.h)setScore(s=>s+1);}
  function next(){if(cur+1>=questions.length){setDone(true);return;}setCur(c=>c+1);setSel(null);setPlayed(false);}
  function restart(){setQ(buildQ());setCur(0);setSel(null);setScore(0);setDone(false);setPlayed(false);}
  if(done)return(
    <div className="score-box">
      <div className="score-big">{score}/{questions.length}</div>
      <div className="score-label">{score===questions.length?'Perfect Listener!':score>=questions.length*.7?'Great ears!':'Keep practising!'}</div>
      <div style={{color:'#888',fontSize:14,marginTop:6}}>{Math.round(score/questions.length*100)}%</div>
      <button className="btn btn-primary" style={{marginTop:20}} onClick={restart}>New Listening Quiz</button>
    </div>
  );
  const q=questions[cur];
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#888',marginBottom:8}}>
        <span>Question {cur+1}/{questions.length}</span><span>Score: {score}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{width:Math.round(cur/questions.length*100)+'%'}}/></div>
      <div style={{textAlign:'center',margin:'20px 0 12px'}}>
        <div style={{fontSize:13,color:'#888',marginBottom:10}}>Listen then pick the correct word</div>
        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:8}}>
          <button className="btn btn-primary" style={{fontSize:18,padding:'12px 28px'}} onClick={()=>playWord(q.word.h)}>Play Word</button>
          <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>playWord(q.word.h,0.5)}>Slow</button>
        </div>
        {!played&&<div style={{fontSize:12,color:'#e74c3c',fontWeight:600}}>Press Play first!</div>}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:12}}>
        <button onClick={()=>setAmode('hanzi')} className={'btn '+(amode==='hanzi'?'btn-primary':'btn-outline')} style={{fontSize:12,padding:'5px 12px'}}>Hanzi Options</button>
        <button onClick={()=>setAmode('english')} className={'btn '+(amode==='english'?'btn-primary':'btn-outline')} style={{fontSize:12,padding:'5px 12px'}}>English Options</button>
      </div>
      <div>
        {q.options.map((opt,i)=>{
          let cls='quiz-option';
          if(sel){if(opt.h===q.correct.h)cls+=' correct';else if(opt.h===sel.h)cls+=' wrong';}
          return(
            <button key={i} className={cls} onClick={()=>pick(opt)}>
              <span style={{fontSize:amode==='hanzi'?22:15,fontWeight:700,marginRight:6}}>{amode==='hanzi'?opt.h:opt.e}</span>
              {amode==='hanzi'&&<span style={{fontSize:12,color:'#999',fontWeight:400}}>{opt.p}</span>}
            </button>
          );
        })}
      </div>
      {sel&&(
        <div style={{marginTop:16,textAlign:'center'}}>
          <div style={{padding:'10px 16px',borderRadius:10,background:sel.h===q.correct.h?'#f0fdf4':'#fef5f5',color:sel.h===q.correct.h?'#166534':'#c0392b',fontWeight:700,marginBottom:8}}>
            {sel.h===q.correct.h?'Correct!':'Incorrect'}
          </div>
          <div style={{marginBottom:12,fontSize:14}}>Answer: <strong style={{color:'#c0392b',fontSize:22}}>{q.correct.h}</strong> {q.correct.p} - {q.correct.e}</div>
          <button className="btn btn-primary" onClick={next}>{cur+1<questions.length?'Next':'Results'}</button>
        </div>
      )}
    </div>
  );
}

function VocabQuiz(){
  const aw=Object.values(VOCAB).flat();
  function buildQ(){
    return [...aw].sort(()=>Math.random()-.5).slice(0,15).map(w=>{
      const wr=[...aw].filter(x=>x.h!==w.h).sort(()=>Math.random()-.5).slice(0,3);
      return{word:w,options:[w,...wr].sort(()=>Math.random()-.5),correct:w};
    });
  }
  const[questions,setQ]=React.useState(()=>buildQ());
  const[cur,setCur]=React.useState(0);
  const[sel,setSel]=React.useState(null);
  const[score,setScore]=React.useState(0);
  const[done,setDone]=React.useState(false);
  const[qtype,setQtype]=React.useState('hanzi');
  function pick(opt){if(sel)return;setSel(opt);if(opt.h===questions[cur].correct.h)setScore(s=>s+1);}
  function next(){if(cur+1>=questions.length){setDone(true);return;}setCur(c=>c+1);setSel(null);}
  function restart(){setQ(buildQ());setCur(0);setSel(null);setScore(0);setDone(false);}
  if(done)return(
    <div className="score-box">
      <div className="score-big">{score}/{questions.length}</div>
      <div className="score-label">{score===questions.length?'Perfect!':score>=questions.length*.7?'Great job!':'Keep studying!'}</div>
      <div style={{color:'#888',fontSize:14,marginTop:6}}>{Math.round(score/questions.length*100)}%</div>
      <button className="btn btn-primary" style={{marginTop:20}} onClick={restart}>New Quiz</button>
    </div>
  );
  const q=questions[cur];
  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <button onClick={()=>setQtype('hanzi')} className={'btn '+(qtype==='hanzi'?'btn-primary':'btn-outline')} style={{fontSize:12,padding:'5px 12px'}}>Hanzi Mode</button>
        <button onClick={()=>setQtype('pinyin')} className={'btn '+(qtype==='pinyin'?'btn-primary':'btn-outline')} style={{fontSize:12,padding:'5px 12px'}}>Pinyin Mode</button>
        <button onClick={restart} className="btn btn-outline" style={{marginLeft:'auto',fontSize:12,padding:'5px 12px'}}>Restart</button>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#888',marginBottom:8}}>
        <span>Q {cur+1}/{questions.length}</span><span>Score: {score}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{width:Math.round(cur/questions.length*100)+'%'}}/></div>
      <div className="quiz-q">What is the meaning?</div>
      <div style={{textAlign:'center',margin:'16px 0'}}>
        <div className="quiz-hanzi-big">{qtype==='hanzi'?q.word.h:q.word.p}</div>
        {qtype==='hanzi'&&<div style={{fontSize:13,color:'#aaa'}}>{q.word.p}</div>}
        <AudioBtn text={q.word.h}/>
      </div>
      <div>
        {q.options.map((opt,i)=>{
          let cls='quiz-option';
          if(sel){if(opt.h===q.correct.h)cls+=' correct';else if(opt.h===sel.h)cls+=' wrong';}
          return(<button key={i} className={cls} onClick={()=>pick(opt)}>{String.fromCharCode(65+i)}. {opt.e}</button>);
        })}
      </div>
      {sel&&(
        <div style={{marginTop:16,textAlign:'center'}}>
          <div style={{padding:'10px 16px',borderRadius:10,background:sel.h===q.correct.h?'#f0fdf4':'#fef5f5',color:sel.h===q.correct.h?'#166534':'#c0392b',fontWeight:700,marginBottom:12}}>
            {sel.h===q.correct.h?'Correct!':'Wrong - '+q.correct.e}
          </div>
          <button className="btn btn-primary" onClick={next}>{cur+1<questions.length?'Next':'Results'}</button>
        </div>
      )}
    </div>
  );
}

function SentenceBuilder(){
  const puzzles=[
    {words:['我','吃','苹果','。'],answer:'我吃苹果。',meaning:'I eat apples.'},
    {words:['你','是','学生','吗','？'],answer:'你是学生吗？',meaning:'Are you a student?'},
    {words:['我们','明天','去','北京','。'],answer:'我们明天去北京。',meaning:'We go to Beijing tomorrow.'},
    {words:['她','很','好','。'],answer:'她很好。',meaning:'She is good.'},
    {words:['多少','钱','？'],answer:'多少钱？',meaning:'How much?'},
    {words:['我','有','苹果','和','香蕉','。'],answer:'我有苹果和香蕉。',meaning:'I have apples and bananas.'},
    {words:['他','明天','能','来','吗','？'],answer:'他明天能来吗？',meaning:'Can he come tomorrow?'}
  ];
  const[pidx,setPidx]=React.useState(0);
  const[arr,setArr]=React.useState([]);
  const[pool,setPool]=React.useState([...puzzles[0].words].sort(()=>Math.random()-.5));
  const[result,setResult]=React.useState(null);
  function selPuzz(i){setPidx(i);setArr([]);setPool([...puzzles[i].words].sort(()=>Math.random()-.5));setResult(null);}
  function pick(w,i){if(result!==null)return;setArr(a=>[...a,w]);setPool(p=>{const n=[...p];n.splice(i,1);return n;});}
  function rem(w,i){if(result!==null)return;setPool(p=>[...p,w]);setArr(a=>{const n=[...a];n.splice(i,1);return n;});}
  function check(){setResult(arr.join('')===puzzles[pidx].answer?'correct':'wrong');}
  return(
    <div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
        {puzzles.map((p,i)=>(<button key={i} onClick={()=>selPuzz(i)} style={{padding:'4px 12px',border:'2px solid',borderColor:pidx===i?'#c0392b':'#eee',borderRadius:8,background:pidx===i?'#fef5f5':'#fff',color:pidx===i?'#c0392b':'#666',cursor:'pointer',fontFamily:'inherit',fontSize:13}}>#{i+1}</button>))}
      </div>
      <div style={{fontSize:13,color:'#888',marginBottom:10}}>Form: <em>"{puzzles[pidx].meaning}"</em></div>
      <div style={{minHeight:52,background:'#fafafa',border:'2px dashed #ddd',borderRadius:10,padding:10,display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
        {arr.length===0&&<span style={{color:'#ccc',fontSize:13,margin:'auto'}}>Tap words below</span>}
        {arr.map((w,i)=>(<button key={i} onClick={()=>rem(w,i)} style={{padding:'6px 12px',border:'2px solid #c0392b',borderRadius:8,background:'#fef5f5',color:'#c0392b',cursor:'pointer',fontFamily:'inherit',fontSize:16,fontWeight:700}}>{w}</button>))}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
        {pool.map((w,i)=>(<button key={i} onClick={()=>pick(w,i)} style={{padding:'6px 12px',border:'2px solid #eee',borderRadius:8,background:'#fff',color:'#333',cursor:'pointer',fontFamily:'inherit',fontSize:16,fontWeight:700}}>{w}</button>))}
      </div>
      {result===null?(<button className="btn btn-primary" onClick={check} disabled={arr.length===0}>Check</button>):(
        <div>
          <div style={{padding:'10px 16px',borderRadius:10,background:result==='correct'?'#f0fdf4':'#fef5f5',color:result==='correct'?'#166534':'#c0392b',fontWeight:700,marginBottom:12}}>
            {result==='correct'?'Correct! '+puzzles[pidx].answer:'Correct: '+puzzles[pidx].answer}
          </div>
          <button className="btn btn-outline" onClick={()=>selPuzz(pidx)}>Try Again</button>
        </div>
      )}
    </div>
  );
}

function QuizTab(){
  const[mode,setMode]=React.useState('vocab');
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:4}}>
        <div className="section-title" style={{marginBottom:0}}>Quiz Centre</div>
        <SpeedControl/>
      </div>
      <div className="section-sub">Vocabulary recognition, listening comprehension, sentence building</div>
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <button onClick={()=>setMode('vocab')} className={'btn '+(mode==='vocab'?'btn-primary':'btn-outline')}>Vocab Quiz</button>
        <button onClick={()=>setMode('listening')} className={'btn '+(mode==='listening'?'btn-primary':'btn-outline')}>Listening Quiz</button>
        <button onClick={()=>setMode('builder')} className={'btn '+(mode==='builder'?'btn-primary':'btn-outline')}>Sentence Builder</button>
      </div>
      <div className="card">
        <div className="card-body">
          {mode==='vocab'&&<VocabQuiz/>}
          {mode==='listening'&&<ListeningQuiz/>}
          {mode==='builder'&&<SentenceBuilder/>}
        </div>
      </div>
    </div>
  );
}

