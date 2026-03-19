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

  const [page, setPage] = useState('landing'); // 'landing' | 'dashboard'

  

  // 노선별 역사 데이터

  const lineData = {

    '1호선': ['설화명곡', '화원', '대곡', '진천', '월배', '상인', '월촌', '송현', '성당못', '대명', '안지랑', '현충로', '영대병원', '교대', '명덕', '반월당', '중앙로', '대구역', '칠성시장', '신천', '동대구역', '큰고개', '아양교', '동촌', '해안', '방촌', '용계', '율하', '신기', '반야월', '각산', '안심'],

    '2호선': ['문양', '다사', '대실', '강창', '계명대', '성서산업단지', '이곡', '용산', '죽전', '감삼', '두류', '내당', '반고개', '청라언덕', '반월당', '경대병원', '대구은행', '범어', '수성구청', '만촌', '담티', '연호', '대공원', '고산', '수성알파시티', '신매', '사월', '정평', '임당', '영남대']

  };



  const [allData, setAllData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [selection, setSelection] = useState({

    line: '1호선',

    station: '설화명곡', // 기본값: 설화명곡

    type: 'E/L',

    unit: '전체'

  });



  const normalizeStation = (name) => name ? name.replace(/[0-9\s]/g, '') : '';



  // 2021년 ~ 2026년 3월 데이터 랜덤 생성 로직

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

          "카 내 퀵플레이트 마감을 권장드립니다.",

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

          const countPerStation = Math.floor(Math.random() * 20) + 15;

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



  // 해당 역사 전용 통계

  const stationStats = useMemo(() => {

    const stationData = allData.filter(item => normalizeStation(item.station) === selection.station || item.station.includes(selection.station));

    return {

      total: stationData.length,

      elCount: stationData.filter(d => d.type === 'E/L').length,

      esCount: stationData.filter(d => d.type === 'E/S').length,

      highPriority: stationData.filter(d => d.category === '1.13').length

    };

  }, [selection.station, allData]);



  // 메인 랜딩 페이지

  if (page === 'landing') {

    return (

      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">

        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>

        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

        

        <div className="max-w-4xl w-full text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-8 animate-pulse">

            <ShieldCheck size={14} /> Safety Inspection Archive

          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-none break-keep">

            DTRO <span className="inline-block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">승강기 검사이력</span>

          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed break-keep">

            대구교통공사 관내 전 역사의 엘리베이터 및 에스컬레이터 시정권고 사항을 데이터 기반으로 통합 관리하는 안전 아카이브 시스템입니다.

          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">

            <button 

              onClick={() => setPage('dashboard')}

              className="group relative px-10 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-3 overflow-hidden"

            >

              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

              이력 조회 시작하기

              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />

            </button>

          </div>

        </div>



        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">

          Daegu Metro Safety Infrastructure © 2026

        </div>

      </div>

    );

  }



  // 메인 대시보드 페이지

  return (

    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">

        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}>

            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">

              <Monitor className="text-white" size={18} />

            </div>

            <h1 className="text-lg font-black tracking-tighter text-slate-800 whitespace-nowrap">DTRO 승강기 검사이력</h1>

          </div>

          <div className="flex items-center gap-4">

            <button onClick={() => setPage('landing')} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">

              메인으로 돌아가기

            </button>

            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-widest">

              Live Database

            </div>

          </div>

        </div>

      </nav>



      <main className="max-w-[1200px] mx-auto px-6 py-8">

        {/* 필터 영역 */}

        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 mb-8 overflow-hidden">

          <div className="p-4 border-b border-slate-50 bg-slate-50/50">

            <h2 className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">

              <Search size={14} className="text-blue-600" /> Filter Settings

            </h2>

          </div>

          

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">

            <div className="p-6 space-y-3">

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">01. 노선</label>

              <div className="flex gap-2">

                {Object.keys(lineData).map(line => (

                  <button key={line} onClick={() => setSelection({...selection, line, station: lineData[line][0], unit: '전체'})}

                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${selection.line === line ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100'}`}>

                    {line}

                  </button>

                ))}

              </div>

            </div>



            <div className="p-6 space-y-3">

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">02. 역사명</label>

              <select value={selection.station} onChange={(e) => setSelection({...selection, station: e.target.value, unit: '전체'})}

                className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-xs font-black focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">

                {currentStations.map(s => <option key={s} value={s}>{s}역</option>)}

              </select>

            </div>



            <div className="p-6 space-y-3">

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">03. 장비 구분</label>

              <div className="grid grid-cols-2 gap-2">

                {['E/L', 'E/S'].map(type => (

                  <button key={type} onClick={() => setSelection({...selection, type, unit: '전체'})}

                    className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${selection.type === type ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-50'}`}>

                    {type === 'E/L' ? 'E/L' : 'E/S'}

                  </button>

                ))}

              </div>

            </div>



            <div className="p-6 space-y-3">

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">04. 상세 호기</label>

              <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[70px] custom-scrollbar">

                {availableUnits.map(u => (

                  <button key={u} onClick={() => setSelection({...selection, unit: u})}

                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border-2 ${selection.unit === u ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-50 text-slate-400'}`}>

                    {u}

                  </button>

                ))}

              </div>

            </div>

          </div>

        </section>



        {/* 결과 리스트 영역 */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8 space-y-6">
