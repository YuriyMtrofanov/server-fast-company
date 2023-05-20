const professionsMock = require("../mock/professions.json");
const Profession = require("../models/Profession");

const qualitiesMock = require("../mock/qualities.json");
const Quality = require("../models/Quality");

module.exports = async () => {
    const professions = await Profession.find();
    if (professions.length !== professionsMock.length) {
        createInitialEntity(Profession, professionsMock)
    }
    const qualities = await Quality.find();
    if (qualities.length !== qualitiesMock.length) {
        createInitialEntity(Quality, professionsMock)
    }
};

async function createInitialEntity(Model, mockData){
    await Model.collection.drop();
    return Promise.all(
        mockData.map(async item => {
            try {
                delete item._id;
                const newItem = new Model(item)
                await newItem.save()
            } catch (error) {
                return 
            }
        })
    )
};