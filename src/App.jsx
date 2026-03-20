import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight, Lock, X, LogOut, CheckCircle } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState(() => {
    return localStorage.getItem('dtro_auth') === 'true' ? 'dashboard' : 'landing';
  });
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  
  const ADMIN_PASSWORD = "3650"; 

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '서부정류장', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구', '칠성시장', '신천', '동대구', '동구청', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심', '대구한의대병원', '부호', '하양'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '수성알파시티', '고산', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      localStorage.setItem('dtro_auth', 'true');
      setIsPwModalOpen(false);
      setPage('dashboard');
      setPwInput("");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
      setPwInput("");
    }
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
      const matchUnit = selection.unit === '전체' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [selection, allData]);

  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    return {
      elCount: stationData.filter(d => d.type === 'E/L').length,
      esCount: stationData.filter(d => d.type === 'E/S').length
    };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type)
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-2xl w-full relative z-10">
          <div className="mb-8 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-block">
            <span className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">DTRO Management System</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[1.1]">
            DTRO <br />
            <span className="text-indigo-500">승강기 관리</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-16 font-medium leading-relaxed text-balance">
            실제 검사 데이터 기반 운영 중
          </p>
          <button onClick={() => setIsPwModalOpen(true)} className="group px-20 py-6 bg-white text-slate-950 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto shadow-2xl">
            조회 시작 <Lock size={22} className="text-red-500" />
          </button>
          <div className="mt-32 text-slate-800 text-[10px] font-bold uppercase tracking-[0.4em]">
            DAEGU TRANSPORTATION CORPORATION © 2026
          </div>
        </div>
        {isPwModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
            <div className="bg-slate-800/80 backdrop-blur-2xl w-full max-w-sm rounded-[3rem] p-12 border border-white/10 shadow-3xl relative animate-in fade-in zoom-in duration-300">
              <button onClick={() => {setIsPwModalOpen(false); setPwInput("");}} className="absolute top-8 right-8 text-slate-600 hover:text-white"><X size={28}/></button>
              <h3 className="text-white font-black text-2xl mb-2">비밀번호 입력</h3>
              <p className="text-slate-600 text-xs mb-10 uppercase tracking-widest font-bold">Authenticated Access Only</p>
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <input autoFocus type="password" inputMode="numeric" pattern="[0-9]*" value={pwInput} onChange={(e) => setPwInput(e.target.value)} placeholder="••••" className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl py-6 text-center text-4xl font-black text-indigo-500 tracking-[0.6em] focus:border-indigo-600 outline-none transition-all placeholder:text-slate-900"/>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-900/20">확인</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      <nav className="bg-slate-900/40 backdrop-blur-2xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Monitor className="text-white" size={20} /></div>
            <span className="font-black text-xl tracking-tight text-white">DTRO Archive</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest border border-white/5 px-5 py-2.5 rounded-xl transition-all"><LogOut size={16}/> Logout</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 01. Line Selection */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-6 rounded-[2.5rem] space-y-4 shadow-xl">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block">01. Line Selection</label>
            <div className="relative flex p-1 bg-slate-950/50 rounded-2xl overflow-hidden h-12">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-xl transition-transform duration-300 ease-out shadow-lg ${selection.line === '2호선' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
              />
              <button 
                onClick={() => setSelection({...selection, line: '1호선', station: lineData['1호선'][0], unit: '전체'})}
                className={`relative z-10 flex-1 text-[11px] font-black transition-colors duration-300 ${selection.line === '1호선' ? 'text-white' : 'text-slate-500'}`}
              >1호선</button>
              <button 
                onClick={() => setSelection({...selection, line: '2호선', station: lineData['2호선'][0], unit: '전체'})}
                className={`relative z-10 flex-1 text-[11px] font-black transition-colors duration-300 ${selection.line === '2호선' ? 'text-white' : 'text-slate-500'}`}
              >2호선</button>
            </div>
          </div>

          {/* 02. Station Name */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-6 rounded-[2.5rem] space-y-4 shadow-xl">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block">02. Station Name</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})} className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 text-sm font-black focus:border-indigo-600 outline-none text-white text-center cursor-pointer appearance-none">
              {lineData[selection.line].map(s => <option key={s} value={s} className="bg-slate-900">{s}역</option>)}
            </select>
          </div>

          {/* 03. Equipment & Unit */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-6 rounded-[2.5rem] space-y-4 shadow-xl">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block">03. Equipment & Unit</label>
            <div className="flex gap-2">
              <div className="relative flex p-1 bg-slate-950/50 rounded-2xl overflow-hidden h-12 flex-1">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-xl transition-transform duration-300 ease-out shadow-lg ${selection.type === 'E/S' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                />
                <button 
                  onClick={() => setSelection({...selection, type: 'E/L', unit: '전체'})}
                  className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${selection.type === 'E/L' ? 'text-white' : 'text-slate-500'}`}
                >E/L</button>
                <button 
                  onClick={() => setSelection({...selection, type: 'E/S', unit: '전체'})}
                  className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${selection.type === 'E/S' ? 'text-white' : 'text-slate-500'}`}
                >E/S</button>
              </div>
              {/* 호기 선택: 중앙 정렬 및 화이트 텍스트 적용 */}
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})} className="flex-[1.2] bg-slate-950/50 border-2 border-white/5 rounded-2xl px-2 text-[10px] font-black focus:border-indigo-600 outline-none text-white text-center appearance-none cursor-pointer">
                {availableUnits.map(u => <option key={u} value={u} className="bg-slate-900">{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* 선택 역사 점검 요약 */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-indigo-400" />
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap">역사 요약</span>
          </div>
          <div className="flex gap-6 items-center text-white">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Elevator</span>
              <p className={`text-xl font-black transition-colors ${stationStats.elCount === 0 ? 'text-slate-600' : 'text-white'}`}>
                {stationStats.elCount}<span className="text-[10px] ml-1 opacity-20">건</span>
              </p>
            </div>
            <div className="w-[1px] h-6 bg-white/10"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Escalator</span>
              <p className={`text-xl font-black transition-colors ${stationStats.esCount === 0 ? 'text-slate-600' : 'text-white'}`}>
                {stationStats.esCount}<span className="text-[10px] ml-1 opacity-20">건</span>
              </p>
            </div>
          </div>
        </section>

        {/* 상세 내역 리스트 */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-3">
            <History className="text-indigo-400" size={24} />
            <h3 className="text-2xl font-black text-white tracking-tight">상세 내역</h3>
            <span className="text-[11px] font-black text-slate-600 ml-auto uppercase tracking-widest">{filteredResults.length} Records</span>
          </div>
          <div className="space-y-4 pb-20">
            {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
              <div key={item.id} className={`bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border transition-all ${idx === 0 ? 'border-indigo-500/50 shadow-2xl shadow-indigo-900/20' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex justify-between items-start mb-5 pb-5 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="text-indigo-400 font-black text-xs flex items-center gap-2 uppercase tracking-tight"><Calendar size={14}/> {item.date}</div>
                    <div className="font-black text-white text-lg opacity-90">{selection.station}역 <span className="text-slate-700 mx-1">|</span> {item.unit}</div>
                  </div>
                  <div className="bg-slate-950/40 text-slate-300 px-3 py-1 rounded-md text-[9px] font-black tracking-widest border border-white/5 uppercase">CODE {item.category}</div>
                </div>
                <p className="font-bold text-slate-300 text-[16px] leading-[1.8] break-keep">{item.content}</p>
              </div>
            )) : (
              <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/10 text-slate-600 font-bold">데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
