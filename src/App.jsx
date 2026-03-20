import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight, Lock, X } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 보안 설정
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const ADMIN_PASSWORD = "3650"; 

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '서부정류장', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구', '칠성시장', '신천', '동대구', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심', '대구한의대병원', '부호', '하양'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '수성알파시티', '고산', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  const normalizeStation = (name) => {
    if (!name) return '';
    let n = String(name).replace(/[0-9\s]/g, '');
    if (n.endsWith('역')) n = n.slice(0, -1); 
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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setIsPwModalOpen(false);
      setPage('dashboard');
      setPwInput("");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
      setPwInput("");
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
      total: stationData.length,
      highPriority: stationData.filter(d => d.category === '1.13').length
    };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type)
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div></div>;

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center relative overflow-hidden">
        {/* 남색 계열의 배경 효과 */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
        
        <div className="max-w-2xl w-full relative z-10">
          <div className="mb-8 px-5 py-2 bg-blue-800/10 border border-blue-800/20 rounded-full inline-block">
            <span className="text-blue-500 text-[11px] font-black uppercase tracking-[0.3em]">Authorized Personnel Only</span>
          </div>
          
          {/* 제목 줄바꿈 적용 */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[1.1]">
            DTRO <br />
            <span className="text-blue-700">승강기 관리</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl mb-16 font-medium leading-relaxed">
            실제 검사 데이터 기반 운영 중
          </p>
          
          <button 
            onClick={() => setIsPwModalOpen(true)} 
            className="group px-20 py-6 bg-white text-slate-900 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto shadow-2xl"
          >
            조회 시작 
            <Lock size={22} className="text-red-500 group-hover:text-red-600 transition-colors" />
          </button>
          
          <div className="mt-32 text-slate-700 text-[10px] font-bold uppercase tracking-[0.4em]">
            DAEGU TRANSPORTATION CORPORATION © 2026
          </div>
        </div>

        {/* 비밀번호 모달 (남색 테마) */}
        {isPwModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-lg">
            <div className="bg-slate-800 w-full max-w-sm rounded-[3rem] p-12 border border-white/10 shadow-3xl relative animate-in fade-in zoom-in duration-300">
              <button onClick={() => {setIsPwModalOpen(false); setPwInput("");}} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={28}/></button>
              <h3 className="text-white font-black text-2xl mb-2">비밀번호 입력</h3>
              <p className="text-slate-500 text-xs mb-10 uppercase tracking-widest font-bold">Please Enter Password</p>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <input 
                  autoFocus
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pwInput}
                  onChange={(e) => setPwInput(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl py-6 text-center text-4xl font-black text-blue-600 tracking-[0.6em] focus:border-blue-700 outline-none transition-all placeholder:text-slate-800"
                />
                <button type="submit" className="w-full py-5 bg-blue-700 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-colors shadow-xl shadow-blue-900/20">확인</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 대시보드 페이지 (남색/네이비 테마)
  return (
    <div className="min-h-screen bg-[#1a1c23] text-[#e8eaf0] font-sans">
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}>
            <Monitor className="text-blue-700" size={24} />
            <span className="font-black text-xl tracking-tight text-white">DTRO Archive</span>
          </div>
          <button onClick={() => setPage('landing')} className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest border border-white/10 px-5 py-2.5 rounded-xl transition-all">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        {/* 필터 설정 - 남색 포인트 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="bg-slate-800 p-8 space-y-5">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">01. Line Selection</label>
            <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl">
              {Object.keys(lineData).map(line => (
                <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${selection.line === line ? 'bg-blue-700 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                  {line}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 p-8 space-y-5">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">02. Station Name</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl px-5 py-4 text-base font-black focus:border-blue-700 outline-none text-white cursor-pointer appearance-none">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="bg-slate-800 p-8 space-y-5">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">03. Equipment Unit</label>
            <div className="flex gap-3">
              <div className="flex-[1] flex gap-1.5 p-1.5 bg-slate-900 rounded-2xl">
                {['E/L', 'E/S'].map(t => (
                  <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                    className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${selection.type === t ? 'bg-[#e8eaf0] text-slate-900 shadow-md' : 'text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
                className="flex-[1.5] bg-slate-900 border-2 border-white/5 rounded-2xl px-3 text-[11px] font-black focus:border-blue-700 outline-none text-slate-300 cursor-pointer appearance-none">
                {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4 px-3">
              <History className="text-blue-700" size={24} />
              <h3 className="text-2xl font-black text-white tracking-tight">상세 내역</h3>
              <span className="text-[11px] font-black text-slate-500 ml-auto uppercase tracking-widest">{filteredResults.length} Records Found</span>
            </div>
            <div className="space-y-5">
              {filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-slate-800 p-8 rounded-[2rem] border transition-all ${idx === 0 ? 'border-blue-700 shadow-2xl shadow-blue-900/10' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5">
                    <div className="space-y-1.5">
                      <div className="text-blue-600 font-black text-sm flex items-center gap-2 uppercase tracking-tight"><Calendar size={16}/> {item.date}</div>
                      <div className="font-black text-white text-xl opacity-90">
                        {selection.station === '동대구' || selection.station === '대구' ? selection.station : selection.station}역 
                        <span className="text-slate-600 mx-2">|</span> {item.unit}
                      </div>
                    </div>
                    <div className="bg-white/5 text-slate-400 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border border-white/5 uppercase">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-300 text-[16px] leading-relaxed break-keep">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <section className="bg-slate-800 border border-white/5 rounded-[3rem] p-10 shadow-2xl sticky top-32">
              <h3 className="text-[12px] font-black text-blue-600 mb-10 uppercase tracking-[0.25em] flex items-center gap-3 border-b border-white/5 pb-5">
                <BarChart2 size={18} /> 분석 리포트
              </h3>
              <div className="space-y-12">
                <div>
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Inspections</p>
                   <p className="text-6xl font-black text-white tracking-tighter">{stationStats.total}<span className="text-lg font-medium ml-2 opacity-20">건</span></p>
                </div>
                <div className="p-8 bg-blue-700/10 rounded-[2.5rem] border border-blue-700/20 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1">Priority 1.13</p>
                    <p className="text-3xl font-black text-white">{stationStats.highPriority}<span className="text-sm ml-2 opacity-30">건</span></p>
                  </div>
                  <Zap size={32} className="text-blue-700/30 fill-blue-700/10" />
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
