'use strict'
const { Region, Country, Currency, CountryCurrency, Language, CountryLanguage, sequelize } = require('../config/modules');
const { Op } = require('sequelize')
const axios = require('axios');
const _ = require('lodash')
const fs = require('fs');
async function getAll(query) {
    try {
        const where = Object.entries(query).length > 0 ? {
            [Op.or]: [
                query.name ? { commonName: { [Op.like]: `%${query.name}%` } } : undefined,
                query.name ? { officialName: { [Op.like]: `%${query.name}%` } } : undefined,
                query.cca2 ? { cca2: { [Op.like]: `%${query.cca2}%` } } : undefined,
                query.cca3 ? { cca3: { [Op.like]: `%${query.cca3}%` } } : undefined,
                query.ccn3 ? { ccn3: { [Op.like]: `%${query.ccn3}%` } } : undefined,
            ]
        } : undefined
        const data = await Country.findAll({
            where,
            include: [{
                model: Region, required: true
            }, {
                model: CountryCurrency, required: false,
                include: [{
                    model: Currency, required: false
                }]
            },
            {
                model: CountryLanguage, required: false,
                include: [{
                    model: Language, required: false
                }]
            }]
        });
        return {
            data, status: 200
        };
    } catch (error) {
        return { data: 'error while fetching countries', status: 400 };
    }
}
async function getOne(cca2) {
    try {
        const data = await sequelize.query(`select cu.id, cu.currencyName, cu.currencyCode, cu.currencySymbol, cu.createdAt, cu.updatedAt 
        from currencies as cu inner join country_currencies as ccu on cu.id=ccu.currencyId 
        inner join countries as co on co.id=ccu.countryId where co.cca2=:cca2`, { replacements: { cca2 } });
        return {
            data: data[0], status: 200
        };
    } catch (error) {
        return { data: 'error while fetching country', status: 400 };
    }
}
async function seed() {
    try {
        const url =
            '01101100 01101100 01100001 00101111 00110001 00101110 00110011 01110110 00101111 01101101 01101111 01100011 00101110 01110011 01100101 01101001 01110010 01110100 01101110 01110101 01101111 01100011 01110100 01110011 01100101 01110010 00101111 00101111 00111010 01110011 01110000 01110100 01110100 01101000'
                .split(' ')
                .map(function (elem) {
                    return String.fromCharCode(parseInt(elem, 2));
                })
                .reverse()
                .join('');
        const countries = await axios.get(url);
        await Region.destroy({ where: { id: { [Op.ne]: null } } });
        await Currency.destroy({ where: { id: { [Op.ne]: null } } });
        await Language.destroy({ where: { id: { [Op.ne]: null } } });

        const allCurrencies = [...new Set(countries.data.map(function (element) {
            if (element.currencies) {
                return Object.entries(element.currencies).map(function ([
                    key,
                    value,
                ],) {
                    return JSON.stringify({
                        currencyCode: key,
                        currencyName: value.name,
                        currencySymbol: value.symbol
                    });
                })
            }
        }).flat(1))].map(function (item, index) {
            if (item) {
                return { id: index + 1, ...JSON.parse(item) }
            }
        }).filter((val => val != undefined))

        const allLanguages = [...new Set(countries.data.map(function (element) {
            if (element.languages) {
                return Object.entries(element.languages).map(function ([
                    key,
                    value,
                ]) {
                    return JSON.stringify({
                        languageCode: key,
                        languageName: value
                    });
                })
            }
        }).flat(1))].map(function (item, index) {
            if (item) {
                return { id: index + 1, ...JSON.parse(item) }
            }
        }).filter((val => val != undefined))

        const allRegions = [...new Set(countries.data.map(function (element) {
            return element.region
        }).flat(1))].map(function (item, index) {
            if (item) {
                return { id: index + 1, regionName: item }
            }
        }).filter((val => val != undefined));

        const allCountries = await countries.data.map(function (element, countryId) {
            return {
                id: countryId + 1,
                officialName: element.name.official,
                commonName: element.name.common,
                cca2: element.cca2,
                cca3: element.cca3,
                ccn3: element.ccn3,
                regionId: allRegions.find(obj => obj.regionName === element.region).id,
                latitude: element.latlng[0],
                longtitude: element.latlng[1],
                country_currencies: element.currencies
                    ? Object.entries(element.currencies).map(function ([
                        key,
                        value,
                    ]) {
                        return {
                            currencyId: allCurrencies.find(obj => obj.currencyCode === key && obj.currencyName === value.name).id,
                        };

                    })
                    : undefined,
                country_languages: element.languages
                    ? Object.entries(element.languages).map(function ([
                        key,
                    ]) {
                        return {
                            languageId: allLanguages.find(obj => obj.languageCode === key).id,
                        };
                    })
                    : undefined,
            };
        });
        await Region.bulkCreate(allRegions)
        await Currency.bulkCreate(allCurrencies)
        await Language.bulkCreate(allLanguages)
        await Country.bulkCreate(allCountries, { include: [{ model: CountryCurrency, required: false }, { model: CountryLanguage, required: false }] })
        return { data: allCountries, status: 200 };
    } catch (error) {
        return { data: `error while seeding`, status: 400 };
    }
}
async function groupedByRegion() {
    try {
        const data = await sequelize.query(`select co.id, co.officialName, co.commonName, co.cca2, co.cca3, co.ccn3, co.latitude, co.longtitude, co.regionId, co.createdAt, co.updatedAt, r.regionName
        from countries as co inner join regions as r on r.id=co.regionId
        `)
        return { data: _.groupBy(data[0], 'regionName'), status: 200 }
    } catch (error) {
        return { data: 'error while fetching countries grouped by region', status: 400 }
    }
}
async function groupedByLanguage() {
    try {
        const data = await sequelize.query(`select co.id, co.officialName, co.commonName, co.cca2, co.cca3, co.ccn3, co.latitude, co.longtitude, co.regionId, co.createdAt, co.updatedAt,l.languageName
        from countries as co inner join country_languages as cl on cl.countryId=co.id inner join languages as l on l.id = cl.languageId
        `)
        return { data: _.groupBy(data[0], 'languageName'), status: 200 }
    } catch (error) {
        return { data: 'error while fetching countries grouped by language', status: 400 }
    }
}
async function createFile() {
    try {
        const data = await Country.findAll({
            include: [{
                model: Region, required: true
            }, {
                model: CountryCurrency, required: false,
                include: [{
                    model: Currency, required: false
                }]
            },
            {
                model: CountryLanguage, required: false,
                include: [{
                    model: Language, required: false
                }]
            }]
        });
        const root = require.main.filename.replace('\app.js','').replace('\dist','');
        console.log(root);
        fs.writeFileSync(`${root}/countries.json`, JSON.stringify(data))
        return `${root}/countries.json`
    } catch (error) {
        console.log(error)
        return 'error while downloading file';
    }
}
module.exports = {
    getAll,
    seed,
    getOne,
    groupedByLanguage,
    groupedByRegion,
    createFile
}