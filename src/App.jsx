import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 대구교통공사 최신 노선 데이터 (연장 구간 및 명칭 변경 반영)
  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '서부정류장', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구', '칠성시장', '신천', '동대구', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심', '대구한의대병원', '부호', '하양'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '수성알파시티', '고산', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  // 역명 통합 및 정규화 회로 (과거 데이터 호환성 유지)
  const normalizeStation = (name) => {
    if (!name) return '';
    let n = String(name).replace(/[0-9\s]/g, '');
    if (n.endsWith('역')) n = n.slice(0, -1); 

    // 역명 변경 및 통합 매핑
    if (n === '성당못') return '서부정류장';
    if (n === '대공원') return '수성알파시티';
    return n;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setAllData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Data Load Error", e);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
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
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [selection, allData]);

  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    const total = stationData.length;
    return {
      total,
      highPriority: stationData.filter(d => d.category === '1.13').length
    };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type)
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#141519] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        
        <div className="max-w-2xl w-full relative z-10">
          <div className="mb-6 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full inline-block">
            <span className="text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]">Infrastructure Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            DTRO <span className="text-sky-500">승강기 관리</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-16 font-medium leading-relaxed">
            실제 검사 데이터 {allData.length}건 기반 운영 중
          </p>
          <button 
            onClick={() => setPage('dashboard')} 
            className="px-16 py-5 bg-white text-slate-900 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto shadow-2xl"
          >
            조회 시작 <ChevronRight />
          </button>
          <div className="mt-32 text-slate-700 text-[10px] font-bold uppercase tracking-[0.4em]">
            DAEGU TRANSPORTATION CORPORATION © 2026
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141519] text-[#e8eaf0] font-sans">
      <nav className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}>
            <Monitor className="text-sky-500" size={20} />
            <span className="font-black text-lg tracking-tight">DTRO Archive</span>
          </div>
          <button onClick={() => setPage('landing')} className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg">Exit</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
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
              className="w-full bg-[#141519] border-2 border-white/5 rounded-xl px-4 py-3 text-sm font-black focus:border-sky-500 outline-none text-white cursor-pointer">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">03. Equipment Unit</label>
            <div className="flex gap-2">
              <div className="flex-[1] flex gap-1 p-1 bg-[#141519] rounded-xl">
                {['E/L', 'E/S'].map(t => (
                  <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all ${selection.type === t ? 'bg-[#e8eaf0] text-slate-900 shadow-md' : 'text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
                className="flex-[1.5] bg-[#141519] border-2 border-white/5 rounded-xl px-2 text-[10px] font-black focus:border-sky-500 outline-none text-slate-300">
                {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <History className="text-sky-500" size={20} />
              <h3 className="text-xl font-black text-white tracking-tight">상세 내역</h3>
              <span className="text-[10px] font-black text-slate-500 ml-auto uppercase tracking-widest">{filteredResults.length} Records Found</span>
            </div>
            <div className="space-y-4">
              {filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-[#1f2230] p-7 rounded-[1.5rem] border transition-all ${idx === 0 ? 'border-sky-500 shadow-2xl shadow-sky-500/10' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-start mb-5 pb-5 border-b border-white/5">
                    <div className="space-y-1">
                      <div className="text-sky-400 font-black text-xs flex items-center gap-1.5 uppercase"><Calendar size={14}/> {item.date}</div>
                      <div className="font-black text-white text-lg opacity-90">{selection.station}역 <span className="text-slate-600 mx-1">|</span> {item.unit}</div>
                    </div>
                    <div className="bg-white/5 text-slate-400 px-3 py-1 rounded-md text-[9px] font-black tracking-widest border border-white/5 uppercase">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-300 text-[15px] leading-relaxed break-keep">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <section className="bg-[#1f2230] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-28">
              <h3 className="text-[11px] font-black text-sky-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5 pb-4"><BarChart2 size={16} /> 분석 리포트</h3>
              <div className="space-y-10">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Inspections</p>
                   <p className="text-5xl font-black text-white tracking-tighter">{stationStats.total}<span className="text-sm font-medium ml-1 opacity-20">건</span></p>
                </div>
                <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Priority 1.13</p>
                    <p className="text-2xl font-black text-white">{stationStats.highPriority}<span className="text-xs ml-1 opacity-30">건</span></p>
                  </div>
                  <Zap size={28} className="text-blue-500/30 fill-blue-500/10" />
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
