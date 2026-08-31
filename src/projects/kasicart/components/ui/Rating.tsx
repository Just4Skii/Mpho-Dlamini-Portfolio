export function Rating({ rating, count, size=14 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({length:5}).map((_,i)=>{
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="relative inline-block" style={{width:size, height:size}}>
              <span style={{color:"#D6CFC2"}} className="absolute inset-0 leading-none">★</span>
              <span className="absolute inset-0 overflow-hidden leading-none" style={{width: `${fill*100}%`, color:"#11110F"}}>★</span>
            </span>
          );
        })}
      </div>
      {count !== undefined && <span className="text-[12px] text-stone-600">({count})</span>}
    </div>
  );
}
