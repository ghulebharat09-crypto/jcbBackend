import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { InvoiceAttributes, InvoiceStatus } from '../interface/invoice.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type InvoiceCreationAttributes = Optional<
  InvoiceAttributes,
  'id' | 'payment_id' | 'advance_credit' | 'status' | 'pdf_url' | 'issued_at' | 'created_at' | 'updated_at'
>;

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  public id!: string;
  public invoice_number!: string;
  public booking_id!: string;
  public customer_id!: string;
  public payment_id!: string | null;
  public subtotal!: number;
  public advance_credit!: number;
  public total_paid!: number;
  public status!: InvoiceStatus;
  public pdf_url!: string | null;
  public issued_at!: Date | string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof Invoice {
    Invoice.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        invoice_number: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        booking_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        customer_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        payment_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        subtotal: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('subtotal');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        advance_credit: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('advance_credit');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        total_paid: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('total_paid');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        status: {
          type: DataTypes.ENUM('draft', 'generated', 'sent', 'paid'),
          defaultValue: 'generated',
          allowNull: false,
        },
        pdf_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        issued_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'invoices',
        modelName: 'Invoice',
        underscored: true,
        hooks: {
          beforeValidate: (invoice) => {
            convertEmptyStringToNull(invoice);
          },
        },
      }
    );

    return Invoice;
  }
}

export default Invoice;
