const mimeTypes = require('mime-types')
const sha1 = require('crypto-js/sha1')
const fs = require('fs')

const logger = require('../../logger')
const {knex} = require('../../db')
const Contact = require('./Contact')

class Patient {
	/**
	 * Fhir wrapper for patient information
	 * @param {object} params patient params
	 * @param {boolean} params.active whether the patient is still active in the hospital
	 * @param {string} params.id DB id for the patient
	 * @param {string} params.fullname fullname of patient
	 * @param {string} params.given patient family name
	 * @param {string} params.prefix patient prefix (Mr, Miss)
	 * @param {string} params.gender patient gender: male, female or other
	 * @param {Date} params.last_updated when the patient was last updated
	 * @param {string} params.photo_url where the patient url is stored
	 * @param {string} params.family patient family name (surname)
	 */
	constructor(params) {
		const {active, id, fullname, given, prefix, gender, last_updated, photo_url, family} = params
		this.active = active
		this.loaded = false
		this.id = id
		this.fullname = fullname
		this.given = given
		this.prefix = prefix
		this.gender = gender
		this.last_updated = last_updated
		this.photo_url = photo_url
		this.family = family
		this.meta = {file: 'fhir/classes/Patient.js'}
		this.required = ['active', 'fullname', 'given', 'prefix', 'gender', 'contact_id']
		this.values = [...this.required, 'photo_url', 'family', 'last_updated']
	}

	/**
	 * Based on this.id, populate the patient with database info
	 * @return {boolean} populated or not
	 */
	async populate() {
		const {meta, id} = this
		if (!id) {
			logger.warn('Attempted to populate with invalid ID', meta)
			return false
		}
		try {
			const [patient] = await knex('patient').select().where({patient_id: id})
			this.loaded = true
			Object.keys(patient).forEach(key => this[key] = patient[key])
			this.contact = new Contact({contact_id: patient.contact_id})
			await this.contact.populate()
			return true
		} catch (err) {
			logger.error('Unable to populate patient', {...this.meta, func: 'populate()'})
			logger.error(err, {...this.meta, func: 'populate()'})
			return false
		}
	}

	/**
	 * Attempt to insert a patient with params provided
	 * @returns {boolean} inserted or not
	 */
	async insert() {
		const isValid = !this.required.filter(key => !(this[key])).length
		if (!isValid) {
			logger.warn('unable to create', this.meta)
			return false
		}
		// create object
		this.last_updated = new Date()
		this.active = true
		const obj = this.values.reduce((acc, cur) => {
			acc[cur] = this[cur]
			return acc
		}, {})
		// make query
		const [resp] = await knex('patient').insert(obj).returning(['patient_id', ...this.values])
		return resp
	}

	/**
	 * Attempts to delete a patient based on this.id
	 * @returns {boolean} Deleted or nah
	 */
	async delete() {
		try {
			await knex('patient').delete('patient', this.id)
			return true
		} catch (err) {
			logger.error('Unable to delete patient', {...this.meta, func: 'delete()'})
			logger.error(err, {...this.meta, func: 'delete()'})
			return false
		}
	}

	/**
	 * Attempts to perform UPDATE on the database with this.id and params provided
	 * @returns {boolean} Updated or not
	 */
	async update() {
		const toUpdate = this.values
			.filter(val => this[val])
			.reduce((acc, cur) => {
				acc[cur] = this[cur]
				return acc
			}, {})
		if (Object.keys(toUpdate).length) {
			logger.warn(`Trying to update ${this.id}, but no params`, this.meta)
			return false
		}
		try {
			await knex('patient').update(toUpdate)
			logger.debug(`Successfully updated ${Object.keys(toUpdate).join(', ')}`, this.meta)
			await this.populate()
		} catch (err) {
			logger.error('Unable to update patient', {...this.meta, func: 'update()'})
			logger.error(err, {...this.meta, func: 'update()'})
			return false
		}
		return true
	}

	/**
	 * Formats patient to standard fhir patient
	 * @returns {object} patient info formatted in fhir
	 */
	async fhir() {
		await this.populate()
		const {contact} = this
		if (!contact) return false
		const photo = this.photo_url
			? [{
				contentType: mimeTypes.lookup(this.photo_url),
				url: this.photo_url,
				hash: sha1(fs.readFileSync(this.photo_url)).toString(),
			}]
			: []
		return {
			identifier: [{
				use: 'usual',
				system: 'urn:ietf:rfc:3986',
				value: 'database id',
				assigner: 'SoN',
			}],
			resourceType: 'Patient',
			active: this.active,
			name: [{
				use: 'usual',
				text: this.fullname,
				family: this.family,
				given: this.given,
				prefix: this.prefix.split(' '),
			}],
			gender: this.gender,
			photo,
			contact: [{
				name: {
					use: 'usual',
					text: contact.fullname,
					family: contact.family,
					given: contact.given,
					prefix: contact.prefix.split(' '),
					telecom: [{
						system: 'phone',
						value: contact.phone,
						use: 'home',
					}],
				},
			}],
		}
	}
}

module.exports = Patient