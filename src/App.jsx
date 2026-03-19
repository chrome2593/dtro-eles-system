import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight, Activity, PieChart, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Chart.js 필수 요소 등록
ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

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
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    loadData();
  }, []);

  // [데이터 가공] 차트용 통계 데이터 추출
  const chartData = useMemo(() => {
    if (!allData.length) return null;

    // 1. 검사항목 분포 (Donut)
    const codes = {};
    allData.forEach(d => { codes[d.category] = (codes[d.category] || 0) + 1; });
    const topCodes = Object.entries(codes).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 2. 역사별 상위 5개 (Bar)
    const stations = {};
    allData.forEach(d => { 
        const name = normalizeStation(d.station);
        stations[name] = (stations[name] || 0) + 1; 
    });
    const topStations = Object.entries(stations).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 3. 연도별 추이 (Line)
    const years = {};
    allData.forEach(d => {
      const y = d.date.split('-')[0];
      years[y] = (years[y] || 0) + 1;
    });
    const sortedYears = Object.entries(years).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      donut: {
        labels: topCodes.map(c => c[0]),
        datasets: [{
          data: topCodes.map(c => c[1]),
          backgroundColor: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      bar: {
        labels: topStations.map(s => s[0]),
        datasets: [{
          label: '건수',
          data: topStations.map(s => s[1]),
          backgroundColor: 'rgba(56, 189, 248, 0.6)',
          borderRadius: 8,
        }]
      },
      line: {
        labels: sortedYears.map(y => y[0] + '년'),
        datasets: [{
          fill: true,
          label: '연도별 발생량',
          data: sortedYears.map(y => y[1]),
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          tension: 0.4,
          pointRadius: 4
        }]
      }
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
    <div className="min-h-screen bg-[#141519] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sky-500 font-black tracking-widest text-[10px] uppercase">Analyzing Archive Data...</p>
    </div>
  );

  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-[#141519] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px]"></div>
        <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
          <div className="mb-6 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]">Infrastructure Management</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight text-center">DTRO <span className="text-sky-500">승강기 관리</span></h1>
          <p className="text-slate-500 text-lg md:text-xl mb-16 font-medium text-center leading-relaxed">실제 시정권고 데이터 {allData.length}건 기반 분석 시스템</p>
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

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        {/* 1. 시각화 대시보드 (Chart Section) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1f2230] p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h4 className="text-xs font-black text-sky-500 mb-6 flex items-center gap-2 uppercase tracking-widest"><PieChart size={14}/> 검사항목 분포</h4>
            <div className="h-48 flex justify-center">{chartData && <Doughnut data={chartData.donut} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}</div>
          </div>
          <div className="bg-[#1f2230] p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h4 className="text-xs font-black text-sky-500 mb-6 flex items-center gap-2 uppercase tracking-widest"><TrendingUp size={14}/> 연도별 추이</h4>
            <div className="h-48">{chartData && <Line data={chartData.line} options={{ maintainAspectRatio: false, scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false } } }} />}</div>
          </div>
          <div className="bg-[#1f2230] p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h4 className="text-xs font-black text-sky-500 mb-6 flex items-center gap-2 uppercase tracking-widest"><BarChart2 size={14}/> 다빈도 역사 Top 5</h4>
            <div className="h-48">{chartData && <Bar data={chartData.bar} options={{ indexAxis: 'y', maintainAspectRatio: false, scales: { x: { display: false }, y: { ticks: { color: '#9ba3b8', font: { size: 10 } } } }, plugins: { legend: { display: false } } }} />}</div>
          </div>
        </section>

        {/* 2. 필터 섹션 */}
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

        {/* 3. 상세 리스트 */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <History className="text-sky-500" size={20} />
              <h3 className="text-xl font-black text-white tracking-tight">상세 내역</h3>
              <span className="text-[10px] font-black text-slate-500 ml-auto uppercase tracking-widest">{filteredResults.length} Items</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.map((item, idx) => (
                <div key={item.id} className={`bg-[#1f2230] p-6 rounded-[2rem] border transition-all ${idx === 0 ? 'border-sky-500 shadow-2xl shadow-sky-500/10' : 'border-white/5'}`}>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                    <div className="text-sky-400 font-black text-xs flex items-center gap-1.5"><Calendar size={12}/> {item.date}</div>
                    <div className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">CODE {item.category}</div>
                  </div>
                  <p className="font-bold text-slate-300 text-sm leading-relaxed mb-4">{item.content}</p>
                  <div className="text-[10px] font-black text-slate-500 flex items-center gap-2"><MapPin size={10}/> {item.station} | {item.unit}</div>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
