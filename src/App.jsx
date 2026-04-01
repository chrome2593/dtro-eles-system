import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, History, Lock, X, LogOut, CheckCircle, PieChart, Info, PenLine, User, Wrench } from 'lucide-react';
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
  
  // [설정] 본인의 구글 시트 웹 앱 URL을 입력하세요
  const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzUI-sL1WSntKXzCuHFHYSYbuTpBimKSq4MTNpO8WA5maX5Zy1ZD9CZBFszfU9QFqmR/exec"; 
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // 한국 시간 기준 YYYY-MM-DD 생성 (날짜 밀림 방지)
  const getTodayString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [newLog, setNewLog] = useState({ 
    date: getTodayString(), 
    type: 'E/L', 
    unitNum: '', 
    content: '', 
    inspector: '' 
  });

  const ADMIN_PASSWORD = "3650";
  const SESSION_TIMEOUT = 5 * 60 * 1000;

  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '서부정류장', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구', '칠성시장', '신천', '동대구', '동구청', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심', '대구한의대병원', '부호', '하양'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '수성알파시티', '고산', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '호기 선택' });

  const handleLogout = () => {
    localStorage.clear();
    setPage('landing');
  };

  const normalizeStation = (name) => {
    if (!name) return '';
    let n = String(name).replace(/[0-9\s]/g, '');
    if (n.endsWith('역')) n = n.slice(0, -1); 
    if (n === '성당못') return '서부정류장';
    if (n === '대공원') return '수성알파시티';
    if (n === '큰고개') return '동구청';
    return n;
  };

  const fetchLogs = async () => {
    if (!GOOGLE_SHEET_URL) return;
    try {
      const response = await fetch(GOOGLE_SHEET_URL);
      const data = await response.json();
      if (Array.isArray(data)) setMaintenanceLogs(data.reverse());
    } catch (e) { console.error("실시간 로그 업데이트 대기 중..."); }
  };

  useEffect(() => {
    const auth = localStorage.getItem('dtro_auth');
    const loginTime = localStorage.getItem('dtro_login_time');
    if (auth === 'true' && loginTime) {
      if (Date.now() - parseInt(loginTime) > SESSION_TIMEOUT) handleLogout();
      else { setPage('dashboard'); fetchLogs(); }
    }
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setAllData(Array.isArray(data) ? data : []);
      } catch (e) { console.error("기초 데이터 로드 실패"); } finally { setTimeout(() => setIsLoading(false), 500); }
    };
    loadData();
  }, [page]);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!GOOGLE_SHEET_URL) return alert("API URL 설정이 필요합니다.");
    if (!newLog.content || !newLog.inspector || !newLog.unitNum) return alert("모든 항목을 작성해주세요.");
    
    setIsSaving(true);
    try {
      const payload = { ...newLog, station: selection.station };
      await fetch(GOOGLE_SHEET_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      setNewLog({ ...newLog, content: '', inspector: '', unitNum: '' });
      alert("조치 기록이 전송되었습니다.");
      setTimeout(() => fetchLogs(), 1500);
    } catch (e) { alert("연결 상태를 확인해주세요."); } finally { setIsSaving(false); }
  };

  const filteredResults = useMemo(() => {
    return (allData || []).filter(item => {
      const matchStation = normalizeStation(item.station) === normalizeStation(selection.station);
      const matchType = item.type === selection.type;
      const matchUnit = selection.unit === '호기 선택' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [selection, allData]);

  const currentUnitLogs = useMemo(() => {
    return (maintenanceLogs || []).filter(log => {
      const matchStation = log.station === selection.station;
      const logUnitLabel = `${log.type} #${log.unitNum}`;
      return matchStation && (selection.unit === '호기 선택' || logUnitLabel === selection.unit);
    });
  }, [selection, maintenanceLogs]);

  const stationChartData = useMemo(() => {
    const stationData = (allData || []).filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    const counts = {};
    stationData.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: sortedEntries.map(e => e[0]),
      values: sortedEntries.map(e => e[1]),
      datasets: [{ data: sortedEntries.map(e => e[1]), backgroundColor: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'], borderColor: '#fff', borderWidth: 2 }],
    };
  }, [selection.station, allData]);

  const stationStats = useMemo(() => {
    const stationData = (allData || []).filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    return { elCount: stationData.filter(d => d.type === 'E/L').length, esCount: stationData.filter(d => d.type === 'E/S').length };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = (allData || []).filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type).map(item => item.unit);
    return ['호기 선택', ...new Set(units)].sort();
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
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[1.1]">DTRO <br /><span className="text-indigo-500">승강기 관리</span></h1>
          <p className="text-slate-400 text-lg md:text-xl mb-16 font-medium leading-relaxed">실제 검사 데이터 기반 운영 중</p>
          <button onClick={() => setIsPwModalOpen(true)} className="group px-20 py-6 bg-white text-slate-950 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto shadow-2xl">
            조회 시작 <Lock size={22} className="text-red-500" />
          </button>
          <div className="mt-32 text-slate-800 text-[10px] font-bold uppercase tracking-[0.4em]">DAEGU TRANSPORTATION CORPORATION © 2026</div>
        </div>
        {isPwModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
            <div className="bg-slate-800/80 backdrop-blur-2xl w-full max-w-[320px] rounded-[2.5rem] p-8 border border-white/10 shadow-3xl relative">
              <button onClick={() => setIsPwModalOpen(false)} className="absolute top-6 right-6 text-slate-600 hover:text-white"><X size={20}/></button>
              <h3 className="text-white font-black text-lg mb-6 text-center">비밀번호 입력</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (pwInput === ADMIN_PASSWORD) {
                  localStorage.setItem('dtro_auth', 'true');
                  localStorage.setItem('dtro_login_time', Date.now().toString());
                  setIsPwModalOpen(false);
                  setPage('dashboard');
                } else alert("비밀번호 불일치");
              }} className="space-y-6">
                {/* 비밀번호 입력 텍스트를 흰색(text-white)으로 변경 */}
                <input autoFocus type="password" inputMode="numeric" value={pwInput} onChange={(e) => setPwInput(e.target.value)} placeholder="••••" className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl py-4 text-center text-2xl font-black text-white tracking-[0.6em] outline-none placeholder:text-slate-900"/>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg">확인</button>
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
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md"><Monitor className="text-white" size={20} /></div><span className="font-black text-xl tracking-tight text-slate-900">DTRO Archive</span></div>
          <button onClick={() => { if (window.confirm("로그아웃 하시겠습니까?")) handleLogout(); }} className="text-[11px] font-black text-slate-400 hover:text-red-500 border border-slate-200 px-5 py-2.5 rounded-xl transition-all">Logout</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 py-4 px-6 rounded-[2.5rem] shadow-sm space-y-4">
            <label className="text-sm font-black text-indigo-600 uppercase tracking-widest">01. LINE</label>
            <div className="relative flex p-1 bg-slate-100 rounded-2xl h-12">
              <div className="absolute top-1 bottom-1 bg-white rounded-xl transition-all duration-300 shadow-sm border border-slate-200/50" style={{ left: selection.line === '2호선' ? 'calc(50% + 2px)' : '4px', width: 'calc(50% - 6px)' }} />
              <button onClick={() => setSelection({...selection, line: '1호선', station: lineData['1호선'][0], unit: '호기 선택'})} className={`relative z-10 flex-1 text-[11px] font-black ${selection.line === '1호선' ? 'text-indigo-600' : 'text-slate-400'}`}>1호선</button>
              <button onClick={() => setSelection({...selection, line: '2호선', station: lineData['2호선'][0], unit: '호기 선택'})} className={`relative z-10 flex-1 text-[11px] font-black ${selection.line === '2호선' ? 'text-indigo-600' : 'text-slate-400'}`}>2호선</button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 py-4 px-6 rounded-[2.5rem] shadow-sm space-y-4">
            <label className="text-sm font-black text-indigo-600 uppercase tracking-widest">02. STATION</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '호기 선택'})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-900 text-center appearance-none cursor-pointer outline-none">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200 py-4 px-6 rounded-[2.5rem] shadow-sm space-y-4">
            <label className="text-sm font-black text-indigo-600 uppercase tracking-widest">03. UNIT</label>
            <div className="flex gap-2">
              <div className="relative flex p-1 bg-slate-100 rounded-2xl h-12 flex-1">
                <div className="absolute top-1 bottom-1 bg-white rounded-xl transition-all duration-300 shadow-sm border border-slate-200/50" style={{ left: selection.type === 'E/S' ? 'calc(50% + 2px)' : '4px', width: 'calc(50% - 6px)' }} />
                <button onClick={() => setSelection({...selection, type: 'E/L', unit: '호기 선택'})} className={`relative z-10 flex-1 text-[10px] font-black ${selection.type === 'E/L' ? 'text-indigo-600' : 'text-slate-400'}`}>E/L</button>
                <button onClick={() => setSelection({...selection, type: 'E/S', unit: '호기 선택'})} className={`relative z-10 flex-1 text-[10px] font-black ${selection.type === 'E/S' ? 'text-indigo-600' : 'text-slate-400'}`}>E/S</button>
              </div>
              <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})} className="flex-[1.2] bg-slate-50 border border-slate-200 rounded-2xl px-2 text-[10px] font-black text-slate-900 text-center appearance-none cursor-pointer outline-none">
                {availableUnits.map(u => <option key={u} value={u} className="bg-white text-slate-900">{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-white border border-slate-200 py-6 px-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8"><CheckCircle size={20} className="text-indigo-600" /><span className="text-base font-black text-indigo-600 uppercase tracking-[0.2em]">역사 점검 요약</span></div>
            <div className="flex justify-around items-center">
              <div className="text-center"><span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Elevator</span><p className={`text-3xl font-black ${stationStats.elCount === 0 ? 'text-slate-200' : 'text-slate-900'}`}>{stationStats.elCount}<span className="text-base ml-1 font-bold">건</span></p></div>
              <div className="w-[1px] h-12 bg-slate-100"></div>
              <div className="text-center"><span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Escalator</span><p className={`text-3xl font-black ${stationStats.esCount === 0 ? 'text-slate-200' : 'text-slate-900'}`}>{stationStats.esCount}<span className="text-base ml-1 font-bold">건</span></p></div>
            </div>
          </section>
          <section className="bg-white border border-slate-200 py-6 px-8 rounded-[2.5rem] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6"><PieChart size={20} className="text-indigo-600" /><span className="text-base font-black text-indigo-600 uppercase tracking-[0.2em]">[{selection.station}역] 검사항목 비중</span></div>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 flex-shrink-0">
                <Doughnut data={stationChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%', onHover: (evt, elements) => { if (elements.length > 0) setHoveredCategory(stationChartData.labels[elements[0].index]); else setHoveredCategory(null); } }} />
              </div>
              <div className="flex-1 space-y-1.5 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {(stationChartData.labels || []).map((label, i) => (
                  <div key={label} onMouseEnter={() => setHoveredCategory(label)} onMouseLeave={() => setHoveredCategory(null)} className={`flex items-center justify-between p-1 rounded-md transition-all ${hoveredCategory === label ? 'bg-indigo-50' : ''}`}>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'][i % 6] }}></div><span className="text-[9px] font-bold text-slate-500">검사항목 {label}</span></div>
                    <span className="text-[10px] font-black text-slate-800">{stationChartData.values[i]}건</span>
                  </div>
                ))}
              </div>
            </div>
            {hoveredCategory && (
              <div className="mt-4 p-4 rounded-2xl border bg-indigo-50 border-indigo-100 animate-in fade-in">
                <div className="flex items-center gap-2 mb-1.5"><Info size={12} className="text-indigo-500" /><span className="text-[9px] font-bold uppercase text-indigo-600">검사항목 {hoveredCategory} 대표 내역</span></div>
                <p className="text-[11px] leading-relaxed text-indigo-900 font-medium">{allData.find(d => normalizeStation(d.station) === normalizeStation(selection.station) && d.category === hoveredCategory)?.content}</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 px-3"><History className="text-indigo-600" size={24} /><h3 className="text-lg font-black text-slate-900 tracking-tight">상세 내역 - {selection.station}역</h3></div>
          <div className="space-y-4">
            {(filteredResults || []).map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:border-indigo-100">
                <div className="flex justify-between items-start mb-5 pb-5 border-b border-slate-100">
                  <div className="space-y-1"><div className="text-indigo-600 font-black text-xs flex items-center gap-2"><Calendar size={14}/> {item.date}</div><div className="font-black text-slate-800 text-lg">{item.unit}</div></div>
                  <div className="bg-slate-50 text-slate-400 px-3 py-1 rounded-md text-[9px] font-black tracking-widest border border-slate-200 uppercase">검사항목 {item.category}</div>
                </div>
                <p className="font-bold text-slate-600 text-[16px] leading-[1.8] break-keep">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 현장 조치 기록 섹션 */}
        <div className="space-y-6 mt-12 pb-20">
          <div className="flex items-center gap-4 px-3"><Wrench size={24} className="text-indigo-600" /><h3 className="text-lg font-black text-indigo-600 tracking-tight">현장 조치 기록</h3></div>
          <form onSubmit={handleSaveLog} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase px-1">대상 장비</label>
                <div className="flex gap-2">
                  <select value={newLog.type} onChange={(e) => setNewLog({...newLog, type: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500">
                    <option value="E/L">E/L (엘리베이터)</option><option value="E/S">E/S (에스컬레이터)</option>
                  </select>
                  <input type="number" placeholder="호기" value={newLog.unitNum} onChange={(e) => setNewLog({...newLog, unitNum: e.target.value})} className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase px-1">점검자</label>
                <div className="relative"><User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input type="text" placeholder="성명" value={newLog.inspector} onChange={(e) => setNewLog({...newLog, inspector: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"/></div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase px-1">조치 날짜</label>
                <div className="w-full max-w-full overflow-hidden">
                  <input type="date" value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 appearance-none"/>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">보완 및 조치사항</label>
              <textarea placeholder="조치 내용을 상세히 기록" value={newLog.content} onChange={(e) => setNewLog({...newLog, content: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm focus:border-indigo-500 h-32 resize-none outline-none"/>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
              {isSaving ? "저장 중..." : <><PenLine size={18} className="inline mr-2"/> 조치 기록 저장</>}
            </button>
          </form>

          <div className="space-y-4">
            {(currentUnitLogs || []).length > 0 ? currentUnitLogs.map((log, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in">
                <div className="flex justify-between items-start mb-5 pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="text-indigo-600 font-black text-xs flex items-center gap-2">
                      <Calendar size={14}/> 
                      {String(log.date || '').split('T')[0].replace(/-/g, '. ')}
                    </div>
                    <div className="font-black text-slate-800 text-lg">{log.type} #{log.unitNum} 조치 기록</div>
                  </div>
                  <div className="bg-slate-50 text-indigo-600 px-3 py-1 rounded-md text-[10px] font-black border border-indigo-100 uppercase">점검자: {log.inspector}</div>
                </div>
                <p className="font-bold text-slate-700 text-[15px] leading-[1.8] break-keep">{log.content}</p>
              </div>
            )) : <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-300 font-bold">등록된 현장 조치 기록이 없습니다.</div>}
          </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 2px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }`}</style>
    </div>
  );
};

export default App;
