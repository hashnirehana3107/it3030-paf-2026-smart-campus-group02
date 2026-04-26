import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Timer, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import api from '../services/api';
import { format, parseISO, isSameDay } from 'date-fns';

export default function Calendar() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState(today);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/bookings');
            setBookings(res.data || []);
        } catch (e) {
            console.error("Failed to fetch bookings for calendar", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Helper for time display
    const formatTimeDisplay = (timeStr: string) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) return format(parseISO(timeStr), 'hh:mm a');
        try {
            const [h, m] = timeStr.split(':');
            const d = new Date();
            d.setHours(parseInt(h), parseInt(m));
            return format(d, 'hh:mm a');
        } catch { return timeStr; }
    };

    // Calculate days in the current month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const eventDays = useMemo(() => {
        return bookings
            .filter(b => {
                const bDate = parseISO(b.date);
                return bDate.getMonth() === currentDate.getMonth() && 
                       bDate.getFullYear() === currentDate.getFullYear() &&
                       (b.status === 'APPROVED' || b.status === 'PENDING' || b.status === 'CHECKED_IN');
            })
            .map(b => parseISO(b.date).getDate());
    }, [bookings, currentDate]);

    const selectedDayBookings = useMemo(() => {
        return bookings.filter(b => isSameDay(parseISO(b.date), selectedDate));
    }, [bookings, selectedDate]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full font-sans pb-10 text-slate-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Campus Schedule</h1>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{currentMonthName} {currentYear} — Live Asset Reservations</p>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                    <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[9px] uppercase rounded-full tracking-[0.2em]">
                        Network Synchronized
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 bg-[#181a20] border border-[#262832] rounded-3xl p-8 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <CalendarIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-[18px] font-black tracking-tight text-white">{currentMonthName} <span className="text-slate-500 font-bold">{currentYear}</span></h2>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="w-10 h-10 rounded-xl border border-[#262832] bg-[#12141a] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#262832] transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => { const now = new Date(); setCurrentDate(now); setSelectedDate(now); }} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[#12141a] border border-[#262832] rounded-xl hover:text-white transition-colors">Today</button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="w-10 h-10 rounded-xl border border-[#262832] bg-[#12141a] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#262832] transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-4 mb-6">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2">
                        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-20 sm:h-24"></div>)}
                        {days.map((day) => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());
                            const hasEvents = eventDays.includes(day);

                            return (
                                <div key={day} className="h-20 sm:h-24 border-t border-white/[0.02] flex items-center justify-center relative">
                                    <button 
                                        onClick={() => setSelectedDate(date)}
                                        className={`w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 relative
                                            ${isSelected 
                                                ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.4)] scale-105 z-10' 
                                                : isToday
                                                ? 'bg-blue-600/20 text-blue-400 border-2 border-blue-500/50'
                                                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                                            }`}
                                    >
                                        {isToday && !isSelected && <span className="absolute -top-2 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest">Today</span>}
                                        <span className={`text-lg font-black ${isSelected ? 'text-white' : ''}`}>{day}</span>
                                        {hasEvents && (
                                            <div className="flex gap-1 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white shadow-[0_0_8px_white]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full xl:w-[400px] bg-[#181a20] border border-[#262832] rounded-3xl p-8 flex flex-col shadow-2xl h-fit">
                    <div className="mb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Schedule Overview</p>
                        <h2 className="text-xl font-black text-white">{format(selectedDate, 'MMM dd, yyyy')}</h2>
                    </div>

                    <div className="flex flex-col space-y-4">
                        {selectedDayBookings.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center opacity-30 text-center">
                                <CalendarIcon className="w-10 h-10 mb-3 text-slate-500" />
                                <p className="text-sm font-bold uppercase tracking-widest">No Reservations</p>
                            </div>
                        ) : (
                            selectedDayBookings.map((booking, i) => (
                                <div key={i} className="bg-[#12141a] border border-[#262832] p-5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-slate-500 transition-all shadow-lg">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'APPROVED' ? 'bg-emerald-500' : booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                            booking.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                            booking.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                            'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                            {booking.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-600">REF-{(booking.id || "").substring(0,6).toUpperCase()}</span>
                                    </div>
                                    <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-all mb-1 uppercase tracking-tight">{booking.resourceName || 'Asset'}</h4>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <Timer className="w-3.5 h-3.5" />
                                        <span>{formatTimeDisplay(booking.startTime)} - {formatTimeDisplay(booking.endTime)}</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{booking.userName || 'Student'}</p>
                                        {booking.status === 'APPROVED' && <Check className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
