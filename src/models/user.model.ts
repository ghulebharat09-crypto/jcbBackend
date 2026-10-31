import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { UserAttributes } from '../interface/user.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'is_active' | 'is_deleted' | 'created_at' | 'updated_at'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public phone!: string;
  public email!: string;
  public password_hash!: string;
  public role!: 'admin' | 'manager';
  public company!: string | null;
  public address!: string | null;
  public is_active!: boolean;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof User {
    User.init(
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
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('admin', 'manager'),
          defaultValue: 'admin',
          allowNull: false,
        },
        company: {
          type: DataTypes.STRING(150),
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
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
        tableName: 'users',
        modelName: 'User',
        underscored: true,
        hooks: {
          beforeValidate: (user) => {
            convertEmptyStringToNull(user);
          },
        },
        defaultScope: {
          attributes: { exclude: ['password_hash'] },
        },
        scopes: {
          withPassword: {
            attributes: { include: ['password_hash'] },
          },
        },
      }
    );

    return User;
  }
}

export default User;
