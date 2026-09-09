import { Schema, model, Document } from 'mongoose';

export interface IWeatherRecordDocument extends Document {
  district: string;
  date: Date;
  tempC: number;
  rainfallMm: number;
  condition: string;
  alert?: string;
}

const WeatherRecordSchema = new Schema<IWeatherRecordDocument>({
  district: { type: String, required: true },
  date: { type: Date, required: true },
  tempC: { type: Number, required: true },
  rainfallMm: { type: Number, required: true },
  condition: { type: String, required: true },
  alert: { type: String }
});

export const WeatherRecord = model<IWeatherRecordDocument>('WeatherRecord', WeatherRecordSchema);
