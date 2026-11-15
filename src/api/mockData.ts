import { DAY, HOUR } from '../domain/deadline'
import type { Category, Defect } from '../domain/types'

const FLEET: [string, string][] = [
  ['N301AX', 'A320-200'], ['N302AX', 'A320-200'], ['N415BV', 'A321neo'], ['N418BV', 'A321neo'],
  ['N520CR', 'B737-800'], ['N522CR', 'B737-800'], ['N631DL', 'B787-9'], ['N634DL', 'B787-9'],
  ['N707EH', 'E175'], ['N709EH', 'E175'], ['N812FQ', 'A220-300'], ['N815FQ', 'A220-300'],
]
const STATIONS = ['JFK', 'ORD', 'DEN', 'ATL', 'LAX', 'SEA']

// [ata, system, description, MEL ref, category, hours until expiry (negative = already expired), hours since deferral]
type Seed = [string, string, string, string, Category, number, number]
const SEEDS: Seed[] = [
  ['21', 'Air conditioning', 'Pack 2 flow control valve slow to respond', '21-51-01', 'C', -6, 600],
  ['23', 'Communications', 'HF radio 2 static on 8 MHz band', '23-11-02', 'C', 30, 300],
  ['24', 'Electrical', 'Generator 2 CSD low oil quantity warning intermittent', '24-21-01', 'B', 20, 55],
  ['25', 'Equipment', 'Galley 3 oven inoperative', '25-31-01', 'D', 900, 200],
  ['25', 'Equipment', 'Passenger seat 14C recline inoperative', '25-21-04', 'D', 1700, 100],
  ['26', 'Fire protection', 'Lavatory smoke detector fault light', '26-15-01', 'A', 40, 30],
  ['27', 'Flight controls', 'Spoiler 4 position transducer erratic', '27-61-02', 'B', 14, 220],
  ['28', 'Fuel', 'Center tank fuel quantity indicator intermittent', '28-41-02', 'C', 120, 600],
  ['29', 'Hydraulics', 'Yellow system quantity indicator fluctuating', '29-31-01', 'B', 70, 170],
  ['30', 'Ice & rain', 'Windshield wiper (F/O) slow in HIGH', '30-41-01', 'B', 100, 140],
  ['31', 'Indicating', 'EICAS caution message spurious (cabin pressure)', '31-41-03', 'C', 300, 420],
  ['32', 'Landing gear', 'Nose gear taxi light inoperative', '32-61-03', 'C', 22, 700],
  ['32', 'Landing gear', 'Brake temperature sensor #3 inoperative', '32-42-01', 'B', -30, 270],
  ['33', 'Lights', 'Cabin reading light row 22 inoperative', '33-21-01', 'D', 2300, 90],
  ['33', 'Lights', 'Left landing light inoperative', '33-41-01', 'C', 60, 660],
  ['34', 'Navigation', 'Standby altimeter reads +40 ft', '34-11-02', 'B', 160, 80],
  ['35', 'Oxygen', 'Crew oxygen pressure gauge sticky', '35-12-01', 'B', 36, 204],
  ['36', 'Pneumatic', 'Bleed 1 overtemp message nuisance', '36-11-02', 'C', 340, 380],
  ['38', 'Water/waste', 'Forward lav toilet flush weak', '38-31-01', 'D', 600, 120],
  ['49', 'APU', 'APU generator fault intermittent in flight', '49-11-01', 'C', 8, 712],
  ['52', 'Doors', 'Aft cargo door handle micro-switch faulty', '52-31-01', 'B', 52, 188],
  ['56', 'Windows', 'Cockpit window 2L delamination (within limits)', '56-11-01', 'C', 500, 220],
  ['73', 'Engine fuel', 'Engine 1 fuel flow indication jumps ±50 kg/h', '73-21-01', 'B', 2, 238],
  ['74', 'Ignition', 'Engine 2 ignition B channel fault', '74-11-01', 'A', 70, 2],
  ['77', 'Engine indicating', 'EGT 2 indicator flicker at idle', '77-21-02', 'C', 210, 510],
  ['78', 'Exhaust', 'Thrust reverser 1 locks indication spurious', '78-31-01', 'B', 26, 214],
  ['79', 'Oil', 'Engine 2 oil quantity transmitter erratic', '79-21-01', 'B', 90, 150],
  ['21', 'Air conditioning', 'Cabin zone temperature sensor aft failed', '21-61-01', 'D', 1200, 80],
  ['23', 'Communications', 'SATCOM data link intermittent', '23-15-01', 'D', 400, 320],
  ['24', 'Electrical', 'Emergency light pack 3 failing self-test', '24-61-01', 'C', 5, 715],
  ['25', 'Equipment', 'Overhead bin 31 latch broken', '25-23-02', 'D', 1500, 60],
  ['27', 'Flight controls', 'Flap asymmetry sensor nuisance trip', '27-51-03', 'A', 20, 4],
  ['29', 'Hydraulics', 'Green system pump 2 pressure oscillation', '29-11-03', 'B', 240, 0.5],
  ['31', 'Indicating', 'FDR event button stuck', '31-31-01', 'C', 3, 717],
  ['33', 'Lights', 'Wing scan light inoperative', '33-46-01', 'C', 160, 560],
  ['34', 'Navigation', 'ADIRU 2 fault light on ground only', '34-12-01', 'B', -60, 300],
  ['38', 'Water/waste', 'Potable water quantity gauge inop', '38-11-01', 'D', 2000, 100],
  ['45', 'Maintenance system', 'CMC intermittent print failure', '45-45-01', 'D', 1000, 140],
  ['52', 'Doors', 'Door 2L slide pressure indicator in amber', '52-21-01', 'B', 40, 200],
  ['71', 'Powerplant', 'Engine 1 cowl latch worn (within limit)', '71-13-01', 'C', 380, 340],
]

/** Generated relative to "now" so the dashboard always shows a realistic spread of risk. */
export function buildDefects(now = Date.now()): Defect[] {
  return SEEDS.map(([ata, system, description, melRef, category, hoursLeft, hoursAgo], i) => {
    const [tail, aircraftType] = FLEET[(i * 5 + (i % 3)) % FLEET.length]
    const expires = now + hoursLeft * HOUR
    const deferred = now - hoursAgo * HOUR
    return {
      id: `DEF-${1001 + i}`,
      tail,
      aircraftType,
      ataChapter: ata,
      system,
      description,
      melRef,
      category,
      deferredAt: new Date(deferred).toISOString(),
      expiresAt: new Date(expires).toISOString(),
      station: STATIONS[i % STATIONS.length],
      status: 'open' as const,
      history: [
        { at: new Date(deferred).toISOString(), by: 'Line Maintenance', text: `Defect deferred under MEL ${melRef} (Cat ${category})` },
        ...(i % 4 === 0
          ? [{ at: new Date(deferred + 6 * HOUR).toISOString(), by: 'Tech Services', text: 'Parts requested from stores' }]
          : []),
      ],
    }
  }).filter((d) => new Date(d.expiresAt).getTime() < now + 120 * DAY)
}
