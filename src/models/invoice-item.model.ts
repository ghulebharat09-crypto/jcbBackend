import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { InvoiceItemAttributes } from '../interface/invoice.interface';

export type InvoiceItemCreationAttributes = Optional<InvoiceItemAttributes, 'id' | 'created_at'>;

export class InvoiceItem
  extends Model<InvoiceItemAttributes, InvoiceItemCreationAttributes>
  implements InvoiceItemAttributes
{
  public id!: string;
  public invoice_id!: string;
  public description!: string;
  public quantity!: number;
  public unit!: string;
  public unit_price!: number;
  public amount!: number;
  public readonly created_at!: Date;

  public static initialize(sequelize: Sequelize): typeof InvoiceItem {
    InvoiceItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        invoice_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        quantity: {
          type: DataTypes.DECIMAL(8, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('quantity');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        unit: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        unit_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('unit_price');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('amount');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
      },
      {
        sequelize,
        tableName: 'invoice_items',
        modelName: 'InvoiceItem',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );

    return InvoiceItem;
  }
}

export default InvoiceItem;
