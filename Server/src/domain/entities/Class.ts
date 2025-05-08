export interface IClass {
  id?: string;
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  duration: number;
  isRecurring: boolean;
  roomId: string;
  nextOccurrence?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Class implements IClass {
  id?: string;
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  duration: number;
  isRecurring: boolean;
  roomId: string;
  nextOccurrence?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IClass) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.dayOfWeek = data.dayOfWeek;
    this.startTime = data.startTime;
    this.duration = data.duration;
    this.isRecurring = data.isRecurring;
    this.roomId = data.roomId;
    this.nextOccurrence = data.nextOccurrence;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  calculateNextOccurrence(): Date {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDayIndex = daysOfWeek.indexOf(this.dayOfWeek);

    if (targetDayIndex === -1) {
      throw new Error(`Invalid day of week: ${this.dayOfWeek}`);
    }

    const [hours, minutes] = this.startTime.split(":").map(Number);

    const now = new Date();
    const currentDayIndex = now.getDay();

    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd <= 0) {
      if (daysToAdd === 0) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        if (
          currentHours > hours ||
          (currentHours === hours && currentMinutes >= minutes)
        ) {
          daysToAdd = 7;
        }
      } else {
        daysToAdd += 7;
      }
    }

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysToAdd);
    nextDate.setHours(hours, minutes, 0, 0);

    return nextDate;
  }
}
