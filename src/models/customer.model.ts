import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { CustomerAttributes } from '../interface/customer.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type CustomerCreationAttributes = Optional<
  CustomerAttributes,
  'id' | 'customer_type' | 'is_active' | 'is_deleted' | 'created_at' | 'updated_at'
>;

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: string;
  public name!: string;
  public company_name!: string | null;
  public phone!: string;
  public email!: string | null;
  public password_hash!: string | null;
  public address!: string | null;
  public customer_type!: 'individual' | 'corporate';
  public is_active!: boolean;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof Customer {
    Customer.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        company_name: {
          type: DataTypes.STRING(150),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        customer_type: {
          type: DataTypes.ENUM('individual', 'corporate'),
          defaultValue: 'individual',
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        is_deleted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'customers',
        modelName: 'Customer',
        underscored: true,
        hooks: {
          beforeValidate: (customer) => {
            convertEmptyStringToNull(customer);
            if (customer.company_name && customer.company_name.trim().length > 0) {
              customer.customer_type = 'corporate';
            }
          },
        },
        defaultScope: {
          attributes: { exclude: ['password_hash'] },
        },
      }
    );

    return Customer;
  }
}

export default Customer;
