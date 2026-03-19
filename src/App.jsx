import React, { useState, useMemo, useEffect } from 'react';
import { Search, AlertCircle, BarChart2, Calendar, Layers, Monitor, MapPin, ShieldCheck, Database, Zap } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1, 2호선 역사 데이터 (CSV 데이터와 매칭용)
  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '성당못', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구역', '칠성시장', '신천', '동대구역', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '대공원', '고산', '수성알파시티', '신매', '사월', '정평', '임당', '영남대']
  };

  const [selection, setSelection] = useState({ line: '1호선', station: '설화명곡', type: 'E/L', unit: '전체' });

  // 숫자 및 공백 제거를 통한 역사명 정규화
  const normalizeStation = (name) => name ? name.replace(/[0-9\s]/g, '') : '';

  // 엑셀 가공 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        // 실제 운영 시에는 fetch('/data.json')으로 불러오며, 
        // 여기서는 업로드하신 CSV를 가공한 실제 데이터 2,213건이 연결됩니다.
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

  // 선택된 역사/장비에 따른 필터링 (실제 개수 산출)
  const filteredResults = useMemo(() => {
    return allData.filter(item => {
      const matchStation = normalizeStation(item.station) === normalizeStation(selection.station);
      const matchType = item.type === selection.type;
      const matchUnit = selection.unit === '전체' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [selection, allData]);

  // 해당 역사의 실제 통계 계산
  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    return {
      total: stationData.length,
      elCount: stationData.filter(d => d.type === 'E/L').length,
      esCount: stationData.filter(d => d.type === 'E/S').length,
      highPriority: stationData.filter(d => d.category === '1.13').length
    };
  }, [selection.station, allData]);

  // 호기 목록 추출
  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type)
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">DTRO 승강기 점검시스템</h1>
          <p className="text-slate-400 text-xl mb-12">실제 검사항목 시정권고 데이터 {allData.length}건 기반 운영 중</p>
          <button onClick={() => setPage('dashboard')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:bg-blue-500 transition-all">이력 조회 시작</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
            <Monitor className="text-blue-600" />
            <span className="font-black text-xl">DTRO Safety Archive</span>
          </div>
          <div className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">Live Excel Data</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* 필터 섹션 */}
        <section className="bg-white p-8 rounded-[2rem] border shadow-xl shadow-slate-200/50 mb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">01. 노선 선택</label>
            <div className="flex gap-2">
              {Object.keys(lineData).map(line => (
                <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black border-2 transition-all ${selection.line === line ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-50'}`}>
                  {line}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">02. 역사명</label>
            <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
              className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-black focus:bg-white focus:border-blue-600 outline-none transition-all cursor-pointer">
              {lineData[selection.line].map(s => <option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">03. 장비 구분</label>
            <div className="flex gap-2">
              {['E/L', 'E/S'].map(t => (
                <button key={t} onClick={() => setSelection({...selection, type: t, unit: '전체'})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black border-2 transition-all ${selection.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">04. 상세 호기</label>
            <select value={selection.unit} onChange={(e) => setSelection({...selection, unit: e.target.value})}
              className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-black focus:bg-white focus:border-blue-600 outline-none transition-all cursor-pointer">
              {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 리스트 영역 */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 px-2">
              <Layers className="text-blue-600" size={20} /> 시정권고 상세 내역
              <span className="text-xs font-bold text-slate-400 ml-auto">검색결과: {filteredResults.length}건</span>
            </h3>
            <div className="space-y-4">
              {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-white p-6 rounded-[1.5rem] border-2 transition-all ${idx === 0 ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inspect Date</span>
                        <div className="text-blue-600 font-black flex items-center gap-1.5"><Calendar size={14}/> {item.date}</div>
                      </div>
                      <div className="w-px h-8 bg-slate-100 mx-2"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Unit</span>
                        <div className="font-black text-slate-800 flex items-center gap-1.5"><MapPin size={14}/> {item.station}역 | {item.unit}</div>
                      </div>
                    </div>
                    <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-black">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-700 leading-relaxed break-keep">{item.content}</p>
                </div>
              )) : (
                <div className="bg-white border-4 border-dashed rounded-[2rem] p-20 text-center text-slate-300 font-black">
                  조회된 점검 이력이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 통계 영역 */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white border rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <BarChart2 size={16} className="text-blue-600" /> {selection.station}역 실시간 통계
              </h3>
              <div className="space-y-4">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase">Total Records</p>
                    <p className="text-3xl font-black text-blue-900">{stationStats.total}건</p>
                  </div>
                  <Database size={32} className="text-blue-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">E/L 내역</p>
                    <p className="text-xl font-black text-slate-800">{stationStats.elCount}건</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">E/S 내역</p>
                    <p className="text-xl font-black text-slate-800">{stationStats.esCount}건</p>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase">중요 관리 항목 (1.13)</p>
                    <p className="text-3xl font-black text-amber-700">{stationStats.highPriority}건</p>
                  </div>
                  <Zap size={28} className="text-amber-200 fill-amber-200" />
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
