import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  AlertCircle, 
  ChevronRight, 
  BarChart2, 
  Calendar,
  Layers,
  Monitor,
  Database,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('landing'); 
  
  const lineData = {
    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '성당못', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구역', '칠성시장', '신천', '동대구역', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심'],
    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '대공원', '고산', '수성알파시티', '신매', '사월', '정평', '임당', '영남대']
  };

  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selection, setSelection] = useState({
    line: '1호선',
    station: '설화명곡',
    type: 'E/L',
    unit: '전체'
  });

  const normalizeStation = (name) => name ? name.replace(/[0-9\s]/g, '') : '';

  const generateRandomDate = () => {
    const start = new Date(2021, 0, 1);
    const end = new Date(2026, 2, 19);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const loadFullData = async () => {
      setIsLoading(true);
      try {
        const fullList = [];
        let globalId = 1;
        const contentsEL = [
          "주로프 심강유 고갈로 인한 적분진 발생 및 마모가 진행되고 있으므로 유지관리 시 주의 관찰을 요하며 개선하여 사용하시길 권고합니다.",
          "구동시 브레이크 개방보다 구동기 회전이 먼저 작동되어 브레이크 패드가 마모될 우려가 있으니 주의관리하시길 바라며 개선하여 이용하시기를 권고합니다.",
          "승강기 운행 시 브레이크 롤백이 다소 발생하므로 개선하여 사용하시기를 권고드립니다.",
          "엘리베이터 카 도어 이탈방지 장치의 마모가 확인되오니 교체 및 정비를 권고합니다.",
          "권상기 기어 오일의 오염도가 높으므로 주기적인 체크와 오일 교체를 권장합니다."
        ];
        const contentsES = [
          "진입방지대로 인해 승강장 플레이트가 들리는 등의 안전사고가 발생하지 않도록 개선 및 관리를 권고합니다.",
          "다음 정밀안전검사 전까지 안전기준에 적합한 주 브레이크 시스템으로 변경할 것을 권고합니다.",
          "에스컬레이터 핸드레일 속도 편차 발생으로 인한 전도 사고 예방을 위해 상시 점검을 권고합니다.",
          "스커트 디플렉터와 콤 플레이트 사이에 발생할 수 있는 끼임 사고 방지 대책 마련을 권고합니다."
        ];

        Object.values(lineData).flat().forEach((stn) => {
          const countPerStation = 15;
          for(let i=0; i<countPerStation; i++) {
            const isEL = Math.random() > 0.4;
            fullList.push({
              id: globalId++,
              station: stn,
              unit: `${isEL ? 'E/L' : 'E/S'} #${Math.floor(Math.random()*6)+1}`,
              date: generateRandomDate(),
              category: isEL ? (Math.random() > 0.5 ? "1.13" : "2.5.1") : "5.4.2",
              content: isEL ? contentsEL[Math.floor(Math.random()*contentsEL.length)] : contentsES[Math.floor(Math.random()*contentsES.length)],
              type: isEL ? 'E/L' : 'E/S'
            });
          }
        });
        setAllData(fullList);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadFullData();
  }, []);

  const currentStations = useMemo(() => lineData[selection.line], [selection.line]);

  const availableUnits = useMemo(() => {
    const units = allData
      .filter(item => 
        (normalizeStation(item.station) === selection.station || item.station.includes(selection.station)) && 
        item.type === selection.type
      )
      .map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
  }, [selection.station, selection.type, allData]);

  const filteredResults = useMemo(() => {
    let results = allData.filter(item => {
      const matchStation = normalizeStation(item.station) === selection.station || item.station.includes(selection.station);
      const matchType = item.type === selection.type;
      const matchUnit = selection.unit === '전체' || item.unit === selection.unit;
      return matchStation && matchType && matchUnit;
    });
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selection, allData]);

  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === selection.station || item.station.includes(selection.station));
    return {
      total: stationData.length,
      elCount: stationData.filter(d => d.type === 'E/L').length,
      esCount: stationData.filter(d => d.type === 'E/S').length,
      highPriority: stationData.filter(d => d.category === '1.13').length
    };
  }, [selection.station, allData]);

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-4xl w-full text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">DTRO 승강기 검사이력</h1>
          <button onClick={() => setPage('dashboard')} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl">이력 조회 시작</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="bg-white border-b p-4 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <h1 className="font-black text-xl cursor-pointer" onClick={() => setPage('landing')}>DTRO Archive</h1>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-6">
        <section className="bg-white rounded-3xl border p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-2">01. 노선</label>
              <div className="flex gap-2">
                {Object.keys(lineData).map(line => (
                  <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 ${selection.line === line ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                    {line}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-2">02. 역사명</label>
              <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}
                className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-2 text-sm font-bold">
                {currentStations.map(s => <option key={s} value={s}>{s}역</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-2">03. 장비 구분</label>
              <div className="flex gap-2">
                {['E/L', 'E/S'].map(type => (
                  <button key={type} onClick={() => setSelection({...selection, type, unit: '전체'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 ${selection.type === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-2">04. 상세 호기</label>
              <div className="flex flex-wrap gap-1">
                {availableUnits.map(u => (
                  <button key={u} onClick={() => setSelection({...selection, unit: u})}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${selection.unit === u ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {filteredResults.map((item, idx) => (
              <div key={item.id} className={`bg-white border-2 rounded-2xl p-6 ${idx === 0 ? 'border-blue-500 shadow-lg' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                  <span className="font-black text-blue-600">{item.date}</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">CODE {item.category}</span>
                </div>
                <p className="font-bold text-slate-800 leading-relaxed">{item.content}</p>
                <div className="mt-4 text-xs text-slate-400 font-bold">{normalizeStation(item.station)}역 | {item.unit}</div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">Station Stats</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-blue-400">Total Records</p>
                  <p className="text-2xl font-black text-blue-900">{stationStats.total}건</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <p className="text-[9px] font-bold text-slate-400">E/L</p>
                    <p className="text-lg font-black text-slate-800">{stationStats.elCount}건</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <p className="text-[9px] font-bold text-slate-400">E/S</p>
                    <p className="text-lg font-black text-slate-800">{stationStats.esCount}건</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
