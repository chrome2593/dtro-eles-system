import React, { useState, useMemo, useEffect } from 'react';
import { Search, BarChart2, Calendar, Layers, Monitor, MapPin, Database, Zap, ChevronRight, TrainFront, ShieldCheck, ArrowRight, History } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '성당못', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구역', '칠성시장', '신천', '동대구역', '큰고개', '양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '대공원', '고산', '수성알파시티', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  const normalizeStation = (name) => name ? name.replace(/[0-9\s]/g, '') : '';

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setAllData(data);
      } catch (error) {
        console.error("Data Load Error:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 800); // 부드러운 로딩 효과
      }
    };
    loadData();
  }, []);

  const filteredResults = useMemo(() => {
    return allData.filter(item => {
      const matchStation = normalizeStation(item.station) === normalizeStation(selection.station);
      const matchType = item.type === selection.type;
      const matchUnit = selection.unit === '전체' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [selection, allData]);

  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    const total = stationData.length;
    const elCount = stationData.filter(d => d.type === 'E/L').length;
    const esCount = stationData.filter(d => d.type === 'E/S').length;
    return {
      total,
      elCount,
      esCount,
      elPct: total ? Math.round((elCount/total)*100) : 0,
      esPct: total ? Math.round((esCount/total)*100) : 0,
      highPriority: stationData.filter(d => d.category === '1.13').length
    };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type)
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  // [디자인 1] 다크 프리미엄 랜딩 페이지
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-[#141519] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        
        <div className="max-w-3xl w-full relative z-10 flex flex-col items-center">
          <div className="mb-8 px-5 py-2 bg-sky-500/5 border border-sky-500/20 rounded-full">
            <span className="text-sky-400 text-[11px] font-black uppercase tracking-[0.3em]">Infrastructure Management System</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1] text-center">
            DTRO <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">승강기 관리</span>
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl mb-16 font-medium max-w-lg text-center leading-relaxed">
            2,213건의 실시간 시정권고 데이터를 기반으로 한 전문 아카이브 시스템입니다.
          </p>
          
          <button 
            onClick={() => setPage('dashboard')} 
            className="group relative px-16 py-6 bg-white text-slate-950 rounded-full font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              조회 시작 <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          
          <div className="mt-32 text-slate-700 text-[11px] font-bold uppercase tracking-[0.4em]">
            DAEGU TRANSPORTATION CORPORATION © 2026
          </div>
        </div>
      </div>
    );
  }

  // [디자인 2] 프리미엄 대시보드 페이지
  return (
    <div className="min-h-screen bg-[#141519] text-[#e8eaf0] font-sans selection:bg-sky-500/30">
      {/* 고정 헤더 */}
      <nav className="bg-[#141519]/80 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setPage('landing')}>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <TrainFront className="text-white" size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest block leading-none mb-1">Archive</span>
              <span className="font-black text-xl tracking-tight text-white">DTRO Archive</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Total Assets</p>
                   <p className="text-sm font-black text-sky-400">2,213 EA</p>
                </div>
             </div>
             <button onClick={() => setPage('landing')} className="text-[11px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em] border border-white/10 px-4 py-2 rounded-lg">Exit</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        {/* 1. 스텝형 필터 섹션 */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
            <h2 className="text-2xl font-black tracking-tight">검사 조건 설정</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Step 01 */}
            <div className="bg-[#1f2230] p-8 space-y-6 hover:bg-[#242838] transition-colors group">
               <div className="flex justify-between items-start">
                  <span className="text-5xl font-black text-white/5 group-hover:text-sky-500/10 transition-colors">01</span>
                  <span className="text-[11px] font-black text-sky-500 uppercase tracking-[0.2em]">Line Selection</span>
               </div>
               <div className="flex gap-2">
                 {Object.keys(lineData).map(line => (
                   <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                     className={`flex-1 py-4 rounded-xl text-xs font-black transition-all border-2 ${selection.line === line ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'bg-[#141519] text-slate-500 border-white/5 hover:border-white/20'}`}>
                     {line}
                   </button>
                 ))}
               </div>
            </div>

            {/* Step 02 */}
            <div className="bg-[#1f2230] p-8 space-y-6 hover:bg-[#242838] transition-colors group">
               <div className="flex justify-between items-start">
                  <span className="text-5xl font-black text-white/5 group-hover:text-sky-500/10 transition-colors">02</span>
                  <span className="text-[11px] font-black text-sky-500 uppercase tracking-[0.2em]">Station</span>
               </div>
               <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
                 className="w-full bg-[#141519] border-2 border-white/5 rounded-xl px-4 py-4 text-sm font-black focus:border-sky-500 outline-none cursor-pointer text-white">
                 {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
               </select>
            </div>

            {/* Step 03 */}
            <div className="bg-[#1f2230] p-8 space-y-6 hover:bg-[#242838] transition-colors group">
               <div className="flex justify-between items-start">
                  <span className="text-5xl font-black text-white/5 group-hover:text-sky-500/10 transition-colors">03</span>
                  <span className="text-[11px] font-black text-sky-500 uppercase tracking-[0.2em]">Equipment</span>
               </div>
               <div className="flex gap-2 mb-4">
                 {['E/L', 'E/S'].map(t => (
                   <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                     className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${selection.type === t ? 'bg-[#e8eaf0] text-[#141519] border-[#e8eaf0]' : 'bg-[#141519] text-slate-500 border-white/5'}`}>
                     {t}
                   </button>
                 ))}
               </div>
               <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
                 className="w-full bg-[#141519] border-2 border-white/5 rounded-xl px-4 py-3 text-xs font-black focus:border-sky-500 outline-none cursor-pointer text-slate-400">
                 {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
               </select>
            </div>
          </div>
        </section>

        {/* 2. 대시보드 메인 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 리스트 영역 (8칸) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-end justify-between px-2">
              <div className="flex items-center gap-3">
                 <History className="text-sky-500" size={24} />
                 <h3 className="text-xl font-black text-white tracking-tight">점검 이력 타임라인</h3>
              </div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{filteredResults.length}건의 기록</span>
            </div>
            
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
                <div key={item.id} className={`group relative pl-12 transition-all`}>
                  {/* 타임라인 점 */}
                  <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-4 border-[#141519] flex items-center justify-center z-10 transition-all ${idx === 0 ? 'bg-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-110' : 'bg-[#242838]'}`}>
                     {idx === 0 ? <Zap size={14} className="text-white" /> : <div className="w-2 h-2 bg-slate-600 rounded-full"></div>}
                  </div>

                  <div className={`bg-[#1f2230] p-8 rounded-[2rem] border transition-all ${idx === 0 ? 'border-sky-500/50 bg-[#1f2230] shadow-2xl' : 'border-white/5 hover:border-white/10'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sky-400 font-black text-sm uppercase tracking-tighter">
                          <Calendar size={14}/> {item.date}
                        </div>
                        <div className="font-black text-white text-lg opacity-90">
                          {item.station}역 <span className="text-slate-500 mx-2">|</span> {item.unit}
                        </div>
                      </div>
                      <div className="bg-white/5 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/5">
                        CODE {item.category}
                      </div>
                    </div>
                    <p className="font-bold text-slate-300 text-[16px] leading-[1.7] break-keep">
                      {item.content}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-32 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5">
                   <p className="text-slate-600 font-black text-xl">조회된 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 통계 사이드바 (4칸) */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[#1f2230] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl sticky top-32">
              <h3 className="text-xs font-black text-sky-500 mb-10 uppercase tracking-[0.3em] flex items-center gap-2">
                <BarChart2 size={16} /> {selection.station} 분석 리포트
              </h3>
              
              <div className="space-y-10">
                {/* 메인 카운트 */}
                <div className="relative">
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Inspections</p>
                   <p className="text-6xl font-black text-white tracking-tighter">{stationStats.total}<span className="text-lg font-medium ml-2 text-slate-600">건</span></p>
                   <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-full blur-2xl"></div>
                </div>
                
                {/* 프로그레스 바 영역 */}
                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black">
                         <span className="text-sky-400">Elevator (E/L)</span>
                         <span>{stationStats.elPct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all duration-1000" style={{ width: `${stationStats.elPct}%` }}></div>
                      </div>
                      <p className="text-right text-[10px] text-slate-600 font-bold">{stationStats.elCount}건 기록됨</p>
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black">
                         <span className="text-teal-400">Escalator (E/S)</span>
                         <span>{stationStats.esPct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] transition-all duration-1000" style={{ width: `${stationStats.esPct}%` }}></div>
                      </div>
                      <p className="text-right text-[10px] text-slate-600 font-bold">{stationStats.esCount}건 기록됨</p>
                   </div>
                </div>

                {/* 위험 관리 항목 */}
                <div className="p-8 bg-gradient-to-br from-red-500/10 to-transparent rounded-[2rem] border border-red-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">High Priority (1.13)</p>
                    <p className="text-3xl font-black text-white">{stationStats.highPriority}<span className="text-sm ml-1 opacity-40 text-white">건</span></p>
                  </div>
                  <AlertCircle size={32} className="text-red-500/50" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-white/5 py-12 px-6 mt-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
            <span className="text-[11px] font-black tracking-[0.3em] uppercase">Daegu Transportation Corporation</span>
            <span className="text-[10px] font-bold">Safety First & Tech Driven Archive System © 2026</span>
         </div>
      </footer>
    </div>
  );
};

export default App;
