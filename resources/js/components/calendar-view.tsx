import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { router } from '@inertiajs/react';
import { useRef, useEffect } from 'react';

interface CalendarViewProps {
    onEventClick?: (eventId: string) => void;
    onDateSelect?: (startDate: string, startTime: string) => void;
}

export default function CalendarView({ onEventClick, onDateSelect }: CalendarViewProps) {
    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        // Tailwind styling adjustments dynamically applied if necessary
        // Mostly handled via CSS overrides in global CSS, but here's an anchor
    }, []);

    const handleEventClick = (clickInfo: any) => {
        const eventId = clickInfo.event.id;
        if (onEventClick) {
            onEventClick(eventId);
        } else {
            router.visit(`/appointments/${eventId}`);
        }
    };

    const handleDateSelect = (selectInfo: any) => {
        // Prepare the dates
        const startDate = selectInfo.startStr.split('T')[0];
        const startTime = selectInfo.startStr.split('T')[1]?.substring(0, 5) || '08:00';
        
        if (onDateSelect) {
            onDateSelect(startDate, startTime);
        } else {
            const params = new URLSearchParams({
                date: startDate,
                time: startTime
            });
            router.visit(`/appointments/create?${params.toString()}`);
        }
    };

    return (
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-3 sm:p-6 shadow-sm overflow-hidden calendar-container w-full min-h-[600px]">
            <style>{`
                /* Google Calendar Style Overrides for FullCalendar */
                .calendar-container .fc {
                    --fc-border-color: #dadce0;
                    --fc-button-text-color: #3c4043;
                    --fc-button-bg-color: transparent;
                    --fc-button-border-color: #dadce0;
                    --fc-button-hover-bg-color: #f1f3f4;
                    --fc-button-hover-border-color: #dadce0;
                    --fc-button-active-bg-color: #e8eaed;
                    --fc-button-active-border-color: #dadce0;
                    --fc-button-active-text-color: #202124;
                    --fc-event-bg-color: #3f51b5; /* Google default blue */
                    --fc-event-border-color: transparent;
                    --fc-event-text-color: #ffffff;
                    --fc-today-bg-color: transparent; /* Google uses no background, just the blue circle in header */
                    --fc-page-bg-color: transparent;
                    --fc-neutral-bg-color: #f1f3f4;
                    --fc-neutral-text-color: #70757a;
                    --fc-list-event-hover-bg-color: #f1f3f4;
                    --fc-now-indicator-color: #ea4335; /* Google Red */
                    color: #3c4043;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                
                /* Toolbar buttons */
                .calendar-container .fc-header-toolbar {
                    margin-bottom: 1rem !important;
                }
                
                .calendar-container .fc-button {
                    border-radius: 0.25rem;
                    padding: 0.35rem 0.75rem;
                    font-weight: 500;
                    text-transform: capitalize;
                    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
                    box-shadow: none !important;
                }
                
                .calendar-container .fc-button-primary:focus {
                    box-shadow: none !important;
                }

                .calendar-container .fc-toolbar-title {
                    font-size: 1.375rem !important;
                    font-weight: 400 !important;
                    color: #3c4043;
                    margin-left: 0.5rem;
                }

                /* Header cells (DOM., SEG., etc) */
                .calendar-container .fc-theme-standard th {
                    border: none;
                    border-bottom: 1px solid var(--fc-border-color);
                    border-left: 1px solid var(--fc-border-color);
                    padding: 0;
                    background: transparent;
                    font-weight: 500;
                }
                .calendar-container .fc-theme-standard th:first-child {
                    border-left: none; /* Time axis header */
                }

                .calendar-container .fc-col-header-cell-cushion {
                    padding: 0 !important;
                    width: 100%;
                }

                /* Grid Lines */
                .calendar-container .fc-theme-standard td {
                    border-color: var(--fc-border-color);
                }
                .calendar-container .fc-timegrid-slot-minor {
                    border-top-style: none !important; /* Hide the minor slot line, or make it very light */
                }
                .calendar-container .fc-timegrid-slot-label-cushion {
                    font-size: 0.625rem;
                    color: #70757a;
                    padding-right: 0.5rem;
                    font-weight: 500;
                }
                .calendar-container .fc-timegrid-axis-cushion {
                    font-size: 0.625rem;
                    color: #70757a;
                }
                .calendar-container .fc-timegrid-divider {
                    display: none;
                }
                
                /* Remove border from the time axis column to match Google */
                .calendar-container .fc-theme-standard .fc-timegrid-axis {
                    border-left: none;
                    border-bottom: none;
                    border-top: none;
                }

                /* Events */
                .calendar-container .fc-event {
                    border-radius: 0.25rem;
                    padding: 0.1rem 0.25rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                    box-shadow: none;
                    cursor: pointer;
                    transition: opacity 0.2s, filter 0.2s;
                }
                
                .calendar-container .fc-event:hover {
                    filter: brightness(0.9);
                }

                .calendar-container .fc-timegrid-slot {
                    height: 1.25rem; /* Make slots smaller so hours are more compact */
                }
                
                /* Now Indicator */
                .calendar-container .fc-timegrid-now-indicator-line {
                    border-width: 2px 0 0;
                }
                .calendar-container .fc-timegrid-now-indicator-arrow {
                    border: none;
                    background-color: var(--fc-now-indicator-color);
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-top: -6px;
                    margin-left: -6px;
                }

            `}</style>
            
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={typeof window !== 'undefined' && window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={ptBrLocale}
                events="/api/appointments/events"
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                expandRows={false}
                height="auto"
                eventClick={handleEventClick}
                select={handleDateSelect}
                windowResize={(arg) => {
                    const api = arg.view.calendar;
                    if (window.innerWidth < 768) {
                        api.changeView('timeGridDay');
                    } else {
                        api.changeView('timeGridWeek');
                    }
                }}
                nowIndicator={true}
                slotDuration="00:15:00"
                slotLabelInterval="01:00"
                dayHeaderContent={(args) => {
                    // Custom Google-like header
                    const dayName = args.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
                    const dayNumber = args.date.getDate();
                    const isToday = args.isToday;
                    
                    return (
                        <div className="flex flex-col items-center py-1">
                            <span className={`text-[11px] font-medium mb-1 tracking-wider ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                {dayName}
                            </span>
                            <span className={`text-2xl font-normal w-[46px] h-[46px] flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                {dayNumber}
                            </span>
                        </div>
                    );
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }}
                eventContent={(eventInfo) => {
                    const isGroup = eventInfo.event.extendedProps.type === 'group';
                    return (
                        <div className="p-1 w-full overflow-hidden flex flex-col gap-0.5">
                            <div className="font-semibold text-xs flex items-center justify-between">
                                <span>{eventInfo.timeText}</span>
                                {isGroup && (
                                    <span className="text-[9px] bg-white/20 px-1 rounded">
                                        {eventInfo.event.extendedProps.patient_count || 0}/{eventInfo.event.extendedProps.max_participants || 1}
                                    </span>
                                )}
                            </div>
                            <div className="truncate text-xs font-medium">{eventInfo.event.title}</div>
                        </div>
                    );
                }}
            />
        </div>
    );
}
