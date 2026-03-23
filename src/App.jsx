import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, History, Zap, ChevronRight, Lock, X, LogOut, CheckCircle, PieChart, Info } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const ADMIN_PASSWORD = "3650"; 

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '서부정류장', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구', '칠성시장', '신천', '동대구', '동구청', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심', '대구한의대병원', '부호', '하양'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '수성알파시티', '고산', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '호기 선택' });

  const normalizeStation = (name) => {
    if (!name) return '';
    let n = String(name).replace(/[0-9\s]/g, '');
    if (n.endsWith('역')) n = n.slice(0, -1); 
    if (n === '성당못') return '서부정류장';
    if (n === '대공원') return '수성알파시티';
    if (n === '큰고개') return '동구청';
    return n;
  };

  useEffect(() => {
    const auth = localStorage.getItem('dtro_auth');
    if (auth === 'true') setPage('dashboard');

    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setAllData(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); } finally { setTimeout(() => setIsLoading(false), 500); }
    };
    loadData();
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      localStorage.setItem('dtro_auth', 'true');
      setIsPwModalOpen(false);
      setPage('dashboard');
      setPwInput("");
    } else { alert("비밀번호가 일치하지 않습니다."); setPwInput(""); }
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('dtro_auth');
      setPage('landing');
    }
  };

  const filteredResults = useMemo(() => {
    return allData.filter(item => {
      const matchStation = normalizeStation(item.station) === normalizeStation(selection.station);
      const matchType = item.type === selection.type;
      const matchUnit = selection.unit === '호기 선택' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [selection, allData]);

  const chartColors = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

  const stationChartData = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    const counts = {};
    stationData.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: sortedEntries.map(e => e[0]),
      values: sortedEntries.map(e => e[1]),
      datasets: [{ data: sortedEntries.map(e => e[1]), backgroundColor: chartColors, borderColor: '#fff', borderWidth: 2 }],
    };
  }, [selection.station, allData]);

  const representativeContent = useMemo(() => {
    if (!hoveredCategory) return null;
    const match = allData.find(d => normalizeStation(d.station) === normalizeStation(selection.station) && d.category === hoveredCategory);
    return match ? match.content : null;
  }, [hoveredCategory, selection.station, allData]);

  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    return { elCount: stationData.filter(d => d.type === 'E/L').length, esCount: stationData.filter(d => d.type === 'E/S').length };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type).map(item => item.unit);
    return ['호기 선택', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-2xl w-full relative z-10">
          <div className="mb-8 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-block"><span className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">DTRO Management System</span></div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[1.1]">DTRO <br /><span className="text-indigo-500">승강기 관리</span></h1>
          <p className="text-slate-400 text-lg md:text-xl mb-16 font-medium leading-relaxed">실제 검사 데이터 기반 운영 중</p>
          <button onClick={() => setIsPwModalOpen(true)} className="group px-20 py-6 bg-white text-slate-950 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto shadow-2xl">조회 시작 <Lock size={22} className="text-red-500" /></button>
          <div className="mt-32 text-slate-800 text-[10px] font-bold uppercase tracking-[0.4em]">DAEGU TRANSPORTATION CORPORATION © 2026</div>
        </div>
        {isPwModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
            <div className="bg-slate-800/80 backdrop-blur-2xl w-full max-w-[320px] rounded-[2.5rem] p-8 border border-white/10 shadow-3xl relative animate-in fade-in zoom-in duration-300">
              <button onClick={() => {setIsPwModalOpen(false); setPwInput("");}} className="absolute top-6 right-6 text-slate-600 hover:text-white"><X size={20}/></button>
              <h3 className="text-white font-black text-lg mb-1">비밀번호 입력</h3>
              <p className="text-slate-600 text-[9px] mb-6 uppercase tracking-widest font-bold">Access Verification</p>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <input autoFocus type="password" inputMode="numeric" pattern="[0-9]*" value={pwInput} onChange={(e) => setPwInput(e.target.value)} placeholder="••••" className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl py-4 text-center text-2xl font-black text-indigo-500 tracking-[0.6em] focus:border-indigo-600 outline-none placeholder:text-slate-900"/>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-colors shadow-lg">확인</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200"><Monitor className="text-white" size={20} /></div><span className="font-black text-xl tracking-tight text-slate-900">DTRO Archive</span></div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest border border-slate-200 px-5 py-2.5 rounded-xl transition-all"><LogOut size={16}/> Logout</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 py-4 px-6 rounded-[2.5rem] space-y-4 shadow-sm">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block">01. Line Selection</label>
            <div className="relative flex p-1 bg-slate-100 rounded-2xl overflow-hidden h-12">
              <div className="absolute top-1 bottom-1 bg-white rounded-xl transition-all duration-300 ease-out shadow-sm border border-slate-200/50" style={{ left: selection.line === '2호선' ? 'calc(50% + 2px)' : '4px', width: 'calc(50% - 6px)' }} />
              <button onClick={() => setSelection({...selection, line: '1호선', station: lineData['1호선'][0], unit: '호기 선택'})} className={`relative z-10 flex-1 text-[11px] font-black transition-colors duration-300 ${selection.line === '1호선' ? 'text-indigo-600' : 'text-slate-400'}`}>1호선</button>
              <button onClick={() => setSelection({...selection, line: '2호선', station: lineData['2호선'][0], unit: '호기 선택'})} className={`relative z-10 flex-1 text-[11px] font-black transition-colors duration-300 ${selection.line === '2호선' ? 'text-indigo-600' : 'text-slate-400'}`}>2호선</button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 py-4 px-6 rounded-[2.5rem] space-y-4 shadow-sm">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block">02. Station Name</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '호기 선택'})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black focus:border-indigo-600 outline-none text-slate-900 text-center cursor-pointer appearance-none">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200 py-4 px-6 rounded-[2.5rem] space-y-4 shadow-sm">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block">03. Equipment & Unit</label>
            <div className="flex gap-2">
              <div className="relative flex p-1 bg-slate-100 rounded-2xl overflow-hidden h-12 flex-1">
                <div className="absolute top-1 bottom-1 bg-white rounded-xl transition-all duration-300 ease-out shadow-sm border border-slate-200/50" style={{ left: selection.type === 'E/S' ? 'calc(50% + 2px)' : '4px', width: 'calc(50% - 6px)' }} />
                <button onClick={() => setSelection({...selection, type: 'E/L', unit: '호기 선택'})} className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${selection.type === 'E/L' ? 'text-indigo-600' : 'text-slate-400'}`}>E/L</button>
                <button onClick={() => setSelection({...selection, type: 'E/S', unit: '호기 선택'})} className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${selection.type === 'E/S' ? 'text-indigo-600' : 'text-slate-400'}`}>E/S</button>
              </div>
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})} className="flex-[1.2] bg-slate-50 border border-slate-200 rounded-2xl px-2 text-[10px] font-black focus:border-indigo-600 outline-none text-slate-900 text-center appearance-none cursor-pointer">
                {availableUnits.map(u => <option key={u} value={u} className="bg-white text-slate-900">{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-white border border-slate-200 py-6 px-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8"><CheckCircle size={18} className="text-indigo-600" /><span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">역사 점검 요약</span></div>
            <div className="flex justify-around items-center">
              {/* [수정] 수치 크기를 text-4xl -> text-3xl로, '건' 단위를 text-base로 축소 */}
              <div className="text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Elevator</span><p className={`text-3xl font-black ${stationStats.elCount === 0 ? 'text-slate-200' : 'text-slate-900'}`}>{stationStats.elCount}<span className="text-base ml-1 font-bold">건</span></p></div>
              <div className="w-[1px] h-12 bg-slate-100"></div>
              <div className="text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Escalator</span><p className={`text-3xl font-black ${stationStats.esCount === 0 ? 'text-slate-200' : 'text-slate-900'}`}>{stationStats.esCount}<span className="text-base ml-1 font-bold">건</span></p></div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 py-6 px-8 rounded-[2.5rem] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6"><PieChart size={18} className="text-indigo-600" /><span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">[{selection.station}역] 검사항목 비중</span></div>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 flex-shrink-0">
                <Doughnut data={stationChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%', onHover: (evt, elements) => { if (elements.length > 0) setHoveredCategory(stationChartData.labels[elements[0].index]); else setHoveredCategory(null); } }} />
              </div>
              <div className="flex-1 space-y-1.5 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {stationChartData.labels.map((label, i) => (
                  <div key={label} onMouseEnter={() => setHoveredCategory(label)} onMouseLeave={() => setHoveredCategory(null)} className={`flex items-center justify-between p-1 rounded-md transition-all ${hoveredCategory === label ? 'bg-indigo-50' : ''}`}>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }}></div><span className="text-[9px] font-bold text-slate-500">검사항목 {label}</span></div>
                    <span className="text-[10px] font-black text-slate-800">{stationChartData.values[i]}건</span>
                  </div>
                ))}
              </div>
            </div>
            {hoveredCategory && (
              <div className="mt-4 p-4 rounded-2xl border bg-indigo-50 border-indigo-100 shadow-inner animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 mb-1.5"><Info size={12} className="text-indigo-500" /><span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600">검사항목 {hoveredCategory} 대표 내역</span></div>
                <p className="text-[11px] leading-relaxed break-keep text-indigo-900 font-medium">{representativeContent}</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 px-3"><History className="text-indigo-600" size={24} /><h3 className="text-lg font-black text-slate-900 tracking-tight">상세 내역 - {selection.station}역</h3></div>
          <div className="space-y-4 pb-20">
            {filteredResults.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start mb-5 pb-5 border-b border-slate-100">
                  <div className="space-y-1"><div className="text-indigo-600 font-black text-xs flex items-center gap-2 uppercase tracking-tight"><Calendar size={14}/> {item.date}</div><div className="font-black text-slate-800 text-lg opacity-90">{item.unit}</div></div>
                  <div className="bg-slate-50 text-slate-400 px-3 py-1 rounded-md text-[9px] font-black tracking-widest border border-slate-200 uppercase">검사항목 {item.category}</div>
                </div>
                <p className="font-bold text-slate-600 text-[16px] leading-[1.8] break-keep">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 2px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }`}</style>
    </div>
  );
};

export default App;
