const encounterRouter = require('express').Router()
const {knex} = require('../db')
const {decodeJWTPayload} = require('../auth/token')
const Encounter = require('./classes/Encounter')
const OperationOutcome = require('./classes/OperationOutcome')

encounterRouter.post('/', async (req, res) => {
	const decodedToken = decodeJWTPayload(req.headers.token)
	const enc = new Encounter(req.body)
	if (!decodedToken.permissions.includes('add:patients')) {
		const outcome = new OperationOutcome('error', 403, req.originalUrl, 'you have no access!')
		outcome.makeResponse(res)
		return
	}
	const inserted = await enc.insert()
	const outcome = inserted
		? new OperationOutcome('success', 200, req.originalUrl, 'Successfully added encounter')
		: new OperationOutcome('error', 406, req.originalUrl, 'Unable to add encounter')
	outcome.makeResponse(res)
})

encounterRouter.get('/all', async (req, res) => {
	const rows = await knex('encounter').select()
	res.json(rows)
})

encounterRouter.get('/', async (req, res) => {
	const decodedToken = decodeJWTPayload(req.headers.token)
	const include = req.query._include
	delete req.query._include
	const [, ...tail] = include.split(':')
	const toInclude = tail.join(':').split(';').reduce((acc, cur) => {
		acc[cur] = true
		return acc
	}, {})
	console.log(decodedToken.permissions)
	const rows = await knex('encounter').select().where(req.query)
	// if no permission to view all, select all from union table and filter our
	if (!decodedToken.permissions.includes('view:allpatients')) {
		const unionTable = await knex('practitionerpatients').select().where({practitioner_id: decodedToken.userid})
		const patientIDs = unionTable.map(group => group.patient_id)
		const mapped = await Promise.all(rows
			.filter(row => patientIDs.includes(row.patient_id))
			.map(row => new Encounter(row).fhir(toInclude)))
		res.json(mapped)
		return
	}
	console.log('getting all')
	const mapped = await Promise.all(rows.map(row => new Encounter(row).fhir(toInclude)))
	console.log(req.query)
	res.json(mapped)
})

encounterRouter.get('/:encounter_id', async (req, res) => {
	const {encounter_id} = req.params
	const enc = new Encounter({encounter_id})
	const populated = await enc.populate()
	if (!populated) {
		const outcome = new OperationOutcome('error', 404, req.originalUrl, 'Unable to find encounter')
		return outcome.makeResponse(res)
	}
	return res.json(enc.fhir())
})

encounterRouter.put('/:encounter_id', async (req, res) => {
	const {encounter_id} = req.params
	const enc = new Encounter({...req.body, encounter_id})
	const updated = await enc.update()
	const outcome = updated
		? new OperationOutcome('success', 200, req.originalUrl, 'Successfully updated encounter')
		: new OperationOutcome('error', 406, req.originalUrl, 'Unable to update encounter')
	outcome.makeResponse(res)
})

encounterRouter.delete('/:encounter_id', async (req, res) => {
	const {encounter_id} = req.params
	const enc = new Encounter({encounter_id})
	const deleted = await enc.delete()
	const outcome = deleted
		? new OperationOutcome('success', 200, req.originalUrl, 'Successfully deleted encounter')
		: new OperationOutcome('error', 406, req.originalUrl, 'Unable to remove encounter')
	outcome.makeResponse(res)
})


module.exports = encounterRouter
