// Сервис для загрузки данных заведений из JSON файлов

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  pointsCost: number;
  pointsReward: number;
  isAvailable: boolean;
  isPopular: boolean;
  image?: string;
}

export interface DoublePointsHour {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start: string;
  end: string;
}

export interface VenueData {
  id: number;
  venueCode: string;
  name: string;
  description: string;
  address: string;
  logo: string;
  category: string;
  rating: number;
  workingHours: string;
  isOpen: boolean;
  pointsPerPurchase: number;
  pointsType: 'general' | 'personal';
  doublePointsHours: DoublePointsHour[];
  menu: MenuItem[];
}

// Кэш для загруженных данных
const venueCache: Map<number, VenueData> = new Map();

/**
 * Загружает данные заведения по ID из JSON файла
 */
export async function loadVenueData(venueId: number): Promise<VenueData | null> {
  // Проверяем кэш
  if (venueCache.has(venueId)) {
    return venueCache.get(venueId)!;
  }

  try {
    const response = await fetch(`/data/venues/${venueId}.json`);
    if (!response.ok) {
      console.error(`Failed to load venue ${venueId}: ${response.statusText}`);
      return null;
    }

    const data: VenueData = await response.json();
    venueCache.set(venueId, data);
    return data;
  } catch (error) {
    console.error(`Error loading venue ${venueId}:`, error);
    return null;
  }
}

/**
 * Загружает данные нескольких заведений
 */
export async function loadVenuesData(venueIds: number[]): Promise<VenueData[]> {
  const promises = venueIds.map(id => loadVenueData(id));
  const results = await Promise.all(promises);
  return results.filter((venue): venue is VenueData => venue !== null);
}

/**
 * Загружает все доступные заведения (если есть индексный файл)
 */
export async function loadAllVenues(): Promise<VenueData[]> {
  // Пока загружаем известные ID
  // В будущем можно создать index.json с списком всех заведений
  const knownIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return loadVenuesData(knownIds);
}

/**
 * Проверяет, находится ли текущее время в периоде удвоенных баллов
 */
export function isDoublePointsTime(venue: VenueData): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString('ru-RU', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const doubleHours = venue.doublePointsHours.find(
    hours => hours.day === currentDay
  );

  if (!doubleHours) {
    return false;
  }

  const startTime = doubleHours.start;
  const endTime = doubleHours.end;

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Получает следующий период удвоенных баллов
 */
export function getNextDoublePointsTime(venue: VenueData): { day: string; time: string } | null {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = now.getDay();

  // Проверяем оставшиеся дни недели
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7;
    const day = days[dayIndex];
    
    const doubleHours = venue.doublePointsHours.find(h => h.day === day);
    if (doubleHours) {
      if (i === 0) {
        const currentTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        if (currentTime < doubleHours.end) {
          return {
            day: getDayName(day),
            time: `${doubleHours.start} - ${doubleHours.end}`
          };
        }
      } else {
        return {
          day: getDayName(day),
          time: `${doubleHours.start} - ${doubleHours.end}`
        };
      }
    }
  }

  return null;
}

function getDayName(day: string): string {
  const dayNames: { [key: string]: string } = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  };
  return dayNames[day] || day;
}

