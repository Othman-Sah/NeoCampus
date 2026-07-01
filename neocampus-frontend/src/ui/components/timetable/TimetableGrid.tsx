import React from 'react'
import { useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core'
import { Seance } from '@/domain/entities/Seance'
import { cn } from '@/lib/utils'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  User, 
  School, 
  Plus, 
  Calendar,
  Sparkles,
  MapPin
} from 'lucide-react'

// Constants matching Figma design
export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const
export const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
]

// 30-minute drop target slots for Dnd snap alignment
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
]

// Helpers for absolute pixel position calculation (1 minute = 1 pixel)
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

const START_MINUTES = timeToMinutes('08:00') // 480 min
const HOUR_HEIGHT = 60 // 60px per hour (1px per minute)

// Get deterministic subject styling
export const getSubjectColor = (subjectId: number) => {
  const hue = (subjectId * 137.5) % 360 // Golden ratio hue distribution
  return {
    bg: `hsl(${hue}, 85%, 96%)`,
    border: `hsl(${hue}, 60%, 82%)`,
    text: `hsl(${hue}, 60%, 22%)`,
    indicator: `hsl(${hue}, 70%, 45%)`
  }
}

// Droppable 30-minute snapping slot overlay
interface DroppableSlotProps {
  id: string
  top: number
  height: number
  day: string
  time: string
  onCreate: (day: string, time: string) => void
  isAdmin: boolean
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ id, top, height, day, time, onCreate, isAdmin }) => {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        position: 'absolute',
        left: 0,
        right: 0,
      }}
      className={cn(
        "z-10 transition-all flex items-center justify-center border-t border-dashed border-neutral-100/50 group/slot",
        isOver ? "bg-indigo-50/60 border-indigo-300 border-2" : "hover:bg-neutral-50/20"
      )}
    >
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCreate(day, time)
          }}
          className="w-5 h-5 rounded-full bg-white border border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity focus:outline-none shadow-sm cursor-pointer"
          title={`Schedule session at ${time}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// Draggable absolute card
interface DraggableSeanceCardProps {
  seance: Seance
  isAdmin: boolean
  onClick: (seance: Seance) => void
}

const DraggableSeanceCard: React.FC<DraggableSeanceCardProps> = ({ seance, isAdmin, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `seance-${seance.id}`,
    disabled: !isAdmin
  })

  const colors = getSubjectColor(seance.matiere_id)
  
  // Calculate absolute coordinates
  const startMin = timeToMinutes(seance.heure_debut)
  const endMin = timeToMinutes(seance.heure_fin)
  const top = Math.max(0, startMin - START_MINUTES)
  const height = Math.max(35, endMin - startMin)

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragStyle,
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      className={cn(
        "absolute left-1 right-1 rounded-lg border p-2 text-xs flex flex-col justify-between select-none transition-shadow shadow-sm z-20 overflow-clip group",
        isAdmin ? "cursor-grab active:cursor-grabbing hover:shadow" : "cursor-pointer hover:shadow-sm",
        isDragging && "opacity-45 scale-95 shadow-md border-dashed border-black/40"
      )}
      onClick={() => {
        if (transform) return
        onClick(seance)
      }}
      {...(isAdmin ? listeners : {})}
      {...(isAdmin ? attributes : {})}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="font-bold leading-tight flex items-center gap-1.5 min-w-0">
          <span 
            className="w-1.5 h-1.5 rounded-full shrink-0" 
            style={{ backgroundColor: colors.indicator }}
          />
          <span className="truncate block" title={seance.matiere_intitule || seance.matiere_nom}>
            {seance.matiere_intitule || seance.matiere_nom}
          </span>
        </div>
        
        <span className="text-[10px] opacity-80 font-semibold truncate">
          {seance.enseignant_nom}
        </span>
      </div>

      <div className="flex items-center justify-between mt-1 text-[9px] opacity-75 font-medium shrink-0 pt-0.5 border-t border-black/5">
        <span className="flex items-center gap-0.5">
          <Clock className="w-3 h-3 opacity-60" />
          {seance.heure_debut} - {seance.heure_fin}
        </span>
        <span className="flex items-center gap-0.5 truncate max-w-[50%]">
          <MapPin className="w-3 h-3 opacity-60" />
          <span className="truncate">{seance.classe_nom}</span>
        </span>
      </div>
    </div>
  )
}

// DragOverlayCard clone component
const DragOverlayCard: React.FC<{ seance: Seance }> = ({ seance }) => {
  const colors = getSubjectColor(seance.matiere_id)
  return (
    <div
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      className="rounded-lg border p-2 text-xs flex flex-col justify-between select-none shadow-2xl scale-105 rotate-1 border-indigo-400 opacity-90 cursor-grabbing h-full w-full"
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="font-bold leading-tight flex items-center gap-1.5 min-w-0">
          <span 
            className="w-1.5 h-1.5 rounded-full shrink-0" 
            style={{ backgroundColor: colors.indicator }}
          />
          <span className="truncate block">
            {seance.matiere_intitule || seance.matiere_nom}
          </span>
        </div>
        <span className="text-[10px] opacity-80 font-semibold truncate">
          {seance.enseignant_nom}
        </span>
      </div>

      <div className="flex items-center justify-between mt-1 text-[9px] opacity-75 font-medium shrink-0 pt-0.5 border-t border-black/5">
        <span className="flex items-center gap-0.5">
          <Clock className="w-3 h-3 opacity-60" />
          {seance.heure_debut} - {seance.heure_fin}
        </span>
        <span className="flex items-center gap-0.5 truncate max-w-[50%]">
          <MapPin className="w-3 h-3 opacity-60" />
          <span className="truncate">{seance.classe_nom}</span>
        </span>
      </div>
    </div>
  )
}

// Main Grid
interface TimetableGridProps {
  sessions: Seance[]
  activeSeance: Seance | null
  isAdmin: boolean
  onEditSession: (seance: Seance) => void
  onCreateSession: (day: string, time: string) => void
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  sessions,
  activeSeance,
  isAdmin,
  onEditSession,
  onCreateSession
}) => {
  
  // Real-time calculation helper
  const now = new Date()
  const currentDayOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][now.getDay()]
  const currentHourStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
  const currentMinutes = timeToMinutes(currentHourStr)
  
  const showCurrentTimeLine = DAYS.includes(currentDayOfWeek as any) && currentMinutes >= START_MINUTES && currentMinutes <= timeToMinutes('18:00')
  const currentTimeTop = currentMinutes - START_MINUTES

  return (
    <div>
      {/* Desktop Timetable View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200 shadow-sm bg-white">
        <div className="min-w-[1000px] grid grid-cols-[60px_repeat(6,1fr)] bg-white relative">
          
          {/* Header Row */}
          <div className="p-3 bg-[#f9f9f9] border-b border-r border-neutral-200 flex items-center justify-center h-[42px]" />
          {DAYS.map(day => {
            const isToday = day === currentDayOfWeek
            return (
              <div 
                key={day} 
                className={cn(
                  "p-3 bg-[#f9f9f9] font-bold text-[11px] text-neutral-500 tracking-[0.55px] uppercase border-b border-neutral-200 text-center flex items-center justify-center gap-1.5 h-[42px] transition-all",
                  isToday && "bg-[#f9f9f9] border-t-2 border-black text-black"
                )}
              >
                {day}
              </div>
            )}
          )}

          {/* Grid Layout Container */}
          <div className="col-span-7 h-[600px] flex relative">
            
            {/* Grid background lines */}
            <div className="absolute inset-0 left-[60px] opacity-40 pointer-events-none flex flex-col">
              {HOURS.map((_, idx) => (
                <div 
                  key={idx} 
                  className="h-[60px] border-b border-neutral-200 w-full"
                />
              ))}
            </div>

            {/* Time Labels Column */}
            <div className="w-[60px] h-full border-r border-neutral-200 relative bg-[#f9f9f9]/20 select-none">
              {HOURS.map((hour, idx) => (
                <div
                  key={hour}
                  style={{ top: `${idx * HOUR_HEIGHT - 8}px` }}
                  className="absolute left-0 right-0 pr-2 text-right text-[11px] font-semibold tracking-[0.88px] text-neutral-700 leading-none"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            <div className="flex-1 h-full grid grid-cols-6 relative">
              {DAYS.map(day => {
                const daySessions = sessions.filter(s => s.jour === day)
                const isToday = day === currentDayOfWeek

                return (
                  <div 
                    key={day} 
                    className={cn(
                      "h-full border-r border-neutral-100 last:border-r-0 relative",
                      isToday && "bg-[#f9f9f9]/40"
                    )}
                  >
                    {/* Droppable Snap Slots (Lower Layer) */}
                    {TIME_SLOTS.map((time, idx) => {
                      const slotTop = idx * 30 // 30px per 30 minutes
                      return (
                        <DroppableSlot
                          key={time}
                          id={`${day}_${time}`}
                          top={slotTop}
                          height={30}
                          day={day}
                          time={time}
                          onCreate={onCreateSession}
                          isAdmin={isAdmin}
                        />
                      )
                    })}

                    {/* Draggable Sessions (Upper Layer) */}
                    {daySessions.map(seance => (
                      <DraggableSeanceCard
                        key={seance.id}
                        seance={seance}
                        isAdmin={isAdmin}
                        onClick={onEditSession}
                      />
                    ))}

                    {/* Current Time Indicator Line */}
                    {showCurrentTimeLine && isToday && (
                      <div 
                        style={{ top: `${currentTimeTop}px` }}
                        className="absolute left-0 right-0 h-[2px] bg-[#d0f137] z-30 pointer-events-none"
                        title={`Current time: ${currentHourStr}`}
                      >
                        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#d0f137]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>

          {/* smooth drag overlay shadow card */}
          <DragOverlay>
            {activeSeance ? (
              <div className="w-[150px] md:w-[158px] h-[100px] pointer-events-none">
                <DragOverlayCard seance={activeSeance} />
              </div>
            ) : null}
          </DragOverlay>

        </div>
      </div>

      {/* Mobile View (Accordion day-by-day) */}
      <div className="block md:hidden">
        <Accordion {...({ defaultValue: ["Lundi"], className: "w-full space-y-2" } as any)}>
          {DAYS.map(day => {
            const daySessions = sessions
              .filter(s => s.jour === day)
              .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))

            return (
              <AccordionItem 
                {...({ key: day, value: day, className: "border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-sm px-1" } as any)}
              >
                <AccordionTrigger className="hover:no-underline py-4 px-4 font-semibold text-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{day}</span>
                  </div>
                  <Badge variant="secondary" className="mr-2 bg-neutral-100 text-neutral-600 border-none">
                    {daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'}
                  </Badge>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4 pt-1 divide-y divide-neutral-100">
                  {daySessions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-neutral-400 flex flex-col items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-neutral-300" />
                      No classes scheduled for this day.
                    </div>
                  ) : (
                    daySessions.map(seance => {
                      const colors = getSubjectColor(seance.matiere_id)
                      return (
                        <div 
                          key={seance.id} 
                          onClick={() => onEditSession(seance)}
                          className="py-3 flex items-start justify-between cursor-pointer group active:bg-neutral-50 transition-colors"
                        >
                          <div className="flex gap-3">
                            <div 
                              className="w-1.5 self-stretch rounded-full" 
                              style={{ backgroundColor: colors.indicator }}
                            />
                            <div>
                              <h4 className="font-semibold text-neutral-800 text-sm">
                                {seance.matiere_intitule || seance.matiere_nom}
                              </h4>
                              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 opacity-70" />
                                {seance.enseignant_nom}
                              </p>
                              {seance.classe_nom && (
                                <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1 font-medium">
                                  <School className="w-3.5 h-3.5 opacity-70" />
                                  Class: {seance.classe_nom}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              {seance.heure_debut} - {seance.heure_fin}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
