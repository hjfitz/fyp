import {h, render, Component} from 'preact'
import {Router, route} from 'preact-router'

import {Welcome, CreateWard} from './spa/Pages'

import './spa/styles/router.scss'
import 'materialize-css/sass/materialize.scss'

class App extends Component {
	componentDidMount() {
		// checkAuth({url: window.location.pathname})
	}

	render() {
		return (
			// <Router onChange={checkAuth}>
			<div className="container">
				<Router>
					<Welcome path="/" />
					<CreateWard path="/create/ward" />
					{/* <Patient path="/patient/:patient_id" /> */}
					{/* <Ward path="/ward/:ward_id" /> */}
					{/* <Create path="/submit" /> */}
				</Router>
			</div>
		)
	}
}

render(<App />, document.querySelector('[preact-root]'))
require('preact/debug')
