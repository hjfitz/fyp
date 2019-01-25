const log = require('../../logger')
const Observation = require('./Observation')
const {client} = require('../../db')

module.exports = class DiagnosticReport {
	constructor(row) {
		// merge keys with our own
		Object.keys(row).forEach((key) => {
			this[key] = row[key]
		})
	}

	fhir() {
		log.debug('Creating fhir data', {file: 'fhir/DiagnosticReport.js', func: 'DiagnosticReport#fhir()'})
		const links = [
			'respiratory_rate',
			'oxygen_saturation',
			'supplemental_oxygen',
			'body_temperature',
			'systolic_bp',
			'heart_rate',
			'level_of_consciousness',
		].map(attr => `Observation/${this[attr]}`)
		return {
			resourceType: 'DiagnosticReport',
			id: this.report_id,
			meta: {
				lastUpdated: this.last_updated,
			},
			subject: `Patient/${this.patient_id}`,
			status: 'final',
			result: links,

		}
	}

	async fhirLinked() {
		log.debug('Attempting to grab linked data from database', {file: 'fhir/DiagnosticReport.js', func: 'DiagnosticReport#fhirLinked()'})
		const observations = await Promise.all(['respiratory_rate',
			'oxygen_saturation',
			'supplemental_oxygen',
			'body_temperature',
			'systolic_bp',
			'heart_rate',
			'level_of_consciousness',
		].map(attr => client.query({
			text: 'SELECT * FROM observation WHERE observation_id = $1',
			values: [this[attr]]})))

		log.debug('Attempting to link back to report', {file: 'fhir/DiagnosticReport.js', func: 'DiagnosticReport#fhirLinked()'})
		const values = await Promise.all(observations
			.map(val => val.rows[0])
			.map(data => new Observation(data.name, data.value, data.observation_id, data.last_updated))
			.map(obs => obs.fhir()))
		return {
			resourceType: 'DiagnosticReport',
			id: this.report_id,
			meta: {
				lastUpdated: this.last_updated,
			},
			subject: `Patient/${this.patient_id}`,
			status: 'final',
			result: values,

		}
	}
}