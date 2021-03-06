import {h, Component} from 'preact'
import M from 'materialize-css'

import {IncButton, DecButton} from './util'

class HealthHistory extends Component {
	constructor() {
		super()
		this.state = {
			numProbs: 1,
			numOps: 1,
			numOth: 1,
		}
		this.inc = this.inc.bind(this)
		this.dec = this.dec.bind(this)
	}

	// selects fall over on inc/dec, re-init
	componentDidUpdate() {
		const select = this.mainContainer.querySelectorAll('select')
		M.FormSelect.init(select)
	}

	/**
	 * create a function to increase an item in state
	 * @param {string} type key in state to update
	 * @returns {Function}
	 */
	inc(type) {
		return () => this.setState({[type]: this.state[type] + 1})
	}

	/**
	 * create a function to decrease an item in state
	 * @param {string} type key in state to update
	 * @returns {Function}
	 */
	dec(type) {
		return () => this.setState({[type]: this.state[type] - 1})
	}

	/**
	 * @returns {preact.VNode}
	 */
	render() {
		return (
			<div className="row" ref={m => this.mainContainer = m}>
				<h4>Health History</h4>
				<div className="input-field col s12 m6">
					<select multiple className="patient-details-select patient-history-input" data-form-key="health-childhood-illnesses" data-materialize-type="select">
						<option value="" disabled selected>Select all that apply</option>
						<option value="Measles">Measles</option>
						<option value="Mumps">Mumps</option>
						<option value="Rubella">Rubella</option>
						<option value="Chickenpox">Chickenpox</option>
						<option value="Rheumatic Fever">Rheumatic Fever</option>
					</select>
					<label>Childhood Illnesses</label>
				</div>
				<div className="input-field col s12 m6">
					<select multiple className="patient-details-select patient-history-input" data-form-key="health-immunisations" data-materialize-type="select">
						<option value="" disabled selected>Select all that apply</option>
						<option value="Tetanus">Tetanus</option>
						<option value="Hepatitis">Hepatitis</option>
						<option value="Influenza">Influenza</option>
						<option value="MMR">MMR</option>
						<option value="Meningitis">Meningitis</option>
						<option value="Pneumonia">Pneumonia</option>
					</select>
					<label>Immunisations</label>
				</div>
				<div className="col s12">
					<h6>Medical Issues</h6>
					<div className="patient-history-input" data-form-key="health-medical-issues" data-materialize-type="input-group">
						{Array.from({length: this.state.numProbs}).map((_, idx) => (
							<div className="row">
								<div className="col s12 input-field">
									<input id={`med-issue-name-${idx}`} type="text" className={`validate med-issue-name-${idx}`} />
									<label htmlFor={`med-issue-name-${idx}`}>Medical Problem</label>
								</div>
							</div>
						))}
					</div>
					<div className="row">
						<IncButton onClick={this.inc('numProbs')} />
						<DecButton onClick={this.dec('numProbs')} />
					</div>
				</div>
				<div className="col s12">
					<h6>Surgical Operations</h6>
					<div className="patient-history-input" data-form-key="health-operations" data-materialize-type="input-group">
						{Array.from({length: this.state.numOps}).map((_, idx) => (
							<div className="row">
								<div className="col s12 input-field">
									<input id={`op-name-${idx}`} type="text" className={`validate med-name-${idx}`} />
									<label htmlFor={`op-name-${idx}`}>Operation</label>
								</div>
							</div>
						))}
					</div>
					<div className="row">
						<IncButton onClick={this.inc('numOps')} />
						<DecButton onClick={this.dec('numOps')} />
					</div>
				</div>
				<div className="input-field col s12">
					<h6>Other Hospitalisations</h6>
					<div className="patient-history-input" data-form-key="health-hospitalisations" data-materialize-type="input-group">
						{Array.from({length: this.state.numOth}).map((_, idx) => (
							<div className="row">
								<div className="col s12 input-field">
									<input id={`hosp-name-${idx}`} type="text" className={`validate med-name-${idx}`} />
									<label htmlFor={`hosp-name-${idx}`}>Hospitalisation Reason</label>
								</div>
							</div>
						))}
					</div>
					<div className="row">
						<IncButton onClick={this.inc('numOth')} />
						<DecButton onClick={this.dec('numOth')} />
					</div>
				</div>
			</div>
		)
	}
}

export default HealthHistory
