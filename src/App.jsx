import React, { useState, useMemo, useEffect } from 'react';
import { Search, BarChart2, Calendar, Layers, Monitor, MapPin, Database, Zap, ChevronRight, TrainFront, History, AlertCircle } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '성당못', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구역', '칠성시장', '신천', '동대구역', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '대공원', '고산', '수성알파시티', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  const normalizeStation = (name) => name ? name.replace(/[0-9\s]/g, '') : '';

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) throw new Error("Data not found");
        const data = await response.json();
        setAllData(data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        // 부드러운 전환을 위해 약간의 지연 후 로딩 해제
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    loadData();
  }, []);

  const filteredResults = useMemo(() => {
    if (!allData.length) return [];
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

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141519] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sky-500 font-black tracking-widest text-[10px] uppercase">Initializing Archive...</p>
      </div>
    );
  }

  // 메인 페이지 (아이콘 제거 및 미니멀 디자인)
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-[#141519] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px]"></div>
        <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
          <div className="mb-6 px-4 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
            <span className="text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]">Infrastructure Archive</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight text-center">
            DTRO <span className="text-sky-500">승강기 관리</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-16 font-medium text-center leading-relaxed">
            실제 시정권고 데이터 {allData.length}건 기반 운영 중
          </p>
          <button onClick={() => setPage('dashboard')} className="group px-16 py-5 bg-white text-slate-950 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
            <span className="flex items-center gap-2">조회 시작 <ChevronRight className="group-hover:translate-x-1 transition-transform" /></span>
          </button>
          <div className="mt-32 text-slate-700 text-[10px] font-bold uppercase tracking-[0.4em]">
            DAEGU TRANSPORTATION CORPORATION © 2026
          </div>
        </div>
      </div>
    );
  }

  // 대시보드 페이지 (프리미엄 다크 레이아웃)
  return (
    <div className="min-h-screen bg-[#141519] text-[#e8eaf0] font-sans">
      <nav className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}>
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Monitor className="text-white" size={16} />
            </div>
            <span className="font-black text-lg tracking-tight text-white">DTRO Archive</span>
          </div>
          <button onClick={() => setPage('landing')} className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg">Exit</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        {/* 필터 섹션 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">01. Line Selection</label>
            <div className="flex gap-2 p-1 bg-[#141519] rounded-xl">
              {Object.keys(lineData).map(line => (
                <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                  className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${selection.line === line ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                  {line}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">02. Station Name</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
              className="w-full bg-[#141519] border-2 border-white/5 rounded-xl px-4 py-3 text-sm font-black focus:border-sky-500 outline-none cursor-pointer">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">03. Equipment & Unit</label>
            <div className="flex gap-2">
              {['E/L', 'E/S'].map(t => (
                <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                  className={`flex-1 py-3 rounded-lg text-xs font-black border-2 transition-all ${selection.type === t ? 'bg-[#e8eaf0] text-slate-900 border-[#e8eaf0]' : 'bg-[#141519] text-slate-500 border-white/5'}`}>
                  {t}
                </button>
              ))}
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
                className="flex-[1.5] bg-[#141519] border-2 border-white/5 rounded-lg px-2 text-[11px] font-black focus:border-sky-500 outline-none">
                {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 리스트 영역 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <History className="text-sky-500" size={20} />
              <h3 className="text-xl font-black text-white tracking-tight">상세 내역 타임라인</h3>
              <span className="text-[10px] font-black text-slate-500 ml-auto">{filteredResults.length} Records</span>
            </div>
            <div className="space-y-4">
              {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-[#1f2230] p-7 rounded-[1.5rem] border transition-all ${idx === 0 ? 'border-sky-500 shadow-2xl shadow-sky-500/10' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                    <div className="space-y-1">
                      <div className="text-sky-400 font-black text-xs flex items-center gap-1.5 uppercase"><Calendar size={14}/> {item.date}</div>
                      <div className="font-black text-white text-base opacity-90">{item.station}역 | {item.unit}</div>
                    </div>
                    <div className="bg-white/5 text-slate-400 px-3 py-1 rounded-md text-[9px] font-black tracking-widest border border-white/5">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-300 text-[15px] leading-relaxed break-keep">{item.content}</p>
                </div>
              )) : (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5 text-slate-600 font-black">데이터가 없습니다.</div>
              )}
            </div>
          </div>

          {/* 통계 사이드바 */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-[#1f2230] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-28">
              <h3 className="text-[11px] font-black text-sky-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-2"><BarChart2 size={16} /> {selection.station} 분석</h3>
              <div className="space-y-8">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Items</p>
                   <p className="text-5xl font-black text-white">{stationStats.total}<span className="text-sm font-medium ml-1 opacity-30">건</span></p>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black"><span className="text-sky-400">E/L Ratio</span><span>{stationStats.elPct}%</span></div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${stationStats.elPct}%` }}></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black"><span className="text-teal-400">E/S Ratio</span><span>{stationStats.esPct}%</span></div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${stationStats.esPct}%` }}></div>
                      </div>
                   </div>
                </div>
                <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Priority 1.13</p>
                    <p className="text-2xl font-black text-white">{stationStats.highPriority}<span className="text-xs ml-1 opacity-40">건</span></p>
                  </div>
                  <AlertCircle size={24} className="text-red-500/40" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
