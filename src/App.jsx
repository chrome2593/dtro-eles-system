import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '성당못', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구역', '칠성시장', '신천', '동대구역', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '대공원', '고산', '수성알파시티', '신매', '사월', '정평', '임당', '영남대']
  };

  const normalizeStation = (name) => name ? String(name).replace(/[0-9\s]/g, '') : '';

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setAllData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Data Load Error", e);
      } finally {
        setIsLoading(false);
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

  if (isLoading) return <div className="min-h-screen bg-[#141519] flex items-center justify-center"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="max-w-2xl w-full relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">DTRO 승강기 관리</h1>
          <p className="text-slate-400 text-lg mb-12 font-medium">실제 데이터 {allData.length}건 기반 운영 중</p>
          <button onClick={() => setPage('dashboard')} className="px-16 py-5 bg-white text-slate-900 rounded-full font-black text-xl hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto">조회 시작 <ChevronRight /></button>
          <div className="mt-20 text-slate-600 text-[10px] font-bold uppercase tracking-widest opacity-50">DAEGU TRANSPORTATION CORPORATION © 2026</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 p-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}><Monitor className="text-blue-600" size={20} /><span className="font-black text-lg tracking-tight">DTRO Archive</span></div>
          <button onClick={() => setPage('landing')} className="text-xs font-black text-slate-400 uppercase tracking-widest">Exit</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-5 md:p-8">
        <section className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm mb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">01. Line</label>
            <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">{Object.keys(lineData).map(line => (<button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${selection.line === line ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>{line}</button>))}</div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">02. Station</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none">{lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}</select>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">03. Type</label>
            <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">{['E/L', 'E/S'].map(t => (<button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${selection.type === t ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>{t}</button>))}</div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">04. Unit</label>
            <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none">{availableUnits.map(u => <option key={u} value={u}>{u}</option>)}</select>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xl font-black text-slate-900 px-1 mb-4">상세 내역 <span className="text-sm font-bold text-slate-400 ml-2">{filteredResults.length}건</span></h3>
            {filteredResults.map((item, idx) => (
              <div key={item.id} className={`bg-white p-6 rounded-2xl border transition-all ${idx === 0 ? 'border-blue-500 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-50">
                  <div className="space-y-1"><div className="text-blue-600 font-black text-xs flex items-center gap-1.5"><Calendar size={14}/> {item.date}</div><div className="font-black text-slate-800 text-sm opacity-90">{item.station}역 | {item.unit}</div></div>
                  <div className="bg-slate-50 text-slate-400 px-2 py-1 rounded text-[9px] font-black tracking-widest border border-slate-100 uppercase">CODE {item.category}</div>
                </div>
                <p className="font-bold text-slate-600 text-sm leading-relaxed break-keep">{item.content}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <section className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm sticky top-28">
              <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-widest">{selection.station} 통계</h3>
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-2xl text-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Records</p>
                  <p className="text-3xl font-black">{stationStats.total}건</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Priority (1.13)</p><p className="text-2xl font-black text-blue-600">{stationStats.highPriority}건</p></div>
                  <Zap size={24} className="text-blue-200 fill-blue-200" />
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
