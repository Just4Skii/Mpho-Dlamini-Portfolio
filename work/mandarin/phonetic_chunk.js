
function PhoneticTrainer(){
  const INI=[
    {s:'b',ex:'爸',note:'like b but no puff of air (unaspirated)'},
    {s:'p',ex:'苹',note:'b + strong puff of air (aspirated)'},
    {s:'m',ex:'妈',note:'English m'},
    {s:'f',ex:'饭',note:'English f'},
    {s:'d',ex:'的',note:'d but no puff of air'},
    {s:'t',ex:'他',note:'d + puff of air'},
    {s:'n',ex:'你',note:'English n'},
    {s:'l',ex:'来',note:'English l'},
    {s:'g',ex:'国',note:'g but no puff'},
    {s:'k',ex:'可',note:'g + puff of air'},
    {s:'h',ex:'好',note:'breathy English h'},
    {s:'j',ex:'几',note:'like j in jeep (before i/u only)'},
    {s:'q',ex:'去',note:'like ch in cheap (before i/u only)'},
    {s:'x',ex:'喜',note:'like sh in sheep (before i/u only)'},
    {s:'zh',ex:'中',note:'retroflex - curl tongue back'},
    {s:'ch',ex:'吃',note:'retroflex ch - curl tongue back'},
    {s:'sh',ex:'是',note:'retroflex sh - curl tongue back'},
    {s:'r',ex:'人',note:'retroflex r - like r in leisure'},
    {s:'z',ex:'在',note:'like ds in kids (non-retroflex)'},
    {s:'c',ex:'菜',note:'like ts in hats (non-retroflex)'},
    {s:'s',ex:'水',note:'English s (non-retroflex)'}
  ];
  const FIN=[
    {s:'a',ex:'啊',note:'ah in father'},
    {s:'o',ex:'喔',note:'o in more'},
    {s:'e',ex:'鹅',note:'e in her (unrounded)'},
    {s:'i',ex:'一',note:'ee in see'},
    {s:'u',ex:'五',note:'oo in too'},
    {s:'v',ex:'鱼',note:'French u - round lips and say ee'},
    {s:'ai',ex:'爱',note:'like the word eye'},
    {s:'ei',ex:'北',note:'ay in say'},
    {s:'ao',ex:'好',note:'ow in cow'},
    {s:'ou',ex:'有',note:'oe in toe'},
    {s:'an',ex:'饭',note:'an - tongue touches upper teeth'},
    {s:'en',ex:'们',note:'en in open - nasal'},
    {s:'ang',ex:'行',note:'back of throat nasal -ng'},
    {s:'eng',ex:'等',note:'like ng in sing'},
    {s:'ong',ex:'中',note:'back nasal with rounded lips'},
    {s:'ing',ex:'听',note:'ing in ring'},
    {s:'in',ex:'新',note:'tip of tongue nasal -n (NOT -ng)'},
    {s:'ian',ex:'点',note:'i + an combined'},
    {s:'iao',ex:'饺',note:'i + ao combined'},
    {s:'uan',ex:'换',note:'u + an combined'},
    {s:'-n vs-ng',ex:'新星',note:'xin (tip tongue) vs xing (back throat)'}
  ];
  const[tab,setTab]=React.useState('ini');
  const[playing,setPlaying]=React.useState('');
  function hear(char,label){
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();setPlaying(label);
    const txt=char.length>1&&!char.match(/[\u4e00-\u9fff]/)? char : char[0];
    const u=new SpeechSynthesisUtterance(char[0]);
    u.lang='zh-CN';u.rate=0.6;
    u.onend=()=>setPlaying('');u.onerror=()=>setPlaying('');
    window.speechSynthesis.speak(u);
  }
  const data=tab==='ini'?INI:FIN;
  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <button onClick={()=>setTab('ini')} className={'btn '+(tab==='ini'?'btn-primary':'btn-outline')} style={{fontSize:13,padding:'6px 14px'}}>Initials (21)</button>
        <button onClick={()=>setTab('fin')} className={'btn '+(tab==='fin'?'btn-primary':'btn-outline')} style={{fontSize:13,padding:'6px 14px'}}>Finals (21)</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
        {data.map((item,i)=>(
          <div key={i} style={{background:'#fafafa',border:'2px solid '+(playing===item.s?'#c0392b':'#eee'),borderRadius:10,padding:12,transition:'border-color .2s'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:22,fontWeight:800,fontFamily:'monospace',color:'#c0392b'}}>{item.s}</span>
              <button onClick={()=>hear(item.ex,item.s)} style={{border:'none',borderRadius:16,padding:'3px 10px',background:playing===item.s?'#c0392b':'#eee',color:playing===item.s?'#fff':'#555',cursor:'pointer',fontSize:12,fontWeight:700}}>
                {playing===item.s?'Playing':'Hear'}
              </button>
            </div>
            <div style={{fontSize:20,color:'#333',marginBottom:2}}>{item.ex}</div>
            <div style={{fontSize:11,color:'#888'}}>{item.note}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12,background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#92400e'}}>
        Tip: Initials cannot stand alone. Click Hear on any card to hear its example character.
      </div>
    </div>
  );
}

