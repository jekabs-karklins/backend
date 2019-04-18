"use strict";

const superagent = require("superagent");

const scichatHost = "localhost";
const scichatPort = "3030";
const scichatBaseUrl = `http://${scichatHost}:${scichatPort}/api`;

module.exports = function(Logbook) {
    /**
     * Find Logbook model instance
     * @param {string} name Name of the Logbook
     * @returns {object} Logbook model instance
     */

    Logbook.findByName = function(name) {
        return superagent
            .get(scichatBaseUrl + `/Logbooks/${name}`)
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };

    /**
     * Find all Logbook model instances
     * @returns {array} Array of Logbook model instances
     */

    Logbook.findAll = function() {
        return superagent
            .get(scichatBaseUrl + "/Logbooks")
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };

    /**
     * Find all Logbook entries matching the query
     * @param {string} name The name of the Logbook
     * @param {string} query Query of content in Logbook entry
     * @returns {object} Logbook model instance matching query
     */

    Logbook.findEntries = function(name, query) {
        return superagent
            .get(scichatBaseUrl + `/Logbooks/${name}/${query}`)
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };

    /**
     * Filter Logbook entries matching query
     * @param {string} name The name of the logbook
     * @param {string} query Query used to filter Logbook entries
     * @returns {object} Filtered Logbook model instance
     */

    Logbook.filterEntries = function(name, query) {
        return superagent
            .get(scichatBaseUrl + `/Logbooks/${name}/filter/${query}`)
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };
};
