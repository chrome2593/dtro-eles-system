import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight, Lock, X, LogOut, CheckCircle, Activity } from 'lucide-react';

const App = () => {
  // 로컬 스토리지에서 인증 상태를 불러와 새로고침 시 상태 유지
  const [page, setPage] = useState(() => {
    return localStorage.getItem('dtro_auth') === 'true' ? 'dashboard' : 'landing';
  });
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  
  const ADMIN_PASSWORD = "3650"; // 비밀번호 설정

  // 최신 노선 데이터 (동구청역 반영)
  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '서부정류장', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구', '칠성시장', '신천', '동대구', '동구청', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심', '대구한의대병원', '부호', '하양'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '수성알파시티', '고산', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  // 역명 통합 및 정규화 (큰고개 -> 동구청 통합)
  const normalizeStation = (name) => {
    if (!name) return '';
    let n = String(name).replace(/[0-9\s]/g, '');
    if (n.endsWith('역')) n = n.slice(0, -1); 
    if (n === '성당못') return '서부정류장';
    if (n === '대공원') return '수성알파시티';
    if (n === '큰고개') return '동구청'; // 역명 변경 대응
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

  // 로그인 처리
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      localStorage.setItem('dtro_auth', 'true'); // 인증 상태 저장
      setIsPwModalOpen(false);
      setPage('dashboard');
      setPwInput("");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
      setPwInput("");
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('dtro_auth'); // 인증 상태 삭제
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

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-2xl w-full relative z-10">
          <div className="mb-8 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-block">
            <span className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">DTRO Management System</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[1.1]">
            DTRO <br />
            <span className="text-indigo-500">승강기 관리</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-16 font-medium leading-relaxed">
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
            <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-12 border border-white/5 shadow-3xl relative animate-in fade-in zoom-in duration-300">
              <button onClick={() => {setIsPwModalOpen(false); setPwInput("");}} className="absolute top-8 right-8 text-slate-600 hover:text-white"><X size={28}/></button>
              <h3 className="text-white font-black text-2xl mb-2">비밀번호 입력</h3>
              <p className="text-slate-600 text-xs mb-10 uppercase tracking-widest font-bold">Authenticated Access Only</p>
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <input autoFocus type="password" inputMode="numeric" pattern="[0-9]*" value={pwInput} onChange={(e) => setPwInput(e.target.value)} placeholder="••••" className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-6 text-center text-4xl font-black text-indigo-500 tracking-[0.6em] focus:border-indigo-600 outline-none transition-all placeholder:text-slate-900"/>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-900/20">확인</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // [Dashboard] 전문가용 클린 다크 테마
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <nav className="bg-slate-900/50 backdrop-blur-2xl border-b border-white/5 p-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Monitor className="text-white" size={20} /></div>
            <span className="font-black text-xl tracking-tight text-white">DTRO Archive</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest border border-white/5 px-5 py-2.5 rounded-xl transition-all"><LogOut size={16}/> Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        {/* 필터 섹션 - 이미지 요청 사항: 위아래 여백 줄이기 적용(py-4 px-6) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-white/5 py-4 px-6 rounded-[2.5rem] space-y-5">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block">01. Line Selection</label>
            <div className="flex gap-2 p-1.5 bg-slate-950 rounded-2xl">
              {Object.keys(lineData).map(line => (
                <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})} className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${selection.line === line ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}>{line}</button>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 py-4 px-6 rounded-[2.5rem] space-y-5">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block">02. Station Name</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-5 py-4 text-base font-black focus:border-indigo-600 outline-none text-white cursor-pointer appearance-none">{lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}</select>
          </div>
          <div className="bg-slate-900/50 border border-white/5 py-4 px-6 rounded-[2.5rem] space-y-5">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block">03. Equipment & Unit</label>
            <div className="flex gap-3"><div className="flex-1 flex gap-1.5 p-1.5 bg-slate-950 rounded-2xl">{['E/L', 'E/S'].map(t => (<button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})} className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${selection.type === t ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600'}`}>{t}</button>))}</div><select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})} className="flex-[1.5] bg-slate-950 border-2 border-white/5 rounded-2xl px-3 text-[11px] font-black focus:border-indigo-600 outline-none text-slate-400">{availableUnits.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 상세 내역 섹션 (8칸) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 이미지 요청 사항: 상세 내역 위에 새로운 통합 점검 리포트 카드 추가 */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 shadow-2xl sticky top-32">
              <h3 className="text-[12px] font-black text-indigo-500 mb-10 uppercase tracking-[0.25em] flex items-center gap-3 border-b border-white/5 pb-6">
                <CheckCircle size={18} /> 선택 역사 점검 요약
              </h3>
              <div className="space-y-12">
                <div>
                   <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">E/L Records (엘리베이터)</p>
                   <p className="text-5xl font-black text-white tracking-tighter">{stationStats.elCount}<span className="text-lg font-medium ml-2 opacity-10">건</span></p>
                </div>
                <div>
                   <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">E/S Records (에스컬레이터)</p>
                   <p className="text-5xl font-black text-white tracking-tighter">{stationStats.esCount}<span className="text-lg font-medium ml-2 opacity-10">건</span></p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-3"><History className="text-indigo-500" size={24} /><h3 className="text-2xl font-black text-white tracking-tight">상세 내역</h3></div>
            <div className="space-y-6">
              {filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-slate-900/40 p-10 rounded-[2.5rem] border transition-all ${idx === 0 ? 'border-indigo-500 shadow-2xl shadow-indigo-900/10' : 'border-white/5 hover:border-white/10'}`}><div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5"><div className="space-y-2"><div className="text-indigo-400 font-black text-sm flex items-center gap-2 tracking-tight"><Calendar size={16}/> {item.date}</div><div className="font-black text-white text-xl opacity-90">{selection.station}역 <span className="text-slate-700 mx-2">|</span> {item.unit}</div></div><div className="bg-slate-800 text-slate-400 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border border-white/5 uppercase">CODE {item.category}</div></div><p className="font-bold text-slate-400 text-[17px] leading-[1.8] break-keep">{item.content}</p></div>
              ))}
            </div>
          </div>
          
          {/* 우측 분석 리포트 섹션 (4칸) - 최종 최적화 버전 유지 */}
          <div className="lg:col-span-4"><section className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 shadow-2xl sticky top-32"><h3 className="text-[12px] font-black text-indigo-500 mb-10 uppercase tracking-[0.25em] flex items-center gap-3 border-b border-white/5 pb-6"><BarChart2 size={18} /> 전노선 분석 리포트</h3><div className="space-y-12"><div><p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">Total Elevator Records (E/L)</p><p className="text-5xl font-black text-white tracking-tighter">{filteredResults.filter(r=>r.type==='E/L').length}<span className="text-lg font-medium ml-2 opacity-10">건</span></p></div><div><p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">Total Escalator Records (E/S)</p><p className="text-5xl font-black text-white tracking-tighter">{filteredResults.filter(r=>r.type==='E/S').length}<span className="text-lg font-medium ml-2 opacity-10">건</span></p></div></div></section></div>
        </div>
      </main>
    </div>
  );
};

export default App;
