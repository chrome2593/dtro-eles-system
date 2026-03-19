import React, { useState, useMemo, useEffect } from 'react';
import { Search, AlertCircle, BarChart2, Calendar, Layers, Monitor, MapPin, Database, Zap, ChevronRight } from 'lucide-react';

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
        const data = await response.json();
        setAllData(data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
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
    return {
      total: stationData.length,
      elCount: stationData.filter(d => d.type === 'E/L').length,
      esCount: stationData.filter(d => d.type === 'E/S').length,
      highPriority: stationData.filter(d => d.category === '1.13').length
    };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type)
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  // 메인 페이지
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-6 text-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter break-keep">
            DTRO 승강기 관리
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-10 font-medium">
            실제 검사항목 데이터 기반 운영중
          </p>
          <button 
            onClick={() => setPage('dashboard')} 
            className="w-full md:w-auto px-16 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-blue-500 active:scale-95 transition-all"
          >
            조회 시작
          </button>
        </div>
      </div>
    );
  }

  // 대시보드 페이지
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
            <Monitor className="text-blue-600" size={20} />
            <span className="font-black text-lg tracking-tight">DTRO Archive</span>
          </div>
          <button onClick={() => setPage('landing')} className="text-xs font-bold text-slate-400">나가기</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {/* 필터 설정 */}
        <section className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">01. 노선 선택</label>
            <div className="flex gap-1.5">
              {Object.keys(lineData).map(line => (
                <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${selection.line === line ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-50'}`}>
                  {line}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">02. 역사명</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
              className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-3 py-2.5 text-sm font-black focus:bg-white focus:border-blue-600 outline-none cursor-pointer">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">03. 장비 구분</label>
            <div className="flex gap-1.5">
              {['E/L', 'E/S'].map(t => (
                <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${selection.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">04. 상세 호기</label>
            <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
              className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-3 py-2.5 text-sm font-black focus:bg-white focus:border-blue-600 outline-none cursor-pointer">
              {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 리스트 내역 */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2 px-1">
              <Layers className="text-blue-600" size={18} /> 상세 내역
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">{filteredResults.length}건</span>
            </h3>
            <div className="space-y-3">
              {filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-white p-5 rounded-2xl border-2 transition-all ${idx === 0 ? 'border-blue-500 shadow-lg shadow-blue-50' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-50">
                    <div className="flex flex-col gap-1">
                      <div className="text-blue-600 font-black text-sm flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={14}/> {item.date}
                      </div>
                      <div className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400"/> {item.station} | {item.unit}
                      </div>
                    </div>
                    <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[9px] font-black whitespace-nowrap">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-700 text-sm leading-relaxed break-keep">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 실시간 통계 */}
          <div className="lg:col-span-4">
            <section className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm sticky top-24">
              <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-600" /> {selection.station}역 실시간 통계
              </h3>
              <div className="space-y-3">
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Total Records</p>
                  <p className="text-2xl font-black text-blue-900">{stationStats.total}건</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 mb-1">E/L</p>
                    <p className="text-lg font-black text-slate-800">{stationStats.elCount}건</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 mb-1">E/S</p>
                    <p className="text-lg font-black text-slate-800">{stationStats.esCount}건</p>
                  </div>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase">중요 관리 (1.13)</p>
                    <p className="text-2xl font-black text-amber-700">{stationStats.highPriority}건</p>
                  </div>
                  <Zap size={24} className="text-amber-200 fill-amber-200" />
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
