import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { router } from '@inertiajs/react';
import { useRef, useEffect } from 'react';

export default function CalendarView() {
    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        // Tailwind styling adjustments dynamically applied if necessary
        // Mostly handled via CSS overrides in global CSS, but here's an anchor
    }, []);

    const handleEventClick = (clickInfo: any) => {
        const eventId = clickInfo.event.id;
        router.visit(`/appointments/${eventId}`);
    };

    const handleDateSelect = (selectInfo: any) => {
        // Prepare the dates
        const startDate = selectInfo.startStr.split('T')[0];
        const startTime = selectInfo.startStr.split('T')[1]?.substring(0, 5) || '08:00';
        
        const params = new URLSearchParams({
            date: startDate,
            time: startTime
        });
        
        router.visit(`/appointments/create?${params.toString()}`);
    };

    return (
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm overflow-hidden calendar-container w-full min-h-[600px]">
            <style>{`
                /* FullCalendar Tailwind overrides */
                .calendar-container .fc {
                    --fc-border-color: hsl(var(--border) / 0.5);
                    --fc-button-text-color: hsl(var(--foreground));
                    --fc-button-bg-color: hsl(var(--background));
                    --fc-button-border-color: hsl(var(--border));
                    --fc-button-hover-bg-color: hsl(var(--accent));
                    --fc-button-hover-border-color: hsl(var(--border));
                    --fc-button-active-bg-color: hsl(var(--primary));
                    --fc-button-active-border-color: hsl(var(--primary));
                    --fc-button-active-text-color: hsl(var(--primary-foreground));
                    --fc-event-bg-color: hsl(var(--primary));
                    --fc-event-border-color: transparent;
                    --fc-event-text-color: hsl(var(--primary-foreground));
                    --fc-today-bg-color: hsl(var(--primary) / 0.05);
                    --fc-page-bg-color: transparent;
                    --fc-neutral-bg-color: hsl(var(--muted));
                    --fc-neutral-text-color: hsl(var(--muted-foreground));
                    --fc-list-event-hover-bg-color: hsl(var(--accent));
                    color: hsl(var(--foreground));
                    font-family: inherit;
                }
                
                .calendar-container .fc-header-toolbar {
                    margin-bottom: 1.5rem !important;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .calendar-container .fc-button {
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    font-weight: 500;
                    text-transform: capitalize;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                
                .calendar-container .fc-button-primary:not(:disabled).fc-button-active,
                .calendar-container .fc-button-primary:not(:disabled):active {
                    background-color: var(--fc-button-active-bg-color);
                    border-color: var(--fc-button-active-border-color);
                    color: var(--fc-button-active-text-color);
                }

                .calendar-container .fc-theme-standard th {
                    border-color: var(--fc-border-color);
                    padding: 0.75rem 0;
                    background: hsl(var(--muted) / 0.5);
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .calendar-container .fc-theme-standard td, .calendar-container .fc-theme-standard th {
                    border-color: var(--fc-border-color);
                }

                .calendar-container .fc-event {
                    border-radius: 0.375rem;
                    padding: 0.125rem 0.25rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                
                .calendar-container .fc-event:hover {
                    opacity: 0.9;
                }

                .calendar-container .fc-timegrid-slot {
                    height: 2.5rem; /* Better slot height */
                }

                .calendar-container .fc-col-header-cell-cushion {
                    padding: 0.5rem;
                }
                
                .calendar-container .fc-direction-ltr .fc-timegrid-slot-label-frame {
                    text-align: center;
                }
            `}</style>
            
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
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
                nowIndicator={true}
                slotDuration="00:15:00"
                slotLabelInterval="01:00"
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
