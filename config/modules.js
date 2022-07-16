const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config()
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  logging: false
});

const Region = sequelize.define('regions', {
  regionName: { type: DataTypes.STRING, unique: true }
});

const Country = sequelize.define('countries', {
  officialName: { type: DataTypes.STRING },
  commonName: { type: DataTypes.STRING },
  cca2: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      len: 2,
    },
  },
  cca3: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      len: 3,
    },
  },
  ccn3: {
    allowNull: true,
    type: DataTypes.STRING,
    validate: {
      len: 3,
    },
  },
  latitude: { type: DataTypes.FLOAT },
  longtitude: { type: DataTypes.FLOAT },
  regionId: {
    type: DataTypes.INTEGER, references: {
      model: Region,
      key: 'id'
    }
  },
});

const Currency = sequelize.define('currencies', {
  currencyName: {
    unique: 'currency_index',
    type: DataTypes.STRING,
  },
  currencyCode: {
    unique: 'currency_index',
    type: DataTypes.STRING,
    validate: {
      len: 3,
    },
  },
  currencySymbol: {
    unique: 'currency_index',
    allowNull: true,
    type: DataTypes.TEXT,

  },
});

const Language = sequelize.define('languages', {
  languageName: {
    unique: 'language_unique',
    type: DataTypes.STRING,
  },
  languageCode: {
    unique: 'language_unique',
    type: DataTypes.STRING,
    validate: {
      len: 3,
    },
  },
});

const CountryCurrency = sequelize.define('country_currencies', {
  countryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Country,
      key: 'id'
    }
  },
  currencyId: {
    type: DataTypes.INTEGER,
    references: {
      model: Currency,
      key: 'id'
    }
  }
})

const CountryLanguage = sequelize.define('country_languages', {
  countryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Country,
      key: 'id'
    }
  },
  languageId: {
    type: DataTypes.INTEGER,
    references: {
      model: Language,
      key: 'id'
    }
  }
})

sequelize.sync();


Country.belongsTo(Region, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Region.hasMany(Country, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
CountryLanguage.belongsTo(Country, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
CountryLanguage.belongsTo(Language, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
CountryCurrency.belongsTo(Country, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
CountryCurrency.belongsTo(Currency, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Language.hasMany(CountryLanguage, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Currency.hasMany(CountryCurrency, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Country.hasMany(CountryLanguage, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Country.hasMany(CountryCurrency, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })

module.exports = {
  Region,
  Country,
  Currency,
  Language,
  CountryLanguage,
  CountryCurrency,
  sequelize
}