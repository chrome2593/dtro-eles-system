import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Calendar, MapPin, BarChart2, Layers, History, Zap, ChevronRight, Lock, X, LogOut, CheckCircle, PieChart, Info } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const App = () => {
  const [page, setPage] = useState(() => localStorage.getItem('dtro_auth') === 'true' ? 'dashboard' : 'landing');
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  
  // 호버 상태 관리
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
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
    } else { alert("비밀번호 불일치"); setPwInput(""); }
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

  const chartColors = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

  const stationChartData = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    const counts = {};
    stationData.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: sortedEntries.map(e => e[0]),
      data: sortedEntries.map(e => e[1]),
      datasets: [{ data: sortedEntries.map(e => e[1]), backgroundColor: chartColors, borderColor: '#fff', borderWidth: 2 }],
    };
  }, [selection.station, allData]);

  // [핵심] 호버된 항목의 대표 내역 추출
  const representativeContent = useMemo(() => {
    if (!hoveredCategory) return null;
    const match = allData.find(d => 
      normalizeStation(d.station) === normalizeStation(selection.station) && 
      d.category === hoveredCategory
    );
    return match ? match.content : null;
  }, [hoveredCategory, selection.station, allData]);

  const stationStats = useMemo(() => {
    const stationData = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station));
    return { elCount: stationData.filter(d => d.type === 'E/L').length, esCount: stationData.filter(d => d.type === 'E/S').length };
  }, [selection.station, allData]);

  const availableUnits = useMemo(() => {
    const units = allData.filter(item => normalizeStation(item.station) === normalizeStation(selection.station) && item.type === selection.type).map(item => item.unit);
    return ['전체', ...new Set(units)].sort();
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
              <button onClick={() => {setIsPwModalOpen(false); setPwInput("");}} className="
