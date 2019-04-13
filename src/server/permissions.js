const permissionsRouter = require('express').Router()
const {knex} = require('./db')
// query for practitioner

permissionsRouter.post('/create', async (req, res) => {
	const resp = await knex('practitionerpatients').insert({
		practitioner_id: req.body.practitionerID,
		patient_id: req.body.patientID,
	})
	res.json(resp)
	console.log({patientID, practitionerID})
})

permissionsRouter.post('/destroy', async (req, res) => {
	const {patientID, practitionerID} = req.body
	const unionDeleted = await knex('practitionerpatients').delete().where({
		practitioner_id: req.body.practitionerID,
		patient_id: req.body.patientID,
	})
	res.send(200)
})

permissionsRouter.get('/:id', async (req, res) => {
	const unionTable = await knex('practitionerpatients').select().where({
		practitioner_id: req.params.id,
	})
	console.log(unionTable)
	res.json(unionTable)
})

module.exports = permissionsRouter
