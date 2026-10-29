
function ListeningQuiz(){
  const[session,setSession]=useState(()=>[...LISTENING_BANK].sort(()=>Math.random()-.5).slice(0,20));
  const[cur,setCur]=useState(0);
  const[sel,setSel]=useState(null);
  const[score,setScore]=useState(0);
  const[done,setDone]=useState(false);
  const[played,setPlayed]=useState(false);

  function playAudio(txt,r){
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(txt);
    u.lang='zh-CN';u.rate=r!=null?r:window.hskSpeed;
    window.speechSynthesis.speak(u);setPlayed(true);
  }
  function pick(i){
    if(sel!==null)return;setSel(i);
    if(i===session[cur].ans)setScore(s=>s+1);
  }
  function next(){
    if(cur+1>=session.length){setDone(true);return;}
    setCur(c=>c+1);setSel(null);setPlayed(false);
  }
  function restart(){
    setSession([...LISTENING_BANK].sort(()=>Math.random()-.5).slice(0,20));
    setCur(0);setSel(null);setScore(0);setDone(false);setPlayed(false);
  }

  if(done)return(
    <div className="score-box">
      <div className="score-big">{score}/{session.length}</div>
      <div className="score-label">
        {score===session.length?"Perfect! Golden ears!":score>=session.length*.7?"Great listening! Keep practising!":"Focus on tones and -n vs -ng endings!"}
      </div>
      <div style={{color:"#888",fontSize:14,marginTop:6}}>{Math.round(score/session.length*100)}% correct</div>
      <div style={{marginTop:10,fontSize:13,color:"#555",padding:"10px",background:"#f8f8fa",borderRadius:8}}>
        Pool has 50 questions. Each session draws 20 randomly.
      </div>
      <button className="btn btn-primary" style={{marginTop:16}} onClick={restart}>New Session</button>
    </div>
  );

  const q=session[cur];
  const pct=Math.round((cur/session.length)*100);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888",marginBottom:8}}>
        <span>Q {cur+1}/{session.length} — 50-question minimal pairs bank</span>
        <span>Score: {score}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{width:pct+"%"}}/></div>

      <div style={{background:"#fafafa",border:"2px dashed #ddd",borderRadius:12,padding:"18px 20px",marginBottom:16}}>
        <div style={{fontSize:13,color:"#888",marginBottom:10,textAlign:"center"}}>
          Listen and choose which word completes the sentence
        </div>
        <div style={{fontSize:18,fontWeight:600,color:"#1a1a2e",marginBottom:14,textAlign:"center",letterSpacing:".5px"}}>
          {q.ctx}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn btn-primary" style={{fontSize:16,padding:"10px 24px"}}
            onClick={()=>playAudio(q.audio)}>
            {played?"Play Again":"Play Sentence"}
          </button>
          <button className="btn btn-outline" style={{fontSize:13}}
            onClick={()=>playAudio(q.audio,0.5)}>
            Slow
          </button>
        </div>
        {!played&&(
          <div style={{marginTop:10,textAlign:"center",fontSize:12,color:"#e74c3c",fontWeight:600}}>
            Press Play to hear the sentence first!
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[q.A,q.B].map((opt,i)=>{
          let bdr="2px solid #eee",bg="#fff",col="#333";
          if(sel!==null){
            if(i===q.ans){bdr="2px solid #27ae60";bg="#f0fdf4";col="#166534";}
            else if(i===sel){bdr="2px solid #e74c3c";bg="#fef5f5";col="#c0392b";}
          }
          return(
            <button key={i} onClick={()=>pick(i)}
              style={{padding:"14px 12px",border:bdr,borderRadius:12,background:bg,color:col,cursor:sel!==null?"default":"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .2s",display:"flex",flexDirection:"column",gap:2}}>
              <span style={{fontSize:11,fontWeight:800,color:i===0?"#2980b9":"#8e44ad",marginBottom:4}}>
                {i===0?"A":"B"}
              </span>
              <span style={{fontSize:26,fontWeight:800,lineHeight:1}}>{opt.h}</span>
              <span style={{fontSize:12,fontFamily:"monospace",opacity:.8,marginTop:4}}>{opt.p}</span>
              <span style={{fontSize:12,color:"#666",marginTop:2}}>{opt.e}</span>
            </button>
          );
        })}
      </div>

      {sel!==null&&(
        <div>
          <div style={{padding:"12px 16px",borderRadius:10,border:"1px solid",
            borderColor:sel===q.ans?"#bbf7d0":"#fca5a5",
            background:sel===q.ans?"#f0fdf4":"#fef5f5",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:15,color:sel===q.ans?"#166534":"#c0392b",marginBottom:6}}>
              {sel===q.ans?"Correct! "+[q.A,q.B][q.ans].h+" - "+[q.A,q.B][q.ans].e
                          :"Incorrect. Answer: "+[q.A,q.B][q.ans].h+" ("+[q.A,q.B][q.ans].e+")"}
            </div>
            <div style={{fontSize:13,color:"#555"}}>Tip: {q.tip}</div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="btn btn-outline" style={{fontSize:13}}
              onClick={()=>playAudio(q.audio)}>Hear Again</button>
            <button className="btn btn-primary" onClick={next}>
              {cur+1<session.length?"Next Question":"See Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

