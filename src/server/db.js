const pg = require('pg')
const bcrypt = require('bcrypt')
const knex = require('knex')({
	client: 'pg',
	connection: process.env.DATABASE_URL,
})
const logger = require('./logger')

let isConnected = false

const client = new pg.Client(process.env.DATABASE_URL)

logger.info(`attempting to connect to postgres on ${process.env.DATABASE_URL}`, {file: 'server/db.js', func: 'main'})

async function checkAdmin() {
	// all permissions used throughout the database
	const permissions = [
		'view:allpatients',
		'edit:permissions',
		'delete:patients',
		'add:patients',
		'add:wards',
		'add:vitals',
		'add:user',
		'edit:link',
	]
	logger.debug('Checking for admin account...', {file: 'server/db.js', func: 'checkAdmin()'})
	const rows = await knex('practitioner').where({username: 'admin'})
	if (!rows.length) {
		logger.debug('no admin account found. creating...', {file: 'server/db.js', func: 'checkAdmin()'})
		try {
			await knex('practitioner').insert({
				name: 'admin',
				added: new Date(),
				username: 'admin',
				account_type: 'normal',
				permissions: JSON.stringify(permissions),
				passhash: await bcrypt.hash('PortSoC123', 5),
			})
			logger.debug('admin account re-created', {file: 'server/db.js', func: 'checkAdmin()'})
		} catch (err) {
			logger.error('Error creating admin account', {file: 'server/db.js', func: 'checkAdmin()'})
			logger.error(err, {file: 'server/db.js', func: 'checkAdmin()'})
		}
	} else {
		logger.debug('admin accuont exists. have a nice day.', {file: 'server/db.js', func: 'checkAdmin()'})
	}
}

checkAdmin()

async function connect() {
	if (isConnected) return
	await client.connect()
	logger.debug('successfully connected to database', {file: 'server/db.js', func: 'connect()'})
	isConnected = true
}

module.exports = {client, connect, knex}
