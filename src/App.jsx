import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// 필수 차트 부품만 등록 (최소화)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  // [차트 데이터] 역사별 상위 5개만 추출 (경량화)
  const barChartData = useMemo(() => {
    if (!allData.length) return null;
    const stations = {};
    allData.forEach(d => { 
        const name = normalizeStation(d.station);
        stations[name] = (stations[name] || 0) + 1; 
    });
    const top5 = Object.entries(stations).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      labels: top5.map(s => s[0]),
      datasets: [{
        label: '시정권고 건수',
        data: top5.map(s => s[1]),
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderRadius: 10,
      }]
    };
  }, [allData]);

  const filteredResults = useMemo(() => {
    return allData.filter(item => {
      const matchStation = normalizeStation(item.station) === normalizeStation(selection.station);
      const matchType = item.type === selection.type;
      const matchUnit = selection.unit === '전체' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [selection, allData]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#141519] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-[#141519] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
          <div className="mb-6 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]">Infrastructure Management</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight text-center">DTRO <span className="text-sky-500">승강기 관리</span></h1>
          <p className="text-slate-500 text-lg md:text-xl mb-16 font-medium text-center leading-relaxed">실제 시정권고 데이터 {allData.length}건 기반 운영 중</p>
          <button onClick={() => setPage('dashboard')} className="group px-16 py-5 bg-white text-slate-950 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-2">조회 시작 <ChevronRight className="group-hover:translate-x-1 transition-transform" /></button>
          <div className="mt-32 text-slate-700 text-[10px] font-bold uppercase tracking-[0.4em]">DAEGU TRANSPORTATION CORPORATION © 2026</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141519] text-[#e8eaf0] font-sans">
      <nav className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}><Monitor className="text-sky-500" size={20} /><span className="font-black text-lg tracking-tight">DTRO Archive</span></div>
          <button onClick={() => setPage('landing')} className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg">Exit</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        {/* 상단 통합 차트 카드 (1개로 축소) */}
        <section className="bg-[#1f2230] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                 <h4 className="text-sm font-black text-sky-500 flex items-center gap-2 uppercase tracking-widest"><Activity size={16}/> 점검 빈도 분석</h4>
                 <p className="text-xs text-slate-500 mt-1">시정권고가 가장 많이 발생한 상위 5개 역사입니다.</p>
              </div>
              <div className="bg-[#141519] px-4 py-2 rounded-xl border border-white/5">
                 <span className="text-[10px] font-bold text-slate-600 block uppercase">Total Records</span>
                 <span className="text-lg font-black text-white">{allData.length}건</span>
              </div>
           </div>
           <div className="h-48 md:h-64">
              {barChartData && <Bar data={barChartData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { color: '#9ba3b8', font: { size: 12, weight: 'bold' } }, grid: { display: false } } } }} />}
           </div>
        </section>

        {/* 필터 섹션 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">01. Line</label>
            <div className="flex gap-1 p-1 bg-[#141519] rounded-xl">
              {Object.keys(lineData).map(line => (
                <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${selection.line === line ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{line}</button>
              ))}
            </div>
          </div>
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">02. Station</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
              className="w-full bg-[#141519] border-2 border-white/5 rounded-xl px-4 py-3 text-sm font-black focus:border-sky-500 outline-none text-white cursor-pointer">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="bg-[#1f2230] p-8 space-y-4">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">03. Unit</label>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-1 p-1 bg-[#141519] rounded-xl">
                {['E/L', 'E/S'].map(t => (
                  <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all ${selection.type === t ? 'bg-[#e8eaf0] text-slate-900 shadow-md' : 'text-slate-500'}`}>{t}</button>
                ))}
              </div>
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
                className="flex-[1.5] bg-[#141519] border-2 border-white/5 rounded-xl px-2 text-[10px] font-black focus:border-sky-500 outline-none text-slate-300">
                {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* 리스트 영역 */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <History className="text-sky-500" size={20} />
              <h3 className="text-xl font-black text-white tracking-tight">상세 내역</h3>
              <span className="text-[10px] font-black text-slate-500 ml-auto uppercase tracking-widest">{filteredResults.length} Records Found</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-[#1f2230] p-6 rounded-[2rem] border transition-all ${idx === 0 ? 'border-sky-500 shadow-2xl shadow-sky-500/10' : 'border-white/5'}`}>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                    <div className="text-sky-400 font-black text-xs flex items-center gap-1.5 uppercase"><Calendar size={12}/> {item.date}</div>
                    <div className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-300 text-sm leading-relaxed mb-4 break-keep">{item.content}</p>
                  <div className="text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest"><MapPin size={10}/> {item.station}역 | {item.unit}</div>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5 text-center text-slate-600 font-bold">해당 조건의 데이터가 없습니다.</div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
