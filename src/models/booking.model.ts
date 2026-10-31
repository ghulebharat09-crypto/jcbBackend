import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { BookingAttributes, RentalType, BookingStatus } from '../interface/booking.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type BookingCreationAttributes = Optional<
  BookingAttributes,
  'id' | 'operator_id' | 'estimated_hours' | 'advance_payment' | 'cancelled_reason' | 'is_deleted' | 'created_at' | 'updated_at'
>;

export class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: string;
  public booking_number!: string;
  public customer_id!: string;
  public machine_id!: string;
  public operator_id!: string | null;
  public site_location!: string;
  public work_description!: string | null;
  public start_date!: Date | string;
  public end_date!: Date | string;
  public rental_type!: RentalType;
  public estimated_hours!: number;
  public base_rate!: number;
  public estimated_cost!: number;
  public advance_payment!: number;
  public remaining_balance!: number;
  public status!: BookingStatus;
  public cancelled_reason!: string | null;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof Booking {
    Booking.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        booking_number: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        customer_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        machine_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        operator_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        site_location: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        work_description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        rental_type: {
          type: DataTypes.ENUM('hourly', 'daily', 'weekly'),
          defaultValue: 'hourly',
          allowNull: false,
        },
        estimated_hours: {
          type: DataTypes.DECIMAL(8, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('estimated_hours');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        base_rate: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('base_rate');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        estimated_cost: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('estimated_cost');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        advance_payment: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('advance_payment');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        remaining_balance: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('remaining_balance');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        status: {
          type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
          defaultValue: 'scheduled',
          allowNull: false,
        },
        cancelled_reason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        is_deleted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'bookings',
        modelName: 'Booking',
        underscored: true,
        hooks: {
          beforeValidate: (booking) => {
            convertEmptyStringToNull(booking);
          },
        },
      }
    );

    return Booking;
  }
}

export default Booking;
